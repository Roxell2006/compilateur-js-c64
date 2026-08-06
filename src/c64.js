import { captureBlock, claimSpriteSharedColors, createRuntimeFacade, defineRuntimeData, getAssetBaseDirectory, getProgramState, getRuntimeDataLength, getSpriteAsset, pushInstruction, registerSpriteAsset, resetRuntime, setColorBase, setScreenBase, setTextColor, useJoystickPort, useKeyboardKey } from "./runtime.js";
import { loadMapAsset, loadSpriteAsset, normalizeMapAsset, normalizeSpriteAsset } from "./assets.js";

// This file exposes the public DSL used by end users.
// Important idea: calling c64.printAt(), c64.sprite.show(), etc. does not
// execute anything on a real C64 immediately. Each call only records a high
// level instruction that the compiler will translate to 6502 machine code.
export const C64_CONSTANTS = {
  COLOR_BLACK: 0,
  COLOR_WHITE: 1,
  COLOR_RED: 2,
  COLOR_CYAN: 3,
  COLOR_VIOLET: 4,
  COLOR_GREEN: 5,
  COLOR_BLUE: 6,
  COLOR_YELLOW: 7,
  COLOR_ORANGE: 8,
  COLOR_BROWN: 9,
  COLOR_LIGHTRED: 10,
  COLOR_GRAY1: 11,
  COLOR_GRAY2: 12,
  COLOR_LIGHTGREEN: 13,
  COLOR_LIGHTBLUE: 14,
  COLOR_GRAY3: 15,
  VIC_BASE: 0xd000,
  VIC_SPRITE0_X: 0xd000,
  VIC_SPRITE0_Y: 0xd001,
  VIC_CONTROL_1: 0xd011,
  VIC_RASTER: 0xd012,
  VIC_LIGHTPEN_X: 0xd013,
  VIC_LIGHTPEN_Y: 0xd014,
  VIC_SPRITE_ENABLE: 0xd015,
  VIC_CONTROL_2: 0xd016,
  VIC_SPRITE_X_MSB: 0xd010,
  VIC_SPRITE_EXPAND_Y: 0xd017,
  VIC_MEMORY_POINTERS: 0xd018,
  VIC_IRQ_STATUS: 0xd019,
  VIC_IRQ_ENABLE: 0xd01a,
  VIC_SPRITE_SPRITE_COLLISION: 0xd01e,
  VIC_SPRITE_BACKGROUND_COLLISION: 0xd01f,
  VIC_SPRITE_PRIORITY: 0xd01b,
  VIC_SPRITE_MULTICOLOR: 0xd01c,
  VIC_SPRITE_EXPAND_X: 0xd01d,
  VIC_BORDER_COLOR: 0xd020,
  VIC_BACKGROUND_COLOR: 0xd021,
  VIC_BACKGROUND_COLOR_1: 0xd022,
  VIC_BACKGROUND_COLOR_2: 0xd023,
  VIC_BACKGROUND_COLOR_3: 0xd024,
  SID_BASE: 0xd400,
  SID_VOICE1_FREQ_LO: 0xd400,
  SID_VOICE1_FREQ_HI: 0xd401,
  SID_VOICE1_PW_LO: 0xd402,
  SID_VOICE1_PW_HI: 0xd403,
  SID_VOICE1_CONTROL: 0xd404,
  SID_VOICE1_ATTACK_DECAY: 0xd405,
  SID_VOICE1_SUSTAIN_RELEASE: 0xd406,
  SID_VOICE2_FREQ_LO: 0xd407,
  SID_VOICE2_FREQ_HI: 0xd408,
  SID_VOICE2_PW_LO: 0xd409,
  SID_VOICE2_PW_HI: 0xd40a,
  SID_VOICE2_CONTROL: 0xd40b,
  SID_VOICE2_ATTACK_DECAY: 0xd40c,
  SID_VOICE2_SUSTAIN_RELEASE: 0xd40d,
  SID_VOICE3_FREQ_LO: 0xd40e,
  SID_VOICE3_FREQ_HI: 0xd40f,
  SID_VOICE3_PW_LO: 0xd410,
  SID_VOICE3_PW_HI: 0xd411,
  SID_VOICE3_CONTROL: 0xd412,
  SID_VOICE3_ATTACK_DECAY: 0xd413,
  SID_VOICE3_SUSTAIN_RELEASE: 0xd414,
  SID_FILTER_CUTOFF_LO: 0xd415,
  SID_FILTER_CUTOFF_HI: 0xd416,
  SID_FILTER_RESONANCE_ROUTE: 0xd417,
  SID_FILTER_MODE_VOL: 0xd418,
  CIA1_BASE: 0xdc00,
  CIA1_PRA: 0xdc00,
  CIA1_PRB: 0xdc01,
  CIA1_DDRA: 0xdc02,
  CIA1_DDRB: 0xdc03,
  CIA1_TIMER_A_LO: 0xdc04,
  CIA1_TIMER_A_HI: 0xdc05,
  CIA1_IRQ_CONTROL: 0xdc0d,
  CIA2_BASE: 0xdd00,
  CIA2_PRA: 0xdd00,
  CIA2_PRB: 0xdd01,
  CIA2_IRQ_CONTROL: 0xdd0d,
  SCREEN_RAM: 0x0400,
  COLOR_RAM: 0xd800,
  ZERO_PAGE_IRQ_INDEX: 0xfb,
  ZERO_PAGE_TEMP: 0xfc,
  IRQ_STATE_INDEX: 0xc0fe,
  IRQ_VECTOR_LO: 0x0314,
  IRQ_VECTOR_HI: 0x0315,
  KERNAL_CHROUT: 0xffd2,
  KERNAL_GETIN: 0xffcf,
  KERNAL_SCNKEY: 0xff9f,
  KERNAL_PLOT: 0xfff0,
  KERNAL_CLRCHN: 0xffcc,
  KERNAL_SETLFS: 0xffba,
  KERNAL_SETNAM: 0xffbd,
  KERNAL_LOAD: 0xffd5,
  KERNAL_SAVE: 0xffd8,
  KERNAL_IRQ: 0xea31,
  KERNAL_IRQ_EXIT: 0xea81,
  KEY_SPACE: 0x3c,
  KEY_RETURN: 0x01,
  KEY_F1: 0x04,
  JOYSTICK_PORT_2: 0xdc00,
  JOYSTICK_PORT_1: 0xdc01,
  JOY_UP: 0x01,
  JOY_DOWN: 0x02,
  JOY_LEFT: 0x04,
  JOY_RIGHT: 0x08,
  JOY_FIRE: 0x10,
  HIRES_SCREEN_RAM: 0x5c00,
  HIRES_BITMAP_RAM: 0x6000
};

