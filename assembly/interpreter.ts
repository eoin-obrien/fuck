import { instructionByteLength, Opcode } from "./bytecode";

const memorySize: i32 = 30_000;

export function interpret(bytecode: ArrayBuffer, input: string): string {
  console.time("wasm-interpret");

  const instructions = new DataView(bytecode);
  const memory: Uint8Array = new Uint8Array(memorySize);
  let instructionPointer: i32 = 0;
  let dataPointer: i32 = 0;
  let inputPointer: i32 = 0;
  let stepCount: i32 = 0;

  let output = "";

  while (instructionPointer < bytecode.byteLength) {
    const opcode = instructions.getUint8(instructionPointer);
    const oparg = instructions.getUint32(instructionPointer + 1);

    if (opcode === Opcode.Right) {
      // Increment the data pointer
      dataPointer += oparg;
    } else if (opcode === Opcode.Left) {
      // Decrement the data pointer
      dataPointer -= oparg;
    } else if (opcode === Opcode.Add) {
      // Increment the byte at the data pointer
      memory[dataPointer] += <u8>oparg;
    } else if (opcode === Opcode.Sub) {
      // Decrement the byte at the data pointer
      memory[dataPointer] -= <u8>oparg;
    } else if (opcode === Opcode.Output) {
      // Output the byte at the data pointer
      output += String.fromCodePoint(memory[dataPointer]);
    } else if (opcode === Opcode.Input) {
      // Input one byte to the byte at the data pointer
      if (inputPointer < input.length) {
        memory[dataPointer] = input.codePointAt(inputPointer++);
      }
    } else if (opcode === Opcode.Open) {
      // If the byte at the data pointer is zero, move the instruction pointer to the command after the next "]"
      if (memory[dataPointer] === 0) {
        instructionPointer += oparg;
      }
    } else if (opcode === Opcode.Close) {
      // If the byte at the data pointer is non-zero, move the instruction pointer to the command after the previous "["
      if (memory[dataPointer] !== 0) {
        instructionPointer -= oparg + instructionByteLength;
      }
    } else {
      throw new SyntaxError(`Unknown bytecode op "${opcode}"`);
    }

    // Move to the next command
    instructionPointer += instructionByteLength;
    stepCount++;
  }

  console.log(`Step count: ${stepCount}`);
  console.timeEnd("wasm-interpret");

  return output;
}
