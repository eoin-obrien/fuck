import test from 'ava';
import {MismatchedTokenException, NotAllInputParsedException} from 'chevrotain';
import {EofBehavior} from '../src/compiler.js';
import {Brainfuck} from '../src/index.js';

// Test cases sourced from http://brainfuck.org/tests.b

test('executes hello.b', t => {
	const program = new Brainfuck(
		'++++++++[>++++[>++>+++>+++>+<<<<-]>+>+>->>+[<]<-]>>.>---.+++++++..+++.>>.<-.<.+++.------.--------.>>+.>++.',
	);
	t.is(program.execute().output, 'Hello World!\n');
});

test('executes complex hello.b', t => {
	const program = new Brainfuck(`
		>++++++++[-<+++++++++>]<.>>+>-[+]++>++>+++[>[->+++<<+++>]<<]>-----.>->
    +++..+++.>-.<<+[>[+>+]>>]<--------------.>>.+++.------.--------.>+.>+.
	`);
	t.is(program.execute().output, 'Hello World!\n');
});

test('can handle EOF as a no-op', t => {
	const program = new Brainfuck('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
		eofBehavior: EofBehavior.NoChange,
	});
	t.is(program.execute('\n').output, 'LK\nLK\n');
});

test('can handle EOF as zero', t => {
	const program = new Brainfuck('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
		eofBehavior: EofBehavior.SetZero,
	});
	t.is(program.execute('\n').output, 'LB\nLB\n');
});

test('can handle EOF as 255', t => {
	const program = new Brainfuck('>,>+++++++++,>+++++++++++[<++++++<++++++<+>>>-]<<.>.<<-.>.>.<<.', {
		eofBehavior: EofBehavior.SetAllBits,
	});
	t.is(program.execute('\n').output, 'LA\nLA\n');
});

test('has sufficient memory size', t => {
	const program = new Brainfuck(
		'++++[>++++++<-]>[>+++++>+++++++<<-]>>++++<[[>[[>>+<<-]<]>>>-]>-[>+>+<<-]>]+++++[>+++++++<<++>-]>.<<.',
	);
	t.is(program.execute().output, '#\n');
});

test('has no obscure issues', t => {
	const program = new Brainfuck('[]++++++++++[>>+>+>++++++[<<+<+++>>>-]<<<<-]"A*$";?@![#>>+<<]>[>>]<<<<[>++<[-]]>.>.');
	t.is(program.execute().output, 'H\n');
});

test('executes rot13.b', t => {
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
	t.is(program.execute('~mlk zyx').output, '~zyx mlk');
});

test('catches an unmatched left square bracket', t => {
	t.throws(() => new Brainfuck('+++++[>+++++++>++<<-]>.>.['), {instanceOf: MismatchedTokenException});
});

test('catches an unmatched right square bracket', t => {
	t.throws(() => new Brainfuck('+++++[>+++++++>++<<-]>.>.]['), {instanceOf: NotAllInputParsedException});
});

