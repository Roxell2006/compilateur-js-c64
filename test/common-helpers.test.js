import { describe, it, expect } from "vitest";
import { compileJsToC64Outputs } from "../src/compiler.js";
import { Cpu6502 } from "./helpers/cpu6502.js";

async function execute(source, options = {}) {
  const result = await compileJsToC64Outputs(`"use c64"; ${source}`, options);
  const cpu = new Cpu6502(result);
  cpu.push(255); cpu.push(254);
  cpu.runUntil(c => c.pc === 65535, 2000000);
  return { result, cpu };
}

describe("common program helpers", () => {
  it("expands screen setup and game.run to the same bytes as explicit legacy calls", async () => {
    const short = await compileJsToC64Outputs(`
      c64.game.run({ init: () => c64.screen.setup({ background: 6, border: 2, color: 7 }),
        update: () => c64.borderColor(3) }, { hz: "video", rasterLine: 230 });
    `);
    const explicit = await compileJsToC64Outputs(`
      c64.game.init(() => {
        c64.borderColor(2); c64.backgroundColor(6); c64.textColor(7);
        c64.hires.disabled(); c64.clearScreen();
      });
      c64.game.frame(() => c64.borderColor(3), { hz: "video", rasterLine: 230 });
    `);
    expect(short.bytes).toEqual(explicit.bytes);
  });

  it("uses runtime colors and preserves implicit text color across shared functions", async () => {
    const { cpu } = await execute(`
      function label(row) { c64.printAt(0, row, "OK"); }
      let ink = 7;
      c64.screen.setup({ clear: false, color: ink, border: ink });
      label(0);
      ink = 3;
      c64.screen.setup({ clear: false, color: ink });
      label(1);
    `);
    expect(cpu.memory[0xd800]).toBe(7);
    expect(cpu.memory[0xd828]).toBe(3);
    expect(cpu.memory[0xd020]).toBe(0);
  });

  it.each([1, 255, 256])("fills byte and word arrays of length %i without touching neighbours", async length => {
    const { result, cpu } = await execute(`
      const bytes = new Uint8Array(${length});
      const words = new Uint16Array(${length});
      const guard = new Uint8Array([123]);
      let ink = 9;
      let value = c64.word(45678);
      bytes.fill(ink);
      words.fill(value);
    `);
    const base = result.symbols.__js_array_0;
    const low = result.symbols.__js_array_1;
    const high = result.symbols.__js_array_1_hi;
    expect(Array.from(cpu.memory.slice(base, base + length))).toEqual(Array(length).fill(9));
    expect(Array.from(cpu.memory.slice(low, low + length))).toEqual(Array(length).fill(45678 & 255));
    expect(Array.from(cpu.memory.slice(high, high + length))).toEqual(Array(length).fill(45678 >> 8));
    expect(cpu.memory[result.symbols.__js_array_2]).toBe(123);
    expect(cpu.cycles).toBeLessThan(3 * length * 11 + 100);
  });

  it("fills through array parameters, returns the array and emits less work than an indexed loop", async () => {
    const source = `const cells = new Uint8Array(16);`;
    const fast = await execute(source + `function reset(board) { board.fill(4).fill(2); } reset(cells);`);
    const slow = await execute(source + `for (let i = 0; i < cells.length; i++) cells[i] = 2;`, { naturalOptimizations: false });
    expect(fast.cpu.memory.slice(fast.result.symbols.__js_array_0, fast.result.symbols.__js_array_0 + 16)).toEqual(new Uint8Array(16).fill(2));
    // Even two fills and a function call cost less than one checked JS loop.
    expect(fast.cpu.cycles).toBeLessThan(slow.cpu.cycles);
  });

  it("expands joystick scrolling without an additional runtime abstraction", async () => {
    const map = { charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 16, height: 12, data: Array(192).fill(0) } };
    const prefix = `"use c64";
      const map = c64.assets.defineMap(${JSON.stringify(map)});
      const camera = c64.map.scroller(map, { width: 8, height: 6, x: 1, y: 0, panel: "bottom" });
      const joy = c64.input.joystick(2);
      let speed = 3;
    `;
    const short = await compileJsToC64Outputs(prefix + `c64.game.frame(() => joy.scroll(camera, speed));`);
    const explicit = await compileJsToC64Outputs(prefix + `c64.game.frame(() => {
      if (joy.left()) camera.left(speed);
      if (joy.right()) camera.right(speed);
      if (joy.up()) camera.up(speed);
      if (joy.down()) camera.down(speed);
    });`);
    expect(short.bytes).toEqual(explicit.bytes);
  });

  it.each([
    'c64.game.run({});',
    'c64.screen.setup({ mode: "unknown" });',
    'c64.screen.setup({ clear: 1 });',
    'const a = new Uint8Array(2); a.fill(256);',
    'const a = new Uint8Array(2); a.fill(-1);',
    'const a = new Uint8Array(2); a.fill(1, 0, 1);',
    'const joy = c64.input.joystick(2); joy.scroll({});',
  ])("rejects unsupported helper usage: %s", async source => {
    await expect(compileJsToC64Outputs(`"use c64"; ${source}`)).rejects.toThrow();
  });
});