export const c64 = createRuntimeFacade(C64_CONSTANTS);

// Large games can place generated code outside VIC bank 0 so screen, charset
// and sprite data keep their contiguous video-memory windows.
c64.program = {
  start(address) {
    if (!Number.isInteger(address) || address < 0x0810 || address > 0xffff) {
      throw new Error("c64.program.start() needs an address between $0810 and $FFFF");
    }
    pushInstruction("programConfig", { codeStart: address, sysAddress: address });
  }
};

// High level screen helpers. These functions append DSL instructions to the
// runtime instruction list. The real conversion to assembly happens later in
// src/compiler.js.
c64.borderColor = (color) => pushInstruction("borderColor", color);
c64.backgroundColor = (color) => pushInstruction("backgroundColor", color);
c64.textColor = (color) => {
  // We keep track of the current text color in the runtime state so later
  // calls like printAt() can reuse it automatically.
  setTextColor(color);
  pushInstruction("textColor", color);
};
c64.clearScreen = () => pushInstruction("clearScreen");
c64.waitKey = () => pushInstruction("waitKey");
c64.print = (text) => pushInstruction("print", String(text));
c64.printAt = (x, y, text) => pushInstruction("printAt", x, y, String(text), getProgramState().currentTextColor);
c64.printCentered = (y, text) => pushInstruction("printCentered", y, String(text), getProgramState().currentTextColor);
c64.poke = (address, value) => pushInstruction("poke", address, value);
c64.peek = (address) => ({ type: "peek", address });
c64.memset = (address, value, length) => pushInstruction("memset", address, value, length);
c64.memcpy = (dest, src, length) => pushInstruction("memcpy", dest, src, length);
c64.copyDataTo = (address, dataRefOrName, length) => pushInstruction("copyDataTo", address, dataRefOrName, length);
c64.memsetColor = (address, color, length) => pushInstruction("memsetColor", address, color, length);
c64.writeChar = (x, y, char, color = getProgramState().currentTextColor) => pushInstruction("writeChar", x, y, char, color);
c64.fillRect = (x, y, w, h, char = 32, color = getProgramState().currentTextColor) => pushInstruction("fillRect", x, y, w, h, char, color);
c64.drawFrame = (x, y, w, h, char = 81, color = getProgramState().currentTextColor) => pushInstruction("drawFrame", x, y, w, h, char, color);
c64.clearLine = (y, char = 32, color = getProgramState().currentTextColor) => pushInstruction("clearLine", y, char, color);
c64.screen = (address = 0x0400) => {
  setScreenBase(address);
  pushInstruction("screen", address);
};
c64.colorRam = (address = 0xd800) => {
  setColorBase(address);
  pushInstruction("colorRam", address);
};
c64.sys = (address) => pushInstruction("sys", address);
c64.label = (name) => pushInstruction("label", name);
c64.comment = (text) => pushInstruction("comment", text);

// Minimal hires API for bitmap mode.
// The defaults match the working manual setup from examples/hires-test.js:
// - screen RAM at $5C00
// - bitmap RAM at $6000
c64.hires = {
  screen(address = c64.HIRES_SCREEN_RAM) {
    pushInstruction("hiresScreen", address);
  },
  bitmap(address = c64.HIRES_BITMAP_RAM) {
    pushInstruction("hiresBitmap", address);
  },
  enabled() {
    pushInstruction("hiresEnabled");
  },
  disabled() {
    pushInstruction("hiresDisabled");
  },
  clear(color = c64.COLOR_WHITE) {
    pushInstruction("hiresClear", color);
  },
  point(x, y, color = c64.COLOR_WHITE) {
    pushInstruction("hiresPoint", x, y, color);
  },
  line(x1, y1, x2, y2, color = c64.COLOR_WHITE) {
    pushInstruction("hiresLine", x1, y1, x2, y2, color);
  },
  rect(x, y, width, height, color = c64.COLOR_WHITE) {
    pushInstruction("hiresRect", x, y, width, height, color);
  },
  fillRect(x, y, width, height, color = c64.COLOR_WHITE) {
    pushInstruction("hiresFillRect", x, y, width, height, color);
  },
  circle(x, y, radius, color = c64.COLOR_WHITE) {
    pushInstruction("hiresCircle", x, y, radius, color);
  },
  fillCircle(x, y, radius, color = c64.COLOR_WHITE) {
    pushInstruction("hiresFillCircle", x, y, radius, color);
  }
};

function createSidVoiceApi(voice) {
  return {
    frequency(value) {
      pushInstruction("sidVoiceFrequency", voice, value);
    },
    pulseWidth(value) {
      pushInstruction("sidVoicePulseWidth", voice, value);
    },
    waveform(type) {
      pushInstruction("sidVoiceWaveform", voice, String(type));
    },
    gate(on = true) {
      pushInstruction("sidVoiceGate", voice, Boolean(on));
    },
    attackDecay(value) {
      pushInstruction("sidVoiceAttackDecay", voice, value);
    },
    sustainRelease(value) {
      pushInstruction("sidVoiceSustainRelease", voice, value);
    }
  };
}

