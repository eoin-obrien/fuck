export function * serialIdGenerator(): Generator<number, never> {
	let nextId = 0;
	while (true) {
		yield nextId++;
	}
}
