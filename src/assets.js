import fs from "node:fs";
import path from "node:path";

function integer(value, min, max, label) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} must be an integer between ${min} and ${max}`);
  }
  return value;
}

function bytes(values, expectedLength, label) {
  const result = Array.from(values ?? []);
  if (expectedLength !== undefined && result.length !== expectedLength) {
    throw new Error(`${label} must contain exactly ${expectedLength} values`);
  }
  return result.map((value, index) => integer(value, 0, 255, `${label}[${index}]`));
}

function assetName(value, label, sourcePath, identifierOnly = false) {
  if (typeof value !== "string" || value.length === 0 || value.length > 64) {
    throw new Error(`${sourcePath}: ${label} must be a non-empty string up to 64 characters`);
  }
  const pattern = identifierOnly ? /^[A-Za-z_][A-Za-z0-9_]*$/ : /^[A-Za-z_][A-Za-z0-9_-]*$/;
  if (!pattern.test(value)) {
    throw new Error(`${sourcePath}: ${label} contains unsupported characters`);
  }
  return value;
}

function spriteInteger(value, min, max, label, sourcePath) {
  try {
    return integer(value, min, max, label);
  } catch (error) {
    throw new Error(`${sourcePath}: ${error.message}`);
  }
}

export function normalizeSpriteAsset(definition, sourcePath = "<inline sprite>") {
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    throw new Error(`${sourcePath}: sprite asset must be a JSON object`);
  }
  if (definition.version !== 1) throw new Error(`${sourcePath}: sprite asset version must be 1`);
  const id = assetName(definition.id, "sprite.id", sourcePath, true);
  const mode = definition.mode ?? "hires";
  if (mode !== "hires" && mode !== "multicolor") {
    throw new Error(`${sourcePath}: sprite.mode must be hires or multicolor`);
  }
  const color = spriteInteger(definition.color ?? 1, 0, 15, "sprite.color", sourcePath);
  const multicolor1 = definition.multicolor1 === undefined
    ? null
    : spriteInteger(definition.multicolor1, 0, 15, "sprite.multicolor1", sourcePath);
  const multicolor2 = definition.multicolor2 === undefined
    ? null
    : spriteInteger(definition.multicolor2, 0, 15, "sprite.multicolor2", sourcePath);
  if (mode === "multicolor" && (multicolor1 === null || multicolor2 === null)) {
    throw new Error(`${sourcePath}: a multicolor sprite needs multicolor1 and multicolor2`);
  }

  const originDefinition = definition.origin ?? {};
  const origin = Object.freeze({
    x: spriteInteger(originDefinition.x ?? 0, 0, 23, "sprite.origin.x", sourcePath),
    y: spriteInteger(originDefinition.y ?? 0, 0, 20, "sprite.origin.y", sourcePath)
  });
  const hitboxDefinition = definition.hitbox ?? {};
  const hitbox = {
    offsetX: spriteInteger(hitboxDefinition.offsetX ?? 0, 0, 23, "sprite.hitbox.offsetX", sourcePath),
    offsetY: spriteInteger(hitboxDefinition.offsetY ?? 0, 0, 20, "sprite.hitbox.offsetY", sourcePath),
    width: spriteInteger(hitboxDefinition.width ?? 24, 1, 24, "sprite.hitbox.width", sourcePath),
    height: spriteInteger(hitboxDefinition.height ?? 21, 1, 21, "sprite.hitbox.height", sourcePath)
  };
  if (hitbox.offsetX + hitbox.width > 24 || hitbox.offsetY + hitbox.height > 21) {
    throw new Error(`${sourcePath}: sprite.hitbox must fit inside the 24x21 sprite canvas`);
  }

  const frameIds = new Set();
  const frames = Array.from(definition.frames ?? []).map((frame, index) => {
    const normalizedFrame = Array.isArray(frame) ? { data: frame } : frame;
    if (!normalizedFrame || typeof normalizedFrame !== "object" || Array.isArray(normalizedFrame)) {
      throw new Error(`${sourcePath}: sprite.frames[${index}] must be an object with 63 data bytes`);
    }
    const frameId = assetName(normalizedFrame.id ?? `frame_${index}`, `sprite.frames[${index}].id`, sourcePath);
    if (frameIds.has(frameId)) throw new Error(`${sourcePath}: sprite frame id ${frameId} is duplicated`);
    frameIds.add(frameId);
    let data;
    try {
      data = bytes(normalizedFrame.data, 63, `sprite.frames[${index}].data`);
    } catch (error) {
      throw new Error(`${sourcePath}: ${error.message}`);
    }
    return Object.freeze({ id: frameId, data: Object.freeze(data) });
  });
  if (frames.length === 0 || frames.length > 128) {
    throw new Error(`${sourcePath}: sprite.frames must contain between 1 and 128 frames`);
  }
  const frameIndexes = new Map(frames.map((frame, index) => [frame.id, index]));
  const animationDefinition = definition.animations ?? {};
  if (!animationDefinition || typeof animationDefinition !== "object" || Array.isArray(animationDefinition)) {
    throw new Error(`${sourcePath}: sprite.animations must be an object keyed by animation name`);
  }
  const animations = {};
  for (const [name, animation] of Object.entries(animationDefinition)) {
    assetName(name, `sprite.animations.${name}`, sourcePath);
    if (!animation || typeof animation !== "object" || Array.isArray(animation)) {
      throw new Error(`${sourcePath}: sprite.animations.${name} must be an object`);
    }
    const references = Array.from(animation.frames ?? []);
    if (references.length === 0 || references.length > 255) {
      throw new Error(`${sourcePath}: sprite.animations.${name}.frames must contain between 1 and 255 entries`);
    }
    const indexes = references.map((reference, index) => {
      if (typeof reference === "string") {
        if (!frameIndexes.has(reference)) {
          throw new Error(`${sourcePath}: sprite.animations.${name}.frames[${index}] references missing frame ${reference}`);
        }
        return frameIndexes.get(reference);
      }
      return spriteInteger(reference, 0, frames.length - 1, `sprite.animations.${name}.frames[${index}]`, sourcePath);
    });
    animations[name] = Object.freeze({
      name,
      frames: Object.freeze(indexes),
      speed: spriteInteger(animation.speed ?? 6, 1, 255, `sprite.animations.${name}.speed`, sourcePath),
      loop: animation.loop !== false
    });
  }
  const animationNames = Object.keys(animations);
  const initialAnimation = definition.initialAnimation ?? animationNames[0] ?? null;
  if (initialAnimation !== null && !Object.hasOwn(animations, initialAnimation)) {
    throw new Error(`${sourcePath}: sprite.initialAnimation references missing animation ${initialAnimation}`);
  }
  return Object.freeze({
    type: "spriteAsset",
    version: 1,
    sourcePath,
    id,
    mode,
    color,
    multicolor1,
    multicolor2,
    origin,
    hitbox: Object.freeze(hitbox),
    frames: Object.freeze(frames),
    animations: Object.freeze(animations),
    initialAnimation
  });
}

export function loadSpriteAsset(filePath, baseDirectory = process.cwd()) {
  if (typeof filePath !== "string" || filePath.length === 0) throw new Error("sprite asset path must be a non-empty string");
  const absolutePath = path.resolve(baseDirectory, filePath);
  let definition;
  try {
    definition = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot load sprite asset ${absolutePath}: ${error.message}`);
  }
  return normalizeSpriteAsset(definition, absolutePath);
}

