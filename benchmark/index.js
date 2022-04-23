import Brainfuck from "brainfuck-node";
import fs from "node:fs";
import path from "node:path";
import { run } from "../index.js";

const brainfuckJs = new Brainfuck({ maxSteps: -1 });

const exampleDir = "examples";
const files = fs.readdirSync("examples").map((file) => ({
  name: file,
  code: fs.readFileSync(path.join(exampleDir, file)).toString(),
}));

for (const file of files) {
  console.time(file.name);
  run(file.code, "");
  console.timeEnd(file.name);
}
