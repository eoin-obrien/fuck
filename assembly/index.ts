// The entry file of your WebAssembly module.

export { interpret } from "./interpreter";
export { Opcode, instructionByteLength } from "./bytecode";
