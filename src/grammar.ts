import { createToken, CstNode, CstParser, Lexer, Rule } from 'chevrotain';

const LAngle = createToken({ name: 'LAngle', pattern: /</ });
const RAngle = createToken({ name: 'RAngle', pattern: />/ });
const Plus = createToken({ name: 'Plus', pattern: /\+/ });
const Minus = createToken({ name: 'Minus', pattern: /\-/ });
const Period = createToken({ name: 'Period', pattern: /\./ });
const Comma = createToken({ name: 'Comma', pattern: /,/ });
const LSquare = createToken({ name: 'LSquare', pattern: /\[/ });
const RSquare = createToken({ name: 'RSquare', pattern: /\]/ });
const Comment = createToken({
  name: 'Comment',
  pattern: /[^<>\+\-\.,\[\]]+/,
  group: Lexer.SKIPPED,
});

const allTokens = [
  LAngle,
  RAngle,
  Plus,
  Minus,
  Period,
  Comma,
  LSquare,
  RSquare,
  Comment,
];
const BrainfuckLexer = new Lexer(allTokens);

class BrainfuckParser extends CstParser {
  constructor() {
    super(allTokens);
    this.performSelfAnalysis();
  }

  // In TypeScript the parsing rules are explicitly defined as class instance properties
  // This allows for using access control (public/private/protected) and more importantly "informs" the TypeScript compiler
  // about the API of our Parser, so referencing an invalid rule name (this.SUBRULE(this.oopsType);)
  // is now a TypeScript compilation error.
  public brainfuck = this.RULE('brainfuck', () => {
    this.MANY(() => {
      this.SUBRULE(this.command);
    });
  });

  private loop = this.RULE('loop', () => {
    this.CONSUME(LSquare);
    this.MANY(() => {
      this.SUBRULE(this.command);
    });
    this.CONSUME(RSquare);
  });

  private command = this.RULE('command', () => {
    this.OR([
      { ALT: () => this.CONSUME(LAngle) },
      { ALT: () => this.CONSUME(RAngle) },
      { ALT: () => this.CONSUME(Plus) },
      { ALT: () => this.CONSUME(Minus) },
      { ALT: () => this.CONSUME(Period) },
      { ALT: () => this.CONSUME(Comma) },
      { ALT: () => this.SUBRULE(this.loop) },
    ]);
  });
}

// Reuse the same parser instance.
const parser = new BrainfuckParser();

export const productions: Record<string, Rule> = parser.getGAstProductions();

export const BaseBrainfuckVisitor = parser.getBaseCstVisitorConstructor();

export function parseBrainfuck(text: string): CstNode {
  const lexResult = BrainfuckLexer.tokenize(text);
  if (lexResult.errors.length) {
    throw lexResult.errors[0];
  }

  // Setting a new input will RESET the parser instance's state.
  parser.input = lexResult.tokens;
  const cst = parser.brainfuck();
  if (parser.errors.length) {
    throw parser.errors[0];
  }

  // This is a pure grammar, the value will be undefined until we add embedded actions
  // or enable automatic CST creation.
  return cst;
}
