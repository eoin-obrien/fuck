import { parseBrainfuck } from '../src/grammar';
import { printBrainfuck } from '../src/printer';

const helloWorld =
  '++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.';

describe('printBrainfuck', () => {
  it('prints Brainfuck source from a CST', () => {
    const cst = parseBrainfuck(helloWorld);
    expect(printBrainfuck(cst)).toBe(helloWorld);
  });
});
