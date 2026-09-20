import { describe, it, expect } from "vitest";
import { compileFile } from "../src/compiler.js";
import { PalRasterCpu } from "./helpers/pal-raster.js";

async function boot(example) {
  const result = await compileFile(`examples/${example}.js`);
  const cpu = new PalRasterCpu(result);
  cpu.memory[0xdc01] = 255;
  const loop = result.symbols.game_frame_loop;
  cpu.runUntil(c => c.pc === loop, 3000000);
  const ranges = result.assetReport.find(r => r.type === "memory-layout").ranges;
  const address = name => ranges.find(r => r.name === `variable ${name}`)?.start
    ?? ranges.find(r => r.name.startsWith(`variable __js_${name}_`))?.start;
  function frame(input = 255) {
    cpu.memory[0xdc00] = input;
    const tick = cpu.memory[0xc76a];
    const start = cpu.cycles;
    cpu.runUntil(c => c.memory[0xc76a] !== tick, 3000000);
    cpu.runUntil(c => c.pc === loop, 3000000);
    return cpu.cycles - start;
  }
  function tap(mask) { frame(255 ^ mask); frame(); }
  function call(name) {
    const label = Object.keys(result.symbols).find(k => new RegExp(`^user_routine___js_${name}_\\d+$`).test(k));
    const savedPc = cpu.pc, savedP = cpu.p;
    cpu.p |= 4; // Isolate the callable game routine from raster IRQs.
    const cycles = cpu.call(label, 3000000);
    cpu.pc = savedPc; cpu.p = savedP;
    return cycles;
  }
  function word(name, value) {
    const a = address(name);
    if (value === undefined) return cpu.memory[a] | cpu.memory[a + 1] << 8;
    cpu.memory[a] = value & 255; cpu.memory[a + 1] = value >> 8;
  }
  return { result, cpu, address, frame, tap, call, word };
}

