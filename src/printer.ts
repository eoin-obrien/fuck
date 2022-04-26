import type { CstNode, IToken } from 'chevrotain';
import type {
  BrainfuckCstChildren,
  CommandCstChildren,
  CommandCstNode,
  ICstNodeVisitor,
  LoopCstChildren,
} from './cst';
import { BaseBrainfuckVisitor } from './grammar';

/**
 * The printer visitor reconstructs Brainfuck source code from a CST.
 */
class BrainfuckPrinter
  extends BaseBrainfuckVisitor
  implements ICstNodeVisitor<undefined, string>
{
  constructor() {
    super();
    // The "validateVisitor" method is a helper utility which performs static analysis
    // to detect missing or redundant visitor methods
    this.validateVisitor();
  }

  private printCommands(commands: CommandCstNode[] | undefined) {
    return (commands ?? []).map((node) => this.visit(node))?.join('');
  }

  private printToken(token: IToken[]) {
    return token.map(({ image }) => image).join('');
  }

  brainfuck(ctx: BrainfuckCstChildren) {
    return this.printCommands(ctx.command);
  }

  loop(ctx: LoopCstChildren) {
    return `[${this.printCommands(ctx.command)}]`;
  }

  command(ctx: CommandCstChildren) {
    if (ctx.loop) {
      return this.visit(ctx.loop);
    } else if (ctx.LAngle) {
      return this.printToken(ctx.LAngle);
    } else if (ctx.RAngle) {
      return this.printToken(ctx.RAngle);
    } else if (ctx.Plus) {
      return this.printToken(ctx.Plus);
    } else if (ctx.Minus) {
      return this.printToken(ctx.Minus);
    } else if (ctx.Period) {
      return this.printToken(ctx.Period);
    } else if (ctx.Comma) {
      return this.printToken(ctx.Comma);
    } else {
      throw new Error('Unknown command');
    }
  }
}

const printer = new BrainfuckPrinter();

export function printBrainfuck(cst: CstNode): string {
  return printer.visit(cst);
}
