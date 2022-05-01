# Fuck

Do you want to write blazing-fast WebAssembly code in a practially useless esoteric programming language?
Do you enjoy overcomplicating everything for bragging rights?
Are you a connoisseur of profanity-laden tech?
If any of those are true, then `fuck` is the Brainfuck-to-WebAssembly compiler for you!

## Usage

```shell
$ npm install fuck
```

```nodejs
import {Brainfuck} from 'fuck';

const program = new Brainfuck(`
		++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]
    >>.>---.+++++++..+++.>>.<-.<.+++.------.--------.
    >>+.>++.
	`);

const result = program.execute();
console.log(result.output) // 'Hello World!\n'
```

## Publishing to NPM

We recommend using [np](https://github.com/sindresorhus/np).
