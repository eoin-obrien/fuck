export interface InstructionVisitor<T=void> {
	visitRight(instruction: Right): T;
	visitLeft(instruction: Left): T;
	visitAdd(instruction: Add): T;
	visitSub(instruction: Sub): T;
	visitMul(instruction: Mul): T;
	visitClear(instruction: Clear): T;
	visitOutput(instruction: Output): T;
	visitInput(instruction: Input): T;
	visitLoop(instruction: Loop): T;
}

export abstract class Instruction {
	abstract get name(): string;
	abstract accept<T>(visitor: InstructionVisitor<T>): T;
}

export class Right extends Instruction {
	constructor(public readonly value: number = 1) {
		super();
	}

	get name() {
		return 'right';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitRight(this);
	}
}

export class Left extends Instruction {
	constructor(public readonly value: number = 1) {
		super();
	}

	get name() {
		return 'left';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitLeft(this);
	}
}

export class Add extends Instruction {
	constructor(public readonly value: number = 1, public readonly offset: number = 0) {
		super();
	}

	get name() {
		return 'add';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitAdd(this);
	}
}

export class Sub extends Instruction {
	constructor(public readonly value: number = 1, public readonly offset: number = 0) {
		super();
	}

	get name() {
		return 'sub';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitSub(this);
	}
}

export class Mul extends Instruction {
	constructor(public readonly destination: number, public readonly factor: number, public readonly offset: number = 0) {
		super();
	}

	get name() {
		return 'mul';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitMul(this);
	}
}

export class Clear extends Instruction {
	constructor(public readonly offset: number = 0) {
		super();
	}

	get name() {
		return 'clear';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitClear(this);
	}
}

export class Output extends Instruction {
	constructor(public readonly offset: number = 0) {
		super();
	}

	get name() {
		return 'output';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitOutput(this);
	}
}

export class Input extends Instruction {
	constructor(public readonly offset: number = 0) {
		super();
	}

	get name() {
		return 'input';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitInput(this);
	}
}

export class Loop extends Instruction {
	constructor(public readonly body: Instruction[]) {
		super();
	}

	get name() {
		return 'loop';
	}

	accept<T>(visitor: InstructionVisitor<T>): T {
		return visitor.visitLoop(this);
	}
}
