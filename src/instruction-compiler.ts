import {CstNode} from 'chevrotain';
import type {BrainfuckCstChildren, CommandCstChildren, LoopCstChildren} from '../types/@generated/cst';
import {parser} from './grammar.js';
import {Add, Input, Instruction, Left, Loop, Output, Right, Sub} from './instructions.js';

class InstructionCompiler extends parser.getBaseCstVisitorConstructor<never, Instruction[]>() {
	constructor() {
		super();
		// The "validateVisitor" method is a helper utility which performs static analysis
		// to detect missing or redundant visitor methods
		this.validateVisitor();
	}

	brainfuck(ctx: BrainfuckCstChildren): Instruction[] {
		// Visit commands in program
		return ctx.command?.flatMap(node => this.visit(node)) ?? [];
	}

	loop(ctx: LoopCstChildren): Instruction[] {
		const body = ctx.command?.flatMap(node => this.visit(node)) ?? [];
		return [new Loop(body)];
	}

	command(ctx: CommandCstChildren): Instruction[] {
		if (ctx.loop) {
			return this.visit(ctx.loop);
		}

		if (ctx.RAngle) {
			return [new Right()];
		}

		if (ctx.LAngle) {
			return [new Left()];
		}

		if (ctx.Plus) {
			return [new Add()];
		}

		if (ctx.Minus) {
			return [new Sub()];
		}

		if (ctx.Period) {
			return [new Output()];
		}

		if (ctx.Comma) {
			return [new Input()];
		}

		throw new Error('Unknown command');
	}
}

const instructionCompiler = new InstructionCompiler();

export function compileInstructions(cst: CstNode): Instruction[] {
	return instructionCompiler.visit(cst);
}
