import binaryen from 'binaryen';
import { BrainfuckCompiler, BrainfuckCompilerOptions } from './compiler';
import { parseBrainfuck } from './grammar';

export interface BrainfuckExecution {
  memory: Uint8Array;
  dataPointer: number;
  output: string;
}

export class BrainfuckProgram {
  protected readonly compiler: BrainfuckCompiler;
  protected readonly wasmModule: WebAssembly.Module;

  protected outputBuffer: string[] = [];
  protected inputBuffer: string[] = [];

  constructor(private readonly code: string, options?: Partial<BrainfuckCompilerOptions>) {
    this.compiler = new BrainfuckCompiler(new binaryen.Module(), options);
    this.wasmModule = this.compiler.compile(parseBrainfuck(this.code));
  }

  execute(input: string = ''): BrainfuckExecution {
    // Reset i/o buffers
    this.outputBuffer = [];
    this.inputBuffer = input.split('');

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
      output: this.outputBuffer.join(''),
    };
  }

  protected output(byte: number): void {
    this.outputBuffer.push(String.fromCharCode(byte));
  }

  protected input(): number {
    return this.inputBuffer.shift()?.charCodeAt(0) ?? -1;
  }
}
