import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface BrainfuckCstNode extends CstNode {
  name: "brainfuck";
  children: BrainfuckCstChildren;
}

export type BrainfuckCstChildren = {
  command?: CommandCstNode[];
};

export interface LoopCstNode extends CstNode {
  name: "loop";
  children: LoopCstChildren;
}

export type LoopCstChildren = {
  LSquare: IToken[];
  command?: CommandCstNode[];
  RSquare: IToken[];
};

export interface CommandCstNode extends CstNode {
  name: "command";
  children: CommandCstChildren;
}

export type CommandCstChildren = {
  LAngle?: IToken[];
  RAngle?: IToken[];
  Plus?: IToken[];
  Minus?: IToken[];
  Period?: IToken[];
  Comma?: IToken[];
  loop?: LoopCstNode[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  brainfuck(children: BrainfuckCstChildren, param?: IN): OUT;
  loop(children: LoopCstChildren, param?: IN): OUT;
  command(children: CommandCstChildren, param?: IN): OUT;
}
