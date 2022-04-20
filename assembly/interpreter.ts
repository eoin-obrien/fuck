import { matchBrackets, Token, tokenize } from "./parser";

export class Interpreter {
  static memorySize: i32 = 30_000;

  tokens: Token[];
  brackets: Map<i32, i32>;

  constructor(code: string) {
    this.tokens = tokenize(code);
    this.brackets = matchBrackets(this.tokens);
  }

  execute(input: string): string {
    const memory: Uint8Array = new Uint8Array(Interpreter.memorySize);
    let instructionPointer: i32 = 0;
    let dataPointer: i32 = 0;
    let inputPointer: i32 = 0;
    let stepCount = 0;

    let output = "";

    while (instructionPointer < this.tokens.length) {
      const token = this.tokens.at(instructionPointer);

      if (token.value === ">") {
        // Increment the data pointer
        if (dataPointer < memory.length - 1) {
          dataPointer++;
        }
      } else if (token.value === "<") {
        // Decrement the data pointer
        if (dataPointer > 0) {
          dataPointer--;
        }
      } else if (token.value === "+") {
        // Increment the byte at the data pointer
        memory[dataPointer]++;
      } else if (token.value === "-") {
        // Decrement the byte at the data pointer
        memory[dataPointer]--;
      } else if (token.value === ".") {
        // Output the byte at the data pointer
        output += String.fromCodePoint(memory[dataPointer]);
      } else if (token.value === ",") {
        // Input one byte to the byte at the data pointer
        if (inputPointer < input.length) {
          memory[dataPointer] = input.codePointAt(inputPointer++);
        }
      } else if (token.value === "[") {
        // If the byte at the data pointer is zero, move the instruction pointer to the command after the next "]"
        if (memory[dataPointer] === 0) {
          instructionPointer = this.brackets.get(token.pos);
        }
      } else if (token.value === "]") {
        // If the byte at the data pointer is non-zero, move the instruction pointer to the command after the previous "["
        if (memory[dataPointer] !== 0) {
          instructionPointer = this.brackets.get(token.pos);
        }
      } else {
        throw new SyntaxError(`Unknown token "${token.value}"`);
      }

      // Move to the next command
      instructionPointer++;
      stepCount++;
    }

    console.log(`Step count: ${stepCount}`);

    return output;
  }
}
