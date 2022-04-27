import binaryen from 'binaryen';
import type { CstNode } from 'chevrotain';
import type { BrainfuckCstChildren, CommandCstChildren, ICstNodeVisitor, LoopCstChildren } from './cst';
import { getBaseCstVisitorConstructor } from './grammar';

type BinaryenModule = typeof binaryen['Module']['prototype'];

class BrainfuckCompiler extends getBaseCstVisitorConstructor() implements ICstNodeVisitor<BinaryenModule, any> {
  constructor(private readonly module: BinaryenModule) {
    super();
    // The "validateVisitor" method is a helper utility which performs static analysis
    // to detect missing or redundant visitor methods
    this.validateVisitor();
  }

  compile(cst: CstNode): WebAssembly.Module {
    this.module.setMemory(1, 1, 'memory');

    // Globals
    this.module.addGlobalImport('memorySize', 'imports', 'memorySize', binaryen.i32);
    this.module.addGlobal('dataPointer', binaryen.i32, true, this.module.i32.const(0));
    this.module.addGlobal('inputBuffer', binaryen.i32, true, this.module.i32.const(0));

    // Imported I/O functions
    this.module.addFunctionImport('output', 'imports', 'output', binaryen.i32, binaryen.none);
    this.module.addFunctionImport('input', 'imports', 'input', binaryen.none, binaryen.i32);

    // Main program body
    const body = this.module.block(null, [...this.visit(cst), this.module.return(this.dataPointer)]);

    // Export program in execute() function
    this.module.addFunction('execute', binaryen.none, binaryen.i32, [binaryen.i32], body);
    this.module.addFunctionExport('execute', 'execute');

    // Optimize the module using default passes and levels
    this.module.optimize();

    // Validate the module
    if (!this.module.validate()) throw new Error('validation error');

    // Generate WebAssembly module from binary
    return new WebAssembly.Module(this.module.emitBinary());
  }

  brainfuck(ctx: BrainfuckCstChildren) {
    return (ctx.command ?? []).map((node) => this.visit(node));
  }

  loop(ctx: LoopCstChildren) {
    // Labels for branching
    const breakLabel = `break:${ctx.LSquare[0]?.startOffset}`;
    const continueLabel = `continue:${ctx.LSquare[0]?.startOffset}`;

    return this.module.loop(
      continueLabel,
      this.module.block(breakLabel, [
        // Break out of the loop if the data cell is equal to 0
        this.module.br(breakLabel, this.module.i32.eq(this.dataValue, this.module.i32.const(0))),

        // Loop body commands
        ...(ctx.command ?? []).map((node) => this.visit(node)),

        // Go back to the top of the loop
        this.module.br(continueLabel),
      ])
    );
  }

  command(ctx: CommandCstChildren) {
    if (ctx.loop) {
      return this.visit(ctx.loop);
    } else if (ctx.LAngle) {
      return this.addToDataPointer(-1);
    } else if (ctx.RAngle) {
      return this.addToDataPointer(1);
    } else if (ctx.Plus) {
      return this.addToDataValue(1);
    } else if (ctx.Minus) {
      return this.addToDataValue(-1);
    } else if (ctx.Period) {
      return this.write();
    } else if (ctx.Comma) {
      return this.read();
    } else {
      throw new Error('Unknown command');
    }
  }

  private get memorySize() {
    return this.module.global.get('memorySize', binaryen.i32);
  }

  private get dataPointer() {
    return this.module.global.get('dataPointer', binaryen.i32);
  }

  private get dataValue() {
    return this.module.i32.load8_u(0, 0, this.dataPointer);
  }

  private addToDataPointer(value: number) {
    // Wrap pointer at boundaries
    const result = this.module.i32.rem_u(
      this.module.i32.add(this.dataPointer, this.module.i32.const(value)),
      this.memorySize
    );
    return this.module.global.set('dataPointer', result);
  }

  private addToDataValue(value: number) {
    const result = this.module.i32.add(this.dataValue, this.module.i32.const(value));
    return this.module.i32.store8(0, 0, this.dataPointer, result);
  }

  private write() {
    return this.module.call('output', [this.dataValue], binaryen.none);
  }

  private read() {
    return this.module.block(null, [
      // Temporarily store input in global variable
      this.module.global.set('inputBuffer', this.module.call('input', [], binaryen.i32)),
      // Handle EOF conditions by writing the input to memory if and only if it's greater than zero
      this.module.if(
        this.module.i32.ge_s(this.module.global.get('inputBuffer', binaryen.i32), this.module.i32.const(0)),
        this.module.i32.store8(0, 0, this.dataPointer, this.module.global.get('inputBuffer', binaryen.i32))
      ),
    ]);
  }
}

export function compileBrainfuck(cst: CstNode) {
  const compiler = new BrainfuckCompiler(new binaryen.Module());
  return compiler.compile(cst);
}
