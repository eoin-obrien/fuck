import type { CstNode } from 'chevrotain';
import { compileBrainfuck } from './compiler';
import { parseBrainfuck } from './grammar';

export type OutputFn = (data: number) => void;
export type InputFn = () => number;

export interface BrainfuckResult {
  memory: WebAssembly.Memory;
}

export class BrainfuckProgram {
  private readonly cst: CstNode;
  private readonly wasmModule: WebAssembly.Module;

  constructor(private readonly code: string) {
    this.cst = parseBrainfuck(this.code);
    this.wasmModule = compileBrainfuck(this.cst);
  }

  execute(input: string = '') {
    const outputBuffer: number[] = [];
    const inputBuffer = input.split('').map((char) => char.charCodeAt(0));

    // TODO set up i/o memory
    const instance = new WebAssembly.Instance(this.wasmModule, {
      imports: {
        memorySize: 30000,
        output: (data: number) => {
          outputBuffer.push(data);
        },
        // TODO support different EOF strategies
        input: () => inputBuffer.shift() ?? -1,
      },
    });
    const { execute, memory } = instance.exports as any;
    // TODO invoke wasm module
    execute();
    console.log(memory);
    // TODO return output and execution details
    // TODO decode string properly (too many args gives RangeError)
    return String.fromCharCode(...outputBuffer);
  }
}
