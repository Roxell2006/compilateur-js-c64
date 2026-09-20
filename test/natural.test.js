import { describe, it, expect } from "vitest";
import { compileFile, compileJsToC64Outputs } from "../src/compiler.js";
import { Cpu6502 } from "./helpers/cpu6502.js";
import { hasNaturalDirective } from "../src/natural.js";

async function execute(source) {
  const result = await compileJsToC64Outputs(`"use c64";\n${source}`);
  const cpu = new Cpu6502(result);
  cpu.push(0xff); cpu.push(0xfe);
  cpu.runUntil(cpu => cpu.pc === 0xffff);
  return { result, cpu };
}

describe("natural JavaScript frontend", () => {
  it("plays Lights Out through victory and restart with generated 6502 code", async () => {
    const result = await compileFile("examples/natural-lights.js");
    const cpu = new Cpu6502(result);
    // The harness has no C64 ROM; emulate CHROUT returning from clearScreen.
    cpu.memory[0xffd2] = 0x60;
    let joystick = 255;
    const line = () => Math.floor(cpu.cycles / 63) % 312;
    cpu.readHook = address => address === 0xdc00 ? joystick
      : address === 0xd011 ? (line() >= 256 ? 0x9b : 0x1b)
      : address === 0xd012 ? line() & 255 : undefined;
    const loop = result.symbols.game_frame_loop;
    cpu.runUntil(c => c.pc === loop, 2000000);
    const board = result.symbols.__js_array_0;
    const initial = cpu.memory.slice(board, board + 16);
    expect(initial.some(value => value === 1)).toBe(true);
    function frame(input) {
      joystick = input;
      const count = cpu.memory[0xc76a];
      cpu.runUntil(c => c.memory[0xc76a] !== count, 2000000);
      cpu.runUntil(c => c.pc === loop, 2000000);
    }
    function press(mask) { frame(255 ^ mask); frame(255); }
    // Undo the three crosses used to generate the initial puzzle.
    press(16);
    press(8); press(8); press(2); press(16);
    press(4); press(2); press(16);
    expect(Array.from(cpu.memory.slice(board, board + 16))).toEqual(Array(16).fill(0));
    expect(Array.from(cpu.memory.slice(0x400 + 20 * 40 + 2, 0x400 + 20 * 40 + 8))).toEqual([19,15,12,22,5,4]);
    expect(Array.from(cpu.memory.slice(0x400 + 17 * 40 + 20, 0x400 + 17 * 40 + 23))).toEqual([48,48,51]);
    press(16);
    expect(cpu.memory.slice(board, board + 16)).toEqual(initial);
    expect(Array.from(cpu.memory.slice(0x400 + 17 * 40 + 20, 0x400 + 17 * 40 + 23))).toEqual([48,48,48]);
  });
  it("executes fixed byte/word arrays, indexed updates and bounds guards on the 6502", async () => {
    const { cpu, result } = await execute(`
      const cells = new Uint8Array([1, 2, 3]);
      const scores = new Uint16Array([255, 1000, 65535]);
      let i = 1;
      cells[i] += 5;
      let old = cells[i]++;
      scores[i] += 24;
      scores[2]++;
      c64.borderColor(old);
      c64.backgroundColor(cells[i]);
      c64.printNumber(0, 0, scores[i], { digits: 5 });
      let outside = c64.word(257);
      cells[outside] = 99;
      scores[outside] = 42;
      c64.printNumber(0, 1, scores[outside], { digits: 5 });
      c64.printNumber(0, 2, scores[2], { digits: 5 });
    `);
    expect(cpu.memory[0xd020]).toBe(7);
    expect(cpu.memory[0xd021]).toBe(8);
    expect(Array.from(cpu.memory.slice(0x400, 0x405))).toEqual([48,49,48,50,52]);
    expect(Array.from(cpu.memory.slice(0x428, 0x42d))).toEqual([48,48,48,48,48]);
    expect(Array.from(cpu.memory.slice(0x450, 0x455))).toEqual([48,48,48,48,48]);
    expect(result.asm).toMatch(/LDA __js_array_\d+,X/);
  });

  it("preserves array index evaluation order and shares specialized function routines", async () => {
    const { cpu, result } = await execute(`
      const cells = new Uint8Array(256);
      let i = 0;
      function advance() { i++; return 7; }
      function change(data, index) { data[index] += 1; return data[index]; }
      function label(text, row) { c64.printAt(0, row, text); }
      cells[i] = advance();
      cells[255] = 4;
      change(cells, 0);
      change(cells, 255);
      c64.borderColor(cells[0]);
      c64.backgroundColor(cells[255]);
      label("HELLO", 0);
      label("HELLO", 1);
      label("WORLD", 2);
    `);
    expect(cpu.memory[0xd020]).toBe(8);
    expect(cpu.memory[0xd021]).toBe(5);
    expect(Array.from(cpu.memory.slice(0x400, 0x405))).toEqual([8,5,12,12,15]);
    expect(Array.from(cpu.memory.slice(0x450, 0x455))).toEqual([23,15,18,12,4]);
    expect(result.asm.match(/user_routine___js_change_\d+:/g)).toHaveLength(1);
    expect(result.asm.match(/user_routine___js_label_\d+:/g)).toHaveLength(2);
  });

  it("passes API objects by identity to reusable functions", async () => {
    const { cpu } = await execute(`
      const score = c64.game.score({ digits: 3 });
      function reward(counter, amount) { counter.add(amount); }
      reward(score, 12);
      reward(score, 3);
      score.draw(0, 0);
    `);
    expect(Array.from(cpu.memory.slice(0x400, 0x403))).toEqual([48,49,53]);
  });

  it("diagnoses unsupported typed-array allocation and invalid constant indices", async () => {
    for (const source of [
      'const a = new Uint8Array(257);',
      'const a = new Uint8Array([256]);',
      'const a = new Uint8Array(2); a[2] = 0;',
      'function f() { const a = new Uint8Array(2); } f();',
      'let n = 3; const a = new Uint8Array(n);',
    ]) {
      await expect(compileJsToC64Outputs(`"use c64"; ${source}`)).rejects.toThrow(/Typed arrays|typed arrays|Array index/);
    }
  });
  it("uses an explicit directive and leaves legacy JS execution unchanged", async () => {
    expect(hasNaturalDirective('/* hi */ "use strict";\n"use c64";')).toBe(true);
    expect(hasNaturalDirective('"use c64" /* compiler mode */; let x = 0;')).toBe(true);
    expect(hasNaturalDirective('"use c64"\nc64.clearScreen();')).toBe(true);
    expect(hasNaturalDirective('"use c64"\n.toUpperCase();')).toBe(false);
    expect(hasNaturalDirective('const text = "use c64";')).toBe(false);
    const legacy = await compileJsToC64Outputs('let x = 2; if (x < 3) c64.borderColor(5);');
    expect(legacy.asm).toContain('LDA #$05');
  });

  it("executes arithmetic, nested conditions, short circuiting and reusable functions on the 6502", async () => {
    const { cpu, result } = await execute(`
      let x = 1;
      let calls = 0;
      function add(a, b) { calls++; return a + b; }
      function changed() { calls++; return true; }
      x = add(x, 2);
      x = add(x, 3);
      if (x === 6 && !false) { c64.borderColor(x); }
      if (x === 0 && changed()) { c64.borderColor(99); }
      if (x === 6 || changed()) { c64.backgroundColor(calls); }
    `);
    expect(cpu.memory[0xd020]).toBe(6);
    expect(cpu.memory[0xd021]).toBe(2);
    expect(result.asm.match(/user_routine___js_add_\d+:/g)).toHaveLength(1);
    expect(result.asm.match(/JSR user_routine___js_add_/g)).toHaveLength(2);
  });

  it("executes loops, lexical locals, break, continue and early return", async () => {
    const { cpu } = await execute(`
      let total = 0;
      function sum(n) {
        let result = 0;
        for (let i = 0; i < n; i++) {
          if (i === 2) continue;
          if (i === 5) break;
          result += i;
        }
        if (result > 0) return result;
        return 0;
      }
      total = sum(8);
      c64.borderColor(total);
      let count = 3;
      while (count > 0) { count--; }
      c64.backgroundColor(count);
    `);
    expect(cpu.memory[0xd020]).toBe(8);
    expect(cpu.memory[0xd021]).toBe(0);
  });

  it("supports explicit words, widening, masks, shifts, constant multiplication and truncation", async () => {
    const { cpu } = await execute(`
      let x = c64.word(300);
      let delta = 4;
      x += delta;
      x = (x << 1) | 1;
      x *= 3;
      if (x === 1827) c64.borderColor(7);
      c64.backgroundColor(c64.byte(x));
    `);
    expect(cpu.memory[0xd020]).toBe(7);
    expect(cpu.memory[0xd021]).toBe(35);
  });

  it("preserves left-to-right evaluation and function argument snapshots", async () => {
    const { cpu } = await execute(`
      let x = 2;
      function change() { x = 8; return 3; }
      function first(a, b) { return a; }
      let result = x + change();
      c64.borderColor(result);
      x = 2;
      result = first(x, change());
      c64.backgroundColor(result);
    `);
    expect(cpu.memory[0xd020]).toBe(5);
    expect(cpu.memory[0xd021]).toBe(2);
  });

  it("keeps byte-for-byte code and cycle counts for simple DSL equivalents", async () => {
    const natural = await execute(`
      let x = 1; x += 1;
      if (x > 1) c64.borderColor(x);
    `);
    const legacy = await compileJsToC64Outputs(`
      const x = c64.var.byte("x", { initial: 1 }); x.inc();
      c64.control.if(x.gt(1), () => c64.borderColor(x));
    `);
    expect(natural.result.bytes).toEqual(legacy.bytes);
    const cpu = new Cpu6502(legacy);
    cpu.push(0xff); cpu.push(0xfe);
    cpu.runUntil(cpu => cpu.pc === 0xffff);
    expect(natural.cpu.cycles).toBe(cpu.cycles);
  });

  it("keeps explicit DSL variable handles at their original RAM address", async () => {
    const { cpu } = await execute(`
      const old = c64.var.byte("old", { address: 0xc180, initial: 2 });
      old.inc();
      if (old === 3) c64.borderColor(old);
    `);
    expect(cpu.memory[0xc180]).toBe(3);
    expect(cpu.memory[0xd020]).toBe(3);
  });

  it("draws dynamic hires points/lines with 9-bit X and rejects off-screen endpoints", async () => {
    const { cpu } = await execute(`
      c64.hires.enabled();
      let x = c64.word(300);
      let y = 40;
      c64.hires.point(x, y, c64.COLOR_WHITE);
      c64.hires.line(x + 1, y, x + 3, y, c64.COLOR_WHITE);
      x = 320;
      c64.hires.point(x, y, c64.COLOR_WHITE);
      x = 10;
      y = 200;
      c64.hires.line(x, y, 20, 10, c64.COLOR_WHITE);
    `);
    const pixelByte = 0x6000 + 5 * 320 + 37 * 8;
    expect(cpu.memory[pixelByte]).toBe(15);
    const bitmapWrites = cpu.writes.filter(write => write.address >= 0x6000 && write.address < 0x8000);
    expect(bitmapWrites).toHaveLength(4);
  });

  it("preserves word-valued returns inside loops", async () => {
    const { cpu } = await execute(`
      function find(n) { while (n > 0) { return n; } return 0; }
      let n = c64.word(300);
      let answer = find(n);
      if (answer === 300) c64.borderColor(9);
    `);
    expect(cpu.memory[0xd020]).toBe(9);
  });

  it("prepares timers and VIC collision snapshots through named frame callbacks", async () => {
    const result = await compileJsToC64Outputs(`"use c64";
      const player = c64.sprite.create(0, { x: 100, y: 100 });
      function showCollision(hit) { if (hit) c64.borderColor(2); }
      function tick() {
        showCollision(player.collidesWithBackground());
        c64.game.every(3, () => { player.x += 1; player.sync(); });
      }
      c64.game.frame(tick);
    `);
    expect(result.asm).toContain("LDA $D01F");
    expect(result.asm).toMatch(/JSR user_routine___js_tick_/);
    expect(result.asm).toContain("game_every");
  });

  it("handles logical loop conditions, expression values and function aliases", async () => {
    const { cpu } = await execute(`
      let x = 0;
      while (x < 2 || x === 2) x++;
      let a = x || 8;
      let b = x > 2 ? 7 : 9;
      function add(v) { return v + 1; }
      const next = add;
      c64.borderColor(next(a));
      c64.backgroundColor(b);
    `);
    expect(cpu.memory[0xd020]).toBe(4);
    expect(cpu.memory[0xd021]).toBe(7);
  });

  it("executes natural sprite updates and an early frame return", async () => {
    const result = await compileJsToC64Outputs(`"use c64";
      const player = c64.sprite.create(0, { x: 300, y: 100 });
      let stopped = false;
      function move() { player.x += 2; player.y -= 1; player.sync(); }
      c64.game.frame(() => {
        if (stopped) return;
        move();
        stopped = true;
      }, { hz: "video" });
    `);
    const cpu = new Cpu6502(result);
    const line = () => Math.floor(cpu.cycles / 63) % 312;
    cpu.readHook = address => address === 0xd011 ? (line() >= 256 ? 0x9b : 0x1b)
      : address === 0xd012 ? line() & 255 : undefined;
    cpu.runUntil(c => c.memory[0xc76a] === 1);
    cpu.runUntil(c => c.pc === c.symbols.game_frame_loop);
    expect(cpu.memory[0xd000]).toBe(46);
    expect(cpu.memory[0xd010] & 1).toBe(1);
    expect(cpu.memory[0xd001]).toBe(99);
    cpu.runUntil(c => c.memory[0xc76a] === 2);
    cpu.runUntil(c => c.pc === c.symbols.game_frame_loop);
    expect(cpu.memory[0xd000]).toBe(46);
  });

  it.each(["hires", "sprites", "scroll"])("compiles the natural %s example through compileFile", async name => {
    const result = await compileFile(`examples/natural-${name}.js`);
    expect(result.prgBytes.length).toBeGreaterThan(50);
    expect(result.asm).toMatch(/user_routine___js_/);
    if (name === "scroll") expect(result.assetReport.some(item => item.type === "map-scroll")).toBe(true);
  });

  it.each([
    ['let x=300;', /16-bit/],
    ['let x=1; x /= 2;', /Unsupported runtime operator/],
    ['function f() { return f(); } f();', /Recursive/],
    ['let x=1; function f() { if (x) return 1; } let y=f();', /every path/],
    ['const x=1; x=2;', /Cannot assign/],
    ['let x=1; x = Math.random();', /Unknown name/],
    ['let x=1; x = 1.5;', /integer/],
    ['let x=1; c64.print(x);', /compile-time constant/],
    ['let x=1; function f() { if (x) return; return 2; } f();', /mix bare return/],
    ['let x=1; { c64.borderColor(x); let x=2; }', /before its declaration/],
    ['function f() { let x=1; c64.borderColor(x); } f(); c64.irq.raster(80, f); c64.irq.install();', /shared between raster IRQ/]
  ])("rejects unsupported source with a source location: %s", async (source, message) => {
    const build = () => compileJsToC64Outputs(`"use c64";\n${source}`).then(() => undefined);
    await expect(build()).rejects.toThrow(message);
    await expect(build()).rejects.toThrow(/<source>:\d+:\d+:/);
  });
});
