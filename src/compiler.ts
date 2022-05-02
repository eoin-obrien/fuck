import binaryen from 'binaryen'; // eslint-disable-line import/no-named-as-default-member,import/no-named-as-default
import type {CstNode} from 'chevrotain';
import type {AddCstChildren, BrainfuckCstChildren, CommandCstChildren, LeftCstChildren, LoopCstChildren, RightCstChildren, SubCstChildren} from '../types/@generated/cst';
import {parser} from './grammar.js';
import {getMultiplicationLoopFactors, isMultiplicationLoop} from './loop.js';

type BinaryenModule = typeof binaryen['Module']['prototype'];

export enum EofBehavior {
	/** Leave memory cell at pointer unchanged. */
	NoChange,
	/** Sets byte at pointer to `0x00`. */
	SetZero,
	/** Sets byte at pointer to `0xff`. */
	SetAllBits,
}

export interface BrainfuckCompilerOptions {
	memorySize: number;
	eofBehavior: EofBehavior;
}

export class BrainfuckCompiler extends parser.getBaseCstVisitorConstructor<never, number>() {
	public readonly memorySize: number;
	public readonly eofBehaviour: EofBehavior;

	constructor(private readonly wasm: BinaryenModule, options?: Partial<BrainfuckCompilerOptions>) {
		super();
		// The "validateVisitor" method is a helper utility which performs static analysis
		// to detect missing or redundant visitor methods
		this.validateVisitor();

		this.memorySize = options?.memorySize ?? 30_000;
		this.eofBehaviour = options?.eofBehavior ?? EofBehavior.NoChange;
	}

	compile(cst: CstNode): WebAssembly.Module {
		// Allocate sufficient memory
		const pageSize = 65_536;
		const pages = Math.ceil(this.memorySize / pageSize);
		this.wasm.setMemory(pages, pages, 'memory');

		// Globals
		this.wasm.addGlobal('dataPointer', binaryen.i32, true, this.wasm.i32.const(0));
		this.wasm.addGlobal('inputBuffer', binaryen.i32, true, this.wasm.i32.const(0));

		// Imported I/O functions
		this.wasm.addFunctionImport('output', 'imports', 'output', binaryen.i32, binaryen.none);
		this.wasm.addFunctionImport('input', 'imports', 'input', binaryen.none, binaryen.i32);

		// Main program body
		const program = this.visit(cst);

		// Export program in execute() function
		this.wasm.addFunction('execute', binaryen.none, binaryen.i32, [binaryen.i32], program);
		this.wasm.addFunctionExport('execute', 'execute');

		// Optimize the module using default passes and levels
		this.wasm.optimize();
		// This.module.runPasses(['asyncify']);

		// Validate the module
		if (!this.wasm.validate()) {
			throw new Error('validation error');
		}

		// Generate WebAssembly module from binary
		return new WebAssembly.Module(this.wasm.emitBinary());
	}

	brainfuck(ctx: BrainfuckCstChildren) {
		// Visit commands in program
		const commands = (ctx.command ?? []).map(node => this.visit(node));
		// Wrap commands in block and return data pointer position
		return this.wasm.block(null, [...commands, this.wasm.return(this.dataPointer)]);
	}

	right(ctx: RightCstChildren) {
		return this.addToDataPointer(ctx.RAngle.length);
	}

	left(ctx: LeftCstChildren) {
		return this.addToDataPointer(-ctx.LAngle.length);
	}

	add(ctx: AddCstChildren) {
		return this.addToDataValue(ctx.Plus.length);
	}

	sub(ctx: SubCstChildren) {
		return this.addToDataValue(-ctx.Minus.length);
	}

