import { MismatchedTokenException, NotAllInputParsedException } from 'chevrotain';
import { BrainfuckProgram } from '../src';

// Test cases sourced from http://brainfuck.org/tests.b

describe('compileBrainfuck', () => {
  test('hello world', () => {
    const program = new BrainfuckProgram(
      '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'
    );
    expect(program.execute()).toBe('Hello World!\n');
  });

  test('i/o', () => {
    const program = new BrainfuckProgram('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.');
    expect(program.execute('\n')).toBe('LK\nLK\n');
  });

  test('memory size', () => {
    const program = new BrainfuckProgram(
      '++++[>++++++<-]>[>+++++>+++++++<<-]>>++++<[[>[[>>+<<-]<]>>>-]>-[>+>+<<-]>]+++++[>+++++++<<++>-]>.<<.'
    );
    expect(program.execute('\n')).toBe('#\n');
  });

  test('obscure issues', () => {
    const program = new BrainfuckProgram(
      '[]++++++++++[>>+>+>++++++[<<+<+++>>>-]<<<<-]"A*$";?@![#>>+<<]>[>>]<<<<[>++<[-]]>.>.'
    );
    expect(program.execute('\n')).toBe('H\n');
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
    expect(program.execute('~mlk zyx')).toBe('~zyx mlk');
  });

  test('unmatched left square bracket', () => {
    expect(() => new BrainfuckProgram('+++++[>+++++++>++<<-]>.>.[')).toThrow(MismatchedTokenException);
  });

  test('unmatched right square bracket', () => {
    expect(() => new BrainfuckProgram('+++++[>+++++++>++<<-]>.>.][')).toThrow(NotAllInputParsedException);
  });
});
