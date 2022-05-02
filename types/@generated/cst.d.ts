import type { CstNode, ICstVisitor, IToken } from "chevrotain";

export interface BrainfuckCstNode extends CstNode {
  name: "brainfuck";
  children: BrainfuckCstChildren;
}

export type BrainfuckCstChildren = {
  command?: CommandCstNode[];
};

export interface RightCstNode extends CstNode {
  name: "right";
  children: RightCstChildren;
}

export type RightCstChildren = {
  RAngle: IToken[];
};

export interface LeftCstNode extends CstNode {
  name: "left";
  children: LeftCstChildren;
}

export type LeftCstChildren = {
  LAngle: IToken[];
};

export interface AddCstNode extends CstNode {
  name: "add";
  children: AddCstChildren;
}

export type AddCstChildren = {
  Plus: IToken[];
};

export interface SubCstNode extends CstNode {
  name: "sub";
  children: SubCstChildren;
}

export type SubCstChildren = {
  Minus: IToken[];
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
  right?: RightCstNode[];
  left?: LeftCstNode[];
  add?: AddCstNode[];
  sub?: SubCstNode[];
  Period?: IToken[];
  Comma?: IToken[];
  loop?: LoopCstNode[];
};

export interface ICstNodeVisitor<IN, OUT> extends ICstVisitor<IN, OUT> {
  brainfuck(children: BrainfuckCstChildren, param?: IN): OUT;
  right(children: RightCstChildren, param?: IN): OUT;
  left(children: LeftCstChildren, param?: IN): OUT;
  add(children: AddCstChildren, param?: IN): OUT;
  sub(children: SubCstChildren, param?: IN): OUT;
  loop(children: LoopCstChildren, param?: IN): OUT;
  command(children: CommandCstChildren, param?: IN): OUT;
}