c64.sid = {
  volume(value) {
    pushInstruction("sidVolume", value);
  },
  filter(mode, cutoff, resonance) {
    pushInstruction("sidFilter", mode, cutoff, resonance);
  },
  voice(voice) {
    return createSidVoiceApi(voice);
  },
  note(voice, noteName, duration = 0) {
    pushInstruction("sidNote", voice, String(noteName), duration);
  },
  freq(voice, hzOrRawValue) {
    pushInstruction("sidFreq", voice, hzOrRawValue);
  },
  rest(voice, duration = 0) {
    pushInstruction("sidRest", voice, duration);
  },
  playSong(songDefinition) {
    pushInstruction("sidPlaySong", songDefinition);
  },
  installPlayer(line = 250) {
    pushInstruction("sidInstallPlayer", line);
  },
  stopSong() {
    pushInstruction("sidStopSong");
  },
  beep() {
    pushInstruction("sidBeep");
  },
  noise(duration = 12) {
    pushInstruction("sidNoise", duration);
  },
  click() {
    pushInstruction("sidClick");
  },
  explosion() {
    pushInstruction("sidExplosion");
  },
  laser() {
    pushInstruction("sidLaser");
  },
  pickup() {
    pushInstruction("sidPickup");
  }
};

// User data declared here is stored in the compiled program and can later be
// copied to RAM or referenced by generated assembly.
c64.data = {
  byte(name, values) {
    const bytes = Array.from(values);
    defineRuntimeData(name, bytes.length);
    pushInstruction("dataByte", name, bytes);
  },
  word(name, values) {
    const words = Array.from(values);
    defineRuntimeData(name, words.length * 2);
    pushInstruction("dataWord", name, words);
  },
  string(name, text) {
    const normalized = String(text);
    defineRuntimeData(name, normalized.length + 1);
    pushInstruction("dataString", name, normalized);
  },
  screenString(name, text) {
    const normalized = String(text);
    defineRuntimeData(name, normalized.length + 1);
    pushInstruction("dataScreenString", name, normalized);
  },
  length(name) {
    const length = getRuntimeDataLength(name);
    if (length === undefined) {
      throw new Error(`Unknown data length for: ${name}`);
    }
    return length;
  }
};

c64.table = {
  byte(name, values) {
    c64.data.byte(name, values);
    return {
      load(index, target) {
        pushInstruction("runtimeTableLoad", name, index, target);
      },
      store(index, value) {
        pushInstruction("runtimeTableStore", name, index, value);
      }
    };
  }
};

// Asset sources stay as JSON on the development machine. Only their validated,
// compact byte representation is embedded in the generated C64 program.
function createMapCellRef(asset, x, y) {
  const ref = {
    type: "mapTileRef",
    asset,
    x,
    y,
    set(value) {
      pushInstruction("mapRuntimeSet", asset, x, y, value);
    },
    load(target) {
      pushInstruction("mapRuntimeGet", asset, x, y, target);
    },
    eq(value) {
      return condition("mapTileEquals", { asset, x, y, value });
    },
    ne(value) {
      return condition("mapTileNotEquals", { asset, x, y, value });
    },
    isSolid() {
      return condition("mapCollision", { asset, x, y, collision: 1 });
    },
    hasCollision(value) {
      return condition("mapCollision", { asset, x, y, collision: value });
    }
  };
  return ref;
}

function createDynamicMapAsset(asset) {
  const sourceMap = asset.map;
  const mapAccessor = (x, y) => createMapCellRef(dynamicAsset, x, y);
  Object.assign(mapAccessor, sourceMap, {
    redraw() {
      pushInstruction("mapRedraw", dynamicAsset);
    }
  });
  const dynamicAsset = Object.freeze({ ...asset, map: Object.freeze(mapAccessor) });
  pushInstruction("mapRegister", dynamicAsset);
  return dynamicAsset;
}

function registerUsableSpriteAsset(asset, options = {}) {
  const framesRef = c64.sprite.frames(asset.id, asset.frames.map((frame) => frame.data), { address: options.address });
  const usable = Object.freeze({ ...asset, framesRef });
  registerSpriteAsset(usable);
  pushInstruction("spriteAssetRegister", usable);
  return usable;
}

c64.assets = {
  loadMap(filePath) {
    return createDynamicMapAsset(loadMapAsset(filePath, getAssetBaseDirectory()));
  },
  defineMap(definition) {
    return createDynamicMapAsset(normalizeMapAsset(definition));
  },
  loadSprite(filePath, options = {}) {
    return registerUsableSpriteAsset(loadSpriteAsset(filePath, getAssetBaseDirectory()), options);
  },
  defineSprite(definition, options = {}) {
    return registerUsableSpriteAsset(normalizeSpriteAsset(definition), options);
  }
};

c64.charset = {
  use(charset, options = {}) {
    const normalized = charset?.type === "mapAsset" ? charset.charset : charset;
    if (!normalized || normalized.type !== "charsetAsset") throw new Error("c64.charset.use() needs a charset asset");
    pushInstruction("charsetUse", normalized, { address: options.address ?? 0x3000 });
  }
};

function convertMapCoordinates(asset, from, to, source, target) {
  if (!asset || asset.type !== "mapAsset") throw new Error("map coordinate conversion needs a map asset");
  if (!source || !target || source.x === undefined || source.y === undefined || !target.x || !target.y) {
    throw new Error("map coordinate conversion needs { x, y } source and target objects");
  }
  pushInstruction("mapCoordinateConvert", asset, from, to, source.x, source.y, target.x, target.y);
}

let horizontalScrollerCounter = 0;
let mapEntityCounter = 0;

function horizontalScrollPixels(pixels) {
  if (!Number.isInteger(pixels) || pixels < 1 || pixels > 8) {
    throw new Error("scroll pixels must be between 1 and 8");
  }
  return pixels;
}

