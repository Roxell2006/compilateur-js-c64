import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import { Assembler6502, abs, imm, rel, exportBasicData } from "../src/assembler6502.js";
import { createBasicDataLoader, createBasicSysStub } from "../src/basicStub.js";
import { compileFile, compileInstructions, compileJsToC64Outputs, compileJsToBasicData } from "../src/compiler.js";
import { createBasicDataProgram, createPrg } from "../src/prgWriter.js";

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

  it("creates BASIC DATA loader with a custom SYS address", () => {
    expect(createBasicDataLoader(Uint8Array.from([1, 2, 3]), 49152))
      .toBe("10 FORI=0TO2:READA:POKE49152+I,A:NEXT\n20 SYS 49152\n");
  });

  it("creates a full BASIC DATA program with a custom SYS address", () => {
    const program = createBasicDataProgram(Uint8Array.from([169, 0, 96]), 8192);
    expect(program).toMatch(/POKE8192\+I,A/);
    expect(program).toMatch(/20 SYS 8192/);
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

  it("centers text on a 40-column screen", () => {
    const result = compileInstructions([
      { op: "printCentered", args: [5, "HELLO", 1] }
    ]);

    expect(result.asm).toMatch(/STA \$04D9,X/);
  });
});

describe("inline JS source compilation", () => {
  it("compiles DSL source text and returns BASIC text", async () => {
    const result = await compileJsToC64Outputs(`
      c64.clearScreen();
      c64.borderColor(c64.COLOR_BLUE);
      c64.backgroundColor(c64.COLOR_BLUE);
      c64.textColor(c64.COLOR_WHITE);
      c64.printAt(0, 0, "Hello, C64!");
    `, {
      sysAddress: 49152
    });

    expect(result.origin).toBe(49152);
    expect(result.sysAddress).toBe(49152);
    expect(result.basicText).toMatch(/POKE49152\+I,A/);
    expect(result.basicText).toMatch(/20 SYS 49152/);
    expect(result.asmText).toMatch(/STA \$D020/);
    expect(result.prgBytes).toBeInstanceOf(Uint8Array);
  });

  it("accepts an optional import line in inline source", async () => {
    const result = await compileJsToC64Outputs(`
      import { c64 } from "js-c64";

      c64.borderColor(c64.COLOR_RED);
    `);

    expect(result.asmText).toMatch(/STA \$D020/);
  });

  it("rejects unsupported ESM source in inline compilation", async () => {
    await expect(compileJsToC64Outputs(`
      import { somethingElse } from "./other.js";
      c64.borderColor(c64.COLOR_RED);
    `)).rejects.toThrow(/without ESM import\/export statements/i);
  });

  it("returns BASIC text directly with compileJsToBasicData()", async () => {
    const basicText = await compileJsToBasicData(`
      c64.borderColor(c64.COLOR_BLUE);
    `, {
      sysAddress: 49152
    });

    expect(basicText).toMatch(/POKE49152\+I,A/);
    expect(basicText).toMatch(/20 SYS 49152/);
  });
});

describe("v0.2 comfort helpers", () => {
  it("registers user byte data with a stable label", () => {
    const result = compileInstructions([
      { op: "dataByte", args: ["demo_bytes", [1, 2, 3, 4]] }
    ]);

    expect(result.asm).toMatch(/demo_bytes:/);
    expect(result.asm).toMatch(/\.byte \$01, \$02, \$03, \$04/);
  });

  it("declares byte variables and allows varRef in poke()", () => {
    const result = compileInstructions([
      { op: "varByte", args: ["counter", 0xc100, 7] },
      { op: "poke", args: [{ type: "varRef", name: "counter" }, 9] }
    ]);

    expect(result.asm).toMatch(/STA \$C100/);
    expect(result.bytes).toBeInstanceOf(Uint8Array);
  });

  it("copies named data to memory with dataRef()", () => {
    const result = compileInstructions([
      { op: "dataScreenString", args: ["titleText", "DATA"] },
      { op: "copyDataTo", args: [0x0400, { type: "dataRef", name: "titleText" }, 5] }
    ]);

    expect(result.asm).toMatch(/LDA titleText,X/);
    expect(result.asm).toMatch(/STA \$0400,X/);
    expect(result.asm).toMatch(/titleText:/);
  });

  it("allows copyDataTo() to use a dataRef-carried length", () => {
    const result = compileInstructions([
      { op: "copyDataTo", args: [0x0400, { type: "dataRef", name: "lateText", length: 5 }, undefined] },
      { op: "dataScreenString", args: ["lateText", "DATA"] }
    ]);

    expect(result.asm).toMatch(/LDA lateText,X/);
    expect(result.asm).toMatch(/CPX #\$05/);
  });

  it("supports memsetColor() as a color-memory convenience helper", () => {
    const result = compileInstructions([
      { op: "memsetColor", args: [0xd800, 7, 8] }
    ]);

    expect(result.asm).toMatch(/memset_d800_7_8:/i);
  });

  it("emits a screen fill rectangle with compact row loops", () => {
    const result = compileInstructions([
      { op: "fillRect", args: [0, 0, 4, 2, 81, 1] }
    ]);

    expect(result.asm).toMatch(/memset_400_81_4:/i);
    expect(result.asm).toMatch(/memset_d800_1_4:/i);
  });

  it("emits frame drawing helpers", () => {
    const result = compileInstructions([
      { op: "drawFrame", args: [1, 1, 4, 3, 81, 1] }
    ]);

    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/STA \$0429/);
  });
});

describe("v0.3 sprite helpers", () => {
  it("emits sprite position and high X bit handling", () => {
    const result = compileInstructions([
      { op: "spriteSetX", args: [0, 300] },
      { op: "spriteSetY", args: [0, 120] }
    ]);

    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).toMatch(/ORA #\$01/);
    expect(result.asm).toMatch(/STA \$D001/);
  });

  it("emits sprite data copy and pointer setup", () => {
    const result = compileInstructions([
      { op: "spriteData", args: [0, [1, 2, 3, 4], 0x2000] }
    ]);

    expect(result.asm).toMatch(/LDA sprite_data_0_0,X/);
    expect(result.asm).toMatch(/STA \$2000,X/);
    expect(result.asm).toMatch(/STA \$07F8/);
  });

  it("supports sprite enable, color and expansion flags", () => {
    const result = compileInstructions([
      { op: "spriteColor", args: [0, 2] },
      { op: "spriteExpandX", args: [0, true] },
      { op: "spriteExpandY", args: [0, true] },
      { op: "spriteEnable", args: [0] }
    ]);

    expect(result.asm).toMatch(/STA \$D027/);
    expect(result.asm).toMatch(/STA \$D01D/);
    expect(result.asm).toMatch(/STA \$D017/);
    expect(result.asm).toMatch(/STA \$D015/);
  });
});

describe("v0.4 sprite animation", () => {
  it("installs a sprite animator IRQ and emits sprite motion state", () => {
    const result = compileInstructions([
      { op: "spritePosition", args: [0, 32, 90] },
      { op: "spriteAnimateTo", args: [0, { x: 240, y: 60, speedX: 2, speedY: 1 }] },
      { op: "spriteInstallAnimator", args: [250] }
    ]);

    expect(result.asm).toMatch(/sprite_animator_irq:/);
    expect(result.asm).toMatch(/STA \$0314/);
    expect(result.asm).toMatch(/STA \$0315/);
    expect(result.asm).toMatch(/STA \$C300/);
    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).toMatch(/STA \$D001/);
    expect(result.asm).toMatch(/JMP \$EA31/);
  });

  it("throws when installAnimator() is used without any animation", () => {
    expect(() => compileInstructions([
      { op: "spriteInstallAnimator", args: [250] }
    ])).toThrow(/without any configured sprite animations/i);
  });

  it("throws when animateTo() is used before setting sprite position", () => {
    expect(() => compileInstructions([
      { op: "spriteAnimateTo", args: [0, { x: 240, speedX: 2 }] }
    ])).toThrow(/position is unknown/i);
  });

  it("packs relocated code behind a small BASIC copy loader instead of zero-padding the PRG", () => {
    const code = Uint8Array.from([0xa9, 0x05, 0x8d, 0x20, 0xd0, 0x60]);
    const prg = createPrg(code, 0x4000, 0x0801, 0x4000);
    expect(prg.length).toBeLessThan(128);
    expect(Array.from(prg.slice(-code.length))).toEqual(Array.from(code));
    expect(Array.from(prg.slice(-3))).toEqual([0x20, 0xd0, 0x60]);
    expect(Buffer.from(prg.slice(2, 18)).toString("ascii")).toContain("2064");
    expect(Array.from(prg)).toEqual(expect.arrayContaining([0x4c, 0x00, 0x40]));
  });
});

