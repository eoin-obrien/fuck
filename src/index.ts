import type { CstNode } from 'chevrotain';
import { compileBrainfuck } from './compiler';
import { parseBrainfuck } from './grammar';

export enum EOFBehavior {
  /** Leave memory cell at pointer unchanged. */
  NoChange,
  /** Sets byte at pointer to `0x00`. */
  SetZero,
  /** Sets byte at pointer to `0xff`. */
  SetAllBits,
}

export interface BrainfuckExecution {
  memory: Uint8Array;
  dataPointer: number;
  output: string;
}

export interface BrainfuckOptions {
  memorySize: number;
  eofBehavior: EOFBehavior;
}

export class BrainfuckProgram {
  protected readonly cst: CstNode;
  protected readonly wasmModule: WebAssembly.Module;

  protected readonly options: BrainfuckOptions = {
    memorySize: 30000,
    eofBehavior: EOFBehavior.NoChange,
  };

  protected outputBuffer: string[] = [];
  protected inputBuffer: string[] = [];

  constructor(private readonly code: string, options?: Partial<BrainfuckOptions>) {
    this.options = { ...this.options, ...options };
    this.cst = parseBrainfuck(this.code);
    this.wasmModule = compileBrainfuck(this.cst);
  }

  execute(input: string = ''): BrainfuckExecution {
    // Reset i/o buffers
    this.outputBuffer = [];
    this.inputBuffer = input.split('');

    // Instantiate wasm module
    const instance = new WebAssembly.Instance(this.wasmModule, {
      imports: {
        memorySize: this.options.memorySize,
        output: this.output.bind(this),
        input: this.input.bind(this),
      },
    });
    const { execute, memory } = instance.exports as { execute: () => number; memory: WebAssembly.Memory };

    // Invoke wasm module
    const dataPointer = execute();

    // TODO decode string properly (too many args gives RangeError)
    return {
      memory: new Uint8Array(memory.buffer, 0, this.options.memorySize),
      dataPointer,
      output: this.outputBuffer.join(''),
    };
  }

  protected get eof(): number {
    switch (this.options.eofBehavior) {
      case EOFBehavior.SetAllBits:
        return 255;
      case EOFBehavior.SetZero:
        return 0;
      default:
        return -1;
    }
  }

  protected output(byte: number): void {
    this.outputBuffer.push(String.fromCharCode(byte));
  }

  protected input(): number {
    return this.inputBuffer.shift()?.charCodeAt(0) ?? this.eof;
  }
}
