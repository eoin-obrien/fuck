import {Add, Instruction, Left, Loop, Right, Sub} from '../instructions.js';

export function contract(instructions: Instruction[]): Instruction[] {
	const optimized: Instruction[] = [];

	for (const instruction of instructions) {
		const previousInstruction = optimized.at(-1);

		if (instruction instanceof Loop) {
			// Recursively optimize loop bodies
			const optimizedLoop = new Loop(contract(instruction.body));
			optimized.push(optimizedLoop);
		} else if (instruction instanceof Right && previousInstruction instanceof Right) {
			// Merge consecutive >
			optimized[optimized.length - 1] = new Right(previousInstruction.value + 1);
		} else if (instruction instanceof Left && previousInstruction instanceof Left) {
			// Merge consecutive <
			optimized[optimized.length - 1] = new Left(previousInstruction.value + 1);
		} else if (instruction instanceof Add && previousInstruction instanceof Add) {
			// Merge consecutive +
			optimized[optimized.length - 1] = new Add(previousInstruction.value + 1);
		} else if (instruction instanceof Sub && previousInstruction instanceof Sub) {
			// Merge consecutive -
			optimized[optimized.length - 1] = new Sub(previousInstruction.value + 1);
		} else {
			optimized.push(instruction);
		}
	}

	return optimized;
}
