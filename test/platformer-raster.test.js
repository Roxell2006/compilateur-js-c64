import { describe, expect, it } from "vitest";
import { compileFile } from "../src/compiler.js";
import { PalRasterCpu } from "./helpers/pal-raster.js";

describe("platformer PAL raster presentation", () => {
  it("fetches coherent characters/colors across the whole map in both directions with three sprites", async () => {
    const result = await compileFile("examples/platformer-mini.js");
    const cpu = new PalRasterCpu(result);
    cpu.runUntil(c => c.pc === result.symbols.game_frame_loop, 2000000);
    const ranges = result.assetReport.find(r => r.type === "memory-layout").ranges;
    const address = name => ranges.find(r => r.name === `variable ${name}`).start;
    const camX = address("__mapScroller0_cameraX"), camY = address("__mapScroller0_cameraY");
    const pixelX = address("__mapScroller0_cameraPixelX");
    const fineX = address("__mapScroller0_fineX");
    const setWord = (name, value) => {
      const a = address(name); cpu.memory[a] = value & 255; cpu.memory[a + 1] = value >> 8;
    };
    let x = cpu.memory[camX], y = cpu.memory[camY], rows = 0, ticks = 0;
    const errors = [], positions = new Set(), directions = new Set(), starts = [];
    cpu.onScrollLatch = () => {
      x = cpu.memory[camX]; y = cpu.memory[camY]; positions.add(x);
      const pixel = cpu.memory[pixelX] | cpu.memory[pixelX + 1] << 8;
      expect(pixel).toBe(x * 8 + 7 - cpu.memory[fineX]);
      expect(cpu.memory[0xd016] & 7).toBe(cpu.memory[fineX]);
    };
    cpu.onRow = row => {
      if (row >= 20) return;
      rows++;
      for (let col = 0; col < 36; col++) {
        const tile = cpu.memory[0x8000 + (y + row) * 80 + x + col];
        const char = cpu.memory[result.symbols.asset_map_chars_0 + tile];
        const color = cpu.memory[result.symbols.asset_map_colors_0 + tile];
        const actual = cpu.memory[0x400 + row * 40 + 2 + col];
        const actualColor = cpu.memory[0xd800 + row * 40 + 2 + col] & 15;
        if (char !== actual || color !== actualColor) {
          if (errors.length < 10) errors.push({ frame: cpu.frame, row, col, x, char, actual, color, actualColor });
        }
      }
    };
    const firstFrame = cpu.frame, endFrame = firstFrame + 420;
    while (cpu.frame < endFrame) {
      if (cpu.pc === result.symbols.game_frame_logical_tick) {
        ticks++;
        const right = cpu.frame - firstFrame < 210;
        const camera = cpu.memory[pixelX] | cpu.memory[pixelX + 1] << 8;
        // Drive the real physics/follow/frame code across every camera column,
        // without making this regression depend on manually playing the level.
        setWord("__map_entity_0_world_x", Math.min(616, camera + (right ? 240 : 64)));
        setWord("__map_entity_0_world_y", 139);
        cpu.memory[address("__map_entity_0_velocity_y")] = 0;
        setWord("__map_entity_1_world_x", camera + 140);
        setWord("__map_entity_1_world_y", 80);
        setWord("__map_entity_2_world_x", camera + 180);
        setWord("__map_entity_2_world_y", 60);
        cpu.memory[0xdc00] = right ? 247 : 251;
      }
      for (const direction of ["left", "right"]) {
        if (cpu.pc === result.symbols[`runtime_map_scroll_shift_${direction}_0`]) {
          directions.add(direction); starts.push(cpu.line);
        }
      }
      cpu.step();
    }
    expect(errors).toEqual([]);
    expect(positions.size).toBe(45); // sourceX 0..44 for the 80-column map.
    expect(cpu.memory[camX]).toBe(0);
    expect(directions.size).toBe(2);
    expect(starts.every(line => line === 214)).toBe(true);
    expect(rows).toBeGreaterThan(8000);
    expect(ticks).toBe(420);
  }, 15000);
});
