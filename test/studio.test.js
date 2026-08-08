import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import "../studio graphique/sprite-asset-core.js";
import "../studio graphique/project-bundle-core.js";
import { normalizeMapAsset, normalizeSpriteAsset } from "../src/assets.js";

const Core = globalThis.JsC64SpriteAsset;
const Project = globalThis.JsC64StudioProject;

describe("v0.10.1 sprite asset studio core", () => {
  it("reserves ROM codes 0..63 automatically and strips legacy embedded system glyphs", () => {
    const compact = normalizeMapAsset({
      version: 1,
      charset: { mode: "hires", characters: [[255, 129, 129, 129, 129, 129, 129, 255]] },
      tiles: [{ chars: [32] }, { chars: [64] }],
      map: { width: 2, height: 1, data: [0, 1] }
    });
    expect(compact.charset).toEqual(expect.objectContaining({
      romCharacters: 64, characterCount: 65, storedBytes: [255, 129, 129, 129, 129, 129, 129, 255]
    }));

    const legacyCharacters = Array.from({ length: 64 }, () => Array(8).fill(0));
    legacyCharacters[1] = [24, 60, 102, 126, 102, 102, 102, 0];
    legacyCharacters[48] = [60, 102, 110, 118, 102, 102, 60, 0];
    legacyCharacters[57] = [60, 102, 102, 62, 6, 102, 60, 0];
    legacyCharacters.push([170, 85, 170, 85, 170, 85, 170, 85]);
    const migrated = normalizeMapAsset({
      version: 1,
      charset: { mode: "hires", characters: legacyCharacters },
      tiles: [{ chars: [64] }],
      map: { width: 1, height: 1, data: [0] }
    });
    expect(migrated.charset).toEqual(expect.objectContaining({
      romCharacters: 64, characterCount: 65, storedBytes: [170, 85, 170, 85, 170, 85, 170, 85]
    }));
  });

  it("encodes all hires and multicolor edge pixels in the VIC-II 63-byte layout", () => {
    const hires = Core.blankFrame("hires");
    Core.setPixelValue(hires, 0, 0, 1, "hires");
    Core.setPixelValue(hires, 23, 20, 1, "hires");
    expect(hires.data).toHaveLength(63);
    expect(hires.data[0]).toBe(0x80);
    expect(hires.data[62]).toBe(0x01);
    expect(Core.pixelValue(hires, 0, 0, "hires")).toBe(1);
    expect(Core.pixelValue(hires, 23, 20, "hires")).toBe(1);

    const multicolor = Core.blankFrame("multicolor");
    Core.setPixelValue(multicolor, 0, 0, 3, "multicolor");
    Core.setPixelValue(multicolor, 11, 20, 2, "multicolor");
    expect(multicolor.data[0]).toBe(0xc0);
    expect(multicolor.data[62]).toBe(0x02);
    expect(Core.pixelValue(multicolor, 0, 0, "multicolor")).toBe(3);
    expect(Core.pixelValue(multicolor, 11, 20, "multicolor")).toBe(2);
  });

  it("accepts the compiler example and preserves it through JSON import/export", async () => {
    const source = JSON.parse(await fs.readFile("examples/assets/v10-hero.sprite.json", "utf8"));
    const imported = Core.normalizeSprite(JSON.parse(JSON.stringify(source)));
    expect(Core.validateSprite(imported)).toEqual([]);
    expect(JSON.parse(JSON.stringify(imported))).toEqual(source);
    expect(normalizeSpriteAsset(imported, "studio-export.sprite.json")).toEqual(expect.objectContaining({
      type: "spriteAsset", id: "hero", mode: "hires",
      frames: expect.arrayContaining([expect.objectContaining({ id: "idle" })]),
      initialAnimation: "idle-right"
    }));
  });

  it("rejects an overflowing hitbox and missing animation frames", () => {
    const sprite = Core.createSprite("broken");
    sprite.hitbox = { offsetX: 20, offsetY: 0, width: 8, height: 21 };
    sprite.animations.run = { frames: ["missing"], speed: 0, loop: true };
    expect(Core.validateSprite(sprite)).toEqual(expect.arrayContaining([
      expect.stringMatching(/hitbox/i),
      expect.stringMatching(/reference de frame/i),
      expect.stringMatching(/speed/i)
    ]));
  });

  it("round-trips a complete standalone studio project without data loss", async () => {
    const map = JSON.parse(await fs.readFile("examples/assets/v09-room.json", "utf8"));
    const sprite = JSON.parse(await fs.readFile("examples/assets/v10-hero.sprite.json", "utf8"));
    map.map.objects = [{
      id: "player", type: "player-spawn", x: 2, y: 2, sprite: "hero",
      properties: { animation: "idle-right", direction: "right" }
    }];
    const bundle = Project.createBundle("niveau-test", map, [sprite]);
    const serialized = JSON.stringify(bundle);
    const imported = Project.parseBundle(serialized, { validateSprite: Core.validateSprite });
    expect(imported).toEqual(bundle);
    expect(imported.map.map.objects[0]).toEqual(expect.objectContaining({
      sprite: "hero", properties: { animation: "idle-right", direction: "right" }
    }));
    expect(imported.sprites[0].frames[0].data).toEqual(sprite.frames[0].data);
    expect(normalizeMapAsset(imported.map, "studio-export.map.json").map.objects[0]).toEqual(expect.objectContaining({
      id: "player", sprite: "hero", worldX: 32, worldY: 32
    }));
    expect(normalizeSpriteAsset(imported.sprites[0], "studio-export.sprite.json")).toEqual(expect.objectContaining({ id: "hero" }));
  });

  it("rejects duplicate sprites and unresolved map object references in a project", () => {
    const sprite = Core.createSprite("hero");
    const map = { map: { objects: [{ id: "player", type: "spawn", x: 0, y: 0, sprite: "missing", properties: {} }] } };
    const bundle = Project.createBundle("broken", map, [sprite, sprite]);
    expect(Project.validateBundle(bundle, { validateSprite: Core.validateSprite })).toEqual(expect.arrayContaining([
      expect.stringMatching(/duplique/i),
      expect.stringMatching(/absent du projet/i)
    ]));
  });

  it("generates the next free map object id when the selected id already exists", () => {
    const objects = [{ id: "objet1" }, { id: "objet2" }, { id: "enemy" }, { id: "spawn-9" }];
    expect(Project.nextObjectId("objet1", objects, "object")).toBe("objet3");
    expect(Project.nextObjectId("enemy", objects, "object")).toBe("enemy-2");
    expect(Project.nextObjectId("spawn-9", objects, "object")).toBe("spawn-10");
    expect(Project.nextObjectId("bonus", objects, "object")).toBe("bonus");
    expect(Project.nextObjectId("", objects, "collectible")).toBe("collectible");
  });

  it("validates map object moves against bounds and occupied cells", () => {
    const objects = [{ id: "a", x: 2, y: 3 }, { id: "b", x: 5, y: 4 }];
    expect(Project.objectPositionError(objects, 0, 4, 3, 10, 8)).toBeNull();
    expect(Project.objectPositionError(objects, 0, 5, 4, 10, 8)).toMatch(/autre objet/i);
    expect(Project.objectPositionError(objects, 0, -1, 3, 10, 8)).toMatch(/hors de la map/i);
    expect(Project.objectPositionError(objects, 0, 10, 3, 10, 8)).toMatch(/hors de la map/i);
    expect(Project.objectPositionError(objects, 0, 2, 3, 10, 8)).toBeNull();
  });
});
