import { suite, add, cycle, complete, save } from "benny";
import fs, { opendirSync, readFileSync } from "node:fs";
import { run } from "../index.js";
import Brainfuck from 'brainfuck-node';

const brainfuckJs = new Brainfuck({ maxSteps: -1 });

const hello = readFileSync("./examples/long.b").toString();

suite(
  "Example",

  add("wasm", () => {
    run(hello, "");
  }),

  // add("js", () => {
  //   brainfuckJs.execute(hello, "");
  // }),

  cycle(),
  complete(),
  save({ file: "reduce", version: "1.0.0" }),
  save({ file: "reduce", format: "chart.html" })
);
