import fs from 'node:fs';
import path from 'node:path';
import {Benchmark, Suite} from '@jonahsnider/benchmark';
import {Brainfuck} from '../dist/index.js';

const examplesDir = './examples';

// 1. Create benchmark
const benchmark = new Benchmark();

// 2. Create suite(s)
const concatenation = new Suite('concatenation', {
	run: {
		// Run benchmark for 3000ms
		durationMs: 3000,
	},
	warmup: {},
});

// 3. Register tests
for (const file of fs.readdirSync(examplesDir)) {
	const code = fs.readFileSync(path.join(examplesDir, file)).toString();
	concatenation.addTest(file, () => {
		new Brainfuck(code).execute();
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
