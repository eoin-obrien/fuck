import { generateCstDts } from 'chevrotain';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { productions } from '../src/grammar';

const dtsString = generateCstDts(productions);
const dtsPath = resolve(__dirname, '..', 'src', 'cst.d.ts');
writeFileSync(dtsPath, dtsString);