function normalizeScrollerPanel(panel) {
  if (panel === undefined || typeof panel === "string") return { position: panel, rows: undefined };
  if (!panel || typeof panel !== "object" || Array.isArray(panel)) {
    throw new Error("scroller panel must be bottom/top or { position, rows }");
  }
  let position = panel.position ?? panel.side;
  let rows = panel.rows;
  if (position === undefined && Number.isInteger(panel.bottom)) {
    position = "bottom";
    rows = panel.bottom;
  }
  if (position === undefined && Number.isInteger(panel.top)) {
    position = "top";
    rows = panel.top;
  }
  if (position !== "bottom" && position !== "top") throw new Error("panel.position must be bottom or top");
  if (!Number.isInteger(rows) || rows < 1 || rows > 24) throw new Error("panel.rows must be between 1 and 24");
  return { position, rows };
}

function createHorizontalScroller(asset, options = {}) {
  if (!asset || asset.type !== "mapAsset") throw new Error("c64.map.scroller() needs a map asset");
  const panel = normalizeScrollerPanel(options.panel);
  let viewportY = options.y ?? 0;
  let viewportHeight = options.height;
  if (panel.rows !== undefined) {
    if (panel.position === "top") {
      viewportY = panel.rows;
      viewportHeight = 25 - panel.rows;
    } else {
      viewportHeight = 25 - viewportY - panel.rows;
    }
    if (viewportHeight < 1) throw new Error("panel rows leave no room for the scrolling viewport");
  }
  const ref = Object.freeze({ type: "mapHorizontalScrollerRef", id: horizontalScrollerCounter++ });
  pushInstruction("mapHorizontalScrollerCreate", ref, asset, {
    sourceX: options.sourceX ?? 0,
    sourceY: options.sourceY ?? 0,
    width: options.width,
    height: viewportHeight,
    x: options.x ?? 1,
    y: viewportY,
    panel: panel.position,
    panelRows: panel.rows
  });
  return Object.freeze({
    ...ref,
    draw() {
      pushInstruction("mapHorizontalScrollerDraw", ref);
    },
    left(pixels = 1) {
      pushInstruction("mapHorizontalScrollerMove", ref, -horizontalScrollPixels(pixels));
    },
    right(pixels = 1) {
      pushInstruction("mapHorizontalScrollerMove", ref, horizontalScrollPixels(pixels));
    },
    up(pixels = 1) {
      pushInstruction("mapVerticalScrollerMove", ref, -horizontalScrollPixels(pixels));
    },
    down(pixels = 1) {
      pushInstruction("mapVerticalScrollerMove", ref, horizontalScrollPixels(pixels));
    },
    follow(entity, followOptions = {}) {
      if (!entity || entity.type !== "mapEntityRef") throw new Error("camera.follow() needs an entity returned by c64.map.spawn()");
      pushInstruction("mapScrollerFollow", ref, entity, {
        axis: followOptions.axis ?? "both",
        deadZone: followOptions.deadZone,
        offsetX: followOptions.offsetX ?? followOptions.offset?.x ?? 0,
        offsetY: followOptions.offsetY ?? followOptions.offset?.y ?? 0,
        maxSpeed: followOptions.maxSpeed ?? 2,
        project: followOptions.project !== false,
        cullingMargin: followOptions.cullingMargin ?? followOptions.margin ?? 0
      });
    },
    project(entity, projectionOptions = {}) {
      if (!entity || entity.type !== "mapEntityRef") throw new Error("camera.project() needs an entity returned by c64.map.spawn()");
      pushInstruction("mapScrollerProjectEntity", ref, entity, {
        cullingMargin: projectionOptions.cullingMargin ?? projectionOptions.margin ?? 0
      });
    }
  });
}

function requireMapAsset(asset, method) {
  if (!asset || asset.type !== "mapAsset") throw new Error(`${method} needs a map asset`);
}

function selectMapObjects(asset, selector = undefined) {
  requireMapAsset(asset, "c64.map.objects()");
  const objects = asset.map.objects ?? [];
  if (selector === undefined) return [...objects];
  if (typeof selector === "string") {
    const byId = objects.find((object) => object.id === selector);
    return byId ? [byId] : objects.filter((object) => object.type === selector);
  }
  if (!selector || typeof selector !== "object" || Array.isArray(selector)) {
    throw new Error("map object selector must be an id, a type, or { id/type }");
  }
  return objects.filter((object) => (
    (selector.id === undefined || object.id === selector.id)
    && (selector.type === undefined || object.type === selector.type)
  ));
}

function selectOneMapObject(asset, selector) {
  const matches = selectMapObjects(asset, selector);
  if (matches.length === 0) throw new Error(`No map object matches ${JSON.stringify(selector)}`);
  if (matches.length > 1) throw new Error(`Several map objects match ${JSON.stringify(selector)}; use c64.map.objects() or an object id`);
  return matches[0];
}

function normalizeEntityProjection(options = {}) {
  const rawMargin = options.cullingMargin ?? options.margin ?? 0;
  const marginX = typeof rawMargin === "number" ? rawMargin : rawMargin?.x ?? 0;
  const marginY = typeof rawMargin === "number" ? rawMargin : rawMargin?.y ?? 0;
  if (!Number.isInteger(marginX) || !Number.isInteger(marginY)
    || marginX < 0 || marginY < 0 || marginX > 64 || marginY > 64) {
    throw new Error("entity cullingMargin must be 0..64 or { x: 0..64, y: 0..64 }");
  }
  return {
    cameraX: options.cameraX ?? 0,
    cameraY: options.cameraY ?? 0,
    screenOffsetX: options.screenOffsetX ?? 24,
    screenOffsetY: options.screenOffsetY ?? 50,
    viewportWidth: options.viewportWidth ?? 320,
    viewportHeight: options.viewportHeight ?? 200,
    marginX,
    marginY
  };
}

function normalizeCollisionBehaviors(behaviors) {
  if (behaviors === undefined) return null;
  if (!behaviors || typeof behaviors !== "object" || Array.isArray(behaviors)) {
    throw new Error("entity collisionBehaviors must map collision values to solid, platform, danger, ladder, exit or passable");
  }
  const allowed = new Set(["solid", "platform", "danger", "ladder", "exit", "passable"]);
  const normalized = {};
  for (const [rawValue, rawBehavior] of Object.entries(behaviors)) {
    const value = Number(rawValue);
    const behavior = String(rawBehavior);
    if (!Number.isInteger(value) || value < 0 || value > 255 || !allowed.has(behavior)) {
      throw new Error(`invalid collision behavior ${rawValue}: ${rawBehavior}`);
    }
    normalized[value] = behavior;
  }
  return Object.freeze(normalized);
}

