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

function normalizeCharset(definition = {}) {
  const mode = definition.mode ?? "hires";
  if (mode !== "hires" && mode !== "multicolor") throw new Error("charset.mode must be hires or multicolor");
  let charsetBytes;
  if (definition.bytes !== undefined) {
    charsetBytes = bytes(definition.bytes, undefined, "charset.bytes");
    if (charsetBytes.length % 8 !== 0) throw new Error("charset.bytes length must be a multiple of 8");
  } else {
    const characters = Array.from(definition.characters ?? []);
    charsetBytes = characters.flatMap((character, index) => bytes(character, 8, `charset.characters[${index}]`));
  }
  if (charsetBytes.length === 0 || charsetBytes.length > 2048) {
    throw new Error("charset must contain between 1 and 256 characters");
  }
  return Object.freeze({
    type: "charsetAsset",
    mode,
    characterCount: charsetBytes.length / 8,
    bytes: Object.freeze([...charsetBytes, ...new Array(2048 - charsetBytes.length).fill(0)])
  });
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
    return Object.freeze({
      type,
      x: integer(object.x, 0, width - 1, `map.objects[${index}].x`),
      y: integer(object.y, 0, height - 1, `map.objects[${index}].y`),
      properties: Object.freeze({ ...(object.properties ?? {}) })
    });
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
