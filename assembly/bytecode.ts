export const instructionByteLength = 2;

export enum Opcode {
  ExtendedArg,
  Left,
  Right,
  Add,
  Sub,
  Output,
  Input,
  Open,
  Close,
  Clear,
}