function normalizeCharset(definition = {}) {
  const mode = definition.mode ?? "hires";
  if (mode !== "hires" && mode !== "multicolor") throw new Error("charset.mode must be hires or multicolor");
  // Custom charsets keep screen codes 0..63 for the original C64 alphabet.
  // `romCharacters: 0` remains available only for legacy assets which
  // deliberately replace those codes.
  const romCharacters = definition.romCharacters ?? 64;
  if (![0, 64].includes(romCharacters)) throw new Error("charset.romCharacters must be 0 or 64");
  let charsetBytes;
  if (definition.bytes !== undefined) {
    charsetBytes = bytes(definition.bytes, undefined, "charset.bytes");
    if (charsetBytes.length % 8 !== 0) throw new Error("charset.bytes length must be a multiple of 8");
  } else {
    const characters = Array.from(definition.characters ?? []);
    charsetBytes = characters.flatMap((character, index) => bytes(character, 8, `charset.characters[${index}]`));
  }
  // Older Studio exports embedded the 512-byte system area. Detect and drop
  // that prefix so they also benefit from the automatic ROM copy.
  if (definition.romCharacters === undefined && romCharacters === 64 && hasEmbeddedSystemCharset(charsetBytes)) {
    charsetBytes = charsetBytes.slice(64 * 8);
  }
  const characterCount = romCharacters + charsetBytes.length / 8;
  if (characterCount === 0 || characterCount > 256) {
    throw new Error("charset, including ROM characters, must contain between 1 and 256 characters");
  }
  const storedBytes = Object.freeze([...charsetBytes]);
  const prefix = new Array(romCharacters * 8).fill(0);
  return Object.freeze({
    type: "charsetAsset",
    mode,
    romCharacters,
    characterCount,
    storedBytes,
    bytes: Object.freeze([...prefix, ...charsetBytes, ...new Array(2048 - prefix.length - charsetBytes.length).fill(0)])
  });
}