describe("v0.7 gameplay foundations", () => {
  it("compiles runtime byte math and comparisons", async () => {
    const result = await compileJsToC64Outputs(`
      const x = c64.var.byte("x", { initial: 10 });
      c64.control.if(x.lt(20), () => x.add(2), () => x.sub(1));
    `);

    expect(result.asm).toMatch(/STA \$C100/);
    expect(result.asm).toMatch(/CMP #\$14/);
    expect(result.asm).toMatch(/ADC #\$02/);
    expect(result.asm).toMatch(/SBC #\$01/);
  });

  it("generates one joystick snapshot per game frame", async () => {
    const result = await compileFile("examples/game-loop-input.js");

    expect(result.asm).toMatch(/game_frame_loop:/);
    expect(result.asm).toMatch(/game_frame_wait_leave:/);
    expect(result.asm).toMatch(/LDA \$DC00\s+STA \$C767/);
    expect(result.asm).toMatch(/LDA \$C767\s+AND #\$04/);
    expect(result.asm).toMatch(/LDA \$C769\s+AND #\$10/);
    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).toMatch(/JMP game_frame_loop/);
    expect(result.asm).toMatch(/game_video_detect_pal:/);
    expect(result.asm).toMatch(/STA \$C76F/);
    expect(result.asm).toMatch(/keyboard_scan_pressed_60:/);
    expect(result.asm).toMatch(/user_routine_move_player_left:/);
    expect(result.asm).toMatch(/game_every_run_/);
    expect(result.asm).toMatch(/sid_player_irq:/);
  });

  it("supports runtime words, bools and bit operations", async () => {
    const result = await compileJsToC64Outputs(`
      const score = c64.var.word("score", { initial: 1000 });
      const delta = c64.var.word("delta", { initial: 300 });
      const active = c64.var.bool("active", { initial: true });
      score.add(delta);
      score.inc();
      active.toggle();
      c64.control.if(score.gte(1300), () => active.set(true));
    `);

    expect(result.asm).toMatch(/ADC \$C102/);
    expect(result.asm).toMatch(/ADC \$C103/);
    expect(result.asm).toMatch(/EOR #\$01/);
    expect(result.asm).toMatch(/word_compare_low_/);
  });

  it("accepts signed byte movement constants", async () => {
    const result = await compileJsToC64Outputs(`
      const x = c64.var.byte("x", { initial: 10 });
      x.add(-2);
      x.sub(-3);
    `);

    expect(result.asm).toMatch(/SEC\s+SBC #\$02/);
    expect(result.asm).toMatch(/CLC\s+ADC #\$03/);
  });

  it("supports bounded loops, routines and runtime byte tables", async () => {
    const result = await compileJsToC64Outputs(`
      const index = c64.var.byte("index", { initial: 1 });
      const value = c64.var.byte("value", { initial: 0 });
      const values = c64.table.byte("values", [3, 5, 8]);
      c64.control.routine("bump", () => value.inc());
      values.load(index, value);
      c64.control.repeat(2, () => c64.control.call("bump"));
      c64.control.while(value.lt(10), () => value.inc(), { maxIterations: 8 });
    `);

    expect(result.asm).toMatch(/LDA values,X/);
    expect(result.asm).toMatch(/control_repeat_/);
    expect(result.asm).toMatch(/control_while_/);
    expect(result.asm).toMatch(/JSR user_routine_bump/);
  });

  it("requires a bound for runtime while loops", async () => {
    await expect(compileJsToC64Outputs(`
      const value = c64.var.byte("value", { initial: 0 });
      c64.control.while(value.lt(10), () => value.inc());
    `)).rejects.toThrow(/while maxIterations/i);
  });

  it("rejects user variables overlapping reserved runtime RAM", () => {
    expect(() => compileInstructions([
      { op: "varByte", args: ["bad", 0xc300, 0] }
    ])).toThrow(/reserved sprite animator RAM/i);
  });

  it("rejects more than one game frame loop", async () => {
    await expect(compileJsToC64Outputs(`
      c64.game.frame(() => {});
      c64.game.frame(() => {});
    `)).rejects.toThrow(/only one c64\.game\.frame/i);
  });

  it("rejects compile-time-only sprite movement inside the frame loop", async () => {
    await expect(compileJsToC64Outputs(`
      c64.sprite.position(0, 100, 100);
      c64.game.frame(() => c64.sprite.moveX(0, 1));
    `)).rejects.toThrow(/spriteMoveX cannot be used inside c64\.game\.frame/i);
  });

  it("allows the SID IRQ player to coexist with the game frame loop", async () => {
    const result = await compileJsToC64Outputs(`
      c64.sid.playSong({ tempo: 4, voices: [["C4"], ["R"], ["R"]] });
      c64.game.frame(() => {});
    `);

    expect(result.asm.indexOf("STA $0314")).toBeLessThan(result.asm.indexOf("game_frame_loop:"));
    expect(result.asm).toMatch(/sid_player_vic_raster:/);
    expect(result.asm).toMatch(/JMP \$EA81/);
  });
});

describe("v0.8 gameplay sprites", () => {
  it("supports 9-bit runtime X, signed velocity, bounds and frame animation", async () => {
    const result = await compileJsToC64Outputs(`
      const frames = c64.sprite.frames("runner", [Array(63).fill(1), Array(63).fill(2)]);
      const runner = c64.sprite.create(0, {
        x: 300, y: 100, frames, color: c64.COLOR_RED,
        minX: 24, maxX: 320, minY: 50, maxY: 220, bounceX: true
      });
      runner.sequence("walk", [0, 1], { speed: 4, loop: true });
      runner.play("walk");
      runner.setVelocity(2, 0);
      c64.game.frame(() => runner.update());
    `);

    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).toMatch(/STA \$D010/);
    expect(result.asm).toMatch(/sprite_sequence_0_walk:/);
    expect(result.asm).toMatch(/LDA sprite_sequence_0_walk,X/);
    expect(result.asm).toMatch(/sprite_x_clamp_max_/);
  });

  it("generates AABB and centralized VIC collision checks", async () => {
    const result = await compileJsToC64Outputs(`
      const shape = Array(63).fill(255);
      const a = c64.sprite.create(0, { x: 100, y: 100, data: shape, hitbox: { width: 8, height: 8 } });
      const b = c64.sprite.create(1, { x: 104, y: 104, data: shape, hitbox: { width: 8, height: 8 } });
      c64.game.frame(() => {
        c64.control.if(a.collides(b), () => a.reverseX());
        c64.control.if(a.vicCollides(b), () => a.reverseY());
      });
    `);

    expect(result.asm).toMatch(/STA \$C7A0/);
    expect(result.asm).toMatch(/LDA \$D01E\s+STA \$C7B0/);
    expect(result.asm.match(/LDA \$D01E/g)).toHaveLength(1);
    expect(result.asm).toMatch(/aabb_greater_/);
    expect(result.asm).not.toMatch(/runtime_sprite_aabb_compare:/);
  });

  it("rejects X coordinates outside the VIC-II 9-bit range", () => {
    expect(() => compileInstructions([
      { op: "spriteSetX", args: [0, 512] }
    ])).toThrow(/between 0 and 511/i);
  });

  it("rejects ambiguous sprite velocities outside the signed byte range", async () => {
    await expect(compileJsToC64Outputs(`
      c64.sprite.create(0, { x: 100, y: 100, vx: 128 });
    `)).rejects.toThrow(/signed byte between -128 and 127/i);
  });

  it("keeps the generated eight-sprite update path inside the v0.8 budget", async () => {
    const declarations = Array.from({ length: 8 }, (_, index) =>
      `const sprite${index} = c64.sprite.create(${index}, { x: ${40 + index * 32}, y: 100, vx: 1, minX: 24, maxX: 320 });`
    ).join("\n");
    const updates = Array.from({ length: 8 }, (_, index) => `sprite${index}.update();`).join("\n");
    const result = await compileJsToC64Outputs(`${declarations}\nc64.game.frame(() => { ${updates} });`);

    expect(result.asm).toMatch(/sprite_update_active_7_/);
    expect(result.asm.match(/JSR runtime_sprite_sync_/g)).toHaveLength(16);
    expect(result.asm.match(/STA \$D010/g)?.length).toBeGreaterThanOrEqual(16);
    // Static audit of the emitted active path: <= 220 cycles per sprite,
    // therefore <= 1760 cycles for movement and VIC synchronization of all 8.
    expect(result.bytes.length).toBeLessThan(5000);
  });

  it("uses balanced shared routines and deduplicated assets in breakout-mini", async () => {
    const result = await compileFile("examples/breakout-mini.js");

    expect(result.prgBytes.length).toBeLessThan(3500);
    expect(result.asm.match(/JSR runtime_sprite_aabb_compare/g)).toHaveLength(6);
    expect(result.asm.match(/JSR runtime_sid_click/g)).toHaveLength(5);
    expect(result.asm.match(/^sprite_data_[2-6]_\d+:/gm)).toHaveLength(1);
    expect(result.asm).toMatch(/runtime_sprite_aabb_compare:/);
    expect(result.asm).toMatch(/runtime_sid_click:/);
  });

  it("pools identical sprite pixels unless an explicit address requests independent RAM", async () => {
    const shared = await compileJsToC64Outputs(`
      const pixels = Array(63).fill(7);
      c64.sprite.create(0, { data: pixels });
      c64.sprite.create(1, { data: pixels });
    `);
    const independent = await compileJsToC64Outputs(`
      c64.sprite.create(0, { data: Array(63).fill(7), dataAddress: 0x2000 });
      c64.sprite.create(1, { data: Array(63).fill(7), dataAddress: 0x2040 });
    `);

    expect(shared.asm.match(/^sprite_data_\d+_\d+:/gm)).toHaveLength(1);
    expect(independent.asm.match(/^sprite_data_\d+_\d+:/gm)).toHaveLength(2);
    expect(shared.asm).not.toMatch(/runtime_sprite_sync_0:/);
  });
});

describe("example compatibility", () => {
  it("compiles every shipped JavaScript example", async () => {
    const files = (await fs.readdir("examples"))
      .filter((fileName) => fileName.endsWith(".js") && fileName !== "c64.js")
      .sort();

    for (const fileName of files) {
      const result = await compileFile(`examples/${fileName}`);
      expect(result.bytes.length, fileName).toBeGreaterThan(0);
    }
  });
});

describe("v0.8.2 virtual sprite multiplexer", () => {
  it("compiles 16 logical sprites through one compact Y-sorted renderer", async () => {
    const result = await compileFile("examples/sprite-multiplex-16.js");

    expect(result.prgBytes.length).toBeLessThan(2500);
    expect(result.asm.match(/runtime_sprite_mux_render:/g)).toHaveLength(1);
    expect(result.asm.match(/JSR runtime_sprite_mux_render/g)).toHaveLength(1);
    expect(result.asm).toMatch(/runtime_sprite_mux_sort:/);
    expect(result.asm).toMatch(/runtime_sprite_mux_schedule_next:/);
    expect(result.asm).toMatch(/runtime_sprite_mux_wait_safe_raster:/);
    expect(result.asm).not.toMatch(/runtime_sprite_mux_wait_low_raster:/);
    expect(result.asm).toMatch(/CMP #\$C8/);
    expect(result.asm).toMatch(/LDA \$C500,Y/);
    expect(result.asm).toMatch(/LDA \$C405,Y/);
    expect(result.asm).toMatch(/STA \$C444/);
  });

  it("sorts independently from logical indexes and accounts for expanded height", async () => {
    const result = await compileJsToC64Outputs(`
      const pixels = Array(63).fill(1);
      c64.sprite.create(0, { x: 40, y: 190, data: pixels });
      c64.sprite.create(8, { x: 80, y: 60, data: pixels, expandY: true });
      c64.sprite.create(15, { x: 120, y: 130, data: pixels });
      c64.game.frame(() => {});
    `);
    expect(result.asm).toMatch(/runtime_sprite_mux_sort_insert:/);
    expect(result.asm).toMatch(/runtime_sprite_mux_normal_height:/);
    expect(result.asm).toMatch(/LDA #\$2D/);
    expect(result.asm).toMatch(/LDA #\$18/);
  });

  it("accepts logical sprite 15 and rejects sprite 16", async () => {
    await expect(compileJsToC64Outputs(`
      c64.sprite.create(15, { x: 100, y: 180, data: Array(63).fill(1) });
      c64.game.frame(() => {});
    `)).resolves.toMatchObject({ bytes: expect.any(Uint8Array) });
    await expect(compileJsToC64Outputs(`
      c64.sprite.create(16, { x: 100, y: 180 });
    `)).rejects.toThrow(/between 0 and 15/i);
  });

  it("requires a game frame and keeps software AABB available", async () => {
    await expect(compileJsToC64Outputs(`
      c64.sprite.create(8, { x: 100, y: 180 });
    `)).rejects.toThrow(/require one c64\.game\.frame/i);

    const result = await compileJsToC64Outputs(`
      const pixels = Array(63).fill(1);
      const top = c64.sprite.create(0, { x: 100, y: 80, data: pixels });
      const bottom = c64.sprite.create(8, { x: 100, y: 180, data: pixels });
      c64.game.frame(() => c64.control.if(top.collides(bottom), () => bottom.disable()));
    `);
    expect(result.asm).toMatch(/aabb_greater_/);
  });

  it("rejects ambiguous VIC collision registers while multiplexing", async () => {
    await expect(compileJsToC64Outputs(`
      const a = c64.sprite.create(0, { x: 100, y: 80 });
      const b = c64.sprite.create(8, { x: 100, y: 180 });
      c64.game.frame(() => c64.control.if(a.vicCollides(b), () => a.disable()));
    `)).rejects.toThrow(/vicCollides.*unavailable.*multiplexing/i);
  });

  it("rejects mixing virtual sprites with the legacy direct hardware API", async () => {
    await expect(compileJsToC64Outputs(`
      c64.sprite.create(8, { x: 100, y: 180 });
      c64.sprite.position(0, 100, 80);
      c64.game.frame(() => {});
    `)).rejects.toThrow(/cannot be mixed.*legacy direct/i);
  });
});

describe("v0.9 static charset and map assets", () => {
  it("loads JSON relative to the source file and emits charset plus map data", async () => {
    const result = await compileFile("examples/tilemap-static.js");
    expect(result.asm).toMatch(/asset_charset_copy_\d+:/);
    expect(result.asm).toMatch(/STA \$3000,X/);
    expect(result.asm).toMatch(/STA \(\$FD\),Y/);
    expect(result.asm).toMatch(/AND #\$F1/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "charset", address: 0x3000, bytes: 2048, characters: 3 }),
      expect.objectContaining({ type: "map", mapWidth: 10, mapHeight: 6, screenWidth: 20, screenHeight: 12, tileCount: 3 })
    ]));
    expect(result.asm.match(/asset_bytes_\d+:/g)?.length).toBeLessThan(20);
  });

  it("validates charset alignment, tile indexes and screen bounds", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0] }],
        map: { width: 1, height: 1, data: [0] }
      });
      c64.charset.use(level.charset, { address: 0x3100 });
    `)).rejects.toThrow(/aligned to \$0800/i);

    await expect(compileJsToC64Outputs(`
      c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0] }],
        map: { width: 1, height: 1, data: [1] }
      });
    `)).rejects.toThrow(/missing tile 1/i);

    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0] }],
        map: { width: 2, height: 1, data: [0,0] }
      });
      c64.map.draw(level, { x: 39, y: 0 });
    `)).rejects.toThrow(/does not fit/i);
  });

  it("queries the logical collision layer with runtime tile coordinates", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [
          { chars: [0], collision: 0 },
          { chars: [0], collision: 1, properties: { solid: true } }
        ],
        map: { width: 3, height: 2, data: [1,0,0,0,1,0] }
      });
      const tileX = c64.var.byte("tileX", { initial: 1 });
      const tileY = c64.var.byte("tileY", { initial: 1 });
      c64.game.frame(() => {
        const tile = c64.map.tileAt(level, tileX, tileY);
        c64.control.if(tile.isSolid(), () => tileX.set(0));
      });
    `);
    expect(result.asm).toMatch(/STA \$8000,X/);
    expect(result.asm).toMatch(/asset_map_collisions_\d+:/);
    expect(result.asm).toMatch(/ASL \$C7B7[\s\S]*ROL \$C7BF/);
    expect(result.asm).not.toMatch(/map_index_rows_/);
  });

  it("reads, writes and redraws callable two-dimensional map cells", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0], [255,255,255,255,255,255,255,255]] },
        tiles: [{ chars: [0], colors: [0] }, { chars: [1], colors: [7], collision: 1 }],
        map: { width: 4, height: 3, data: [0,0,0,0,0,0,0,0,0,0,0,0] }
      });
      const x = c64.var.byte("mapX", { initial: 1 });
      const y = c64.var.byte("mapY", { initial: 1 });
      const value = c64.var.byte("mapValue", { initial: 0 });
      c64.game.init(() => c64.map.draw(level));
      c64.game.frame(() => {
        level.map(x, y).set(1);
        level.map(x, y).load(value);
        c64.control.if(level.map(x, y).eq(1), () => value.set(2));
        level.map.redraw();
      });
    `);
    expect(result.asm).toMatch(/STA \$8000,X/);
    expect(result.asm).toMatch(/STA \(\$FB\),Y/);
    expect(result.asm).toMatch(/LDA \(\$FB\),Y/);
    expect(result.asm.match(/runtime_map_draw_tile_\d+:/g)).toHaveLength(1);
    expect(result.asm.match(/runtime_map_redraw_\d+:/g)).toHaveLength(1);
    expect(result.asm).toMatch(/STA \(\$FB\),Y/);
    expect(result.asm).toMatch(/STA \(\$FD\),Y/);
  });

  it("compiles the playable dynamic-map Tetris example", async () => {
    const result = await compileFile("examples/tetris-mini.js");
    expect(result.prgBytes.length).toBeLessThan(7000);
    expect(result.asm).toMatch(/user_routine_drop_piece:/);
    expect(result.asm).toMatch(/user_routine_rotate_piece:/);
    expect(result.asm).toMatch(/runtime_map_draw_tile_0:/);
    expect(result.asm).toMatch(/asset_map_initial_copy_/);
  });

  it("uses a 16-bit pointer for mutable maps larger than 256 cells", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0] }],
        map: { width: 20, height: 15, data: Array(300).fill(0) }
      });
      const x = c64.var.byte("largeMapX", { initial: 19 });
      const y = c64.var.byte("largeMapY", { initial: 14 });
      const value = c64.var.byte("largeMapValue", { initial: 0 });
      c64.game.frame(() => { level.map(x, y).set(0); level.map(x, y).load(value); });
    `);
    expect(result.asm).toMatch(/STA \$C7BA/);
    expect(result.asm).toMatch(/LDA \(\$FB\),Y/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-runtime", bytes: 300, indexBits: 16, address: 0x8000 })
    ]));
  });

  it("converts pixel, character and tile coordinates at runtime", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] }, tileWidth: 2, tileHeight: 2,
        tiles: [{ chars: [0,0,0,0] }], map: { width: 2, height: 2, data: [0,0,0,0] }
      });
      const px = c64.var.word("coordinatePixelX", { initial: 319 });
      const py = c64.var.byte("coordinatePixelY", { initial: 80 });
      const tx = c64.var.byte("coordinateTileX", { initial: 0 });
      const ty = c64.var.byte("coordinateTileY", { initial: 0 });
      const cx = c64.var.byte("coordinateCharX", { initial: 0 });
      const cy = c64.var.byte("coordinateCharY", { initial: 0 });
      c64.game.frame(() => {
        c64.map.pixelToTile(level, { x: px, y: py }, { x: tx, y: ty });
        c64.map.tileToCharacter(level, { x: tx, y: ty }, { x: cx, y: cy });
      });
    `);
    expect(result.asm).toMatch(/map_convert_divide_/);
    expect(result.asm).toMatch(/map_convert_multiply_/);
  });

  it("enables multicolor charset mode and preserves object metadata", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ version: 1,
        charset: { mode: "multicolor", characters: [[0,85,170,255,0,85,170,255]] },
        tiles: [{ chars: [0], colors: [6] }],
        map: { width: 1, height: 1, data: [0], objects: [{ type: "spawn", x: 0, y: 0, properties: { enemy: true } }] }
      });
      c64.charset.use(level.charset, { address: 0x3000, background: 0, multicolor1: 5, multicolor2: 10 });
      c64.map.draw(level);
    `);
    expect(result.asm).toMatch(/ORA #\$10/);
    expect(result.asm).toMatch(/STA \$D022/);
    expect(result.asm).toMatch(/STA \$D023/);
    expect(result.asm).toMatch(/ORA #\$08/);
    expect(result.assetReport).toEqual(expect.arrayContaining([expect.objectContaining({ type: "map-runtime", objects: 1 })]));
  });

  it("reports memory ranges and rejects actual overlaps", async () => {
    const result = await compileJsToC64Outputs(`c64.var.byte("safeMemory", { initial: 1 });`);
    expect(result.assetReport.at(-1)).toEqual(expect.objectContaining({ type: "memory-layout", conflicts: [] }));
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 1, height: 1, data: [0] } });
      c64.charset.use(level.charset, { address: 0x0800 });
    `)).rejects.toThrow(/memory overlap/i);
  });

  it("compiles the Snake and multicolor maze exit examples", async () => {
    const snake = await compileFile("examples/snake.js");
    const maze = await compileFile("examples/maze-game.js");
    const snakeSource = await fs.readFile("examples/snake.js", "utf8");
    const snakeAsset = JSON.parse(await fs.readFile("examples/assets/snake-room.json", "utf8"));
    const playerSpawn = snakeAsset.map.objects.find((object) => object.type === "player-spawn");
    const foodSpawn = snakeAsset.map.objects.find((object) => object.type === "food-spawn");
    expect(snakeAsset.map.data[playerSpawn.y * snakeAsset.map.width + playerSpawn.x]).toBe(0);
    expect(snakeAsset.map.data[foodSpawn.y * snakeAsset.map.width + foodSpawn.x]).toBe(0);
    expect(snakeSource).toMatch(/const speed = 6/);
    expect(snakeSource).toMatch(/playerSpawn\.properties\.direction/);
    expect(snakeSource).toMatch(/control\.while\(foodPlaced\.eq\(false\)/);
    expect(snake.assetReport).toEqual(expect.arrayContaining([expect.objectContaining({ type: "map-runtime", bytes: 300, objects: 2 })]));
    expect(maze.asm).toMatch(/ORA #\$10/);
    expect(snake.prgBytes.length).toBeLessThan(6000);
    expect(maze.prgBytes.length).toBeLessThan(6000);
  });
});

