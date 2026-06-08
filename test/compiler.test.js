import { describe, expect, it } from "vitest";
import { Assembler6502, abs, imm, rel, exportBasicData } from "../src/assembler6502.js";
import { createBasicSysStub } from "../src/basicStub.js";
import { compileFile, compileInstructions } from "../src/compiler.js";
import { createPrg } from "../src/prgWriter.js";

describe("assembler opcodes", () => {
  it("emits key opcodes correctly", () => {
    const asm = new Assembler6502(0x0810);
    asm.lda(imm(0x42));
    asm.sta(abs(0xd020));
    asm.jsr(abs(0xffd2));
    asm.rts();
    expect(Array.from(asm.toBytes())).toEqual([
      0xa9, 0x42,
      0x8d, 0x20, 0xd0,
      0x20, 0xd2, 0xff,
      0x60
    ]);
  });

  it("resolves forward and backward labels", () => {
    const asm = new Assembler6502(0x0810);
    asm.jmp(abs("after"));
    asm.label("loop");
    asm.inx();
    asm.bne(rel("loop"));
    asm.label("after");
    asm.rts();
    const bytes = Array.from(asm.toBytes());
    expect(bytes.slice(0, 3)).toEqual([0x4c, 0x16, 0x08]);
    expect(bytes[5]).toBe(0xfd);
  });

  it("throws for out of range relative branches", () => {
    const asm = new Assembler6502(0x0810);
    asm.label("start");
    for (let i = 0; i < 130; i += 1) {
      asm.nop();
    }
    asm.bne(rel("start"));
    expect(() => asm.toBytes()).toThrow(/out of range/i);
  });
});

describe("writers", () => {
  it("creates PRG header at $0801", () => {
    const prg = createPrg(Uint8Array.from([0x60]));
    expect(Array.from(prg.slice(0, 2))).toEqual([0x01, 0x08]);
  });

  it("creates BASIC SYS 2064 stub", () => {
    const stub = createBasicSysStub(2064);
    expect(Array.from(stub.slice(0, 11))).toEqual([
      0x0c, 0x08,
      0x0a, 0x00,
      0x9e, 0x20, 0x32, 0x30, 0x36, 0x34, 0x00
    ]);
  });

  it("exports BASIC DATA lines", () => {
    expect(exportBasicData(Uint8Array.from([169, 1, 141, 32, 208, 96]), 100, 10, 8))
      .toBe("100 DATA 169,1,141,32,208,96");
  });
});

describe("string-backed text output", () => {
  it("compiles print() using a string loop and pooled data", () => {
    const result = compileInstructions([
      { op: "print", args: ["HELLO"] }
    ]);

    expect(result.asm).toMatch(/LDX #\$00/);
    expect(result.asm).toMatch(/LDA str_petscii_0,X/);
    expect(result.asm).toMatch(/JSR \$FFD2/);
    expect(result.asm).toMatch(/str_petscii_0:/);
    expect(result.asm).toMatch(/\.byte/);
  });

  it("reuses the same pooled screen string for repeated printAt()", () => {
    const result = compileInstructions([
      { op: "printAt", args: [0, 0, "HI", 1] },
      { op: "printAt", args: [0, 1, "HI", 1] }
    ]);

    const matches = result.asm.match(/str_screen_0:/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(result.asm).toMatch(/LDA str_screen_0,X/);
  });
});

describe("irq raster", () => {
  it("generates raster vector writes", () => {
    const result = compileInstructions([
      { op: "irqDisableKernalTimer", args: [] },
      { op: "irqInstall", args: [] }
    ], {
      irqHandlers: [
        { line: 50, instructions: [{ op: "borderColor", args: [2] }] },
        { line: 150, instructions: [{ op: "borderColor", args: [6] }] }
      ]
    });

    const bytes = Array.from(result.bytes);
    expect(bytes).toContain(0x78);
    expect(bytes).toContain(0x8d);
    expect(result.symbols.irq_dispatch).toBeGreaterThan(0x0810);
    expect(result.asm).toMatch(/STA \$C0FE/);
  });

  it("compiles raster-bars example without error", async () => {
    const result = await compileFile("examples/raster-bars.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.symbols.irq_dispatch).toBeDefined();
    expect(result.asm).toMatch(/JMP \$EA31/);
  });

  it("compiles ready-safe raster border cycle example with kernal chaining", async () => {
    const result = await compileFile("examples/raster-ready-border-cycle.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/STA \$C000/);
    expect(result.asm).toMatch(/JMP \$EA31/);
  });

  it("compiles vice showcase example using rasterLoop", async () => {
    const result = await compileFile("examples/vice-showcase.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/STA \$C001/);
    expect(result.asm).toMatch(/STA \$D020/);
    expect(result.asm).toMatch(/STA \$D021/);
    expect(result.asm).toMatch(/JMP \$EA31/);
  });

  it("compiles sprite-basic with balloon sprite data", async () => {
    const result = await compileFile("examples/sprite-basic.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.symbols.balloon_sprite_data).toBeDefined();
    expect(result.asm).toMatch(/LDX #\$00/);
    expect(result.asm).toMatch(/LDA balloon_sprite_data,X/);
    expect(result.asm).toMatch(/STA \$2000,X/);
  });
});
