import binaryen from 'binaryen'; // eslint-disable-line import/no-named-as-default-member,import/no-named-as-default
import {BrainfuckCompiler, BrainfuckCompilerOptions} from './compiler.js';
import {parseBrainfuck} from './grammar.js';

export {EofBehavior} from './compiler.js';

export interface ExecutionResult {
	memory: Uint8Array;
	dataPointer: number;
	output: string;
	compilationTime: number;
	instantiationTime: number;
	executionTime: number;
}

export class Brainfuck {
	protected readonly compiler: BrainfuckCompiler;
	protected readonly wasmModule: WebAssembly.Module;
	protected readonly compilationTime: number;

	protected outputBuffer: number[] = [];
	protected inputBuffer: number[] = [];

	constructor(private readonly code: string, options?: Partial<BrainfuckCompilerOptions>) {
		this.compiler = new BrainfuckCompiler(new binaryen.Module(), options);
		const t0 = performance.now();
		this.wasmModule = this.compiler.compile(parseBrainfuck(this.code));
		const t1 = performance.now();
		this.compilationTime = t1 - t0;
	}

	execute(input = ''): ExecutionResult {
		// Reset i/o buffers
		this.outputBuffer = [];
		this.inputBuffer = this.encodeInput(input);

		// Instantiate wasm module
		let instantiationTime = performance.now();
		const instance = new WebAssembly.Instance(this.wasmModule, {
			imports: {
				output: this.output.bind(this),
				input: this.input.bind(this),
			},
		});
		instantiationTime = performance.now() - instantiationTime;
		const {execute, memory} = instance.exports as {execute: () => number; memory: WebAssembly.Memory};

		// Invoke wasm module
		let executionTime = performance.now();
		const dataPointer = execute();
		executionTime = performance.now() - executionTime;

		return {
			memory: new Uint8Array(memory.buffer, 0, this.compiler.memorySize),
			dataPointer,
			output: this.decodeOutput(this.outputBuffer),
			compilationTime: this.compilationTime,
			instantiationTime,
			executionTime,
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