describe("v0.10 scrolling and viewport", () => {
  it("draws a bounded runtime viewport from a map larger than 256 cells", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0], [255,255,255,255,255,255,255,255]] },
        tiles: [{ chars: [0], colors: [0] }, { chars: [1], colors: [7], collision: 1 }],
        map: { width: 48, height: 10, data: Array.from({ length: 480 }, (_, index) => index % 48 === 0 || index % 48 === 47 ? 1 : 0) }
      });
      const cameraX = c64.var.byte("viewportCameraX", { initial: 0 });
      c64.game.init(() => c64.map.drawViewport(level, { sourceX: cameraX, sourceY: 0, width: 20, height: 10, x: 1, y: 5 }));
      c64.game.frame(() => c64.map.drawViewport(level, { sourceX: cameraX, sourceY: 0, width: 20, height: 10, x: 1, y: 5 }));
    `);
    expect(result.asm).toMatch(/runtime_map_viewport_0:/);
    expect(result.asm).toMatch(/map_viewport_x_ok_/);
    expect(result.asm).toMatch(/STA \(\$FB\),Y/);
    expect(result.asm).toMatch(/STA \(\$FD\),Y/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-runtime", bytes: 480, indexBits: 16 }),
      expect.objectContaining({ type: "map-viewport", width: 20, height: 10, visibleTiles: 200, strategy: "coarse-full-redraw", palFrameBudget: 19656 })
    ]));
  });

  it("rejects a viewport that exceeds the map or C64 screen", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 10, height: 10, data: Array(100).fill(0) } });
      c64.map.drawViewport(level, { width: 11, height: 10 });
    `)).rejects.toThrow(/viewport dimensions/i);
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 20, height: 10, data: Array(200).fill(0) } });
      c64.map.drawViewport(level, { width: 20, height: 10, x: 25 });
    `)).rejects.toThrow(/does not fit/i);
  });

  it("compiles a raster-banded bidirectional X/Y scroller with streamed Screen and Color RAM", async () => {
    const result = await compileFile("examples/tilemap-scroll-x.js");
    expect(result.asm).toMatch(/runtime_map_scroll_apply_0:/);
    expect(result.asm).toMatch(/LDA \$D016[\s\S]*AND #\$F0[\s\S]*STA \$D016/);
    expect(result.asm).toMatch(/LDA \$D011[\s\S]*AND #\$F0[\s\S]*STA \$D011/);
    expect(result.asm).toMatch(/runtime_map_scroll_restore_0:/);
    expect(result.asm).toMatch(/irq_handler_0:[\s\S]*JSR runtime_map_scroll_apply_0/);
    expect(result.asm).toMatch(/irq_handler_1:[\s\S]*JSR runtime_map_scroll_prepare_panel_0/);
    expect(result.asm).not.toMatch(/irq_handler_2:/);
    const preparePanel = result.asm.match(/runtime_map_scroll_prepare_panel_0:[\s\S]*?RTS/)?.[0] ?? "";
    const leaveScroller = result.asm.match(/runtime_map_scroll_leave_0:[\s\S]*?RTS/)?.[0] ?? "";
    expect(preparePanel).toMatch(/runtime_map_scroll_wait_normalize_0:[\s\S]*CMP #\$95[\s\S]*AND #\$F0[\s\S]*ORA #\$07[\s\S]*STA \$D011/);
    expect(preparePanel).toMatch(/runtime_map_scroll_wait_blank_0:[\s\S]*CMP #\$96[\s\S]*AND #\$F0[\s\S]*ORA #\$0E[\s\S]*STA \$D018/);
    expect(preparePanel).toMatch(/runtime_map_scroll_wait_den_off_0:[\s\S]*CMP #\$9E[\s\S]*AND #\$E0[\s\S]*ORA #\$07[\s\S]*STA \$D011/);
    expect(preparePanel).toMatch(/runtime_map_scroll_wait_panel_y_0:[\s\S]*CMP #\$A0[\s\S]*STA \$D011[\s\S]*STA \$D018/);
    expect(preparePanel).toMatch(/runtime_map_scroll_wait_panel_x_0:[\s\S]*CMP #\$A2[\s\S]*STA \$D016/);
    expect(result.asm).toMatch(/LDX #\$00[\s\S]*map_scroll_blank_charset_\d+:[\s\S]*STA \$3800,X[\s\S]*STA \$3F00,X/);
    expect(leaveScroller).toMatch(/STA \$D016/);
    expect(leaveScroller).not.toMatch(/STA \$D011/);
    expect(result.asm).toMatch(/runtime_map_scroll_shift_left_0:/);
    expect(result.asm).toMatch(/runtime_map_scroll_shift_right_0:/);
    expect(result.asm).toMatch(/runtime_map_scroll_shift_up_0:/);
    expect(result.asm).toMatch(/runtime_map_scroll_shift_down_0:/);
    expect(result.asm).toMatch(/LDA \$05[0-9A-F]{2},X[\s\S]*STA \$05[0-9A-F]{2},X/);
    expect(result.asm).toMatch(/LDA \$D9[0-9A-F]{2},X[\s\S]*STA \$D9[0-9A-F]{2},X/);
    // Paired row copies spend a little more code to keep coarse-scroll color
    // updates inside the raster budget without duplicating whole routines.
    expect(result.prgBytes.length).toBeLessThan(4400);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "map-scroll",
        strategy: "fine-scroll-xy-stream",
        panel: "bottom",
        height: 7,
        configuredHeight: 8,
        panelRows: 11,
        panelScreenRow: 14,
        exitRasterLine: 162,
        prepareRasterLine: 140,
        normalizeRasterLine: 149,
        blankRasterLine: 150,
        denOffRasterLine: 158,
        panelRasterLine: 160,
        recommendedFrameRasterLine: 166,
        assumedRasterLine: 166,
        horizontalWrapFitsPal: true,
        horizontalWrapFitsNtsc: true,
        verticalWrapFitsPal: true,
        verticalWrapFitsNtsc: true,
        verticalUpWrapFitsPal: true,
        verticalUpWrapFitsNtsc: true,
        verticalDownWrapFitsPal: true,
        verticalDownWrapFitsNtsc: true,
        verticalPhaseTransitionLines: 23,
        transitionRows: 1,
        panelMemoryRowOffset: -1,
        guardRasterLines: 8,
        guardColor: "background",
        blankCharsetAddress: 0x3800,
        beamRacedRows: true,
        kernalTimerDisabled: true,
        irqTiming: "vic-only",
        stateBytes: 11
      })
    ]));
    const scrollReport = result.assetReport.find((entry) => entry.type === "map-scroll");
    const panelStart = scrollReport.exitRasterLine + 1;
    const vcBaseAtPanel = (fineY) => {
      let rowCounter = 7;
      let vcBase = 0;
      let displayState = false;
      let phase = fineY;
      let displayEnabled = true;
      for (let raster = 48; raster <= panelStart; raster += 1) {
        if (raster === scrollReport.normalizeRasterLine) phase = 7;
        if (raster === scrollReport.denOffRasterLine) displayEnabled = false;
        if (raster === scrollReport.panelRasterLine) {
          displayEnabled = true;
          phase = 3;
        }
        if (raster === panelStart) return vcBase;
        const badLine = displayEnabled && (raster & 7) === phase;
        let videoCounter = vcBase;
        if (badLine) {
          rowCounter = 0;
          displayState = true;
        }
        if (displayState) videoCounter += 40;
        if (rowCounter === 7) {
          displayState = false;
          vcBase = videoCounter;
        }
        if (displayState) rowCounter = (rowCounter + 1) & 7;
      }
      return vcBase;
    };
    expect(Array.from({ length: 8 }, (_, fineY) => vcBaseAtPanel(fineY))).toEqual(Array(8).fill((scrollReport.panelScreenRow - 1) * 40));
    expect(result.asm).toMatch(/STA \$0701,X/);
    expect(result.asm).toMatch(/STA \$074B,X/);
    expect(result.asm).toMatch(/game_frame_wait_target:[\s\S]*CMP #\$A6/);
    expect(result.asm).toMatch(/LDA #\$7F[\s\S]*STA \$DC0D[\s\S]*STA \$DD0D/);
    expect(result.asm).not.toMatch(/JMP \$EA31/);
  });

  it("reserves hidden side columns and rejects metatiles wider than one character", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 48, height: 8, data: Array(384).fill(0) } });
      c64.map.horizontalScroller(level, { width: 39, height: 8, x: 0 });
    `)).rejects.toThrow(/columns 1\.\.38/i);
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ tileWidth: 2, charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0,0] }], map: { width: 20, height: 8, data: Array(160).fill(0) } });
      c64.map.horizontalScroller(level, { width: 10, height: 8, x: 1 });
    `)).rejects.toThrow(/1x1-character tiles/i);
  });

  it("supports a fixed bottom panel and shares the dispatcher with a user raster IRQ", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0], colors: [1] }],
        map: { width: 32, height: 16, data: Array(512).fill(0) }
      });
      const scroll = c64.map.scroller(level, { width: 20, height: 8, x: 1, y: 1, panel: "bottom" });
      c64.irq.raster(80, () => c64.borderColor(c64.COLOR_BLUE));
      c64.irq.install();
      c64.game.init(() => scroll.draw());
      c64.game.frame(() => scroll.down());
    `);
    expect(result.asm).toMatch(/irq_handler_0:/);
    expect(result.asm).toMatch(/irq_handler_1:/);
    expect(result.asm).toMatch(/irq_handler_2:/);
    expect(result.asm).not.toMatch(/irq_handler_3:/);
    expect(result.asm).toMatch(/STA \$D020/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-scroll", panel: "bottom" })
    ]));
  });

  it("rejects vertical fine scrolling below a fixed top character panel until FLD compensation exists", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0] }],
        map: { width: 24, height: 16, data: Array(384).fill(0) }
      });
      const scroll = c64.map.scroller(level, { width: 20, height: 8, x: 1, y: 6, panel: "top" });
      c64.game.init(() => scroll.draw());
      c64.game.frame(() => scroll.down());
    `)).rejects.toThrow(/requires panel: "bottom"/i);
  });

  it("rejects a vertical direction that cannot beat the PAL raster beam", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 80, height: 30, data: Array(2400).fill(0) } });
      const scroll = c64.map.scroller(level, { width: 38, x: 1, panel: { bottom: 5 } });
      c64.game.init(() => scroll.draw());
      c64.game.frame(() => scroll.up());
    `)).rejects.toThrow(/vertical scroll up exceeds the PAL raster budget/i);
  });

  it("supports an exact panel row count while keeping string panels compatible", async () => {
    const bottom = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 32, height: 30, data: Array(960).fill(0) } });
      const scroll = c64.map.scroller(level, { width: 20, x: 1, panel: { position: "bottom", rows: 2 } });
      c64.game.init(() => scroll.draw());
      c64.game.frame(() => scroll.down());
    `);
    expect(bottom.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "map-scroll",
        panel: "bottom",
        panelRows: 2,
        height: 22,
        configuredHeight: 23,
        prepareRasterLine: 212,
        normalizeRasterLine: 221,
        blankRasterLine: 222,
        denOffRasterLine: 230,
        panelRasterLine: 232,
        exitRasterLine: 234,
        transitionRows: 1,
        panelMemoryRowOffset: -1
      })
    ]));

    const top = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 32, height: 25, data: Array(800).fill(0) } });
      const scroll = c64.map.scroller(level, { width: 20, x: 1, panel: { top: 5 } });
      c64.game.init(() => scroll.draw());
      c64.game.frame(() => scroll.right());
    `);
    expect(top.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-scroll", panel: "top", panelRows: 5, height: 20, panelRasterLine: null })
    ]));

    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 32, height: 25, data: Array(800).fill(0) } });
      c64.map.scroller(level, { width: 20, x: 1, panel: { position: "bottom", rows: 25 } });
    `)).rejects.toThrow(/panel\.rows must be between 1 and 24/);
  });
});

describe("v0.10.1 map entities foundation", () => {
  it("normalizes reusable sprite assets and validates named animation references", async () => {
    const { normalizeSpriteAsset } = await import("../src/assets.js");
    const sprite = normalizeSpriteAsset({
      version: 1,
      id: "hero",
      mode: "multicolor",
      color: 7,
      multicolor1: 5,
      multicolor2: 10,
      origin: { x: 12, y: 20 },
      hitbox: { offsetX: 4, offsetY: 1, width: 16, height: 20 },
      frames: [
        { id: "idle", data: Array(63).fill(0) },
        { id: "step", data: Array(63).fill(1) }
      ],
      animations: { "run-right": { frames: ["idle", "step"], speed: 4, loop: true } },
      initialAnimation: "run-right"
    }, "hero.sprite.json");
    expect(sprite).toEqual(expect.objectContaining({
      type: "spriteAsset", id: "hero", mode: "multicolor", color: 7,
      multicolor1: 5, multicolor2: 10, initialAnimation: "run-right"
    }));
    expect(sprite.animations["run-right"].frames).toEqual([0, 1]);
    expect(() => normalizeSpriteAsset({
      version: 1, id: "broken", mode: "hires",
      frames: [{ id: "idle", data: Array(63).fill(0) }],
      animations: { run: { frames: ["missing"] } }
    }, "broken.sprite.json")).toThrow(/broken\.sprite\.json.*missing frame missing/i);
  });

  it("normalizes stable object ids and exact world pixel coordinates", async () => {
    const { normalizeMapAsset } = await import("../src/assets.js");
    const asset = normalizeMapAsset({
      version: 1,
      charset: { characters: [[0,0,0,0,0,0,0,0]] },
      tileWidth: 2,
      tileHeight: 3,
      tiles: [{ chars: [0,0,0,0,0,0] }],
      map: {
        width: 8,
        height: 8,
        data: Array(64).fill(0),
        objects: [
          { id: "hero", type: "player-spawn", x: 3, y: 2, sprite: "hero-sprite", properties: { direction: "right" } },
          { type: "enemy-spawn", x: 5, y: 4 }
        ]
      }
    });
    expect(asset.map.objects[0]).toEqual(expect.objectContaining({
      id: "hero", type: "player-spawn", x: 3, y: 2, worldX: 48, worldY: 48, sprite: "hero-sprite"
    }));
    expect(asset.map.objects[1]).toEqual(expect.objectContaining({ id: "enemy-spawn-2", worldX: 80, worldY: 96 }));
    expect(() => normalizeMapAsset({
      charset: { characters: [[0,0,0,0,0,0,0,0]] },
      tiles: [{ chars: [0] }],
      map: { width: 2, height: 1, data: [0,0], objects: [
        { id: "same", type: "a", x: 0, y: 0 }, { id: "same", type: "b", x: 1, y: 0 }
      ] }
    })).toThrow(/duplicates same/);
  });

  it("spawns a logical sprite from a map object and projects 16-bit world coordinates", async () => {
    const result = await compileFile("examples/map-entity-spawn.js");
    expect(result.asm).toMatch(/map_entity_x_/);
    expect(result.asm).toMatch(/map_entity_y_/);
    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).toMatch(/STA \$D001/);
    expect(result.asm).toMatch(/runtime_map_entity_move_\d+:/);
    expect(result.asm).toMatch(/runtime_map_entity_point_solid_0:/);
    expect(result.asm).toMatch(/LDA asset_map_collisions_0,X/);
    expect(result.asm).toMatch(/runtime_map_entity_\d+_ground_probe/);
    expect(result.asm).toMatch(/sprite_sequence_0_idle-right:/);
    expect(result.asm).toMatch(/sprite_sequence_0_run-right:/);
    expect(result.asm).toMatch(/sprite_play_start_0_0_/);
    expect(result.asm).toMatch(/sprite_play_start_0_1_/);
    expect(result.asm).toMatch(/sprite_anim_advance_0_/);
    expect(result.asm).toMatch(/map_camera_follow_x_/);
    expect(result.asm).not.toMatch(/map_camera_follow_y_/);
    // Screen column 1 starts at VIC X=32 and XSCROLL=7 adds the exact
    // fine-scroll phase used by the character map: 24 + 8 + 7 = 39 ($27).
    expect(result.asm).toMatch(/map_entity_x_visible_\d+:[\s\S]*ADC #\$27/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "map-entity", objectType: "player-spawn", sprite: 0,
        spriteAsset: "hero", initialAnimation: "idle-right",
        worldX: 24, worldY: 128, coordinateBits: 16
      })
    ]));
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "sprite-asset", id: "hero", mode: "hires", frames: 2,
        animations: ["idle-right", "run-right"], bytes: 128,
        hitbox: { offsetX: 4, offsetY: 1, width: 16, height: 20 }
      }),
      expect.objectContaining({
        type: "map-runtime", bytes: 1600, indexBits: 16
      }),
      expect.objectContaining({
        type: "map-scroll", width: 38, height: 20,
        panel: "bottom", panelRows: 5
      }),
      expect.objectContaining({
        type: "map-camera-follow", entity: "player", axis: "x",
        deadZone: { x: 104, y: 48, width: 96, height: 64 }, maxSpeed: 2,
        coordinateBits: 16, clampToMap: true
      })
    ]));
  });

  it("reports a map object that references an unloaded sprite asset", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0] }],
        map: { width: 2, height: 1, data: [0,0], objects: [
          { id: "player", type: "player-spawn", x: 0, y: 0, sprite: "missing_hero" }
        ] }
      });
      c64.map.spawn(level, "player", { sprite: 0 });
    `)).rejects.toThrow(/<inline>: map\.objects\["player"\]\.sprite references missing sprite asset missing_hero/i);

    await expect(compileJsToC64Outputs(`
      c64.assets.defineSprite({ version: 1, id: "red", mode: "multicolor", color: 2, multicolor1: 5, multicolor2: 6, frames: [{ id: "idle", data: Array(63).fill(0) }] });
      c64.assets.defineSprite({ version: 1, id: "blue", mode: "multicolor", color: 6, multicolor1: 3, multicolor2: 4, frames: [{ id: "idle", data: Array(63).fill(0) }] });
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 2, height: 1, data: [0,0], objects: [
        { id: "a", type: "actor", x: 0, y: 0, sprite: "red" }, { id: "b", type: "actor", x: 1, y: 0, sprite: "blue" }
      ] } });
      c64.map.spawn(level, "a", { sprite: 0 });
      c64.map.spawn(level, "b", { sprite: 1 });
    `)).rejects.toThrow(/multicolor sprite colors conflict/i);
  });

  it("generates bounded pixel steps and validates collision hitboxes", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] },
        tiles: [{ chars: [0], collision: 0 }, { chars: [0], collision: 7 }],
        map: { width: 8, height: 4, data: [1,1,1,1,1,1,1,1, 1,0,0,0,0,0,0,1, 1,0,0,0,0,0,0,1, 1,1,1,1,1,1,1,1],
          objects: [{ id: "player", type: "player-spawn", x: 2, y: 1 }] }
      });
      const player = c64.map.spawn(level, "player", {
        sprite: 0,
        spriteOptions: { hitbox: { offsetX: 4, offsetY: 1, width: 16, height: 20 } },
        maxCollisionSpeed: 6
      });
      c64.game.frame(() => {
        player.moveAndCollide(6, 5);
        c64.control.if(player.isOnGround(), () => player.jump(4));
        player.project();
      });
    `);
    expect(result.asm).toMatch(/CMP #\$07/);
    expect(result.asm).toMatch(/runtime_map_entity_\d+_x_positive_hit:/);
    expect(result.asm).toMatch(/runtime_map_entity_\d+_y_positive_hit:/);
    expect(result.asm).toMatch(/LSR \$C7BC/);
    expect(result.asm).toMatch(/ROR \$C7BB/);

    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 1, height: 1, data: [0], objects: [{ id: "p", type: "spawn", x: 0, y: 0 }] } });
      const player = c64.map.spawn(level, "p", { sprite: 0, maxCollisionSpeed: 17 });
      c64.game.frame(() => player.moveAndCollide());
    `)).rejects.toThrow(/maxCollisionSpeed must be between 1 and 16/);
  });

  it("selects objects by id or type and rejects an ambiguous spawn", async () => {
    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }],
        map: { width: 2, height: 1, data: [0,0], objects: [
          { id: "enemy-a", type: "enemy", x: 0, y: 0 },
          { id: "enemy-b", type: "enemy", x: 1, y: 0 }
        ] }
      });
      c64.map.spawn(level, "enemy", { sprite: 0 });
    `)).rejects.toThrow(/Several map objects match/);

    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }],
        map: { width: 2, height: 1, data: [0,0], objects: [
          { id: "enemy-a", type: "enemy", x: 0, y: 0 },
          { id: "enemy-b", type: "enemy", x: 1, y: 0 }
        ] }
      });
      const enemies = c64.map.objects(level, "enemy");
      const enemy = c64.map.spawn(level, enemies[1].id, { sprite: 8 });
      const cameraX = c64.var.word("entityCameraX", { initial: 0 });
      const cameraY = c64.var.word("entityCameraY", { initial: 0 });
      c64.game.frame(() => enemy.project({ cameraX, cameraY, viewportWidth: 320, viewportHeight: 200 }));
    `);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-entity", id: "enemy-b", sprite: 8, worldX: 8 })
    ]));
    expect(result.asm).toMatch(/Dynamic 16-to-8 sprite multiplexer/);
  });

  it("projects other entities through the followed scroller and validates follow limits", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }],
        map: { width: 32, height: 12, data: Array(384).fill(0), objects: [
          { id: "player", type: "player", x: 2, y: 2 },
          { id: "enemy", type: "enemy", x: 12, y: 2 }
        ] }
      });
      const player = c64.map.spawn(level, "player", { sprite: 0 });
      const enemy = c64.map.spawn(level, "enemy", { sprite: 8 });
      const camera = c64.map.scroller(level, { width: 20, height: 8, x: 1, y: 1, panel: "bottom" });
      c64.game.init(() => camera.draw());
      c64.game.frame(() => {
        camera.follow(player, { axis: "x", maxSpeed: 3, project: false });
        camera.project(player);
        camera.project(enemy);
      });
    `);
    expect(result.asm).toMatch(/map_camera_follow_x_/);
    expect(result.asm).not.toMatch(/map_camera_follow_y_/);
    expect(result.asm.match(/map_entity_project_done_/g)?.length).toBeGreaterThanOrEqual(2);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-camera-follow", entity: "player", axis: "x", maxSpeed: 3 })
    ]));

    const vertical = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 24, height: 16, data: Array(384).fill(0), objects: [{ id: "p", type: "player", x: 1, y: 1 }] } });
      const player = c64.map.spawn(level, "p", { sprite: 0 });
      const camera = c64.map.scroller(level, { width: 20, height: 8, x: 1, y: 1, panel: "bottom" });
      c64.game.init(() => camera.draw());
      c64.game.frame(() => camera.follow(player, { axis: "both" }));
    `);
    // Standard screen Y starts at 50, row 1 adds 8 and fine Y phase 7 is four
    // pixels below the normal D011 phase 3: 50 + 8 + 4 = 62 ($3E).
    expect(vertical.asm).toMatch(/map_entity_y_visible_\d+:[\s\S]*ADC #\$3E/);

    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 24, height: 12, data: Array(288).fill(0), objects: [{ id: "p", type: "player", x: 1, y: 1 }] } });
      const player = c64.map.spawn(level, "p", { sprite: 0 });
      const camera = c64.map.scroller(level, { width: 20, height: 8, x: 1, y: 3, panel: "top" });
      c64.game.init(() => camera.draw());
      c64.game.frame(() => camera.follow(player, { axis: "both" }));
    `)).rejects.toThrow(/vertical camera follow.*panel: "bottom"/i);

    await expect(compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 24, height: 12, data: Array(288).fill(0), objects: [{ id: "p", type: "player", x: 1, y: 1 }] } });
      const player = c64.map.spawn(level, "p", { sprite: 0 });
      const camera = c64.map.scroller(level, { width: 20, height: 8, x: 1, y: 1, panel: "bottom" });
      c64.game.init(() => camera.draw());
      c64.game.frame(() => camera.follow(player, { deadZone: { x: 150, y: 0, width: 20, height: 20 } }));
    `)).rejects.toThrow(/deadZone must fit/);
  });

  it("keeps disabled entities hidden, respawns them and applies a configurable culling margin", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 50, height: 12, data: Array(600).fill(0), objects: [{ id: "p", type: "player", x: 3, y: 2 }] } });
      const player = c64.map.spawn(level, "p", { sprite: 0 });
      const camera = c64.map.scroller(level, { width: 38, height: 8, x: 1, y: 1, panel: "bottom" });
      c64.game.init(() => camera.draw());
      c64.game.frame(() => {
        player.disable();
        camera.project(player, { cullingMargin: { x: 24, y: 21 } });
        player.respawn();
      });
    `);
    expect(result.asm).toMatch(/map_entity_enabled_/);
    expect(result.asm).toMatch(/ADC #\$18[\s\S]*SBC/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-entity", cullingMargin: { x: 24, y: 21 } })
    ]));
  });

  it("supports behavior tables and reuses software AABB for map entities", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0], collision: 0 }, { chars: [0], collision: 1 }, { chars: [0], collision: 2 }, { chars: [0], collision: 3 }], map: { width: 8, height: 4, data: [1,1,1,1,1,1,1,1, 1,0,0,2,3,0,0,1, 1,0,0,0,0,0,0,1, 1,1,1,1,1,1,1,1], objects: [{ id: "p", type: "player", x: 1, y: 1 }, { id: "e", type: "enemy", x: 2, y: 1 }] } });
      const behaviors = { 1: "solid", 2: "danger", 3: "exit", 4: "platform" };
      const player = c64.map.spawn(level, "p", { sprite: 0, collisionBehaviors: behaviors });
      const enemy = c64.map.spawn(level, "e", { sprite: 1, collisionBehaviors: behaviors });
      c64.game.frame(() => {
        player.moveAndCollide(2, 2);
        c64.control.if(player.isOnDanger(), () => player.respawn());
        c64.control.if(player.isAtExit(), () => player.disable());
        c64.control.if(player.collides(enemy), () => enemy.disable());
      });
    `);
    expect(result.asm).toMatch(/runtime_map_entity_point_value_0:/);
    expect(result.asm).toMatch(/CMP #\$FF[\s\S]*CMP #\$00[\s\S]*BEQ runtime_map_entity_point_0_clear/);
    expect(result.asm).toMatch(/LDA \$C7C9/);
    expect(result.asm).toMatch(/runtime_sprite_aabb_compare|aabb_a_active_/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-entity", collisionBehaviors: { 1: "solid", 2: "danger", 3: "exit", 4: "platform" } })
    ]));
  });

  it("reports a deterministic raster overflow for sixteen overlapping entities", async () => {
    const result = await compileJsToC64Outputs(`
      const objects = Array.from({ length: 16 }, (_, index) => ({ id: "actor-" + index, type: "actor", x: index, y: 2 }));
      const level = c64.assets.defineMap({ charset: { characters: [[0,0,0,0,0,0,0,0]] }, tiles: [{ chars: [0] }], map: { width: 40, height: 8, data: Array(320).fill(0), objects } });
      const actors = c64.map.spawnAll(level, "actor", { firstSprite: 0 });
      c64.game.frame(() => actors.forEach((actor) => actor.project({ viewportHeight: 180, cullingMargin: 8 })));
    `);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "map-entity-budget", entityCount: 16, logicalSpriteCount: 16, physicalSprites: 8, virtualSprites: 8 }),
      expect.objectContaining({ type: "sprite-multiplexer-budget", initialMaxRasterOverlap: 16, maxRasterBudget: 8, deterministic: true, status: "warning" }),
      expect.objectContaining({ type: "warning", code: "SPRITE_RASTER_BUDGET" })
    ]));
  });

  it("builds the complete PAL/NTSC platformer profile with a relocated program", async () => {
    const result = await compileFile("examples/platformer-mini.js");
    expect(result.origin).toBe(0x4000);
    expect(result.sysAddress).toBe(0x4000);
    expect(result.prgBytes.length).toBeLessThan(result.bytes.length + 128);
    expect(result.prgBytes[0]).toBe(0x01);
    expect(result.prgBytes[1]).toBe(0x08);
    expect(result.asm).toMatch(/runtime_map_entity_point_value_0:/);
    expect(result.asm).toMatch(/Dynamic 16-to-8 sprite multiplexer/);
    expect(result.asm).toMatch(/runtime_sprite_mux_wait_safe_raster:/);
    expect(result.asm).not.toMatch(/runtime_sprite_mux_wait_low_raster:/);
    expect(result.asm).toMatch(/Raster IRQ dispatcher/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "map-scroll",
        width: 36,
        height: 20,
        panelRows: 5,
        horizontalWrapFitsPal: true,
        horizontalWrapFitsNtsc: true,
        strategy: "fine-scroll-xy-stream"
      }),
      expect.objectContaining({
        type: "map-entity-budget",
        entityCount: 3,
        physicalSprites: 2,
        virtualSprites: 1,
        spriteMemoryBytes: 256
      }),
      expect.objectContaining({ type: "sprite-multiplexer-budget", status: "ok", maxRasterBudget: 8 }),
      expect.objectContaining({ type: "memory-layout", conflicts: [] })
    ]));
  });
});

