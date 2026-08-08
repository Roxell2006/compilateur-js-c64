import { describe, expect, it } from "vitest";
import { compileJsToC64Outputs } from "../src/compiler.js";

describe("v1.0 deterministic game resources", () => {
  const source = `
    const roll = c64.var.byte("releaseRoll", { initial: 0 });
    const score = c64.game.score({ digits: 4, initial: 95 });
    const lives = c64.game.lives({ initial: 3 });
    const bullets = c64.pool.fixed("bullets", 3, (index) =>
      c64.var.bool("releaseBullet" + index, false)
    );
    c64.random.seed(42);
    c64.random.range(roll, 10);
    score.add(10);
    score.draw(2, 3, { color: c64.COLOR_YELLOW });
    lives.dec();
    lives.draw(10, 3);
    bullets.forEach((bullet) => bullet.set(false));
  `;

  it("emits reproducible RNG, fixed pools and decimal counters", async () => {
    const first = await compileJsToC64Outputs(source);
    const second = await compileJsToC64Outputs(source);

    expect([...first.prgBytes]).toEqual([...second.prgBytes]);
    expect(first.asm).toMatch(/game_random_reduce_/);
    expect(first.asm).toMatch(/game_counter_carry_/);
    expect(first.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({
        type: "game-runtime",
        deterministicRng: true,
        fixedPools: [{ name: "bullets", size: 3 }],
        counters: [
          { name: "score", digits: 4, storage: "unpacked-bcd" },
          { name: "lives", digits: 2, storage: "unpacked-bcd" }
        ]
      })
    ]));
  });

  it("rejects unbounded resources and a zero RNG seed", async () => {
    await expect(compileJsToC64Outputs('c64.random.seed(0);')).rejects.toThrow(/between 1 and 255/);
    await expect(compileJsToC64Outputs('c64.pool.fixed("tooLarge", 256, () => null);')).rejects.toThrow(/between 1 and 255/);
    await expect(compileJsToC64Outputs('c64.game.counter("score", { digits: 6 });')).rejects.toThrow(/between 1 and 5/);
  });

  it("copies the first 64 glyphs from character ROM and stores only custom bytes", async () => {
    const result = await compileJsToC64Outputs(`
      const level = c64.assets.defineMap({
        version: 1,
        charset: { mode: "hires", characters: [[255,129,129,129,129,129,129,255]] },
        tiles: [{ chars: [32] }, { chars: [64] }],
        map: { width: 2, height: 1, data: [0, 1] }
      });
      c64.charset.use(level.charset, { address: 0x3000 });
      c64.map.draw(level);
    `);

    expect(result.asm).toMatch(/LDA \$D000,X/);
    expect(result.asm).toMatch(/LDA \$D100,X/);
    expect(result.assetReport).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "charset", storedBytes: 8, romCopiedBytes: 512, romCopyCyclesEstimate: 5920, characters: 65 })
    ]));
  });
});
