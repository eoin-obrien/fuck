import binaryen from 'binaryen';
import { BrainfuckCompiler, BrainfuckCompilerOptions } from './compiler';
import { parseBrainfuck } from './grammar';
import { fromCharCodes, toCharCodes } from './utils';

export interface BrainfuckExecution {
  memory: Uint8Array;
  dataPointer: number;
  output: string;
}

export class Brainfuck {
  protected readonly compiler: BrainfuckCompiler;
  protected readonly wasmModule: WebAssembly.Module;

  protected outputBuffer: number[] = [];
  protected inputBuffer: number[] = [];

  constructor(private readonly code: string, options?: Partial<BrainfuckCompilerOptions>) {
    this.compiler = new BrainfuckCompiler(new binaryen.Module(), options);
    this.wasmModule = this.compiler.compile(parseBrainfuck(this.code));
  }

  execute(input: string = ''): BrainfuckExecution {
    // Reset i/o buffers
    this.outputBuffer = [];
    this.inputBuffer = toCharCodes(input);

    // Instantiate wasm module
    const instance = new WebAssembly.Instance(this.wasmModule, {
      imports: {
        output: this.output.bind(this),
        input: this.input.bind(this),
      },
    });
    const { execute, memory } = instance.exports as { execute: () => number; memory: WebAssembly.Memory };

    // Invoke wasm module
    const dataPointer = execute();

    return {
      memory: new Uint8Array(memory.buffer, 0, this.compiler.memorySize),
      dataPointer,
      output: fromCharCodes(this.outputBuffer),
    };
  }

  protected output(byte: number): void {
    this.outputBuffer.push(byte);
  }

  protected input(): number {
    return this.inputBuffer.shift() ?? -1;
  }
}