	loop(ctx: LoopCstChildren) {
		// Optimize multiplication loops
		if (isMultiplicationLoop(ctx)) {
			// Statically compute factors
			const factors = [...getMultiplicationLoopFactors(ctx).entries()];
			// Multiply and copy to offset
			const multiplications = factors.map(([offset, factor]) => this.multiply(offset, factor));
			// Clear original cell
			const clear = this.setDataValue(this.wasm.i32.const(0));
			// Wrap operations in block to return a single node
			return this.wasm.block(null, [...multiplications, clear]);
		}

		// Labels for branching
		const breakLabel = `break:${ctx.LSquare[0]!.startOffset}`;
		const continueLabel = `continue:${ctx.LSquare[0]!.startOffset}`;

		return this.wasm.loop(
			continueLabel,
			this.wasm.block(breakLabel, [
				// Break out of the loop if the data cell is equal to 0
				this.wasm.br(breakLabel, this.wasm.i32.eq(this.dataValue, this.wasm.i32.const(0))),

				// Loop body commands
				...(ctx.command ?? []).map(node => this.visit(node)),

				// Go back to the top of the loop
				this.wasm.br(continueLabel),
			]),
		);
	}

	command(ctx: CommandCstChildren) {
		if (ctx.loop) {
			return this.visit(ctx.loop);
		}

		if (ctx.right) {
			return this.visit(ctx.right);
		}

		if (ctx.left) {
			return this.visit(ctx.left);
		}

		if (ctx.add) {
			return this.visit(ctx.add);
		}

		if (ctx.sub) {
			return this.visit(ctx.sub);
		}

		if (ctx.Period) {
			return this.write();
		}

		if (ctx.Comma) {
			return this.read();
		}

		throw new Error('Unknown command');
	}

	private get dataPointer() {
		return this.wasm.global.get('dataPointer', binaryen.i32);
	}

	private get dataValue() {
		return this.wasm.i32.load8_u(0, 0, this.dataPointer);
	}

	private offsetDataPointer(offset: number) {
		return this.wasm.i32.rem_u(
			this.wasm.i32.add(this.dataPointer, this.wasm.i32.const(offset)),
			this.wasm.i32.const(this.memorySize),
		);
	}

	private addToDataPointer(value: number) {
		// Wrap pointer at boundaries
		const result = this.offsetDataPointer(value);
		return this.wasm.global.set('dataPointer', result);
	}

	private addToDataValue(value: number) {
		const result = this.wasm.i32.add(this.dataValue, this.wasm.i32.const(value));
		return this.setDataValue(result);
	}

	private setDataValue(value: number) {
		return this.wasm.i32.store8(0, 0, this.dataPointer, value);
	}

	private multiply(offset: number, factor: number) {
		// Multiply value at data pointer by factor
		const product = this.wasm.i32.mul(this.dataValue, this.wasm.i32.const(factor));
		// Add product to value at offset
		const result = this.wasm.i32.add(product, this.wasm.i32.load8_u(0, 0, this.offsetDataPointer(offset)));
		// Store result at offset
		return this.wasm.i32.store8(0, 0, this.offsetDataPointer(offset), result);
	}

	private write() {
		return this.wasm.call('output', [this.dataValue], binaryen.none);
	}

	private read() {
		const inputBuffer = this.wasm.global.get('inputBuffer', binaryen.i32);
		return this.wasm.block(null, [
			// Temporarily store input in global variable for comparison
			this.wasm.global.set('inputBuffer', this.wasm.call('input', [], binaryen.i32)),
			// Write input to memory and handle EOF conditions
			this.wasm.if(
				this.wasm.i32.ge_s(inputBuffer, this.wasm.i32.const(0)),
				this.wasm.i32.store8(0, 0, this.dataPointer, inputBuffer),
				this.handleEof(),
			),
		]);
	}

	private handleEof() {
		switch (this.eofBehaviour) {
			case EofBehavior.SetZero:
				return this.wasm.i32.store8(0, 0, this.dataPointer, this.wasm.i32.const(0));
			case EofBehavior.SetAllBits:
				return this.wasm.i32.store8(0, 0, this.dataPointer, this.wasm.i32.const(255));
			default:
				return this.wasm.nop();
		}
	}
}