describe("v0.6 sid helpers", () => {
  it("emits sid.click() without a blocking delay loop", () => {
    const result = compileInstructions([{ op: "sidClick", args: [] }]);

    expect(result.asm).toMatch(/STA \$D404/);
    expect(result.asm).not.toMatch(/sid_delay_/);
    expect(result.asm).not.toMatch(/runtime_sid_click:/);
  });

  it("shares sid.click() code when it is emitted more than once", () => {
    const result = compileInstructions([
      { op: "sidClick", args: [] },
      { op: "sidClick", args: [] }
    ]);

    expect(result.asm.match(/JSR runtime_sid_click/g)).toHaveLength(2);
    expect(result.asm.match(/runtime_sid_click:/g)).toHaveLength(1);
    expect(result.asm).not.toMatch(/sid_delay_/);
  });

  it("emits SID voice setup helpers", () => {
    const result = compileInstructions([
      { op: "sidVolume", args: [15] },
      { op: "sidFilter", args: ["lowpass", 0x456, 9] },
      { op: "sidVoiceWaveform", args: [1, "pulse"] },
      { op: "sidVoicePulseWidth", args: [1, 0x0800] },
      { op: "sidVoiceAttackDecay", args: [1, 0x11] },
      { op: "sidVoiceSustainRelease", args: [1, 0xf0] }
    ]);

    expect(result.asm).toMatch(/STA \$D418/);
    expect(result.asm).toMatch(/STA \$D415/);
    expect(result.asm).toMatch(/STA \$D416/);
    expect(result.asm).toMatch(/STA \$D417/);
    expect(result.asm).toMatch(/STA \$D404/);
    expect(result.asm).toMatch(/STA \$D402/);
    expect(result.asm).toMatch(/STA \$D403/);
    expect(result.asm).toMatch(/STA \$D405/);
    expect(result.asm).toMatch(/STA \$D406/);
  });

  it("supports SID filter mode combinations while preserving volume", () => {
    const result = compileInstructions([
      { op: "sidVolume", args: [10] },
      { op: "sidFilter", args: ["lowpass+highpass", 2047, 15] }
    ]);

    expect(result.asm).toMatch(/LDA #\$07\s+STA \$D415/);
    expect(result.asm).toMatch(/LDA #\$FF\s+STA \$D416/);
    expect(result.asm).toMatch(/LDA #\$F7\s+STA \$D417/);
    expect(result.asm).toMatch(/LDA #\$5A\s+STA \$D418/);
  });

  it("emits note playback with gate on and off", () => {
    const result = compileInstructions([
      { op: "sidVoiceWaveform", args: [1, "triangle"] },
      { op: "sidNote", args: [1, "A4", 2] }
    ]);

    expect(result.asm).toMatch(/STA \$D400/);
    expect(result.asm).toMatch(/STA \$D401/);
    expect(result.asm).toMatch(/LDY #\$02/);
    expect(result.asm).toMatch(/STA \$D404/);
  });

  it("compiles the sid-beep example without error", async () => {
    const result = await compileFile("examples/sid-beep.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/STA \$D418/);
    expect(result.asm).toMatch(/sid_player_irq:/);
    expect(result.asm).toMatch(/STA \$0314/);
  });

  it("emits a non-blocking 3-voice SID song player", () => {
    const result = compileInstructions([
      {
        op: "sidPlaySong",
        args: [{
          tempo: 8,
          voices: [
            ["C4", "E4", "G4", "C5"],
            [{ note: "C3", duration: 2 }, { note: "G2", duration: 2 }],
            ["R", "C5", "R", "G4"]
          ]
        }]
      }
    ]);

    expect(result.asm).toMatch(/sid_song_irq_0_v1_action:/);
    expect(result.asm).toMatch(/sid_song_irq_0_v2_lo:/);
    expect(result.asm).toMatch(/sid_song_irq_0_v3_hi:/);
    expect(result.asm).toMatch(/STA \$D400/);
    expect(result.asm).toMatch(/STA \$D407/);
    expect(result.asm).toMatch(/STA \$D40E/);
    expect(result.asm).toMatch(/sid_player_irq:/);
    expect(result.asm).toMatch(/JMP \$EA31/);
  });

  it("allows SID player and sprite animator to share one IRQ", () => {
    const result = compileInstructions([
      { op: "spritePosition", args: [0, 32, 90] },
      { op: "spriteAnimateTo", args: [0, { x: 240, y: 60, speedX: 2, speedY: 1 }] },
      { op: "sidPlaySong", args: [{
        tempo: 8,
        voices: [
          ["C4", "E4", "G4", "C5"],
          ["C3", "R", "G2", "R"],
          ["R", "C5", "R", "G4"]
        ]
      }] },
      { op: "spriteInstallAnimator", args: [250] }
    ]);

    expect(result.asm).toMatch(/runtime_combo_irq:/);
    expect(result.asm).toMatch(/STA \$0314/);
    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).toMatch(/STA \$D400/);
    expect(result.asm).not.toMatch(/sprite_animator_irq:/);
  });

  it("allows raster IRQ, SID player and sprite animator to coexist", () => {
    const result = compileInstructions([
      { op: "spritePosition", args: [0, 32, 90] },
      { op: "spriteAnimateTo", args: [0, { x: 240, y: 60, speedX: 2, speedY: 1 }] },
      { op: "sidPlaySong", args: [{
        tempo: 8,
        voices: [
          ["C4", "E4", "G4", "C5"],
          ["C3", "R", "G2", "R"],
          ["R", "C5", "R", "G4"]
        ]
      }] },
      { op: "irqChainToKernal", args: [] },
      { op: "irqInstall", args: [] }
    ], {
      irqHandlers: [
        { line: 50, instructions: [{ op: "borderColor", args: [2] }] },
        { line: 150, instructions: [{ op: "borderColor", args: [6] }] }
      ]
    });

    expect(result.asm).toMatch(/irq_dispatch:/);
    expect(result.asm).toMatch(/sid_song_irq_body_/);
    expect(result.asm).toMatch(/STA \$D400/);
    expect(result.asm).toMatch(/STA \$D000/);
    expect(result.asm).not.toMatch(/sid_player_irq:/);
    expect(result.asm).not.toMatch(/sprite_animator_irq:/);
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
    expect(result.asm).toMatch(/LDA \$D019\n  AND #\$01\n  BNE irq_dispatch_vic_raster/);
    expect(result.asm).toMatch(/JMP \$EA81/);
  });

  it("does not let KERNAL CIA timer IRQs advance the raster state", () => {
    const result = compileInstructions([
      { op: "irqChainToKernal", args: [] },
      { op: "irqInstall", args: [] }
    ], {
      irqHandlers: [
        { line: 50, instructions: [{ op: "borderColor", args: [2] }] },
        { line: 150, instructions: [{ op: "borderColor", args: [6] }] }
      ]
    });

    const sourceCheck = result.asm.indexOf("LDA $D019");
    const stateRead = result.asm.indexOf("LDA $C0FE", sourceCheck);
    const kernalChain = result.asm.indexOf("JMP $EA31", sourceCheck);
    const vicHandler = result.asm.indexOf("irq_dispatch_vic_raster:", sourceCheck);

    expect(sourceCheck).toBeGreaterThan(-1);
    expect(kernalChain).toBeGreaterThan(sourceCheck);
    expect(kernalChain).toBeLessThan(vicHandler);
    expect(stateRead).toBeGreaterThan(vicHandler);
    expect(result.asm.match(/JMP \$EA31/g)).toHaveLength(1);
    expect(result.asm.match(/JMP \$EA81/g)).toHaveLength(2);
  });

  it("compiles raster-bars example without error", async () => {
    const result = await compileFile("examples/raster-bars.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.symbols.irq_dispatch).toBeDefined();
    expect(result.asm).toMatch(/STA \$DC0D/);
    expect(result.asm).toMatch(/JMP \$EA81/);
    expect(result.asm).not.toMatch(/JMP \$EA31/);
  });

  it("compiles ready-safe raster border cycle example with kernal chaining", async () => {
    const result = await compileFile("examples/raster-ready-border-cycle.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/STA \$C000/);
    expect(result.asm).toMatch(/JMP \$EA31/);
  });

  it("allows SID player to coexist with custom raster IRQ handlers", () => {
    const result = compileInstructions([
      { op: "sidPlaySong", args: [{
        tempo: 8,
        voices: [
          ["C4", "E4", "G4", "C5"],
          ["C3", "R", "G2", "R"],
          ["R", "C5", "R", "G4"]
        ]
      }] },
      { op: "irqChainToKernal", args: [] },
      { op: "irqInstall", args: [] }
    ], {
      irqHandlers: [
        { line: 50, instructions: [{ op: "borderColor", args: [2] }] },
        { line: 150, instructions: [{ op: "borderColor", args: [6] }] }
      ]
    });

    expect(result.asm).toMatch(/irq_dispatch:/);
    expect(result.asm).toMatch(/sid_song_irq_body_0_v1_action:/);
    expect(result.asm).toMatch(/STA \$D400/);
    expect(result.asm).toMatch(/STA \$0314/);
    expect(result.asm).not.toMatch(/sid_player_irq:/);
  });

  it("compiles combo-irq example without error", async () => {
    const result = await compileFile("examples/combo-irq.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/irq_dispatch:/);
    expect(result.asm).toMatch(/STA \$D400/);
    expect(result.asm).toMatch(/STA \$D020/);
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
    expect(result.asm).toMatch(/LDA sprite_data_0_0,X/);
    expect(result.asm).toMatch(/STA \$2000,X/);
    expect(result.asm).toMatch(/STA \$D015/);
  });

  it("compiles comfort-data-vars example without error", async () => {
    const result = await compileFile("examples/comfort-data-vars.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/titleText:/);
    expect(result.asm).toMatch(/STA \$C200/);
  });

  it("compiles sprite-api example without error", async () => {
    const result = await compileFile("examples/sprite-api.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/STA \$D015/);
    expect(result.asm).toMatch(/STA \$D01D/);
    expect(result.asm).toMatch(/STA \$D017/);
  });

  it("compiles sprite-animate example without error", async () => {
    const result = await compileFile("examples/sprite-animate.js");
    expect(result.bytes.length).toBeGreaterThan(0);
    expect(result.asm).toMatch(/sprite_sequence_0_walk:/);
    expect(result.asm).toMatch(/sprite_anim_advance_0_0_/);
    expect(result.asm).toMatch(/game_frame_loop:/);
    expect(result.asm).toMatch(/LDA \$D012/);
    expect(result.asm).toMatch(/STA \$D010/);
  });
});
