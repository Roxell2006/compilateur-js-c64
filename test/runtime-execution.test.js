import { describe, expect, it } from "vitest";
import { compileFile, compileJsToC64Outputs } from "../src/compiler.js";
import { Cpu6502 } from "./helpers/cpu6502.js";

const SFX_ACTIVE = 0xc5b5;
const VIDEO_HZ = 0xc76f;
const sfxSource = `
  c64.sid.reserveSfxVoice(3);
  c64.control.routine("laser", () => c64.sid.laser());
  c64.control.routine("pickup", () => c64.sid.pickup());
  c64.control.routine("noise", () => c64.sid.noise(255));
  c64.control.routine("beep", () => c64.sid.beep());
  c64.control.routine("explosion", () => c64.sid.explosion());
  c64.control.routine("click", () => c64.sid.click());
  c64.game.frame(() => {});
`;

function raster(cpu, lines = 312, start = 0, cyclesPerLine = 63) {
  const line = () => (Math.floor(cpu.cycles / cyclesPerLine) + start) % lines;
  cpu.readHook = address => address === 0xd011 ? (line() >= 256 ? 0x9b : 0x1b)
    : address === 0xd012 ? line() & 255 : undefined;
  return line;
}

describe("executed 6502 SID effects", () => {
  it("returns promptly for every helper and preserves the interrupt mask", async () => {
    const result = await compileJsToC64Outputs(sfxSource);
    expect(result.asm).not.toContain("sid_delay_");
    for (const effect of ["laser", "pickup", "noise", "beep", "explosion", "click"]) {
      for (const mask of [0, 4]) {
        const cpu = new Cpu6502(result);
        cpu.p = 0x20 | mask;
        expect(cpu.call(`user_routine_${effect}`)).toBeLessThan(80);
        expect(cpu.p & 4).toBe(mask);
        expect(cpu.memory[SFX_ACTIVE]).toBe(1);
        expect(cpu.sp).toBe(255);
      }
    }
  });

  it.each([50, 60])("plays and releases both notes at 50 Hz on a %i Hz display", async hz => {
    const cpu = new Cpu6502(await compileJsToC64Outputs(sfxSource));
    cpu.memory[VIDEO_HZ] = hz;
    cpu.memory[0xfb] = 0x35; cpu.memory[0xfc] = 0x82;
    cpu.call("user_routine_laser");
    const changes = [];
    for (let frame = 1; frame <= hz; frame++) {
      const before = cpu.writes.length;
      expect(cpu.call("runtime_sid_sfx_tick")).toBeLessThan(300);
      const controls = cpu.writes.slice(before).filter(w => w.address === 0xd412);
      if (controls.length) changes.push({ frame, gate: controls.at(-1).value & 1 });
      expect(Array.from(cpu.memory.slice(0xfb, 0xfd))).toEqual([0x35, 0x82]);
      expect(cpu.sp).toBe(255);
    }
    expect(changes).toEqual([
      { frame: Math.ceil(hz / 50), gate: 1 },
      { frame: Math.ceil(7 * hz / 50), gate: 1 },
      { frame: Math.ceil(15 * hz / 50), gate: 0 }
    ]);
    expect(cpu.memory[SFX_ACTIVE]).toBe(0);
    expect(cpu.writes.filter(w => w.address >= 0xd400 && w.address < 0xd40e)).toEqual([]);
  });

  it("replaces an active effect without a stale timer cutting off the replacement", async () => {
    const cpu = new Cpu6502(await compileJsToC64Outputs(sfxSource));
    cpu.memory[VIDEO_HZ] = 50;
    cpu.call("user_routine_laser");
    for (let i = 0; i < 4; i++) cpu.call("runtime_sid_sfx_tick");
    cpu.call("user_routine_pickup");
    for (let i = 0; i < 10; i++) {
      cpu.call("runtime_sid_sfx_tick");
      expect(cpu.memory[SFX_ACTIVE]).toBe(1);
    }
    cpu.call("runtime_sid_sfx_tick");
    expect(cpu.memory[SFX_ACTIVE]).toBe(0);
    expect(cpu.memory[0xd412] & 1).toBe(0);
  });

  it("honors the maximum noise duration without wrapping its counter", async () => {
    const cpu = new Cpu6502(await compileJsToC64Outputs(sfxSource));
    cpu.memory[VIDEO_HZ] = 50;
    cpu.call("user_routine_noise");
    for (let i = 0; i < 255; i++) {
      cpu.call("runtime_sid_sfx_tick");
      expect(cpu.memory[SFX_ACTIVE]).toBe(1);
    }
    cpu.call("runtime_sid_sfx_tick");
    expect(cpu.memory[SFX_ACTIVE]).toBe(0);
  });

  it("stores repeated effects once and emits no sequencer for click-only programs", async () => {
    const r = await compileJsToC64Outputs("c64.sid.laser(); c64.sid.laser();");
    expect(Object.keys(r.symbols).filter(n => n.startsWith("sid_sfx_data_"))).toHaveLength(1);
    const click = await compileJsToC64Outputs("c64.sid.click();");
    expect(click.asm).not.toContain("runtime_sid_sfx_tick");
  });

  it.each([
    "",
    'c64.sid.playSong({ voices: [["C4"], ["R"], ["R"]] });',
    'c64.sprite.position(0, 50, 50); c64.sprite.animateTo(0, { x: 100, y: 100, speed: 1 }); c64.sprite.installAnimator();',
    'c64.sid.playSong({ voices: [["C4"], ["R"], ["R"]] }); c64.sprite.position(0, 50, 50); c64.sprite.animateTo(0, { x: 100, y: 100, speed: 1 }); c64.sprite.installAnimator();',
    'c64.irq.raster(30, () => c64.borderColor(2)); c64.irq.install();'
  ])("connects SFX to exactly one IRQ tick: %s", async setup => {
    const result = await compileJsToC64Outputs(`${setup} c64.sid.laser();`);
    expect(result.asm.match(/JSR runtime_sid_sfx_tick/g)).toHaveLength(1);
  });
});