function createMapEntity(asset, object, options = {}) {
  const spriteAssetSelector = options.spriteAsset ?? object.sprite;
  let spriteAsset = null;
  if (spriteAssetSelector !== undefined) {
    spriteAsset = typeof spriteAssetSelector === "string" ? getSpriteAsset(spriteAssetSelector) : spriteAssetSelector;
    if (!spriteAsset || spriteAsset.type !== "spriteAsset" || !spriteAsset.framesRef) {
      throw new Error(`${asset.sourcePath}: map.objects["${object.id}"].sprite references missing sprite asset ${String(spriteAssetSelector)}`);
    }
  }
  const spriteOption = options.sprite;
  let sprite;
  if (Number.isInteger(spriteOption)) {
    const spriteOptions = {
      ...(spriteAsset ? {
        frames: spriteAsset.framesRef,
        color: spriteAsset.color,
        multicolor: spriteAsset.mode === "multicolor",
        hitbox: spriteAsset.hitbox
      } : {}),
      ...(options.spriteOptions ?? {}),
      ...(options.hitbox === undefined ? {} : { hitbox: options.hitbox }),
      active: false
    };
    if (options.spriteOptions?.data !== undefined && options.spriteOptions?.frames === undefined) delete spriteOptions.frames;
    sprite = createSpriteHandle(spriteOption, spriteOptions);
  } else if (spriteOption?.type === "spriteRef") {
    sprite = spriteOption;
  } else {
    throw new Error("c64.map.spawn() needs sprite: 0..15 or a sprite returned by c64.sprite.create()");
  }
  if (spriteAsset) {
    if (spriteAsset.mode === "multicolor" && claimSpriteSharedColors(spriteAsset.multicolor1, spriteAsset.multicolor2, spriteAsset.sourcePath)) {
      c64.sprite.sharedColor1(spriteAsset.multicolor1);
      c64.sprite.sharedColor2(spriteAsset.multicolor2);
    }
    for (const animation of Object.values(spriteAsset.animations)) {
      sprite.sequence(animation.name, animation.frames, { speed: animation.speed, loop: animation.loop });
    }
  }
  const initialAnimation = options.animation ?? object.properties?.animation ?? spriteAsset?.initialAnimation ?? null;
  if (initialAnimation !== null) {
    if (!spriteAsset || !Object.hasOwn(spriteAsset.animations, initialAnimation)) {
      throw new Error(`${asset.sourcePath}: map.objects["${object.id}"].properties.animation references missing sprite animation ${initialAnimation}`);
    }
    sprite.play(initialAnimation);
  }
  const id = mapEntityCounter++;
  const worldX = c64.var.word(`__map_entity_${id}_world_x`, { initial: object.worldX });
  const worldY = c64.var.word(`__map_entity_${id}_world_y`, { initial: object.worldY });
  const velocityX = c64.var.byte(`__map_entity_${id}_velocity_x`, { initial: options.velocityX ?? 0 });
  const velocityY = c64.var.byte(`__map_entity_${id}_velocity_y`, { initial: options.velocityY ?? 0 });
  const onGround = c64.var.bool(`__map_entity_${id}_on_ground`, false);
  const hitCeiling = c64.var.bool(`__map_entity_${id}_hit_ceiling`, false);
  const hitLeft = c64.var.bool(`__map_entity_${id}_hit_left`, false);
  const hitRight = c64.var.bool(`__map_entity_${id}_hit_right`, false);
  const enabled = c64.var.bool(`__map_entity_${id}_enabled`, options.active !== false);
  const onDanger = c64.var.bool(`__map_entity_${id}_on_danger`, false);
  const onLadder = c64.var.bool(`__map_entity_${id}_on_ladder`, false);
  const atExit = c64.var.bool(`__map_entity_${id}_at_exit`, false);
  const collisionBehaviors = normalizeCollisionBehaviors(options.collisionBehaviors);
  const state = Object.freeze({
    type: "mapEntityRef", id, asset, object, sprite, spriteAsset, initialAnimation, worldX, worldY,
    velocityX, velocityY, onGround, hitCeiling, hitLeft, hitRight, enabled,
    onDanger, onLadder, atExit, collisionBehaviors,
    hitbox: sprite.hitbox,
    maxCollisionSpeed: options.maxCollisionSpeed ?? 8
  });
  pushInstruction("mapEntityCreate", state);
  return Object.freeze({
    ...state,
    screenX: sprite.x,
    screenY: sprite.y,
    setWorldPosition(x, y) {
      worldX.set(x);
      worldY.set(y);
    },
    setVelocity(x, y) {
      velocityX.set(x);
      velocityY.set(y);
    },
    moveAndCollide(x = undefined, y = undefined) {
      if (x !== undefined) velocityX.set(x);
      if (y !== undefined) velocityY.set(y);
      pushInstruction("mapEntityMoveAndCollide", state);
    },
    jump(speed) {
      if (!Number.isInteger(speed) || speed < 1 || speed > 127) throw new Error("entity jump speed must be between 1 and 127");
      velocityY.set(-speed);
      onGround.set(false);
    },
    isOnGround() {
      return onGround.eq(true);
    },
    isActive() {
      return enabled.eq(true);
    },
    isOnDanger() {
      return onDanger.eq(true);
    },
    isOnLadder() {
      return onLadder.eq(true);
    },
    isAtExit() {
      return atExit.eq(true);
    },
    project(projection = {}) {
      pushInstruction("mapEntityProject", state, normalizeEntityProjection(projection));
    },
    enable() {
      enabled.set(true);
      sprite.enable();
    },
    disable() {
      enabled.set(false);
      sprite.disable();
    },
    respawn(selector = object.id) {
      const spawn = selectOneMapObject(asset, selector);
      worldX.set(spawn.worldX);
      worldY.set(spawn.worldY);
      velocityX.set(0);
      velocityY.set(0);
      onGround.set(false);
      hitCeiling.set(false);
      hitLeft.set(false);
      hitRight.set(false);
      onDanger.set(false);
      onLadder.set(false);
      atExit.set(false);
      enabled.set(true);
      sprite.enable();
    },
    collides(other) {
      if (!other || other.type !== "mapEntityRef") throw new Error("entity.collides() needs another map entity");
      return sprite.collides(other.sprite);
    },
    play(name, direction = undefined) {
      if (!spriteAsset) throw new Error(`Map entity ${object.id} has no sprite asset with named animations`);
      const animationName = direction === undefined ? String(name) : `${name}-${direction}`;
      if (!Object.hasOwn(spriteAsset.animations, animationName)) {
        throw new Error(`${spriteAsset.sourcePath}: animations.${animationName} is missing for map object ${object.id}`);
      }
      sprite.play(animationName);
    },
    pauseAnimation() {
      sprite.pauseAnimation();
    },
    resumeAnimation() {
      sprite.resumeAnimation();
    }
  });
}

