import {Add, Clear, Input, Instruction, Left, Loop, Mul, Output, Right, Sub} from '../instructions.js';

export function multiloop(instructions: Instruction[]): Instruction[] {
	const optimized: Instruction[] = [];

	for (const instruction of instructions) {
		if (instruction instanceof Loop) {
			if (isMultiplicationLoop(instruction)) {
				// Replace multiplication loop with Mul and Clear instructions
				optimized.push(optimizeMultiplicationLoop(instruction));
			} else {
				// Recursively optimize loops
				optimized.push(new Loop(multiloop(instruction.body)));
			}
		} else {
			optimized.push(instruction);
		}
	}

	return optimized;
}

export function isMultiplicationLoop(loop: Loop): boolean {
	// Can't have I/O or nested loops
	const hasInvalidInstructions = loop.body.some(instruction => instruction instanceof Output || instruction instanceof Input || instruction instanceof Loop);
	if (hasInvalidInstructions) {
		return false;
	}

	// Track offset and change through the loop
	let offset = 0;
	let change = 0;
	for (const instruction of loop.body) {
		if (instruction instanceof Right) {
			offset += instruction.value;
		}

		if (instruction instanceof Left) {
			offset -= instruction.value;
		}

		if (instruction instanceof Add && offset === 0) {
			change += instruction.value;
		}

		if (instruction instanceof Sub && offset === 0) {
			change -= instruction.value;
		}
	}

	// Offset must be zero and its data must be decremented by 1
	return offset === 0 && change === -1;
}

export function optimizeMultiplicationLoop(loop: Loop): Loop {
	const factors = new Map<number, number>();
	let offset = 0;
	for (const instruction of loop.body) {
		if (instruction instanceof Right) {
			offset += instruction.value;
		}

		if (instruction instanceof Left) {
			offset -= instruction.value;
		}

		if (instruction instanceof Add && offset !== 0) {
			factors.set(offset, factors.get(offset) ?? 0 + instruction.value);
		}

		if (instruction instanceof Sub && offset !== 0) {
			factors.set(offset, factors.get(offset) ?? 0 - instruction.value);
		}
	}

	const multiplications = [...factors.keys()].map(offset => new Mul(factors.get(offset), offset));
	return new Loop([...multiplications, new Clear()]);
}
