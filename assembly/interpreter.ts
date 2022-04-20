const memorySize: i32 = 30_000;

function findEndOfLoop(commands: string, startIndex: i32): i32 {
  let nesting = 0;
  for (let i = startIndex + 1; i < commands.length; i++) {
    const token = commands.charAt(i);
    if (token === "[") {
      nesting++;
    } else if (token === "]") {
      if (nesting > 0) {
        nesting--;
      } else {
        return i;
      }
    }
  }
  throw new Error("End of loop not found");
}

function findStartOfLoop(commands: string, endIndex: i32): i32 {
  let nesting = 0;
  for (let i = endIndex - 1; i >= 0; i--) {
    const token = commands.charAt(i);
    if (token === "]") {
      nesting++;
    } else if (token === "[") {
      if (nesting > 0) {
        nesting--;
      } else {
        return i;
      }
    }
  }
  throw new Error("Start of loop not found");
}

export function interpret(commands: string, input: string): string {
  const memory: Uint8Array = new Uint8Array(memorySize);
  let instructionPointer: i32 = 0;
  let dataPointer: i32 = 0;
  let inputPointer: i32 = 0;
  let stepCount = 0;

  let output = "";

  while (instructionPointer < commands.length) {
    const command = commands.at(instructionPointer);
    if (command === ">") {
      // Increment the data pointer
      if (dataPointer < memorySize - 1) {
        dataPointer++;
      }
    } else if (command === "<") {
      // Decrement the data pointer
      if (dataPointer > 0) {
        dataPointer--;
      }
    } else if (command === "+") {
      // Increment the byte at the data pointer
      memory[dataPointer]++;
    } else if (command === "-") {
      // Decrement the byte at the data pointer
      memory[dataPointer]--;
    } else if (command === ".") {
      // Output the byte at the data pointer
      output += String.fromCodePoint(memory[dataPointer]);
    } else if (command === ",") {
      // Input one byte to the byte at the data pointer
      if (inputPointer < input.length) {
        memory[dataPointer] = input.codePointAt(inputPointer++);
      }
    } else if (command === "[") {
      // If the byte at the data pointer is zero, move the instruction pointer to the command after the next "]"
      if (memory[dataPointer] === 0) {
        instructionPointer = findEndOfLoop(commands, instructionPointer);
      }
    } else if (command === "]") {
      // If the byte at the data pointer is non-zero, move the instruction pointer to the command after the previous "["
      if (memory[dataPointer] !== 0) {
        instructionPointer = findStartOfLoop(commands, instructionPointer);
      }
    } else {
      throw new SyntaxError(`Unknown command "${command}"`);
    }

    // Move to the next command
    instructionPointer++;
    stepCount++;
  }

  console.log(`Step count: ${stepCount}`);

  return output;
}
