import type {LoopCstChildren} from '../types/@generated/cst';

export function isMultiplicationLoop(ctx: LoopCstChildren): boolean {
	const commands = (ctx.command ?? [])?.map(node => node.children);

	// Can't have I/O or nested loops
	const hasInvalidCommands = commands.some(node => node.Comma ?? node.Period ?? node.loop);
	if (hasInvalidCommands) {
		return false;
	}

	// Track offset and change through the loop
	let offset = 0;
	let change = 0;
	for (const command of commands) {
		const {right, left, add, sub} = command;
		if (right?.[0]) {
			offset += right[0].children.RAngle.length;
		}

		if (left?.[0]) {
			offset -= left[0].children.LAngle.length;
		}

		if (add?.[0] && offset === 0) {
			change += add[0].children.Plus.length;
		}

		if (sub?.[0] && offset === 0) {
			change -= sub[0].children.Minus.length;
		}
	}

	// Offset must be zero and its data must be decremented by 1
	return offset === 0 && change === -1;
}

export function getMultiplicationLoopFactors(ctx: LoopCstChildren): Map<number, number> {
	const commands = (ctx.command ?? [])?.map(node => node.children);

	const factors = new Map<number, number>();
	let offset = 0;
	for (const command of commands) {
		const {right, left, add, sub} = command;
		if (right?.[0]) {
			offset += right[0].children.RAngle.length;
		}

		if (left?.[0]) {
			offset -= left[0].children.LAngle.length;
		}

		if (add?.[0] && offset !== 0) {
			factors.set(offset, factors.get(offset) ?? 0 + add[0].children.Plus.length);
		}

		if (sub?.[0] && offset !== 0) {
			factors.set(offset, factors.get(offset) ?? 0 - sub[0].children.Minus.length);
		}
	}

	return factors;
}

// Function left(ctx: LeftCstChildren) {
// 	return this.addToDataPointer(-ctx.LAngle.length);
// }

// function add(ctx: AddCstChildren) {
// 	return this.addToDataValue(ctx.Plus.length);
// }

// function sub(ctx: SubCstChildren) {
// 	return this.addToDataValue(-ctx.Minus.length);
// }
