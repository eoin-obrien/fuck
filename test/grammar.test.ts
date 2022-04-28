import { MismatchedTokenException, NotAllInputParsedException } from 'chevrotain';
import { parseBrainfuck } from '../src/grammar';

describe('parseJson', () => {
  it('parses Brainfuck', () => {
    expect(() =>
      parseBrainfuck(
        '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.'
      )
    ).not.toThrow();
  });

  it('ignores non-Brainfuck characters', () => {
    expect(() => parseBrainfuck('this is a comment')).not.toThrow();
  });

  it('catches an unmatched left square bracket', () => {
    expect(() => parseBrainfuck('+++++[>+++++++>++<<-]>.>.[')).toThrow(MismatchedTokenException);
  });

  it('catches an unmatched right square bracket', () => {
    expect(() => parseBrainfuck('+++++[>+++++++>++<<-]>.>.][')).toThrow(NotAllInputParsedException);
  });
});