function hasEmbeddedSystemCharset(charsetBytes) {
  if (charsetBytes.length < 64 * 8) return false;
  const signatures = [
    [1 * 8, [24, 60, 102, 126, 102, 102, 102, 0]],
    [32 * 8, [0, 0, 0, 0, 0, 0, 0, 0]],
    [48 * 8, [60, 102, 110, 118, 102, 102, 60, 0]],
    [57 * 8, [60, 102, 102, 62, 6, 102, 60, 0]]
  ];
  return signatures.every(([offset, expected]) => expected.every((value, index) => charsetBytes[offset + index] === value));
}

export function normalizeMapAsset(definition, sourcePath = "<inline>") {
  if (!definition || typeof definition !== "object" || Array.isArray(definition)) {
    throw new Error("map asset must be a JSON object");
  }
  if (definition.version !== undefined && definition.version !== 1) {
    throw new Error("map asset version must be 1");
  }
  const charset = normalizeCharset(definition.charset);
  const tileWidth = integer(definition.tileWidth ?? 1, 1, 8, "tileWidth");
  const tileHeight = integer(definition.tileHeight ?? 1, 1, 8, "tileHeight");
  const tileCells = tileWidth * tileHeight;
  const tiles = Array.from(definition.tiles ?? []).map((tile, index) => {
    const chars = bytes(tile?.chars, tileCells, `tiles[${index}].chars`);
    chars.forEach((character, cell) => {
      if (character >= charset.characterCount) throw new Error(`tiles[${index}].chars[${cell}] references missing character ${character}`);
    });
    const colors = tile?.colors === undefined
      ? new Array(tileCells).fill(1)
      : bytes(tile.colors, tileCells, `tiles[${index}].colors`).map((color, cell) => integer(color, 0, 15, `tiles[${index}].colors[${cell}]`));
    if (charset.mode === "multicolor" && colors.some((color) => color > 7)) {
      throw new Error(`tiles[${index}].colors must stay between 0 and 7 in multicolor character mode`);
    }
    if (tile?.properties !== undefined && (!tile.properties || typeof tile.properties !== "object" || Array.isArray(tile.properties))) {
      throw new Error(`tiles[${index}].properties must be an object`);
    }
    return Object.freeze({
      chars: Object.freeze(chars),
      colors: Object.freeze(colors),
      collision: integer(tile?.collision ?? (tile?.properties?.solid ? 1 : 0), 0, 255, `tiles[${index}].collision`),
      properties: Object.freeze({ ...(tile?.properties ?? {}) })
    });
  });
  if (tiles.length === 0 || tiles.length > 256) throw new Error("map asset must define between 1 and 256 tiles");
  const mapDefinition = definition.map ?? {};
  const width = integer(mapDefinition.width, 1, 255, "map.width");
  const height = integer(mapDefinition.height, 1, 255, "map.height");
  const data = bytes(mapDefinition.data, width * height, "map.data");
  data.forEach((tileIndex, index) => {
    if (tileIndex >= tiles.length) throw new Error(`map.data[${index}] references missing tile ${tileIndex}`);
  });
  const objects = Array.from(mapDefinition.objects ?? []).map((object, index) => {
    if (!object || typeof object !== "object" || Array.isArray(object)) throw new Error(`map.objects[${index}] must be an object`);
    const type = object.type;
    if (typeof type !== "string" || type.length === 0 || type.length > 64) throw new Error(`map.objects[${index}].type must be a non-empty string up to 64 characters`);
    if (object.properties !== undefined && (!object.properties || typeof object.properties !== "object" || Array.isArray(object.properties))) {
      throw new Error(`map.objects[${index}].properties must be an object`);
    }
    const id = object.id ?? `${type}-${index + 1}`;
    if (typeof id !== "string" || id.length === 0 || id.length > 64) {
      throw new Error(`map.objects[${index}].id must be a non-empty string up to 64 characters`);
    }
    if (object.sprite !== undefined && (typeof object.sprite !== "string" || object.sprite.length === 0 || object.sprite.length > 64)) {
      throw new Error(`map.objects[${index}].sprite must be a non-empty string up to 64 characters`);
    }
    const x = integer(object.x, 0, width - 1, `map.objects[${index}].x`);
    const y = integer(object.y, 0, height - 1, `map.objects[${index}].y`);
    return Object.freeze({
      id,
      type,
      x,
      y,
      worldX: x * tileWidth * 8,
      worldY: y * tileHeight * 8,
      ...(object.sprite === undefined ? {} : { sprite: object.sprite }),
      properties: Object.freeze({ ...(object.properties ?? {}) })
    });
  });
  const objectIds = new Set();
  objects.forEach((object, index) => {
    if (objectIds.has(object.id)) throw new Error(`map.objects[${index}].id duplicates ${object.id}`);
    objectIds.add(object.id);
  });
  return Object.freeze({
    type: "mapAsset",
    version: 1,
    sourcePath,
    charset,
    tileWidth,
    tileHeight,
    tiles: Object.freeze(tiles),
    map: Object.freeze({ width, height, data: Object.freeze(data), objects: Object.freeze(objects) })
  });
}

