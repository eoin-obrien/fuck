import { MismatchedTokenException, NotAllInputParsedException } from 'chevrotain';
import { BrainfuckProgram, EOFBehavior } from '../src';

// Test cases sourced from http://brainfuck.org/tests.b

describe('compileBrainfuck', () => {
  test('hello world', () => {
    const program = new BrainfuckProgram(
      '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'
    );
    expect(program.execute().output).toBe('Hello World!\n');
  });

  test('EOF -> no change', () => {
    const program = new BrainfuckProgram('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
      eofBehavior: EOFBehavior.NoChange,
    });
    expect(program.execute('\n').output).toBe('LK\nLK\n');
  });

  test('EOF -> set 0', () => {
    const program = new BrainfuckProgram('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
      eofBehavior: EOFBehavior.SetZero,
    });
    expect(program.execute('\n').output).toBe('LB\nLB\n');
  });

  test('EOF -> set 255', () => {
    const program = new BrainfuckProgram('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
      eofBehavior: EOFBehavior.SetAllBits,
    });
    expect(program.execute('\n').output).toBe('LA\nLA\n');
  });

  test('memory size', () => {
    const program = new BrainfuckProgram(
      '++++[>++++++<-]>[>+++++>+++++++<<-]>>++++<[[>[[>>+<<-]<]>>>-]>-[>+>+<<-]>]+++++[>+++++++<<++>-]>.<<.'
    );
    expect(program.execute('\n').output).toBe('#\n');
  });

  test('obscure issues', () => {
    const program = new BrainfuckProgram(
      '[]++++++++++[>>+>+>++++++[<<+<+++>>>-]<<<<-]"A*$";?@![#>>+<<]>[>>]<<<<[>++<[-]]>.>.'
    );
    expect(program.execute('\n').output).toBe('H\n');
  });

  test('rot13', () => {
    const program = new BrainfuckProgram(`
      ,
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>++++++++++++++<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>>+++++[<----->-]<<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>++++++++++++++<-
      [>+<-[>+<-[>+<-[>+<-[>+<-
      [>++++++++++++++<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>>+++++[<----->-]<<-
      [>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-[>+<-
      [>++++++++++++++<-
      [>+<-]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]
      ]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]]>.[-]<,]
    `);
    expect(program.execute('~mlk zyx').output).toBe('~zyx mlk');
  });

  test('unmatched left square bracket', () => {
    expect(() => new BrainfuckProgram('+++++[>+++++++>++<<-]>.>.[')).toThrow(MismatchedTokenException);
  });

  test('unmatched right square bracket', () => {
    expect(() => new BrainfuckProgram('+++++[>+++++++>++<<-]>.>.][')).toThrow(NotAllInputParsedException);
  });
});
