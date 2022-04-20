// The entry file of your WebAssembly module.

import { interpret } from "./interpreter";

const tokens = [">", "<", "+", "-", ".", ",", "[", "]"];

class Token {
  value: string;
  line: i32;
  column: i32;

  constructor(value: string, line: i32, column: i32) {
    this.value = value;
    this.line = line;
    this.column = column;
  }
}

function sanitize(code: string): string {
  let sanitizedCode = "";
  for (let i = 0; i < code.length; i++) {
    const token = code.at(i);
    if (tokens.includes(token)) {
      sanitizedCode += token;
    }
  }
  return sanitizedCode;
}

function validate(code: string): void {
  let line = 1;
  let column = 1;
  const stack: Array<Token> = [];

  for (let i = 0; i < code.length; i++) {
    const token = new Token(code.at(i), line, column);

    // Check for matching brackets using the stack
    if (token.value === "[") {
      stack.push(token);
    } else if (token.value === "]") {
      if (!stack.length || stack.at(-1).value !== "[") {
        throw new SyntaxError(
          `Unmatched "${token.value}" at position ${token.line}:${token.column}`
        );
      }
      stack.pop();
    }

    // Handle line and column numbers
    if (token.value === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  // Check for unmatched brackets remaining on the stack
  if (stack.length) {
    const token = stack.pop();
    throw new SyntaxError(
      `Unmatched "${token.value}" at position ${token.line}:${token.column}`
    );
  }
}

export function add(a: i32, b: i32): i32 {
  return a + b;
}

export function execute(code: string, input: string): string {
  validate(code);
  const commands = sanitize(code);
  console.log(commands);

  console.time();
  const result = interpret(commands, input);
  console.timeEnd();

  return result;
}
