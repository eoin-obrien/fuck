import fs from 'node:fs';
import {Benchmark, Suite} from '@jonahsnider/benchmark';
import glob from 'glob';
import {Brainfuck} from '../dist/index.js';

// 1. Create benchmark
const benchmark = new Benchmark();

// 2. Create suite(s)
const concatenation = new Suite('concatenation', {
	run: {
		trials: 1,
	},
	warmup: {},
});

// 3. Register tests
for (const file of glob.sync('examples/*.b')) {
	const code = fs.readFileSync(file).toString();
	const program = new Brainfuck(code);
	const inputFile = `${file}.in`;
	const input = fs.existsSync(inputFile) ? fs.readFileSync(inputFile).toString() : '';
	concatenation.addTest(file, () => {
		program.execute(input);
	});
}

benchmark.addSuite(concatenation);

// 4. Run benchmark
benchmark.runSuites().then(results => {
	for (const suiteResults of results.values()) {
		for (const [testName, testResults] of suiteResults.entries()) {
			console.log(`${testName}: ${(testResults.mean / 1_000_000).toFixed(3)} ms`);
		}
	}
});
