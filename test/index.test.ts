import { Brainfuck } from '../src';
import { EOFBehavior } from '../src/compiler';

// Test cases sourced from http://brainfuck.org/tests.b

describe('Brainfuck', () => {
  test('hello world', () => {
    const program = new Brainfuck(
      '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'
    );
    expect(program.execute().output).toBe('Hello World!\n');
  });

  test('EOF -> no change', () => {
    const program = new Brainfuck('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
      eofBehavior: EOFBehavior.NoChange,
    });
    expect(program.execute('\n').output).toBe('LK\nLK\n');
  });

  test('EOF -> set 0', () => {
    const program = new Brainfuck('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
      eofBehavior: EOFBehavior.SetZero,
    });
    expect(program.execute('\n').output).toBe('LB\nLB\n');
  });

  test('EOF -> set 255', () => {
    const program = new Brainfuck('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
      eofBehavior: EOFBehavior.SetAllBits,
    });
    expect(program.execute('\n').output).toBe('LA\nLA\n');
  });

  test('memory size', () => {
    const program = new Brainfuck(
      '++++[>++++++<-]>[>+++++>+++++++<<-]>>++++<[[>[[>>+<<-]<]>>>-]>-[>+>+<<-]>]+++++[>+++++++<<++>-]>.<<.'
    );
    expect(program.execute().output).toBe('#\n');
  });

  test('obscure issues', () => {
    const program = new Brainfuck(
      '[]++++++++++[>>+>+>++++++[<<+<+++>>>-]<<<<-]"A*$";?@![#>>+<<]>[>>]<<<<[>++<[-]]>.>.'
    );
    expect(program.execute().output).toBe('H\n');
  });

  test('rot13', () => {
    const program = new Brainfuck(`
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
});
