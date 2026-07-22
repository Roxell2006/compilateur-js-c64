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
    expect(result.asm).toMatch(/runtime_sprite_mux_wait_high_raster:/);
    expect(result.asm).toMatch(/runtime_sprite_mux_wait_low_raster:/);
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
