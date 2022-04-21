import { createToken, CstParser, Lexer } from "chevrotain";
import concatTypedArray from "concat-typed-array";
import { execute } from "./build/debug.js";

const Right = createToken({ name: "Right", pattern: />/ });
const Left = createToken({ name: "Left", pattern: /</ });
const Increment = createToken({ name: "Increment", pattern: /\+/ });
const Decrement = createToken({ name: "Decrement", pattern: /-/ });
const Output = createToken({ name: "Output", pattern: /\./ });
const Input = createToken({ name: "Input", pattern: /,/ });
const Open = createToken({ name: "Open", pattern: /\[/ });
const Close = createToken({ name: "Close", pattern: /\]/ });

const Comment = createToken({
  name: "Comment",
  pattern: /[^><\+\-\.,\[\]]+/,
  group: Lexer.SKIPPED,
});

const allTokens = [
  Comment,
  Right,
  Left,
  Increment,
  Decrement,
  Output,
  Input,
  Open,
  Close,
];

const BrainfuckLexer = new Lexer(allTokens);

class BrainfuckParser extends CstParser {
  constructor() {
    super(allTokens);

    const $ = this;

    $.RULE("commands", () => {
      $.MANY(() => {
        $.SUBRULE($.command);
      });
    });

    $.RULE("command", () => {
      $.OR([
        { ALT: () => $.CONSUME(Right) },
        { ALT: () => $.CONSUME(Left) },
        { ALT: () => $.CONSUME(Increment) },
        { ALT: () => $.CONSUME(Decrement) },
        { ALT: () => $.CONSUME(Output) },
        { ALT: () => $.CONSUME(Input) },
        { ALT: () => $.SUBRULE($.loop) },
      ]);
    });

    $.RULE("loop", () => {
      $.CONSUME(Open);
      $.SUBRULE($.commands);
      $.CONSUME(Close);
    });

    this.performSelfAnalysis();
  }
}

const parser = new BrainfuckParser();

function parseInput(text) {
  const lexingResult = BrainfuckLexer.tokenize(text);
  // "input" is a setter which will reset the parser's state.
  parser.input = lexingResult.tokens;
  console.log(parser.program());

  if (parser.errors.length > 0) {
    throw new Error("Parsing errors detected");
  }
}

const BaseBrainfuckVisitor = parser.getBaseCstVisitorConstructor();

class BrainfuckToBytecodeVisitor extends BaseBrainfuckVisitor {
  constructor() {
    super();
    this.validateVisitor();
  }

  /* Visit methods go here */
  commands(ctx) {
    return concatTypedArray(
      Uint8Array,
      ...(ctx.command ?? []).map((command) => this.visit(command))
    );
  }

  command(ctx) {
    if (ctx.loop) {
      return this.visit(ctx.loop);
    } else if (ctx.Right) {
      return Uint8Array.of(0, 0);
    } else if (ctx.Left) {
      return Uint8Array.of(1, 0);
    } else if (ctx.Increment) {
      return Uint8Array.of(2, 0);
    } else if (ctx.Decrement) {
      return Uint8Array.of(3, 0);
    } else if (ctx.Output) {
      return Uint8Array.of(4, 0);
    } else if (ctx.Input) {
      return Uint8Array.of(5, 0);
    } else {
      throw new Error("Unhandled command");
    }
  }

  loop(ctx) {
    const body = this.visit(ctx.commands);
    const open = Uint8Array.of(6, body.length / 2);
    const close = Uint8Array.of(7, body.length / 2);
    return concatTypedArray(Uint8Array, open, body, close);
  }
}

const toBytecodeVisitorInstance = new BrainfuckToBytecodeVisitor();

function toBytecode(inputText) {
  // Lex
  const lexResult = BrainfuckLexer.tokenize(inputText);
  parser.input = lexResult.tokens;

  // Automatic CST created when parsing
  const cst = parser.commands();
  if (parser.errors.length > 0) {
    throw Error("Parsing errors detected!\n" + parser.errors[0].message);
  }

  // Visit
  const ast = toBytecodeVisitorInstance.visit(cst);
  return ast;
}

const inputText =
  "++++[>++++++<-]>[>+++++>+++++++<<-]>>++++<[[>[[>>+<<-]<]>>>-]>-[>+>+<<-]>]+++++[>+++++++<<++>-]>.<<.";
console.log(inputText);
const bytecode = toBytecode(inputText);
console.log(bytecode);
console.log(execute(bytecode, "\n"));
