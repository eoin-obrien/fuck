import { parseBrainfuck } from '../src/grammar';

describe('parseJson', () => {
  it('parses Brainfuck', () => {
    expect(() =>
      parseBrainfuck(
        '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'
      )
    ).not.toThrow();
  });

  it('accepts non-Brainfuck characters as comments', () => {
    expect(() => parseBrainfuck('this is a comment')).not.toThrow();
  });
});
