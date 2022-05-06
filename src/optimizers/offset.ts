import {Add, Clear, Input, Instruction, Left, Loop, Mul, Output, Right, Sub} from '../instructions.js';

export function optimizeOffsets(instructions: Instruction[]): Instruction[] {
	const optimized: Instruction[] = [];

	let offset = 0;

	for (const instruction of instructions) {
		if (instruction instanceof Loop) {
			// Move data pointer and reset offset before entering loop
			if (offset) {
				optimized.push(offsetToInstruction(offset));
				offset = 0;
			}

			// Recursively optimize loop bodies
			const optimizedLoop = new Loop(optimizeOffsets(instruction.body));
			optimized.push(optimizedLoop);
		} else if (instruction instanceof Right) {
			// Keep track of offset to the right
			offset += instruction.value;
		} else if (instruction instanceof Left) {
			// Keep track of offset to the left
			offset -= instruction.value;
		} else if (instruction instanceof Add) {
			// Offset instruction
			optimized.push(new Add(instruction.value, instruction.offset + offset));
		} else if (instruction instanceof Sub) {
			// Offset instruction
			optimized.push(new Sub(instruction.value, instruction.offset + offset));
		} else if (instruction instanceof Output) {
			// Offset instruction
			optimized.push(new Output(instruction.offset + offset));
		} else if (instruction instanceof Input) {
			// Offset instruction
			optimized.push(new Input(instruction.offset + offset));
		} else if (instruction instanceof Mul) {
			// Offset instruction
			optimized.push(new Mul(instruction.destination, instruction.factor, instruction.offset + offset));
		} else if (instruction instanceof Clear) {
			// Offset instruction
			optimized.push(new Clear(instruction.offset + offset));
		} else {
			optimized.push(instruction);
		}
	}

	// Move data pointer if offset at end of block
	if (offset) {
		optimized.push(offsetToInstruction(offset));
	}

	return optimized;
}

function offsetToInstruction(offset: number): Right | Left {
	if (offset < 0) {
		return new Left(Math.abs(offset));
	}

	return new Right(offset);
}