describe("complete natural reference programs", () => {
  it("Tetris rotates, respects walls, drops and locks a piece using actual inputs", async () => {
    const { result, cpu, address, tap, frame } = await boot("natural-tetris");
    const board = result.symbols.__js_array_0;
    const rotation = cpu.memory[address("rotation")];
    tap(16);
    expect(cpu.memory[address("rotation")]).toBe((rotation + 4) & 15);
    for (let i = 0; i < 10; i++) tap(4);
    expect(cpu.memory[address("pieceX")]).toBe(0);
    for (let i = 0; i < 12; i++) tap(8);
    expect(cpu.memory[address("pieceX")]).toBeLessThan(10);
    expect(cpu.memory[address("pieceX")]).toBeGreaterThan(6);
    for (let i = 0; i < 45; i++) frame(253); // Held DOWN accelerates gravity.
    expect(Array.from(cpu.memory.slice(board, board + 200)).filter(v => v === 1).length).toBeGreaterThanOrEqual(4);
    expect(cpu.memory[address("gameOver")]).toBe(0);
  });

  it("Tetris clears consecutive full rows, updates score, detects loss and restarts", async () => {
    const { result, cpu, address, call, tap } = await boot("natural-tetris");
    const board = result.symbols.__js_array_0;
    cpu.memory.fill(0, board, board + 200);
    cpu.memory.fill(1, board + 180, board + 200);
    cpu.memory[board + 172] = 1;
    call("clearLines");
    expect(cpu.memory[board + 192]).toBe(1);
    expect(Array.from(cpu.memory.slice(board, board + 200)).filter(v => v === 1)).toHaveLength(1);
    call("drawBoard");
    expect(Array.from(cpu.memory.slice(0x400 + 8 * 40 + 1, 0x400 + 8 * 40 + 6))).toEqual([48,48,48,50,48]);
    cpu.memory.fill(1, board, board + 200);
    call("spawn");
    expect(cpu.memory[address("gameOver")]).toBe(1);
    expect(cpu.memory[0xd020]).toBe(2);
    tap(16);
    expect(cpu.memory[address("gameOver")]).toBe(0);
    expect(Array.from(cpu.memory.slice(board, board + 200))).toEqual(Array(200).fill(0));
  });

  it("Tetris refuses a rotation into occupied cells without changing the piece", async () => {
    const { result, cpu, address, tap } = await boot("natural-tetris");
    const board = result.symbols.__js_array_0;
    const turn = cpu.memory[address("rotation")];
    // Initial T at x=3, rotation 8; rotation 12 would occupy (3,0).
    cpu.memory[board + 3] = 1;
    tap(16);
    expect(cpu.memory[address("rotation")]).toBe(turn);
    expect(cpu.memory[board + 3]).toBe(1);
  });

  it("Tetris accepts all four rotations of all four pieces in open space", async () => {
    const { result, cpu, address, tap, call } = await boot("natural-tetris");
    for (const kind of [0, 16, 32, 48]) {
      call("newGame");
      cpu.memory[address("kind")] = kind;
      cpu.memory[address("rotation")] = 0;
      cpu.memory[address("pieceX")] = 3;
      cpu.memory[address("pieceY")] = 3;
      for (let turn = 1; turn <= 4; turn++) {
        tap(16);
        expect(cpu.memory[address("rotation")]).toBe((turn * 4) & 15);
      }
      expect(Array.from(cpu.memory.slice(result.symbols.__js_array_0, result.symbols.__js_array_0 + 200))).toEqual(Array(200).fill(0));
    }
  });

  it("Platformer jumps, respawns on danger, collects once and traverses both exits", async () => {
    const { cpu, address, word, frame, tap } = await boot("natural-platformer");
    // Land on the original floor, then test the real input/physics path.
    word("__map_entity_0_world_x", 24);
    word("__map_entity_0_world_y", 139);
    cpu.memory[address("__map_entity_0_velocity_y")] = 0;
    frame();
    expect(cpu.memory[address("__map_entity_0_on_ground")]).toBe(1);
    const y = word("__map_entity_0_world_y");
    tap(16);
    expect(word("__map_entity_0_world_y")).toBeLessThan(y);
    // Place the feet over the original danger tiles.
    word("__map_entity_0_world_x", 18 * 8);
    word("__map_entity_0_world_y", 139);
    cpu.memory[address("__map_entity_0_velocity_y")] = 0;
    frame();
    expect(word("__map_entity_0_world_x")).toBe(24);
    // Move the coin into the player's hitbox and keep it there for two frames.
    for (let i = 0; i < 2; i++) {
      word("__map_entity_2_world_x", word("__map_entity_0_world_x"));
      word("__map_entity_2_world_y", word("__map_entity_0_world_y"));
      frame();
    }
    expect(cpu.memory[address("score")]).toBe(1);
    expect(cpu.memory[address("collected")]).toBe(1);
    word("__map_entity_1_world_x", word("__map_entity_0_world_x"));
    word("__map_entity_1_world_y", word("__map_entity_0_world_y"));
    frame();
    expect(word("__map_entity_0_world_x")).toBe(24);
    word("__map_entity_1_world_x", 400); // Keep the enemy clear of the exit tests.
    for (const [x, y, zone] of [[38 * 8 - 12, 139, 1], [77 * 8 - 12, 59, 1]]) {
      word("__map_entity_0_world_x", x);
      word("__map_entity_0_world_y", y);
      cpu.memory[address("__map_entity_0_velocity_y")] = 0;
      frame();
      expect(cpu.memory[address("zone")]).toBe(zone);
    }
    expect(cpu.memory[0xd020]).toBe(5);
  });

  it("HR moves and resizes the brush, changes shape/color, clears and exits", async () => {
    const { cpu, address, word, frame, tap } = await boot("natural-hires-interactive");
    expect(cpu.memory[0xd011] & 32).toBe(32);
    const x = word("x");
    tap(8);
    expect(word("x")).toBe(x + 2);
    tap(16 | 8);
    expect(cpu.memory[address("radius")]).toBe(9);
    tap(16 | 1);
    expect(cpu.memory[address("ink")]).toBe(2);
    tap(16 | 2);
    expect(cpu.memory[address("shape")]).toBe(1);
    tap(16 | 2);
    expect(cpu.memory[address("shape")]).toBe(2);
    const brushX = word("x"), brushY = cpu.memory[address("y")];
    const pixel = 0x6000 + (brushY >> 3) * 320 + (brushX >> 3) * 8 + (brushY & 7);
    expect(cpu.memory[pixel] & (128 >> (brushX & 7))).not.toBe(0);
    expect(cpu.memory[0x5c00 + (brushY >> 3) * 40 + (brushX >> 3)] >> 4).toBe(2);
    // Radius stops at the declared limit instead of wrapping or drawing outside.
    for (let i = 0; i < 12; i++) tap(16 | 8);
    expect(cpu.memory[address("radius")]).toBe(16);
    // Model only the selected CIA keyboard row, preserving the raster hook.
    const read = cpu.readHook;
    let key = 0x3c; // SPACE: row 7, column 4.
    cpu.readHook = a => a === 0xdc01
      ? (cpu.memory[0xdc00] === (255 ^ (1 << (key >> 3))) ? 255 ^ (1 << (key & 7)) : 255)
      : read(a);
    cpu.memory[0x6000] = 255; // Mark far outside the brush.
    frame();
    expect(cpu.memory[0x6000]).toBe(0);
    key = 1; // RETURN.
    frame();
    expect(cpu.memory[address("active")]).toBe(0);
    expect(cpu.memory[0xd011] & 32).toBe(0);
  });

  it("keeps PRG/RAM budgets and the measured idle/drop path close to legacy", async () => {
    const metrics = {};
    const maps = [];
    for (const example of ["tetris-mini", "natural-tetris", "platformer-mini", "natural-platformer"]) {
      const { result, cpu } = await boot(example);
      if (example.includes("platformer")) maps.push(cpu.memory.slice(0x8000, 0x8000 + 80 * 30));
      const costs = [];
      for (let i = 0; i < 60; i++) {
        cpu.runUntil(c => c.pc === result.symbols.game_frame_logical_tick, 3000000);
        const start = cpu.cycles;
        cpu.runUntil(c => c.pc === result.symbols.game_frame_loop, 3000000);
        costs.push(cpu.cycles - start);
      }
      const layout = result.assetReport.find(r => r.type === "memory-layout");
      expect(layout.conflicts).toEqual([]);
      metrics[example] = { bytes: result.prgBytes.length, total: costs.reduce((a, b) => a + b, 0),
        ram: layout.ranges.filter(r => r.kind === "variable").reduce((n, r) => n + r.bytes, 0) };
    }
    expect(metrics["natural-tetris"].bytes).toBeLessThan(4096);
    expect(metrics["natural-tetris"].ram).toBeLessThanOrEqual(128);
    expect(metrics["natural-tetris"].total).toBeLessThan(metrics["tetris-mini"].total);
    expect(metrics["natural-platformer"].bytes).toBeLessThan(metrics["platformer-mini"].bytes * 1.05);
    expect(metrics["natural-platformer"].ram).toBeLessThanOrEqual(80);
    expect(metrics["natural-platformer"].total).toBeLessThan(metrics["platformer-mini"].total * 1.05);
    expect(maps[0]).toEqual(maps[1]);
  });

  it("keeps repeated compilation deterministic for resource IDs and raster scheduling", async () => {
    const first = await compileFile("examples/natural-platformer.js");
    const second = await compileFile("examples/natural-platformer.js");
    expect(first.prgBytes).toEqual(second.prgBytes);
    expect(first.assetReport).toEqual(second.assetReport);
  });
});