c64.map = {
  draw(asset, options = {}) {
    if (!asset || asset.type !== "mapAsset") throw new Error("c64.map.draw() needs a map asset");
    pushInstruction("mapDraw", asset, { x: options.x ?? 0, y: options.y ?? 0 });
  },
  drawViewport(asset, options = {}) {
    if (!asset || asset.type !== "mapAsset") throw new Error("c64.map.drawViewport() needs a map asset");
    pushInstruction("mapViewportDraw", asset, {
      sourceX: options.sourceX ?? 0,
      sourceY: options.sourceY ?? 0,
      width: options.width,
      height: options.height,
      x: options.x ?? 0,
      y: options.y ?? 0
    });
  },
  horizontalScroller(asset, options = {}) {
    return createHorizontalScroller(asset, options);
  },
  scroller(asset, options = {}) {
    return createHorizontalScroller(asset, options);
  },
  object(asset, selector) {
    return selectOneMapObject(asset, selector);
  },
  objects(asset, selector = undefined) {
    return Object.freeze(selectMapObjects(asset, selector));
  },
  spawn(asset, selector, options = {}) {
    return createMapEntity(asset, selectOneMapObject(asset, selector), options);
  },
  spawnAll(asset, selector, options = {}) {
    const matches = selectMapObjects(asset, selector);
    if (matches.length === 0) throw new Error(`No map objects match ${JSON.stringify(selector)}`);
    const firstSprite = options.firstSprite ?? 0;
    if (!Number.isInteger(firstSprite) || firstSprite < 0 || firstSprite + matches.length > 16) {
      throw new Error("c64.map.spawnAll() needs enough consecutive sprite indexes between 0 and 15");
    }
    return Object.freeze(matches.map((object, index) => createMapEntity(asset, object, {
      ...options,
      sprite: firstSprite + index
    })));
  },
  tileAt(asset, x, y) {
    if (!asset || asset.type !== "mapAsset") throw new Error("c64.map.tileAt() needs a map asset");
    return createMapCellRef(asset, x, y);
  },
  setTile(asset, x, y, value) {
    createMapCellRef(asset, x, y).set(value);
  },
  pixelToTile(asset, source, target) {
    convertMapCoordinates(asset, "pixel", "tile", source, target);
  },
  tileToPixel(asset, source, target) {
    convertMapCoordinates(asset, "tile", "pixel", source, target);
  },
  characterToTile(asset, source, target) {
    convertMapCoordinates(asset, "character", "tile", source, target);
  },
  tileToCharacter(asset, source, target) {
    convertMapCoordinates(asset, "tile", "character", source, target);
  }
};

// Variables are explicit RAM locations chosen by the user. The compiler will
// emit initialization code for them at program start.
c64.var = {
  byte(name, addressOrOptions, initialValue = 0) {
    const options = addressOrOptions && typeof addressOrOptions === "object"
      ? addressOrOptions
      : { address: addressOrOptions, initial: initialValue };
    const ref = createRuntimeByteRef(name);
    pushInstruction("varByte", name, options.address, options.initial ?? 0);
    return ref;
  },
  word(name, address, initialValue = 0) {
    const options = address && typeof address === "object" ? address : { address, initial: initialValue };
    const ref = createRuntimeValueRef(name, "word");
    pushInstruction("varWord", name, options.address, options.initial ?? 0);
    return ref;
  },
  bool(name, options = {}) {
    const normalized = typeof options === "boolean" ? { initial: options } : options;
    const ref = createRuntimeValueRef(name, "bool");
    pushInstruction("varBool", name, normalized.address, Boolean(normalized.initial));
    return ref;
  }
};

function condition(operator, left, right = undefined) {
  return { type: "runtimeCondition", operator, left, right };
}

function createRuntimeValueRef(name, valueType = "byte") {
  const ref = {
    type: "varRef",
    valueType,
    name,
    set(value) {
      pushInstruction("runtimeSet", ref, value);
    },
    add(value) {
      pushInstruction("runtimeAdd", ref, value);
    },
    sub(value) {
      pushInstruction("runtimeSub", ref, value);
    },
    inc() {
      pushInstruction("runtimeInc", ref);
    },
    dec() {
      pushInstruction("runtimeDec", ref);
    },
    and(value) {
      pushInstruction("runtimeBit", "and", ref, value);
    },
    or(value) {
      pushInstruction("runtimeBit", "or", ref, value);
    },
    xor(value) {
      pushInstruction("runtimeBit", "xor", ref, value);
    },
    toggle() {
      pushInstruction("runtimeBit", "xor", ref, 1);
    },
    eq(value) {
      return condition("eq", ref, value);
    },
    ne(value) {
      return condition("ne", ref, value);
    },
    lt(value) {
      return condition("lt", ref, value);
    },
    lte(value) {
      return condition("lte", ref, value);
    },
    gt(value) {
      return condition("gt", ref, value);
    },
    gte(value) {
      return condition("gte", ref, value);
    }
  };
  return ref;
}

