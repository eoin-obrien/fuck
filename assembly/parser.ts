export class Token {
  value: string;
  pos: i32;
  ln: i32;
  col: i32;

  constructor(value: string, pos: i32, ln: i32, col: i32) {
    this.value = value;
    this.pos = pos;
    this.ln = ln;
    this.col = col;
  }
}

const lexicon = [">", "<", "+", "-", ".", ",", "[", "]"];

export function tokenize(code: string): Array<Token> {
  const tokens = new Array<Token>();
  let line = 1;
  let column = 1;
  for (let i = 0; i < code.length; i++) {
    // Tokenize character
    const char = code.at(i);
    if (lexicon.includes(char)) {
      tokens.push(new Token(char, tokens.length, line, column));
    }

    // Increment line and column numbers
    if (char === "\n") {
      line++;
      column = 1;
    } else {
      column++;
    }
  }

  return tokens;
}

export function matchBrackets(tokens: Array<Token>): Map<i32, i32> {
  const map = new Map<i32, i32>();
  const stack = new Array<Token>();
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens.at(i);
    if (token.value === "[") {
      stack.push(token);
    } else if (token.value === "]") {
      if (!stack.length) {
        throw new SyntaxError(
          `Unmatched "${token.value}" at position ${token.ln}:${token.col}`
        );
      } else {
        const match = stack.pop();
        map.set(token.pos, match.pos);
        map.set(match.pos, token.pos);
      }
    }
  }

  // Check for unmatched brackets left on the stack
  if (stack.length > 0) {
    const token = stack.at(-1);
    throw new SyntaxError(
      `Unmatched "${token.value}" at position ${token.ln}:${token.col}`
    );
  }

  return map;
}