describe("executed 6502 raster scheduling", () => {
  it.each([0, 30, 200, 250])("updates once per physical frame at line %i", async target => {
    const result = await compileJsToC64Outputs(`c64.game.frame(() => {}, { rasterLine: ${target}, hz: "video" });`);
    const cpu = new Cpu6502(result);
    raster(cpu);
    cpu.pc = result.symbols.game_frame_loop;
    const frames = [];
    for (let i = 0; i < 4; i++) {
      cpu.runUntil(c => c.pc === result.symbols.game_frame_target_reached);
      frames.push(Math.floor(cpu.cycles / (312 * 63)));
      cpu.step();
    }
    expect(frames.slice(1).map((v, i) => v - frames[i])).toEqual([1, 1, 1]);
  });

  it("does not miss a frame when an IRQ spans the target scanline", async () => {
    const result = await compileJsToC64Outputs('c64.game.frame(() => {}, { rasterLine: 200, hz: "video" });');
    const cpu = new Cpu6502(result);
    raster(cpu);
    cpu.cycles = 190 * 63;
    cpu.pc = result.symbols.game_frame_loop;
    cpu.runUntil(c => c.pc === result.symbols.game_frame_wait_target);
    cpu.cycles = 204 * 63; // IRQ returned four lines after the target.
    cpu.runUntil(c => c.pc === result.symbols.game_frame_target_reached);
    expect(cpu.cycles).toBeLessThan(205 * 63);
  });

  it.each([312, 262])("does not recycle the new sprite list in raster's high phase (%i lines)", async lines => {
    const result = await compileFile("examples/sprite-multiplex-16.js");
    const cpu = new Cpu6502(result);
    // Low Y values reproduce the D012 aliasing bug at PAL raster 280..311.
    const ys = [5, 10, 15, 20, 25, 30, 35, 40, 100, 110, 120, 130, 140, 150, 160, 170];
    ys.forEach((y, i) => {
      cpu.memory[0xc500 + i * 8 + 2] = y;
      cpu.memory[0xc500 + i * 8 + 5] = 1;
      cpu.memory[0xc400 + i * 8 + 4] = 192 + i;
    });
    raster(cpu, lines, 256, lines === 312 ? 63 : 65);
    cpu.call("runtime_sprite_mux_render");
    const pointers = cpu.writes.filter(w => w.address >= 0x7f8 && w.address <= 0x7ff);
    expect(pointers).toHaveLength(16);
    const cyclesPerLine = lines === 312 ? 63 : 65;
    for (const write of pointers.slice(8)) {
      expect(write.cycles).toBeGreaterThan((lines - 256) * cyclesPerLine);
    }
    expect(cpu.memory[0xc590]).toBe(16);
  });

  it("replays all display frames while running five logic ticks in six NTSC frames", async () => {
    const result = await compileJsToC64Outputs(`
      for (let i = 0; i < 16; i++) c64.sprite.create(i, {x: 50, y: i < 8 ? 50 : 150});
      c64.game.frame(() => {});
    `);
    const cpu = new Cpu6502(result);
    cpu.memory[VIDEO_HZ] = 60;
    for (let i = 0; i < 16; i++) {
      cpu.memory[0xc500 + i * 8 + 2] = i < 8 ? 50 : 150;
      cpu.memory[0xc500 + i * 8 + 5] = 1;
    }
    raster(cpu, 262, 0, 65);
    cpu.pc = result.symbols.game_frame_loop;
    cpu.runUntil(c => c.cycles >= 6 * 262 * 65 + 190 * 65);
    expect(cpu.memory[0xc76a]).toBe(5);
    expect(cpu.writes.filter(w => w.address >= 0x7f8 && w.address <= 0x7ff)).toHaveLength(6 * 16);
  });
});

