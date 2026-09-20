import { describe, it, expect } from "vitest";
import { compileJsToC64Outputs } from "../src/compiler.js";
import { Cpu6502 } from "./helpers/cpu6502.js";

async function run(source, { natural = true, frame = false } = {}) {
  const result = await compileJsToC64Outputs(`${natural ? '"use c64";' : ''}\n${source}`);
  const cpu = new Cpu6502(result);
  cpu.push(0xff); cpu.push(0xfe);
  const line = () => Math.floor(cpu.cycles / 63) % 312;
  cpu.readHook = address => address === 0xd011 ? (line() >= 256 ? 0x9b : 0x1b)
    : address === 0xd012 ? line() & 255 : undefined;
  cpu.runUntil(c => c.pc === (frame ? result.symbols.game_frame_loop : 0xffff), 2000000);
  return { result, cpu };
}

const screenText = (cpu, x, y, length) => String.fromCharCode(...cpu.memory.slice(0x400 + y * 40 + x, 0x400 + y * 40 + x + length));

describe("calculated values across public APIs", () => {
  it.each(["rect", "fillRect", "circle", "fillCircle"])("renders dynamic hires %s identically to the constant path", async shape => {
    const dimensions = shape.includes("Rect") || shape === "rect" ? "w, h" : "r";
    const constants = shape.includes("Rect") || shape === "rect" ? "30, 12" : "9";
    const dynamic = await run(`
      let x = c64.word(260); let y = c64.word(60);
      let w = c64.word(30); let h = 12; let r = 9; let color = 7;
      c64.hires.${shape}(x, y, ${dimensions}, color);
    `);
    const fixed = await run(`c64.hires.${shape}(260, 60, ${constants}, 7);`, { natural: false });
    expect(dynamic.cpu.memory.slice(0x6000, 0x8000)).toEqual(fixed.cpu.memory.slice(0x6000, 0x8000));
    expect(dynamic.cpu.memory.slice(0x5c00, 0x5fe8)).toEqual(fixed.cpu.memory.slice(0x5c00, 0x5fe8));
  });

  it("skips invalid dynamic shapes without writing bitmap memory", async () => {
    const { cpu } = await run(`
      let x = c64.word(310); let y = 195; let size = 20;
      c64.hires.rect(x, y, size, size, 1);
      c64.hires.fillRect(x, y, size, size, 1);
      c64.hires.circle(x, y, size, 1);
      x = 0; y = 0; c64.hires.fillCircle(x, y, size, 1);
      size = 0; c64.hires.fillRect(x, y, size, size, 1);
    `);
    expect(cpu.writes.filter(w => w.address >= 0x6000 && w.address < 0x8000)).toHaveLength(0);
  });

  it("prints at runtime positions, snapshots text color and guards screen edges", async () => {
    const { cpu } = await run(`
      let x = c64.word(5); let y = c64.word(3); let color = 7;
      c64.textColor(color); color = 2;
      c64.printAt(x, y, "HELLO");
      c64.writeChar(x + 6, y, 81, color);
      x = 39; c64.printAt(x, y, "NO");
      y = 256; c64.writeChar(1, y, 99, color);
    `);
    expect([...cpu.memory.slice(0x400 + 125, 0x400 + 130)]).toEqual([8, 5, 12, 12, 15]);
    expect([...cpu.memory.slice(0xd800 + 125, 0xd800 + 130)]).toEqual([7, 7, 7, 7, 7]);
    expect(cpu.memory[0x400 + 131]).toBe(81);
    expect(cpu.memory[0xd800 + 131]).toBe(2);
    expect(cpu.memory[0x400 + 159]).toBe(0);
    expect(cpu.memory[0x401]).toBe(0);
  });

  it("resolves implicit text colors at execution time across branches and repeated functions", async () => {
    const { cpu } = await run(`
      function title() { c64.printAt(2, 2, "HI"); }
      title();
      let choose = true;
      if (choose) c64.textColor(7); else c64.textColor(2);
      title();
    `);
    expect(cpu.memory[0xd800 + 82]).toBe(7);
    expect(cpu.memory[0xd800 + 83]).toBe(7);
  });

  it.each(["fillRect", "drawFrame"])("renders dynamic text %s and prevents wrapped rectangles", async method => {
    const { cpu } = await run(`
      let x = 2; let y = 3; let w = 4; let h = 3; let ch = 81; let color = 5;
      c64.${method}(x, y, w, h, ch, color);
      x = 39; c64.${method}(x, y, w, h, 99, color);
      w = 0; c64.${method}(1, 1, w, h, ch, color);
    `);
    for (let row = 3; row < 6; row++) for (let col = 2; col < 6; col++) {
      const inside = method === "drawFrame" && row === 4 && col > 2 && col < 5;
      expect(cpu.memory[0x400 + row * 40 + col]).toBe(inside ? 0 : 81);
    }
    expect(cpu.memory[0x400 + 3 * 40 + 39]).toBe(0);
    expect(cpu.memory[0x400 + 41]).toBe(0);
  });

  it("converts 16-bit values once per call, shares conversion code and wraps decimal counters", async () => {
    const { result, cpu } = await run(`
      const score = c64.game.score({ digits: 3 });
      let value = c64.word(65535); let row = 4; let color = 7;
      c64.printNumber(2, row, value, { digits: 5, color: color });
      score.set(value); score.add(value); score.sub(71);
      score.draw(2, row + 1, { color: color });
      value = 999; score.sub(value); score.draw(2, row + 2);
    `);
    expect(screenText(cpu, 2, 4, 5)).toBe("65535");
    expect(screenText(cpu, 2, 5, 3)).toBe("999");
    expect(screenText(cpu, 2, 6, 3)).toBe("000");
    expect(result.asm.match(/^api_decimal_convert:/gm)).toHaveLength(1);
    expect(result.asm.match(/JSR api_decimal_convert/g)).toHaveLength(4);
    expect(cpu.cycles).toBeLessThan(15000);
  });

  it("updates logical sprite colors and flags from values and conditions", async () => {
    const { cpu } = await run(`
      const player = c64.sprite.create(0, { x: 100, y: 80 });
      let color = 7; let enabled = false;
      player.color(color); player.expandX(enabled); player.expandY(!enabled);
      c64.sprite.multicolor(0, enabled); c64.sprite.priority(0, !enabled);
      color = 2; c64.sprite.color(1, color + 1);
    `);
    expect(cpu.memory[0xd027]).toBe(7);
    expect(cpu.memory[0xd028]).toBe(3);
    expect(cpu.memory[0xd01d] & 1).toBe(0);
    expect(cpu.memory[0xd017] & 1).toBe(1);
    expect(cpu.memory[0xd01c] & 1).toBe(0);
    expect(cpu.memory[0xd01b] & 1).toBe(1);
  });

  it("accepts checked word-sized sprite Y positions without truncating off-screen input", async () => {
    const { cpu } = await run(`
      const player = c64.sprite.create(0, { x: 100, y: 80 });
      let x = c64.word(300); let y = c64.word(120);
      player.setPosition(x, y);
      y = 256; player.setPosition(50, y);
      c64.sprite.setY(0, y);
    `);
    expect(cpu.memory[0xd000]).toBe(44);
    expect(cpu.memory[0xd010] & 1).toBe(1);
    expect(cpu.memory[0xd001]).toBe(120);
  });

  it("uses variable scroll steps with zero and out-of-range steps as no-ops", async () => {
    const map = { charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 16, height: 12, data: Array(192).fill(0) } };
    const { result, cpu } = await run(`
      const map = c64.assets.defineMap(${JSON.stringify(map)});
      const camera = c64.map.scroller(map, { width: 8, height: 6, x: 1, y: 0, panel: "bottom" });
      let speed = 8;
      camera.right(speed); camera.down(speed);
      speed = 3; camera.left(speed); camera.up(speed);
      speed = 0; camera.right(speed); camera.down(speed);
      speed = 9; camera.right(speed); camera.down(speed);
      c64.game.frame(() => {});
    `, { frame: true });
    const ranges = result.assetReport.find(entry => entry.type === "memory-layout").ranges;
    for (const axis of ["X", "Y"]) {
      const address = ranges.find(range => range.name.endsWith(`_cameraPixel${axis}`)).start;
      expect(cpu.memory[address] | cpu.memory[address + 1] << 8).toBe(5);
    }
  });

  it("keeps dynamic HUD writes aligned with a vertically scrolling fixed panel", async () => {
    const map = { charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 16, height: 12, data: Array(192).fill(0) } };
    const { cpu } = await run(`
      const map = c64.assets.defineMap(${JSON.stringify(map)});
      const camera = c64.map.scroller(map, { width: 8, height: 6, x: 1, y: 0, panel: "bottom" });
      let speed = 1; camera.down(speed);
      let row = 20; let col = 3;
      c64.printAt(col, row, "OK", 7);
      c64.printNumber(6, row, 123, { digits: 3, color: 2 });
      c64.game.frame(() => {});
    `, { frame: true });
    expect(cpu.memory[0x400 + 19 * 40 + 3]).toBe(15);
    expect(cpu.memory[0x400 + 19 * 40 + 4]).toBe(11);
    expect(screenText(cpu, 6, 19, 3)).toBe("123");
    expect(cpu.memory[0xd800 + 19 * 40 + 6]).toBe(2);
  });

  it("uses direct addresses for calculated HUD values at constant positions", async () => {
    const { result, cpu } = await run(`
      let value = 42; let color = 7;
      c64.printNumber(1, 1, value, { digits: 2, color: color });
      c64.printAt(1, 2, "VALUE", color);
    `);
    expect(screenText(cpu, 1, 1, 2)).toBe("42");
    expect(result.asm).not.toMatch(/api_text_\d+_/);
    expect(cpu.cycles).toBeLessThan(1500);
  });
});
