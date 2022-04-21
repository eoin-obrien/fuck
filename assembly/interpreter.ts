import { Instruction } from "./bytecode";

export class Interpreter {
  static memorySize: i32 = 30_000;

  constructor() {}

  execute(bytecode: Uint8Array, input: string): string {
    const memory: Uint8Array = new Uint8Array(Interpreter.memorySize);
    let instructionPointer: i32 = 0;
    let dataPointer: i32 = 0;
    let inputPointer: i32 = 0;
    let stepCount = 0;

    let output = "";

    while (instructionPointer * 2 < bytecode.length) {
      const op = bytecode.at(instructionPointer * 2);
      const oparg = bytecode.at(instructionPointer * 2 + 1);

      if (op === Instruction.RIGHT) {
        // Increment the data pointer
        if (dataPointer < memory.length - 1) {
          dataPointer++;
        }
      } else if (op === Instruction.LEFT) {
        // Decrement the data pointer
        if (dataPointer > 0) {
          dataPointer--;
        }
      } else if (op === Instruction.ADD) {
        // Increment the byte at the data pointer
        memory[dataPointer]++;
      } else if (op === Instruction.SUB) {
        // Decrement the byte at the data pointer
        memory[dataPointer]--;
      } else if (op === Instruction.OUTPUT) {
        // Output the byte at the data pointer
        output += String.fromCodePoint(memory[dataPointer]);
      } else if (op === Instruction.INPUT) {
        // Input one byte to the byte at the data pointer
        if (inputPointer < input.length) {
          memory[dataPointer] = input.codePointAt(inputPointer++);
        }
      } else if (op === Instruction.OPEN) {
        // If the byte at the data pointer is zero, move the instruction pointer to the command after the next "]"
        if (memory[dataPointer] === 0) {
          instructionPointer += oparg;
        }
      } else if (op === Instruction.CLOSE) {
        // If the byte at the data pointer is non-zero, move the instruction pointer to the command after the previous "["
        if (memory[dataPointer] !== 0) {
          instructionPointer -= oparg + 1;
        }
      } else {
        throw new SyntaxError(`Unknown bytecode op "${op}"`);
      }

      // Move to the next command
      instructionPointer++;
      stepCount++;
    }

    console.log(`Step count: ${stepCount}`);

    return output;
  }
}