function createRuntimeByteRef(name) {
  return createRuntimeValueRef(name, "byte");
}

c64.control = {
  if(runtimeCondition, thenHandler, elseHandler = undefined) {
    if (!runtimeCondition || runtimeCondition.type !== "runtimeCondition") {
      throw new Error("c64.control.if() needs a runtime condition");
    }
    if (typeof thenHandler !== "function") {
      throw new Error("c64.control.if() needs a then callback");
    }
    const thenInstructions = captureBlock(thenHandler);
    const elseInstructions = elseHandler === undefined ? [] : captureBlock(elseHandler);
    pushInstruction("controlIf", runtimeCondition, thenInstructions, elseInstructions);
  },
  repeat(count, handler) {
    pushInstruction("controlRepeat", count, captureBlock(handler));
  },
  while(runtimeCondition, handler, options = {}) {
    if (!runtimeCondition || runtimeCondition.type !== "runtimeCondition") {
      throw new Error("c64.control.while() needs a runtime condition");
    }
    pushInstruction("controlWhile", runtimeCondition, captureBlock(handler), options.maxIterations);
  },
  routine(name, handler) {
    pushInstruction("controlRoutine", String(name), captureBlock(handler));
  },
  call(name) {
    pushInstruction("controlCall", String(name));
  }
};

const JOYSTICK_DIRECTIONS = Object.freeze({
  up: 0x01,
  down: 0x02,
  left: 0x04,
  right: 0x08,
  fire: 0x10
});

function joystickCondition(port, direction, event) {
  useJoystickPort(port);
  return condition("joystick", { port, direction, mask: JOYSTICK_DIRECTIONS[direction], event });
}

function createInputButton(makeCondition) {
  return {
    held: () => makeCondition("held"),
    pressed: () => makeCondition("pressed"),
    released: () => makeCondition("released")
  };
}

c64.input = {
  joystick(port = 2) {
    useJoystickPort(port);
    const api = {};
    for (const direction of Object.keys(JOYSTICK_DIRECTIONS)) {
      api[direction] = () => joystickCondition(port, direction, "held");
      api[`${direction}Pressed`] = () => joystickCondition(port, direction, "pressed");
      api[`${direction}Released`] = () => joystickCondition(port, direction, "released");
    }
    return api;
  },
  keyboard(bindings) {
    const actions = {};
    for (const [action, keyCode] of Object.entries(bindings ?? {})) {
      useKeyboardKey(keyCode);
      actions[action] = createInputButton((event) => {
        useKeyboardKey(keyCode);
        return condition("keyboard", { keyCode, event });
      });
    }
    return actions;
  }
};

c64.game = {
  init(handler) {
    pushInstruction("gameInit", captureBlock(handler));
  },
  every(count, handler) {
    pushInstruction("gameEvery", count, captureBlock(handler));
  },
  frame(handler, options = {}) {
    if (typeof handler !== "function") {
      throw new Error("c64.game.frame() needs a callback");
    }
    // Leave rasterLine undefined so the compiler can place scrolling games
    // immediately after their raster band. Non-scrolling programs still use
    // line 240, and an explicit user value always wins.
    pushInstruction("gameFrame", captureBlock(handler), { rasterLine: options.rasterLine, hz: options.hz ?? 50 });
  }
};

// varRef() and dataRef() are lightweight descriptors used by the compiler to
// know "this argument is not a literal value, it is a reference".
c64.varRef = (name) => ({ type: "varRef", name });
c64.dataRef = (name, length = undefined) => ({ type: "dataRef", name, length });

function normalizeSpriteHitbox(hitbox = {}) {
  return {
    offsetX: hitbox.offsetX ?? 0,
    offsetY: hitbox.offsetY ?? 0,
    width: hitbox.width ?? 24,
    height: hitbox.height ?? 21
  };
}

function validateSpriteXLiteral(value, label) {
  if (typeof value === "number" && (!Number.isInteger(value) || value < 0 || value > 511)) {
    throw new Error(`${label} must be between 0 and 511`);
  }
}

function validateSpriteVelocity(value, label) {
  if (typeof value === "number" && (!Number.isInteger(value) || value < -128 || value > 127)) {
    throw new Error(`${label} must be a signed byte between -128 and 127`);
  }
}

const SPRITE_LOGICAL_STATE_BASE = 0xc500;
const SPRITE_LOGICAL_STATE_STRIDE = 8;

function validateLogicalSpriteIndex(index) {
  if (!Number.isInteger(index) || index < 0 || index > 15) {
    throw new Error("sprite index must be between 0 and 15");
  }
}

