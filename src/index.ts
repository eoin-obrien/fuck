import {parseBrainfuck} from './grammar.js';
import {compileInstructions} from './instruction-compiler.js';
import {optimizeContractions} from './optimizers/contract.js';
import {optimizeLoops} from './optimizers/loop.js';
import {optimizeOffsets} from './optimizers/offset.js';
import {BrainfuckCompiler, BrainfuckCompilerOptions} from './wasm-compiler.js';

export {EofBehavior} from './wasm-compiler.js';

export interface ExecutionResult {
	dataPointer: number;
	memory: Uint8Array;
	output: string;
}

export class Brainfuck {
	protected readonly compiler: BrainfuckCompiler;
	protected readonly wasmModule: WebAssembly.Module;

	protected outputBuffer: number[] = [];
	protected inputBuffer: number[] = [];

	constructor(private readonly code: string, options?: Partial<BrainfuckCompilerOptions>) {
		this.compiler = new BrainfuckCompiler(options);
		const cst = parseBrainfuck(this.code);
		const instructions = compileInstructions(cst);

		// Apply optimizations
		const optimized = optimizeOffsets(optimizeLoops(optimizeContractions(instructions)));

		this.wasmModule = this.compiler.compile(optimized);
	}

	execute(input = ''): ExecutionResult {
		// Reset i/o buffers
		this.outputBuffer = [];
		this.inputBuffer = this.encodeInput(input);

		// Instantiate wasm module
		const instance = new WebAssembly.Instance(this.wasmModule, {
			imports: {
				output: this.output.bind(this),
				input: this.input.bind(this),
			},
		});
		const {execute, memory} = instance.exports as {execute: () => number; memory: WebAssembly.Memory};

		// Invoke wasm module
		const dataPointer = execute();

		return {
			dataPointer,
			memory: new Uint8Array(memory.buffer, 0, this.compiler.memorySize),
			output: this.decodeOutput(this.outputBuffer),
		};
	}

	protected output(byte: number): void {
		this.outputBuffer.push(byte);
	}

	protected input(): number {
		return this.inputBuffer.shift() ?? -1;
	}

	private encodeInput(input: string): number[] {
		const encoder = new TextEncoder();
		return [...encoder.encode(input)];
	}

	private decodeOutput(output: number[]): string {
		const decoder = new TextDecoder();
		return decoder.decode(Uint8Array.from(output));
	}
}

