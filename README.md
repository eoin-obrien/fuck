# Fuck

Do you want to write blazing-fast WebAssembly code in a practially useless esoteric programming language?
Do you enjoy overcomplicating everything for bragging rights?
Are you a connoisseur of profanity-laden tech?
If any of those are true, then `fuck` is the Brainfuck-to-WebAssembly compiler for you!

## Usage

```shell
$ npm install fuck
```

```javascript
import { Brainfuck } from "fuck";

const program = new Brainfuck(`
		++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]
    >>.>---.+++++++..+++.>>.<-.<.+++.------.--------.
    >>+.>++.
	`);

const result = program.execute("input");
console.log(result.output); // 'Hello World!\n'
```

## Brainfuck

[Brainfuck](https://esolangs.org/wiki/Brainfuck) operates on an array of 30,000 8-bit memory cells by default.
A data pointer, initially set to `0`, keeps track of what cell to operate on.

| Command | Description                                                                       |
| ------- | --------------------------------------------------------------------------------- |
| `>`     | Increment the data pointer                                                        |
| `<`     | Decrement the data pointer                                                        |
| `+`     | Increment the byte at the data pointer                                            |
| `-`     | Decrement the byte at the data pointer                                            |
| `.`     | Output the byte at the data pointer as a character                                |
| `,`     | Input a character and store it in the byte at the data pointer                    |
| `[`     | Jump to instruction after the matching `]` if the byte at the data pointer is `0` |
| `]`     | Jump back to the matching `[` if the byte at the data pointer is not `0`.         |

All characters other than `><+-.,[]` are considered comments and are ignored.

## Customization

`fuck` uses 30,000 memory cells by default, but this can be customized at compile time.
When the data pointer is moved out of range, it wraps back around to the other side of the array.

```javascript
const program = new Brainfuck("+.>+.", { memorySize: 100_000 });
```

End-of-file conditions aren't handled consistently in Brainfuck implementations.
By default, EOF input is a no-op, leaving the memory cell unchanged.
For flexibility, `fuck` allows EOF behavior to be set at compile time to map EOF to `0` or `255`.

```javascript
import { EofBehavior } from "fuck";
const program = new Brainfuck("+.>+.", { eofBehavior: EofBehavior.SetZero });
```

## Roadmap

- [x] Brainfuck-to-WebAssembly compiler
- [ ] Compiler optimizations
- [ ] Compiler CLI
- [ ] Syntax highlighter

## Publishing to NPM

We recommend using [np](https://github.com/sindresorhus/np).
