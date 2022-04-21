// The entry file of your WebAssembly module.

import { Interpreter } from "./interpreter";

export function execute(code: Uint8Array, input: string): string {
  const interpreter = new Interpreter();

  console.log(`${Date.now()}`);

  console.time();
  const result = interpreter.execute(code, input);
  console.timeEnd();

  return result;
}