describe("scroll code generation", () => {
  const largeMap = `
    const width = 127, height = 64;
    const level = c64.assets.defineMap({
      charset: { characters: Array.from({length: 161}, () => Array(8).fill(0)) },
      tiles: [{chars: [32], colors: [0]}, {chars: [160], colors: [5]}, {chars: [81], colors: [7]}],
      map: { width, height, data: Array.from({length: width * height}, (_, i) => (i % width + Math.floor(i / width)) % 3) }
    });
    const scroll = c64.map.horizontalScroller(level, {width: 28, height: 8, x: 6, y: 6, panel: "bottom"});
    c64.control.routine("right", () => scroll.right());
    c64.control.routine("left", () => scroll.left());
    c64.control.routine("down", () => scroll.down());
    c64.control.routine("up", () => scroll.up());
    c64.game.frame(() => {});
  `;

  it.each(["balanced", "size"])("addresses all 8,128 cells correctly in %s mode", async optimization => {
    const result = await compileJsToC64Outputs(largeMap, { optimization });
    const cpu = new Cpu6502(result);
    let maximum = 0;
    for (let y = 0; y < 64; y++) {
      for (let x = 0; x < 127; x++) {
        cpu.memory[0xc7b2] = x; cpu.memory[0xc7b3] = y;
        maximum = Math.max(maximum, cpu.call("runtime_map_pointer_0"));
        expect(cpu.memory[0xfb] | cpu.memory[0xfc] << 8).toBe(0x8000 + y * 127 + x);
        expect(cpu.y).toBe(0);
      }
    }
    if (optimization === "balanced") expect(maximum + 6).toBeLessThanOrEqual(42);
  });

  it.each(["right", "left", "down", "up"])("streams a large map %s across page boundaries without corrupting the panel", async direction => {
    const cpu = new Cpu6502(await compileJsToC64Outputs(largeMap));
    const width = 28, height = 7, screen = 0x400 + 6 * 40 + 6, color = 0xd800 + 6 * 40 + 6;
    const chars = [32, 160, 81], colors = [0, 5, 7];
    const map = Array.from({length: 127 * 64}, (_, i) => (i % 127 + Math.floor(i / 127)) % 3);
    cpu.memory.set(map, 0x8000);
    cpu.memory.fill(0xee, 0x400, 0x800);
    cpu.memory.fill(0x0e, 0xd800, 0xdc00);
    const oldX = 97, oldY = 55;
    cpu.memory[0xc100] = oldX; cpu.memory[0xc101] = 7;
    cpu.memory[0xc102] = oldY; cpu.memory[0xc103] = 7;
    const paint = (x, y) => {
      for (let row = 0; row < height; row++) for (let col = 0; col < width; col++) {
        const tile = map[(y + row) * 127 + x + col];
        cpu.memory[screen + row * 40 + col] = chars[tile];
        cpu.memory[color + row * 40 + col] = colors[tile];
      }
    };
    paint(oldX, oldY);
    const before = cpu.memory.slice();
    let worst = 0;
    for (let step = 0; step < 8; step++) {
      const start = cpu.writes.length;
      worst = Math.max(worst, cpu.call(`user_routine_${direction}`));
      const writes = cpu.writes.slice(start);
      const firstScreen = writes.findIndex(w => w.address >= 0x400 && w.address < 0x800);
      if (firstScreen >= 0) {
        const fine = writes.findIndex(w => w.address === (direction === "left" || direction === "right" ? 0xc101 : 0xc103));
        expect(fine).toBeGreaterThanOrEqual(0);
        expect(fine).toBeLessThan(firstScreen);
      }
    }
    const x = oldX + (direction === "right" ? 1 : direction === "left" ? -1 : 0);
    const y = oldY + (direction === "down" ? 1 : direction === "up" ? -1 : 0);
    expect(cpu.memory[0xc100]).toBe(x); expect(cpu.memory[0xc102]).toBe(y);
    expect(worst).toBeLessThan(5500); // Fits comfortably after line 166 in PAL.
    for (let row = 0; row < 25; row++) for (let col = 0; col < 40; col++) {
      const inside = row >= 6 && row < 6 + height && col >= 6 && col < 6 + width;
      const tile = inside ? map[(y + row - 6) * 127 + x + col - 6] : null;
      expect(cpu.memory[0x400 + row * 40 + col]).toBe(inside ? chars[tile] : before[0x400 + row * 40 + col]);
      expect(cpu.memory[0xd800 + row * 40 + col]).toBe(inside ? colors[tile] : before[0xd800 + row * 40 + col]);
    }
  });

  it("uses the end of the scroll band with virtual sprites and omits unused shifts", async () => {
    const result = await compileFile("examples/platformer-mini.js");
    const scroll = result.assetReport.find(r => r.type === "map-scroll");
    const frame = result.asm.slice(result.asm.indexOf("game_frame_loop:"));
    expect(frame).toContain(`CMP #$${scroll.recommendedFrameRasterLine.toString(16).toUpperCase()}`);
    expect(result.asm).not.toContain("runtime_map_scroll_shift_up_0:");
    expect(result.asm).not.toContain("runtime_map_scroll_shift_down_0:");
    expect(result.bytes.length).toBeLessThan(11034);
  });
});
