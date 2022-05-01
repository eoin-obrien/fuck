/* eslint-disable new-cap, @typescript-eslint/naming-convention */
import {createToken, CstNode, CstParser, Lexer, Rule} from 'chevrotain';

const LAngle = createToken({name: 'LAngle', pattern: /</});
const RAngle = createToken({name: 'RAngle', pattern: />/});
const Plus = createToken({name: 'Plus', pattern: /\+/});
const Minus = createToken({name: 'Minus', pattern: /-/});
const Period = createToken({name: 'Period', pattern: /\./});
const Comma = createToken({name: 'Comma', pattern: /,/});
const LSquare = createToken({name: 'LSquare', pattern: /\[/});
const RSquare = createToken({name: 'RSquare', pattern: /]/});
const Comment = createToken({
	name: 'Comment',
	pattern: /[^<>+\-.,[\]]+/,
	group: Lexer.SKIPPED,
});

const allTokens = [LAngle, RAngle, Plus, Minus, Period, Comma, LSquare, RSquare, Comment];
const lexer = new Lexer(allTokens);

class BrainfuckParser extends CstParser {
	// In TypeScript the parsing rules are explicitly defined as class instance properties
	// This allows for using access control (public/private/protected) and more importantly "informs" the TypeScript compiler
	// about the API of our Parser, so referencing an invalid rule name (this.SUBRULE(this.oopsType);)
	// is now a TypeScript compilation error.
	public brainfuck = this.RULE('brainfuck', () => {
		this.MANY(() => {
			this.SUBRULE(this.command);
		});
	});

	private readonly loop = this.RULE('loop', () => {
		this.CONSUME(LSquare);
		this.MANY(() => {
			this.SUBRULE(this.command);
		});
		this.CONSUME(RSquare);
	});

	private readonly command = this.RULE('command', () => {
		this.OR([
			{ALT: () => this.CONSUME(LAngle)},
			{ALT: () => this.CONSUME(RAngle)},
			{ALT: () => this.CONSUME(Plus)},
			{ALT: () => this.CONSUME(Minus)},
			{ALT: () => this.CONSUME(Period)},
			{ALT: () => this.CONSUME(Comma)},
			{ALT: () => this.SUBRULE(this.loop)},
		]);
	});

	constructor() {
		super(allTokens);
		this.performSelfAnalysis();
	}
}

// Reuse the same parser instance.
export const parser = new BrainfuckParser();

export const productions: Record<string, Rule> = parser.getGAstProductions();

export function parseBrainfuck(text: string): CstNode {
	const lexResult = lexer.tokenize(text);
	if (lexResult.errors.length > 0) {
		/* eslint-disable-next-line @typescript-eslint/no-throw-literal */
		throw lexResult.errors[0];
	}

	// Setting a new input will RESET the parser instance's state.
	parser.input = lexResult.tokens;
	const cst = parser.brainfuck();
	if (parser.errors.length > 0) {
		/* eslint-disable-next-line @typescript-eslint/no-throw-literal */
		throw parser.errors[0];
	}

	// This is a pure grammar, the value will be undefined until we add embedded actions
	// or enable automatic CST creation.
	return cst;
}
