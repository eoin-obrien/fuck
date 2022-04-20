// The entry file of your WebAssembly module.

import { Interpreter } from "./interpreter";

export function execute(code: string, input: string): string {
  const interpreter = new Interpreter(code);

  console.time();
  const result = interpreter.execute(input);
  console.timeEnd();

  return result;
}