export function loadMapAsset(filePath, baseDirectory = process.cwd()) {
  if (typeof filePath !== "string" || filePath.length === 0) throw new Error("asset path must be a non-empty string");
  const absolutePath = path.resolve(baseDirectory, filePath);
  let definition;
  try {
    definition = JSON.parse(fs.readFileSync(absolutePath, "utf8"));
  } catch (error) {
    throw new Error(`Cannot load map asset ${absolutePath}: ${error.message}`);
  }
  return normalizeMapAsset(definition, absolutePath);
}

export function expandMapAsset(asset) {
  if (!asset || asset.type !== "mapAsset") throw new Error("Expected an asset returned by c64.assets.loadMap() or defineMap()");
  const width = asset.map.width * asset.tileWidth;
  const height = asset.map.height * asset.tileHeight;
  const chars = new Array(width * height).fill(0);
  const colors = new Array(width * height).fill(1);
  for (let mapY = 0; mapY < asset.map.height; mapY += 1) {
    for (let mapX = 0; mapX < asset.map.width; mapX += 1) {
      const tile = asset.tiles[asset.map.data[mapY * asset.map.width + mapX]];
      for (let cellY = 0; cellY < asset.tileHeight; cellY += 1) {
        for (let cellX = 0; cellX < asset.tileWidth; cellX += 1) {
          const tileOffset = cellY * asset.tileWidth + cellX;
          const outputOffset = (mapY * asset.tileHeight + cellY) * width + mapX * asset.tileWidth + cellX;
          chars[outputOffset] = tile.chars[tileOffset];
          colors[outputOffset] = tile.colors[tileOffset];
        }
      }
    }
  }
  return { width, height, chars, colors };
}
