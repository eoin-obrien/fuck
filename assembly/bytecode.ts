export class Instruction {
  static RIGHT: u8 = 0;
  static LEFT: u8 = 1;
  static ADD: u8 = 2;
  static SUB: u8 = 3;
  static OUTPUT: u8 = 4;
  static INPUT: u8 = 5;
  static OPEN: u8 = 6;
  static CLOSE: u8 = 7;

  constructor(public op: u8, public arg: i32 = 0) {}
}
