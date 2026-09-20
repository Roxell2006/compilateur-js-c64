import { describe, it, expect } from "vitest";
import { compileFile, compileJsToC64Outputs } from "../src/compiler.js";
import { Cpu6502 } from "./helpers/cpu6502.js";

describe("hires pixel addressing", () => {
  it("renders every lit pixel of natural-hires with its column's intended color", async () => {
    const result = await compileFile("examples/natural-hires.js");
    const cpu = new Cpu6502(result);
    const stop = Object.entries(result.symbols).find(([name]) => name.startsWith("wait_key_loop_"))[1];
    cpu.runUntil(c => c.pc === stop, 10000000);
    let pixels = 0;
    for (let y = 0; y < 200; y++) for (let x = 0; x < 320; x++) {
      const bitmap = 0x6000 + (y >> 3) * 320 + (x >> 3) * 8 + (y & 7);
      if (!(cpu.memory[bitmap] & (128 >> (x & 7)))) continue;
      const color = cpu.memory[0x5c00 + (y >> 3) * 40 + (x >> 3)];
      const ink = 1 + 2 * Math.floor((x - 20) / 60);
      if (color !== ink << 4) throw new Error(`Wrong color at (${x}, ${y}): ${color >> 4}, expected ${ink}`);
      pixels++;
    }
    expect(pixels).toBeGreaterThan(5000);
  });
  it("writes the bitmap and the correct color cell for every screen coordinate", async () => {
    const result = await compileJsToC64Outputs("c64.hires.point(0, 0, 1);");
    const cpu = new Cpu6502(result);
    cpu.memory.fill(6, 0x5c00, 0x6000);
    for (let y = 0; y < 200; y++) {
      for (let x = 0; x < 320; x++) {
        const bitmap = 0x6000 + (y >> 3) * 320 + (x >> 3) * 8 + (y & 7);
        const color = 0x5c00 + (y >> 3) * 40 + (x >> 3);
        const expected = cpu.memory[bitmap] | (128 >> (x & 7));
        cpu.memory[0xc73b] = x & 255;
        cpu.memory[0xc73e] = x >> 8;
        cpu.memory[0xc73c] = y;
        cpu.memory[0xc73d] = 0x70;
        cpu.writes.length = 0;
        cpu.call("hires_point_runtime");
        const writes = cpu.writes.filter(w => w.address >= 0x5c00 && w.address < 0x8000);
        if (writes.length !== 2 || writes[0].address !== bitmap || writes[0].value !== expected
          || writes[1].address !== color || writes[1].value !== 0x76) {
          throw new Error(`Incorrect hires writes at (${x}, ${y}): expected bitmap $${bitmap.toString(16)}, color $${color.toString(16)}; got ${JSON.stringify(writes)}`);
        }
      }
    }
    expect(cpu.memory[0x5fe7]).toBe(0x76);
  });
});
