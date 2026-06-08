export type Operand =
  | { mode: "imm" | "zp" | "zpx" | "zpy" | "abs" | "absx" | "absy" | "ind" | "indx" | "indy" | "rel" | "acc" | "impl"; value?: number | string }
  | number
  | string
  | null;

export interface CompileResult {
  origin: number;
  bytes: Uint8Array;
  asm: string;
  listing: string;
  symbols: Record<string, number>;
  data: string;
  basicProgram: string;
}

export declare class Assembler6502 {
  constructor(origin?: number);
  label(name: string): this;
  comment(text: string): this;
  emit(mnemonic: string, operand?: Operand): this;
  toBytes(): Uint8Array;
  toAsm(): string;
  toListing(): string;
  getSymbolTable(): Record<string, number>;
}

export declare function compileFile(inputFile: string, options?: { codeStart?: number; sysAddress?: number }): Promise<CompileResult>;
export declare function compileInstructions(instructions: Array<{ op: string; args?: any[] }>, options?: { codeStart?: number; sysAddress?: number }): CompileResult;
export declare function createPrg(machineCode: Uint8Array, sysAddress?: number): Uint8Array;
export declare function createBasicSysStub(sysAddress?: number): Uint8Array;
export declare function exportBasicData(bytes: ArrayLike<number>, startLine?: number, step?: number, chunkSize?: number): string;
export declare const c64: any;
export declare function imm(value: number): Operand;
export declare function immLo(value: number | string): Operand;
export declare function immHi(value: number | string): Operand;
export declare function zp(value: number | string): Operand;
export declare function zpx(value: number | string): Operand;
export declare function zpy(value: number | string): Operand;
export declare function abs(value: number | string): Operand;
export declare function absx(value: number | string): Operand;
export declare function absy(value: number | string): Operand;
export declare function ind(value: number | string): Operand;
export declare function indx(value: number | string): Operand;
export declare function indy(value: number | string): Operand;
export declare function rel(value: number | string): Operand;
export declare function acc(): Operand;
export declare function impl(): Operand;
