import { createToken, CstParser, Lexer } from "chevrotain";
import concatTypedArray from "concat-typed-array";
import { interpret, Opcode } from "./build/release.js";

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
const clampUint8 = (num) => clamp(num, 0, 255);

/**
 * Creates bytecode instructions for an operation.
 *
 * @param {number} opcode
 * @param {number} oparg
 * @returns Uint8Array
 */
const makeInstruction = (opcode, oparg) => {
  const instructions = [];

  do {
    instructions.push(Uint8Array.of(opcode, oparg & 0xff));
    opcode = Opcode.ExtendedArg;
    oparg >>= 8;
  } while (oparg > 0 && opcode !== Opcode.Add && opcode !== Opcode.Sub);

  return concatTypedArray(Uint8Array, ...instructions.reverse());
};

const Right = createToken({ name: "Right", pattern: />/ });
const Left = createToken({ name: "Left", pattern: /</ });
const Increment = createToken({ name: "Increment", pattern: /\+/ });
const Decrement = createToken({ name: "Decrement", pattern: /\-/ });
const Output = createToken({ name: "Output", pattern: /\./ });
const Input = createToken({ name: "Input", pattern: /,/ });
const Open = createToken({ name: "Open", pattern: /\[/ });
const Close = createToken({ name: "Close", pattern: /\]/ });
const Clear = createToken({ name: "Clear", pattern: /\[[\+\-]\]/ });

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
  Clear,
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
        { ALT: () => $.SUBRULE($.move) },
        { ALT: () => $.SUBRULE($.sum) },
        { ALT: () => $.CONSUME(Output) },
        { ALT: () => $.CONSUME(Input) },
        { ALT: () => $.CONSUME(Clear) },
        { ALT: () => $.SUBRULE($.loop) },
      ]);
    });

    $.RULE("move", () => {
      $.AT_LEAST_ONE(() => {
        $.OR([{ ALT: () => $.CONSUME(Right) }, { ALT: () => $.CONSUME(Left) }]);
      });
    });

    $.RULE("sum", () => {
      $.AT_LEAST_ONE(() => {
        $.OR([
          { ALT: () => $.CONSUME(Increment) },
          { ALT: () => $.CONSUME(Decrement) },
        ]);
      });
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
  parser.program();

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
    } else if (ctx.move) {
      return this.visit(ctx.move);
    } else if (ctx.sum) {
      return this.visit(ctx.sum);
    } else if (ctx.Output) {
      return makeInstruction(Opcode.Output, 0);
    } else if (ctx.Input) {
      return makeInstruction(Opcode.Input, 0);
    } else if (ctx.Clear) {
      return makeInstruction(Opcode.Clear, 0);
    } else {
      throw new Error("Unhandled command");
    }
  }

  move(ctx) {
    const right = ctx.Right?.length || 0;
    const left = ctx.Left?.length || 0;
    const total = right - left;
    return makeInstruction(
      total < 0 ? Opcode.Left : Opcode.Right,
      Math.abs(total)
    );
  }

  sum(ctx) {
    const increment = ctx.Increment?.length || 0;
    const decrement = ctx.Decrement?.length || 0;
    const total = increment - decrement;
    return makeInstruction(
      total < 0 ? Opcode.Sub : Opcode.Add,
      Math.abs(total)
    );
  }

  loop(ctx) {
    const body = this.visit(ctx.commands);
    const open = makeInstruction(Opcode.Open, body.length);
    const close = makeInstruction(Opcode.Close, body.length);
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

export function run(code, input) {
  // TODO return execution details
  // console.time("parse");
  const bytecode = toBytecode(code);
  // console.timeEnd("parse");
  // console.log("Bytecode length:", bytecode.length);

  // console.time("interpret");
  const result = interpret(bytecode, input);
  // console.timeEnd("interpret");
  // console.log(result);

  return { bytecode, output: result };
}