function createSpriteHandle(index, options = {}) {
  validateLogicalSpriteIndex(index);
  validateSpriteXLiteral(options.x ?? 0, "sprite x");
  validateSpriteVelocity(options.vx ?? 0, "sprite vx");
  validateSpriteVelocity(options.vy ?? 0, "sprite vy");
  const stateAddress = SPRITE_LOGICAL_STATE_BASE + index * SPRITE_LOGICAL_STATE_STRIDE;
  const state = {
    type: "spriteRef",
    index,
    initialX: options.x ?? 0,
    initialY: options.y ?? 0,
    x: c64.var.word(`__sprite${index}_x`, { address: stateAddress, initial: options.x ?? 0 }),
    y: c64.var.byte(`__sprite${index}_y`, { address: stateAddress + 2, initial: options.y ?? 0 }),
    vx: c64.var.byte(`__sprite${index}_vx`, { address: stateAddress + 3, initial: options.vx ?? 0 }),
    vy: c64.var.byte(`__sprite${index}_vy`, { address: stateAddress + 4, initial: options.vy ?? 0 }),
    active: c64.var.bool(`__sprite${index}_active`, { address: stateAddress + 5, initial: options.active !== false }),
    hitbox: normalizeSpriteHitbox(options.hitbox)
  };
  pushInstruction("spriteCreateRuntime", state, {
    minX: options.minX ?? 0,
    maxX: options.maxX ?? 511,
    minY: options.minY ?? 0,
    maxY: options.maxY ?? 255,
    bounceX: Boolean(options.bounceX),
    bounceY: Boolean(options.bounceY)
  });
  if (options.data !== undefined) pushInstruction("spriteRuntimeData", state, options.data, options.dataAddress);
  if (options.frames !== undefined) pushInstruction("spriteUseFrames", state, options.frames);
  if (options.color !== undefined) pushInstruction("spriteRuntimeColor", state, options.color);
  if (options.multicolor !== undefined) pushInstruction("spriteRuntimeFlag", state, "multicolor", Boolean(options.multicolor));
  if (options.expandX !== undefined) pushInstruction("spriteRuntimeFlag", state, "expandX", Boolean(options.expandX));
  if (options.expandY !== undefined) pushInstruction("spriteRuntimeFlag", state, "expandY", Boolean(options.expandY));
  if (options.priority !== undefined) pushInstruction("spriteRuntimeFlag", state, "priority", Boolean(options.priority));

  return {
    ...state,
    setPosition(x, y) {
      validateSpriteXLiteral(x, "sprite x");
      state.x.set(x);
      state.y.set(y);
      pushInstruction("spriteRuntimeSync", state);
    },
    setVelocity(vx, vy) {
      validateSpriteVelocity(vx, "sprite vx");
      validateSpriteVelocity(vy, "sprite vy");
      state.vx.set(vx);
      state.vy.set(vy);
    },
    setBounds(minX, maxX, minY, maxY, options = {}) {
      pushInstruction("spriteRuntimeBounds", state, { minX, maxX, minY, maxY, bounceX: Boolean(options.bounceX), bounceY: Boolean(options.bounceY) });
    },
    update() {
      pushInstruction("spriteRuntimeUpdate", state);
    },
    reverseX() {
      pushInstruction("spriteReverseVelocity", state, "x");
    },
    reverseY() {
      pushInstruction("spriteReverseVelocity", state, "y");
    },
    sync() {
      pushInstruction("spriteRuntimeSync", state);
    },
    enable() {
      state.active.set(true);
      pushInstruction("spriteRuntimeSync", state);
    },
    disable() {
      state.active.set(false);
      pushInstruction("spriteRuntimeSync", state);
    },
    sequence(name, frameIndexes, sequenceOptions = {}) {
      pushInstruction("spriteSequence", state, String(name), Array.from(frameIndexes), { speed: sequenceOptions.speed ?? 6, loop: sequenceOptions.loop !== false });
    },
    play(name) {
      pushInstruction("spritePlaySequence", state, String(name));
    },
    pauseAnimation() {
      pushInstruction("spritePauseSequence", state);
    },
    resumeAnimation() {
      pushInstruction("spriteResumeSequence", state);
    },
    collides(other) {
      return condition("spriteAabb", { a: state, b: other });
    },
    vicCollides(other) {
      return condition("spriteVic", { a: index, b: other.index });
    },
    collidesWithBackground() {
      return condition("spriteBackground", { index });
    }
  };
}

// Sprite helpers follow the same pattern as the screen API: each call stores a
// semantic instruction that the compiler later expands into VIC-II register
// writes or IRQ-based animation code.
c64.sprite = {
  frames(name, frames, options = {}) {
    const ref = { type: "spriteFrames", name: String(name) };
    pushInstruction("spriteFrames", ref, Array.from(frames, (frame) => Array.from(frame)), options.address);
    return ref;
  },
  create(index, options = {}) {
    return createSpriteHandle(index, options);
  },
  enable(n) {
    pushInstruction("spriteEnable", n);
  },
  disable(n) {
    pushInstruction("spriteDisable", n);
  },
  show(n, x, y, color) {
    pushInstruction("spriteShow", n, x, y, color);
  },
  hide(n) {
    pushInstruction("spriteHide", n);
  },
  position(n, x, y) {
    pushInstruction("spritePosition", n, x, y);
  },
  setX(n, x) {
    pushInstruction("spriteSetX", n, x);
  },
  setY(n, y) {
    pushInstruction("spriteSetY", n, y);
  },
  moveX(n, dx) {
    pushInstruction("spriteMoveX", n, dx);
  },
  moveY(n, dy) {
    pushInstruction("spriteMoveY", n, dy);
  },
  moveToX(n, targetX, speed) {
    pushInstruction("spriteMoveToX", n, targetX, speed);
  },
  moveToY(n, targetY, speed) {
    pushInstruction("spriteMoveToY", n, targetY, speed);
  },
  animateTo(n, { x, y, speedX, speedY }) {
    pushInstruction("spriteAnimateTo", n, { x, y, speedX, speedY });
  },
  stop(n) {
    pushInstruction("spriteStop", n);
  },
  stopX(n) {
    pushInstruction("spriteStopX", n);
  },
  stopY(n) {
    pushInstruction("spriteStopY", n);
  },
  color(n, color) {
    pushInstruction("spriteColor", n, color);
  },
  data(n, bytesOrLabel, address = undefined) {
    pushInstruction("spriteData", n, bytesOrLabel, address);
  },
  pointer(n, blockIndex) {
    pushInstruction("spritePointer", n, blockIndex);
  },
  multicolor(n, enabled) {
    pushInstruction("spriteMulticolor", n, enabled);
  },
  expandX(n, enabled) {
    pushInstruction("spriteExpandX", n, enabled);
  },
  expandY(n, enabled) {
    pushInstruction("spriteExpandY", n, enabled);
  },
  priority(n, behindBackground) {
    pushInstruction("spritePriority", n, behindBackground);
  },
  sharedColor1(color) {
    pushInstruction("spriteSharedColor1", color);
  },
  sharedColor2(color) {
    pushInstruction("spriteSharedColor2", color);
  },
  installAnimator(line = 250) {
    pushInstruction("spriteInstallAnimator", line);
  }
};

export { getProgramState, resetRuntime };
