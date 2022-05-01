import {mkdirSync, writeFileSync} from 'node:fs';
import path, {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {generateCstDts} from 'chevrotain';
import {productions} from '../src/grammar.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const generatedTypesPath = resolve(__dirname, '..', 'types', '@generated');
mkdirSync(generatedTypesPath, {recursive: true});

const dtsString = generateCstDts(productions);
const dtsPath = resolve(generatedTypesPath, 'cst.d.ts');
writeFileSync(dtsPath, dtsString);
