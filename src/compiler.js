import path from "node:path";
import { pathToFileURL } from "node:url";
import { Assembler6502, abs, absx, absy, acc, imm, immHi, immLo, indy, rel, zp, exportBasicData } from "./assembler6502.js";
import { c64, getProgramState, resetRuntime } from "./c64.js";
import { createBasicDataProgram, createPrg } from "./prgWriter.js";
import { expandMapAsset } from "./assets.js";
import { setAssetBaseDirectory } from "./runtime.js";

// The compiler is the bridge between the user DSL and the final C64 outputs.
// It receives a list of recorded instructions and turns them into:
// - machine code bytes
// - a PRG file
// - an assembly listing
// - BASIC DATA text
const DEFAULT_CODE_START = 0x0810;
const DEFAULT_SYS_ADDRESS = 2064;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;
const HIRES_ZP_PTR_LO = 0xfb;
const HIRES_ZP_PTR_HI = 0xfc;
const HIRES_ZP_WORK_LO = 0xfd;
const HIRES_ZP_WORK_HI = 0xfe;
const HIRES_TMP_X_LO = 0xc738;
const HIRES_TMP_64_LO = 0xc739;
const HIRES_TMP_64_HI = 0xc73a;
const HIRES_POINT_X_LO = 0xc73b;
const HIRES_POINT_Y = 0xc73c;
const HIRES_POINT_COLOR = 0xc73d;
const HIRES_POINT_X_HI = 0xc73e;
const HIRES_LINE_X1_LO = 0xc73f;
const HIRES_LINE_X1_HI = 0xc740;
const HIRES_LINE_Y1 = 0xc741;
const HIRES_LINE_X2_LO = 0xc742;
const HIRES_LINE_X2_HI = 0xc743;
const HIRES_LINE_Y2 = 0xc744;
const HIRES_LINE_COLOR = 0xc745;
const HIRES_LINE_CURX_LO = 0xc746;
const HIRES_LINE_CURX_HI = 0xc747;
const HIRES_LINE_CURY = 0xc748;
const HIRES_LINE_DX_LO = 0xc749;
const HIRES_LINE_DX_HI = 0xc74a;
const HIRES_LINE_DY_LO = 0xc74b;
const HIRES_LINE_DY_HI = 0xc74c;
const HIRES_LINE_ACC_LO = 0xc74d;
const HIRES_LINE_ACC_HI = 0xc74e;
const HIRES_LINE_COUNT_LO = 0xc74f;
const HIRES_LINE_COUNT_HI = 0xc750;
const HIRES_LINE_SX_NEG = 0xc751;
const HIRES_LINE_SY_NEG = 0xc752;
const HIRES_LINE_MAJOR_X = 0xc753;
const HIRES_FILL_Y_END = 0xc754;
const HIRES_CIRCLE_CX_LO = 0xc755;
const HIRES_CIRCLE_CX_HI = 0xc756;
const HIRES_CIRCLE_CY = 0xc757;
const HIRES_CIRCLE_RADIUS = 0xc758;
const HIRES_CIRCLE_COLOR = 0xc759;
const HIRES_CIRCLE_FILL = 0xc75a;
const HIRES_CIRCLE_X = 0xc75b;
const HIRES_CIRCLE_Y = 0xc75c;
const HIRES_CIRCLE_ERR_LO = 0xc75d;
const HIRES_CIRCLE_ERR_HI = 0xc75e;
const WAITKEY_SAVE_PRA = 0xc75f;
const WAITKEY_SAVE_DDRA = 0xc760;
const WAITKEY_SAVE_DDRB = 0xc761;
const WAITKEY_ROW_INDEX = 0xc762;
const SID_PLAYER_STEP_INDEX = 0xc763;
const SID_PLAYER_TICK_COUNT = 0xc764;
const SID_PLAYER_PLAYING = 0xc765;
const INPUT_JOYSTICK_1 = 0xc766;
const INPUT_JOYSTICK_2 = 0xc767;
const INPUT_JOYSTICK_PREV_1 = 0xc768;
const INPUT_JOYSTICK_PREV_2 = 0xc769;
const GAME_FRAME_COUNTER_LO = 0xc76a;
const GAME_FRAME_COUNTER_HI = 0xc76b;
const INPUT_SAVE_PRA = 0xc76c;
const INPUT_SAVE_DDRA = 0xc76d;
const INPUT_SAVE_DDRB = 0xc76e;
const GAME_VIDEO_HZ = 0xc76f;
const GAME_RATE_ACCUMULATOR = 0xc770;
const SID_PLAYER_RATE_ACCUMULATOR = 0xc771;
const SID_PLAYER_VOLUME = 0xc772;
const SID_FADE_TARGET = 0xc773;
const SID_FADE_INTERVAL = 0xc774;
const SID_FADE_COUNTER = 0xc775;
const SID_FADE_ACTIVE = 0xc776;
const ASSET_RLE_COUNT = 0xc777;
const MAP_ACTIVE_ID = 0xc778;
const MAP_PENDING_ID = 0xc779;
const GAME_SCENE_CURRENT = 0xc77a;
const GAME_SCENE_PENDING = 0xc77b;
const GAME_SCENE_NONE = 0xff;
const GAME_SCENE_IDS = Object.freeze({ title: 0, game: 1, pause: 2, gameOver: 3 });
const DISK_LOAD_ERROR = 0xc77c;
const GAME_RANDOM_STATE = 0xc77d;
const KEYBOARD_CURRENT_BASE = 0xc780;
const KEYBOARD_PREVIOUS_BASE = 0xc790;
const MAX_KEYBOARD_ACTIONS = 16;
const SPRITE_RUNTIME_BASE = 0xc400;
const SPRITE_RUNTIME_STRIDE = 8;
const SPRITE_LOGICAL_COUNT = 16;
const SPRITE_LOGICAL_STATE_BASE = 0xc500;
const SPRITE_LOGICAL_STATE_STRIDE = 8;
const SPRITE_MUX_SORTED_BASE = 0xc580;
const SPRITE_MUX_SORTED_COUNT = 0xc590;
const SPRITE_MUX_OUTER_OFFSET = 0xc591;
const SPRITE_MUX_NEW_OFFSET = 0xc592;
const SPRITE_MUX_NEW_Y = 0xc593;
const SPRITE_MUX_LIST_POSITION = 0xc594;
const SPRITE_MUX_HARDWARE_SLOT = 0xc595;
const SPRITE_MUX_MIN_END = 0xc596;
const SPRITE_MUX_LOGICAL_OFFSET = 0xc597;
const SPRITE_MUX_COORD_OFFSET = 0xc598;
const SPRITE_MUX_BIT_MASK = 0xc599;
const SPRITE_MUX_INVERSE_MASK = 0xc59a;
const SPRITE_MUX_SLOT_END_BASE = 0xc5a0;
const SPRITE_MUX_FRAME_RASTER = 200;
// Large mutable maps live in the free RAM window below BASIC ROM. Indexing is
// 16-bit, so a level is no longer limited to a single 256-byte page.
const MAP_RUNTIME_BASE = 0x8000;
const MAP_RUNTIME_END = 0x9fff;
// Disk levels reuse these small tables. They contain collision values and the
// character/color cells needed by the renderer; only one level is active.
const MAP_DISK_TABLE_BASE = 0x3800;
const MAP_DISK_TABLE_END = 0x3fff;
const COLLISION_TEMP_BASE = 0xc7a0;
const VIC_SPRITE_COLLISION_SNAPSHOT = 0xc7b0;
const VIC_BACKGROUND_COLLISION_SNAPSHOT = 0xc7b1;
const MAP_TEMP_X = 0xc7b2;
const MAP_TEMP_Y = 0xc7b3;
const MAP_TEMP_TILE = 0xc7b4;
const MAP_TEMP_TILE_OFFSET = 0xc7b5;
const MAP_TEMP_INDEX = 0xc7b6;
const MAP_TEMP_ROWS = 0xc7b7;
const MAP_TEMP_VALUE = 0xc7b8;
const MAP_TEMP_PIXEL_OFFSET = 0xc7b9;
const MAP_TEMP_INDEX_HI = 0xc7ba;
const MAP_CONVERT_LO = 0xc7bb;
const MAP_CONVERT_HI = 0xc7bc;
const MAP_CONVERT_RESULT_LO = 0xc7bd;
const MAP_CONVERT_RESULT_HI = 0xc7be;
const MAP_CONVERT_COUNT = 0xc7bf;
const MAP_VIEW_SOURCE_X = 0xc7c0;
const MAP_VIEW_SOURCE_Y = 0xc7c1;
const MAP_SCREEN_TILE_X = 0xc7c2;
const MAP_SCREEN_TILE_Y = 0xc7c3;
const MAP_ENTITY_PIXEL_X_LO = 0xc7c4;
const MAP_ENTITY_PIXEL_X_HI = 0xc7c5;
const MAP_ENTITY_PIXEL_Y_LO = 0xc7c6;
const MAP_ENTITY_PIXEL_Y_HI = 0xc7c7;
const MAP_ENTITY_STEP_COUNT = 0xc7c8;
const MAP_ENTITY_COLLISION_MODE = 0xc7c9;
// The 38-column VIC-II window starts at XSCROLL=7. Screen characters are
// therefore seven pixels to the right of their logical world coordinate at
// camera pixel zero. Sprite projection must use the same phase origin.
const MAP_SCROLL_FINE_X_ORIGIN = 7;
// The normal 25-row screen uses YSCROLL=3. A scrolling band starts at phase 7,
// so projected sprites need the corresponding four-pixel vertical origin when
// D011 fine scrolling is active.
const MAP_SCROLL_FINE_Y_ORIGIN = 4;
const AUTO_VARIABLE_START = 0xc100;
const AUTO_VARIABLE_END = 0xc2ff;
const RESERVED_RUNTIME_RANGES = Object.freeze([
  { start: c64.IRQ_STATE_INDEX, end: c64.IRQ_STATE_INDEX, name: "IRQ state" },
  { start: 0xc300, end: 0xc33f, name: "sprite animator" },
  { start: 0xc738, end: 0xc77f, name: "compiler runtime" },
  { start: KEYBOARD_CURRENT_BASE, end: KEYBOARD_PREVIOUS_BASE + MAX_KEYBOARD_ACTIONS - 1, name: "keyboard input runtime" },
  { start: SPRITE_RUNTIME_BASE, end: SPRITE_RUNTIME_BASE + SPRITE_RUNTIME_STRIDE * SPRITE_LOGICAL_COUNT - 1, name: "sprite gameplay runtime" },
  { start: SPRITE_LOGICAL_STATE_BASE, end: SPRITE_LOGICAL_STATE_BASE + SPRITE_LOGICAL_STATE_STRIDE * SPRITE_LOGICAL_COUNT - 1, name: "sprite logical state" },
  { start: SPRITE_MUX_SORTED_BASE, end: SPRITE_MUX_SLOT_END_BASE + 7, name: "Y-sorted sprite multiplexer" },
  { start: COLLISION_TEMP_BASE, end: VIC_BACKGROUND_COLLISION_SNAPSHOT, name: "collision runtime" },
  { start: MAP_TEMP_X, end: MAP_ENTITY_COLLISION_MODE, name: "dynamic map, viewport and entity temporary state" }
]);

// The compiler uses a fixed internal RAM layout for long-running systems such
// as waitKey, hires helpers and the SID player. Keeping these addresses grouped
// and documented makes it easier to audit future features for overlap risks.
const RUNTIME_RAM_LAYOUT = Object.freeze({
  irqStateIndex: c64.IRQ_STATE_INDEX,
  waitKey: {
    savePra: WAITKEY_SAVE_PRA,
    saveDdra: WAITKEY_SAVE_DDRA,
    saveDdrb: WAITKEY_SAVE_DDRB,
    rowIndex: WAITKEY_ROW_INDEX
  },
  sidPlayer: {
    stepIndex: SID_PLAYER_STEP_INDEX,
    tickCount: SID_PLAYER_TICK_COUNT,
    playing: SID_PLAYER_PLAYING,
    rateAccumulator: SID_PLAYER_RATE_ACCUMULATOR,
    volume: SID_PLAYER_VOLUME,
    fadeTarget: SID_FADE_TARGET,
    fadeInterval: SID_FADE_INTERVAL,
    fadeCounter: SID_FADE_COUNTER,
    fadeActive: SID_FADE_ACTIVE
  },
  input: {
    joystick1: INPUT_JOYSTICK_1,
    joystick2: INPUT_JOYSTICK_2,
    previousJoystick1: INPUT_JOYSTICK_PREV_1,
    previousJoystick2: INPUT_JOYSTICK_PREV_2,
    keyboardCurrentBase: KEYBOARD_CURRENT_BASE,
    keyboardPreviousBase: KEYBOARD_PREVIOUS_BASE
  },
  game: {
    frameCounterLo: GAME_FRAME_COUNTER_LO,
    frameCounterHi: GAME_FRAME_COUNTER_HI,
    videoHz: GAME_VIDEO_HZ,
    rateAccumulator: GAME_RATE_ACCUMULATOR,
    sceneCurrent: GAME_SCENE_CURRENT,
    scenePending: GAME_SCENE_PENDING
  },
  spriteAnimatorBase: 0xc300,
  hires: {
    pointXLo: HIRES_POINT_X_LO,
    pointXHi: HIRES_POINT_X_HI,
    pointY: HIRES_POINT_Y,
    pointColor: HIRES_POINT_COLOR
  }
});

function ensureByte(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 0xff) {
    throw new Error(`${label} must be a byte value`);
  }
}

function ensureWord(value, label) {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff) {
    throw new Error(`${label} must be a 16-bit value`);
  }
}

function isPeekRef(value) {
  return value && typeof value === "object" && value.type === "peek";
}

function isVarRef(value) {
  return value && typeof value === "object" && value.type === "varRef";
}

function isDataRef(value) {
  return value && typeof value === "object" && value.type === "dataRef";
}

function asciiToPetscii(char) {
  const code = char.charCodeAt(0);
  if (code >= 32 && code <= 126) {
    return code;
  }
  return 32;
}

function asciiToScreenCode(char) {
  const code = char.charCodeAt(0);
  if (char === " ") {
    return 32;
  }
  if (code >= 65 && code <= 90) {
    return code - 64;
  }
  if (code >= 97 && code <= 122) {
    return code - 96;
  }
  if (code >= 48 && code <= 57) {
    return code;
  }
  return code & 0xff;
}

function addressMode(address) {
  return address <= 0xff ? zp(address) : abs(address);
}

function addressModeX(address) {
  return address <= 0xff ? { mode: "zpx", value: address } : absx(address);
}

function emitStoreImmediate(asm, address, value) {
  ensureWord(address, "address");
  ensureByte(value, "value");
  asm.lda(imm(value));
  asm.sta(addressMode(address));
}

function emitLoadAndStore(asm, source, destination) {
  ensureWord(source, "source");
  ensureWord(destination, "destination");
  asm.lda(addressMode(source));
  asm.sta(addressMode(destination));
}

function resolveVarRef(compileState, ref) {
  const variable = compileState.variables.get(ref.name);
  if (!variable) {
    throw new Error(`Unknown variable reference: ${ref.name}`);
  }
  return variable;
}

function resolveDataRef(compileState, refOrName) {
  const name = typeof refOrName === "string" ? refOrName : refOrName.name;
  const data = compileState.dataPool.get(name);
  if (!data) {
    return { name, bytes: null, declaredLength: typeof refOrName === "object" ? refOrName.length : undefined };
  }
  return { name, bytes: data, declaredLength: typeof refOrName === "object" ? refOrName.length : undefined };
}

function resolveAddress(compileState, value, label = "address") {
  if (isVarRef(value)) {
    return resolveVarRef(compileState, value).address;
  }
  ensureWord(value, label);
  return value;
}

function resolveByteValue(value, label = "value") {
  ensureByte(value, label);
  return value;
}

function ensureSpriteIndex(value) {
  if (!Number.isInteger(value) || value < 0 || value > 7) {
    throw new Error("sprite index must be between 0 and 7");
  }
}

function ensureSignedByte(value, label) {
  if (!Number.isInteger(value) || value < -128 || value > 127) {
    throw new Error(`${label} must be a signed byte`);
  }
}

function ensurePositiveByte(value, label) {
  if (!Number.isInteger(value) || value < 1 || value > 0xff) {
    throw new Error(`${label} must be between 1 and 255`);
  }
  return value;
}

function ensureLogicalSpriteIndex(value) {
  if (!Number.isInteger(value) || value < 0 || value >= SPRITE_LOGICAL_COUNT) {
    throw new Error("sprite index must be between 0 and 15");
  }
}

function ensureSpriteX(value, label = "sprite x") {
  if (!Number.isInteger(value) || value < 0 || value > 511) {
    throw new Error(`${label} must be between 0 and 511`);
  }
}

function isRuntimeCondition(value) {
  return value && typeof value === "object" && value.type === "runtimeCondition";
}

function ensureHiresX(value) {
  if (!Number.isInteger(value) || value < 0 || value > 319) {
    throw new Error("hires x must be between 0 and 319");
  }
}

function ensureHiresY(value) {
  if (!Number.isInteger(value) || value < 0 || value > 199) {
    throw new Error("hires y must be between 0 and 199");
  }
}

function ensureHiresRadius(value) {
  if (!Number.isInteger(value) || value < 0 || value > 199) {
    throw new Error("hires radius must be between 0 and 199");
  }
}

function ensureSidVoice(voice) {
  if (!Number.isInteger(voice) || voice < 1 || voice > 3) {
    throw new Error("SID voice must be 1, 2 or 3");
  }
}

function ensureSidPulseWidth(value) {
  if (!Number.isInteger(value) || value < 0 || value > 0x0fff) {
    throw new Error("SID pulse width must be between 0 and 4095");
  }
}

function ensureSidDuration(value) {
  if (!Number.isInteger(value) || value < 0 || value > 0xff) {
    throw new Error("SID duration must be between 0 and 255");
  }
}

function sidVoiceBase(voice) {
  ensureSidVoice(voice);
  return c64.SID_BASE + ((voice - 1) * 7);
}

function sidWaveformToControl(type) {
  const normalized = String(type).trim().toLowerCase();
  if (normalized === "triangle") {
    return 0x10;
  }
  if (normalized === "saw") {
    return 0x20;
  }
  if (normalized === "pulse") {
    return 0x40;
  }
  if (normalized === "noise") {
    return 0x80;
  }
  throw new Error(`Unsupported SID waveform: ${type}`);
}

function noteNameToMidi(noteName) {
  const normalized = String(noteName).trim().toUpperCase();
  const match = normalized.match(/^([A-G])([#B]?)(-?\d)$/);
  if (!match) {
    throw new Error(`Unsupported SID note name: ${noteName}`);
  }

  const [, letter, accidental, octaveText] = match;
  const octave = Number(octaveText);
  const baseSemitone = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11
  }[letter];
  const accidentalOffset = accidental === "#" ? 1 : accidental === "B" ? -1 : 0;
  return ((octave + 1) * 12) + baseSemitone + accidentalOffset;
}

function sidNoteNameToRaw(noteName) {
  const normalized = String(noteName).trim().toUpperCase();
  if (normalized === "R" || normalized === "REST") {
    return null;
  }

  const midi = noteNameToMidi(normalized);
  const hz = 440 * (2 ** ((midi - 69) / 12));
  return sidFrequencyToRaw(hz);
}

function normalizeSidSongEntry(entry) {
  if (typeof entry === "string") {
    return { note: entry, duration: 1 };
  }

  if (entry && typeof entry === "object") {
    if (entry.rest === true) {
      return { note: "R", duration: entry.duration ?? 1 };
    }
    if (typeof entry.note === "string") {
      return { note: entry.note, duration: entry.duration ?? 1 };
    }
  }

  throw new Error(`Unsupported SID song entry: ${JSON.stringify(entry)}`);
}

function expandSidSongEntries(source, context) {
  if (source?.type === "sidPatternRepeat") {
    ensurePositiveByte(source.count, "SID pattern repeat count");
    const expanded = [];
    for (let index = 0; index < source.count; index += 1) {
      expanded.push(...expandSidSongEntries(source.pattern, context));
    }
    return expanded;
  }
  if (source?.type === "sidPattern") {
    if (context.activePatterns.has(source)) {
      throw new Error(`SID pattern ${source.name} recursively references itself`);
    }
    const previous = context.patterns.get(source.name);
    if (previous && previous.pattern !== source) {
      throw new Error(`Several different SID patterns use the name ${source.name}`);
    }
    const report = previous ?? { pattern: source, name: source.name, uses: 0, sourceEntries: source.entries.length };
    report.uses += 1;
    context.patterns.set(source.name, report);
    context.activePatterns.add(source);
    const expanded = expandSidSongEntries(source.entries, context);
    context.activePatterns.delete(source);
    return expanded;
  }
  if (Array.isArray(source)) {
    return source.flatMap((entry) => expandSidSongEntries(entry, context));
  }
  return [normalizeSidSongEntry(source)];
}

function normalizeSidInstrument(instrument, voice) {
  if (instrument === null || instrument === undefined) return null;
  if (!instrument || typeof instrument !== "object" || Array.isArray(instrument)) {
    throw new Error(`SID instrument for voice ${voice} must come from c64.sid.instrument()`);
  }
  const name = typeof instrument.name === "string" && instrument.name.trim()
    ? instrument.name.trim()
    : `voice-${voice}`;
  const waveform = instrument.waveform ?? "triangle";
  const control = sidWaveformToControl(waveform);
  const attackDecay = instrument.attackDecay ?? 0x11;
  const sustainRelease = instrument.sustainRelease ?? 0x88;
  ensureByte(attackDecay, `SID instrument ${name} attackDecay`);
  ensureByte(sustainRelease, `SID instrument ${name} sustainRelease`);
  const pulseWidth = instrument.pulseWidth;
  if (pulseWidth !== undefined) ensureSidPulseWidth(pulseWidth);
  return {
    type: "sidInstrument",
    name,
    waveform: String(waveform),
    control,
    pulseWidth: pulseWidth ?? null,
    attackDecay,
    sustainRelease
  };
}

function buildSidSongSteps(songDefinition) {
  if (!songDefinition || typeof songDefinition !== "object") {
    throw new Error("c64.sid.playSong() expects a song object");
  }

  const tempo = songDefinition.tempo ?? 6;
  ensurePositiveByte(tempo, "SID song tempo");
  const loop = songDefinition.loop === true;
  if (!Array.isArray(songDefinition.voices) || songDefinition.voices.length !== 3) {
    throw new Error("c64.sid.playSong() expects exactly 3 voices");
  }

  const rawInstruments = songDefinition.instruments ?? [null, null, null];
  if (!Array.isArray(rawInstruments) || rawInstruments.length !== 3) {
    throw new Error("c64.sid.playSong() instruments must contain exactly 3 entries");
  }
  const instruments = rawInstruments.map((instrument, index) => normalizeSidInstrument(instrument, index + 1));
  const patternContext = { patterns: new Map(), activePatterns: new Set() };

  const voices = songDefinition.voices.map((voiceEntries) => {
    const steps = [];
    for (const entry of expandSidSongEntries(voiceEntries, patternContext)) {
      ensurePositiveByte(entry.duration, "SID song entry duration");
      const raw = sidNoteNameToRaw(entry.note);
      if (raw === null) {
        for (let i = 0; i < entry.duration; i += 1) {
          steps.push({ action: 0, raw: 0 });
        }
      } else {
        steps.push({ action: 2, raw });
        for (let i = 1; i < entry.duration; i += 1) {
          steps.push({ action: 1, raw });
        }
      }
    }

    return steps;
  });

  const length = Math.max(...voices.map((voice) => voice.length), 0);
  if (length === 0) {
    throw new Error("c64.sid.playSong() cannot play an empty song");
  }
  if (length > 255) {
    throw new Error("c64.sid.playSong() currently supports up to 255 expanded steps");
  }

  let expandedVoices = voices.map((voice) => {
    const padded = voice.slice();
    while (padded.length < length) {
      padded.push({ action: 0, raw: 0 });
    }
    return {
      actionBytes: padded.map((step) => step.action & 0xff),
      freqLoBytes: padded.map((step) => step.raw & 0xff),
      freqHiBytes: padded.map((step) => (step.raw >> 8) & 0xff),
      hasNotes: padded.some((step) => step.action === 2)
    };
  });

  let storedLength = length;
  if (loop && length > 1) {
    for (let period = 1; period < length; period += 1) {
      if (length % period !== 0) continue;
      const repeatsExactly = expandedVoices.every((voice) => (
        voice.actionBytes.every((value, index) => value === voice.actionBytes[index % period])
        && voice.freqLoBytes.every((value, index) => value === voice.freqLoBytes[index % period])
        && voice.freqHiBytes.every((value, index) => value === voice.freqHiBytes[index % period])
      ));
      if (!repeatsExactly) continue;
      storedLength = period;
      expandedVoices = expandedVoices.map((voice) => ({
        ...voice,
        actionBytes: voice.actionBytes.slice(0, period),
        freqLoBytes: voice.freqLoBytes.slice(0, period),
        freqHiBytes: voice.freqHiBytes.slice(0, period)
      }));
      break;
    }
  }

  const patterns = [...patternContext.patterns.values()].map(({ pattern, ...report }) => report);
  return {
    tempo,
    length: storedLength,
    expandedLength: length,
    compactedRepeatSteps: length - storedLength,
    loop,
    voices: expandedVoices,
    instruments,
    patterns
  };
}

function sidFrequencyToRaw(value) {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    throw new Error(`Invalid SID frequency value: ${value}`);
  }

  // If the value looks like a register value, keep it as-is. Otherwise,
  // interpret it as Hertz using the PAL C64 clock.
  if (Number.isInteger(value) && value > 2048 && value <= 0xffff) {
    return value;
  }

  const raw = Math.round((value * 16777216) / 985248);
  if (raw < 0 || raw > 0xffff) {
    throw new Error(`SID frequency is out of range: ${value}`);
  }
  return raw;
}

function emitSidSetControl(asm, compileState, voice, control) {
  ensureSidVoice(voice);
  ensureByte(control, "SID control");
  compileState.sid.voiceControls[voice - 1] = control & 0xff;
  emitStoreImmediate(asm, sidVoiceBase(voice) + 4, control & 0xff);
}

function emitSidEnsureWaveform(asm, compileState, voice) {
  const control = compileState.sid.voiceControls[voice - 1] & 0xff;
  if ((control & 0xf0) === 0) {
    emitSidSetControl(asm, compileState, voice, (control & 0x0f) | 0x10);
  }
}

function emitSidSetFrequencyRaw(asm, voice, rawValue) {
  ensureSidVoice(voice);
  ensureWord(rawValue, "SID frequency");
  const base = sidVoiceBase(voice);
  emitStoreImmediate(asm, base, rawValue & 0xff);
  emitStoreImmediate(asm, base + 1, (rawValue >> 8) & 0xff);
}

function emitSidDelay(asm, compileState, duration) {
  ensureSidDuration(duration);
  if (duration === 0) {
    return;
  }

  const outerLabel = `sid_delay_outer_${compileState.loopCounter++}`;
  const middleLabel = `sid_delay_middle_${compileState.loopCounter++}`;
  const innerLabel = `sid_delay_inner_${compileState.loopCounter++}`;
  asm.ldy(imm(duration));
  asm.label(outerLabel);
  asm.ldx(imm(0x20));
  asm.label(middleLabel);
  asm.lda(imm(0xff));
  asm.label(innerLabel);
  asm.sec();
  asm.sbc(imm(0x01));
  asm.bne(rel(innerLabel));
  asm.dex();
  asm.bne(rel(middleLabel));
  asm.dey();
  asm.bne(rel(outerLabel));
}

function emitSidReleaseDelay(asm, compileState, duration) {
  const tail = Math.max(2, Math.min(24, Math.ceil(duration / 2)));
  emitSidDelay(asm, compileState, tail);
}

function emitSidVolume(asm, compileState, value) {
  ensureByte(value, "SID volume");
  compileState.sid.filterModeVol = (compileState.sid.filterModeVol & 0xf0) | (value & 0x0f);
  emitStoreImmediate(asm, c64.SID_FILTER_MODE_VOL, compileState.sid.filterModeVol);
}

function sidFilterModeToNibble(mode) {
  if (mode === undefined || mode === null) {
    throw new Error("SID filter mode is required");
  }

  if (mode === "off") {
    return 0x00;
  }

  const tokens = Array.isArray(mode)
    ? mode
    : String(mode)
      .split(/[+,|]/)
      .map((part) => part.trim())
      .filter(Boolean);

  if (tokens.length === 0) {
    throw new Error("SID filter mode is required");
  }

  let nibble = 0x00;
  for (const token of tokens) {
    switch (token) {
      case "off":
        break;
      case "lowpass":
      case "low":
      case "lp":
        nibble |= 0x10;
        break;
      case "bandpass":
      case "band":
      case "bp":
        nibble |= 0x20;
        break;
      case "highpass":
      case "high":
      case "hp":
        nibble |= 0x40;
        break;
      default:
        throw new Error(`Unsupported SID filter mode: ${token}`);
    }
  }

  return nibble & 0x70;
}

function emitSidFilter(asm, compileState, mode, cutoff, resonance) {
  ensureWord(cutoff, "SID filter cutoff");
  if (cutoff < 0 || cutoff > 0x07ff) {
    throw new Error("SID filter cutoff must be between 0 and 2047");
  }
  ensureByte(resonance, "SID filter resonance");
  if (resonance > 0x0f) {
    throw new Error("SID filter resonance must be between 0 and 15");
  }

  const modeNibble = sidFilterModeToNibble(mode);
  const routeMask = modeNibble === 0x00 ? 0x00 : 0x07;

  compileState.sid.filterResonanceRoute = ((resonance & 0x0f) << 4) | routeMask;
  compileState.sid.filterModeVol = (compileState.sid.filterModeVol & 0x8f) | modeNibble;

  emitStoreImmediate(asm, c64.SID_FILTER_CUTOFF_LO, cutoff & 0x07);
  emitStoreImmediate(asm, c64.SID_FILTER_CUTOFF_HI, (cutoff >> 3) & 0xff);
  emitStoreImmediate(asm, c64.SID_FILTER_RESONANCE_ROUTE, compileState.sid.filterResonanceRoute);
  emitStoreImmediate(asm, c64.SID_FILTER_MODE_VOL, compileState.sid.filterModeVol);
}

function emitSidVoiceFrequency(asm, voice, value) {
  emitSidSetFrequencyRaw(asm, voice, sidFrequencyToRaw(value));
}

function emitSidVoicePulseWidth(asm, voice, value) {
  ensureSidVoice(voice);
  ensureSidPulseWidth(value);
  const base = sidVoiceBase(voice);
  emitStoreImmediate(asm, base + 2, value & 0xff);
  emitStoreImmediate(asm, base + 3, (value >> 8) & 0x0f);
}

function emitSidVoiceWaveform(asm, compileState, voice, waveform) {
  const control = compileState.sid.voiceControls[voice - 1] & 0x0f;
  emitSidSetControl(asm, compileState, voice, control | sidWaveformToControl(waveform));
}

function emitSidVoiceGate(asm, compileState, voice, enabled) {
  let control = compileState.sid.voiceControls[voice - 1] & 0xff;
  control = enabled ? (control | 0x01) : (control & 0xfe);
  emitSidSetControl(asm, compileState, voice, control);
}

function emitSidVoiceAttackDecay(asm, voice, value) {
  ensureSidVoice(voice);
  ensureByte(value, "SID attack/decay");
  emitStoreImmediate(asm, sidVoiceBase(voice) + 5, value);
}

function emitSidVoiceSustainRelease(asm, voice, value) {
  ensureSidVoice(voice);
  ensureByte(value, "SID sustain/release");
  emitStoreImmediate(asm, sidVoiceBase(voice) + 6, value);
}

function emitSidNote(asm, compileState, voice, noteName, duration = 0) {
  ensureSidVoice(voice);
  ensureSidDuration(duration);
  const raw = sidNoteNameToRaw(noteName);
  emitSidEnsureWaveform(asm, compileState, voice);

  if (raw === null) {
    emitSidVoiceGate(asm, compileState, voice, false);
    emitSidDelay(asm, compileState, duration);
    return;
  }

  emitSidSetFrequencyRaw(asm, voice, raw);
  emitSidVoiceGate(asm, compileState, voice, true);
  if (duration > 0) {
    emitSidDelay(asm, compileState, duration);
    emitSidVoiceGate(asm, compileState, voice, false);
    emitSidReleaseDelay(asm, compileState, duration);
  }
}

function emitSidRest(asm, compileState, voice, duration = 0) {
  ensureSidVoice(voice);
  ensureSidDuration(duration);
  emitSidVoiceGate(asm, compileState, voice, false);
  emitSidDelay(asm, compileState, duration);
}

function sidEffectVoice(compileState) {
  return compileState.sid.player.sfxVoice ?? 1;
}

function emitSidBeep(asm, compileState) {
  const voice = sidEffectVoice(compileState);
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, voice, "pulse");
  emitSidVoicePulseWidth(asm, voice, 0x0800);
  emitSidVoiceAttackDecay(asm, voice, 0x11);
  emitSidVoiceSustainRelease(asm, voice, 0xf0);
  emitSidNote(asm, compileState, voice, "C5", 10);
}

function emitSidClick(asm, compileState) {
  const voice = sidEffectVoice(compileState);
  emitSidVolume(asm, compileState, 15);
  compileState.sid.voiceControls[voice - 1] = 0x11;
  if (compileState.optimization.mode !== "speed" && compileState.optimization.sidClickCount > 1) {
    // Calls keep their volume write inline because the filter-mode bits in
    // $D418 can differ at each call site.
    compileState.sharedRoutines.sidClick = true;
    asm.jsr(abs("runtime_sid_click"));
    return;
  }
  emitSidClickBody(asm, voice);
}

function emitSidClickBody(asm, voice) {
  const base = sidVoiceBase(voice);
  emitStoreImmediate(asm, base + 4, 0x00);
  emitStoreImmediate(asm, base + 4, 0x10);
  emitStoreImmediate(asm, base + 5, 0x00);
  emitStoreImmediate(asm, base + 6, 0x00);
  emitStoreImmediate(asm, base, 0x39);
  emitStoreImmediate(asm, base + 1, 0x8b);
  emitStoreImmediate(asm, base + 4, 0x11);
}

function emitSharedSidClickRoutine(asm, state) {
  if (!state.sharedRoutines.sidClick) return;
  asm.comment("Shared non-blocking SID click");
  asm.label("runtime_sid_click");
  emitSidClickBody(asm, sidEffectVoice(state));
  asm.rts();
}

function emitSidNoise(asm, compileState, duration = 12) {
  const voice = sidEffectVoice(compileState);
  ensureSidDuration(duration);
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, voice, "noise");
  emitSidVoiceAttackDecay(asm, voice, 0x24);
  emitSidVoiceSustainRelease(asm, voice, 0xf4);
  emitSidVoiceFrequency(asm, voice, 0x1800);
  emitSidVoiceGate(asm, compileState, voice, true);
  emitSidDelay(asm, compileState, duration);
  emitSidVoiceGate(asm, compileState, voice, false);
  emitSidReleaseDelay(asm, compileState, duration);
}

function emitSidExplosion(asm, compileState) {
  emitSidNoise(asm, compileState, 20);
}

function emitSidLaser(asm, compileState) {
  const voice = sidEffectVoice(compileState);
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, voice, "saw");
  emitSidVoiceAttackDecay(asm, voice, 0x01);
  emitSidVoiceSustainRelease(asm, voice, 0x82);
  emitSidNote(asm, compileState, voice, "C6", 6);
  emitSidNote(asm, compileState, voice, "G5", 8);
}

function emitSidPickup(asm, compileState) {
  const voice = sidEffectVoice(compileState);
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, voice, "triangle");
  emitSidVoiceAttackDecay(asm, voice, 0x11);
  emitSidVoiceSustainRelease(asm, voice, 0xb2);
  emitSidNote(asm, compileState, voice, "C5", 5);
  emitSidNote(asm, compileState, voice, "G5", 5);
}

function emitSidSongPlayer(asm, compileState, songDefinition) {
  const song = buildSidSongSteps(songDefinition);
  const songId = compileState.stringCounter++;
  const loopLabel = `sid_song_loop_${songId}`;
  const doneLabel = `sid_song_done_${songId}`;
  const continueLabel = `sid_song_continue_${songId}`;
  const voiceDoneLabels = [1, 2, 3].map((voice) => `sid_song_voice${voice}_done_${songId}`);
  const voiceRestLabels = [1, 2, 3].map((voice) => `sid_song_voice${voice}_rest_${songId}`);
  const voiceHoldLabels = [1, 2, 3].map((voice) => `sid_song_voice${voice}_hold_${songId}`);

  const baseControls = [1, 2, 3].map((voice) => {
    let control = compileState.sid.voiceControls[voice - 1] & 0xfe;
    if ((control & 0xf0) === 0) {
      control |= 0x10;
    }
    return control & 0xff;
  });

  const labelBase = `sid_song_${songId}`;
  const voiceLabels = song.voices.map((voice, index) => ({
    action: `${labelBase}_v${index + 1}_action`,
    lo: `${labelBase}_v${index + 1}_lo`,
    hi: `${labelBase}_v${index + 1}_hi`,
    bytes: voice
  }));

  asm.ldx(imm(0x00));
  asm.label(loopLabel);

  for (let voice = 1; voice <= 3; voice += 1) {
    const base = sidVoiceBase(voice);
    const labels = voiceLabels[voice - 1];

    asm.lda(absx(labels.action));
    asm.beq(rel(voiceRestLabels[voice - 1]));
    asm.cmp(imm(0x01));
    asm.beq(rel(voiceHoldLabels[voice - 1]));
    asm.lda(absx(labels.lo));
    asm.sta(abs(base));
    asm.lda(absx(labels.hi));
    asm.sta(abs(base + 1));
    emitStoreImmediate(asm, base + 4, baseControls[voice - 1]);
    emitStoreImmediate(asm, base + 4, baseControls[voice - 1] | 0x01);
    asm.jmp(abs(voiceDoneLabels[voice - 1]));

    asm.label(voiceRestLabels[voice - 1]);
    emitStoreImmediate(asm, base + 4, baseControls[voice - 1]);
    asm.jmp(abs(voiceDoneLabels[voice - 1]));

    asm.label(voiceHoldLabels[voice - 1]);
    asm.comment(`hold voice ${voice}`);
    asm.label(voiceDoneLabels[voice - 1]);
  }

  emitSidDelay(asm, compileState, song.tempo);
  asm.inx();
  asm.cpx(imm(song.length));
  asm.beq(rel(continueLabel));
  asm.jmp(abs(loopLabel));
  asm.label(continueLabel);

  for (let voice = 1; voice <= 3; voice += 1) {
    emitStoreImmediate(asm, sidVoiceBase(voice) + 4, baseControls[voice - 1]);
  }
  asm.label(doneLabel);

  for (const labels of voiceLabels) {
    registerData(compileState, labels.action, labels.bytes.actionBytes);
    registerData(compileState, labels.lo, labels.bytes.freqLoBytes);
    registerData(compileState, labels.hi, labels.bytes.freqHiBytes);
  }
}

function configureSidSongPlayer(compileState, songDefinition) {
  compileState.sid.player.song = buildSidSongSteps(songDefinition);
  compileState.sid.player.installRequested = true;
}

function sidMusicVoices(compileState) {
  return [1, 2, 3].filter((voice) => voice !== compileState.sid.player.sfxVoice);
}

function emitSidPlayerStop(asm, compileState) {
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_STEP_INDEX, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_TICK_COUNT, 0x00);
  for (const voice of sidMusicVoices(compileState)) {
    const control = compileState.sid.voiceControls[voice - 1] & 0xfe;
    emitStoreImmediate(asm, sidVoiceBase(voice) + 4, control);
  }
}

function emitSidPlayerPause(asm, compileState) {
  const doneLabel = `sid_pause_done_${compileState.loopCounter++}`;
  asm.lda(abs(SID_PLAYER_PLAYING));
  asm.cmp(imm(0x01));
  asm.bne(rel(doneLabel));
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x02);
  for (const voice of sidMusicVoices(compileState)) {
    const control = compileState.sid.voiceControls[voice - 1] & 0xfe;
    emitStoreImmediate(asm, sidVoiceBase(voice) + 4, control);
  }
  asm.label(doneLabel);
}

function emitSidPlayerResume(asm, compileState) {
  const doneLabel = `sid_resume_done_${compileState.loopCounter++}`;
  asm.lda(abs(SID_PLAYER_PLAYING));
  asm.cmp(imm(0x02));
  asm.bne(rel(doneLabel));
  emitStoreImmediate(asm, SID_PLAYER_TICK_COUNT, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x01);
  asm.label(doneLabel);
}

function emitSidPlayerFade(asm, compileState, targetVolume, stepEvery = 4) {
  if (!compileState.sid.player.installRequested || !compileState.sid.player.song) {
    throw new Error("c64.sid.fadeSong() needs a configured playSong()");
  }
  ensureByte(targetVolume, "SID fade target volume");
  if (targetVolume > 15) throw new Error("SID fade target volume must be between 0 and 15");
  ensurePositiveByte(stepEvery, "SID fade stepEvery");
  emitStoreImmediate(asm, SID_FADE_TARGET, targetVolume);
  emitStoreImmediate(asm, SID_FADE_INTERVAL, stepEvery - 1);
  emitStoreImmediate(asm, SID_FADE_COUNTER, 0x00);
  emitStoreImmediate(asm, SID_FADE_ACTIVE, 0x01);
}

function emitSidPlayerInitState(asm, state) {
  if (!state.sid.player.installRequested || !state.sid.player.song) {
    return;
  }

  emitStoreImmediate(asm, SID_PLAYER_STEP_INDEX, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_TICK_COUNT, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_RATE_ACCUMULATOR, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_VOLUME, state.sid.filterModeVol & 0x0f);
  emitStoreImmediate(asm, SID_FADE_ACTIVE, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x01);
  for (const voice of sidMusicVoices(state)) {
    const instrument = state.sid.player.song.instruments[voice - 1];
    if (!instrument) continue;
    emitSidSetControl(asm, state, voice, instrument.control & 0xfe);
    if (instrument.pulseWidth !== null) emitSidVoicePulseWidth(asm, voice, instrument.pulseWidth);
    emitSidVoiceAttackDecay(asm, voice, instrument.attackDecay);
    emitSidVoiceSustainRelease(asm, voice, instrument.sustainRelease);
  }
}

function createSidPlayerRuntime(state, prefix) {
  const song = state.sid.player.song;
  if (!state.sid.player.installRequested || !song) {
    return null;
  }

  const songId = state.stringCounter++;
  const musicVoices = sidMusicVoices(state);
  const voiceDoneLabels = [1, 2, 3].map((voice) => `${prefix}_voice${voice}_done_${songId}`);
  const voiceRestLabels = [1, 2, 3].map((voice) => `${prefix}_voice${voice}_rest_${songId}`);
  const voiceHoldLabels = [1, 2, 3].map((voice) => `${prefix}_voice${voice}_hold_${songId}`);

  const baseControls = [1, 2, 3].map((voice) => {
    let control = state.sid.voiceControls[voice - 1] & 0xfe;
    if ((control & 0xf0) === 0) {
      control |= 0x10;
    }
    return control & 0xff;
  });

  const dataPrefix = prefix.startsWith("sid_") ? prefix.slice(4) : prefix;
  const labelBase = `sid_song_${dataPrefix}_${songId}`;
  const tablePool = new Map();
  let pooledVoiceTableBytes = 0;
  const voiceLabels = song.voices.map((voice, index) => {
    if (!musicVoices.includes(index + 1)) return null;
    const signature = `${voice.actionBytes.join(",")}|${voice.freqLoBytes.join(",")}|${voice.freqHiBytes.join(",")}`;
    const pooled = tablePool.get(signature);
    if (pooled) {
      pooledVoiceTableBytes += song.length * 3;
      return { ...pooled, bytes: null, pooledFromVoice: pooled.voice };
    }
    const labels = {
      voice: index + 1,
      action: `${labelBase}_v${index + 1}_action`,
      lo: `${labelBase}_v${index + 1}_lo`,
      hi: `${labelBase}_v${index + 1}_hi`,
      bytes: voice,
      pooledFromVoice: null
    };
    tablePool.set(signature, labels);
    return labels;
  });
  song.pooledVoiceTableBytes = Math.max(song.pooledVoiceTableBytes ?? 0, pooledVoiceTableBytes);

  return {
    song,
    songId,
    processLabel: `${prefix}_process_${songId}`,
    stopLabel: `${prefix}_stop_${songId}`,
    doneLabel: `${prefix}_done_${songId}`,
    doneJumpLabel: `${prefix}_done_jump_${songId}`,
    processJumpLabel: `${prefix}_process_jump_${songId}`,
    stopContinueLabel: `${prefix}_stop_continue_${songId}`,
    loopContinueLabel: `${prefix}_loop_continue_${songId}`,
    rateContinueLabel: `${prefix}_rate_continue_${songId}`,
    fadeDoneLabel: `${prefix}_fade_done_${songId}`,
    fadeStepLabel: `${prefix}_fade_step_${songId}`,
    fadeIncreaseLabel: `${prefix}_fade_increase_${songId}`,
    fadeWriteLabel: `${prefix}_fade_write_${songId}`,
    fadeCompleteLabel: `${prefix}_fade_complete_${songId}`,
    voiceDoneLabels,
    voiceRestLabels,
    voiceHoldLabels,
    baseControls,
    voiceLabels,
    musicVoices,
    fadeUsed: state.sid.player.fadeUsed
  };
}

function registerSidPlayerData(state, runtime) {
  for (const labels of runtime.voiceLabels.filter((entry) => entry?.bytes)) {
    registerData(state, labels.action, labels.bytes.actionBytes);
    registerData(state, labels.lo, labels.bytes.freqLoBytes);
    registerData(state, labels.hi, labels.bytes.freqHiBytes);
  }
}

function emitSidFadeCore(asm, runtime) {
  if (!runtime.fadeUsed) return;
  asm.lda(abs(SID_FADE_ACTIVE));
  asm.beq(rel(runtime.fadeDoneLabel));
  asm.lda(abs(SID_FADE_COUNTER));
  asm.beq(rel(runtime.fadeStepLabel));
  asm.dec(abs(SID_FADE_COUNTER));
  asm.jmp(abs(runtime.fadeDoneLabel));
  asm.label(runtime.fadeStepLabel);
  asm.lda(abs(SID_FADE_INTERVAL));
  asm.sta(abs(SID_FADE_COUNTER));
  asm.lda(abs(SID_PLAYER_VOLUME));
  asm.cmp(abs(SID_FADE_TARGET));
  asm.beq(rel(runtime.fadeCompleteLabel));
  asm.bcc(rel(runtime.fadeIncreaseLabel));
  asm.dec(abs(SID_PLAYER_VOLUME));
  asm.jmp(abs(runtime.fadeWriteLabel));
  asm.label(runtime.fadeIncreaseLabel);
  asm.inc(abs(SID_PLAYER_VOLUME));
  asm.label(runtime.fadeWriteLabel);
  asm.lda(abs(c64.SID_FILTER_MODE_VOL));
  asm.and(imm(0xf0));
  asm.ora(abs(SID_PLAYER_VOLUME));
  asm.sta(abs(c64.SID_FILTER_MODE_VOL));
  asm.lda(abs(SID_PLAYER_VOLUME));
  asm.cmp(abs(SID_FADE_TARGET));
  asm.bne(rel(runtime.fadeDoneLabel));
  asm.label(runtime.fadeCompleteLabel);
  emitStoreImmediate(asm, SID_FADE_ACTIVE, 0x00);
  asm.label(runtime.fadeDoneLabel);
}

function emitSidPlayerCore(asm, runtime) {
  asm.lda(abs(SID_PLAYER_PLAYING));
  asm.cmp(imm(0x01));
  asm.bne(rel(runtime.doneJumpLabel));
  // The music engine advances at a logical 50 Hz on both PAL and NTSC.
  // On a 60 Hz machine this accumulator skips exactly one IRQ out of six.
  asm.lda(abs(SID_PLAYER_RATE_ACCUMULATOR));
  asm.clc();
  asm.adc(imm(50));
  asm.sta(abs(SID_PLAYER_RATE_ACCUMULATOR));
  asm.cmp(abs(GAME_VIDEO_HZ));
  asm.bcs(rel(runtime.rateContinueLabel));
  asm.jmp(abs(runtime.doneLabel));
  asm.label(runtime.rateContinueLabel);
  asm.sbc(abs(GAME_VIDEO_HZ));
  asm.sta(abs(SID_PLAYER_RATE_ACCUMULATOR));
  emitSidFadeCore(asm, runtime);
  asm.lda(abs(SID_PLAYER_TICK_COUNT));
  asm.beq(rel(runtime.processJumpLabel));
  asm.dec(abs(SID_PLAYER_TICK_COUNT));
  asm.jmp(abs(runtime.doneLabel));
  asm.label(runtime.doneJumpLabel);
  asm.jmp(abs(runtime.doneLabel));
  asm.label(runtime.processJumpLabel);
  asm.jmp(abs(runtime.processLabel));

  asm.label(runtime.processLabel);
  asm.ldx(abs(SID_PLAYER_STEP_INDEX));
  asm.cpx(imm(runtime.song.length));
  asm.bne(rel(runtime.stopContinueLabel));
  if (runtime.song.loop) {
    asm.ldx(imm(0x00));
    asm.stx(abs(SID_PLAYER_STEP_INDEX));
    asm.jmp(abs(runtime.loopContinueLabel));
  } else {
    asm.jmp(abs(runtime.stopLabel));
  }
  asm.label(runtime.stopContinueLabel);
  asm.label(runtime.loopContinueLabel);

  for (const voice of runtime.musicVoices) {
    const base = sidVoiceBase(voice);
    const labels = runtime.voiceLabels[voice - 1];
    asm.lda(absx(labels.action));
    asm.beq(rel(runtime.voiceRestLabels[voice - 1]));
    asm.cmp(imm(0x01));
    asm.beq(rel(runtime.voiceHoldLabels[voice - 1]));
    asm.lda(absx(labels.lo));
    asm.sta(abs(base));
    asm.lda(absx(labels.hi));
    asm.sta(abs(base + 1));
    emitStoreImmediate(asm, base + 4, runtime.baseControls[voice - 1]);
    emitStoreImmediate(asm, base + 4, runtime.baseControls[voice - 1] | 0x01);
    asm.jmp(abs(runtime.voiceDoneLabels[voice - 1]));

    asm.label(runtime.voiceRestLabels[voice - 1]);
    emitStoreImmediate(asm, base + 4, runtime.baseControls[voice - 1]);
    asm.jmp(abs(runtime.voiceDoneLabels[voice - 1]));

    asm.label(runtime.voiceHoldLabels[voice - 1]);
    asm.comment(`hold sid voice ${voice}`);
    asm.label(runtime.voiceDoneLabels[voice - 1]);
  }

  asm.inc(abs(SID_PLAYER_STEP_INDEX));
  emitStoreImmediate(asm, SID_PLAYER_TICK_COUNT, runtime.song.tempo - 1);
  asm.jmp(abs(runtime.doneLabel));

  asm.label(runtime.stopLabel);
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x00);
  for (const voice of runtime.musicVoices) {
    emitStoreImmediate(asm, sidVoiceBase(voice) + 4, runtime.baseControls[voice - 1]);
  }
}

function emitSidPlayerInstall(asm, state) {
  if (!state.sid.player.installRequested || !state.sid.player.song) {
    return;
  }
  if (state.irq.handlers.length > 0) {
    return;
  }
  if (state.spriteAnimator.installRequested) {
    return;
  }

  emitSidPlayerInitState(asm, state);
  emitInstallRasterIrq(asm, state.sid.player.line, "sid_player_irq");
}

function emitSidPlayerRoutine(asm, state) {
  const runtime = createSidPlayerRuntime(state, "sid_irq");
  if (!runtime) {
    return;
  }

  asm.comment("SID player IRQ");
  asm.label("sid_player_irq");
  emitIrqPrologue(asm);
  emitVicRasterSourceGate(asm, "sid_player_vic_raster");

  emitSidPlayerCore(asm, runtime);
  asm.jmp(abs(runtime.doneLabel));
  asm.label(runtime.doneLabel);
  setRasterLine(asm, state.sid.player.line);
  emitIrqExit(asm, false, true);
  registerSidPlayerData(state, runtime);
}

function emitSidPlayerBody(asm, state) {
  const runtime = createSidPlayerRuntime(state, "sid_irq_body");
  if (!runtime) {
    return;
  }
  emitSidPlayerCore(asm, runtime);
  asm.label(runtime.doneLabel);
  registerSidPlayerData(state, runtime);
}

function buildHiresLayout(screenBase, bitmapBase) {
  ensureWord(screenBase, "hires screen address");
  ensureWord(bitmapBase, "hires bitmap address");
  if (screenBase % 0x0400 !== 0) {
    throw new Error("hires screen address must be aligned to $0400");
  }
  if (bitmapBase % 0x2000 !== 0) {
    throw new Error("hires bitmap address must be aligned to $2000");
  }

  const bankBase = Math.floor(screenBase / 0x4000) * 0x4000;
  if (Math.floor(bitmapBase / 0x4000) * 0x4000 !== bankBase) {
    throw new Error("hires screen and bitmap addresses must live in the same VIC bank");
  }

  const screenOffset = screenBase - bankBase;
  const bitmapOffset = bitmapBase - bankBase;
  if (bitmapOffset !== 0x0000 && bitmapOffset !== 0x2000) {
    throw new Error("hires bitmap address must be at the start or middle of a VIC bank");
  }

  return {
    bankBase,
    bankCode: 3 - (bankBase >> 14),
    screenBits: (screenOffset >> 10) << 4,
    bitmapBits: bitmapOffset === 0x2000 ? 0x08 : 0x00,
    bitmapStartHi: (bitmapBase >> 8) & 0xff,
    bitmapEndHi: ((bitmapBase + 0x2000) >> 8) & 0xff,
    screenStartHi: (screenBase >> 8) & 0xff,
    screenEndHi: ((screenBase + 0x0400) >> 8) & 0xff
  };
}

function getStringBytes(text, encoder) {
  return Array.from(text, encoder);
}

function requestStringLabel(compileState, kind, text, encoder) {
  // Strings are pooled so repeated texts only exist once in the final binary.
  const key = `${kind}:${text}`;
  const existing = compileState.stringPool.get(key);
  if (existing) {
    return existing.label;
  }

  const label = `str_${kind}_${compileState.stringCounter++}`;
  compileState.stringPool.set(key, {
    label,
    bytes: [...getStringBytes(text, encoder), 0x00]
  });
  return label;
}

function emitPrint(asm, text, compileState) {
  // print() writes PETSCII characters through the KERNAL CHROUT routine.
  const loopLabel = `print_loop_${compileState.loopCounter++}`;
  const doneLabel = `print_done_${compileState.loopCounter++}`;
  const textLabel = requestStringLabel(compileState, "petscii", text, asciiToPetscii);

  asm.ldx(imm(0));
  asm.label(loopLabel);
  asm.lda(absx(textLabel));
  asm.beq(rel(doneLabel));
  asm.jsr(abs(c64.KERNAL_CHROUT));
  asm.inx();
  asm.bne(rel(loopLabel));
  asm.label(doneLabel);
}

function fixedBottomPanelMemoryOffset(compileState, y) {
  for (const scroller of compileState.assets.scrollers.values()) {
    if (scroller.verticalUsed && scroller.panel === "bottom" && y >= scroller.panelScreenRow) {
      // The VIC-II reaches the fixed panel with VCBASE one character row before
      // its physical raster position. The preceding physical row is the hidden
      // transition band, so fixed-panel writes are stored 40 bytes earlier.
      return -40;
    }
  }
  return 0;
}

function emitPrintAt(asm, x, y, text, color, screenBase, colorBase, compileState) {
  // printAt() writes directly to screen RAM and color RAM instead of using
  // CHROUT. This is faster and gives exact control over the target position.
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(color, "color");
  const rowOffset = y * 40 + fixedBottomPanelMemoryOffset(compileState, y);
  const screen = screenBase + rowOffset + x;
  const colors = colorBase + rowOffset + x;
  const loopLabel = `printat_loop_${compileState.loopCounter++}`;
  const doneLabel = `printat_done_${compileState.loopCounter++}`;
  const textLabel = requestStringLabel(compileState, "screen", text, asciiToScreenCode);

  asm.ldx(imm(0));
  asm.label(loopLabel);
  asm.lda(absx(textLabel));
  asm.beq(rel(doneLabel));
  asm.sta(absx(screen));
  asm.lda(imm(color));
  asm.sta(absx(colors));
  asm.inx();
  asm.bne(rel(loopLabel));
  asm.label(doneLabel);
}

function emitWriteChar(asm, x, y, char, color, screenBase, colorBase, compileState) {
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(color, "color");
  const rowOffset = y * 40 + fixedBottomPanelMemoryOffset(compileState, y);
  const screen = screenBase + rowOffset + x;
  const colors = colorBase + rowOffset + x;
  const screenCode = typeof char === "string" ? asciiToScreenCode(char[0] ?? " ") : char;

  emitStoreImmediate(asm, screen, screenCode);
  emitStoreImmediate(asm, colors, color);
}

function emitFillRect(asm, x, y, w, h, char, color, screenBase, colorBase, currentTextColor = color, compileState = null) {
  // Several special cases are optimized here to keep generated programs small.
  // Example: a full screen clear can become a single KERNAL call instead of
  // hundreds of LDA/STA instructions.
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(w, "w");
  ensureByte(h, "h");
  if (w === 0 || h === 0) {
    return;
  }

  const screenCode = typeof char === "string" ? asciiToScreenCode(char[0] ?? " ") : char;
  ensureByte(screenCode, "char");
  ensureByte(color, "color");

  if (x === 0 && y === 0 && w === 40 && h === 25 && screenCode === 32 && screenBase === 0x0400 && colorBase === 0xd800) {
    if (currentTextColor !== color) {
      emitStoreImmediate(asm, 0x0286, color);
    }
    asm.lda(imm(147));
    asm.jsr(abs(c64.KERNAL_CHROUT));
    if (currentTextColor !== color) {
      emitStoreImmediate(asm, 0x0286, currentTextColor);
    }
    return;
  }

  const firstPanelOffset = compileState ? fixedBottomPanelMemoryOffset(compileState, y) : 0;
  const lastPanelOffset = compileState ? fixedBottomPanelMemoryOffset(compileState, y + h - 1) : 0;
  if (x === 0 && w === 40 && firstPanelOffset === lastPanelOffset) {
    const start = y * 40 + firstPanelOffset;
    const total = h * 40;
    emitMemsetRange(asm, screenBase + start, screenCode, total);
    emitMemsetRange(asm, colorBase + start, color, total);
    return;
  }

  for (let row = 0; row < h; row += 1) {
    const logicalY = y + row;
    const rowOffset = logicalY * 40 + x
      + (compileState ? fixedBottomPanelMemoryOffset(compileState, logicalY) : 0);
    emitMemset(asm, screenBase + rowOffset, screenCode, w);
    emitMemset(asm, colorBase + rowOffset, color, w);
  }
}

function emitDrawFrame(asm, x, y, w, h, char, color, screenBase, colorBase, currentTextColor = color, compileState = null) {
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(w, "w");
  ensureByte(h, "h");
  if (w === 0 || h === 0) {
    return;
  }

  emitFillRect(asm, x, y, w, 1, char, color, screenBase, colorBase, currentTextColor, compileState);
  if (h > 1) {
    emitFillRect(asm, x, y + h - 1, w, 1, char, color, screenBase, colorBase, currentTextColor, compileState);
  }
  for (let row = 1; row < h - 1; row += 1) {
    emitWriteChar(asm, x, y + row, char, color, screenBase, colorBase, compileState);
    if (w > 1) {
      emitWriteChar(asm, x + w - 1, y + row, char, color, screenBase, colorBase, compileState);
    }
  }
}

function emitEnsureHiresMode(asm, compileState) {
  if (!compileState.hires.modeDirty) {
    return;
  }

  const layout = buildHiresLayout(compileState.hires.screenBase, compileState.hires.bitmapBase);

  asm.lda(abs(0xdd02));
  asm.ora(imm(0x03));
  asm.sta(abs(0xdd02));
  asm.lda(abs(0xdd00));
  asm.and(imm(0xfc));
  asm.ora(imm(layout.bankCode));
  asm.sta(abs(0xdd00));

  asm.lda(abs(c64.VIC_MEMORY_POINTERS));
  asm.and(imm(0x0f));
  asm.ora(imm(layout.screenBits));
  asm.sta(abs(c64.VIC_MEMORY_POINTERS));
  asm.lda(abs(c64.VIC_MEMORY_POINTERS));
  asm.and(imm(0xf0));
  asm.ora(imm(layout.bitmapBits));
  asm.sta(abs(c64.VIC_MEMORY_POINTERS));
  asm.lda(abs(c64.VIC_CONTROL_1));
  asm.ora(imm(0x20));
  asm.sta(abs(c64.VIC_CONTROL_1));

  compileState.hires.modeDirty = false;
}

function emitDisableHiresMode(asm, compileState) {
  asm.lda(abs(0xdd02));
  asm.ora(imm(0x03));
  asm.sta(abs(0xdd02));
  asm.lda(abs(0xdd00));
  asm.and(imm(0xfc));
  asm.ora(imm(0x03));
  asm.sta(abs(0xdd00));

  asm.lda(imm(0x15));
  asm.sta(abs(c64.VIC_MEMORY_POINTERS));
  asm.lda(abs(c64.VIC_CONTROL_1));
  asm.and(imm(0xdf));
  asm.sta(abs(c64.VIC_CONTROL_1));
}

function emitHiresClear(asm, compileState, color) {
  ensureByte(color, "hires clear color");
  emitEnsureHiresMode(asm, compileState);
  compileState.hires.backgroundColor = color & 0x0f;

  const layout = buildHiresLayout(compileState.hires.screenBase, compileState.hires.bitmapBase);
  const bitmapLoopLabel = `hires_bitmap_page_${compileState.loopCounter++}`;
  const bitmapWriteLabel = `hires_bitmap_write_${compileState.loopCounter++}`;
  const screenLoopLabel = `hires_screen_page_${compileState.loopCounter++}`;
  const screenWriteLabel = `hires_screen_write_${compileState.loopCounter++}`;

  emitStoreImmediate(asm, HIRES_ZP_PTR_HI, layout.bitmapStartHi);
  emitStoreImmediate(asm, HIRES_ZP_PTR_LO, 0x00);
  asm.label(bitmapLoopLabel);
  asm.lda(imm(0x00));
  asm.ldy(imm(0x00));
  asm.label(bitmapWriteLabel);
  asm.sta(indy(HIRES_ZP_PTR_LO));
  asm.dey();
  asm.bne(rel(bitmapWriteLabel));
  asm.inc(zp(HIRES_ZP_PTR_HI));
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.cmp(imm(layout.bitmapEndHi));
  asm.bcc(rel(bitmapLoopLabel));

  emitStoreImmediate(asm, HIRES_ZP_PTR_HI, layout.screenStartHi);
  emitStoreImmediate(asm, HIRES_ZP_PTR_LO, 0x00);
  asm.label(screenLoopLabel);
  asm.lda(imm(color & 0x0f));
  asm.ldy(imm(0x00));
  asm.label(screenWriteLabel);
  asm.sta(indy(HIRES_ZP_PTR_LO));
  asm.dey();
  asm.bne(rel(screenWriteLabel));
  asm.inc(zp(HIRES_ZP_PTR_HI));
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.cmp(imm(layout.screenEndHi));
  asm.bcc(rel(screenLoopLabel));
}

function emitWaitKey(asm, compileState) {
  const waitKeyLoopLabel = `wait_key_loop_${compileState.loopCounter++}`;
  const waitKeyReleaseLabel = `wait_key_release_${compileState.loopCounter++}`;
  const waitKeyScanLabel = `wait_key_scan_${compileState.loopCounter++}`;
  const waitKeyPressedLabel = `wait_key_pressed_${compileState.loopCounter++}`;
  const waitKeyScanDoneLabel = `wait_key_scan_done_${compileState.loopCounter++}`;
  const waitKeyMasksLabel = `wait_key_masks_${compileState.loopCounter++}`;

  asm.lda(abs(c64.CIA1_PRA));
  asm.sta(abs(WAITKEY_SAVE_PRA));
  asm.lda(abs(c64.CIA1_DDRA));
  asm.sta(abs(WAITKEY_SAVE_DDRA));
  asm.lda(abs(c64.CIA1_DDRB));
  asm.sta(abs(WAITKEY_SAVE_DDRB));

  asm.lda(imm(0xff));
  asm.sta(abs(c64.CIA1_DDRA));
  asm.lda(imm(0x00));
  asm.sta(abs(c64.CIA1_DDRB));
  asm.lda(imm(0xff));
  asm.sta(abs(c64.CIA1_PRA));

  const emitScanAnyKey = (loopLabel, foundLabel, doneLabel) => {
    emitStoreImmediate(asm, WAITKEY_ROW_INDEX, 0x00);
    asm.label(loopLabel);
    asm.ldx(abs(WAITKEY_ROW_INDEX));
    asm.lda(absx(waitKeyMasksLabel));
    asm.sta(abs(c64.CIA1_PRA));
    asm.lda(abs(c64.CIA1_PRB));
    asm.cmp(imm(0xff));
    asm.bne(rel(foundLabel));
    asm.inc(abs(WAITKEY_ROW_INDEX));
    asm.lda(abs(WAITKEY_ROW_INDEX));
    asm.cmp(imm(0x08));
    asm.bcc(rel(loopLabel));
    asm.jmp(abs(doneLabel));
  };

  asm.label(waitKeyLoopLabel);
  emitScanAnyKey(waitKeyScanLabel, waitKeyPressedLabel, waitKeyLoopLabel);

  asm.label(waitKeyPressedLabel);
  asm.label(waitKeyReleaseLabel);
  emitScanAnyKey(`${waitKeyScanLabel}_release`, `${waitKeyPressedLabel}_still`, waitKeyScanDoneLabel);
  asm.label(`${waitKeyPressedLabel}_still`);
  asm.jmp(abs(waitKeyReleaseLabel));
  asm.label(waitKeyScanDoneLabel);

  asm.lda(imm(0xff));
  asm.sta(abs(c64.CIA1_PRA));

  asm.lda(abs(WAITKEY_SAVE_PRA));
  asm.sta(abs(c64.CIA1_PRA));
  asm.lda(abs(WAITKEY_SAVE_DDRA));
  asm.sta(abs(c64.CIA1_DDRA));
  asm.lda(abs(WAITKEY_SAVE_DDRB));
  asm.sta(abs(c64.CIA1_DDRB));

  asm.label(waitKeyMasksLabel);
  asm.byte([0xfe, 0xfd, 0xfb, 0xf7, 0xef, 0xdf, 0xbf, 0x7f]);
}

function emitHiresPoint(asm, compileState, x, y, color) {
  ensureHiresX(x);
  ensureHiresY(y);
  ensureByte(color, "hires point color");
  emitEnsureHiresMode(asm, compileState);
  compileState.hires.runtimeNeeded = true;

  emitStoreImmediate(asm, HIRES_POINT_X_LO, x & 0xff);
  emitStoreImmediate(asm, HIRES_POINT_X_HI, (x >> 8) & 0xff);
  emitStoreImmediate(asm, HIRES_POINT_Y, y);
  emitStoreImmediate(asm, HIRES_POINT_COLOR, (color & 0x0f) << 4);
  asm.jsr(abs("hires_point_runtime"));
}

function emitHiresLine(asm, compileState, x1, y1, x2, y2, color) {
  ensureHiresX(x1);
  ensureHiresY(y1);
  ensureHiresX(x2);
  ensureHiresY(y2);
  ensureByte(color, "hires line color");
  emitEnsureHiresMode(asm, compileState);
  compileState.hires.runtimeNeeded = true;
  const packedColor = (color & 0x0f) << 4;

  if (y1 === y2) {
    compileState.hires.hlineRuntimeNeeded = true;
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    emitStoreImmediate(asm, HIRES_LINE_X1_LO, startX & 0xff);
    emitStoreImmediate(asm, HIRES_LINE_X1_HI, (startX >> 8) & 0xff);
    emitStoreImmediate(asm, HIRES_LINE_X2_LO, endX & 0xff);
    emitStoreImmediate(asm, HIRES_LINE_X2_HI, (endX >> 8) & 0xff);
    emitStoreImmediate(asm, HIRES_LINE_Y1, y1);
    emitStoreImmediate(asm, HIRES_LINE_COLOR, packedColor);
    asm.jsr(abs("hires_hline_runtime"));
    return;
  }

  if (x1 === x2) {
    compileState.hires.vlineRuntimeNeeded = true;
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    emitStoreImmediate(asm, HIRES_LINE_X1_LO, x1 & 0xff);
    emitStoreImmediate(asm, HIRES_LINE_X1_HI, (x1 >> 8) & 0xff);
    emitStoreImmediate(asm, HIRES_LINE_Y1, startY);
    emitStoreImmediate(asm, HIRES_LINE_Y2, endY);
    emitStoreImmediate(asm, HIRES_LINE_COLOR, packedColor);
    asm.jsr(abs("hires_vline_runtime"));
    return;
  }

  compileState.hires.lineRuntimeNeeded = true;

  emitStoreImmediate(asm, HIRES_LINE_X1_LO, x1 & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_X1_HI, (x1 >> 8) & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_Y1, y1);
  emitStoreImmediate(asm, HIRES_LINE_X2_LO, x2 & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_X2_HI, (x2 >> 8) & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_Y2, y2);
  emitStoreImmediate(asm, HIRES_LINE_COLOR, packedColor);
  asm.jsr(abs("hires_line_runtime"));
}

function emitHiresRect(asm, compileState, x, y, width, height, color) {
  ensureHiresX(x);
  ensureHiresY(y);
  ensureByte(color, "hires rect color");
  if (!Number.isInteger(width) || width < 1 || width > 320) {
    throw new Error("hires rect width must be between 1 and 320");
  }
  if (!Number.isInteger(height) || height < 1 || height > 200) {
    throw new Error("hires rect height must be between 1 and 200");
  }

  const x2 = x + width - 1;
  const y2 = y + height - 1;
  ensureHiresX(x2);
  ensureHiresY(y2);

  emitHiresLine(asm, compileState, x, y, x2, y, color);
  if (height > 1) {
    emitHiresLine(asm, compileState, x, y2, x2, y2, color);
  }
  if (width > 1) {
    emitHiresLine(asm, compileState, x, y, x, y2, color);
  }
  if (width > 1 && height > 1) {
    emitHiresLine(asm, compileState, x2, y, x2, y2, color);
  }
}

function emitHiresFillRect(asm, compileState, x, y, width, height, color) {
  ensureHiresX(x);
  ensureHiresY(y);
  ensureByte(color, "hires fillRect color");
  if (!Number.isInteger(width) || width < 1 || width > 320) {
    throw new Error("hires fillRect width must be between 1 and 320");
  }
  if (!Number.isInteger(height) || height < 1 || height > 200) {
    throw new Error("hires fillRect height must be between 1 and 200");
  }

  const x2 = x + width - 1;
  const y2 = y + height - 1;
  ensureHiresX(x2);
  ensureHiresY(y2);

  emitEnsureHiresMode(asm, compileState);
  compileState.hires.runtimeNeeded = true;
  compileState.hires.hlineRuntimeNeeded = true;
  compileState.hires.fillRectRuntimeNeeded = true;

  emitStoreImmediate(asm, HIRES_LINE_X1_LO, x & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_X1_HI, (x >> 8) & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_X2_LO, x2 & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_X2_HI, (x2 >> 8) & 0xff);
  emitStoreImmediate(asm, HIRES_LINE_Y1, y);
  emitStoreImmediate(asm, HIRES_FILL_Y_END, y2);
  emitStoreImmediate(asm, HIRES_LINE_COLOR, (color & 0x0f) << 4);
  asm.jsr(abs("hires_fillrect_runtime"));
}

function emitHiresCircleCommon(asm, compileState, x, y, radius, color, fill) {
  ensureHiresX(x);
  ensureHiresY(y);
  ensureHiresRadius(radius);
  ensureByte(color, "hires circle color");
  if (x - radius < 0 || x + radius > 319 || y - radius < 0 || y + radius > 199) {
    throw new Error("hires circle must stay inside the 320x200 screen");
  }

  emitEnsureHiresMode(asm, compileState);
  compileState.hires.runtimeNeeded = true;
  compileState.hires.hlineRuntimeNeeded = true;
  compileState.hires.circleRuntimeNeeded = true;

  emitStoreImmediate(asm, HIRES_CIRCLE_CX_LO, x & 0xff);
  emitStoreImmediate(asm, HIRES_CIRCLE_CX_HI, (x >> 8) & 0xff);
  emitStoreImmediate(asm, HIRES_CIRCLE_CY, y);
  emitStoreImmediate(asm, HIRES_CIRCLE_RADIUS, radius);
  emitStoreImmediate(asm, HIRES_CIRCLE_COLOR, (color & 0x0f) << 4);
  emitStoreImmediate(asm, HIRES_CIRCLE_FILL, fill ? 1 : 0);
  asm.jsr(abs("hires_circle_runtime"));
}

function emitHiresCircle(asm, compileState, x, y, radius, color) {
  emitHiresCircleCommon(asm, compileState, x, y, radius, color, false);
}

function emitHiresFillCircle(asm, compileState, x, y, radius, color) {
  emitHiresCircleCommon(asm, compileState, x, y, radius, color, true);
}

function emitHiresRoutines(asm, state) {
  if (!state.hires.runtimeNeeded && !state.hires.lineRuntimeNeeded) {
    return;
  }

  const layout = buildHiresLayout(state.hires.screenBase, state.hires.bitmapBase);
  const calcLabel = `hires_point_calc_${state.loopCounter++}`;
  const shiftLabel = `hires_point_shift_${state.loopCounter++}`;
  const noShiftLabel = `hires_point_no_shift_${state.loopCounter++}`;
  const pointScreenOkLabel = `hires_point_screen_ok_${state.loopCounter++}`;
  const lineXForwardLabel = `hires_line_x_forward_${state.loopCounter++}`;
  const lineXReverseLabel = `hires_line_x_reverse_${state.loopCounter++}`;
  const lineYForwardLabel = `hires_line_y_forward_${state.loopCounter++}`;
  const lineYReverseLabel = `hires_line_y_reverse_${state.loopCounter++}`;
  const lineMajorXLabel = `hires_line_major_x_${state.loopCounter++}`;
  const lineMajorYLabel = `hires_line_major_y_${state.loopCounter++}`;
  const lineLoopLabel = `hires_line_loop_${state.loopCounter++}`;
  const lineDoneLabel = `hires_line_done_${state.loopCounter++}`;
  const lineMajorYLoopLabel = `hires_line_major_y_loop_${state.loopCounter++}`;
  const lineUpdateXPositiveLabel = `hires_line_update_x_pos_${state.loopCounter++}`;
  const lineUpdateXDoneLabel = `hires_line_update_x_done_${state.loopCounter++}`;
  const lineUpdateYPositiveLabel = `hires_line_update_y_pos_${state.loopCounter++}`;
  const lineUpdateYDoneLabel = `hires_line_update_y_done_${state.loopCounter++}`;
  const lineAccKeepLabel = `hires_line_acc_keep_${state.loopCounter++}`;
  const lineAccKeepYLabel = `hires_line_acc_keep_y_${state.loopCounter++}`;
  const lineMajorXAdjustYLabel = `hires_line_major_x_adjust_y_${state.loopCounter++}`;
  const lineMajorYAdjustXLabel = `hires_line_major_y_adjust_x_${state.loopCounter++}`;
  const lineMajorYUpdateXPositiveLabel = `hires_line_major_y_update_x_pos_${state.loopCounter++}`;
  const lineMajorYAfterXLabel = `hires_line_major_y_after_x_${state.loopCounter++}`;
  const lineContinue1Label = `hires_line_continue1_${state.loopCounter++}`;
  const lineContinue2Label = `hires_line_continue2_${state.loopCounter++}`;
  const lineMajorYContinue1Label = `hires_line_major_y_continue1_${state.loopCounter++}`;
  const lineMajorYContinue2Label = `hires_line_major_y_continue2_${state.loopCounter++}`;
  const circleLoopLabel = `hires_circle_loop_${state.loopCounter++}`;
  const circleDoneLabel = `hires_circle_done_${state.loopCounter++}`;
  const circleAfterDrawLabel = `hires_circle_after_draw_${state.loopCounter++}`;
  const circleErrNegativeLabel = `hires_circle_err_negative_${state.loopCounter++}`;
  const circlePlotModeLabel = `hires_circle_plot_mode_${state.loopCounter++}`;
  const circleDoFillLabel = `hires_circle_do_fill_${state.loopCounter++}`;
  const circleFillSecondSpanLabel = `hires_circle_fill_second_span_${state.loopCounter++}`;
  const circleFillThirdSpanLabel = `hires_circle_fill_third_span_${state.loopCounter++}`;
  const circleFillFourthSpanLabel = `hires_circle_fill_fourth_span_${state.loopCounter++}`;
  const circleFillAfterFourthLabel = `hires_circle_fill_after_fourth_${state.loopCounter++}`;
  const circleSkipExtraFillLabel = `hires_circle_skip_extra_fill_${state.loopCounter++}`;

  const emitSetPointParams = (xAddr, xPositive, yAddr, yPositive) => {
    if (xPositive) {
      asm.lda(abs(HIRES_CIRCLE_CX_LO));
      asm.clc();
      asm.adc(abs(xAddr));
      asm.sta(abs(HIRES_POINT_X_LO));
      asm.lda(abs(HIRES_CIRCLE_CX_HI));
      asm.adc(imm(0x00));
      asm.sta(abs(HIRES_POINT_X_HI));
    } else {
      asm.sec();
      asm.lda(abs(HIRES_CIRCLE_CX_LO));
      asm.sbc(abs(xAddr));
      asm.sta(abs(HIRES_POINT_X_LO));
      asm.lda(abs(HIRES_CIRCLE_CX_HI));
      asm.sbc(imm(0x00));
      asm.sta(abs(HIRES_POINT_X_HI));
    }

    if (yPositive) {
      asm.lda(abs(HIRES_CIRCLE_CY));
      asm.clc();
      asm.adc(abs(yAddr));
      asm.sta(abs(HIRES_POINT_Y));
    } else {
      asm.sec();
      asm.lda(abs(HIRES_CIRCLE_CY));
      asm.sbc(abs(yAddr));
      asm.sta(abs(HIRES_POINT_Y));
    }

    asm.lda(abs(HIRES_CIRCLE_COLOR));
    asm.sta(abs(HIRES_POINT_COLOR));
  };

  const emitPlotPointCall = (xAddr, xPositive, yAddr, yPositive) => {
    emitSetPointParams(xAddr, xPositive, yAddr, yPositive);
    asm.jsr(abs("hires_point_runtime"));
  };

  const emitSetHLineParams = (leftAddr, leftPositive, rightAddr, rightPositive, yAddr, yPositive) => {
    if (leftPositive) {
      asm.lda(abs(HIRES_CIRCLE_CX_LO));
      asm.clc();
      asm.adc(abs(leftAddr));
      asm.sta(abs(HIRES_LINE_X1_LO));
      asm.lda(abs(HIRES_CIRCLE_CX_HI));
      asm.adc(imm(0x00));
      asm.sta(abs(HIRES_LINE_X1_HI));
    } else {
      asm.sec();
      asm.lda(abs(HIRES_CIRCLE_CX_LO));
      asm.sbc(abs(leftAddr));
      asm.sta(abs(HIRES_LINE_X1_LO));
      asm.lda(abs(HIRES_CIRCLE_CX_HI));
      asm.sbc(imm(0x00));
      asm.sta(abs(HIRES_LINE_X1_HI));
    }

    if (rightPositive) {
      asm.lda(abs(HIRES_CIRCLE_CX_LO));
      asm.clc();
      asm.adc(abs(rightAddr));
      asm.sta(abs(HIRES_LINE_X2_LO));
      asm.lda(abs(HIRES_CIRCLE_CX_HI));
      asm.adc(imm(0x00));
      asm.sta(abs(HIRES_LINE_X2_HI));
    } else {
      asm.sec();
      asm.lda(abs(HIRES_CIRCLE_CX_LO));
      asm.sbc(abs(rightAddr));
      asm.sta(abs(HIRES_LINE_X2_LO));
      asm.lda(abs(HIRES_CIRCLE_CX_HI));
      asm.sbc(imm(0x00));
      asm.sta(abs(HIRES_LINE_X2_HI));
    }

    if (yPositive) {
      asm.lda(abs(HIRES_CIRCLE_CY));
      asm.clc();
      asm.adc(abs(yAddr));
      asm.sta(abs(HIRES_LINE_Y1));
    } else {
      asm.sec();
      asm.lda(abs(HIRES_CIRCLE_CY));
      asm.sbc(abs(yAddr));
      asm.sta(abs(HIRES_LINE_Y1));
    }

    asm.lda(abs(HIRES_CIRCLE_COLOR));
    asm.sta(abs(HIRES_LINE_COLOR));
  };

  asm.comment("Shared hires routines");
  asm.label("hires_point_runtime");
  asm.lda(abs(HIRES_POINT_Y));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.lda(abs(HIRES_POINT_X_LO));
  asm.sta(zp(HIRES_ZP_WORK_LO));

  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.lsr(acc());
  asm.lsr(acc());
  asm.lsr(acc());
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(zp(HIRES_ZP_WORK_LO));
  asm.sta(abs(HIRES_TMP_X_LO));
  asm.and(imm(0xf8));
  asm.sta(zp(HIRES_ZP_WORK_LO));
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.and(imm(0x07));
  asm.clc();
  asm.adc(zp(HIRES_ZP_WORK_LO));
  asm.sta(zp(HIRES_ZP_WORK_LO));
  asm.lda(abs(HIRES_POINT_X_HI));
  asm.adc(imm(0x00));
  asm.sta(zp(HIRES_ZP_WORK_HI));
  asm.lda(imm(0x00));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.lda(zp(HIRES_ZP_PTR_LO));
  asm.ldx(imm(0x06));
  asm.label(calcLabel);
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_PTR_HI));
  asm.dex();
  asm.bne(rel(calcLabel));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.sta(abs(HIRES_TMP_64_LO));
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.sta(abs(HIRES_TMP_64_HI));
  asm.lda(abs(HIRES_TMP_64_LO));
  asm.asl(acc());
  asm.rol(abs(HIRES_TMP_64_HI));
  asm.asl(acc());
  asm.rol(abs(HIRES_TMP_64_HI));
  asm.clc();
  asm.adc(zp(HIRES_ZP_PTR_LO));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(abs(HIRES_TMP_64_HI));
  asm.adc(zp(HIRES_ZP_PTR_HI));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.clc();
  asm.lda(zp(HIRES_ZP_PTR_LO));
  asm.adc(zp(HIRES_ZP_WORK_LO));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.adc(zp(HIRES_ZP_WORK_HI));
  asm.adc(imm(layout.bitmapStartHi));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.lda(abs(HIRES_TMP_X_LO));
  asm.and(imm(0x07));
  asm.sta(zp(HIRES_ZP_WORK_LO));
  asm.lda(imm(0x07));
  asm.sec();
  asm.sbc(zp(HIRES_ZP_WORK_LO));
  asm.sta(zp(HIRES_ZP_WORK_LO));
  asm.lda(imm(0x01));
  asm.ldx(zp(HIRES_ZP_WORK_LO));
  asm.beq(rel(noShiftLabel));
  asm.label(shiftLabel);
  asm.asl(acc());
  asm.dex();
  asm.bne(rel(shiftLabel));
  asm.label(noShiftLabel);
  asm.ldy(imm(0x00));
  asm.ora(indy(HIRES_ZP_PTR_LO));
  asm.sta(indy(HIRES_ZP_PTR_LO));

  asm.lda(abs(HIRES_POINT_Y));
  asm.lsr(acc());
  asm.lsr(acc());
  asm.lsr(acc());
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.sta(zp(HIRES_ZP_WORK_LO));
  asm.lda(imm(0x00));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.sta(zp(HIRES_ZP_WORK_HI));
  asm.lda(zp(HIRES_ZP_PTR_LO));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_PTR_HI));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_PTR_HI));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_PTR_HI));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(zp(HIRES_ZP_WORK_LO));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_WORK_HI));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_WORK_HI));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_WORK_HI));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_WORK_HI));
  asm.asl(acc());
  asm.rol(zp(HIRES_ZP_WORK_HI));
  asm.clc();
  asm.adc(zp(HIRES_ZP_PTR_LO));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.adc(zp(HIRES_ZP_WORK_HI));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.lda(abs(HIRES_POINT_X_LO));
  asm.lsr(acc());
  asm.lsr(acc());
  asm.lsr(acc());
  asm.clc();
  asm.adc(zp(HIRES_ZP_PTR_LO));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.bcc(rel(pointScreenOkLabel));
  asm.inc(zp(HIRES_ZP_PTR_HI));
  asm.label(pointScreenOkLabel);
  asm.lda(abs(HIRES_POINT_X_HI));
  asm.beq(rel(`${pointScreenOkLabel}_hi_done`));
  asm.clc();
  asm.lda(zp(HIRES_ZP_PTR_LO));
  asm.adc(imm(0x20));
  asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.bcc(rel(`${pointScreenOkLabel}_hi_done`));
  asm.inc(zp(HIRES_ZP_PTR_HI));
  asm.label(`${pointScreenOkLabel}_hi_done`);
  asm.lda(zp(HIRES_ZP_PTR_HI));
  asm.adc(imm(layout.screenStartHi));
  asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.lda(indy(HIRES_ZP_PTR_LO));
  asm.and(imm(0x0f));
  asm.ora(abs(HIRES_POINT_COLOR));
  asm.sta(indy(HIRES_ZP_PTR_LO));
  asm.lda(abs(HIRES_POINT_COLOR));
  asm.rts();

  if (state.hires.hlineRuntimeNeeded) {
    const hlineLoopLabel = `hires_hline_loop_${state.loopCounter++}`;
    const hlineDoneLabel = `hires_hline_done_${state.loopCounter++}`;

    asm.label("hires_hline_runtime");
    asm.lda(abs(HIRES_LINE_X1_LO));
    asm.sta(abs(HIRES_LINE_CURX_LO));
    asm.lda(abs(HIRES_LINE_X1_HI));
    asm.sta(abs(HIRES_LINE_CURX_HI));
    asm.label(hlineLoopLabel);
    asm.lda(abs(HIRES_LINE_CURX_LO));
    asm.sta(abs(HIRES_POINT_X_LO));
    asm.lda(abs(HIRES_LINE_CURX_HI));
    asm.sta(abs(HIRES_POINT_X_HI));
    asm.lda(abs(HIRES_LINE_Y1));
    asm.sta(abs(HIRES_POINT_Y));
    asm.lda(abs(HIRES_LINE_COLOR));
    asm.sta(abs(HIRES_POINT_COLOR));
    asm.jsr(abs("hires_point_runtime"));
    asm.lda(abs(HIRES_LINE_CURX_HI));
    asm.cmp(abs(HIRES_LINE_X2_HI));
    asm.bne(rel(`${hlineLoopLabel}_inc`));
    asm.lda(abs(HIRES_LINE_CURX_LO));
    asm.cmp(abs(HIRES_LINE_X2_LO));
    asm.beq(rel(hlineDoneLabel));
    asm.label(`${hlineLoopLabel}_inc`);
    asm.clc();
    asm.lda(abs(HIRES_LINE_CURX_LO));
    asm.adc(imm(0x01));
    asm.sta(abs(HIRES_LINE_CURX_LO));
    asm.lda(abs(HIRES_LINE_CURX_HI));
    asm.adc(imm(0x00));
    asm.sta(abs(HIRES_LINE_CURX_HI));
    asm.jmp(abs(hlineLoopLabel));
    asm.label(hlineDoneLabel);
    asm.rts();
  }

  if (state.hires.vlineRuntimeNeeded) {
    const vlineLoopLabel = `hires_vline_loop_${state.loopCounter++}`;
    const vlineDoneLabel = `hires_vline_done_${state.loopCounter++}`;

    asm.label("hires_vline_runtime");
    asm.lda(abs(HIRES_LINE_Y1));
    asm.sta(abs(HIRES_LINE_CURY));
    asm.label(vlineLoopLabel);
    asm.lda(abs(HIRES_LINE_X1_LO));
    asm.sta(abs(HIRES_POINT_X_LO));
    asm.lda(abs(HIRES_LINE_X1_HI));
    asm.sta(abs(HIRES_POINT_X_HI));
    asm.lda(abs(HIRES_LINE_CURY));
    asm.sta(abs(HIRES_POINT_Y));
    asm.lda(abs(HIRES_LINE_COLOR));
    asm.sta(abs(HIRES_POINT_COLOR));
    asm.jsr(abs("hires_point_runtime"));
    asm.lda(abs(HIRES_LINE_CURY));
    asm.cmp(abs(HIRES_LINE_Y2));
    asm.beq(rel(vlineDoneLabel));
    asm.inc(abs(HIRES_LINE_CURY));
    asm.jmp(abs(vlineLoopLabel));
    asm.label(vlineDoneLabel);
    asm.rts();
  }

  if (state.hires.fillRectRuntimeNeeded) {
    const fillRectLoopLabel = `hires_fillrect_loop_${state.loopCounter++}`;
    const fillRectDoneLabel = `hires_fillrect_done_${state.loopCounter++}`;

    asm.label("hires_fillrect_runtime");
    asm.label(fillRectLoopLabel);
    asm.jsr(abs("hires_hline_runtime"));
    asm.lda(abs(HIRES_LINE_Y1));
    asm.cmp(abs(HIRES_FILL_Y_END));
    asm.beq(rel(fillRectDoneLabel));
    asm.inc(abs(HIRES_LINE_Y1));
    asm.jmp(abs(fillRectLoopLabel));
    asm.label(fillRectDoneLabel);
    asm.rts();
  }

  if (state.hires.circleRuntimeNeeded) {
    asm.label("hires_circle_runtime");
    asm.lda(abs(HIRES_CIRCLE_RADIUS));
    asm.sta(abs(HIRES_CIRCLE_X));
    emitStoreImmediate(asm, HIRES_CIRCLE_Y, 0x00);
    asm.lda(imm(0x01));
    asm.sec();
    asm.sbc(abs(HIRES_CIRCLE_RADIUS));
    asm.sta(abs(HIRES_CIRCLE_ERR_LO));
    asm.lda(imm(0x00));
    asm.sbc(imm(0x00));
    asm.sta(abs(HIRES_CIRCLE_ERR_HI));

    asm.label(circleLoopLabel);
    asm.lda(abs(HIRES_CIRCLE_Y));
    asm.cmp(abs(HIRES_CIRCLE_X));
    asm.bcc(rel(circleAfterDrawLabel));
    asm.beq(rel(circleAfterDrawLabel));
    asm.jmp(abs(circleDoneLabel));

    asm.label(circleAfterDrawLabel);
    asm.lda(abs(HIRES_CIRCLE_FILL));
    asm.bne(rel(circleDoFillLabel));
    asm.jmp(abs(circlePlotModeLabel));
    asm.label(circleDoFillLabel);
    emitSetHLineParams(HIRES_CIRCLE_X, false, HIRES_CIRCLE_X, true, HIRES_CIRCLE_Y, true);
    asm.jsr(abs("hires_hline_runtime"));
    asm.lda(abs(HIRES_CIRCLE_Y));
    asm.beq(rel(circleFillThirdSpanLabel));
    emitSetHLineParams(HIRES_CIRCLE_X, false, HIRES_CIRCLE_X, true, HIRES_CIRCLE_Y, false);
    asm.jsr(abs("hires_hline_runtime"));
    asm.label(circleFillThirdSpanLabel);
    asm.lda(abs(HIRES_CIRCLE_X));
    asm.cmp(abs(HIRES_CIRCLE_Y));
    asm.bne(rel(circleSkipExtraFillLabel));
    asm.jmp(abs(circleFillAfterFourthLabel));
    asm.label(circleSkipExtraFillLabel);
    emitSetHLineParams(HIRES_CIRCLE_Y, false, HIRES_CIRCLE_Y, true, HIRES_CIRCLE_X, true);
    asm.jsr(abs("hires_hline_runtime"));
    emitSetHLineParams(HIRES_CIRCLE_Y, false, HIRES_CIRCLE_Y, true, HIRES_CIRCLE_X, false);
    asm.jsr(abs("hires_hline_runtime"));
    asm.jmp(abs(circleFillAfterFourthLabel));

    asm.label(circlePlotModeLabel);
    emitPlotPointCall(HIRES_CIRCLE_X, true, HIRES_CIRCLE_Y, true);
    emitPlotPointCall(HIRES_CIRCLE_X, false, HIRES_CIRCLE_Y, true);
    emitPlotPointCall(HIRES_CIRCLE_X, true, HIRES_CIRCLE_Y, false);
    emitPlotPointCall(HIRES_CIRCLE_X, false, HIRES_CIRCLE_Y, false);
    emitPlotPointCall(HIRES_CIRCLE_Y, true, HIRES_CIRCLE_X, true);
    emitPlotPointCall(HIRES_CIRCLE_Y, false, HIRES_CIRCLE_X, true);
    emitPlotPointCall(HIRES_CIRCLE_Y, true, HIRES_CIRCLE_X, false);
    emitPlotPointCall(HIRES_CIRCLE_Y, false, HIRES_CIRCLE_X, false);

    asm.label(circleFillAfterFourthLabel);
    asm.inc(abs(HIRES_CIRCLE_Y));
    asm.lda(abs(HIRES_CIRCLE_ERR_HI));
    asm.bmi(rel(circleErrNegativeLabel));
    asm.dec(abs(HIRES_CIRCLE_X));
    asm.clc();
    asm.lda(abs(HIRES_CIRCLE_Y));
    asm.asl(acc());
    asm.adc(imm(0x01));
    asm.clc();
    asm.adc(abs(HIRES_CIRCLE_ERR_LO));
    asm.sta(abs(HIRES_CIRCLE_ERR_LO));
    asm.lda(abs(HIRES_CIRCLE_ERR_HI));
    asm.adc(imm(0x00));
    asm.sta(abs(HIRES_CIRCLE_ERR_HI));
    asm.sec();
    asm.lda(abs(HIRES_CIRCLE_X));
    asm.asl(acc());
    asm.sta(abs(HIRES_ZP_WORK_LO));
    asm.lda(abs(HIRES_CIRCLE_ERR_LO));
    asm.sbc(abs(HIRES_ZP_WORK_LO));
    asm.sta(abs(HIRES_CIRCLE_ERR_LO));
    asm.lda(abs(HIRES_CIRCLE_ERR_HI));
    asm.sbc(imm(0x00));
    asm.sta(abs(HIRES_CIRCLE_ERR_HI));
    asm.jmp(abs(circleLoopLabel));

    asm.label(circleErrNegativeLabel);
    asm.clc();
    asm.lda(abs(HIRES_CIRCLE_Y));
    asm.asl(acc());
    asm.adc(imm(0x01));
    asm.clc();
    asm.adc(abs(HIRES_CIRCLE_ERR_LO));
    asm.sta(abs(HIRES_CIRCLE_ERR_LO));
    asm.lda(abs(HIRES_CIRCLE_ERR_HI));
    asm.adc(imm(0x00));
    asm.sta(abs(HIRES_CIRCLE_ERR_HI));
    asm.jmp(abs(circleLoopLabel));

    asm.label(circleDoneLabel);
    asm.rts();
  }

  if (!state.hires.lineRuntimeNeeded) {
    return;
  }

  asm.label("hires_line_runtime");
  asm.lda(abs(HIRES_LINE_X1_LO));
  asm.sta(abs(HIRES_LINE_CURX_LO));
  asm.lda(abs(HIRES_LINE_X1_HI));
  asm.sta(abs(HIRES_LINE_CURX_HI));
  asm.lda(abs(HIRES_LINE_Y1));
  asm.sta(abs(HIRES_LINE_CURY));

  asm.lda(abs(HIRES_LINE_X2_HI));
  asm.cmp(abs(HIRES_LINE_X1_HI));
  asm.bcc(rel(lineXReverseLabel));
  asm.bne(rel(lineXForwardLabel));
  asm.lda(abs(HIRES_LINE_X2_LO));
  asm.cmp(abs(HIRES_LINE_X1_LO));
  asm.bcc(rel(lineXReverseLabel));
  asm.label(lineXForwardLabel);
  emitStoreImmediate(asm, HIRES_LINE_SX_NEG, 0x00);
  asm.sec();
  asm.lda(abs(HIRES_LINE_X2_LO));
  asm.sbc(abs(HIRES_LINE_X1_LO));
  asm.sta(abs(HIRES_LINE_DX_LO));
  asm.lda(abs(HIRES_LINE_X2_HI));
  asm.sbc(abs(HIRES_LINE_X1_HI));
  asm.sta(abs(HIRES_LINE_DX_HI));
  asm.jmp(abs(lineYForwardLabel));
  asm.label(lineXReverseLabel);
  emitStoreImmediate(asm, HIRES_LINE_SX_NEG, 0x01);
  asm.sec();
  asm.lda(abs(HIRES_LINE_X1_LO));
  asm.sbc(abs(HIRES_LINE_X2_LO));
  asm.sta(abs(HIRES_LINE_DX_LO));
  asm.lda(abs(HIRES_LINE_X1_HI));
  asm.sbc(abs(HIRES_LINE_X2_HI));
  asm.sta(abs(HIRES_LINE_DX_HI));

  asm.label(lineYForwardLabel);
  asm.lda(abs(HIRES_LINE_Y2));
  asm.cmp(abs(HIRES_LINE_Y1));
  asm.bcc(rel(lineYReverseLabel));
  emitStoreImmediate(asm, HIRES_LINE_SY_NEG, 0x00);
  asm.sec();
  asm.lda(abs(HIRES_LINE_Y2));
  asm.sbc(abs(HIRES_LINE_Y1));
  asm.sta(abs(HIRES_LINE_DY_LO));
  emitStoreImmediate(asm, HIRES_LINE_DY_HI, 0x00);
  asm.jmp(abs(lineMajorXLabel));
  asm.label(lineYReverseLabel);
  emitStoreImmediate(asm, HIRES_LINE_SY_NEG, 0x01);
  asm.sec();
  asm.lda(abs(HIRES_LINE_Y1));
  asm.sbc(abs(HIRES_LINE_Y2));
  asm.sta(abs(HIRES_LINE_DY_LO));
  emitStoreImmediate(asm, HIRES_LINE_DY_HI, 0x00);

  asm.label(lineMajorXLabel);
  asm.lda(abs(HIRES_LINE_DX_HI));
  asm.bne(rel(lineMajorYLabel));
  asm.lda(abs(HIRES_LINE_DX_LO));
  asm.cmp(abs(HIRES_LINE_DY_LO));
  asm.bcc(rel(lineMajorYLabel));
  emitStoreImmediate(asm, HIRES_LINE_MAJOR_X, 0x01);
  asm.lda(abs(HIRES_LINE_DX_LO));
  asm.clc();
  asm.adc(imm(0x01));
  asm.sta(abs(HIRES_LINE_COUNT_LO));
  asm.lda(abs(HIRES_LINE_DX_HI));
  asm.adc(imm(0x00));
  asm.sta(abs(HIRES_LINE_COUNT_HI));
  asm.jmp(abs(lineLoopLabel));

  asm.label(lineMajorYLabel);
  emitStoreImmediate(asm, HIRES_LINE_MAJOR_X, 0x00);
  asm.lda(abs(HIRES_LINE_DY_LO));
  asm.clc();
  asm.adc(imm(0x01));
  asm.sta(abs(HIRES_LINE_COUNT_LO));
  asm.lda(abs(HIRES_LINE_DY_HI));
  asm.adc(imm(0x00));
  asm.sta(abs(HIRES_LINE_COUNT_HI));

  emitStoreImmediate(asm, HIRES_LINE_ACC_LO, 0x00);
  emitStoreImmediate(asm, HIRES_LINE_ACC_HI, 0x00);

  asm.label(lineLoopLabel);
  asm.lda(abs(HIRES_LINE_COUNT_LO));
  asm.ora(abs(HIRES_LINE_COUNT_HI));
  asm.bne(rel(lineContinue1Label));
  asm.jmp(abs(lineDoneLabel));
  asm.label(lineContinue1Label);
  asm.lda(abs(HIRES_LINE_CURX_LO));
  asm.sta(abs(HIRES_POINT_X_LO));
  asm.lda(abs(HIRES_LINE_CURX_HI));
  asm.sta(abs(HIRES_POINT_X_HI));
  asm.lda(abs(HIRES_LINE_CURY));
  asm.sta(abs(HIRES_POINT_Y));
  asm.lda(abs(HIRES_LINE_COLOR));
  asm.sta(abs(HIRES_POINT_COLOR));
  asm.jsr(abs("hires_point_runtime"));
  asm.sec();
  asm.lda(abs(HIRES_LINE_COUNT_LO));
  asm.sbc(imm(0x01));
  asm.sta(abs(HIRES_LINE_COUNT_LO));
  asm.lda(abs(HIRES_LINE_COUNT_HI));
  asm.sbc(imm(0x00));
  asm.sta(abs(HIRES_LINE_COUNT_HI));
  asm.lda(abs(HIRES_LINE_COUNT_LO));
  asm.ora(abs(HIRES_LINE_COUNT_HI));
  asm.bne(rel(lineContinue2Label));
  asm.jmp(abs(lineDoneLabel));
  asm.label(lineContinue2Label);

  asm.lda(abs(HIRES_LINE_MAJOR_X));
  asm.beq(rel(lineMajorYLoopLabel));
  asm.lda(abs(HIRES_LINE_SX_NEG));
  asm.beq(rel(lineUpdateXPositiveLabel));
  asm.sec();
  asm.lda(abs(HIRES_LINE_CURX_LO));
  asm.sbc(imm(0x01));
  asm.sta(abs(HIRES_LINE_CURX_LO));
  asm.lda(abs(HIRES_LINE_CURX_HI));
  asm.sbc(imm(0x00));
  asm.sta(abs(HIRES_LINE_CURX_HI));
  asm.jmp(abs(lineUpdateXDoneLabel));
  asm.label(lineUpdateXPositiveLabel);
  asm.clc();
  asm.lda(abs(HIRES_LINE_CURX_LO));
  asm.adc(imm(0x01));
  asm.sta(abs(HIRES_LINE_CURX_LO));
  asm.lda(abs(HIRES_LINE_CURX_HI));
  asm.adc(imm(0x00));
  asm.sta(abs(HIRES_LINE_CURX_HI));
  asm.label(lineUpdateXDoneLabel);
  asm.clc();
  asm.lda(abs(HIRES_LINE_ACC_LO));
  asm.adc(abs(HIRES_LINE_DY_LO));
  asm.sta(abs(HIRES_LINE_ACC_LO));
  asm.lda(abs(HIRES_LINE_ACC_HI));
  asm.adc(abs(HIRES_LINE_DY_HI));
  asm.sta(abs(HIRES_LINE_ACC_HI));
  asm.lda(abs(HIRES_LINE_ACC_HI));
  asm.cmp(abs(HIRES_LINE_DX_HI));
  asm.bcc(rel(lineAccKeepLabel));
  asm.bne(rel(lineMajorXAdjustYLabel));
  asm.lda(abs(HIRES_LINE_ACC_LO));
  asm.cmp(abs(HIRES_LINE_DX_LO));
  asm.bcc(rel(lineAccKeepLabel));
  asm.label(lineMajorXAdjustYLabel);
  asm.sec();
  asm.lda(abs(HIRES_LINE_ACC_LO));
  asm.sbc(abs(HIRES_LINE_DX_LO));
  asm.sta(abs(HIRES_LINE_ACC_LO));
  asm.lda(abs(HIRES_LINE_ACC_HI));
  asm.sbc(abs(HIRES_LINE_DX_HI));
  asm.sta(abs(HIRES_LINE_ACC_HI));
  asm.lda(abs(HIRES_LINE_SY_NEG));
  asm.beq(rel(lineUpdateYPositiveLabel));
  asm.dec(abs(HIRES_LINE_CURY));
  asm.jmp(abs(lineAccKeepLabel));
  asm.label(lineUpdateYPositiveLabel);
  asm.inc(abs(HIRES_LINE_CURY));
  asm.label(lineAccKeepLabel);
  asm.jmp(abs(lineLoopLabel));

  asm.label(lineMajorYLoopLabel);
  asm.lda(abs(HIRES_LINE_SY_NEG));
  asm.beq(rel(lineUpdateYDoneLabel));
  asm.dec(abs(HIRES_LINE_CURY));
  asm.jmp(abs(lineAccKeepYLabel));
  asm.label(lineUpdateYDoneLabel);
  asm.inc(abs(HIRES_LINE_CURY));
  asm.label(lineAccKeepYLabel);
  asm.clc();
  asm.lda(abs(HIRES_LINE_ACC_LO));
  asm.adc(abs(HIRES_LINE_DX_LO));
  asm.sta(abs(HIRES_LINE_ACC_LO));
  asm.lda(abs(HIRES_LINE_ACC_HI));
  asm.adc(abs(HIRES_LINE_DX_HI));
  asm.sta(abs(HIRES_LINE_ACC_HI));
  asm.lda(abs(HIRES_LINE_ACC_HI));
  asm.cmp(abs(HIRES_LINE_DY_HI));
  asm.bcs(rel(lineMajorYContinue1Label));
  asm.jmp(abs(lineLoopLabel));
  asm.label(lineMajorYContinue1Label);
  asm.bne(rel(lineMajorYAdjustXLabel));
  asm.lda(abs(HIRES_LINE_ACC_LO));
  asm.cmp(abs(HIRES_LINE_DY_LO));
  asm.bcs(rel(lineMajorYContinue2Label));
  asm.jmp(abs(lineLoopLabel));
  asm.label(lineMajorYContinue2Label);
  asm.label(lineMajorYAdjustXLabel);
  asm.sec();
  asm.lda(abs(HIRES_LINE_ACC_LO));
  asm.sbc(abs(HIRES_LINE_DY_LO));
  asm.sta(abs(HIRES_LINE_ACC_LO));
  asm.lda(abs(HIRES_LINE_ACC_HI));
  asm.sbc(abs(HIRES_LINE_DY_HI));
  asm.sta(abs(HIRES_LINE_ACC_HI));
  asm.lda(abs(HIRES_LINE_SX_NEG));
  asm.beq(rel(lineMajorYUpdateXPositiveLabel));
  asm.sec();
  asm.lda(abs(HIRES_LINE_CURX_LO));
  asm.sbc(imm(0x01));
  asm.sta(abs(HIRES_LINE_CURX_LO));
  asm.lda(abs(HIRES_LINE_CURX_HI));
  asm.sbc(imm(0x00));
  asm.sta(abs(HIRES_LINE_CURX_HI));
  asm.jmp(abs(lineMajorYAfterXLabel));
  asm.label(lineMajorYUpdateXPositiveLabel);
  asm.clc();
  asm.lda(abs(HIRES_LINE_CURX_LO));
  asm.adc(imm(0x01));
  asm.sta(abs(HIRES_LINE_CURX_LO));
  asm.lda(abs(HIRES_LINE_CURX_HI));
  asm.adc(imm(0x00));
  asm.sta(abs(HIRES_LINE_CURX_HI));
  asm.label(lineMajorYAfterXLabel);
  asm.jmp(abs(lineLoopLabel));

  asm.label(lineDoneLabel);
  asm.rts();
}

function emitMemset(asm, address, value, length) {
  // Small repeated fills are emitted as a simple X loop:
  //   LDA #value
  // loop: STA address,X / INX / CPX #length / BNE loop
  ensureWord(address, "address");
  ensureByte(value, "value");
  ensureByte(length, "length");
  if (length === 1) {
    emitStoreImmediate(asm, address, value);
    return;
  }
  const loop = `memset_${address.toString(16)}_${value}_${length}`;
  asm.lda(imm(value));
  asm.ldx(imm(0));
  asm.label(loop);
  asm.sta(addressModeX(address));
  asm.inx();
  asm.cpx(imm(length));
  asm.bne(rel(loop));
}

function emitMemsetRange(asm, address, value, length) {
  ensureWord(address, "address");
  ensureByte(value, "value");
  ensureWord(length, "length");
  let offset = 0;
  let remaining = length;
  while (remaining > 0) {
    const chunk = Math.min(remaining, 255);
    emitMemset(asm, address + offset, value, chunk);
    offset += chunk;
    remaining -= chunk;
  }
}

function emitMemcpy(asm, dest, src, length) {
  ensureWord(dest, "dest");
  ensureWord(src, "src");
  ensureByte(length, "length");
  const loop = `memcpy_${dest.toString(16)}_${src.toString(16)}_${length}`;
  asm.ldx(imm(0));
  asm.label(loop);
  asm.lda(addressModeX(src));
  asm.sta(addressModeX(dest));
  asm.inx();
  asm.cpx(imm(length));
  asm.bne(rel(loop));
}

function emitCopyDataTo(asm, compileState, dest, dataRefOrName, explicitLength) {
  // This copies bytes from the program's embedded data area into live RAM.
  const data = resolveDataRef(compileState, dataRefOrName);
  const length = explicitLength ?? data.declaredLength ?? data.bytes?.length;
  if (length === undefined) {
    throw new Error(`copyDataTo needs an explicit length when data is not yet declared: ${data.name}`);
  }
  ensureWord(dest, "dest");
  ensureByte(length, "length");
  if (length === 1) {
    asm.lda(abs(data.name));
    asm.sta(addressMode(dest));
    return;
  }
  const loop = `copydata_${dest.toString(16)}_${data.name}_${length}_${compileState.loopCounter++}`;
  asm.ldx(imm(0));
  asm.label(loop);
  asm.lda(absx(data.name));
  asm.sta(addressModeX(dest));
  asm.inx();
  asm.cpx(imm(length));
  asm.bne(rel(loop));
}

function spriteXAddress(index) {
  return 0xd000 + index * 2;
}

function spriteYAddress(index) {
  return 0xd001 + index * 2;
}

function spriteColorAddress(index) {
  return 0xd027 + index;
}

function spritePointerAddress(index) {
  return 0x07f8 + index;
}

function spriteDataAddress(index, explicitAddress) {
  if (explicitAddress !== undefined) {
    return explicitAddress;
  }
  return 0x2000 + index * 64;
}

function emitSetBitState(asm, address, bitIndex, enabled) {
  const mask = 1 << bitIndex;
  asm.lda(abs(address));
  if (enabled) {
    asm.ora(imm(mask));
  } else {
    asm.and(imm(0xff ^ mask));
  }
  asm.sta(abs(address));
}

function emitSpriteSetX(asm, compileState, index, x) {
  ensureSpriteIndex(index);
  if (isVarRef(x)) {
    const variable = resolveRuntimeVariable(compileState, x, "sprite x");
    if (variable.size !== 1 && variable.size !== 2) throw new Error("sprite x needs a byte or word variable");
    asm.lda(addressMode(variable.address));
    asm.sta(abs(spriteXAddress(index)));
    if (variable.size === 2) {
      const setLabel = `sprite_x_word_set_${index}_${compileState.loopCounter++}`;
      const doneLabel = `sprite_x_word_done_${index}_${compileState.loopCounter++}`;
      asm.lda(addressMode(variable.address + 1));
      asm.and(imm(0x01));
      asm.bne(rel(setLabel));
      emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, false);
      asm.jmp(abs(doneLabel));
      asm.label(setLabel);
      emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, true);
      asm.label(doneLabel);
    } else {
      emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, false);
    }
    compileState.spriteState[index].x = null;
    return;
  }
  ensureSpriteX(x);
  emitStoreImmediate(asm, spriteXAddress(index), x & 0xff);
  emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, x > 255);
  compileState.spriteState[index].x = x;
}

function emitSpriteSetY(asm, compileState, index, y) {
  ensureSpriteIndex(index);
  if (isVarRef(y)) {
    asm.lda(addressMode(resolveRuntimeByteAddress(compileState, y, "sprite y")));
    asm.sta(abs(spriteYAddress(index)));
    compileState.spriteState[index].y = null;
    return;
  }
  ensureByte(y, "sprite y");
  emitStoreImmediate(asm, spriteYAddress(index), y);
  compileState.spriteState[index].y = y;
}

function emitSpritePointer(asm, index, blockIndex) {
  ensureSpriteIndex(index);
  ensureByte(blockIndex, "sprite block index");
  emitStoreImmediate(asm, spritePointerAddress(index), blockIndex);
}

function emitSpriteDataAsset(asm, compileState, index, dataSource, explicitAddress, logical = false) {
  if (logical) ensureLogicalSpriteIndex(index);
  else ensureSpriteIndex(index);
  let targetAddress = spriteDataAddress(index, explicitAddress);
  let length = 63;

  if (Array.isArray(dataSource)) {
    const bytes = dataSource.map((value) => value & 0xff);
    const assetKey = `${bytes.length}:${bytes.join(",")}`;
    const sharedAsset = explicitAddress === undefined
      ? compileState.spriteDataAssets.get(assetKey)
      : undefined;
    if (sharedAsset) {
      targetAddress = sharedAsset.targetAddress;
      length = sharedAsset.length;
      compileState.spriteState[index].dataAddress = targetAddress;
      compileState.spriteState[index].dataLength = length;
      return { targetAddress, length, blockIndex: Math.floor(targetAddress / 64) };
    }
    if (compileState.disk.enabled) {
      const descriptor = registerDiskAsset(compileState, "sprite", targetAddress, bytes, `sprite-${index}`);
      emitDiskLoadCall(asm, descriptor);
    } else {
      const label = `sprite_data_${index}_${compileState.spriteDataCounter++}`;
      registerData(compileState, label, bytes);
      emitCopyDataTo(asm, compileState, targetAddress, label, bytes.length);
    }
    length = bytes.length;
    if (explicitAddress === undefined) {
      // Immutable sprite constants with identical bytes share one VIC-II block.
      // An explicit dataAddress opts out and reserves an independent block for
      // advanced code that intends to modify the pixels at runtime.
      compileState.spriteDataAssets.set(assetKey, { targetAddress, length });
    }
  } else if (isDataRef(dataSource) || typeof dataSource === "string") {
    const data = resolveDataRef(compileState, dataSource);
    length = data.declaredLength ?? data.bytes?.length ?? 63;
    emitCopyDataTo(asm, compileState, targetAddress, dataSource, length);
  } else {
    throw new Error("sprite data must be an array, dataRef, or label name");
  }

  compileState.spriteState[index].dataAddress = targetAddress;
  compileState.spriteState[index].dataLength = length;
  return { targetAddress, length, blockIndex: Math.floor(targetAddress / 64) };
}

function encodeRleBytes(bytes) {
  const encoded = [];
  for (let index = 0; index < bytes.length;) {
    const value = bytes[index];
    let count = 1;
    while (index + count < bytes.length && bytes[index + count] === value && count < 255) count += 1;
    encoded.push(count, value);
    index += count;
  }
  return encoded;
}

function assetTransferCost(rawLength, encodedLength) {
  const rawLoaderBytes = rawLength === 256 ? 11 : 13;
  const rleLoaderBytes = 28;
  return {
    rawLoaderBytes,
    rleLoaderBytes,
    rawProgramBytes: rawLength + rawLoaderBytes,
    rleProgramBytes: encodedLength + rleLoaderBytes,
    rawCyclesEstimate: 2 + rawLength * 14,
    rleCyclesEstimate: 4 + rawLength * 16 + (encodedLength / 2) * 18
  };
}

function shouldUseAssetRle(mode, netSavedBytes) {
  if (mode === "speed") return false;
  if (mode === "size") return netSavedBytes > 0;
  return netSavedBytes >= 8;
}

function emitRleChunkToRam(asm, compileState, destination, encoded, prefix) {
  const poolKey = `${encoded.length}:${encoded.join(",")}`;
  let label = compileState.assets.bytePool.get(poolKey);
  if (!label) {
    label = `asset_rle_${compileState.assets.counter++}`;
    registerData(compileState, label, encoded);
    compileState.assets.bytePool.set(poolKey, label);
  }
  const loopLabel = `${prefix}_rle_${compileState.assets.counter++}`;
  const repeatLabel = `${loopLabel}_repeat`;
  asm.ldx(imm(0));
  asm.ldy(imm(0));
  asm.label(loopLabel);
  asm.lda(absx(label));
  asm.sta(abs(ASSET_RLE_COUNT));
  asm.inx();
  asm.lda(absx(label));
  asm.inx();
  asm.label(repeatLabel);
  asm.sta(absy(destination));
  asm.iny();
  asm.dec(abs(ASSET_RLE_COUNT));
  asm.bne(rel(repeatLabel));
  asm.cpx(imm(encoded.length));
  asm.bne(rel(loopLabel));
}

function emitEmbeddedBytesToRam(asm, compileState, destination, bytes, prefix) {
  ensureWord(destination, `${prefix} destination`);
  ensureWord(destination + bytes.length - 1, `${prefix} end destination`);
  let offset = 0;
  while (offset < bytes.length) {
    const chunk = bytes.slice(offset, offset + 256);
    const encoded = encodeRleBytes(chunk);
    const costs = assetTransferCost(chunk.length, encoded.length);
    const netSavedBytes = costs.rawProgramBytes - costs.rleProgramBytes;
    const compressed = encoded.length <= 255
      && shouldUseAssetRle(compileState.optimization.mode, netSavedBytes);
    compileState.optimization.rleCandidates.push({
      kind: prefix === "asset_charset" ? "charset" : "map",
      rawBytes: chunk.length,
      encodedBytes: encoded.length,
      netSavedBytes,
      compressed,
      ...costs
    });
    if (compressed) {
      emitRleChunkToRam(asm, compileState, destination + offset, encoded, prefix);
      offset += chunk.length;
      continue;
    }
    const poolKey = `${chunk.length}:${chunk.join(",")}`;
    let label = compileState.assets.bytePool.get(poolKey);
    if (!label) {
      label = `asset_bytes_${compileState.assets.counter++}`;
      registerData(compileState, label, chunk);
      compileState.assets.bytePool.set(poolKey, label);
    }
    const loopLabel = `${prefix}_copy_${compileState.assets.counter++}`;
    asm.ldx(imm(0));
    asm.label(loopLabel);
    asm.lda(absx(label));
    asm.sta(absx(destination + offset));
    asm.inx();
    if (chunk.length === 256) {
      asm.bne(rel(loopLabel));
    } else {
      asm.cpx(imm(chunk.length));
      asm.bne(rel(loopLabel));
    }
    offset += chunk.length;
  }
}

function buildCharsetLayout(screenBase, charsetAddress) {
  ensureWord(screenBase, "screen address");
  ensureWord(charsetAddress, "charset address");
  if (charsetAddress % 0x0800 !== 0) throw new Error("charset address must be aligned to $0800");
  if (charsetAddress + 0x0800 > 0x10000) throw new Error("charset must fit in C64 memory");
  const screenBank = Math.floor(screenBase / 0x4000);
  const charsetBank = Math.floor(charsetAddress / 0x4000);
  if (screenBank !== charsetBank) throw new Error("charset and screen RAM must be in the same VIC-II 16 KB bank");
  const charsetOffset = charsetAddress - charsetBank * 0x4000;
  return {
    ciaBankBits: 3 - charsetBank,
    d018CharsetBits: (charsetOffset / 0x0800) << 1
  };
}

function diskAssetPrefix(kind) {
  if (kind === "map") return "LEVEL";
  if (kind === "charset") return "CHARSET";
  if (kind === "tables") return "TABLES";
  if (kind === "sprite") return "SPRITE";
  return "ASSET";
}

function registerDiskAsset(compileState, kind, address, bytes, sourcePath = "<inline>") {
  if (!compileState.disk.enabled) return null;
  ensureWord(address, `${kind} disk load address`);
  const normalized = Array.from(bytes, (value) => value & 0xff);
  const signature = `${kind}:${address}:${normalized.length}:${normalized.join(",")}`;
  const pooled = compileState.disk.assetPool.get(signature);
  if (pooled) return pooled;
  const index = compileState.disk.files.length;
  const kindIndex = compileState.disk.nameCounters.get(kind) ?? 0;
  compileState.disk.nameCounters.set(kind, kindIndex + 1);
  const name = `${diskAssetPrefix(kind)}${kindIndex.toString(36).toUpperCase()}`.slice(0, 16);
  const fileNameBytes = [...name].map((char) => char.charCodeAt(0));
  const filenameLabel = `disk_filename_${index}`;
  registerData(compileState, filenameLabel, fileNameBytes);
  const descriptor = {
    name,
    kind,
    address,
    bytes: normalized.length,
    sourcePath,
    filenameLabel,
    filenameLength: fileNameBytes.length,
    data: Uint8Array.from([address & 0xff, (address >> 8) & 0xff, ...normalized])
  };
  compileState.disk.files.push(descriptor);
  compileState.disk.assetPool.set(signature, descriptor);
  compileState.disk.loaderNeeded = true;
  return descriptor;
}

function emitDiskLoadCall(asm, descriptor) {
  asm.lda(imm(descriptor.filenameLength));
  asm.ldx(immLo(descriptor.filenameLabel));
  asm.ldy(immHi(descriptor.filenameLabel));
  asm.jsr(abs("runtime_disk_load_usr"));
}

function emitDiskLoaderRoutine(asm, state) {
  if (!state.disk.loaderNeeded) return;
  asm.comment("Load one load-address PRG data module through the C64 KERNAL");
  asm.label("runtime_disk_load_usr");
  asm.jsr(abs(c64.KERNAL_SETNAM));
  asm.lda(imm(1));
  asm.ldx(imm(state.disk.device));
  asm.ldy(imm(1));
  asm.jsr(abs(c64.KERNAL_SETLFS));
  asm.php();
  asm.sei();
  asm.lda(imm(0));
  asm.ldx(imm(0));
  asm.ldy(imm(0));
  asm.jsr(abs(c64.KERNAL_LOAD));
  asm.bcs(rel("runtime_disk_load_error"));
  emitStoreImmediate(asm, DISK_LOAD_ERROR, 0);
  asm.plp();
  asm.rts();
  asm.label("runtime_disk_load_error");
  asm.sta(abs(DISK_LOAD_ERROR));
  emitStoreImmediate(asm, c64.VIC_BORDER_COLOR, c64.COLOR_RED);
  emitStoreImmediate(asm, c64.VIC_BACKGROUND_COLOR, c64.COLOR_BLACK);
  // Switch back to the ROM charset so the failure stays readable even when a
  // custom level charset was active. Screen codes spell "DISK ERROR".
  asm.lda(abs(c64.VIC_MEMORY_POINTERS)); asm.and(imm(0xf1)); asm.ora(imm(0x04)); asm.sta(abs(c64.VIC_MEMORY_POINTERS));
  asm.lda(abs(c64.VIC_CONTROL_2)); asm.and(imm(0xef)); asm.sta(abs(c64.VIC_CONTROL_2));
  [4, 9, 19, 11, 32, 5, 18, 18, 15, 18].forEach((screenCode, index) => {
    emitStoreImmediate(asm, state.screenBase + index, screenCode);
    emitStoreImmediate(asm, state.colorBase + index, c64.COLOR_WHITE);
  });
  asm.plp();
  asm.rts();
}

function emitCharsetVicConfiguration(asm, compileState, charset, options, address) {
  const layout = buildCharsetLayout(compileState.screenBase, address);
  asm.lda(abs(c64.CIA2_PRA)); asm.and(imm(0xfc)); asm.ora(imm(layout.ciaBankBits)); asm.sta(abs(c64.CIA2_PRA));
  asm.lda(abs(c64.VIC_MEMORY_POINTERS)); asm.and(imm(0xf1)); asm.ora(imm(layout.d018CharsetBits)); asm.sta(abs(c64.VIC_MEMORY_POINTERS));
  asm.lda(abs(c64.VIC_CONTROL_2));
  if (charset.mode === "multicolor") {
    const background = options?.background ?? 0;
    const multicolor1 = options?.multicolor1 ?? 5;
    const multicolor2 = options?.multicolor2 ?? 10;
    ensureByte(background, "multicolor background"); ensureByte(multicolor1, "multicolor 1"); ensureByte(multicolor2, "multicolor 2");
    if (background > 15 || multicolor1 > 15 || multicolor2 > 15) throw new Error("charset colors must be between 0 and 15");
    asm.ora(imm(0x10)); asm.sta(abs(c64.VIC_CONTROL_2));
    emitStoreImmediate(asm, c64.VIC_BACKGROUND_COLOR, background);
    emitStoreImmediate(asm, c64.VIC_BACKGROUND_COLOR_1, multicolor1);
    emitStoreImmediate(asm, c64.VIC_BACKGROUND_COLOR_2, multicolor2);
  } else {
    asm.and(imm(0xef)); asm.sta(abs(c64.VIC_CONTROL_2));
  }
}

function charsetPayload(charset) {
  if (charset.romCharacters === 64) {
    return {
      addressOffset: 64 * 8,
      bytes: charset.storedBytes,
      romBytes: 64 * 8,
      romCopyCyclesEstimate: 5920
    };
  }
  return { addressOffset: 0, bytes: charset.bytes, romBytes: 0, romCopyCyclesEstimate: 0 };
}

function emitCharacterRomCopy(asm, compileState, address, charset) {
  if (charset.romCharacters !== 64) return;
  const loop = `charset_rom_copy_${compileState.loopCounter++}`;
  // $01 bit 2 selects I/O (1) or character ROM (0) at $D000-$DFFF.
  // Preserve both the CPU port and the previous interrupt state so this helper
  // is also safe during a level activation between two frames.
  asm.php(); asm.sei();
  asm.lda(zp(0x01)); asm.pha(); asm.and(imm(0xfb)); asm.sta(zp(0x01));
  asm.ldx(imm(0));
  asm.label(loop);
  asm.lda(absx(0xd000)); asm.sta(absx(address));
  asm.lda(absx(0xd100)); asm.sta(absx(address + 0x100));
  asm.inx(); asm.bne(rel(loop));
  asm.pla(); asm.sta(zp(0x01)); asm.plp();
}

function emitInlineCharsetInstall(asm, compileState, address, charset) {
  const payload = charsetPayload(charset);
  emitCharacterRomCopy(asm, compileState, address, charset);
  if (payload.bytes.length > 0) {
    emitEmbeddedBytesToRam(asm, compileState, address + payload.addressOffset, payload.bytes, "asset_charset");
  }
}

function registerDiskCharset(compileState, address, charset, sourcePath) {
  const payload = charsetPayload(charset);
  if (payload.bytes.length === 0) return null;
  return registerDiskAsset(compileState, "charset", address + payload.addressOffset, payload.bytes, sourcePath);
}

function emitCharsetUse(asm, compileState, charset, options) {
  if (!charset || charset.type !== "charsetAsset" || charset.bytes?.length !== 2048) {
    throw new Error("charsetUse needs a validated 2048-byte charset asset");
  }
  const address = options?.address ?? 0x3000;
  if (compileState.disk.enabled) {
    emitCharacterRomCopy(asm, compileState, address, charset);
    const descriptor = registerDiskCharset(compileState, address, charset, charset.sourcePath);
    if (descriptor) emitDiskLoadCall(asm, descriptor);
  } else {
    emitInlineCharsetInstall(asm, compileState, address, charset);
  }
  emitCharsetVicConfiguration(asm, compileState, charset, options, address);
  const payload = charsetPayload(charset);
  compileState.assets.report.push({
    type: "charset", mode: charset.mode, address, endAddress: address + charset.bytes.length - 1,
    bytes: charset.bytes.length, storedBytes: payload.bytes.length, romCopiedBytes: payload.romBytes,
    romCopyCyclesEstimate: payload.romCopyCyclesEstimate,
    characters: charset.characterCount, storage: compileState.disk.enabled ? "disk" : "inline"
  });
}

function mapAssetKey(asset) {
  return JSON.stringify({
    sourcePath: asset.sourcePath,
    width: asset.map.width,
    height: asset.map.height,
    data: asset.map.data,
    charsetMode: asset.charset.mode,
    charsetRomCharacters: asset.charset.romCharacters,
    charsetBytes: asset.charset.bytes,
    tileWidth: asset.tileWidth,
    tileHeight: asset.tileHeight,
    tiles: asset.tiles.map((tile) => ({ chars: tile.chars, colors: tile.colors, collision: tile.collision }))
  });
}

function emitMapRegister(asm, compileState, asset) {
  const tileCells = asset.tileWidth * asset.tileHeight;
  if (asset.tiles.length * tileCells > 256) throw new Error("dynamic tile graphics currently support at most 256 character cells across all tiles");
  const key = mapAssetKey(asset);
  const existing = compileState.assets.mapTables.get(key);
  if (existing) return existing;
  const id = compileState.assets.counter++;
  const runtimeAddress = compileState.disk.enabled ? MAP_RUNTIME_BASE : compileState.assets.nextMapAddress;
  const runtimeEnd = runtimeAddress + asset.map.data.length - 1;
  if (runtimeEnd > MAP_RUNTIME_END) throw new Error(compileState.disk.enabled
    ? "a disk-backed active map must stay at or below 8192 cells"
    : "dynamic map RAM is full ($8000-$9FFF); total loaded map cells must stay at or below 8192");
  if (!compileState.disk.enabled) compileState.assets.nextMapAddress = runtimeEnd + 1;
  const info = {
    id,
    key,
    asset,
    runtimeAddress,
    collisionLabel: `asset_map_collisions_${id}`,
    charsLabel: `asset_map_chars_${id}`,
    colorsLabel: `asset_map_colors_${id}`,
    rendererNeeded: false,
    viewportNeeded: false,
    entityCollisionNeeded: false,
    fullDrawConfigured: false,
    activationRequested: false,
    activationRoutineNeeded: compileState.assets.activationUsed || compileState.disk.enabled,
    mapDiskAsset: null,
    charsetDiskAsset: null,
    tablesDiskAsset: null,
    diskSpriteDependencies: new Map(),
    activationDraw: false,
    draw: null,
    viewport: null,
    horizontalScroller: null
  };
  const collisionBytes = asset.tiles.map((tile) => tile.collision);
  const characterBytes = asset.tiles.flatMap((tile) => tile.chars);
  const colorBytes = asset.tiles.flatMap((tile) => tile.colors);
  if (compileState.disk.enabled) {
    const tableBytes = [...collisionBytes, ...characterBytes, ...colorBytes];
    if (MAP_DISK_TABLE_BASE + tableBytes.length - 1 > MAP_DISK_TABLE_END) {
      throw new Error("disk-backed level tile/collision tables exceed the shared $3800-$3FFF slot");
    }
    info.collisionLabel = MAP_DISK_TABLE_BASE;
    info.charsLabel = MAP_DISK_TABLE_BASE + collisionBytes.length;
    info.colorsLabel = info.charsLabel + characterBytes.length;
    info.mapDiskAsset = registerDiskAsset(compileState, "map", runtimeAddress, asset.map.data, asset.sourcePath);
    info.charsetDiskAsset = registerDiskCharset(compileState, 0x3000, asset.charset, asset.sourcePath);
    info.tablesDiskAsset = registerDiskAsset(compileState, "tables", MAP_DISK_TABLE_BASE, tableBytes, asset.sourcePath);
    compileState.assets.report.push({
      type: "charset",
      mode: asset.charset.mode,
      address: 0x3000,
      endAddress: 0x37ff,
      bytes: 2048,
      storedBytes: charsetPayload(asset.charset).bytes.length,
      romCopiedBytes: charsetPayload(asset.charset).romBytes,
      romCopyCyclesEstimate: charsetPayload(asset.charset).romCopyCyclesEstimate,
      characters: asset.charset.characterCount,
      storage: "disk-level"
    });
    compileState.assets.report.push({
      type: "map-level-tables",
      sourcePath: asset.sourcePath,
      address: MAP_DISK_TABLE_BASE,
      endAddress: MAP_DISK_TABLE_BASE + tableBytes.length - 1,
      bytes: tableBytes.length,
      contents: ["tile-collision", "tile-characters", "tile-colors"],
      storage: "disk-level"
    });
  } else {
    registerData(compileState, info.collisionLabel, collisionBytes);
    registerData(compileState, info.charsLabel, characterBytes);
    registerData(compileState, info.colorsLabel, colorBytes);
  }
  compileState.assets.mapTables.set(key, info);
  if (compileState.disk.enabled) {
    // The first level is loaded only when mapAsset.activate() requests it.
  } else if (info.activationRoutineNeeded) {
    asm.jsr(abs(`runtime_map_activate_${id}`));
  } else {
    emitEmbeddedBytesToRam(asm, compileState, runtimeAddress, asset.map.data, "asset_map_initial");
  }
  compileState.assets.report.push({
    type: "map-runtime",
    sourcePath: asset.sourcePath,
    address: runtimeAddress,
    endAddress: runtimeEnd,
    bytes: asset.map.data.length,
    indexBits: 16,
    objects: asset.map.objects?.length ?? 0,
    activation: compileState.disk.enabled ? "disk-on-demand" : (info.activationRoutineNeeded ? "embedded-resettable" : "eager-once"),
    activeMapContract: info.activationRoutineNeeded,
    storage: compileState.disk.enabled ? "disk" : "inline",
    sharedMapRamSlot: compileState.disk.enabled
  });
  return info;
}

function requireDynamicMap(compileState, asset) {
  const info = compileState.assets.mapTables.get(mapAssetKey(asset));
  if (!info) throw new Error("map asset is not registered; create it with c64.assets.loadMap() or c64.assets.defineMap() before use");
  return info;
}

function emitMapActivateRequest(asm, compileState, asset, options = {}) {
  const info = requireDynamicMap(compileState, asset);
  if (info.id >= GAME_SCENE_NONE) throw new Error("map activation supports at most 255 registered asset ids");
  info.activationRequested = true;
  compileState.assets.activationUsed = true;
  if (options?.draw) {
    const drawOptions = options.draw === true ? {} : options.draw;
    if (!drawOptions || typeof drawOptions !== "object" || Array.isArray(drawOptions)) {
      throw new Error("mapAsset.activate({ draw }) expects true or { x, y }");
    }
    configureMapDraw(compileState, info, drawOptions);
    info.activationDraw = true;
  }
  for (const sprite of options?.sprites ?? []) {
    if (!sprite || sprite.type !== "spriteAsset" || !sprite.framesRef) {
      throw new Error("mapAsset.activate({ sprites }) expects sprite assets returned by c64.assets.loadSprite()");
    }
    if (sprite.resident !== false) continue;
    const frameAsset = compileState.spriteFrameAssets.get(sprite.framesRef.name);
    if (!frameAsset) throw new Error(`Sprite frames are not registered: ${sprite.id}`);
    if (compileState.disk.enabled && !frameAsset.diskDescriptor) {
      throw new Error(`Non-resident sprite ${sprite.id} has no disk asset`);
    }
    if (frameAsset.diskDescriptor) info.diskSpriteDependencies.set(frameAsset.diskDescriptor.name, frameAsset.diskDescriptor);
  }
  emitStoreImmediate(asm, MAP_PENDING_ID, info.id);
}

function emitPendingMapActivation(asm, state) {
  if (!state.assets.activationUsed) return;
  const doneLabel = `map_activation_done_${state.loopCounter++}`;
  const clearLabel = `map_activation_clear_${state.loopCounter++}`;
  const requestedLabel = `map_activation_requested_${state.loopCounter++}`;
  asm.lda(abs(MAP_PENDING_ID));
  asm.cmp(imm(GAME_SCENE_NONE));
  asm.bne(rel(requestedLabel));
  asm.jmp(abs(doneLabel));
  asm.label(requestedLabel);
  asm.cmp(abs(MAP_ACTIVE_ID));
  asm.beq(rel(clearLabel));
  for (const info of state.assets.mapTables.values()) {
    const nextLabel = `map_activation_next_${info.id}_${state.loopCounter++}`;
    asm.lda(abs(MAP_PENDING_ID));
    asm.cmp(imm(info.id));
    asm.bne(rel(nextLabel));
    asm.jsr(abs(`runtime_map_activate_${info.id}`));
    if (state.disk.enabled) {
      asm.lda(abs(DISK_LOAD_ERROR));
      asm.bne(rel(clearLabel));
    }
    emitStoreImmediate(asm, MAP_ACTIVE_ID, info.id);
    asm.jmp(abs(clearLabel));
    asm.label(nextLabel);
  }
  asm.label(clearLabel);
  emitStoreImmediate(asm, MAP_PENDING_ID, GAME_SCENE_NONE);
  asm.label(doneLabel);
}

function emitMapCoordinatesOrJumpInvalid(asm, compileState, asset, x, y, invalidLabel, id) {
  if (typeof x === "number") integerMapCoordinate(x, asset.map.width, "tile x");
  if (typeof y === "number") integerMapCoordinate(y, asset.map.height, "tile y");
  emitRuntimeValueToA(asm, compileState, x, "tile x"); asm.cmp(imm(asset.map.width)); asm.bcc(rel(`map_x_ok_${id}`)); asm.jmp(abs(invalidLabel)); asm.label(`map_x_ok_${id}`); asm.sta(abs(MAP_TEMP_X));
  emitRuntimeValueToA(asm, compileState, y, "tile y"); asm.cmp(imm(asset.map.height)); asm.bcc(rel(`map_y_ok_${id}`)); asm.jmp(abs(invalidLabel)); asm.label(`map_y_ok_${id}`); asm.sta(abs(MAP_TEMP_Y));
}

function emitMapIndexToPointer(asm, info, id) {
  const asset = info.asset;
  // Compute y * mapWidth with a constant shift/add multiply. The former
  // repeated-add loop cost increasingly more cycles on lower map rows, which
  // made collision probes and coarse-scroll frames miss their raster budget.
  emitStoreImmediate(asm, MAP_TEMP_INDEX, 0);
  emitStoreImmediate(asm, MAP_TEMP_INDEX_HI, 0);
  asm.lda(abs(MAP_TEMP_Y)); asm.sta(abs(MAP_TEMP_ROWS));
  emitStoreImmediate(asm, MAP_CONVERT_COUNT, 0);
  const highestWidthBit = Math.floor(Math.log2(asset.map.width));
  for (let bit = 0; bit <= highestWidthBit; bit += 1) {
    if ((asset.map.width & (1 << bit)) !== 0) {
      asm.clc();
      asm.lda(abs(MAP_TEMP_INDEX)); asm.adc(abs(MAP_TEMP_ROWS)); asm.sta(abs(MAP_TEMP_INDEX));
      asm.lda(abs(MAP_TEMP_INDEX_HI)); asm.adc(abs(MAP_CONVERT_COUNT)); asm.sta(abs(MAP_TEMP_INDEX_HI));
    }
    if (bit < highestWidthBit) {
      asm.asl(abs(MAP_TEMP_ROWS));
      asm.rol(abs(MAP_CONVERT_COUNT));
    }
  }
  asm.clc(); asm.lda(abs(MAP_TEMP_INDEX)); asm.adc(abs(MAP_TEMP_X)); asm.sta(abs(MAP_TEMP_INDEX));
  asm.lda(abs(MAP_TEMP_INDEX_HI)); asm.adc(imm(0)); asm.sta(abs(MAP_TEMP_INDEX_HI));
  asm.clc(); asm.lda(abs(MAP_TEMP_INDEX)); asm.adc(imm(info.runtimeAddress & 0xff)); asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(abs(MAP_TEMP_INDEX_HI)); asm.adc(imm((info.runtimeAddress >> 8) & 0xff)); asm.sta(zp(HIRES_ZP_PTR_HI));
  asm.ldy(imm(0));
}

function configureMapDraw(compileState, info, options) {
  const expanded = expandMapAsset(info.asset);
  const x = options?.x ?? 0;
  const y = options?.y ?? 0;
  ensureByte(x, "map draw x"); ensureByte(y, "map draw y");
  if (x + expanded.width > 40 || y + expanded.height > 25) {
    throw new Error(`expanded map (${expanded.width}x${expanded.height}) does not fit at (${x},${y}) on the 40x25 screen`);
  }
  const draw = { x, y, screenBase: compileState.screenBase, colorBase: compileState.colorBase, width: expanded.width, height: expanded.height };
  if (info.draw && JSON.stringify(info.draw) !== JSON.stringify(draw)) throw new Error("a dynamic map currently supports one screen position per build");
  info.draw = draw;
  info.fullDrawConfigured = true;
  info.rendererNeeded = true;
  return draw;
}

function configureMapViewport(compileState, info, options) {
  const asset = info.asset;
  const width = options?.width;
  const height = options?.height;
  ensurePositiveByte(width, "viewport width");
  ensurePositiveByte(height, "viewport height");
  if (width > asset.map.width || height > asset.map.height) throw new Error("viewport dimensions must fit inside the source map");
  const x = options?.x ?? 0;
  const y = options?.y ?? 0;
  ensureByte(x, "viewport screen x"); ensureByte(y, "viewport screen y");
  const screenWidth = width * asset.tileWidth;
  const screenHeight = height * asset.tileHeight;
  if (x + screenWidth > 40 || y + screenHeight > 25) {
    throw new Error(`viewport (${screenWidth}x${screenHeight}) does not fit at (${x},${y}) on the 40x25 screen`);
  }
  const viewport = { width, height, x, y, screenWidth, screenHeight };
  if (info.viewport && JSON.stringify(info.viewport) !== JSON.stringify(viewport)) {
    throw new Error("a map currently supports one viewport size and screen position per build");
  }
  if (info.draw && (info.draw.x !== x || info.draw.y !== y || info.draw.screenBase !== compileState.screenBase || info.draw.colorBase !== compileState.colorBase)) {
    throw new Error("full-map and viewport rendering must share the same screen position and memory layout");
  }
  info.viewport = viewport;
  info.draw ??= { x, y, screenBase: compileState.screenBase, colorBase: compileState.colorBase, width: screenWidth, height: screenHeight };
  info.rendererNeeded = true;
  info.viewportNeeded = true;
  return viewport;
}

function emitBoundedViewportOrigin(asm, compileState, value, maximum, target, axis, id) {
  if (typeof value === "number") {
    if (!Number.isInteger(value) || value < 0 || value > maximum) throw new Error(`viewport source ${axis} must be between 0 and ${maximum}`);
    emitStoreImmediate(asm, target, value);
    return;
  }
  emitRuntimeValueToA(asm, compileState, value, `viewport source ${axis}`);
  const okLabel = `map_viewport_${axis}_ok_${id}`;
  asm.cmp(imm(maximum + 1)); asm.bcc(rel(okLabel)); asm.lda(imm(maximum)); asm.label(okLabel); asm.sta(abs(target));
}

function emitMapViewportDraw(asm, compileState, asset, options) {
  const info = requireDynamicMap(compileState, asset);
  const viewport = configureMapViewport(compileState, info, options);
  const id = compileState.loopCounter++;
  emitBoundedViewportOrigin(asm, compileState, options?.sourceX ?? 0, asset.map.width - viewport.width, MAP_VIEW_SOURCE_X, "x", id);
  emitBoundedViewportOrigin(asm, compileState, options?.sourceY ?? 0, asset.map.height - viewport.height, MAP_VIEW_SOURCE_Y, "y", id);
  asm.jsr(abs(`runtime_map_viewport_${info.id}`));
  if (!info.reportedViewport) {
    const tileCells = asset.tileWidth * asset.tileHeight;
    const visibleTiles = viewport.width * viewport.height;
    const estimatedCycles = visibleTiles * (120 + tileCells * 30);
    compileState.assets.report.push({
      type: "map-viewport",
      sourcePath: asset.sourcePath,
      width: viewport.width,
      height: viewport.height,
      screenWidth: viewport.screenWidth,
      screenHeight: viewport.screenHeight,
      visibleTiles,
      strategy: "coarse-full-redraw",
      estimatedCycles,
      palFrameBudget: 19656,
      ntscFrameBudget: 17095,
      fullRedrawFitsPalFrame: estimatedCycles <= 19656
    });
    info.reportedViewport = true;
  }
}

function requireHorizontalScroller(compileState, ref) {
  if (!ref || ref.type !== "mapHorizontalScrollerRef") {
    throw new Error("expected a scroller created with c64.map.horizontalScroller()");
  }
  const scroller = compileState.assets.scrollers.get(ref.id);
  if (!scroller) throw new Error("horizontal scroller must be created before it is used");
  return scroller;
}

function addMapScrollRasterHandler(compileState, line, instruction) {
  let handler = compileState.irq.handlers.find((entry) => entry.line === line);
  if (!handler) {
    handler = { line, instructions: [] };
    compileState.irq.handlers.push(handler);
  }
  handler.instructions.push(instruction);
  compileState.irq.handlers.sort((left, right) => left.line - right.line);
  // A KERNAL CIA timer hit immediately before the entry raster can postpone
  // D016/D011 until the visible area has started, producing a rare one-frame
  // seven-pixel flash even while the camera is idle. Scrolling games already
  // use direct joystick/keyboard snapshots, so keep this timing-critical chain
  // VIC-only. A later explicit c64.irq.enableKernalTimer()/chainToKernal() call
  // can still override this choice when an advanced program really needs it.
  compileState.irq.disableKernalTimer = true;
  compileState.irq.chainToKernal = false;
  compileState.irq.autoInstallRequested = true;
}

function emitMapHorizontalScrollerCreate(asm, compileState, ref, asset, options) {
  if (!ref || ref.type !== "mapHorizontalScrollerRef") throw new Error("invalid horizontal scroller reference");
  if (compileState.assets.scrollers.has(ref.id)) throw new Error("horizontal scroller is already created");
  const info = requireDynamicMap(compileState, asset);
  if (asset.tileWidth !== 1 || asset.tileHeight !== 1) {
    throw new Error("fine scrolling currently requires 1x1-character tiles");
  }
  const configuredViewport = configureMapViewport(compileState, info, options);
  const verticalUsed = compileState.optimization.usesVerticalMapScroll;
  if (configuredViewport.screenWidth < 2) throw new Error("horizontal scroller width must be at least 2 characters");
  // CSEL=0 gives the VIC-II a 38-column display. Keeping one hidden character
  // at each side lets the fine-scroll register move without exposing garbage.
  if (configuredViewport.x < 1 || configuredViewport.x + configuredViewport.screenWidth > 39) {
    throw new Error("horizontal fine scrolling must stay inside columns 1..38 (use x >= 1 and x + width <= 39)");
  }
  const sourceX = options?.sourceX ?? 0;
  const sourceY = options?.sourceY ?? 0;
  const panel = options?.panel ?? (configuredViewport.y > 0 ? "top" : "bottom");
  if (panel !== "top" && panel !== "bottom") throw new Error("scroller panel must be \"top\" or \"bottom\"");
  if (panel === "top" && configuredViewport.y === 0) throw new Error("a top fixed panel needs at least one screen row above the scrolling viewport");
  if (panel === "bottom" && configuredViewport.y + configuredViewport.screenHeight >= 25) throw new Error("a bottom fixed panel needs at least one screen row below the scrolling viewport");
  if (verticalUsed && panel === "bottom" && configuredViewport.screenHeight < 2) {
    throw new Error("vertical scrolling with a fixed bottom panel needs at least two viewport rows (one is reserved for the VIC-II transition)");
  }
  const panelRows = panel === "bottom" ? 25 - (configuredViewport.y + configuredViewport.screenHeight) : configuredViewport.y;
  if (options?.panelRows !== undefined && options.panelRows !== panelRows) {
    throw new Error(`panel.rows=${options.panelRows} does not match the ${panelRows} fixed screen rows left by the viewport`);
  }
  // A real fixed text panel needs one complete character row for the VIC-II to
  // finish RC/VCBASE after a variable YSCROLL phase. That last configured row is
  // a background-only transition band; map drawing and streaming stop above it.
  const viewport = verticalUsed && panel === "bottom"
    ? {
        ...configuredViewport,
        height: configuredViewport.height - 1,
        screenHeight: configuredViewport.screenHeight - 1
      }
    : configuredViewport;
  if (viewport !== configuredViewport) {
    info.viewport = viewport;
    info.draw = { ...info.draw, width: viewport.screenWidth, height: viewport.screenHeight };
  }
  const maxX = asset.map.width - viewport.width;
  const maxY = asset.map.height - viewport.height;
  if (!Number.isInteger(sourceX) || sourceX < 0 || sourceX > maxX) throw new Error(`horizontal scroller sourceX must be between 0 and ${maxX}`);
  if (!Number.isInteger(sourceY) || sourceY < 0 || sourceY > maxY) throw new Error(`horizontal scroller sourceY must be between 0 and ${maxY}`);
  if (info.horizontalScroller || compileState.assets.scrollers.size > 0) throw new Error("a program currently supports one raster-banded map scroller");

  const cameraAddress = allocateVariableAddress(compileState, 1);
  registerVariable(compileState, `__mapScroller${ref.id}_cameraX`, cameraAddress, 1);
  const fineAddress = allocateVariableAddress(compileState, 1);
  registerVariable(compileState, `__mapScroller${ref.id}_fineX`, fineAddress, 1);
  const cameraYAddress = allocateVariableAddress(compileState, 1);
  registerVariable(compileState, `__mapScroller${ref.id}_cameraY`, cameraYAddress, 1);
  const fineYAddress = allocateVariableAddress(compileState, 1);
  registerVariable(compileState, `__mapScroller${ref.id}_fineY`, fineYAddress, 1);
  const fixedD011Address = allocateVariableAddress(compileState, 1);
  registerVariable(compileState, `__mapScroller${ref.id}_fixedD011`, fixedD011Address, 1);
  const fixedD016Address = allocateVariableAddress(compileState, 1);
  registerVariable(compileState, `__mapScroller${ref.id}_fixedD016`, fixedD016Address, 1);
  const fixedD018Address = verticalUsed ? allocateVariableAddress(compileState, 1) : null;
  if (fixedD018Address !== null) {
    registerVariable(compileState, `__mapScroller${ref.id}_fixedD018`, fixedD018Address, 1);
  }
  const cameraPixelXName = `__mapScroller${ref.id}_cameraPixelX`;
  const cameraPixelXAddress = allocateVariableAddress(compileState, 2);
  registerVariable(compileState, cameraPixelXName, cameraPixelXAddress, 2);
  const cameraPixelYName = `__mapScroller${ref.id}_cameraPixelY`;
  const cameraPixelYAddress = allocateVariableAddress(compileState, 2);
  registerVariable(compileState, cameraPixelYName, cameraPixelYAddress, 2);
  // A bottom panel lets YSCROLL be installed before the first display
  // badline. A top character panel would require an FLD/badline compensation
  // routine before vertical fine scrolling can start cleanly below it.
  const panelScreenRow = configuredViewport.y + configuredViewport.screenHeight;
  const enterRasterLine = panel === "bottom" ? 30 : 48 + configuredViewport.y * 8;
  const panelStartRasterLine = 51 + panelScreenRow * 8;
  const exitRasterLine = panelStartRasterLine - 1;
  // The handler starts early, then polls D012 inside one IRQ. This removes all
  // dispatcher jitter from the phase-7 normalization, DEN guard and final split.
  const prepareRasterLine = panel === "bottom" && verticalUsed ? panelStartRasterLine - 23 : null;
  const normalizeRasterLine = panel === "bottom" && verticalUsed ? panelStartRasterLine - 14 : null;
  // Select the empty charset one full raster before the transition badline.
  // Changing D018 on the badline itself can be delayed by VIC bus stealing and
  // leave the first character fetches sourced from the moving-map charset.
  const blankRasterLine = panel === "bottom" && verticalUsed ? panelStartRasterLine - 13 : null;
  const denOffRasterLine = panel === "bottom" && verticalUsed ? panelStartRasterLine - 5 : null;
  const panelRasterLine = panel === "bottom" && verticalUsed ? panelStartRasterLine - 3 : null;
  const blankCharsetAddress = verticalUsed ? ((compileState.screenBase & 0xc000) + 0x3800) : null;
  const recommendedFrameRasterLine = Math.min(exitRasterLine + 4, 250);
  const scroller = {
    ref, info, viewport, panel, maxX, maxY,
    cameraAddress, fineAddress, cameraYAddress, fineYAddress,
    cameraPixelXAddress, cameraPixelYAddress,
    cameraPixelXRef: { type: "varRef", valueType: "word", name: cameraPixelXName },
    cameraPixelYRef: { type: "varRef", valueType: "word", name: cameraPixelYName },
    fixedD011Address, fixedD016Address, fixedD018Address,
    enterRasterLine, exitRasterLine, prepareRasterLine, normalizeRasterLine,
    blankRasterLine, denOffRasterLine, panelRasterLine, blankCharsetAddress,
    recommendedFrameRasterLine,
    panelRows, panelScreenRow,
    configuredViewport,
    verticalUsed,
    followEntityId: null
  };
  compileState.assets.scrollers.set(ref.id, scroller);
  info.horizontalScroller = scroller;
  emitStoreImmediate(asm, cameraAddress, sourceX);
  emitStoreImmediate(asm, fineAddress, 7);
  emitStoreImmediate(asm, cameraYAddress, sourceY);
  emitStoreImmediate(asm, fineYAddress, 7);
  emitStoreImmediate(asm, cameraPixelXAddress, (sourceX * 8) & 0xff);
  emitStoreImmediate(asm, cameraPixelXAddress + 1, (sourceX * 8) >> 8);
  emitStoreImmediate(asm, cameraPixelYAddress, (sourceY * 8) & 0xff);
  emitStoreImmediate(asm, cameraPixelYAddress + 1, (sourceY * 8) >> 8);
  // Bit 7 of a D011 read is the current raster MSB, not display state. Never
  // save it as part of the fixed-panel control value.
  asm.lda(abs(c64.VIC_CONTROL_1)); asm.and(imm(0x7f)); asm.sta(abs(fixedD011Address));
  asm.lda(abs(c64.VIC_CONTROL_2)); asm.sta(abs(fixedD016Address));
  if (verticalUsed) {
    asm.lda(abs(c64.VIC_MEMORY_POINTERS)); asm.sta(abs(fixedD018Address));
    const blankLoop = `map_scroll_blank_charset_${ref.id}`;
    asm.lda(imm(0)); asm.ldx(imm(0));
    asm.label(blankLoop);
    for (let page = 0; page < 8; page += 1) asm.sta(absx(blankCharsetAddress + page * 256));
    asm.inx(); asm.bne(rel(blankLoop));
    compileState.assets.report.push({
      type: "map-scroll-blank-charset",
      address: blankCharsetAddress,
      endAddress: blankCharsetAddress + 0x7ff,
      bytes: 0x800
    });
  }
  if (verticalUsed) {
    const conflictingHandler = compileState.irq.handlers.find((handler) => (
      handler.line > prepareRasterLine && handler.line <= exitRasterLine
    ));
    if (conflictingHandler) {
      throw new Error(`raster IRQ line ${conflictingHandler.line} overlaps the vertical panel transition (${prepareRasterLine}..${exitRasterLine})`);
    }
  }
  addMapScrollRasterHandler(compileState, enterRasterLine, { op: "mapScrollIrqEnter", args: [ref] });
  if (prepareRasterLine !== null) {
    addMapScrollRasterHandler(compileState, prepareRasterLine, { op: "mapScrollIrqPreparePanel", args: [ref] });
  }
  if (!verticalUsed) {
    addMapScrollRasterHandler(compileState, exitRasterLine, { op: "mapScrollIrqExit", args: [ref] });
  }

  const shiftedCells = (viewport.screenWidth - 1) * viewport.screenHeight;
  const shiftedCellsPerRow = viewport.screenWidth - 1;
  const pairedShiftCyclesPerRow = Math.floor(shiftedCellsPerRow / 2) * 43
    + (shiftedCellsPerRow % 2 === 0 ? 0 : 16)
    + (shiftedCellsPerRow > 1 ? 2 : 0);
  const horizontalShiftCyclesEstimate = pairedShiftCyclesPerRow * viewport.screenHeight
    + 43 * viewport.height
    + 180;
  const pairedVerticalCyclesPerRow = Math.floor(viewport.screenWidth / 2) * 43
    + (viewport.screenWidth % 2 === 0 ? 0 : 16)
    + (viewport.screenWidth > 1 ? 2 : 0);
  const verticalShiftCyclesEstimate = pairedVerticalCyclesPerRow * (viewport.screenHeight - 1)
    + viewport.width * 34
    + 180;
  const firstRaster = 50 + viewport.y * 8;
  const lastViewportRaster = firstRaster + (viewport.screenHeight - 1) * 8;
  // Horizontal coarse copies are emitted row by row, top to bottom. A row is
  // safe as long as it is ready before the beam reaches that same row on the
  // next frame, so the last row provides the relevant complete-copy budget.
  const palSafeCyclesEstimate = (312 - recommendedFrameRasterLine + lastViewportRaster) * 63;
  const ntscSafeCyclesEstimate = (262 - recommendedFrameRasterLine + lastViewportRaster) * 65;
  const palFirstRowCyclesEstimate = (312 - recommendedFrameRasterLine + firstRaster) * 63;
  const ntscFirstRowCyclesEstimate = (262 - recommendedFrameRasterLine + firstRaster) * 65;
  const verticalUpFitsPal = panel === "bottom" && verticalShiftCyclesEstimate <= palSafeCyclesEstimate;
  const verticalUpFitsNtsc = panel === "bottom" && verticalShiftCyclesEstimate <= ntscSafeCyclesEstimate;
  // A downward in-place row copy must run bottom-to-top. Until a second screen
  // buffer exists, require the whole copy to finish before the first row.
  const verticalDownFitsPal = panel === "bottom" && verticalShiftCyclesEstimate <= palFirstRowCyclesEstimate;
  const verticalDownFitsNtsc = panel === "bottom" && verticalShiftCyclesEstimate <= ntscFirstRowCyclesEstimate;
  scroller.verticalTiming = {
    upFitsPal: verticalUpFitsPal,
    upFitsNtsc: verticalUpFitsNtsc,
    downFitsPal: verticalDownFitsPal,
    downFitsNtsc: verticalDownFitsNtsc
  };
  compileState.assets.report.push({
    type: "map-scroll",
    sourcePath: asset.sourcePath,
    width: viewport.width,
    height: viewport.height,
    screenWidth: viewport.screenWidth,
    screenHeight: viewport.screenHeight,
    configuredHeight: configuredViewport.height,
    configuredScreenHeight: configuredViewport.screenHeight,
    panel,
    panelRows,
    panelScreenRow,
    enterRasterLine,
    exitRasterLine,
    prepareRasterLine,
    normalizeRasterLine,
    blankRasterLine,
    denOffRasterLine,
    panelRasterLine,
    recommendedFrameRasterLine,
    strategy: panel === "bottom" ? "fine-scroll-xy-stream" : "fine-scroll-x-column-stream",
    verticalFineScrollSupported: panel === "bottom",
    fineStepCyclesEstimate: 48,
    horizontalWrapCyclesEstimate: horizontalShiftCyclesEstimate,
    verticalWrapCyclesEstimate: verticalShiftCyclesEstimate,
    assumedRasterLine: recommendedFrameRasterLine,
    palSafeCyclesEstimate,
    ntscSafeCyclesEstimate,
    horizontalWrapFitsPal: horizontalShiftCyclesEstimate <= palSafeCyclesEstimate,
    horizontalWrapFitsNtsc: horizontalShiftCyclesEstimate <= ntscSafeCyclesEstimate,
    verticalUpWrapFitsPal: verticalUpFitsPal,
    verticalUpWrapFitsNtsc: verticalUpFitsNtsc,
    verticalDownWrapFitsPal: verticalDownFitsPal,
    verticalDownWrapFitsNtsc: verticalDownFitsNtsc,
    verticalWrapFitsPal: verticalUpFitsPal && verticalDownFitsPal,
    verticalWrapFitsNtsc: verticalUpFitsNtsc && verticalDownFitsNtsc,
    verticalPhaseTransitionLines: verticalUsed ? exitRasterLine - prepareRasterLine + 1 : 0,
    guardRasterLines: verticalUsed ? 8 : 0,
    guardColor: verticalUsed ? "background" : null,
    transitionRows: verticalUsed ? 1 : 0,
    panelMemoryRowOffset: verticalUsed ? -1 : 0,
    blankCharsetAddress,
    beamRacedRows: true,
    kernalTimerDisabled: true,
    irqTiming: "vic-only",
    stateBytes: verticalUsed ? 11 : 10
  });
}

function emitMapHorizontalScrollerDraw(asm, compileState, ref) {
  const scroller = requireHorizontalScroller(compileState, ref);
  asm.lda(abs(scroller.cameraAddress)); asm.sta(abs(MAP_VIEW_SOURCE_X));
  asm.lda(abs(scroller.cameraYAddress)); asm.sta(abs(MAP_VIEW_SOURCE_Y));
  asm.lda(abs(c64.VIC_CONTROL_1)); asm.and(imm(0x7f)); asm.sta(abs(scroller.fixedD011Address));
  asm.lda(abs(c64.VIC_CONTROL_2)); asm.sta(abs(scroller.fixedD016Address));
  if (scroller.verticalUsed) {
    asm.lda(abs(c64.VIC_MEMORY_POINTERS)); asm.sta(abs(scroller.fixedD018Address));
  }
  asm.jsr(abs(`runtime_map_viewport_${scroller.info.id}`));
  asm.jsr(abs(`runtime_map_scroll_restore_${scroller.info.id}`));
}

function emitMapHorizontalScrollerSingleStep(asm, compileState, scroller, direction) {
  const id = compileState.loopCounter++;
  const canMove = `map_scroll_can_move_${id}`;
  const wrap = `map_scroll_wrap_${id}`;
  const moved = `map_scroll_moved_${id}`;
  const done = `map_scroll_done_${id}`;
  if (direction > 0) {
    // At maxX the viewport is already aligned with the last complete source
    // column. Advancing the fine position would expose a non-existent column.
    asm.lda(abs(scroller.cameraAddress)); asm.cmp(imm(scroller.maxX)); asm.beq(rel(done));
    asm.label(canMove);
    asm.lda(abs(scroller.fineAddress)); asm.beq(rel(wrap));
    asm.dec(abs(scroller.fineAddress));
    asm.jmp(abs(moved));
    asm.label(wrap);
    asm.inc(abs(scroller.cameraAddress));
    asm.jsr(abs(`runtime_map_scroll_shift_left_${scroller.info.id}`));
    emitStoreImmediate(asm, scroller.fineAddress, 7);
    asm.label(moved);
    emitEntityWordStep(asm, scroller.cameraPixelXAddress, 1, `map_scroll_pixel_x_inc_${id}`);
  } else {
    asm.lda(abs(scroller.cameraAddress)); asm.bne(rel(canMove));
    asm.lda(abs(scroller.fineAddress)); asm.cmp(imm(7)); asm.beq(rel(done));
    asm.label(canMove);
    asm.lda(abs(scroller.fineAddress)); asm.cmp(imm(7)); asm.beq(rel(wrap));
    asm.inc(abs(scroller.fineAddress));
    asm.jmp(abs(moved));
    asm.label(wrap);
    asm.dec(abs(scroller.cameraAddress));
    asm.jsr(abs(`runtime_map_scroll_shift_right_${scroller.info.id}`));
    emitStoreImmediate(asm, scroller.fineAddress, 0);
    asm.label(moved);
    emitEntityWordStep(asm, scroller.cameraPixelXAddress, -1, `map_scroll_pixel_x_dec_${id}`);
  }
  asm.label(done);
}

function emitMapHorizontalScrollerMove(asm, compileState, ref, delta) {
  const scroller = requireHorizontalScroller(compileState, ref);
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 8) {
    throw new Error("horizontal scroll movement must be between 1 and 8 pixels");
  }
  for (let pixel = 0; pixel < Math.abs(delta); pixel += 1) {
    emitMapHorizontalScrollerSingleStep(asm, compileState, scroller, Math.sign(delta));
  }
}

function emitMapVerticalScrollerSingleStep(asm, compileState, scroller, direction) {
  if (scroller.maxY > 0) {
    const safe = direction > 0 ? scroller.verticalTiming?.upFitsPal : scroller.verticalTiming?.downFitsPal;
    if (!safe) {
      const movement = direction > 0 ? "down" : "up";
      throw new Error(`vertical scroll ${movement} exceeds the PAL raster budget for this viewport; reduce its width/height until the map-scroll report marks this direction safe`);
    }
  }
  const id = compileState.loopCounter++;
  const canMove = `map_scroll_y_can_move_${id}`;
  const wrap = `map_scroll_y_wrap_${id}`;
  const moved = `map_scroll_y_moved_${id}`;
  const done = `map_scroll_y_done_${id}`;
  if (direction > 0) {
    asm.lda(abs(scroller.cameraYAddress)); asm.cmp(imm(scroller.maxY)); asm.beq(rel(done));
    asm.label(canMove);
    asm.lda(abs(scroller.fineYAddress)); asm.beq(rel(wrap));
    asm.dec(abs(scroller.fineYAddress));
    asm.jmp(abs(moved));
    asm.label(wrap);
    asm.inc(abs(scroller.cameraYAddress));
    asm.jsr(abs(`runtime_map_scroll_shift_up_${scroller.info.id}`));
    emitStoreImmediate(asm, scroller.fineYAddress, 7);
    asm.label(moved);
    emitEntityWordStep(asm, scroller.cameraPixelYAddress, 1, `map_scroll_pixel_y_inc_${id}`);
  } else {
    asm.lda(abs(scroller.cameraYAddress)); asm.bne(rel(canMove));
    asm.lda(abs(scroller.fineYAddress)); asm.cmp(imm(7)); asm.beq(rel(done));
    asm.label(canMove);
    asm.lda(abs(scroller.fineYAddress)); asm.cmp(imm(7)); asm.beq(rel(wrap));
    asm.inc(abs(scroller.fineYAddress));
    asm.jmp(abs(moved));
    asm.label(wrap);
    asm.dec(abs(scroller.cameraYAddress));
    asm.jsr(abs(`runtime_map_scroll_shift_down_${scroller.info.id}`));
    emitStoreImmediate(asm, scroller.fineYAddress, 0);
    asm.label(moved);
    emitEntityWordStep(asm, scroller.cameraPixelYAddress, -1, `map_scroll_pixel_y_dec_${id}`);
  }
  asm.label(done);
}

function emitMapVerticalScrollerMove(asm, compileState, ref, delta) {
  const scroller = requireHorizontalScroller(compileState, ref);
  if (scroller.panel !== "bottom") {
    throw new Error("vertical fine scrolling currently requires panel: \"bottom\"; a fixed top character panel needs FLD/badline compensation");
  }
  scroller.verticalUsed = true;
  if (!Number.isInteger(delta) || delta === 0 || Math.abs(delta) > 8) {
    throw new Error("vertical scroll movement must be between 1 and 8 pixels");
  }
  for (let pixel = 0; pixel < Math.abs(delta); pixel += 1) {
    emitMapVerticalScrollerSingleStep(asm, compileState, scroller, Math.sign(delta));
  }
}

function emitWordGreaterChoice(asm, leftAddress, rightAddress, trueLabel, falseLabel, prefix) {
  asm.lda(abs(leftAddress + 1));
  asm.cmp(abs(rightAddress + 1));
  asm.beq(rel(`${prefix}_high_equal`));
  asm.bcc(rel(`${prefix}_false`));
  asm.jmp(abs(trueLabel));
  asm.label(`${prefix}_high_equal`);
  asm.lda(abs(leftAddress));
  asm.cmp(abs(rightAddress));
  asm.beq(rel(`${prefix}_false`));
  asm.bcc(rel(`${prefix}_false`));
  asm.jmp(abs(trueLabel));
  asm.label(`${prefix}_false`);
  asm.jmp(abs(falseLabel));
}

function normalizedCameraFollowOptions(scroller, entity, options) {
  const axis = options.axis;
  if (!["x", "y", "both"].includes(axis)) throw new Error("camera follow axis must be x, y or both");
  if (!Number.isInteger(options.maxSpeed) || options.maxSpeed < 1 || options.maxSpeed > 8) {
    throw new Error("camera follow maxSpeed must be between 1 and 8 pixels per frame");
  }
  if (!Number.isInteger(options.offsetX) || !Number.isInteger(options.offsetY)) throw new Error("camera follow offsets must be integers");
  const viewportWidth = scroller.viewport.screenWidth * 8;
  const viewportHeight = scroller.viewport.screenHeight * 8;
  const deadZone = options.deadZone ?? {
    x: Math.floor(viewportWidth * 3 / 8),
    y: Math.floor(viewportHeight * 3 / 8),
    width: Math.max(1, Math.floor(viewportWidth / 4)),
    height: Math.max(1, Math.floor(viewportHeight / 4))
  };
  if (!deadZone || !Number.isInteger(deadZone.x) || !Number.isInteger(deadZone.y)
    || !Number.isInteger(deadZone.width) || !Number.isInteger(deadZone.height)
    || deadZone.x < 0 || deadZone.y < 0 || deadZone.width < 1 || deadZone.height < 1
    || deadZone.x + deadZone.width > viewportWidth || deadZone.y + deadZone.height > viewportHeight) {
    throw new Error("camera follow deadZone must fit inside the scrolling viewport in pixels");
  }
  const anchorX = entity.hitbox.offsetX + Math.floor(entity.hitbox.width / 2) + options.offsetX;
  const anchorY = entity.hitbox.offsetY + Math.floor(entity.hitbox.height / 2) + options.offsetY;
  if (anchorX < 0 || anchorX > 255 || anchorY < 0 || anchorY > 255) {
    throw new Error("camera follow offset places the entity anchor outside its 0..255 pixel local range");
  }
  return { ...options, axis, deadZone, viewportWidth, viewportHeight, anchorX, anchorY,
    ...normalizeProjectionMargin(options.cullingMargin ?? 0) };
}

function normalizeProjectionMargin(rawMargin) {
  const marginX = typeof rawMargin === "number" ? rawMargin : rawMargin?.x ?? 0;
  const marginY = typeof rawMargin === "number" ? rawMargin : rawMargin?.y ?? 0;
  if (!Number.isInteger(marginX) || !Number.isInteger(marginY)
    || marginX < 0 || marginY < 0 || marginX > 64 || marginY > 64) {
    throw new Error("entity cullingMargin must be 0..64 or { x: 0..64, y: 0..64 }");
  }
  return { marginX, marginY };
}

function emitCameraFollowAxis(asm, compileState, scroller, entity, options, axis) {
  const worldAddress = axis === "x" ? entity.worldX.address : entity.worldY.address;
  const cameraAddress = axis === "x" ? scroller.cameraPixelXAddress : scroller.cameraPixelYAddress;
  const anchor = axis === "x" ? options.anchorX : options.anchorY;
  const deadStart = axis === "x" ? options.deadZone.x : options.deadZone.y;
  const deadSize = axis === "x" ? options.deadZone.width : options.deadZone.height;
  for (let step = 0; step < options.maxSpeed; step += 1) {
    const prefix = `map_camera_follow_${axis}_${scroller.ref.id}_${entity.id}_${compileState.loopCounter++}_${step}`;
    const checkLeft = `${prefix}_check_negative`;
    const movePositive = `${prefix}_move_positive`;
    const moveNegative = `${prefix}_move_negative`;
    const done = `${prefix}_done`;
    emitEntityPointCoordinate(asm, worldAddress, anchor, MAP_ENTITY_PIXEL_X_LO);
    emitWordPlusImmediateTo(asm, cameraAddress, deadStart + deadSize - 1, MAP_CONVERT_RESULT_LO);
    emitWordGreaterChoice(asm, MAP_ENTITY_PIXEL_X_LO, MAP_CONVERT_RESULT_LO, movePositive, checkLeft, `${prefix}_positive_compare`);
    asm.label(checkLeft);
    emitWordPlusImmediateTo(asm, cameraAddress, deadStart, MAP_CONVERT_RESULT_LO);
    emitWordGreaterChoice(asm, MAP_CONVERT_RESULT_LO, MAP_ENTITY_PIXEL_X_LO, moveNegative, done, `${prefix}_negative_compare`);
    asm.label(movePositive);
    if (axis === "x") emitMapHorizontalScrollerSingleStep(asm, compileState, scroller, 1);
    else emitMapVerticalScrollerSingleStep(asm, compileState, scroller, 1);
    asm.jmp(abs(done));
    asm.label(moveNegative);
    if (axis === "x") emitMapHorizontalScrollerSingleStep(asm, compileState, scroller, -1);
    else emitMapVerticalScrollerSingleStep(asm, compileState, scroller, -1);
    asm.label(done);
  }
}

function emitMapScrollerProjectEntity(asm, compileState, ref, entity, projectionOptions = {}) {
  const scroller = requireHorizontalScroller(compileState, ref);
  const registered = resolveMapEntity(compileState, entity);
  if (mapAssetKey(registered.asset) !== scroller.info.key) throw new Error("camera and projected entity must use the same map asset");
  emitMapEntityProject(asm, compileState, entity, {
    cameraX: scroller.cameraPixelXRef,
    cameraY: scroller.cameraPixelYRef,
    // XSCROLL starts at seven: keep sprites and character cells on the exact
    // same world-pixel origin throughout all eight fine-scroll phases.
    screenOffsetX: 24 + scroller.viewport.x * 8 + MAP_SCROLL_FINE_X_ORIGIN,
    screenOffsetY: 50 + scroller.viewport.y * 8
      + (scroller.verticalUsed ? MAP_SCROLL_FINE_Y_ORIGIN : 0),
    viewportWidth: scroller.viewport.screenWidth * 8,
    viewportHeight: scroller.viewport.screenHeight * 8,
    ...normalizeProjectionMargin(projectionOptions.cullingMargin ?? 0)
  });
}

function emitMapScrollerFollow(asm, compileState, ref, entity, rawOptions) {
  const scroller = requireHorizontalScroller(compileState, ref);
  const registered = resolveMapEntity(compileState, entity);
  if (mapAssetKey(registered.asset) !== scroller.info.key) throw new Error("camera and followed entity must use the same map asset");
  if (scroller.followEntityId !== null && scroller.followEntityId !== entity.id) throw new Error("one scroller can follow only one entity");
  const options = normalizedCameraFollowOptions(scroller, registered, rawOptions);
  if ((options.axis === "y" || options.axis === "both") && scroller.panel !== "bottom") {
    throw new Error("vertical camera follow currently requires panel: \"bottom\"");
  }
  scroller.followEntityId = entity.id;
  if (options.axis === "x" || options.axis === "both") emitCameraFollowAxis(asm, compileState, scroller, registered, options, "x");
  if (options.axis === "y" || options.axis === "both") {
    scroller.verticalUsed = true;
    emitCameraFollowAxis(asm, compileState, scroller, registered, options, "y");
  }
  if (options.project) emitMapScrollerProjectEntity(asm, compileState, ref, entity, options);
  if (!scroller.followReported) {
    compileState.assets.report.push({
      type: "map-camera-follow",
      sourcePath: registered.asset.sourcePath,
      entity: registered.object.id,
      axis: options.axis,
      deadZone: { ...options.deadZone },
      maxSpeed: options.maxSpeed,
      coordinateBits: 16,
      clampToMap: true
    });
    scroller.followReported = true;
  }
}

function emitMapDraw(asm, compileState, asset, options) {
  const info = requireDynamicMap(compileState, asset);
  const draw = configureMapDraw(compileState, info, options);
  asm.jsr(abs(`runtime_map_redraw_${info.id}`));
  if (!info.reportedDraw) {
    compileState.assets.report.push({ type: "map", sourcePath: asset.sourcePath, mapWidth: asset.map.width, mapHeight: asset.map.height, screenWidth: draw.width, screenHeight: draw.height, tileCount: asset.tiles.length, bytes: asset.map.data.length, objects: asset.map.objects?.length ?? 0, charsetMode: asset.charset.mode });
    info.reportedDraw = true;
  }
}

function emitMapRedraw(asm, compileState, asset) {
  const info = requireDynamicMap(compileState, asset);
  info.rendererNeeded = true;
  asm.jsr(abs(`runtime_map_redraw_${info.id}`));
}

function emitMapRuntimeSet(asm, compileState, asset, x, y, value) {
  const info = requireDynamicMap(compileState, asset);
  const id = compileState.loopCounter++;
  const doneLabel = `map_set_done_${id}`;
  emitMapCoordinatesOrJumpInvalid(asm, compileState, asset, x, y, doneLabel, id);
  emitRuntimeValueToA(asm, compileState, value, "tile value"); asm.cmp(imm(asset.tiles.length)); asm.bcc(rel(`map_value_ok_${id}`)); asm.jmp(abs(doneLabel)); asm.label(`map_value_ok_${id}`); asm.sta(abs(MAP_TEMP_VALUE));
  emitMapIndexToPointer(asm, info, id);
  asm.lda(abs(MAP_TEMP_VALUE)); asm.sta(indy(HIRES_ZP_PTR_LO));
  if (info.fullDrawConfigured) {
    info.rendererNeeded = true;
    asm.jsr(abs(`runtime_map_draw_tile_${info.id}`));
  }
  asm.label(doneLabel);
}

function emitMapRuntimeGet(asm, compileState, asset, x, y, target) {
  const info = requireDynamicMap(compileState, asset);
  const targetAddress = resolveRuntimeByteAddress(compileState, target, "map load target");
  const id = compileState.loopCounter++;
  const doneLabel = `map_get_done_${id}`;
  emitMapCoordinatesOrJumpInvalid(asm, compileState, asset, x, y, doneLabel, id);
  emitMapIndexToPointer(asm, info, id); asm.lda(indy(HIRES_ZP_PTR_LO)); asm.sta(addressMode(targetAddress));
  asm.label(doneLabel);
}

function emitMapCollisionOrJumpFalse(asm, compileState, query, falseLabel, passLabel, id) {
  const asset = query.asset;
  const collision = query.collision;
  if (!asset || asset.type !== "mapAsset") throw new Error("map collision needs a map asset");
  ensureByte(collision, "tile collision value");
  const info = requireDynamicMap(compileState, asset);
  emitMapCoordinatesOrJumpInvalid(asm, compileState, asset, query.x, query.y, falseLabel, id);
  emitMapIndexToPointer(asm, info, id);
  asm.lda(indy(HIRES_ZP_PTR_LO)); asm.tax(); asm.lda(absx(info.collisionLabel)); asm.cmp(imm(collision));
  asm.beq(rel(passLabel)); asm.jmp(abs(falseLabel)); asm.label(passLabel);
}

function emitMapEqualsOrJumpFalse(asm, compileState, query, falseLabel, passLabel, id, negate) {
  const info = requireDynamicMap(compileState, query.asset);
  emitMapCoordinatesOrJumpInvalid(asm, compileState, query.asset, query.x, query.y, falseLabel, id);
  emitMapIndexToPointer(asm, info, id); asm.lda(indy(HIRES_ZP_PTR_LO)); asm.cmp(runtimeValueOperand(compileState, query.value, "tile value"));
  if (negate) asm.bne(rel(passLabel)); else asm.beq(rel(passLabel));
  asm.jmp(abs(falseLabel)); asm.label(passLabel);
}

function resolveMapEntity(compileState, entity) {
  if (!entity || entity.type !== "mapEntityRef") throw new Error("Expected an entity returned by c64.map.spawn()");
  const registered = compileState.assets.entities.get(entity.id);
  if (!registered) throw new Error(`Map entity ${entity.id} must be created before it is projected`);
  return registered;
}

function projectionWordOperand(compileState, value, high, label) {
  if (isVarRef(value)) {
    const variable = resolveRuntimeVariable(compileState, value, label);
    if (variable.size !== 2) throw new Error(`${label} must be a word variable`);
    return addressMode(variable.address + (high ? 1 : 0));
  }
  ensureWord(value, label);
  return imm(high ? ((value >> 8) & 0xff) : (value & 0xff));
}

function emitProjectionDifference(asm, compileState, source, camera, targetAddress, hiddenLabel, label, sourceOffset = 0) {
  const sourceVariable = resolveRuntimeVariable(compileState, source, label);
  if (sourceVariable.size !== 2) throw new Error(`${label} must be stored in a word variable`);
  asm.clc();
  asm.lda(addressMode(sourceVariable.address));
  asm.adc(imm(sourceOffset & 0xff));
  asm.sta(abs(targetAddress));
  asm.lda(addressMode(sourceVariable.address + 1));
  asm.adc(imm((sourceOffset >> 8) & 0xff));
  asm.sta(abs(targetAddress + 1));
  asm.sec();
  asm.lda(abs(targetAddress));
  asm.sbc(projectionWordOperand(compileState, camera, false, `${label} camera`));
  asm.sta(abs(targetAddress));
  asm.lda(abs(targetAddress + 1));
  asm.sbc(projectionWordOperand(compileState, camera, true, `${label} camera`));
  asm.sta(abs(targetAddress + 1));
  asm.bcs(rel(`${label}_not_before_${compileState.loopCounter}`));
  asm.jmp(abs(hiddenLabel));
  asm.label(`${label}_not_before_${compileState.loopCounter++}`);
}

function emitProjectionLimit(asm, targetAddress, limit, hiddenLabel, passLabel) {
  asm.lda(abs(targetAddress + 1));
  asm.cmp(imm((limit >> 8) & 0xff));
  asm.bcc(rel(passLabel));
  asm.bne(rel(`${passLabel}_hidden`));
  asm.lda(abs(targetAddress));
  asm.cmp(imm(limit & 0xff));
  asm.bcc(rel(passLabel));
  asm.label(`${passLabel}_hidden`);
  asm.jmp(abs(hiddenLabel));
  asm.label(passLabel);
}

function emitMapEntityCreate(compileState, entity) {
  if (!entity || entity.type !== "mapEntityRef") throw new Error("c64.map.spawn() produced an invalid entity");
  if (compileState.assets.entities.has(entity.id)) throw new Error(`Map entity ${entity.id} is already created`);
  getSpriteRuntime(compileState, entity.sprite);
  const worldX = resolveRuntimeVariable(compileState, entity.worldX, "entity worldX");
  const worldY = resolveRuntimeVariable(compileState, entity.worldY, "entity worldY");
  if (worldX.size !== 2 || worldY.size !== 2) throw new Error("map entity world coordinates must be word variables");
  const velocityX = resolveRuntimeVariable(compileState, entity.velocityX, "entity velocityX");
  const velocityY = resolveRuntimeVariable(compileState, entity.velocityY, "entity velocityY");
  const onGround = resolveRuntimeVariable(compileState, entity.onGround, "entity onGround");
  const hitCeiling = resolveRuntimeVariable(compileState, entity.hitCeiling, "entity hitCeiling");
  const hitLeft = resolveRuntimeVariable(compileState, entity.hitLeft, "entity hitLeft");
  const hitRight = resolveRuntimeVariable(compileState, entity.hitRight, "entity hitRight");
  const enabled = resolveRuntimeVariable(compileState, entity.enabled, "entity enabled");
  const onDanger = resolveRuntimeVariable(compileState, entity.onDanger, "entity onDanger");
  const onLadder = resolveRuntimeVariable(compileState, entity.onLadder, "entity onLadder");
  const atExit = resolveRuntimeVariable(compileState, entity.atExit, "entity atExit");
  if ([velocityX, velocityY, onGround, hitCeiling, hitLeft, hitRight, enabled, onDanger, onLadder, atExit].some((variable) => variable.size !== 1)) {
    throw new Error("map entity velocity and contact states must be byte variables");
  }
  const hitbox = entity.hitbox;
  if (!hitbox || !Number.isInteger(hitbox.offsetX) || !Number.isInteger(hitbox.offsetY)
    || !Number.isInteger(hitbox.width) || !Number.isInteger(hitbox.height)
    || hitbox.offsetX < 0 || hitbox.offsetY < 0 || hitbox.width < 1 || hitbox.height < 1
    || hitbox.offsetX + hitbox.width > 255 || hitbox.offsetY + hitbox.height > 255) {
    throw new Error("map entity hitbox needs non-negative offsets and a positive size fitting in 255 pixels");
  }
  if (!Number.isInteger(entity.maxCollisionSpeed) || entity.maxCollisionSpeed < 1 || entity.maxCollisionSpeed > 16) {
    throw new Error("map entity maxCollisionSpeed must be between 1 and 16 pixels per frame");
  }
  const info = requireDynamicMap(compileState, entity.asset);
  const behaviorSignature = JSON.stringify(entity.collisionBehaviors ?? null);
  if (info.collisionBehaviorSignature !== undefined && info.collisionBehaviorSignature !== behaviorSignature) {
    throw new Error(`${entity.asset.sourcePath}: map entities must share the same collisionBehaviors table`);
  }
  info.collisionBehaviorSignature = behaviorSignature;
  info.collisionBehaviors = entity.collisionBehaviors;
  const registered = { ...entity, worldX, worldY, velocityX, velocityY, onGround, hitCeiling, hitLeft, hitRight, enabled,
    onDanger, onLadder, atExit, collisionNeeded: false, report: null };
  compileState.assets.entities.set(entity.id, registered);
  registered.report = {
    type: "map-entity",
    id: entity.object.id,
    objectType: entity.object.type,
    sprite: entity.sprite.index,
    worldX: entity.object.worldX,
    worldY: entity.object.worldY,
    spriteAsset: entity.spriteAsset?.id ?? null,
    initialAnimation: entity.initialAnimation,
    coordinateBits: 16,
    hitbox: { ...entity.hitbox },
    maxCollisionSpeed: entity.maxCollisionSpeed,
    collisionBehaviors: entity.collisionBehaviors,
    collisionStrategy: "none"
  };
  compileState.assets.report.push(registered.report);
}

function emitMapEntityProject(asm, compileState, entity, options) {
  const registered = resolveMapEntity(compileState, entity);
  const spriteRuntime = getSpriteRuntime(compileState, entity.sprite);
  const spriteVariables = spriteRefVariables(compileState, entity.sprite);
  const viewportWidth = options.viewportWidth;
  const viewportHeight = options.viewportHeight;
  const screenOffsetX = options.screenOffsetX;
  const screenOffsetY = options.screenOffsetY;
  const { marginX, marginY } = normalizeProjectionMargin(
    options.marginX === undefined ? (options.cullingMargin ?? 0) : { x: options.marginX, y: options.marginY }
  );
  if (!Number.isInteger(viewportWidth) || viewportWidth < 1 || viewportWidth > 512) throw new Error("entity viewportWidth must be between 1 and 512 pixels");
  if (!Number.isInteger(viewportHeight) || viewportHeight < 1 || viewportHeight > 256) throw new Error("entity viewportHeight must be between 1 and 256 pixels");
  if (!Number.isInteger(screenOffsetX) || screenOffsetX < 0 || screenOffsetX + viewportWidth > 512) throw new Error("entity screenOffsetX plus viewportWidth must fit in the VIC-II 9-bit X range");
  if (!Number.isInteger(screenOffsetY) || screenOffsetY < 0 || screenOffsetY + viewportHeight > 256) throw new Error("entity screenOffsetY plus viewportHeight must fit in the VIC-II Y byte");
  if (screenOffsetX < marginX || screenOffsetX + viewportWidth + marginX > 512) throw new Error("entity horizontal culling margin must fit in the VIC-II 9-bit X range");
  if (screenOffsetY < marginY || screenOffsetY + viewportHeight + marginY > 256) throw new Error("entity vertical culling margin must fit in the VIC-II Y byte");
  const id = compileState.loopCounter++;
  const hiddenLabel = `map_entity_hidden_${entity.id}_${id}`;
  const shownLabel = `map_entity_shown_${entity.id}_${id}`;
  const doneLabel = `map_entity_project_done_${entity.id}_${id}`;
  const relativeX = MAP_CONVERT_RESULT_LO;
  const relativeY = MAP_CONVERT_LO;
  asm.lda(addressMode(registered.enabled.address));
  asm.bne(rel(`map_entity_enabled_${entity.id}_${id}`));
  asm.jmp(abs(hiddenLabel));
  asm.label(`map_entity_enabled_${entity.id}_${id}`);
  emitProjectionDifference(asm, compileState, entity.worldX, options.cameraX, relativeX, hiddenLabel, `map_entity_x_${id}`, marginX);
  emitProjectionLimit(asm, relativeX, viewportWidth + marginX * 2, hiddenLabel, `map_entity_x_visible_${id}`);
  emitProjectionDifference(asm, compileState, entity.worldY, options.cameraY, relativeY, hiddenLabel, `map_entity_y_${id}`, marginY);
  emitProjectionLimit(asm, relativeY, viewportHeight + marginY * 2, hiddenLabel, `map_entity_y_visible_${id}`);
  asm.clc(); asm.lda(abs(relativeX)); asm.adc(imm((screenOffsetX - marginX) & 0xff)); asm.sta(addressMode(spriteVariables.x.address));
  asm.lda(abs(relativeX + 1)); asm.adc(imm(((screenOffsetX - marginX) >> 8) & 0xff)); asm.sta(addressMode(spriteVariables.x.address + 1));
  asm.clc(); asm.lda(abs(relativeY)); asm.adc(imm(screenOffsetY - marginY)); asm.sta(addressMode(spriteVariables.y.address));
  emitStoreImmediate(asm, spriteVariables.active.address, 1);
  asm.jmp(abs(shownLabel));
  asm.label(hiddenLabel);
  emitStoreImmediate(asm, spriteVariables.active.address, 0);
  asm.label(shownLabel);
  emitSpriteRuntimeSync(asm, compileState, entity.sprite, spriteRuntime);
  asm.label(doneLabel);
  registered.report.cullingMargin = { x: marginX, y: marginY };
}

function emitMapEntityMoveAndCollide(asm, compileState, entity) {
  const registered = resolveMapEntity(compileState, entity);
  const info = requireDynamicMap(compileState, entity.asset);
  registered.collisionNeeded = true;
  registered.report.collisionStrategy = "axis-separated-pixel-step";
  registered.report.solidRule = "collision != 0";
  info.entityCollisionNeeded = true;
  asm.jsr(abs(`runtime_map_entity_move_${entity.id}`));
  // Map entities own their named animation state. Advancing it alongside the
  // bounded movement keeps player code compact and avoids a second update API
  // call in the usual gameplay loop.
  emitSpriteAnimationUpdate(asm, compileState, entity.sprite, getSpriteRuntime(compileState, entity.sprite));
}

function entityEdgeSampleOffsets(length, tilePixels) {
  const last = length - 1;
  const offsets = [0];
  for (let offset = tilePixels; offset < last; offset += tilePixels) offsets.push(offset);
  if (last > 0 && offsets.at(-1) !== last) offsets.push(last);
  return offsets;
}

function emitEntityWordStep(asm, address, direction, label) {
  if (direction > 0) {
    asm.inc(addressMode(address));
    asm.bne(rel(`${label}_done`));
    asm.inc(addressMode(address + 1));
    asm.label(`${label}_done`);
    return;
  }
  asm.lda(addressMode(address));
  asm.bne(rel(`${label}_low`));
  asm.dec(addressMode(address + 1));
  asm.label(`${label}_low`);
  asm.dec(addressMode(address));
}

function emitEntityPointCoordinate(asm, sourceAddress, offset, targetAddress) {
  asm.clc();
  asm.lda(addressMode(sourceAddress));
  asm.adc(imm(offset & 0xff));
  asm.sta(abs(targetAddress));
  asm.lda(addressMode(sourceAddress + 1));
  asm.adc(imm((offset >> 8) & 0xff));
  asm.sta(abs(targetAddress + 1));
}

function emitEntityCollisionJump(asm, info, collisionLabel, nextLabel) {
  asm.jsr(abs(`runtime_map_entity_point_solid_${info.id}`));
  asm.beq(rel(nextLabel));
  asm.jmp(abs(collisionLabel));
  asm.label(nextLabel);
}

function emitEntityVerticalEdgeChecks(asm, registered, info, xOffset, collisionLabel, prefix) {
  const samples = entityEdgeSampleOffsets(registered.hitbox.height, registered.asset.tileHeight * 8);
  emitEntityPointCoordinate(asm, registered.worldX.address, xOffset, MAP_ENTITY_PIXEL_X_LO);
  samples.forEach((sample, index) => {
    emitEntityPointCoordinate(asm, registered.worldY.address, registered.hitbox.offsetY + sample, MAP_ENTITY_PIXEL_Y_LO);
    emitEntityCollisionJump(asm, info, collisionLabel, `${prefix}_sample_${index}_clear`);
  });
}

function emitEntityHorizontalEdgeChecks(asm, registered, info, yOffset, collisionLabel, prefix) {
  const samples = entityEdgeSampleOffsets(registered.hitbox.width, registered.asset.tileWidth * 8);
  emitEntityPointCoordinate(asm, registered.worldY.address, yOffset, MAP_ENTITY_PIXEL_Y_LO);
  samples.forEach((sample, index) => {
    emitEntityPointCoordinate(asm, registered.worldX.address, registered.hitbox.offsetX + sample, MAP_ENTITY_PIXEL_X_LO);
    emitEntityCollisionJump(asm, info, collisionLabel, `${prefix}_sample_${index}_clear`);
  });
}

function emitClampEntityStepCount(asm, velocityAddress, maxSpeed, negative, prefix) {
  asm.lda(addressMode(velocityAddress));
  if (negative) {
    asm.eor(imm(0xff));
    asm.clc();
    asm.adc(imm(1));
  }
  asm.cmp(imm(maxSpeed + 1));
  asm.bcc(rel(`${prefix}_store`));
  asm.lda(imm(maxSpeed));
  asm.label(`${prefix}_store`);
  asm.sta(abs(MAP_ENTITY_STEP_COUNT));
}

function emitMapEntityCollisionRoutine(asm, state, registered) {
  const info = requireDynamicMap(state, registered.asset);
  const id = registered.id;
  const prefix = `runtime_map_entity_${id}`;
  const xDone = `${prefix}_x_done`;
  const yDone = `${prefix}_y_done`;
  asm.comment(`Map entity ${id}: pixel-stepped X/Y tile collision`);
  asm.label(`runtime_map_entity_move_${id}`);
  emitStoreImmediate(asm, registered.onGround.address, 0);
  emitStoreImmediate(asm, registered.hitCeiling.address, 0);
  emitStoreImmediate(asm, registered.hitLeft.address, 0);
  emitStoreImmediate(asm, registered.hitRight.address, 0);
  emitStoreImmediate(asm, registered.onDanger.address, 0);
  emitStoreImmediate(asm, registered.onLadder.address, 0);
  emitStoreImmediate(asm, registered.atExit.address, 0);
  emitStoreImmediate(asm, MAP_ENTITY_COLLISION_MODE, 0);

  asm.lda(addressMode(registered.velocityX.address));
  asm.bne(rel(`${prefix}_x_has_velocity`));
  asm.jmp(abs(xDone));
  asm.label(`${prefix}_x_has_velocity`);
  asm.bpl(rel(`${prefix}_x_positive`));
  asm.jmp(abs(`${prefix}_x_negative`));
  asm.label(`${prefix}_x_positive`);
  emitClampEntityStepCount(asm, registered.velocityX.address, registered.maxCollisionSpeed, false, `${prefix}_x_positive_count`);
  asm.label(`${prefix}_x_positive_loop`);
  emitEntityWordStep(asm, registered.worldX.address, 1, `${prefix}_x_positive_step`);
  emitEntityVerticalEdgeChecks(asm, registered, info, registered.hitbox.offsetX + registered.hitbox.width - 1, `${prefix}_x_positive_hit`, `${prefix}_x_positive`);
  asm.dec(abs(MAP_ENTITY_STEP_COUNT));
  asm.lda(abs(MAP_ENTITY_STEP_COUNT));
  asm.beq(rel(`${prefix}_x_positive_done`));
  asm.jmp(abs(`${prefix}_x_positive_loop`));
  asm.label(`${prefix}_x_positive_done`);
  asm.jmp(abs(xDone));
  asm.label(`${prefix}_x_positive_hit`);
  emitEntityWordStep(asm, registered.worldX.address, -1, `${prefix}_x_positive_undo`);
  emitStoreImmediate(asm, registered.hitRight.address, 1);
  emitStoreImmediate(asm, registered.velocityX.address, 0);
  asm.jmp(abs(xDone));

  asm.label(`${prefix}_x_negative`);
  emitClampEntityStepCount(asm, registered.velocityX.address, registered.maxCollisionSpeed, true, `${prefix}_x_negative_count`);
  asm.label(`${prefix}_x_negative_loop`);
  emitEntityWordStep(asm, registered.worldX.address, -1, `${prefix}_x_negative_step`);
  emitEntityVerticalEdgeChecks(asm, registered, info, registered.hitbox.offsetX, `${prefix}_x_negative_hit`, `${prefix}_x_negative`);
  asm.dec(abs(MAP_ENTITY_STEP_COUNT));
  asm.lda(abs(MAP_ENTITY_STEP_COUNT));
  asm.beq(rel(`${prefix}_x_negative_done`));
  asm.jmp(abs(`${prefix}_x_negative_loop`));
  asm.label(`${prefix}_x_negative_done`);
  asm.jmp(abs(xDone));
  asm.label(`${prefix}_x_negative_hit`);
  emitEntityWordStep(asm, registered.worldX.address, 1, `${prefix}_x_negative_undo`);
  emitStoreImmediate(asm, registered.hitLeft.address, 1);
  emitStoreImmediate(asm, registered.velocityX.address, 0);
  asm.label(xDone);

  asm.lda(addressMode(registered.velocityY.address));
  asm.bne(rel(`${prefix}_y_has_velocity`));
  asm.jmp(abs(yDone));
  asm.label(`${prefix}_y_has_velocity`);
  asm.bpl(rel(`${prefix}_y_positive`));
  asm.jmp(abs(`${prefix}_y_negative`));
  asm.label(`${prefix}_y_positive`);
  emitStoreImmediate(asm, MAP_ENTITY_COLLISION_MODE, 1);
  emitClampEntityStepCount(asm, registered.velocityY.address, registered.maxCollisionSpeed, false, `${prefix}_y_positive_count`);
  asm.label(`${prefix}_y_positive_loop`);
  emitEntityWordStep(asm, registered.worldY.address, 1, `${prefix}_y_positive_step`);
  emitEntityHorizontalEdgeChecks(asm, registered, info, registered.hitbox.offsetY + registered.hitbox.height - 1, `${prefix}_y_positive_hit`, `${prefix}_y_positive`);
  asm.dec(abs(MAP_ENTITY_STEP_COUNT));
  asm.lda(abs(MAP_ENTITY_STEP_COUNT));
  asm.beq(rel(`${prefix}_y_positive_done`));
  asm.jmp(abs(`${prefix}_y_positive_loop`));
  asm.label(`${prefix}_y_positive_done`);
  asm.jmp(abs(yDone));
  asm.label(`${prefix}_y_positive_hit`);
  emitEntityWordStep(asm, registered.worldY.address, -1, `${prefix}_y_positive_undo`);
  emitStoreImmediate(asm, registered.onGround.address, 1);
  emitStoreImmediate(asm, registered.velocityY.address, 0);
  asm.jmp(abs(yDone));

  asm.label(`${prefix}_y_negative`);
  emitStoreImmediate(asm, MAP_ENTITY_COLLISION_MODE, 0);
  emitClampEntityStepCount(asm, registered.velocityY.address, registered.maxCollisionSpeed, true, `${prefix}_y_negative_count`);
  asm.label(`${prefix}_y_negative_loop`);
  emitEntityWordStep(asm, registered.worldY.address, -1, `${prefix}_y_negative_step`);
  emitEntityHorizontalEdgeChecks(asm, registered, info, registered.hitbox.offsetY, `${prefix}_y_negative_hit`, `${prefix}_y_negative`);
  asm.dec(abs(MAP_ENTITY_STEP_COUNT));
  asm.lda(abs(MAP_ENTITY_STEP_COUNT));
  asm.beq(rel(`${prefix}_y_negative_done`));
  asm.jmp(abs(`${prefix}_y_negative_loop`));
  asm.label(`${prefix}_y_negative_done`);
  asm.jmp(abs(yDone));
  asm.label(`${prefix}_y_negative_hit`);
  emitEntityWordStep(asm, registered.worldY.address, 1, `${prefix}_y_negative_undo`);
  emitStoreImmediate(asm, registered.hitCeiling.address, 1);
  emitStoreImmediate(asm, registered.velocityY.address, 0);
  asm.label(yDone);

  // Probe one pixel below the hitbox so onGround remains stable even when the
  // caller supplies no vertical movement during a frame.
  emitStoreImmediate(asm, MAP_ENTITY_COLLISION_MODE, 1);
  emitEntityHorizontalEdgeChecks(asm, registered, info, registered.hitbox.offsetY + registered.hitbox.height, `${prefix}_grounded`, `${prefix}_ground_probe`);
  asm.jmp(abs(`${prefix}_behavior_probe`));
  asm.label(`${prefix}_grounded`);
  emitStoreImmediate(asm, registered.onGround.address, 1);
  asm.label(`${prefix}_behavior_probe`);
  emitEntityBehaviorProbes(asm, registered, info, prefix);
  asm.label(`${prefix}_done`);
  asm.rts();
}

function emitEntityBehaviorValueChecks(asm, registered, info, prefix) {
  const behaviors = info.collisionBehaviors ?? {};
  for (const [valueText, behavior] of Object.entries(behaviors)) {
    const target = behavior === "danger" ? registered.onDanger
      : behavior === "ladder" ? registered.onLadder
        : behavior === "exit" ? registered.atExit : null;
    if (!target) continue;
    const next = `${prefix}_${behavior}_${valueText}_next`;
    asm.cmp(imm(Number(valueText)));
    asm.bne(rel(next));
    emitStoreImmediate(asm, target.address, 1);
    asm.label(next);
  }
}

function emitEntityBehaviorProbes(asm, registered, info, prefix) {
  if (!info.collisionBehaviors) return;
  const x = registered.hitbox.offsetX + Math.floor(registered.hitbox.width / 2);
  const centerY = registered.hitbox.offsetY + Math.floor(registered.hitbox.height / 2);
  const bottomY = registered.hitbox.offsetY + registered.hitbox.height - 1;
  emitEntityPointCoordinate(asm, registered.worldX.address, x, MAP_ENTITY_PIXEL_X_LO);
  emitEntityPointCoordinate(asm, registered.worldY.address, centerY, MAP_ENTITY_PIXEL_Y_LO);
  asm.jsr(abs(`runtime_map_entity_point_value_${info.id}`));
  emitEntityBehaviorValueChecks(asm, registered, info, `${prefix}_center`);
  if (bottomY !== centerY) {
    emitEntityPointCoordinate(asm, registered.worldY.address, bottomY, MAP_ENTITY_PIXEL_Y_LO);
    asm.jsr(abs(`runtime_map_entity_point_value_${info.id}`));
    emitEntityBehaviorValueChecks(asm, registered, info, `${prefix}_bottom`);
  }
}

function emitWordOutsideMapJump(asm, loAddress, limit, outsideLabel, prefix) {
  asm.lda(abs(loAddress + 1));
  asm.cmp(imm((limit >> 8) & 0xff));
  asm.bcc(rel(`${prefix}_inside`));
  asm.bne(rel(`${prefix}_outside`));
  asm.lda(abs(loAddress));
  asm.cmp(imm(limit & 0xff));
  asm.bcc(rel(`${prefix}_inside`));
  asm.label(`${prefix}_outside`);
  asm.jmp(abs(outsideLabel));
  asm.label(`${prefix}_inside`);
}

function emitDivideEntityCoordinate(asm, inputAddress, divisor, outputAddress, prefix) {
  asm.lda(abs(inputAddress)); asm.sta(abs(MAP_CONVERT_LO));
  asm.lda(abs(inputAddress + 1)); asm.sta(abs(MAP_CONVERT_HI));
  if ((divisor & (divisor - 1)) === 0) {
    const shifts = Math.log2(divisor);
    for (let shift = 0; shift < shifts; shift += 1) {
      asm.lsr(abs(MAP_CONVERT_HI));
      asm.ror(abs(MAP_CONVERT_LO));
    }
    asm.lda(abs(MAP_CONVERT_LO));
    asm.sta(abs(outputAddress));
    return;
  }
  emitStoreImmediate(asm, outputAddress, 0);
  asm.label(`${prefix}_loop`);
  asm.lda(abs(MAP_CONVERT_HI)); asm.bne(rel(`${prefix}_subtract`));
  asm.lda(abs(MAP_CONVERT_LO)); asm.cmp(imm(divisor)); asm.bcc(rel(`${prefix}_done`));
  asm.label(`${prefix}_subtract`);
  asm.sec(); asm.lda(abs(MAP_CONVERT_LO)); asm.sbc(imm(divisor)); asm.sta(abs(MAP_CONVERT_LO));
  asm.lda(abs(MAP_CONVERT_HI)); asm.sbc(imm(0)); asm.sta(abs(MAP_CONVERT_HI));
  asm.inc(abs(outputAddress));
  asm.jmp(abs(`${prefix}_loop`));
  asm.label(`${prefix}_done`);
}

function emitMapEntityPointCollisionRoutine(asm, info) {
  const asset = info.asset;
  const prefix = `runtime_map_entity_point_${info.id}`;
  const outsideLabel = `${prefix}_outside`;
  const solidLabel = `${prefix}_solid`;
  asm.comment(`Map ${info.id}: logical collision lookup from 16-bit world pixels`);
  asm.label(`runtime_map_entity_point_value_${info.id}`);
  emitWordOutsideMapJump(asm, MAP_ENTITY_PIXEL_X_LO, asset.map.width * asset.tileWidth * 8, outsideLabel, `${prefix}_x`);
  emitWordOutsideMapJump(asm, MAP_ENTITY_PIXEL_Y_LO, asset.map.height * asset.tileHeight * 8, outsideLabel, `${prefix}_y`);
  emitDivideEntityCoordinate(asm, MAP_ENTITY_PIXEL_X_LO, asset.tileWidth * 8, MAP_TEMP_X, `${prefix}_divide_x`);
  emitDivideEntityCoordinate(asm, MAP_ENTITY_PIXEL_Y_LO, asset.tileHeight * 8, MAP_TEMP_Y, `${prefix}_divide_y`);
  emitMapIndexToPointer(asm, info, `entity_point_${info.id}`);
  asm.lda(indy(HIRES_ZP_PTR_LO));
  asm.tax();
  asm.lda(absx(info.collisionLabel));
  asm.rts();
  asm.label(outsideLabel);
  asm.lda(imm(0xff));
  asm.rts();
  asm.label(`runtime_map_entity_point_solid_${info.id}`);
  asm.jsr(abs(`runtime_map_entity_point_value_${info.id}`));
  asm.cmp(imm(0xff));
  asm.beq(rel(solidLabel));
  if (info.collisionBehaviors) {
    const passableValues = Object.entries(info.collisionBehaviors)
      .filter(([, behavior]) => ["danger", "ladder", "exit", "passable"].includes(behavior))
      .map(([value]) => Number(value));
    // point_value() returns the collision value in A. The preceding CMP #$FF
    // only identifies out-of-map coordinates; compare A explicitly with zero
    // before applying optional named behaviors. Reusing the old Z flag made
    // collision 0 fall through to the solid default.
    asm.cmp(imm(0));
    asm.beq(rel(`${prefix}_clear`));
    for (const value of passableValues) {
      asm.cmp(imm(value));
      asm.beq(rel(`${prefix}_clear`));
    }
    const platformValues = Object.entries(info.collisionBehaviors)
      .filter(([, behavior]) => behavior === "platform")
      .map(([value]) => Number(value));
    for (const value of platformValues) {
      const notPlatform = `${prefix}_not_platform_${value}`;
      asm.cmp(imm(value));
      asm.bne(rel(notPlatform));
      asm.lda(abs(MAP_ENTITY_COLLISION_MODE));
      asm.cmp(imm(1));
      asm.beq(rel(solidLabel));
      asm.jmp(abs(`${prefix}_clear`));
      asm.label(notPlatform);
    }
    asm.jmp(abs(solidLabel));
  } else {
    asm.beq(rel(`${prefix}_clear`));
  }
  asm.label(solidLabel);
  asm.lda(imm(1));
  asm.rts();
  asm.label(`${prefix}_clear`);
  asm.lda(imm(0));
  asm.rts();
}

function emitCoordinateSourceWord(asm, compileState, value, label) {
  if (isVarRef(value)) {
    const variable = resolveRuntimeVariable(compileState, value, label);
    asm.lda(addressMode(variable.address)); asm.sta(abs(MAP_CONVERT_LO));
    if (variable.size === 2) asm.lda(addressMode(variable.address + 1)); else asm.lda(imm(0));
    asm.sta(abs(MAP_CONVERT_HI));
    return;
  }
  ensureWord(value, label);
  emitStoreImmediate(asm, MAP_CONVERT_LO, value & 0xff);
  emitStoreImmediate(asm, MAP_CONVERT_HI, (value >> 8) & 0xff);
}

function emitCoordinateResultStore(asm, compileState, target, label) {
  const variable = resolveRuntimeVariable(compileState, target, label);
  asm.lda(abs(MAP_CONVERT_RESULT_LO)); asm.sta(addressMode(variable.address));
  if (variable.size === 2) {
    asm.lda(abs(MAP_CONVERT_RESULT_HI)); asm.sta(addressMode(variable.address + 1));
  }
}

function emitCoordinateScale(asm, compileState, source, target, numerator, denominator, axisLabel) {
  emitCoordinateSourceWord(asm, compileState, source, `${axisLabel} source`);
  emitStoreImmediate(asm, MAP_CONVERT_RESULT_LO, 0);
  emitStoreImmediate(asm, MAP_CONVERT_RESULT_HI, 0);
  const id = compileState.loopCounter++;
  if (numerator > 1) {
    const loop = `map_convert_multiply_${id}`;
    const done = `map_convert_multiply_done_${id}`;
    asm.label(loop);
    asm.lda(abs(MAP_CONVERT_LO)); asm.ora(abs(MAP_CONVERT_HI)); asm.beq(rel(done));
    asm.clc(); asm.lda(abs(MAP_CONVERT_RESULT_LO)); asm.adc(imm(numerator & 0xff)); asm.sta(abs(MAP_CONVERT_RESULT_LO));
    asm.lda(abs(MAP_CONVERT_RESULT_HI)); asm.adc(imm((numerator >> 8) & 0xff)); asm.sta(abs(MAP_CONVERT_RESULT_HI));
    asm.lda(abs(MAP_CONVERT_LO)); asm.bne(rel(`map_convert_dec_low_${id}`)); asm.dec(abs(MAP_CONVERT_HI));
    asm.label(`map_convert_dec_low_${id}`); asm.dec(abs(MAP_CONVERT_LO)); asm.jmp(abs(loop));
    asm.label(done);
  } else {
    asm.lda(abs(MAP_CONVERT_LO)); asm.sta(abs(MAP_CONVERT_RESULT_LO));
    asm.lda(abs(MAP_CONVERT_HI)); asm.sta(abs(MAP_CONVERT_RESULT_HI));
  }
  if (denominator > 1) {
    // Divide the current 16-bit result by a small map-unit scale using repeated
    // subtraction. C64 screen coordinates keep this bounded and predictable.
    asm.lda(abs(MAP_CONVERT_RESULT_LO)); asm.sta(abs(MAP_CONVERT_LO));
    asm.lda(abs(MAP_CONVERT_RESULT_HI)); asm.sta(abs(MAP_CONVERT_HI));
    emitStoreImmediate(asm, MAP_CONVERT_RESULT_LO, 0);
    emitStoreImmediate(asm, MAP_CONVERT_RESULT_HI, 0);
    const loop = `map_convert_divide_${id}`;
    const subtract = `map_convert_divide_subtract_${id}`;
    const done = `map_convert_divide_done_${id}`;
    asm.label(loop);
    asm.lda(abs(MAP_CONVERT_HI)); asm.bne(rel(subtract));
    asm.lda(abs(MAP_CONVERT_LO)); asm.cmp(imm(denominator)); asm.bcc(rel(done));
    asm.label(subtract);
    asm.sec(); asm.lda(abs(MAP_CONVERT_LO)); asm.sbc(imm(denominator)); asm.sta(abs(MAP_CONVERT_LO));
    asm.lda(abs(MAP_CONVERT_HI)); asm.sbc(imm(0)); asm.sta(abs(MAP_CONVERT_HI));
    asm.inc(abs(MAP_CONVERT_RESULT_LO)); asm.bne(rel(loop)); asm.inc(abs(MAP_CONVERT_RESULT_HI)); asm.jmp(abs(loop));
    asm.label(done);
  }
  emitCoordinateResultStore(asm, compileState, target, `${axisLabel} target`);
}

function emitMapCoordinateConvert(asm, compileState, asset, from, to, sourceX, sourceY, targetX, targetY) {
  const scales = {
    pixel: { x: 1, y: 1 },
    character: { x: 8, y: 8 },
    tile: { x: asset.tileWidth * 8, y: asset.tileHeight * 8 }
  };
  if (!scales[from] || !scales[to]) throw new Error("map coordinate units must be pixel, character or tile");
  const convertAxis = (source, target, axis) => {
    const fromScale = scales[from][axis];
    const toScale = scales[to][axis];
    emitCoordinateScale(asm, compileState, source, target, fromScale, toScale, `${from} to ${to} ${axis}`);
  };
  convertAxis(sourceX, targetX, "x");
  convertAxis(sourceY, targetY, "y");
}

function integerMapCoordinate(value, size, label) {
  if (!Number.isInteger(value) || value < 0 || value >= size) throw new Error(`${label} must be between 0 and ${size - 1}`);
}

function emitAddWordImmediateToZeroPagePointer(asm, pointer, value) {
  asm.clc(); asm.lda(zp(pointer)); asm.adc(imm(value & 0xff)); asm.sta(zp(pointer));
  asm.lda(zp(pointer + 1)); asm.adc(imm((value >> 8) & 0xff)); asm.sta(zp(pointer + 1));
}

function emitMapHorizontalScrollerRoutines(asm, info) {
  const scroller = info.horizontalScroller;
  if (!scroller) return;
  const viewport = scroller.viewport;
  const screenBase = info.draw.screenBase + info.draw.y * 40 + info.draw.x;
  const colorBase = info.draw.colorBase + info.draw.y * 40 + info.draw.x;
  const emitStreamCell = (screenAddress, colorAddress) => {
    asm.ldy(imm(0)); asm.lda(indy(HIRES_ZP_PTR_LO)); asm.tax();
    asm.lda(absx(info.charsLabel)); asm.sta(abs(screenAddress));
    asm.lda(absx(info.colorsLabel));
    if (info.asset.charset.mode === "multicolor") asm.ora(imm(0x08));
    asm.sta(abs(colorAddress));
  };
  const emitShiftCell = (sourceScreen, destinationScreen, sourceColor, destinationColor, indexed = false) => {
    const mode = indexed ? absx : abs;
    asm.lda(mode(sourceScreen)); asm.sta(mode(destinationScreen));
    asm.lda(mode(sourceColor)); asm.sta(mode(destinationColor));
  };
  // Copy two neighboring cells per branch. Besides saving two cycles per cell
  // compared with CPX loops, each row is completed from top to bottom before
  // the raster beam returns on the next frame, avoiding partially recolored
  // character rows during a coarse (8-pixel) step.
  const emitShiftRowLeft = (row) => {
    const count = viewport.screenWidth - 1;
    const rowScreen = screenBase + row * 40;
    const rowColor = colorBase + row * 40;
    let start = 0;
    if ((count & 1) !== 0) {
      emitShiftCell(rowScreen + 1, rowScreen, rowColor + 1, rowColor);
      start = 1;
    }
    const remaining = count - start;
    if (remaining === 0) return;
    const xStart = 256 - remaining;
    const loop = `runtime_map_scroll_left_row_${info.id}_${row}`;
    asm.ldx(imm(xStart));
    asm.label(loop);
    const sourceScreen = rowScreen + start + 1 - xStart;
    const destinationScreen = rowScreen + start - xStart;
    const sourceColor = rowColor + start + 1 - xStart;
    const destinationColor = rowColor + start - xStart;
    emitShiftCell(sourceScreen, destinationScreen, sourceColor, destinationColor, true);
    asm.inx();
    emitShiftCell(sourceScreen, destinationScreen, sourceColor, destinationColor, true);
    asm.inx(); asm.bne(rel(loop));
  };
  const emitShiftRowRight = (row) => {
    const count = viewport.screenWidth - 1;
    const rowScreen = screenBase + row * 40;
    const rowColor = colorBase + row * 40;
    let remaining = count;
    if ((count & 1) !== 0) {
      const position = count - 1;
      emitShiftCell(rowScreen + position, rowScreen + position + 1, rowColor + position, rowColor + position + 1);
      remaining -= 1;
    }
    if (remaining === 0) return;
    const loop = `runtime_map_scroll_right_row_${info.id}_${row}`;
    asm.ldx(imm(remaining - 1));
    asm.label(loop);
    emitShiftCell(rowScreen, rowScreen + 1, rowColor, rowColor + 1, true);
    asm.dex();
    emitShiftCell(rowScreen, rowScreen + 1, rowColor, rowColor + 1, true);
    asm.dex(); asm.bpl(rel(loop));
  };
  const emitShiftRowVertical = (sourceRow, destinationRow, label) => {
    const count = viewport.screenWidth;
    const sourceScreenRow = screenBase + sourceRow * 40;
    const destinationScreenRow = screenBase + destinationRow * 40;
    const sourceColorRow = colorBase + sourceRow * 40;
    const destinationColorRow = colorBase + destinationRow * 40;
    let start = 0;
    if ((count & 1) !== 0) {
      emitShiftCell(sourceScreenRow, destinationScreenRow, sourceColorRow, destinationColorRow);
      start = 1;
    }
    const remaining = count - start;
    if (remaining === 0) return;
    const xStart = 256 - remaining;
    asm.ldx(imm(xStart));
    asm.label(label);
    const sourceScreen = sourceScreenRow + start - xStart;
    const destinationScreen = destinationScreenRow + start - xStart;
    const sourceColor = sourceColorRow + start - xStart;
    const destinationColor = destinationColorRow + start - xStart;
    emitShiftCell(sourceScreen, destinationScreen, sourceColor, destinationColor, true);
    asm.inx();
    emitShiftCell(sourceScreen, destinationScreen, sourceColor, destinationColor, true);
    asm.inx(); asm.bne(rel(label));
  };

  asm.comment(`Map ${info.id}: enter raster-banded fine X/Y viewport`);
  asm.label(`runtime_map_scroll_apply_${info.id}`);
  asm.lda(abs(c64.VIC_CONTROL_2)); asm.and(imm(0xf0)); asm.ora(abs(scroller.fineAddress)); asm.sta(abs(c64.VIC_CONTROL_2));
  if (scroller.verticalUsed) {
    asm.lda(abs(c64.VIC_CONTROL_1)); asm.and(imm(0xf0)); asm.ora(abs(scroller.fineYAddress)); asm.sta(abs(c64.VIC_CONTROL_1));
  }
  asm.rts();

  asm.comment(`Map ${info.id}: cycle-stable VCBASE transition into the fixed panel`);
  asm.label(`runtime_map_scroll_prepare_panel_${info.id}`);
  if (scroller.verticalUsed) {
    const waitFor = (name, rasterLine) => {
      const label = `runtime_map_scroll_wait_${name}_${info.id}`;
      asm.label(label);
      asm.lda(abs(c64.VIC_RASTER)); asm.cmp(imm(rasterLine)); asm.bcc(rel(label));
    };
    waitFor("normalize", scroller.normalizeRasterLine);
    // Force a common final badline. RSEL remains clear (24-row scroll mode),
    // unlike the old OR #$0F sequence which accidentally selected 25 rows.
    asm.lda(abs(scroller.fixedD011Address)); asm.and(imm(0xf0)); asm.ora(imm(0x07)); asm.sta(abs(c64.VIC_CONTROL_1));
    waitFor("blank", scroller.blankRasterLine);
    // All 256 glyphs are empty in this temporary charset, so the unavoidable
    // repeated transition row has the current background color, never black.
    asm.lda(abs(scroller.fixedD018Address)); asm.and(imm(0xf0)); asm.ora(imm(0x0e)); asm.sta(abs(c64.VIC_MEMORY_POINTERS));
    waitFor("den_off", scroller.denOffRasterLine);
    // Prevent the next phase-7 badline while allowing the current character row
    // to reach RC=7 and copy VC into VCBASE.
    asm.lda(abs(scroller.fixedD011Address)); asm.and(imm(0xe0)); asm.ora(imm(0x07)); asm.sta(abs(c64.VIC_CONTROL_1));
    waitFor("panel_y", scroller.panelRasterLine);
    asm.lda(abs(scroller.fixedD011Address)); asm.sta(abs(c64.VIC_CONTROL_1));
    asm.lda(abs(scroller.fixedD018Address)); asm.sta(abs(c64.VIC_MEMORY_POINTERS));
    waitFor("panel_x", scroller.exitRasterLine);
    asm.lda(abs(scroller.fixedD016Address)); asm.sta(abs(c64.VIC_CONTROL_2));
  }
  asm.rts();

  asm.comment(`Map ${info.id}: leave the scroll area with the fixed horizontal phase`);
  asm.label(`runtime_map_scroll_leave_${info.id}`);
  asm.lda(abs(scroller.fixedD016Address)); asm.sta(abs(c64.VIC_CONTROL_2));
  asm.rts();

  asm.comment(`Map ${info.id}: restore both fixed-panel VIC-II phases after a full redraw`);
  asm.label(`runtime_map_scroll_restore_${info.id}`);
  asm.lda(abs(scroller.fixedD016Address)); asm.sta(abs(c64.VIC_CONTROL_2));
  if (scroller.verticalUsed) {
    asm.lda(abs(scroller.fixedD011Address)); asm.sta(abs(c64.VIC_CONTROL_1));
    asm.lda(abs(scroller.fixedD018Address)); asm.sta(abs(c64.VIC_MEMORY_POINTERS));
  }
  asm.rts();

  asm.comment(`Map ${info.id}: shift Screen RAM and Color RAM one character left`);
  asm.label(`runtime_map_scroll_shift_left_${info.id}`);
  asm.lda(abs(scroller.cameraAddress)); asm.clc(); asm.adc(imm(viewport.width - 1)); asm.sta(abs(MAP_TEMP_X));
  asm.lda(abs(scroller.cameraYAddress)); asm.sta(abs(MAP_TEMP_Y));
  emitMapIndexToPointer(asm, info, `scroll_left_stream_${info.id}`);
  for (let row = 0; row < viewport.height; row += 1) {
    emitShiftRowLeft(row);
    emitStreamCell(screenBase + row * 40 + viewport.screenWidth - 1, colorBase + row * 40 + viewport.screenWidth - 1);
    if (row + 1 < viewport.height) emitAddWordImmediateToZeroPagePointer(asm, HIRES_ZP_PTR_LO, info.asset.map.width);
  }
  asm.rts();

  asm.comment(`Map ${info.id}: shift Screen RAM and Color RAM one character right`);
  asm.label(`runtime_map_scroll_shift_right_${info.id}`);
  asm.lda(abs(scroller.cameraAddress)); asm.sta(abs(MAP_TEMP_X));
  asm.lda(abs(scroller.cameraYAddress)); asm.sta(abs(MAP_TEMP_Y));
  emitMapIndexToPointer(asm, info, `scroll_right_stream_${info.id}`);
  for (let row = 0; row < viewport.height; row += 1) {
    emitShiftRowRight(row);
    emitStreamCell(screenBase + row * 40, colorBase + row * 40);
    if (row + 1 < viewport.height) emitAddWordImmediateToZeroPagePointer(asm, HIRES_ZP_PTR_LO, info.asset.map.width);
  }
  asm.rts();

  asm.comment(`Map ${info.id}: shift Screen RAM and Color RAM one character up`);
  asm.label(`runtime_map_scroll_shift_up_${info.id}`);
  for (let row = 0; row < viewport.screenHeight - 1; row += 1) {
    emitShiftRowVertical(row + 1, row, `runtime_map_scroll_up_row_${info.id}_${row}`);
  }
  asm.lda(abs(scroller.cameraYAddress)); asm.clc(); asm.adc(imm(viewport.height - 1)); asm.sta(abs(MAP_TEMP_Y));
  asm.lda(abs(scroller.cameraAddress)); asm.sta(abs(MAP_TEMP_X));
  emitMapIndexToPointer(asm, info, `scroll_up_stream_${info.id}`);
  asm.ldy(imm(0));
  asm.label(`runtime_map_scroll_up_line_${info.id}`);
  asm.lda(indy(HIRES_ZP_PTR_LO)); asm.tax();
  asm.lda(absx(info.charsLabel)); asm.sta(absy(screenBase + (viewport.screenHeight - 1) * 40));
  asm.lda(absx(info.colorsLabel));
  if (info.asset.charset.mode === "multicolor") asm.ora(imm(0x08));
  asm.sta(absy(colorBase + (viewport.screenHeight - 1) * 40));
  asm.iny(); asm.cpy(imm(viewport.width)); asm.bne(rel(`runtime_map_scroll_up_line_${info.id}`));
  asm.rts();

  asm.comment(`Map ${info.id}: shift Screen RAM and Color RAM one character down`);
  asm.label(`runtime_map_scroll_shift_down_${info.id}`);
  for (let row = viewport.screenHeight - 2; row >= 0; row -= 1) {
    emitShiftRowVertical(row, row + 1, `runtime_map_scroll_down_row_${info.id}_${row}`);
  }
  asm.lda(abs(scroller.cameraYAddress)); asm.sta(abs(MAP_TEMP_Y));
  asm.lda(abs(scroller.cameraAddress)); asm.sta(abs(MAP_TEMP_X));
  emitMapIndexToPointer(asm, info, `scroll_down_stream_${info.id}`);
  asm.ldy(imm(0));
  asm.label(`runtime_map_scroll_down_line_${info.id}`);
  asm.lda(indy(HIRES_ZP_PTR_LO)); asm.tax();
  asm.lda(absx(info.charsLabel)); asm.sta(absy(screenBase));
  asm.lda(absx(info.colorsLabel));
  if (info.asset.charset.mode === "multicolor") asm.ora(imm(0x08));
  asm.sta(absy(colorBase));
  asm.iny(); asm.cpy(imm(viewport.width)); asm.bne(rel(`runtime_map_scroll_down_line_${info.id}`));
  asm.rts();
}

function emitMapRendererRoutine(asm, info) {
  const asset = info.asset;
  const tileCells = asset.tileWidth * asset.tileHeight;
  const rendererId = `renderer_${info.id}`;
  asm.comment(`Dynamic map ${info.id}: draw one changed metatile`);
  asm.label(`runtime_map_draw_tile_${info.id}`);
  asm.lda(abs(MAP_TEMP_X)); asm.sta(abs(MAP_SCREEN_TILE_X));
  asm.lda(abs(MAP_TEMP_Y)); asm.sta(abs(MAP_SCREEN_TILE_Y));
  asm.label(`runtime_map_draw_tile_body_${info.id}`);
  emitMapIndexToPointer(asm, info, rendererId);
  asm.lda(indy(HIRES_ZP_PTR_LO)); asm.sta(abs(MAP_TEMP_TILE));

  asm.lda(abs(MAP_TEMP_TILE));
  if ((tileCells & (tileCells - 1)) === 0) {
    for (let shift = tileCells; shift > 1; shift >>= 1) asm.asl(acc());
    asm.sta(abs(MAP_TEMP_TILE_OFFSET));
  } else {
    emitStoreImmediate(asm, MAP_TEMP_TILE_OFFSET, 0);
    asm.sta(abs(MAP_TEMP_ROWS));
    asm.label(`runtime_map_tile_offset_loop_${info.id}`);
    asm.lda(abs(MAP_TEMP_ROWS)); asm.beq(rel(`runtime_map_tile_offset_done_${info.id}`));
    asm.clc(); asm.lda(abs(MAP_TEMP_TILE_OFFSET)); asm.adc(imm(tileCells)); asm.sta(abs(MAP_TEMP_TILE_OFFSET));
    asm.dec(abs(MAP_TEMP_ROWS)); asm.jmp(abs(`runtime_map_tile_offset_loop_${info.id}`));
    asm.label(`runtime_map_tile_offset_done_${info.id}`);
  }

  const screenStart = info.draw.screenBase + info.draw.y * 40 + info.draw.x;
  emitStoreImmediate(asm, HIRES_ZP_PTR_LO, screenStart & 0xff);
  emitStoreImmediate(asm, HIRES_ZP_PTR_HI, (screenStart >> 8) & 0xff);
  asm.lda(abs(MAP_SCREEN_TILE_Y)); asm.sta(abs(MAP_TEMP_ROWS));
  asm.label(`runtime_map_screen_y_loop_${info.id}`);
  asm.lda(abs(MAP_TEMP_ROWS)); asm.beq(rel(`runtime_map_screen_y_done_${info.id}`));
  emitAddWordImmediateToZeroPagePointer(asm, HIRES_ZP_PTR_LO, asset.tileHeight * 40);
  asm.dec(abs(MAP_TEMP_ROWS)); asm.jmp(abs(`runtime_map_screen_y_loop_${info.id}`));
  asm.label(`runtime_map_screen_y_done_${info.id}`);

  if (asset.tileWidth === 1) {
    asm.lda(abs(MAP_SCREEN_TILE_X)); asm.sta(abs(MAP_TEMP_PIXEL_OFFSET));
  } else {
    emitStoreImmediate(asm, MAP_TEMP_PIXEL_OFFSET, 0);
    asm.lda(abs(MAP_SCREEN_TILE_X)); asm.sta(abs(MAP_TEMP_ROWS));
    asm.label(`runtime_map_screen_x_loop_${info.id}`);
    asm.lda(abs(MAP_TEMP_ROWS)); asm.beq(rel(`runtime_map_screen_x_done_${info.id}`));
    asm.clc(); asm.lda(abs(MAP_TEMP_PIXEL_OFFSET)); asm.adc(imm(asset.tileWidth)); asm.sta(abs(MAP_TEMP_PIXEL_OFFSET));
    asm.dec(abs(MAP_TEMP_ROWS)); asm.jmp(abs(`runtime_map_screen_x_loop_${info.id}`));
    asm.label(`runtime_map_screen_x_done_${info.id}`);
  }
  asm.clc(); asm.lda(zp(HIRES_ZP_PTR_LO)); asm.adc(abs(MAP_TEMP_PIXEL_OFFSET)); asm.sta(zp(HIRES_ZP_PTR_LO));
  asm.lda(zp(HIRES_ZP_PTR_HI)); asm.adc(imm(0)); asm.sta(zp(HIRES_ZP_PTR_HI));

  const colorDelta = (info.draw.colorBase - info.draw.screenBase) & 0xffff;
  asm.clc(); asm.lda(zp(HIRES_ZP_PTR_LO)); asm.adc(imm(colorDelta & 0xff)); asm.sta(zp(HIRES_ZP_WORK_LO));
  asm.lda(zp(HIRES_ZP_PTR_HI)); asm.adc(imm((colorDelta >> 8) & 0xff)); asm.sta(zp(HIRES_ZP_WORK_HI));

  for (let cellY = 0; cellY < asset.tileHeight; cellY += 1) {
    for (let cellX = 0; cellX < asset.tileWidth; cellX += 1) {
      const cellOffset = cellY * asset.tileWidth + cellX;
      asm.clc(); asm.lda(abs(MAP_TEMP_TILE_OFFSET)); asm.adc(imm(cellOffset)); asm.tay();
      asm.lda(absy(info.charsLabel)); asm.ldy(imm(cellX)); asm.sta(indy(HIRES_ZP_PTR_LO));
      asm.clc(); asm.lda(abs(MAP_TEMP_TILE_OFFSET)); asm.adc(imm(cellOffset)); asm.tay();
      asm.lda(absy(info.colorsLabel));
      if (asset.charset.mode === "multicolor") asm.ora(imm(0x08));
      asm.ldy(imm(cellX)); asm.sta(indy(HIRES_ZP_WORK_LO));
    }
    if (cellY + 1 < asset.tileHeight) {
      emitAddWordImmediateToZeroPagePointer(asm, HIRES_ZP_PTR_LO, 40);
      emitAddWordImmediateToZeroPagePointer(asm, HIRES_ZP_WORK_LO, 40);
    }
  }
  asm.rts();

  if (info.viewportNeeded) {
    const viewport = info.viewport;
    asm.comment(`Map ${info.id}: bounded coarse viewport ${viewport.width}x${viewport.height}`);
    asm.label(`runtime_map_viewport_${info.id}`);
    emitStoreImmediate(asm, MAP_SCREEN_TILE_Y, 0);
    asm.label(`runtime_map_viewport_row_${info.id}`);
    asm.clc(); asm.lda(abs(MAP_VIEW_SOURCE_Y)); asm.adc(abs(MAP_SCREEN_TILE_Y)); asm.sta(abs(MAP_TEMP_Y));
    emitStoreImmediate(asm, MAP_SCREEN_TILE_X, 0);
    asm.label(`runtime_map_viewport_column_${info.id}`);
    asm.clc(); asm.lda(abs(MAP_VIEW_SOURCE_X)); asm.adc(abs(MAP_SCREEN_TILE_X)); asm.sta(abs(MAP_TEMP_X));
    asm.jsr(abs(`runtime_map_draw_tile_body_${info.id}`));
    asm.inc(abs(MAP_SCREEN_TILE_X)); asm.lda(abs(MAP_SCREEN_TILE_X)); asm.cmp(imm(viewport.width)); asm.bne(rel(`runtime_map_viewport_column_${info.id}`));
    asm.inc(abs(MAP_SCREEN_TILE_Y)); asm.lda(abs(MAP_SCREEN_TILE_Y)); asm.cmp(imm(viewport.height)); asm.bne(rel(`runtime_map_viewport_row_${info.id}`));
    asm.rts();
  }

  emitMapHorizontalScrollerRoutines(asm, info);

  asm.comment(`Dynamic map ${info.id}: redraw visible cells from runtime RAM`);
  asm.label(`runtime_map_redraw_${info.id}`);
  if (!info.fullDrawConfigured && info.viewportNeeded) {
    asm.jmp(abs(`runtime_map_viewport_${info.id}`));
    return;
  }
  emitStoreImmediate(asm, MAP_TEMP_Y, 0);
  asm.label(`runtime_map_redraw_row_${info.id}`);
  emitStoreImmediate(asm, MAP_TEMP_X, 0);
  asm.label(`runtime_map_redraw_column_${info.id}`);
  asm.jsr(abs(`runtime_map_draw_tile_${info.id}`));
  asm.inc(abs(MAP_TEMP_X)); asm.lda(abs(MAP_TEMP_X)); asm.cmp(imm(asset.map.width)); asm.bne(rel(`runtime_map_redraw_column_${info.id}`));
  asm.inc(abs(MAP_TEMP_Y)); asm.lda(abs(MAP_TEMP_Y)); asm.cmp(imm(asset.map.height)); asm.bne(rel(`runtime_map_redraw_row_${info.id}`));
  asm.rts();
}

function emitMapRoutines(asm, state) {
  for (const entity of state.assets.entities.values()) {
    if (entity.collisionNeeded) emitMapEntityCollisionRoutine(asm, state, entity);
  }
  for (const info of state.assets.mapTables.values()) {
    if (info.activationRoutineNeeded) {
      asm.comment(`Map ${info.id}: restore its embedded cells into runtime RAM`);
      asm.label(`runtime_map_activate_${info.id}`);
      if (state.disk.enabled) {
        emitDiskLoadCall(asm, info.mapDiskAsset);
        asm.lda(abs(DISK_LOAD_ERROR));
        asm.bne(rel(`runtime_map_activate_${info.id}_done`));
        emitDiskLoadCall(asm, info.tablesDiskAsset);
        asm.lda(abs(DISK_LOAD_ERROR));
        asm.bne(rel(`runtime_map_activate_${info.id}_done`));
        emitCharacterRomCopy(asm, state, 0x3000, info.asset.charset);
        if (info.charsetDiskAsset) {
          emitDiskLoadCall(asm, info.charsetDiskAsset);
          asm.lda(abs(DISK_LOAD_ERROR));
          asm.bne(rel(`runtime_map_activate_${info.id}_done`));
        }
        for (const descriptor of info.diskSpriteDependencies.values()) {
          emitDiskLoadCall(asm, descriptor);
          asm.lda(abs(DISK_LOAD_ERROR));
          asm.bne(rel(`runtime_map_activate_${info.id}_done`));
        }
        emitCharsetVicConfiguration(asm, state, info.asset.charset, {}, 0x3000);
        if (info.activationDraw) asm.jsr(abs(`runtime_map_redraw_${info.id}`));
        asm.label(`runtime_map_activate_${info.id}_done`);
      } else {
        emitEmbeddedBytesToRam(asm, state, info.runtimeAddress, info.asset.map.data, "asset_map_initial");
        emitInlineCharsetInstall(asm, state, 0x3000, info.asset.charset);
        emitCharsetVicConfiguration(asm, state, info.asset.charset, {}, 0x3000);
        if (info.activationDraw) asm.jsr(abs(`runtime_map_redraw_${info.id}`));
      }
      asm.rts();
    }
    if (info.entityCollisionNeeded) emitMapEntityPointCollisionRoutine(asm, info);
    if (info.rendererNeeded) {
      if (!info.draw) throw new Error("dynamic map renderer is missing c64.map.draw() screen configuration");
      emitMapRendererRoutine(asm, info);
    }
  }
}

function emitSpriteData(asm, compileState, index, dataSource, explicitAddress) {
  const asset = emitSpriteDataAsset(asm, compileState, index, dataSource, explicitAddress, false);
  emitSpritePointer(asm, index, asset.blockIndex);
}

function getOrCreateSpriteAnimation(compileState, index) {
  let animation = compileState.spriteAnimations[index];
  if (!animation) {
    animation = { x: null, y: null };
    compileState.spriteAnimations[index] = animation;
  }
  return animation;
}

function emitSpriteDynamicXWrite(asm, currentLoAddr, currentHiAddr, spriteIndex) {
  const spriteBitMask = 1 << spriteIndex;
  const clearLabel = `sprite_x_clear_${spriteIndex}_${currentLoAddr}_${currentHiAddr}`;
  const endLabel = `sprite_x_end_${spriteIndex}_${currentLoAddr}_${currentHiAddr}`;

  asm.lda(abs(currentLoAddr));
  asm.sta(abs(spriteXAddress(spriteIndex)));
  asm.lda(abs(c64.VIC_SPRITE_X_MSB));
  asm.and(imm(0xff ^ spriteBitMask));
  asm.sta(abs(c64.VIC_SPRITE_X_MSB));
  asm.lda(abs(currentHiAddr));
  asm.beq(rel(clearLabel));
  asm.lda(abs(c64.VIC_SPRITE_X_MSB));
  asm.ora(imm(spriteBitMask));
  asm.sta(abs(c64.VIC_SPRITE_X_MSB));
  asm.jmp(abs(endLabel));
  asm.label(clearLabel);
  asm.nop();
  asm.label(endLabel);
}

function emitSpriteAnimatorInit(asm, state) {
  for (let index = 0; index < state.spriteAnimations.length; index += 1) {
    const animation = state.spriteAnimations[index];
    if (!animation) {
      continue;
    }

    const base = state.spriteAnimationBase + index * 8;
    const initBytes = new Array(8).fill(0);
    if (animation.x) {
      initBytes[0] = animation.x.current & 0xff;
      initBytes[1] = (animation.x.current >> 8) & 0xff;
      initBytes[2] = animation.x.target & 0xff;
      initBytes[3] = (animation.x.target >> 8) & 0xff;
      initBytes[4] = animation.x.speed;
    }
    if (animation.y) {
      initBytes[5] = animation.y.current;
      initBytes[6] = animation.y.target;
      initBytes[7] = animation.y.speed;
    }
    const label = `sprite_anim_init_${index}_${state.spriteDataCounter++}`;
    registerData(state, label, initBytes);
    emitCopyDataTo(asm, state, base, label, initBytes.length);
  }
}

function spriteRuntimeInternal(index) {
  const base = SPRITE_RUNTIME_BASE + index * SPRITE_RUNTIME_STRIDE;
  return { sequence: base, frame: base + 1, tick: base + 2, playing: base + 3, pointer: base + 4, color: base + 5, flags: base + 6 };
}

const SPRITE_RUNTIME_FLAG_BITS = Object.freeze({ multicolor: 0, expandX: 1, expandY: 2, priority: 3 });

function emitRuntimeSpriteFlag(asm, compileState, spriteRef, flagName, enabled) {
  const bit = SPRITE_RUNTIME_FLAG_BITS[flagName];
  if (bit === undefined) throw new Error(`Unknown runtime sprite flag: ${flagName}`);
  emitSetBitState(asm, spriteRuntimeInternal(spriteRef.index).flags, bit, enabled);
  if (compileState.multiplexer.enabled) return;
  const hardwareRegister = {
    multicolor: c64.VIC_SPRITE_MULTICOLOR,
    expandX: c64.VIC_SPRITE_EXPAND_X,
    expandY: c64.VIC_SPRITE_EXPAND_Y,
    priority: c64.VIC_SPRITE_PRIORITY
  }[flagName];
  emitSetBitState(asm, hardwareRegister, spriteRef.index, enabled);
}

function getSpriteRuntime(compileState, spriteRef) {
  if (!spriteRef || spriteRef.type !== "spriteRef") throw new Error("Expected a sprite created with c64.sprite.create()");
  ensureLogicalSpriteIndex(spriteRef.index);
  const runtime = compileState.spriteRuntime[spriteRef.index];
  if (!runtime) throw new Error(`Sprite ${spriteRef.index} must be created before it is used`);
  return runtime;
}

function spriteRefVariables(compileState, spriteRef) {
  return {
    x: resolveRuntimeVariable(compileState, spriteRef.x, "sprite x"),
    y: resolveRuntimeVariable(compileState, spriteRef.y, "sprite y"),
    vx: resolveRuntimeVariable(compileState, spriteRef.vx, "sprite vx"),
    vy: resolveRuntimeVariable(compileState, spriteRef.vy, "sprite vy"),
    active: resolveRuntimeVariable(compileState, spriteRef.active, "sprite active")
  };
}

function emitNegateByteAt(asm, address) {
  asm.lda(imm(0));
  asm.sec();
  asm.sbc(addressMode(address));
  asm.sta(addressMode(address));
}

function emitSpriteRuntimeSync(asm, compileState, spriteRef) {
  getSpriteRuntime(compileState, spriteRef);
  // In multiplexed mode the logical variables are the canonical display
  // state. The compact raster renderer copies them to the eight VIC-II slots.
  if (compileState.multiplexer.enabled) return;
  const callCount = compileState.optimization.spriteSyncCallCounts.get(spriteRef.index) ?? 1;
  if (compileState.optimization.mode !== "speed" && callCount > 1) {
    compileState.sharedRoutines.spriteSyncIndexes.add(spriteRef.index);
    asm.jsr(abs(`runtime_sprite_sync_${spriteRef.index}`));
    return;
  }
  emitSpriteRuntimeSyncBody(asm, compileState, spriteRef);
}

function emitRuntimeSpritePointer(asm, compileState, spriteRef, source) {
  const internal = spriteRuntimeInternal(spriteRef.index);
  if (typeof source === "number") emitStoreImmediate(asm, internal.pointer, source);
  else { asm.lda(source); asm.sta(abs(internal.pointer)); }
  if (!compileState.multiplexer.enabled) {
    asm.lda(abs(internal.pointer));
    asm.sta(abs(spritePointerAddress(spriteRef.index)));
  }
}

function emitSpriteRuntimeSyncBody(asm, compileState, spriteRef) {
  const vars = spriteRefVariables(compileState, spriteRef);
  const index = spriteRef.index;
  const activeLabel = `sprite_runtime_active_${index}_${compileState.loopCounter++}`;
  const xHighLabel = `sprite_runtime_xhigh_${index}_${compileState.loopCounter++}`;
  const xDoneLabel = `sprite_runtime_xdone_${index}_${compileState.loopCounter++}`;
  const doneLabel = `sprite_runtime_sync_done_${index}_${compileState.loopCounter++}`;
  asm.lda(addressMode(vars.active.address));
  asm.bne(rel(activeLabel));
  emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, index, false);
  asm.jmp(abs(doneLabel));
  asm.label(activeLabel);
  emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, index, true);
  asm.lda(addressMode(vars.x.address));
  asm.sta(abs(spriteXAddress(index)));
  asm.lda(addressMode(vars.x.address + 1));
  asm.and(imm(1));
  asm.bne(rel(xHighLabel));
  emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, false);
  asm.jmp(abs(xDoneLabel));
  asm.label(xHighLabel);
  emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, true);
  asm.label(xDoneLabel);
  asm.lda(addressMode(vars.y.address));
  asm.sta(abs(spriteYAddress(index)));
  asm.label(doneLabel);
}

function emitSharedSpriteSyncRoutines(asm, state) {
  for (const index of [...state.sharedRoutines.spriteSyncIndexes].sort((a, b) => a - b)) {
    const runtime = state.spriteRuntime[index];
    if (!runtime) throw new Error(`Missing runtime state for shared sprite sync ${index}`);
    asm.comment(`Shared VIC-II synchronization for sprite ${index}`);
    asm.label(`runtime_sprite_sync_${index}`);
    emitSpriteRuntimeSyncBody(asm, state, runtime.ref);
    asm.rts();
  }
}

function emitSetWordImmediate(asm, address, value) {
  ensureSpriteX(value, "sprite X bound");
  emitStoreImmediate(asm, address, value & 0xff);
  emitStoreImmediate(asm, address + 1, (value >> 8) & 0xff);
}

function emitClampSpriteBounds(asm, compileState, spriteRef, runtime) {
  const vars = spriteRefVariables(compileState, spriteRef);
  const id = compileState.loopCounter++;
  const xMinOk = `sprite_x_min_ok_${id}`;
  const xMaxOk = `sprite_x_max_ok_${id}`;
  const yMinOk = `sprite_y_min_ok_${id}`;
  const yMaxOk = `sprite_y_max_ok_${id}`;
  const minX = runtime.bounds.minX;
  const maxX = runtime.bounds.maxX;
  // A negative signed velocity can underflow the 16-bit X value to $FFFF.
  // Runtime sprite X is unsigned (0..511), so a set sign bit always means
  // that the sprite crossed its left bound.
  asm.lda(addressMode(vars.x.address + 1)); asm.bmi(rel(`sprite_x_clamp_min_${id}`)); asm.cmp(imm((minX >> 8) & 0xff));
  asm.bcc(rel(`sprite_x_clamp_min_${id}`)); asm.bne(rel(xMinOk));
  asm.lda(addressMode(vars.x.address)); asm.cmp(imm(minX & 0xff)); asm.bcs(rel(xMinOk));
  asm.label(`sprite_x_clamp_min_${id}`);
  emitSetWordImmediate(asm, vars.x.address, minX);
  if (runtime.bounds.bounceX) emitNegateByteAt(asm, vars.vx.address);
  asm.label(xMinOk);
  asm.lda(addressMode(vars.x.address + 1)); asm.cmp(imm((maxX >> 8) & 0xff));
  asm.bcc(rel(xMaxOk)); asm.bne(rel(`sprite_x_clamp_max_${id}`));
  asm.lda(addressMode(vars.x.address)); asm.cmp(imm(maxX & 0xff)); asm.bcc(rel(xMaxOk)); asm.beq(rel(xMaxOk));
  asm.label(`sprite_x_clamp_max_${id}`);
  emitSetWordImmediate(asm, vars.x.address, maxX);
  if (runtime.bounds.bounceX) emitNegateByteAt(asm, vars.vx.address);
  asm.label(xMaxOk);
  asm.lda(addressMode(vars.y.address)); asm.cmp(imm(runtime.bounds.minY)); asm.bcs(rel(yMinOk));
  emitStoreImmediate(asm, vars.y.address, runtime.bounds.minY);
  if (runtime.bounds.bounceY) emitNegateByteAt(asm, vars.vy.address);
  asm.label(yMinOk);
  asm.lda(addressMode(vars.y.address)); asm.cmp(imm(runtime.bounds.maxY)); asm.bcc(rel(yMaxOk)); asm.beq(rel(yMaxOk));
  emitStoreImmediate(asm, vars.y.address, runtime.bounds.maxY);
  if (runtime.bounds.bounceY) emitNegateByteAt(asm, vars.vy.address);
  asm.label(yMaxOk);
}

function emitSpriteRuntimeMovement(asm, compileState, spriteRef, runtime) {
  const vars = spriteRefVariables(compileState, spriteRef);
  const inactiveLabel = `sprite_update_inactive_${spriteRef.index}_${compileState.loopCounter++}`;
  const activeLabel = `sprite_update_active_${spriteRef.index}_${compileState.loopCounter++}`;
  asm.lda(addressMode(vars.active.address));
  asm.bne(rel(activeLabel));
  asm.jmp(abs(inactiveLabel));
  asm.label(activeLabel);
  asm.clc();
  asm.lda(addressMode(vars.x.address));
  asm.adc(addressMode(vars.vx.address));
  asm.sta(addressMode(vars.x.address));
  asm.lda(addressMode(vars.vx.address));
  asm.bpl(rel(`sprite_vx_positive_${compileState.loopCounter}`));
  asm.lda(addressMode(vars.x.address + 1)); asm.adc(imm(0xff)); asm.jmp(abs(`sprite_vx_done_${compileState.loopCounter}`));
  asm.label(`sprite_vx_positive_${compileState.loopCounter}`);
  asm.lda(addressMode(vars.x.address + 1)); asm.adc(imm(0));
  asm.label(`sprite_vx_done_${compileState.loopCounter++}`);
  asm.sta(addressMode(vars.x.address + 1));
  const yPositiveLabel = `sprite_vy_positive_${compileState.loopCounter}`;
  const yStoreLabel = `sprite_vy_store_${compileState.loopCounter}`;
  const yClampMinLabel = `sprite_vy_clamp_min_${compileState.loopCounter}`;
  const yClampMaxLabel = `sprite_vy_clamp_max_${compileState.loopCounter}`;
  const yDoneLabel = `sprite_vy_done_${compileState.loopCounter++}`;
  asm.lda(addressMode(vars.vy.address)); asm.bpl(rel(yPositiveLabel));
  asm.clc(); asm.lda(addressMode(vars.y.address)); asm.adc(addressMode(vars.vy.address)); asm.bcc(rel(yClampMinLabel)); asm.jmp(abs(yStoreLabel));
  asm.label(yPositiveLabel);
  asm.clc(); asm.lda(addressMode(vars.y.address)); asm.adc(addressMode(vars.vy.address)); asm.bcs(rel(yClampMaxLabel));
  asm.label(yStoreLabel); asm.sta(addressMode(vars.y.address)); asm.jmp(abs(yDoneLabel));
  asm.label(yClampMinLabel); emitStoreImmediate(asm, vars.y.address, runtime.bounds.minY);
  if (runtime.bounds.bounceY) emitNegateByteAt(asm, vars.vy.address);
  asm.jmp(abs(yDoneLabel));
  asm.label(yClampMaxLabel); emitStoreImmediate(asm, vars.y.address, runtime.bounds.maxY);
  if (runtime.bounds.bounceY) emitNegateByteAt(asm, vars.vy.address);
  asm.label(yDoneLabel);
  emitClampSpriteBounds(asm, compileState, spriteRef, runtime);
  asm.label(inactiveLabel);
}

function emitSpriteFrames(asm, compileState, frameRef, frames, rawOptions = {}) {
  // Older recorded instructions stored the address directly in args[2].
  const options = typeof rawOptions === "number" ? { address: rawOptions } : (rawOptions ?? {});
  const explicitAddress = options.address;
  const resident = options.resident !== false;
  if (compileState.spriteFrameAssets.has(frameRef.name)) throw new Error(`Sprite frames already defined: ${frameRef.name}`);
  if (frames.length === 0) throw new Error("sprite.frames() needs at least one frame");
  const address = explicitAddress ?? compileState.nextSpriteFrameAddress;
  if (address % 64 !== 0) throw new Error("sprite frame address must be aligned to 64 bytes");
  if (address < 0x2000 || address + frames.length * 64 > 0x4000) throw new Error("sprite frames must fit in VIC bank 0 between $2000 and $3FFF");
  if (compileState.disk.enabled && address + frames.length * 64 > 0x3000) {
    throw new Error("disk sprite frames must fit in the resident/reloadable $2000-$2FFF slot; $3000-$3FFF is reserved for the active level charset and tables");
  }
  const normalizedFrames = frames.map((frame) => {
    if (frame.length > 63) throw new Error("a sprite frame can contain at most 63 bytes");
    return [...frame.map((value) => value & 0xff), ...new Array(63 - frame.length).fill(0), 0];
  });
  let descriptor = null;
  if (compileState.disk.enabled) {
    descriptor = registerDiskAsset(compileState, "sprite", address, normalizedFrames.flat(), frameRef.name);
    if (resident) emitDiskLoadCall(asm, descriptor);
  } else {
    normalizedFrames.forEach((bytes, frameIndex) => {
      const label = `sprite_frames_${frameRef.name}_${frameIndex}`;
      registerData(compileState, label, bytes.slice(0, 63));
      emitCopyDataTo(asm, compileState, address + frameIndex * 64, label, 63);
      emitStoreImmediate(asm, address + frameIndex * 64 + 63, 0);
    });
  }
  compileState.spriteFrameAssets.set(frameRef.name, {
    address,
    count: frames.length,
    firstBlock: address / 64,
    resident,
    diskDescriptor: compileState.disk.enabled ? descriptor : null
  });
  compileState.nextSpriteFrameAddress = Math.max(compileState.nextSpriteFrameAddress, address + frames.length * 64);
}

function emitSpritePlaySequence(asm, compileState, spriteRef, name) {
  const runtime = getSpriteRuntime(compileState, spriteRef);
  const sequence = runtime.sequences.get(name);
  if (!sequence) throw new Error(`Unknown sprite sequence ${name} for sprite ${spriteRef.index}`);
  const internal = spriteRuntimeInternal(spriteRef.index);
  const startLabel = `sprite_play_start_${spriteRef.index}_${sequence.id}_${compileState.loopCounter++}`;
  const doneLabel = `sprite_play_done_${spriteRef.index}_${sequence.id}_${compileState.loopCounter++}`;
  // Calling play() from a joystick branch every frame must not continually
  // rewind an animation that is already running. A stopped/non-looping sequence
  // still restarts normally.
  asm.lda(abs(internal.sequence)); asm.cmp(imm(sequence.id)); asm.bne(rel(startLabel));
  asm.lda(abs(internal.playing)); asm.bne(rel(doneLabel));
  asm.label(startLabel);
  emitStoreImmediate(asm, internal.sequence, sequence.id);
  emitStoreImmediate(asm, internal.frame, 0);
  emitStoreImmediate(asm, internal.tick, 0);
  emitStoreImmediate(asm, internal.playing, 1);
  emitRuntimeSpritePointer(asm, compileState, spriteRef, abs(sequence.tableLabel));
  asm.label(doneLabel);
}

function emitSpriteAnimationUpdate(asm, compileState, spriteRef, runtime) {
  if (runtime.sequences.size === 0) return;
  const internal = spriteRuntimeInternal(spriteRef.index);
  const doneLabel = `sprite_anim_done_${spriteRef.index}_${compileState.loopCounter++}`;
  const activeLabel = `sprite_anim_active_${spriteRef.index}_${compileState.loopCounter++}`;
  asm.lda(abs(internal.playing));
  asm.bne(rel(activeLabel));
  asm.jmp(abs(doneLabel));
  asm.label(activeLabel);
  for (const sequence of runtime.sequences.values()) {
    const nextLabel = `sprite_anim_next_seq_${spriteRef.index}_${sequence.id}_${compileState.loopCounter++}`;
    const advanceLabel = `sprite_anim_advance_${spriteRef.index}_${sequence.id}_${compileState.loopCounter++}`;
    const positionOkLabel = `sprite_anim_pos_ok_${spriteRef.index}_${sequence.id}_${compileState.loopCounter++}`;
    asm.lda(abs(internal.sequence)); asm.cmp(imm(sequence.id)); asm.bne(rel(nextLabel));
    asm.inc(abs(internal.tick)); asm.lda(abs(internal.tick)); asm.cmp(imm(sequence.speed)); asm.bcs(rel(advanceLabel)); asm.jmp(abs(doneLabel));
    asm.label(advanceLabel); emitStoreImmediate(asm, internal.tick, 0); asm.inc(abs(internal.frame));
    asm.lda(abs(internal.frame)); asm.cmp(imm(sequence.length)); asm.bcc(rel(positionOkLabel));
    if (sequence.loop) emitStoreImmediate(asm, internal.frame, 0);
    else { emitStoreImmediate(asm, internal.frame, sequence.length - 1); emitStoreImmediate(asm, internal.playing, 0); }
    asm.label(positionOkLabel);
    asm.ldx(abs(internal.frame));
    emitRuntimeSpritePointer(asm, compileState, spriteRef, absx(sequence.tableLabel));
    asm.jmp(abs(doneLabel));
    asm.label(nextLabel);
  }
  asm.label(doneLabel);
}

function emitWordPlusImmediateTo(asm, sourceAddress, addValue, targetAddress) {
  asm.clc(); asm.lda(addressMode(sourceAddress)); asm.adc(imm(addValue & 0xff)); asm.sta(abs(targetAddress));
  asm.lda(addressMode(sourceAddress + 1)); asm.adc(imm((addValue >> 8) & 0xff)); asm.sta(abs(targetAddress + 1));
}

function emitBytePlusImmediateToWord(asm, sourceAddress, addValue, targetAddress) {
  asm.clc(); asm.lda(addressMode(sourceAddress)); asm.adc(imm(addValue & 0xff)); asm.sta(abs(targetAddress));
  asm.lda(imm(0)); asm.adc(imm((addValue >> 8) & 0xff)); asm.sta(abs(targetAddress + 1));
}

function emitWordGreaterOrJumpFalse(asm, leftAddress, rightAddress, falseLabel, id) {
  const highEqualLabel = `aabb_high_equal_${id}`;
  const passLabel = `aabb_greater_${id}`;
  const lowNotEqualLabel = `aabb_low_not_equal_${id}`;
  asm.lda(abs(leftAddress + 1)); asm.cmp(abs(rightAddress + 1));
  asm.beq(rel(highEqualLabel)); asm.bcs(rel(passLabel)); asm.jmp(abs(falseLabel));
  asm.label(highEqualLabel);
  asm.lda(abs(leftAddress)); asm.cmp(abs(rightAddress));
  asm.bne(rel(lowNotEqualLabel)); asm.jmp(abs(falseLabel));
  asm.label(lowNotEqualLabel); asm.bcs(rel(passLabel)); asm.jmp(abs(falseLabel));
  asm.label(passLabel);
}

function emitSpriteAabbOrJumpFalse(asm, compileState, pair, falseLabel) {
  const a = pair.a;
  const b = pair.b;
  getSpriteRuntime(compileState, a);
  getSpriteRuntime(compileState, b);
  const av = spriteRefVariables(compileState, a);
  const bv = spriteRefVariables(compileState, b);
  const ah = a.hitbox;
  const bh = b.hitbox;
  asm.lda(addressMode(av.active.address));
  const aActiveLabel = `aabb_a_active_${compileState.loopCounter++}`;
  asm.bne(rel(aActiveLabel)); asm.jmp(abs(falseLabel)); asm.label(aActiveLabel);
  asm.lda(addressMode(bv.active.address));
  const bActiveLabel = `aabb_b_active_${compileState.loopCounter++}`;
  asm.bne(rel(bActiveLabel)); asm.jmp(abs(falseLabel)); asm.label(bActiveLabel);
  const aLeft = COLLISION_TEMP_BASE;
  const aRight = COLLISION_TEMP_BASE + 2;
  const bLeft = COLLISION_TEMP_BASE + 4;
  const bRight = COLLISION_TEMP_BASE + 6;
  const aTop = COLLISION_TEMP_BASE + 8;
  const aBottom = COLLISION_TEMP_BASE + 10;
  const bTop = COLLISION_TEMP_BASE + 12;
  const bBottom = COLLISION_TEMP_BASE + 14;
  emitWordPlusImmediateTo(asm, av.x.address, ah.offsetX, aLeft);
  emitWordPlusImmediateTo(asm, av.x.address, ah.offsetX + ah.width, aRight);
  emitWordPlusImmediateTo(asm, bv.x.address, bh.offsetX, bLeft);
  emitWordPlusImmediateTo(asm, bv.x.address, bh.offsetX + bh.width, bRight);
  emitBytePlusImmediateToWord(asm, av.y.address, ah.offsetY, aTop);
  emitBytePlusImmediateToWord(asm, av.y.address, ah.offsetY + ah.height, aBottom);
  emitBytePlusImmediateToWord(asm, bv.y.address, bh.offsetY, bTop);
  emitBytePlusImmediateToWord(asm, bv.y.address, bh.offsetY + bh.height, bBottom);
  if (compileState.optimization.mode !== "speed" && compileState.game.spriteAabbCount > 1) {
    compileState.sharedRoutines.spriteAabbCompare = true;
    const passLabel = `sprite_aabb_pass_${compileState.loopCounter++}`;
    asm.jsr(abs("runtime_sprite_aabb_compare"));
    asm.bne(rel(passLabel));
    asm.jmp(abs(falseLabel));
    asm.label(passLabel);
    return;
  }
  emitWordGreaterOrJumpFalse(asm, aRight, bLeft, falseLabel, compileState.loopCounter++);
  emitWordGreaterOrJumpFalse(asm, bRight, aLeft, falseLabel, compileState.loopCounter++);
  emitWordGreaterOrJumpFalse(asm, aBottom, bTop, falseLabel, compileState.loopCounter++);
  emitWordGreaterOrJumpFalse(asm, bBottom, aTop, falseLabel, compileState.loopCounter++);
}

function emitSharedSpriteAabbCompareRoutine(asm, state) {
  if (!state.sharedRoutines.spriteAabbCompare) return;
  const falseLabel = "runtime_sprite_aabb_false";
  asm.comment("Shared strict AABB bounds comparison");
  asm.label("runtime_sprite_aabb_compare");
  emitWordGreaterOrJumpFalse(asm, COLLISION_TEMP_BASE + 2, COLLISION_TEMP_BASE + 4, falseLabel, "runtime_0");
  emitWordGreaterOrJumpFalse(asm, COLLISION_TEMP_BASE + 6, COLLISION_TEMP_BASE, falseLabel, "runtime_1");
  emitWordGreaterOrJumpFalse(asm, COLLISION_TEMP_BASE + 10, COLLISION_TEMP_BASE + 12, falseLabel, "runtime_2");
  emitWordGreaterOrJumpFalse(asm, COLLISION_TEMP_BASE + 14, COLLISION_TEMP_BASE + 8, falseLabel, "runtime_3");
  asm.lda(imm(1));
  asm.rts();
  asm.label(falseLabel);
  asm.lda(imm(0));
  asm.rts();
}

function emitBalancedSharedRoutines(asm, state) {
  emitSharedSidClickRoutine(asm, state);
  emitSharedSpriteSyncRoutines(asm, state);
  emitSharedSpriteAabbCompareRoutine(asm, state);
  emitSpriteMultiplexerRoutine(asm, state);
}

function emitSpriteMuxRegisterBit(asm, register, logicalAddress, flagBit, label) {
  asm.lda(abs(register)); asm.and(abs(SPRITE_MUX_INVERSE_MASK)); asm.sta(abs(register));
  asm.ldy(abs(SPRITE_MUX_LOGICAL_OFFSET));
  asm.lda(absy(logicalAddress)); asm.and(imm(flagBit)); asm.beq(rel(label));
  asm.lda(abs(register)); asm.ora(abs(SPRITE_MUX_BIT_MASK)); asm.sta(abs(register));
  asm.label(label);
}

function emitSpriteMultiplexerRoutine(asm, state) {
  if (!state.multiplexer.enabled) return;

  asm.comment("Dynamic 16-to-8 sprite multiplexer: sort active sprites by Y");
  asm.label("runtime_sprite_mux_sort");
  emitStoreImmediate(asm, SPRITE_MUX_SORTED_COUNT, 0);
  emitStoreImmediate(asm, SPRITE_MUX_OUTER_OFFSET, 0);
  asm.label("runtime_sprite_mux_sort_outer");
  asm.ldy(abs(SPRITE_MUX_OUTER_OFFSET));
  asm.lda(absy(SPRITE_LOGICAL_STATE_BASE + 5)); asm.beq(rel("runtime_sprite_mux_sort_next"));
  asm.sty(abs(SPRITE_MUX_NEW_OFFSET));
  asm.lda(absy(SPRITE_LOGICAL_STATE_BASE + 2)); asm.sta(abs(SPRITE_MUX_NEW_Y));
  asm.ldx(abs(SPRITE_MUX_SORTED_COUNT));
  asm.label("runtime_sprite_mux_sort_insert");
  asm.cpx(imm(0)); asm.beq(rel("runtime_sprite_mux_sort_place"));
  asm.dex();
  asm.lda(absx(SPRITE_MUX_SORTED_BASE)); asm.tay();
  asm.lda(absy(SPRITE_LOGICAL_STATE_BASE + 2)); asm.cmp(abs(SPRITE_MUX_NEW_Y));
  asm.bcc(rel("runtime_sprite_mux_sort_after")); asm.beq(rel("runtime_sprite_mux_sort_after"));
  asm.lda(absx(SPRITE_MUX_SORTED_BASE)); asm.sta(absx(SPRITE_MUX_SORTED_BASE + 1));
  asm.jmp(abs("runtime_sprite_mux_sort_insert"));
  asm.label("runtime_sprite_mux_sort_after"); asm.inx();
  asm.label("runtime_sprite_mux_sort_place");
  asm.lda(abs(SPRITE_MUX_NEW_OFFSET)); asm.sta(absx(SPRITE_MUX_SORTED_BASE));
  asm.inc(abs(SPRITE_MUX_SORTED_COUNT));
  asm.label("runtime_sprite_mux_sort_next");
  asm.clc(); asm.lda(abs(SPRITE_MUX_OUTER_OFFSET)); asm.adc(imm(SPRITE_LOGICAL_STATE_STRIDE));
  asm.sta(abs(SPRITE_MUX_OUTER_OFFSET)); asm.cmp(imm(SPRITE_LOGICAL_COUNT * SPRITE_LOGICAL_STATE_STRIDE));
  asm.bne(rel("runtime_sprite_mux_sort_outer"));
  asm.rts();

  asm.comment("Copy one logical sprite to one VIC-II hardware channel");
  asm.label("runtime_sprite_mux_draw");
  asm.stx(abs(SPRITE_MUX_HARDWARE_SLOT)); asm.sty(abs(SPRITE_MUX_LOGICAL_OFFSET));
  asm.txa(); asm.asl(acc()); asm.tax();
  asm.lda(absy(SPRITE_LOGICAL_STATE_BASE)); asm.sta(absx(c64.VIC_SPRITE0_X));
  asm.lda(absy(SPRITE_LOGICAL_STATE_BASE + 2)); asm.sta(absx(c64.VIC_SPRITE0_Y));
  asm.ldx(abs(SPRITE_MUX_HARDWARE_SLOT));
  asm.lda(absx("runtime_sprite_mux_bit_masks")); asm.sta(abs(SPRITE_MUX_BIT_MASK));
  asm.lda(absx("runtime_sprite_mux_inverse_masks")); asm.sta(abs(SPRITE_MUX_INVERSE_MASK));
  asm.lda(absy(SPRITE_RUNTIME_BASE + 4)); asm.sta(absx(0x07f8));
  asm.lda(absy(SPRITE_RUNTIME_BASE + 5)); asm.sta(absx(0xd027));
  asm.lda(abs(c64.VIC_SPRITE_ENABLE)); asm.ora(abs(SPRITE_MUX_BIT_MASK)); asm.sta(abs(c64.VIC_SPRITE_ENABLE));
  emitSpriteMuxRegisterBit(asm, c64.VIC_SPRITE_X_MSB, SPRITE_LOGICAL_STATE_BASE + 1, 0x01, "runtime_sprite_mux_x_low");
  emitSpriteMuxRegisterBit(asm, c64.VIC_SPRITE_MULTICOLOR, SPRITE_RUNTIME_BASE + 6, 0x01, "runtime_sprite_mux_no_multicolor");
  emitSpriteMuxRegisterBit(asm, c64.VIC_SPRITE_EXPAND_X, SPRITE_RUNTIME_BASE + 6, 0x02, "runtime_sprite_mux_no_expand_x");
  emitSpriteMuxRegisterBit(asm, c64.VIC_SPRITE_EXPAND_Y, SPRITE_RUNTIME_BASE + 6, 0x04, "runtime_sprite_mux_no_expand_y");
  emitSpriteMuxRegisterBit(asm, c64.VIC_SPRITE_PRIORITY, SPRITE_RUNTIME_BASE + 6, 0x08, "runtime_sprite_mux_no_priority");
  asm.ldx(abs(SPRITE_MUX_HARDWARE_SLOT)); asm.ldy(abs(SPRITE_MUX_LOGICAL_OFFSET));
  asm.lda(absy(SPRITE_RUNTIME_BASE + 6)); asm.and(imm(0x04)); asm.beq(rel("runtime_sprite_mux_normal_height"));
  asm.lda(imm(45)); asm.jmp(abs("runtime_sprite_mux_add_height"));
  asm.label("runtime_sprite_mux_normal_height"); asm.lda(imm(24));
  asm.label("runtime_sprite_mux_add_height"); asm.clc(); asm.adc(absy(SPRITE_LOGICAL_STATE_BASE + 2));
  asm.bcc(rel("runtime_sprite_mux_end_ready")); asm.lda(imm(0xff));
  asm.label("runtime_sprite_mux_end_ready"); asm.sta(absx(SPRITE_MUX_SLOT_END_BASE));
  asm.rts();

  asm.comment("Render the sorted display list and recycle channels after sprite end");
  asm.label("runtime_sprite_mux_render");
  asm.jsr(abs("runtime_sprite_mux_sort"));

  // Raster 256 is already below the visible sprite area. The previous code
  // waited for bit 8 to rise and then fall again, wasting the complete lower
  // border and making debuggers appear parked in a $D011 loop. Program the
  // next frame as soon as the raster enters its high range; if we are already
  // near the top (line < 64), no wait is needed.
  asm.label("runtime_sprite_mux_wait_safe_raster");
  asm.lda(abs(c64.VIC_CONTROL_1)); asm.bmi(rel("runtime_sprite_mux_frame_ready"));
  asm.lda(abs(c64.VIC_RASTER)); asm.cmp(imm(64)); asm.bcc(rel("runtime_sprite_mux_frame_ready"));
  asm.jmp(abs("runtime_sprite_mux_wait_safe_raster"));
  asm.label("runtime_sprite_mux_frame_ready");
  emitStoreImmediate(asm, c64.VIC_SPRITE_ENABLE, 0);
  asm.ldx(imm(0));
  asm.label("runtime_sprite_mux_first_slots");
  asm.cpx(abs(SPRITE_MUX_SORTED_COUNT)); asm.bcs(rel("runtime_sprite_mux_first_done"));
  asm.cpx(imm(8)); asm.beq(rel("runtime_sprite_mux_first_done"));
  asm.lda(absx(SPRITE_MUX_SORTED_BASE)); asm.tay(); asm.jsr(abs("runtime_sprite_mux_draw"));
  asm.inx(); asm.jmp(abs("runtime_sprite_mux_first_slots"));
  asm.label("runtime_sprite_mux_first_done"); asm.stx(abs(SPRITE_MUX_LIST_POSITION));
  asm.cpx(abs(SPRITE_MUX_SORTED_COUNT)); asm.bcs(rel("runtime_sprite_mux_render_done"));

  asm.label("runtime_sprite_mux_schedule_next");
  asm.ldx(abs(SPRITE_MUX_LIST_POSITION)); asm.cpx(abs(SPRITE_MUX_SORTED_COUNT)); asm.bcs(rel("runtime_sprite_mux_render_done"));
  asm.ldx(imm(0)); asm.stx(abs(SPRITE_MUX_HARDWARE_SLOT));
  asm.lda(abs(SPRITE_MUX_SLOT_END_BASE)); asm.sta(abs(SPRITE_MUX_MIN_END));
  asm.inx();
  asm.label("runtime_sprite_mux_find_slot");
  asm.lda(absx(SPRITE_MUX_SLOT_END_BASE)); asm.cmp(abs(SPRITE_MUX_MIN_END)); asm.bcs(rel("runtime_sprite_mux_find_next"));
  asm.sta(abs(SPRITE_MUX_MIN_END)); asm.stx(abs(SPRITE_MUX_HARDWARE_SLOT));
  asm.label("runtime_sprite_mux_find_next"); asm.inx(); asm.cpx(imm(8)); asm.bne(rel("runtime_sprite_mux_find_slot"));
  asm.ldx(abs(SPRITE_MUX_LIST_POSITION)); asm.lda(absx(SPRITE_MUX_SORTED_BASE)); asm.sta(abs(SPRITE_MUX_LOGICAL_OFFSET)); asm.tay();
  asm.lda(absy(SPRITE_LOGICAL_STATE_BASE + 2)); asm.cmp(abs(SPRITE_MUX_MIN_END)); asm.bcc(rel("runtime_sprite_mux_skip_overflow"));
  asm.label("runtime_sprite_mux_wait_release"); asm.lda(abs(c64.VIC_RASTER)); asm.cmp(abs(SPRITE_MUX_MIN_END)); asm.bcc(rel("runtime_sprite_mux_wait_release"));
  asm.ldx(abs(SPRITE_MUX_HARDWARE_SLOT)); asm.ldy(abs(SPRITE_MUX_LOGICAL_OFFSET)); asm.jsr(abs("runtime_sprite_mux_draw"));
  asm.label("runtime_sprite_mux_skip_overflow"); asm.inc(abs(SPRITE_MUX_LIST_POSITION)); asm.jmp(abs("runtime_sprite_mux_schedule_next"));
  asm.label("runtime_sprite_mux_render_done"); asm.rts();
  asm.label("runtime_sprite_mux_bit_masks"); asm.byte(1, 2, 4, 8, 16, 32, 64, 128);
  asm.label("runtime_sprite_mux_inverse_masks"); asm.byte(254, 253, 251, 247, 239, 223, 191, 127);
}

function emitSpriteAnimatorXUpdate(asm, spriteIndex, animation, base, uniqueId) {
  const xEqualLabel = `sprite_x_equal_${uniqueId}`;
  const xCheckLowLabel = `sprite_x_check_low_${uniqueId}`;
  const xIncLabel = `sprite_x_inc_${uniqueId}`;
  const xDecLabel = `sprite_x_dec_${uniqueId}`;
  const xClampHighLabel = `sprite_x_clamp_high_${uniqueId}`;
  const xClampLowLabel = `sprite_x_clamp_low_${uniqueId}`;
  const xWriteLabel = `sprite_x_write_${uniqueId}`;
  const xDoneLabel = `sprite_x_done_${uniqueId}`;

  asm.lda(abs(base + 1));
  asm.cmp(abs(base + 3));
  asm.beq(rel(xCheckLowLabel));
  asm.bcc(rel(xIncLabel));
  asm.jmp(abs(xDecLabel));

  asm.label(xCheckLowLabel);
  asm.lda(abs(base + 0));
  asm.cmp(abs(base + 2));
  asm.beq(rel(xEqualLabel));
  asm.bcc(rel(xIncLabel));
  asm.jmp(abs(xDecLabel));

  asm.label(xEqualLabel);
  asm.jmp(abs(xDoneLabel));

  asm.label(xIncLabel);
  asm.clc();
  asm.lda(abs(base + 0));
  asm.adc(abs(base + 4));
  asm.sta(abs(base + 0));
  asm.lda(abs(base + 1));
  asm.adc(imm(0));
  asm.sta(abs(base + 1));
  asm.lda(abs(base + 1));
  asm.cmp(abs(base + 3));
  asm.bcc(rel(xWriteLabel));
  asm.bne(rel(xClampHighLabel));
  asm.lda(abs(base + 0));
  asm.cmp(abs(base + 2));
  asm.bcc(rel(xWriteLabel));
  asm.label(xClampHighLabel);
  asm.lda(abs(base + 2));
  asm.sta(abs(base + 0));
  asm.lda(abs(base + 3));
  asm.sta(abs(base + 1));
  asm.jmp(abs(xWriteLabel));

  asm.label(xDecLabel);
  asm.sec();
  asm.lda(abs(base + 0));
  asm.sbc(abs(base + 4));
  asm.sta(abs(base + 0));
  asm.lda(abs(base + 1));
  asm.sbc(imm(0));
  asm.sta(abs(base + 1));
  asm.lda(abs(base + 1));
  asm.cmp(abs(base + 3));
  asm.bcc(rel(xClampLowLabel));
  asm.bne(rel(xWriteLabel));
  asm.lda(abs(base + 0));
  asm.cmp(abs(base + 2));
  asm.bcs(rel(xWriteLabel));
  asm.label(xClampLowLabel);
  asm.lda(abs(base + 2));
  asm.sta(abs(base + 0));
  asm.lda(abs(base + 3));
  asm.sta(abs(base + 1));

  asm.label(xWriteLabel);
  emitSpriteDynamicXWrite(asm, base + 0, base + 1, spriteIndex);
  asm.label(xDoneLabel);
  asm.nop();
}

function emitSpriteAnimatorYUpdate(asm, spriteIndex, animation, base, uniqueId) {
  const yEqualLabel = `sprite_y_equal_${uniqueId}`;
  const yIncLabel = `sprite_y_inc_${uniqueId}`;
  const yDecLabel = `sprite_y_dec_${uniqueId}`;
  const yClampHighLabel = `sprite_y_clamp_high_${uniqueId}`;
  const yClampLowLabel = `sprite_y_clamp_low_${uniqueId}`;
  const yWriteLabel = `sprite_y_write_${uniqueId}`;
  const yDoneLabel = `sprite_y_done_${uniqueId}`;

  asm.lda(abs(base + 5));
  asm.cmp(abs(base + 6));
  asm.beq(rel(yEqualLabel));
  asm.bcc(rel(yIncLabel));
  asm.jmp(abs(yDecLabel));

  asm.label(yEqualLabel);
  asm.jmp(abs(yDoneLabel));

  asm.label(yIncLabel);
  asm.clc();
  asm.lda(abs(base + 5));
  asm.adc(abs(base + 7));
  asm.sta(abs(base + 5));
  asm.cmp(abs(base + 6));
  asm.bcc(rel(yWriteLabel));
  asm.label(yClampHighLabel);
  asm.lda(abs(base + 6));
  asm.sta(abs(base + 5));
  asm.jmp(abs(yWriteLabel));

  asm.label(yDecLabel);
  asm.sec();
  asm.lda(abs(base + 5));
  asm.sbc(abs(base + 7));
  asm.sta(abs(base + 5));
  asm.cmp(abs(base + 6));
  asm.bcs(rel(yWriteLabel));
  asm.label(yClampLowLabel);
  asm.lda(abs(base + 6));
  asm.sta(abs(base + 5));

  asm.label(yWriteLabel);
  asm.lda(abs(base + 5));
  asm.sta(abs(spriteYAddress(spriteIndex)));
  asm.label(yDoneLabel);
  asm.nop();
}

function emitSpriteAnimatorRoutine(asm, state) {
  // When sprite animation is requested, we generate a raster IRQ routine that
  // updates sprite coordinates in the background while BASIC remains responsive.
  if (!state.spriteAnimator.installRequested) {
    return;
  }

  asm.comment("Sprite animator IRQ");
  asm.label("sprite_animator_irq");
  emitIrqPrologue(asm);
  emitVicRasterSourceGate(asm, "sprite_animator_vic_raster");

  for (let index = 0; index < state.spriteAnimations.length; index += 1) {
    const animation = state.spriteAnimations[index];
    if (!animation) {
      continue;
    }
    const base = state.spriteAnimationBase + index * 8;
    if (animation.x) {
      emitSpriteAnimatorXUpdate(asm, index, animation.x, base, `${index}_x`);
    }
    if (animation.y) {
      emitSpriteAnimatorYUpdate(asm, index, animation.y, base, `${index}_y`);
    }
  }

  setRasterLine(asm, state.spriteAnimator.line);
  emitIrqExit(asm, false, true);
}

function emitSpriteAnimatorBody(asm, state) {
  for (let index = 0; index < state.spriteAnimations.length; index += 1) {
    const animation = state.spriteAnimations[index];
    if (!animation) {
      continue;
    }
    const base = state.spriteAnimationBase + index * 8;
    if (animation.x) {
      emitSpriteAnimatorXUpdate(asm, index, animation.x, base, `${index}_x`);
    }
    if (animation.y) {
      emitSpriteAnimatorYUpdate(asm, index, animation.y, base, `${index}_y`);
    }
  }
}

function emitSpriteAnimatorInstall(asm, state) {
  if (!state.spriteAnimator.installRequested) {
    return;
  }
  if (state.irq.handlers.length > 0) {
    return;
  }
  if (state.sid.player.installRequested) {
    return;
  }

  const hasAnimations = state.spriteAnimations.some(Boolean);
  if (!hasAnimations) {
    throw new Error("sprite.installAnimator() was called without any configured sprite animations");
  }

  emitSpriteAnimatorInit(asm, state);
  emitInstallRasterIrq(asm, state.spriteAnimator.line, "sprite_animator_irq");
}

function emitCombinedRuntimeInstall(asm, state) {
  const combinedLine = Math.min(state.sid.player.line, state.spriteAnimator.line);
  emitSidPlayerInitState(asm, state);
  emitInstallRasterIrq(asm, combinedLine, "runtime_combo_irq");
}

function emitCombinedRuntimeRoutine(asm, state) {
  const combinedLine = Math.min(state.sid.player.line, state.spriteAnimator.line);

  asm.comment("Combined runtime IRQ");
  asm.label("runtime_combo_irq");
  emitIrqPrologue(asm);
  emitVicRasterSourceGate(asm, "runtime_combo_vic_raster");

  emitSidPlayerBody(asm, state);
  emitSpriteAnimatorBody(asm, state);

  setRasterLine(asm, combinedLine);
  emitIrqExit(asm, false, true);
}

function setRasterLine(asm, line) {
  ensureWord(line, "raster line");
  const low = line & 0xff;
  const highBit = line > 255 ? 0x80 : 0x00;
  asm.lda(imm(low));
  asm.sta(abs(c64.VIC_RASTER));
  asm.lda(abs(c64.VIC_CONTROL_1));
  asm.and(imm(0x7f));
  if (highBit) {
    asm.ora(imm(0x80));
  }
  asm.sta(abs(c64.VIC_CONTROL_1));
}

function emitIrqAck(asm) {
  asm.lda(imm(0x01));
  asm.sta(abs(c64.VIC_IRQ_STATUS));
}

function emitIrqPrologue(asm) {
  asm.pha();
  asm.txa();
  asm.pha();
  asm.tya();
  asm.pha();
}

function emitVicRasterSourceGate(asm, rasterLabel) {
  asm.lda(abs(c64.VIC_IRQ_STATUS));
  asm.and(imm(0x01));
  asm.bne(rel(rasterLabel));
  emitIrqExit(asm, true);
  asm.label(rasterLabel);
  emitIrqAck(asm);
}

function emitIrqExit(asm, chainToKernal, useKernalEpilogue = false) {
  asm.pla();
  asm.tay();
  asm.pla();
  asm.tax();
  asm.pla();

  if (chainToKernal) {
    asm.jmp(abs(c64.KERNAL_IRQ));
  } else if (useKernalEpilogue) {
    asm.jmp(abs(c64.KERNAL_IRQ_EXIT));
  } else {
    asm.rti();
  }
}

function emitInstallRasterIrq(asm, line, vectorLabel) {
  asm.sei();
  asm.lda(imm(0x01));
  asm.sta(abs(c64.VIC_IRQ_ENABLE));
  emitIrqAck(asm);
  setRasterLine(asm, line);
  asm.lda(immLo(vectorLabel));
  asm.sta(abs(c64.IRQ_VECTOR_LO));
  asm.lda(immHi(vectorLabel));
  asm.sta(abs(c64.IRQ_VECTOR_HI));
  asm.cli();
}

function emitIrqInstall(asm, state) {
  const handlers = state.irq.handlers;
  if (handlers.length === 0) {
    throw new Error("c64.irq.install() was called without any raster handlers");
  }

  if (state.irq.disableKernalTimer) {
    asm.sei();
    asm.lda(imm(0x7f));
    asm.sta(abs(c64.CIA1_IRQ_CONTROL));
    asm.sta(abs(c64.CIA2_IRQ_CONTROL));
    asm.lda(abs(c64.CIA1_IRQ_CONTROL));
    asm.lda(abs(c64.CIA2_IRQ_CONTROL));
  }

  asm.lda(imm(0x00));
  asm.sta(abs(c64.IRQ_STATE_INDEX));

  if (state.sid.player.installRequested) {
    emitSidPlayerInitState(asm, state);
  }

  if (state.spriteAnimator.installRequested) {
    const hasAnimations = state.spriteAnimations.some(Boolean);
    if (!hasAnimations) {
      throw new Error("sprite.installAnimator() was called without any configured sprite animations");
    }
    emitSpriteAnimatorInit(asm, state);
  }

  emitInstallRasterIrq(asm, handlers[0].line, "irq_dispatch");
}

function createInstructionCompileState(baseState) {
  return {
    currentTextColor: baseState.currentTextColor,
    screenBase: baseState.screenBase,
    colorBase: baseState.colorBase,
    stringPool: baseState.stringPool,
    dataPool: baseState.dataPool,
    variables: baseState.variables,
    spriteState: baseState.spriteState,
    spriteAnimations: baseState.spriteAnimations,
    spriteRuntime: baseState.spriteRuntime,
    spriteFrameAssets: baseState.spriteFrameAssets,
    spriteDataAssets: baseState.spriteDataAssets,
    sharedRoutines: baseState.sharedRoutines,
    assets: baseState.assets,
    optimization: baseState.optimization,
    multiplexer: baseState.multiplexer,
    nextSpriteFrameAddress: baseState.nextSpriteFrameAddress,
    spriteAnimator: baseState.spriteAnimator,
    spriteAnimationBase: baseState.spriteAnimationBase,
    spriteDataCounter: baseState.spriteDataCounter,
    stringCounter: baseState.stringCounter,
    loopCounter: baseState.loopCounter,
    nextAutoVariableAddress: baseState.nextAutoVariableAddress,
    input: baseState.input,
    game: baseState.game,
    hires: { ...baseState.hires },
    sid: {
      voiceControls: [...baseState.sid.voiceControls],
      filterModeVol: baseState.sid.filterModeVol,
      filterResonanceRoute: baseState.sid.filterResonanceRoute,
      player: {
        installRequested: baseState.sid.player.installRequested,
        line: baseState.sid.player.line,
        song: baseState.sid.player.song,
        sfxVoice: baseState.sid.player.sfxVoice,
        fadeUsed: baseState.sid.player.fadeUsed
      }
    }
  };
}

const MULTIPLEX_CONFLICTING_LEGACY_OPS = new Set([
  "spriteEnable", "spriteDisable", "spriteShow", "spriteHide", "spritePosition", "spriteSetX", "spriteSetY",
  "spriteMoveX", "spriteMoveY", "spriteMoveToX", "spriteMoveToY", "spriteAnimateTo", "spriteStop", "spriteStopX", "spriteStopY",
  "spriteColor", "spriteData", "spritePointer", "spriteMulticolor", "spriteExpandX", "spriteExpandY", "spritePriority", "spriteInstallAnimator"
]);

function collectBalancedOptimizationStats(instructionGroups) {
  const stats = {
    sidClickCount: 0,
    sidEffectCount: 0,
    sidFadeCount: 0,
    spriteSyncCallCounts: new Map(),
    usesSpriteMultiplexer: false,
    usesLegacySpriteApi: false,
    usesVerticalMapScroll: false,
    usesMapActivation: false,
    usesGameScenes: false,
    usesRng: false
  };
  const addSpriteSync = (instruction) => {
    const spriteRef = instruction.args[0];
    if (!spriteRef || spriteRef.type !== "spriteRef") return;
    stats.spriteSyncCallCounts.set(spriteRef.index, (stats.spriteSyncCallCounts.get(spriteRef.index) ?? 0) + 1);
  };
  const visit = (instructions) => {
    for (const instruction of instructions ?? []) {
      if (instruction.op === "sidClick") stats.sidClickCount += 1;
      if (["sidBeep", "sidNoise", "sidClick", "sidExplosion", "sidLaser", "sidPickup"].includes(instruction.op)) {
        stats.sidEffectCount += 1;
      }
      if (instruction.op === "sidFadeSong") stats.sidFadeCount += 1;
      if (instruction.op === "mapActivate") stats.usesMapActivation = true;
      if (["randomSeed", "randomByte", "randomRange"].includes(instruction.op)) stats.usesRng = true;
      if (["gameScene", "gameSceneStart", "gameSceneGo"].includes(instruction.op)) stats.usesGameScenes = true;
      if (instruction.op === "mapVerticalScrollerMove") stats.usesVerticalMapScroll = true;
      if (instruction.op === "mapScrollerFollow" && ["y", "both"].includes(instruction.args[2]?.axis)) {
        stats.usesVerticalMapScroll = true;
      }
      if (MULTIPLEX_CONFLICTING_LEGACY_OPS.has(instruction.op)) stats.usesLegacySpriteApi = true;
      if (["spriteCreateRuntime", "spriteRuntimeSync", "spriteRuntimeUpdate"].includes(instruction.op)) addSpriteSync(instruction);
      if (instruction.op === "spriteCreateRuntime" && instruction.args[0]?.index >= 8) stats.usesSpriteMultiplexer = true;
      if (["gameInit", "gameFrame"].includes(instruction.op)) visit(instruction.args[0]);
      if (instruction.op === "gameScene") {
        visit(instruction.args[1]?.enter);
        visit(instruction.args[1]?.update);
        visit(instruction.args[1]?.exit);
      }
      if (["gameEvery", "controlRepeat", "controlWhile", "controlRoutine"].includes(instruction.op)) visit(instruction.args[1]);
      if (instruction.op === "controlIf") {
        if (instruction.args[0]?.operator === "mapActive") stats.usesMapActivation = true;
        if (instruction.args[0]?.operator === "gameScene") stats.usesGameScenes = true;
        visit(instruction.args[1]);
        visit(instruction.args[2]);
      }
    }
  };
  for (const group of instructionGroups) visit(group);
  return stats;
}

function normalizeOptimizationMode(value = "balanced") {
  const mode = String(value ?? "balanced").toLowerCase();
  if (!["size", "speed", "balanced"].includes(mode)) {
    throw new Error("optimization mode must be size, speed or balanced");
  }
  return mode;
}

function emitSpriteMultiplexerStateInit(asm, state) {
  if (!state.multiplexer.enabled) return;
  const loopLabel = "sprite_mux_init_loop";
  asm.comment("Clear all 16 logical sprite slots before user initialization");
  asm.ldx(imm(0));
  asm.label(loopLabel);
  asm.lda(imm(0));
  asm.sta(absx(SPRITE_LOGICAL_STATE_BASE + 5));
  for (let offset = 0; offset <= 6; offset += 1) asm.sta(absx(SPRITE_RUNTIME_BASE + offset));
  asm.txa(); asm.clc(); asm.adc(imm(SPRITE_LOGICAL_STATE_STRIDE)); asm.tax();
  asm.cpx(imm(SPRITE_LOGICAL_COUNT * SPRITE_LOGICAL_STATE_STRIDE));
  asm.bne(rel(loopLabel));
}

function syncInstructionCompileState(baseState, localState) {
  baseState.currentTextColor = localState.currentTextColor;
  baseState.screenBase = localState.screenBase;
  baseState.colorBase = localState.colorBase;
  baseState.spriteDataCounter = localState.spriteDataCounter;
  baseState.stringCounter = localState.stringCounter;
  baseState.loopCounter = localState.loopCounter;
  baseState.nextAutoVariableAddress = localState.nextAutoVariableAddress;
  baseState.nextSpriteFrameAddress = localState.nextSpriteFrameAddress;
  baseState.hires = { ...localState.hires };
  baseState.sid = {
    voiceControls: [...localState.sid.voiceControls],
    filterModeVol: localState.sid.filterModeVol,
    filterResonanceRoute: localState.sid.filterResonanceRoute,
      player: {
        installRequested: localState.sid.player.installRequested,
        line: localState.sid.player.line,
        song: localState.sid.player.song,
        sfxVoice: localState.sid.player.sfxVoice,
        fadeUsed: localState.sid.player.fadeUsed
    }
  };
}

function registerData(compileState, name, bytes) {
  if (compileState.dataPool.has(name)) {
    throw new Error(`Data label already defined: ${name}`);
  }
  compileState.dataPool.set(name, bytes);
}

function isCompilerSpriteVariable(name, address, size) {
  const match = /^__sprite(\d+)_(x|y|vx|vy|active)$/.exec(name);
  if (!match) return false;
  const index = Number(match[1]);
  if (index < 0 || index >= SPRITE_LOGICAL_COUNT) return false;
  const field = match[2];
  const offsets = { x: 0, y: 2, vx: 3, vy: 4, active: 5 };
  const expectedSize = field === "x" ? 2 : 1;
  return address === SPRITE_LOGICAL_STATE_BASE + index * SPRITE_LOGICAL_STATE_STRIDE + offsets[field]
    && size === expectedSize;
}

function registerVariable(compileState, name, address, size) {
  if (compileState.variables.has(name)) {
    throw new Error(`Variable already defined: ${name}`);
  }
  ensureWord(address, `address for variable ${name}`);
  ensureWord(address + size - 1, `end address for variable ${name}`);
  for (const range of RESERVED_RUNTIME_RANGES) {
    const overlapsRuntime = address <= range.end && address + size - 1 >= range.start;
    const isInternalSpriteState = range.name === "sprite logical state" && isCompilerSpriteVariable(name, address, size);
    if (overlapsRuntime && !isInternalSpriteState) {
      throw new Error(`Variable ${name} overlaps reserved ${range.name} RAM ($${range.start.toString(16).toUpperCase()}-$${range.end.toString(16).toUpperCase()})`);
    }
  }
  for (const [otherName, variable] of compileState.variables.entries()) {
    const overlaps = address <= variable.address + variable.size - 1
      && address + size - 1 >= variable.address;
    if (overlaps) {
      throw new Error(`Variable ${name} overlaps variable ${otherName}`);
    }
  }
  compileState.variables.set(name, { address, size, valueType: size === 2 ? "word" : "byte" });
}

function allocateVariableAddress(compileState, size) {
  let candidate = compileState.nextAutoVariableAddress;
  while (candidate + size - 1 <= AUTO_VARIABLE_END) {
    const overlaps = [...compileState.variables.values()].some((variable) => (
      candidate <= variable.address + variable.size - 1
      && candidate + size - 1 >= variable.address
    ));
    if (!overlaps) {
      compileState.nextAutoVariableAddress = candidate + size;
      return candidate;
    }
    candidate += 1;
  }
  throw new Error("Automatic variable memory is full ($C100-$C2FF)");
}

function resolveRuntimeByteAddress(compileState, value, label = "runtime value") {
  if (!isVarRef(value)) {
    throw new Error(`${label} must be a runtime byte variable`);
  }
  const variable = resolveVarRef(compileState, value);
  if (variable.size !== 1) {
    throw new Error(`${label} must reference a byte variable`);
  }
  return variable.address;
}

function resolveRuntimeVariable(compileState, value, label = "runtime value") {
  if (!isVarRef(value)) {
    throw new Error(`${label} must be a runtime variable`);
  }
  return resolveVarRef(compileState, value);
}

function normalizeRuntimeLiteral(value, size, label) {
  if (typeof value === "boolean") {
    value = value ? 1 : 0;
  }
  if (size === 2) {
    ensureWord(value, label);
  } else {
    ensureByte(value, label);
  }
  return value;
}

function emitRuntimeValueToA(asm, compileState, value, label = "runtime value") {
  if (isVarRef(value)) {
    asm.lda(addressMode(resolveRuntimeByteAddress(compileState, value, label)));
    return;
  }
  if (typeof value === "boolean") value = Number(value);
  if (typeof value === "number" && value < 0) {
    ensureSignedByte(value, label);
    value &= 0xff;
  }
  ensureByte(value, label);
  asm.lda(imm(value));
}

function runtimeValueOperand(compileState, value, label = "runtime value") {
  if (isVarRef(value)) {
    return addressMode(resolveRuntimeByteAddress(compileState, value, label));
  }
  if (typeof value === "boolean") value = Number(value);
  if (typeof value === "number" && value < 0) {
    ensureSignedByte(value, label);
    value &= 0xff;
  }
  ensureByte(value, label);
  return imm(value);
}

function emitRuntimeSet(asm, compileState, target, value) {
  const targetVariable = resolveRuntimeVariable(compileState, target, "assignment target");
  if (targetVariable.size === 1) {
    emitRuntimeValueToA(asm, compileState, typeof value === "boolean" ? Number(value) : value, "assignment value");
    asm.sta(addressMode(targetVariable.address));
    return;
  }
  if (isVarRef(value)) {
    const source = resolveRuntimeVariable(compileState, value, "assignment value");
    if (source.size !== 2) throw new Error("word assignment needs a word source");
    emitLoadAndStore(asm, source.address, targetVariable.address);
    emitLoadAndStore(asm, source.address + 1, targetVariable.address + 1);
    return;
  }
  const literal = normalizeRuntimeLiteral(value, 2, "assignment value");
  emitStoreImmediate(asm, targetVariable.address, literal & 0xff);
  emitStoreImmediate(asm, targetVariable.address + 1, literal >> 8);
}

function emitRuntimeMath(asm, compileState, target, value, operation) {
  const targetVariable = resolveRuntimeVariable(compileState, target, "math target");
  const targetAddress = targetVariable.address;
  let effectiveOperation = operation;
  if (targetVariable.size === 1 && typeof value === "number" && value < 0) {
    ensureSignedByte(value, "signed math value");
    value = -value;
    effectiveOperation = operation === "add" ? "sub" : "add";
  }
  let lowOperand;
  if (targetVariable.size === 2) {
    if (isVarRef(value)) {
      const source = resolveRuntimeVariable(compileState, value, "math value");
      if (source.size !== 2) throw new Error("word math needs a word source");
      lowOperand = addressMode(source.address);
    } else {
      lowOperand = imm(normalizeRuntimeLiteral(value, 2, "math value") & 0xff);
    }
  } else {
    lowOperand = runtimeValueOperand(compileState, value, "math value");
  }
  asm.lda(addressMode(targetAddress));
  if (effectiveOperation === "add") {
    asm.clc();
    asm.adc(lowOperand);
  } else {
    asm.sec();
    asm.sbc(lowOperand);
  }
  asm.sta(addressMode(targetAddress));
  if (targetVariable.size === 2) {
    asm.lda(addressMode(targetAddress + 1));
    let highOperand;
    if (isVarRef(value)) {
      const source = resolveRuntimeVariable(compileState, value, "math value");
      if (source.size !== 2) throw new Error("word math needs a word source");
      highOperand = addressMode(source.address + 1);
    } else {
      highOperand = imm((normalizeRuntimeLiteral(value, 2, "math value") >> 8) & 0xff);
    }
    if (effectiveOperation === "add") asm.adc(highOperand); else asm.sbc(highOperand);
    asm.sta(addressMode(targetAddress + 1));
  }
}

function emitRuntimeIncDec(asm, compileState, target, increment) {
  const variable = resolveRuntimeVariable(compileState, target, increment ? "increment target" : "decrement target");
  if (variable.size === 1) {
    if (increment) asm.inc(addressMode(variable.address)); else asm.dec(addressMode(variable.address));
    return;
  }
  const doneLabel = `runtime_word_${increment ? "inc" : "dec"}_done_${compileState.loopCounter++}`;
  if (increment) {
    asm.inc(addressMode(variable.address));
    asm.bne(rel(doneLabel));
    asm.inc(addressMode(variable.address + 1));
  } else {
    asm.lda(addressMode(variable.address));
    asm.bne(rel(doneLabel));
    asm.dec(addressMode(variable.address + 1));
    asm.label(doneLabel);
    asm.dec(addressMode(variable.address));
    return;
  }
  asm.label(doneLabel);
}

function emitRuntimeBit(asm, compileState, operation, target, value) {
  const variable = resolveRuntimeVariable(compileState, target, "bit operation target");
  if (variable.size !== 1) throw new Error("bit operations currently require a byte or bool variable");
  asm.lda(addressMode(variable.address));
  const operand = runtimeValueOperand(compileState, typeof value === "boolean" ? Number(value) : value, "bit value");
  if (operation === "and") asm.and(operand);
  else if (operation === "or") asm.ora(operand);
  else if (operation === "xor") asm.eor(operand);
  else throw new Error(`Unsupported bit operation: ${operation}`);
  asm.sta(addressMode(variable.address));
}

function joystickSnapshotAddresses(port) {
  if (port === 1) {
    return { current: INPUT_JOYSTICK_1, previous: INPUT_JOYSTICK_PREV_1 };
  }
  if (port === 2) {
    return { current: INPUT_JOYSTICK_2, previous: INPUT_JOYSTICK_PREV_2 };
  }
  throw new Error("joystick port must be 1 or 2");
}

function keyboardSnapshotAddresses(compileState, keyCode) {
  const keys = [...compileState.input.keyboardKeys];
  const index = keys.indexOf(keyCode);
  if (index < 0 || index >= MAX_KEYBOARD_ACTIONS) {
    throw new Error(`Keyboard action for key ${keyCode} was not registered or exceeds the ${MAX_KEYBOARD_ACTIONS}-key limit`);
  }
  return { current: KEYBOARD_CURRENT_BASE + index, previous: KEYBOARD_PREVIOUS_BASE + index };
}

function wordPartOperand(compileState, value, high, label) {
  if (isVarRef(value)) {
    const variable = resolveRuntimeVariable(compileState, value, label);
    if (variable.size !== 2) throw new Error(`${label} must be a word variable`);
    return addressMode(variable.address + (high ? 1 : 0));
  }
  const literal = normalizeRuntimeLiteral(value, 2, label);
  return imm(high ? ((literal >> 8) & 0xff) : (literal & 0xff));
}

function emitWordConditionOrJump(asm, compileState, runtimeCondition, falseLabel, passLabel, id) {
  const left = resolveRuntimeVariable(compileState, runtimeCondition.left, "condition left value");
  if (left.size !== 2) throw new Error("word comparison needs a word left value");
  const compareLow = `word_compare_low_${id}`;
  asm.lda(addressMode(left.address + 1));
  asm.cmp(wordPartOperand(compileState, runtimeCondition.right, true, "condition right value"));
  switch (runtimeCondition.operator) {
    case "eq":
      asm.beq(rel(compareLow)); asm.jmp(abs(falseLabel));
      asm.label(compareLow);
      asm.lda(addressMode(left.address)); asm.cmp(wordPartOperand(compileState, runtimeCondition.right, false, "condition right value"));
      asm.beq(rel(passLabel)); break;
    case "ne":
      asm.bne(rel(passLabel));
      asm.lda(addressMode(left.address)); asm.cmp(wordPartOperand(compileState, runtimeCondition.right, false, "condition right value"));
      asm.bne(rel(passLabel)); break;
    case "lt":
      asm.bcc(rel(passLabel)); asm.bne(rel(compareLow));
      asm.lda(addressMode(left.address)); asm.cmp(wordPartOperand(compileState, runtimeCondition.right, false, "condition right value"));
      asm.bcc(rel(passLabel));
      asm.label(compareLow); break;
    case "gte":
      asm.bcc(rel(compareLow)); asm.bne(rel(passLabel));
      asm.lda(addressMode(left.address)); asm.cmp(wordPartOperand(compileState, runtimeCondition.right, false, "condition right value"));
      asm.bcs(rel(passLabel));
      asm.label(compareLow); break;
    case "lte":
      asm.bcc(rel(passLabel)); asm.bne(rel(compareLow));
      asm.lda(addressMode(left.address)); asm.cmp(wordPartOperand(compileState, runtimeCondition.right, false, "condition right value"));
      asm.bcc(rel(passLabel)); asm.beq(rel(passLabel));
      asm.label(compareLow); break;
    case "gt":
      asm.bcc(rel(compareLow)); asm.bne(rel(passLabel));
      asm.lda(addressMode(left.address)); asm.cmp(wordPartOperand(compileState, runtimeCondition.right, false, "condition right value"));
      asm.beq(rel(compareLow)); asm.bcs(rel(passLabel));
      asm.label(compareLow); break;
    default:
      throw new Error(`Unsupported word condition: ${runtimeCondition.operator}`);
  }
  asm.jmp(abs(falseLabel));
  asm.label(passLabel);
}

function emitConditionOrJump(asm, compileState, runtimeCondition, falseLabel) {
  if (!isRuntimeCondition(runtimeCondition)) {
    throw new Error("Expected a runtime condition");
  }
  const id = compileState.loopCounter++;
  const passLabel = `condition_pass_${id}`;

  if (runtimeCondition.operator === "mapActive") {
    const info = requireDynamicMap(compileState, runtimeCondition.left);
    asm.lda(abs(MAP_ACTIVE_ID));
    asm.cmp(imm(info.id));
    asm.beq(rel(passLabel));
    asm.jmp(abs(falseLabel));
    asm.label(passLabel);
    return;
  }

  if (runtimeCondition.operator === "gameScene") {
    const sceneId = GAME_SCENE_IDS[runtimeCondition.left];
    if (sceneId === undefined) throw new Error(`Unknown game scene: ${runtimeCondition.left}`);
    compileState.game.referencedScenes.add(runtimeCondition.left);
    asm.lda(abs(GAME_SCENE_CURRENT));
    asm.cmp(imm(sceneId));
    asm.beq(rel(passLabel));
    asm.jmp(abs(falseLabel));
    asm.label(passLabel);
    return;
  }

  if (runtimeCondition.operator === "spriteAabb") {
    emitSpriteAabbOrJumpFalse(asm, compileState, runtimeCondition.left, falseLabel);
    return;
  }

  if (runtimeCondition.operator === "mapCollision") {
    emitMapCollisionOrJumpFalse(asm, compileState, runtimeCondition.left, falseLabel, passLabel, id);
    return;
  }

  if (runtimeCondition.operator === "mapTileEquals" || runtimeCondition.operator === "mapTileNotEquals") {
    emitMapEqualsOrJumpFalse(asm, compileState, runtimeCondition.left, falseLabel, passLabel, id, runtimeCondition.operator === "mapTileNotEquals");
    return;
  }

  if (runtimeCondition.operator === "spriteVic") {
    if (compileState.multiplexer.enabled) {
      throw new Error("vicCollides() is unavailable when sprites 8..15 enable multiplexing; use software collides() instead");
    }
    const mask = (1 << runtimeCondition.left.a) | (1 << runtimeCondition.left.b);
    asm.lda(abs(VIC_SPRITE_COLLISION_SNAPSHOT)); asm.and(imm(mask)); asm.cmp(imm(mask)); asm.beq(rel(passLabel)); asm.jmp(abs(falseLabel)); asm.label(passLabel);
    return;
  }

  if (runtimeCondition.operator === "spriteBackground") {
    if (compileState.multiplexer.enabled) {
      throw new Error("collidesWithBackground() is unavailable when sprites 8..15 enable multiplexing; use software or tile collisions instead");
    }
    const mask = 1 << runtimeCondition.left.index;
    asm.lda(abs(VIC_BACKGROUND_COLLISION_SNAPSHOT)); asm.and(imm(mask)); asm.bne(rel(passLabel)); asm.jmp(abs(falseLabel)); asm.label(passLabel);
    return;
  }

  if (runtimeCondition.operator === "joystick") {
    const input = runtimeCondition.left;
    const addresses = joystickSnapshotAddresses(input.port);
    ensureByte(input.mask, "joystick mask");
    asm.lda(abs(addresses.current));
    asm.and(imm(input.mask));
    if (input.event === "held") {
      asm.beq(rel(passLabel));
      asm.jmp(abs(falseLabel));
    } else if (input.event === "pressed") {
      const currentPressedLabel = `joystick_current_pressed_${id}`;
      asm.beq(rel(currentPressedLabel));
      asm.jmp(abs(falseLabel));
      asm.label(currentPressedLabel);
      asm.lda(abs(addresses.previous));
      asm.and(imm(input.mask));
      asm.bne(rel(passLabel));
      asm.jmp(abs(falseLabel));
    } else if (input.event === "released") {
      const currentReleasedLabel = `joystick_current_released_${id}`;
      asm.bne(rel(currentReleasedLabel));
      asm.jmp(abs(falseLabel));
      asm.label(currentReleasedLabel);
      asm.lda(abs(addresses.previous));
      asm.and(imm(input.mask));
      asm.beq(rel(passLabel));
      asm.jmp(abs(falseLabel));
    } else {
      throw new Error(`Unsupported joystick event: ${input.event}`);
    }
    asm.label(passLabel);
    return;
  }

  if (runtimeCondition.operator === "keyboard") {
    const input = runtimeCondition.left;
    const addresses = keyboardSnapshotAddresses(compileState, input.keyCode);
    asm.lda(abs(addresses.current));
    if (input.event === "held") {
      asm.beq(rel(passLabel));
    } else if (input.event === "pressed") {
      const pressedLabel = `keyboard_pressed_${id}`;
      asm.beq(rel(pressedLabel)); asm.jmp(abs(falseLabel)); asm.label(pressedLabel);
      asm.lda(abs(addresses.previous)); asm.bne(rel(passLabel));
    } else if (input.event === "released") {
      const releasedLabel = `keyboard_released_${id}`;
      asm.bne(rel(releasedLabel)); asm.jmp(abs(falseLabel)); asm.label(releasedLabel);
      asm.lda(abs(addresses.previous)); asm.beq(rel(passLabel));
    }
    asm.jmp(abs(falseLabel));
    asm.label(passLabel);
    return;
  }

  if (isVarRef(runtimeCondition.left) && resolveRuntimeVariable(compileState, runtimeCondition.left).size === 2) {
    emitWordConditionOrJump(asm, compileState, runtimeCondition, falseLabel, passLabel, id);
    return;
  }

  emitRuntimeValueToA(asm, compileState, runtimeCondition.left, "condition left value");
  asm.cmp(runtimeValueOperand(compileState, runtimeCondition.right, "condition right value"));
  switch (runtimeCondition.operator) {
    case "eq":
      asm.beq(rel(passLabel));
      break;
    case "ne":
      asm.bne(rel(passLabel));
      break;
    case "lt":
      asm.bcc(rel(passLabel));
      break;
    case "gte":
      asm.bcs(rel(passLabel));
      break;
    case "lte":
      asm.bcc(rel(passLabel));
      asm.beq(rel(passLabel));
      break;
    case "gt": {
      const notEqualLabel = `condition_not_equal_${id}`;
      asm.bne(rel(notEqualLabel));
      asm.jmp(abs(falseLabel));
      asm.label(notEqualLabel);
      asm.bcs(rel(passLabel));
      break;
    }
    default:
      throw new Error(`Unsupported runtime condition: ${runtimeCondition.operator}`);
  }
  asm.jmp(abs(falseLabel));
  asm.label(passLabel);
}

function emitControlIf(asm, compileState, runtimeCondition, thenInstructions, elseInstructions) {
  const id = compileState.loopCounter++;
  const elseLabel = `control_if_else_${id}`;
  const endLabel = `control_if_end_${id}`;
  emitConditionOrJump(asm, compileState, runtimeCondition, elseLabel);
  for (const nestedInstruction of thenInstructions) {
    compileHighLevelInstruction(asm, nestedInstruction, compileState);
  }
  asm.jmp(abs(endLabel));
  asm.label(elseLabel);
  for (const nestedInstruction of elseInstructions) {
    compileHighLevelInstruction(asm, nestedInstruction, compileState);
  }
  asm.label(endLabel);
}

function emitControlRepeat(asm, compileState, count, instructions) {
  const counterAddress = allocateVariableAddress(compileState, 1);
  const id = compileState.loopCounter++;
  const loopLabel = `control_repeat_${id}`;
  const bodyLabel = `control_repeat_body_${id}`;
  const doneLabel = `control_repeat_done_${id}`;
  emitRuntimeValueToA(asm, compileState, count, "repeat count");
  asm.sta(abs(counterAddress));
  asm.label(loopLabel);
  asm.lda(abs(counterAddress));
  asm.bne(rel(bodyLabel));
  asm.jmp(abs(doneLabel));
  asm.label(bodyLabel);
  for (const instruction of instructions) compileHighLevelInstruction(asm, instruction, compileState);
  asm.dec(abs(counterAddress));
  asm.jmp(abs(loopLabel));
  asm.label(doneLabel);
}

function emitControlWhile(asm, compileState, runtimeCondition, instructions, maxIterations) {
  ensurePositiveByte(maxIterations, "while maxIterations");
  const counterAddress = allocateVariableAddress(compileState, 1);
  const id = compileState.loopCounter++;
  const loopLabel = `control_while_${id}`;
  const bodyLabel = `control_while_body_${id}`;
  const doneLabel = `control_while_done_${id}`;
  emitStoreImmediate(asm, counterAddress, maxIterations);
  asm.label(loopLabel);
  asm.lda(abs(counterAddress));
  asm.bne(rel(bodyLabel));
  asm.jmp(abs(doneLabel));
  asm.label(bodyLabel);
  emitConditionOrJump(asm, compileState, runtimeCondition, doneLabel);
  for (const instruction of instructions) compileHighLevelInstruction(asm, instruction, compileState);
  asm.dec(abs(counterAddress));
  asm.jmp(abs(loopLabel));
  asm.label(doneLabel);
}

function validateGameCounter(compileState, counter) {
  if (!counter || counter.type !== "gameCounterRef" || !Array.isArray(counter.digitRefs)) {
    throw new Error("invalid game counter reference");
  }
  const registered = compileState.game.counters.get(counter.name);
  if (!registered || registered.digits !== counter.digits) {
    throw new Error(`game counter ${counter.name} is not registered`);
  }
  return counter.digitRefs.map((ref) => resolveRuntimeByteAddress(compileState, ref, `counter ${counter.name} digit`));
}

function counterLiteral(counter, value, label) {
  const maximum = (10 ** counter.digits) - 1;
  if (!Number.isInteger(value) || value < 0 || value > maximum) throw new Error(`${label} must be between 0 and ${maximum}`);
  return String(value).padStart(counter.digits, "0").split("").map(Number);
}

function emitGameCounterSet(asm, compileState, counter, value) {
  const addresses = validateGameCounter(compileState, counter);
  const digits = counterLiteral(counter, value, `counter ${counter.name} value`);
  addresses.forEach((address, index) => emitStoreImmediate(asm, address, digits[index]));
}

function emitGameCounterMath(asm, compileState, counter, value, subtract) {
  const addresses = validateGameCounter(compileState, counter);
  const digits = counterLiteral(counter, value, `counter ${counter.name} delta`);
  const id = compileState.loopCounter++;
  subtract ? asm.sec() : asm.clc();
  for (let index = addresses.length - 1; index >= 0; index -= 1) {
    const carryLabel = `game_counter_${subtract ? "borrow" : "carry"}_${id}_${index}`;
    const nextLabel = `game_counter_next_${id}_${index}`;
    asm.lda(abs(addresses[index]));
    if (subtract) {
      asm.sbc(imm(digits[index]));
      asm.bcc(rel(carryLabel));
      asm.sta(abs(addresses[index]));
      asm.sec();
      asm.jmp(abs(nextLabel));
      asm.label(carryLabel);
      asm.adc(imm(10));
      asm.sta(abs(addresses[index]));
      asm.clc();
    } else {
      asm.adc(imm(digits[index]));
      asm.cmp(imm(10));
      asm.bcs(rel(carryLabel));
      asm.sta(abs(addresses[index]));
      asm.clc();
      asm.jmp(abs(nextLabel));
      asm.label(carryLabel);
      asm.sbc(imm(10));
      asm.sta(abs(addresses[index]));
      asm.sec();
    }
    asm.label(nextLabel);
  }
}

function emitGameCounterDraw(asm, compileState, counter, x, y, color) {
  const addresses = validateGameCounter(compileState, counter);
  ensureByte(x, "counter screen x"); ensureByte(y, "counter screen y"); ensureByte(color, "counter color");
  if (x + addresses.length > 40 || y >= 25 || color > 15) throw new Error("game counter must fit inside the 40x25 screen and use a C64 color");
  addresses.forEach((address, index) => {
    asm.lda(abs(address)); asm.clc(); asm.adc(imm(48)); asm.sta(abs(compileState.screenBase + y * 40 + x + index));
    emitStoreImmediate(asm, compileState.colorBase + y * 40 + x + index, color);
  });
}

function emitRandomByteToA(asm, compileState) {
  const noFeedback = `game_random_no_feedback_${compileState.loopCounter++}`;
  asm.lda(abs(GAME_RANDOM_STATE));
  asm.lsr(acc());
  asm.bcc(rel(noFeedback));
  asm.eor(imm(0xb8));
  asm.label(noFeedback);
  asm.sta(abs(GAME_RANDOM_STATE));
}

function emitRandomRange(asm, compileState, target, maximum) {
  if (!Number.isInteger(maximum) || maximum < 1 || maximum > 256) throw new Error("random range maximum must be between 1 and 256");
  emitRandomByteToA(asm, compileState);
  if (maximum < 256) {
    if ((maximum & (maximum - 1)) === 0) {
      asm.and(imm(maximum - 1));
    } else {
      const reduce = `game_random_reduce_${compileState.loopCounter++}`;
      const done = `game_random_done_${compileState.loopCounter++}`;
      asm.label(reduce);
      asm.cmp(imm(maximum));
      asm.bcc(rel(done));
      asm.sbc(imm(maximum));
      asm.jmp(abs(reduce));
      asm.label(done);
    }
  }
  asm.sta(abs(resolveRuntimeByteAddress(compileState, target, "random target")));
}

function safeRoutineLabel(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid routine name: ${name}`);
  }
  return `user_routine_${name}`;
}

const GAME_FRAME_COMPILE_TIME_ONLY_OPS = new Set([
  "dataByte", "dataWord", "dataString", "dataScreenString",
  "varByte", "varWord", "screen", "colorRam", "charsetUse", "mapRegister", "mapDraw", "mapHorizontalScrollerCreate",
  "sidPlaySong", "sidInstallPlayer", "spriteInstallAnimator",
  "spriteMoveX", "spriteMoveY", "spriteMoveToX", "spriteMoveToY",
  "spriteAnimateTo", "spriteStop", "spriteStopX", "spriteStopY",
  "irqInstall", "irqChainToKernal", "irqDisableKernalTimer", "irqEnableKernalTimer",
  "gameFrame", "gameInit", "gameScene", "gameSceneStart", "controlRoutine",
  "gamePoolRegister", "gameCounterRegister",
  "spriteCreateRuntime", "spriteRuntimeData", "spriteRuntimeColor", "spriteRuntimeFlag",
  "spriteFrames", "spriteUseFrames", "spriteSequence", "spriteRuntimeBounds", "mapEntityCreate", "spriteAssetRegister"
]);

function prepareGameFrameInstructions(instructions, compileState) {
  for (const instruction of instructions) {
    if (GAME_FRAME_COMPILE_TIME_ONLY_OPS.has(instruction.op)) {
      throw new Error(`${instruction.op} cannot be used inside c64.game.frame(); declare resources before the frame loop and update runtime variables inside it`);
    }
    if (instruction.op === "inputUseJoystick") {
      compileState.input.joystickPorts.add(instruction.args[0]);
    }
    if (instruction.op === "inputUseKeyboardKey") {
      compileState.input.keyboardKeys.add(instruction.args[0]);
    }
    if (instruction.op === "gameEvery") {
      ensurePositiveByte(instruction.args[0], "game.every count");
      instruction.runtimeCounterAddress ??= allocateVariableAddress(compileState, 1);
      compileState.game.everyTasks.push(instruction);
      prepareGameFrameInstructions(instruction.args[1], compileState);
    }
    if (instruction.op === "controlIf") {
      if (instruction.args[0]?.operator === "spriteAabb") compileState.game.spriteAabbCount += 1;
      if (instruction.args[0]?.operator === "spriteVic") compileState.game.usesVicSpriteCollision = true;
      if (instruction.args[0]?.operator === "spriteBackground") compileState.game.usesVicBackgroundCollision = true;
      prepareGameFrameInstructions(instruction.args[1], compileState);
      prepareGameFrameInstructions(instruction.args[2], compileState);
    }
    if (instruction.op === "controlRepeat" || instruction.op === "controlWhile") {
      if (instruction.op === "controlWhile" && instruction.args[0]?.operator === "spriteAabb") compileState.game.spriteAabbCount += 1;
      if (instruction.op === "controlWhile" && instruction.args[0]?.operator === "spriteVic") compileState.game.usesVicSpriteCollision = true;
      if (instruction.op === "controlWhile" && instruction.args[0]?.operator === "spriteBackground") compileState.game.usesVicBackgroundCollision = true;
      prepareGameFrameInstructions(instruction.args[1], compileState);
    }
  }
}

function gameSceneId(name) {
  const id = GAME_SCENE_IDS[name];
  if (id === undefined) throw new Error(`game scene must be one of: ${Object.keys(GAME_SCENE_IDS).join(", ")}`);
  return id;
}

function collectReferencedGameScenes(instructions, compileState) {
  for (const instruction of instructions) {
    if (instruction.op === "gameSceneGo") compileState.game.referencedScenes.add(instruction.args[0]);
    if (instruction.op === "controlIf") {
      if (instruction.args[0]?.operator === "gameScene") compileState.game.referencedScenes.add(instruction.args[0].left);
      collectReferencedGameScenes(instruction.args[1], compileState);
      collectReferencedGameScenes(instruction.args[2], compileState);
    }
    if (["gameEvery", "controlRepeat", "controlWhile"].includes(instruction.op)) {
      collectReferencedGameScenes(instruction.args[1], compileState);
    }
  }
}

function registerGameScene(compileState, name, handlers) {
  gameSceneId(name);
  if (compileState.game.scenes.has(name)) throw new Error(`Game scene ${name} is already declared`);
  const normalized = {
    name,
    id: gameSceneId(name),
    enter: handlers.enter ?? [],
    update: handlers.update ?? [],
    exit: handlers.exit ?? []
  };
  for (const instructions of [normalized.enter, normalized.update, normalized.exit]) {
    collectReferencedGameScenes(instructions, compileState);
    prepareGameFrameInstructions(instructions, compileState);
  }
  compileState.game.scenes.set(name, normalized);
}

function compileHighLevelInstruction(asm, instruction, compileState) {
  // Central dispatcher: one DSL instruction enters here and is translated into
  // one or more low level assembly operations.
  switch (instruction.op) {
    case "borderColor":
      emitStoreImmediate(asm, c64.VIC_BORDER_COLOR, instruction.args[0]);
      break;
    case "backgroundColor":
      emitStoreImmediate(asm, c64.VIC_BACKGROUND_COLOR, instruction.args[0]);
      break;
    case "textColor":
      emitStoreImmediate(asm, 0x0286, instruction.args[0]);
      compileState.currentTextColor = instruction.args[0] & 0xff;
      break;
    case "clearScreen":
      asm.lda(imm(147));
      asm.jsr(abs(c64.KERNAL_CHROUT));
      break;
    case "waitKey":
      emitWaitKey(asm, compileState);
      break;
    case "print":
      emitPrint(asm, instruction.args[0], compileState);
      break;
    case "printAt":
      emitPrintAt(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], compileState.screenBase, compileState.colorBase, compileState);
      break;
    case "printCentered": {
      const centeredX = Math.max(0, Math.floor((40 - instruction.args[1].length) / 2));
      emitPrintAt(asm, centeredX, instruction.args[0], instruction.args[1], instruction.args[2], compileState.screenBase, compileState.colorBase, compileState);
      break;
    }
    case "poke":
      if (isPeekRef(instruction.args[1])) {
        emitLoadAndStore(asm, resolveAddress(compileState, instruction.args[1].address, "peek address"), resolveAddress(compileState, instruction.args[0], "destination address"));
      } else if (isVarRef(instruction.args[1])) {
        const source = resolveRuntimeVariable(compileState, instruction.args[1], "poke value");
        if (source.size !== 1) throw new Error("poke value must be a byte variable");
        asm.lda(addressMode(source.address));
        asm.sta(addressMode(resolveAddress(compileState, instruction.args[0], "destination address")));
      } else {
        emitStoreImmediate(asm, resolveAddress(compileState, instruction.args[0], "address"), resolveByteValue(instruction.args[1]));
      }
      break;
    case "memset":
      emitMemset(asm, resolveAddress(compileState, instruction.args[0], "address"), instruction.args[1], instruction.args[2]);
      break;
    case "memcpy":
      emitMemcpy(asm, resolveAddress(compileState, instruction.args[0], "destination"), resolveAddress(compileState, instruction.args[1], "source"), instruction.args[2]);
      break;
    case "copyDataTo":
      emitCopyDataTo(
        asm,
        compileState,
        resolveAddress(compileState, instruction.args[0], "destination"),
        isDataRef(instruction.args[1]) ? instruction.args[1] : instruction.args[1],
        instruction.args[2]
      );
      break;
    case "memsetColor":
      emitMemset(asm, resolveAddress(compileState, instruction.args[0], "address"), instruction.args[1], instruction.args[2]);
      break;
    case "writeChar":
      emitWriteChar(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], compileState.screenBase, compileState.colorBase, compileState);
      break;
    case "fillRect":
      emitFillRect(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4], instruction.args[5], compileState.screenBase, compileState.colorBase, compileState.currentTextColor, compileState);
      break;
    case "drawFrame":
      emitDrawFrame(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4], instruction.args[5], compileState.screenBase, compileState.colorBase, compileState.currentTextColor, compileState);
      break;
    case "clearLine":
      emitFillRect(asm, 0, instruction.args[0], 40, 1, instruction.args[1], instruction.args[2], compileState.screenBase, compileState.colorBase, compileState.currentTextColor, compileState);
      break;
    case "screen":
      compileState.screenBase = instruction.args[0];
      break;
    case "colorRam":
      compileState.colorBase = instruction.args[0];
      break;
    case "charsetUse":
      emitCharsetUse(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapRegister":
      emitMapRegister(asm, compileState, instruction.args[0]);
      break;
    case "mapActivate":
      emitMapActivateRequest(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapDraw":
      emitMapDraw(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapViewportDraw":
      emitMapViewportDraw(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapHorizontalScrollerCreate":
      emitMapHorizontalScrollerCreate(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "mapHorizontalScrollerDraw":
      emitMapHorizontalScrollerDraw(asm, compileState, instruction.args[0]);
      break;
    case "mapHorizontalScrollerMove":
      emitMapHorizontalScrollerMove(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapVerticalScrollerMove":
      emitMapVerticalScrollerMove(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapScrollerFollow":
      emitMapScrollerFollow(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "mapScrollerProjectEntity":
      emitMapScrollerProjectEntity(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "mapScrollIrqEnter": {
      const scroller = requireHorizontalScroller(compileState, instruction.args[0]);
      asm.jsr(abs(`runtime_map_scroll_apply_${scroller.info.id}`));
      break;
    }
    case "mapScrollIrqExit": {
      const scroller = requireHorizontalScroller(compileState, instruction.args[0]);
      asm.jsr(abs(`runtime_map_scroll_leave_${scroller.info.id}`));
      break;
    }
    case "mapScrollIrqPreparePanel": {
      const scroller = requireHorizontalScroller(compileState, instruction.args[0]);
      asm.jsr(abs(`runtime_map_scroll_prepare_panel_${scroller.info.id}`));
      break;
    }
    case "mapRedraw":
      emitMapRedraw(asm, compileState, instruction.args[0]);
      break;
    case "mapRuntimeSet":
      emitMapRuntimeSet(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3]);
      break;
    case "mapRuntimeGet":
      emitMapRuntimeGet(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3]);
      break;
    case "mapCoordinateConvert":
      emitMapCoordinateConvert(asm, compileState, ...instruction.args);
      break;
    case "mapEntityCreate":
      emitMapEntityCreate(compileState, instruction.args[0]);
      break;
    case "mapEntityProject":
      emitMapEntityProject(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "mapEntityMoveAndCollide":
      emitMapEntityMoveAndCollide(asm, compileState, instruction.args[0]);
      break;
    case "hiresScreen":
      compileState.hires.screenBase = instruction.args[0];
      compileState.hires.modeDirty = true;
      break;
    case "hiresBitmap":
      compileState.hires.bitmapBase = instruction.args[0];
      compileState.hires.modeDirty = true;
      break;
    case "hiresEnabled":
      emitEnsureHiresMode(asm, compileState);
      break;
    case "hiresDisabled":
      emitDisableHiresMode(asm, compileState);
      break;
    case "hiresClear":
      emitHiresClear(asm, compileState, instruction.args[0]);
      break;
    case "hiresPoint":
      emitHiresPoint(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "hiresLine":
      emitHiresLine(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4]);
      break;
    case "hiresRect":
      emitHiresRect(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4]);
      break;
    case "hiresFillRect":
      emitHiresFillRect(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4]);
      break;
    case "hiresCircle":
      emitHiresCircle(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3]);
      break;
    case "hiresFillCircle":
      emitHiresFillCircle(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3]);
      break;
    case "sidVolume":
      emitSidVolume(asm, compileState, instruction.args[0]);
      break;
    case "sidFilter":
      emitSidFilter(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "sidVoiceFrequency":
      emitSidVoiceFrequency(asm, instruction.args[0], instruction.args[1]);
      break;
    case "sidVoicePulseWidth":
      emitSidVoicePulseWidth(asm, instruction.args[0], instruction.args[1]);
      break;
    case "sidVoiceWaveform":
      emitSidVoiceWaveform(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "sidVoiceGate":
      emitSidVoiceGate(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "sidVoiceAttackDecay":
      emitSidVoiceAttackDecay(asm, instruction.args[0], instruction.args[1]);
      break;
    case "sidVoiceSustainRelease":
      emitSidVoiceSustainRelease(asm, instruction.args[0], instruction.args[1]);
      break;
    case "sidNote":
      emitSidNote(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "sidFreq":
      emitSidVoiceFrequency(asm, instruction.args[0], instruction.args[1]);
      break;
    case "sidRest":
      emitSidRest(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "sidPlaySong":
      configureSidSongPlayer(compileState, instruction.args[0]);
      break;
    case "sidInstallPlayer":
      ensureWord(instruction.args[0], "SID player raster line");
      compileState.sid.player.installRequested = true;
      compileState.sid.player.line = instruction.args[0];
      break;
    case "sidReserveSfxVoice":
      throw new Error("c64.sid.reserveSfxVoice() must be declared at the top level");
    case "sidPauseSong":
      emitSidPlayerPause(asm, compileState);
      break;
    case "sidResumeSong":
      emitSidPlayerResume(asm, compileState);
      break;
    case "sidFadeSong":
      emitSidPlayerFade(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "sidStopSong":
      emitSidPlayerStop(asm, compileState);
      break;
    case "sidBeep":
      emitSidBeep(asm, compileState);
      break;
    case "sidNoise":
      emitSidNoise(asm, compileState, instruction.args[0]);
      break;
    case "sidClick":
      emitSidClick(asm, compileState);
      break;
    case "sidExplosion":
      emitSidExplosion(asm, compileState);
      break;
    case "sidLaser":
      emitSidLaser(asm, compileState);
      break;
    case "sidPickup":
      emitSidPickup(asm, compileState);
      break;
    case "sys":
      asm.jsr(abs(instruction.args[0]));
      break;
    case "label":
      asm.label(instruction.args[0]);
      break;
    case "comment":
      asm.comment(instruction.args[0]);
      break;
    case "byte":
      asm.byte(instruction.args);
      break;
    case "dataByte":
      registerData(compileState, instruction.args[0], instruction.args[1].map((value) => value & 0xff));
      break;
    case "dataWord":
      registerData(compileState, instruction.args[0], instruction.args[1].flatMap((value) => {
        ensureWord(value, "word value");
        return [value & 0xff, (value >> 8) & 0xff];
      }));
      break;
    case "dataString":
      registerData(compileState, instruction.args[0], [...getStringBytes(instruction.args[1], asciiToPetscii), 0x00]);
      break;
    case "dataScreenString":
      registerData(compileState, instruction.args[0], [...getStringBytes(instruction.args[1], asciiToScreenCode), 0x00]);
      break;
    case "varByte":
      instruction.args[1] ??= allocateVariableAddress(compileState, 1);
      registerVariable(compileState, instruction.args[0], instruction.args[1], 1);
      if (!Number.isInteger(instruction.args[2]) || instruction.args[2] < -128 || instruction.args[2] > 255) {
        throw new Error("initialValue must be a byte (-128..255)");
      }
      emitStoreImmediate(asm, instruction.args[1], instruction.args[2] & 0xff);
      break;
    case "varWord":
      instruction.args[1] ??= allocateVariableAddress(compileState, 2);
      registerVariable(compileState, instruction.args[0], instruction.args[1], 2);
      ensureWord(instruction.args[2], "initialValue");
      emitStoreImmediate(asm, instruction.args[1], instruction.args[2] & 0xff);
      emitStoreImmediate(asm, instruction.args[1] + 1, (instruction.args[2] >> 8) & 0xff);
      break;
    case "varBool":
      instruction.args[1] ??= allocateVariableAddress(compileState, 1);
      registerVariable(compileState, instruction.args[0], instruction.args[1], 1);
      compileState.variables.get(instruction.args[0]).valueType = "bool";
      emitStoreImmediate(asm, instruction.args[1], instruction.args[2] ? 1 : 0);
      break;
    case "runtimeSet":
      emitRuntimeSet(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "runtimeAdd":
      emitRuntimeMath(asm, compileState, instruction.args[0], instruction.args[1], "add");
      break;
    case "runtimeSub":
      emitRuntimeMath(asm, compileState, instruction.args[0], instruction.args[1], "sub");
      break;
    case "runtimeInc":
      emitRuntimeIncDec(asm, compileState, instruction.args[0], true);
      break;
    case "runtimeDec":
      emitRuntimeIncDec(asm, compileState, instruction.args[0], false);
      break;
    case "runtimeBit":
      emitRuntimeBit(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "controlIf":
      emitControlIf(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "controlRepeat":
      emitControlRepeat(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "controlWhile":
      emitControlWhile(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "controlRoutine": {
      const label = safeRoutineLabel(instruction.args[0]);
      const afterLabel = `${label}_after`;
      asm.jmp(abs(afterLabel));
      asm.label(label);
      for (const nestedInstruction of instruction.args[1]) compileHighLevelInstruction(asm, nestedInstruction, compileState);
      asm.rts();
      asm.label(afterLabel);
      break;
    }
    case "controlCall":
      asm.jsr(abs(safeRoutineLabel(instruction.args[0])));
      break;
    case "inputUseJoystick":
      compileState.input.joystickPorts.add(instruction.args[0]);
      break;
    case "inputUseKeyboardKey":
      compileState.input.keyboardKeys.add(instruction.args[0]);
      break;
    case "gameInit":
      for (const nestedInstruction of instruction.args[0]) compileHighLevelInstruction(asm, nestedInstruction, compileState);
      break;
    case "gameScene":
      registerGameScene(compileState, instruction.args[0], instruction.args[1]);
      break;
    case "gameSceneStart":
      if (compileState.game.sceneStart) throw new Error("c64.game.start() can only be declared once");
      if (compileState.game.frame && !compileState.game.frame.sceneManaged) {
        throw new Error("c64.game.start() cannot be combined with c64.game.frame(); scene updates already provide the frame loop");
      }
      gameSceneId(instruction.args[0]);
      compileState.game.sceneStart = { name: instruction.args[0], options: instruction.args[1] };
      compileState.game.frame = { instructions: [], options: instruction.args[1], sceneManaged: true };
      break;
    case "gameSceneGo": {
      const name = instruction.args[0];
      emitStoreImmediate(asm, GAME_SCENE_PENDING, gameSceneId(name));
      compileState.game.referencedScenes.add(name);
      break;
    }
    case "gamePoolRegister": {
      const [name, size] = instruction.args;
      if (compileState.game.fixedPools.has(name)) throw new Error(`fixed pool ${name} is already declared`);
      ensurePositiveByte(size, `fixed pool ${name} size`);
      compileState.game.fixedPools.set(name, size);
      break;
    }
    case "gameCounterRegister": {
      const counter = instruction.args[0];
      if (compileState.game.counters.has(counter.name)) throw new Error(`game counter ${counter.name} is already declared`);
      compileState.game.counters.set(counter.name, counter);
      break;
    }
    case "gameCounterSet":
      emitGameCounterSet(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "gameCounterAdd":
      emitGameCounterMath(asm, compileState, instruction.args[0], instruction.args[1], false);
      break;
    case "gameCounterSub":
      emitGameCounterMath(asm, compileState, instruction.args[0], instruction.args[1], true);
      break;
    case "gameCounterDraw":
      emitGameCounterDraw(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3]);
      break;
    case "randomSeed":
      emitStoreImmediate(asm, GAME_RANDOM_STATE, instruction.args[0]);
      break;
    case "randomByte":
      emitRandomByteToA(asm, compileState);
      asm.sta(abs(resolveRuntimeByteAddress(compileState, instruction.args[0], "random target")));
      break;
    case "randomRange":
      emitRandomRange(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "gameEvery": {
      const counterAddress = instruction.runtimeCounterAddress;
      if (counterAddress === undefined) throw new Error("c64.game.every() must be declared inside c64.game.frame()");
      const runLabel = `game_every_run_${compileState.loopCounter++}`;
      const doneLabel = `game_every_done_${compileState.loopCounter++}`;
      asm.inc(abs(counterAddress));
      asm.lda(abs(counterAddress));
      asm.cmp(imm(instruction.args[0]));
      asm.bcs(rel(runLabel));
      asm.jmp(abs(doneLabel));
      asm.label(runLabel);
      emitStoreImmediate(asm, counterAddress, 0);
      for (const nestedInstruction of instruction.args[1]) compileHighLevelInstruction(asm, nestedInstruction, compileState);
      asm.label(doneLabel);
      break;
    }
    case "runtimeTableLoad": {
      const index = instruction.args[1];
      if (isVarRef(index)) asm.ldx(addressMode(resolveRuntimeByteAddress(compileState, index, "table index")));
      else { ensureByte(index, "table index"); asm.ldx(imm(index)); }
      asm.lda(absx(instruction.args[0]));
      asm.sta(addressMode(resolveRuntimeByteAddress(compileState, instruction.args[2], "table load target")));
      break;
    }
    case "runtimeTableStore": {
      const index = instruction.args[1];
      if (isVarRef(index)) asm.ldx(addressMode(resolveRuntimeByteAddress(compileState, index, "table index")));
      else { ensureByte(index, "table index"); asm.ldx(imm(index)); }
      emitRuntimeValueToA(asm, compileState, instruction.args[2], "table store value");
      asm.sta(absx(instruction.args[0]));
      break;
    }
    case "gameFrame":
      if (compileState.game.frame) {
        throw new Error(compileState.game.frame.sceneManaged
          ? "c64.game.frame() cannot be combined with c64.game.start(); scene updates already provide the frame loop"
          : "Only one c64.game.frame() loop can be declared");
      }
      compileState.game.frame = {
        instructions: instruction.args[0],
        options: instruction.args[1]
      };
      prepareGameFrameInstructions(instruction.args[0], compileState);
      break;
    case "spriteEnable":
      emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, instruction.args[0], true);
      break;
    case "spriteFrames":
      emitSpriteFrames(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "spriteAssetRegister": {
      const asset = instruction.args[0];
      if (!asset || asset.type !== "spriteAsset") throw new Error("invalid sprite asset registration");
      if (compileState.assets.spriteAssets.has(asset.id)) throw new Error(`Sprite asset ${asset.id} is already registered`);
      compileState.assets.spriteAssets.set(asset.id, asset);
      compileState.assets.report.push({
        type: "sprite-asset",
        id: asset.id,
        sourcePath: asset.sourcePath,
        mode: asset.mode,
        frames: asset.frames.length,
        animations: Object.keys(asset.animations),
        color: asset.color,
        multicolor1: asset.multicolor1,
        multicolor2: asset.multicolor2,
        origin: { ...asset.origin },
        hitbox: { ...asset.hitbox },
        bytes: asset.frames.length * 64,
        resident: asset.resident !== false,
        diskLoadPolicy: compileState.disk.enabled ? (asset.resident === false ? "with-level" : "startup") : "inline"
      });
      break;
    }
    case "spriteCreateRuntime": {
      const spriteRef = instruction.args[0];
      ensureLogicalSpriteIndex(spriteRef.index);
      if (compileState.spriteRuntime[spriteRef.index]) throw new Error(`Sprite ${spriteRef.index} is already created`);
      const vars = spriteRefVariables(compileState, spriteRef);
      if (vars.x.size !== 2 || vars.y.size !== 1 || vars.vx.size !== 1 || vars.vy.size !== 1) throw new Error("Invalid runtime sprite variable layout");
      const bounds = { ...instruction.args[1] };
      ensureSpriteX(bounds.minX, "sprite minX"); ensureSpriteX(bounds.maxX, "sprite maxX");
      ensureByte(bounds.minY, "sprite minY"); ensureByte(bounds.maxY, "sprite maxY");
      if (bounds.minX > bounds.maxX || bounds.minY > bounds.maxY) throw new Error("sprite bounds minimum must not exceed maximum");
      const hitbox = spriteRef.hitbox;
      ensureByte(hitbox.offsetX, "hitbox offsetX"); ensureByte(hitbox.offsetY, "hitbox offsetY");
      ensurePositiveByte(hitbox.width, "hitbox width"); ensurePositiveByte(hitbox.height, "hitbox height");
      compileState.spriteRuntime[spriteRef.index] = { ref: spriteRef, bounds, frames: null, sequences: new Map(), flags: {}, initialY: spriteRef.initialY ?? 0 };
      if (compileState.multiplexer.enabled) emitStoreImmediate(asm, spriteRuntimeInternal(spriteRef.index).color, c64.COLOR_WHITE);
      emitSpriteRuntimeSync(asm, compileState, spriteRef);
      break;
    }
    case "spriteRuntimeData": {
      const spriteRef = instruction.args[0];
      getSpriteRuntime(compileState, spriteRef);
      const asset = emitSpriteDataAsset(asm, compileState, spriteRef.index, instruction.args[1], instruction.args[2], true);
      emitRuntimeSpritePointer(asm, compileState, spriteRef, asset.blockIndex);
      break;
    }
    case "spriteRuntimeColor": {
      const spriteRef = instruction.args[0];
      getSpriteRuntime(compileState, spriteRef);
      ensureByte(instruction.args[1], "sprite color");
      emitStoreImmediate(asm, spriteRuntimeInternal(spriteRef.index).color, instruction.args[1]);
      if (!compileState.multiplexer.enabled) emitStoreImmediate(asm, spriteColorAddress(spriteRef.index), instruction.args[1]);
      break;
    }
    case "spriteRuntimeFlag":
      getSpriteRuntime(compileState, instruction.args[0]).flags[instruction.args[1]] = Boolean(instruction.args[2]);
      emitRuntimeSpriteFlag(asm, compileState, instruction.args[0], instruction.args[1], Boolean(instruction.args[2]));
      break;
    case "spriteRuntimeBounds": {
      const runtime = getSpriteRuntime(compileState, instruction.args[0]);
      const bounds = instruction.args[1];
      ensureSpriteX(bounds.minX, "sprite minX"); ensureSpriteX(bounds.maxX, "sprite maxX");
      ensureByte(bounds.minY, "sprite minY"); ensureByte(bounds.maxY, "sprite maxY");
      runtime.bounds = { ...bounds };
      break;
    }
    case "spriteUseFrames": {
      const runtime = getSpriteRuntime(compileState, instruction.args[0]);
      const frameRef = instruction.args[1];
      const asset = compileState.spriteFrameAssets.get(frameRef.name);
      if (!asset) throw new Error(`Unknown sprite frames: ${frameRef.name}`);
      runtime.frames = asset;
      emitRuntimeSpritePointer(asm, compileState, instruction.args[0], asset.firstBlock);
      break;
    }
    case "spriteSequence": {
      const runtime = getSpriteRuntime(compileState, instruction.args[0]);
      if (!runtime.frames) throw new Error("sprite sequence needs a frames asset");
      const name = instruction.args[1];
      if (runtime.sequences.has(name)) throw new Error(`Sprite sequence already defined: ${name}`);
      if (runtime.sequences.size === 0 && !compileState.multiplexer.enabled) {
        const internal = spriteRuntimeInternal(instruction.args[0].index);
        asm.lda(imm(0));
        for (let offset = 0; offset <= 3; offset += 1) asm.sta(abs(internal.sequence + offset));
      }
      const indexes = instruction.args[2];
      if (indexes.length === 0) throw new Error("sprite sequence needs at least one frame index");
      indexes.forEach((index) => { if (!Number.isInteger(index) || index < 0 || index >= runtime.frames.count) throw new Error(`Invalid sprite frame index: ${index}`); });
      const options = instruction.args[3];
      ensurePositiveByte(options.speed, "sprite animation speed");
      const id = runtime.sequences.size;
      const tableLabel = `sprite_sequence_${instruction.args[0].index}_${name}`;
      registerData(compileState, tableLabel, indexes.map((index) => runtime.frames.firstBlock + index));
      runtime.sequences.set(name, { id, tableLabel, length: indexes.length, speed: options.speed, loop: options.loop });
      break;
    }
    case "spritePlaySequence":
      emitSpritePlaySequence(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "spritePauseSequence":
      emitStoreImmediate(asm, spriteRuntimeInternal(instruction.args[0].index).playing, 0);
      break;
    case "spriteResumeSequence":
      emitStoreImmediate(asm, spriteRuntimeInternal(instruction.args[0].index).playing, 1);
      break;
    case "spriteRuntimeSync":
      emitSpriteRuntimeSync(asm, compileState, instruction.args[0]);
      break;
    case "spriteRuntimeUpdate": {
      const runtime = getSpriteRuntime(compileState, instruction.args[0]);
      emitSpriteRuntimeMovement(asm, compileState, instruction.args[0], runtime);
      emitSpriteAnimationUpdate(asm, compileState, instruction.args[0], runtime);
      emitSpriteRuntimeSync(asm, compileState, instruction.args[0]);
      break;
    }
    case "spriteReverseVelocity": {
      const vars = spriteRefVariables(compileState, instruction.args[0]);
      emitNegateByteAt(asm, instruction.args[1] === "x" ? vars.vx.address : vars.vy.address);
      break;
    }
    case "spriteDisable":
      emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, instruction.args[0], false);
      break;
    case "spriteShow":
      emitSpriteSetX(asm, compileState, instruction.args[0], instruction.args[1]);
      emitSpriteSetY(asm, compileState, instruction.args[0], instruction.args[2]);
      if (instruction.args[3] !== undefined) {
        emitStoreImmediate(asm, spriteColorAddress(instruction.args[0]), instruction.args[3]);
      }
      emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, instruction.args[0], true);
      break;
    case "spriteHide":
      emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, instruction.args[0], false);
      break;
    case "spritePosition":
      emitSpriteSetX(asm, compileState, instruction.args[0], instruction.args[1]);
      emitSpriteSetY(asm, compileState, instruction.args[0], instruction.args[2]);
      break;
    case "spriteSetX":
      emitSpriteSetX(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "spriteSetY":
      emitSpriteSetY(asm, compileState, instruction.args[0], instruction.args[1]);
      break;
    case "spriteMoveX": {
      ensureSpriteIndex(instruction.args[0]);
      ensureSignedByte(instruction.args[1], "sprite dx");
      const current = compileState.spriteState[instruction.args[0]].x;
      if (current === null) {
        throw new Error(`sprite ${instruction.args[0]} x position is unknown; call position() or setX() first`);
      }
      emitSpriteSetX(asm, compileState, instruction.args[0], current + instruction.args[1]);
      break;
    }
    case "spriteMoveY": {
      ensureSpriteIndex(instruction.args[0]);
      ensureSignedByte(instruction.args[1], "sprite dy");
      const current = compileState.spriteState[instruction.args[0]].y;
      if (current === null) {
        throw new Error(`sprite ${instruction.args[0]} y position is unknown; call position() or setY() first`);
      }
      emitSpriteSetY(asm, compileState, instruction.args[0], current + instruction.args[1]);
      break;
    }
    case "spriteMoveToX": {
      ensureSpriteIndex(instruction.args[0]);
      ensureWord(instruction.args[1], "sprite targetX");
      ensurePositiveByte(instruction.args[2], "sprite speedX");
      const current = compileState.spriteState[instruction.args[0]].x;
      if (current === null) {
        throw new Error(`sprite ${instruction.args[0]} x position is unknown; call position() or setX() first`);
      }
      const animation = getOrCreateSpriteAnimation(compileState, instruction.args[0]);
      animation.x = {
        current,
        target: instruction.args[1],
        speed: instruction.args[2]
      };
      break;
    }
    case "spriteMoveToY": {
      ensureSpriteIndex(instruction.args[0]);
      ensureByte(instruction.args[1], "sprite targetY");
      ensurePositiveByte(instruction.args[2], "sprite speedY");
      const current = compileState.spriteState[instruction.args[0]].y;
      if (current === null) {
        throw new Error(`sprite ${instruction.args[0]} y position is unknown; call position() or setY() first`);
      }
      const animation = getOrCreateSpriteAnimation(compileState, instruction.args[0]);
      animation.y = {
        current,
        target: instruction.args[1],
        speed: instruction.args[2]
      };
      break;
    }
    case "spriteAnimateTo": {
      ensureSpriteIndex(instruction.args[0]);
      const animationArgs = instruction.args[1] ?? {};
      const animation = getOrCreateSpriteAnimation(compileState, instruction.args[0]);

      if (animationArgs.x !== undefined) {
        ensureWord(animationArgs.x, "sprite targetX");
        const current = compileState.spriteState[instruction.args[0]].x;
        if (current === null) {
          throw new Error(`sprite ${instruction.args[0]} x position is unknown; call position() or setX() first`);
        }
        animation.x = {
          current,
          target: animationArgs.x,
          speed: ensurePositiveByte(animationArgs.speedX ?? 1, "sprite speedX")
        };
      }

      if (animationArgs.y !== undefined) {
        ensureByte(animationArgs.y, "sprite targetY");
        const current = compileState.spriteState[instruction.args[0]].y;
        if (current === null) {
          throw new Error(`sprite ${instruction.args[0]} y position is unknown; call position() or setY() first`);
        }
        animation.y = {
          current,
          target: animationArgs.y,
          speed: ensurePositiveByte(animationArgs.speedY ?? 1, "sprite speedY")
        };
      }

      if (!animation.x && !animation.y) {
        throw new Error("sprite.animateTo() needs at least x or y");
      }
      break;
    }
    case "spriteStop":
      ensureSpriteIndex(instruction.args[0]);
      compileState.spriteAnimations[instruction.args[0]] = null;
      break;
    case "spriteStopX": {
      ensureSpriteIndex(instruction.args[0]);
      const animation = compileState.spriteAnimations[instruction.args[0]];
      if (animation) {
        animation.x = null;
        if (!animation.y) {
          compileState.spriteAnimations[instruction.args[0]] = null;
        }
      }
      break;
    }
    case "spriteStopY": {
      ensureSpriteIndex(instruction.args[0]);
      const animation = compileState.spriteAnimations[instruction.args[0]];
      if (animation) {
        animation.y = null;
        if (!animation.x) {
          compileState.spriteAnimations[instruction.args[0]] = null;
        }
      }
      break;
    }
    case "spriteColor":
      emitStoreImmediate(asm, spriteColorAddress(instruction.args[0]), instruction.args[1]);
      break;
    case "spriteData":
      emitSpriteData(asm, compileState, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "spritePointer":
      emitSpritePointer(asm, instruction.args[0], instruction.args[1]);
      break;
    case "spriteMulticolor":
      emitSetBitState(asm, c64.VIC_SPRITE_MULTICOLOR, instruction.args[0], Boolean(instruction.args[1]));
      break;
    case "spriteExpandX":
      emitSetBitState(asm, c64.VIC_SPRITE_EXPAND_X, instruction.args[0], Boolean(instruction.args[1]));
      break;
    case "spriteExpandY":
      emitSetBitState(asm, c64.VIC_SPRITE_EXPAND_Y, instruction.args[0], Boolean(instruction.args[1]));
      break;
    case "spritePriority":
      emitSetBitState(asm, c64.VIC_SPRITE_PRIORITY, instruction.args[0], Boolean(instruction.args[1]));
      break;
    case "spriteSharedColor1":
      emitStoreImmediate(asm, 0xd025, instruction.args[0]);
      break;
    case "spriteSharedColor2":
      emitStoreImmediate(asm, 0xd026, instruction.args[0]);
      break;
    case "spriteInstallAnimator":
      ensureWord(instruction.args[0], "sprite animator raster line");
      compileState.spriteAnimator.installRequested = true;
      compileState.spriteAnimator.line = instruction.args[0];
      break;
    case "asm":
      asm.emit(instruction.args[0], instruction.args[1]);
      break;
    case "irqAck":
    case "irqInstall":
    case "irqChainToKernal":
    case "irqDisableKernalTimer":
    case "irqEnableKernalTimer":
      break;
    default:
      throw new Error(`Unsupported DSL instruction: ${instruction.op}`);
  }
}

function emitRasterHandlers(asm, state) {
  const handlers = state.irq.handlers;
  if (handlers.length === 0) {
    return;
  }

  asm.comment("Raster IRQ dispatcher");
  asm.label("irq_dispatch");
  emitIrqPrologue(asm);

  // The vector at $0314 is shared by VIC-II raster IRQs and CIA IRQs.  A CIA
  // timer hit must never advance the raster state machine: doing so changes a
  // colour at an arbitrary scanline and makes split-screen effects flicker.
  // Acknowledge VIC immediately, then dispatch only when raster IRQ bit 0 is
  // actually set.  CIA IRQs are left to the KERNAL when chaining is enabled.
  asm.lda(abs(c64.VIC_IRQ_STATUS));
  asm.and(imm(0x01));
  asm.bne(rel("irq_dispatch_vic_raster"));

  if (state.irq.chainToKernal) {
    emitIrqExit(asm, true);
  } else {
    // No KERNAL chain was requested, so acknowledge both CIAs ourselves.  The
    // reads clear their pending interrupt flags and avoid an IRQ retrigger loop.
    asm.lda(abs(c64.CIA1_IRQ_CONTROL));
    asm.lda(abs(c64.CIA2_IRQ_CONTROL));
    emitIrqExit(asm, false, true);
  }

  asm.label("irq_dispatch_vic_raster");
  emitIrqAck(asm);

  asm.lda(abs(c64.IRQ_STATE_INDEX));

  for (let index = 0; index < handlers.length; index += 1) {
    const matchLabel = `irq_dispatch_match_${index}`;
    const nextLabel = `irq_dispatch_next_${index}`;
    asm.cmp(imm(index));
    asm.beq(rel(matchLabel));
    asm.jmp(abs(nextLabel));
    asm.label(matchLabel);
    asm.jmp(abs(`irq_handler_${index}`));
    asm.label(nextLabel);
  }

  asm.jmp(abs("irq_handler_0"));

  handlers.forEach((handler, index) => {
    asm.label(`irq_handler_${index}`);
    const handlerState = createInstructionCompileState(state);

    // Background runtimes piggyback on the first raster hit so they still run
    // once per frame even when several raster handlers are installed.
    if (index === 0) {
      if (state.sid.player.installRequested) {
        emitSidPlayerBody(asm, state);
      }
      if (state.spriteAnimator.installRequested) {
        emitSpriteAnimatorBody(asm, state);
      }
    }

    for (const instruction of handler.instructions) {
      compileHighLevelInstruction(asm, instruction, handlerState);
    }
    syncInstructionCompileState(state, handlerState);

    const nextIndex = (index + 1) % handlers.length;
    const nextLine = handlers[nextIndex].line;
    asm.lda(imm(nextIndex));
    asm.sta(abs(c64.IRQ_STATE_INDEX));
    setRasterLine(asm, nextLine);
    // The ROM IRQ trampoline already saved A/X/Y before jumping through $0314.
    // Raster IRQs therefore leave through the KERNAL epilogue at $EA81.  The
    // full $EA31 handler is intentionally used only for CIA IRQs above: running
    // it once per raster split creates variable work and disturbs timing.
    emitIrqExit(asm, false, true);
  });
}

function emitVideoStandardDetection(asm, prefix = "game_video") {
  emitStoreImmediate(asm, GAME_VIDEO_HZ, 60);
  // PAL reaches raster lines above 287; NTSC leaves the high-raster phase
  // before the low byte reaches $20.
  const detectLowLabel = `${prefix}_detect_low`;
  const detectHighLabel = `${prefix}_detect_high`;
  const detectScanLabel = `${prefix}_detect_scan`;
  const detectPalLabel = `${prefix}_detect_pal`;
  const detectDoneLabel = `${prefix}_detect_done`;
  asm.label(detectLowLabel);
  asm.lda(abs(c64.VIC_CONTROL_1));
  asm.bmi(rel(detectLowLabel));
  asm.label(detectHighLabel);
  asm.lda(abs(c64.VIC_CONTROL_1));
  asm.bpl(rel(detectHighLabel));
  asm.label(detectScanLabel);
  asm.lda(abs(c64.VIC_CONTROL_1));
  asm.bpl(rel(detectDoneLabel));
  asm.lda(abs(c64.VIC_RASTER));
  asm.cmp(imm(0x20));
  asm.bcs(rel(detectPalLabel));
  asm.jmp(abs(detectScanLabel));
  asm.label(detectPalLabel);
  emitStoreImmediate(asm, GAME_VIDEO_HZ, 50);
  asm.label(detectDoneLabel);
}

function validateGameScenes(state) {
  if (!state.game.frame?.sceneManaged) return;
  const startName = state.game.sceneStart?.name;
  if (!startName) throw new Error("c64.game.start() needs a starting scene");
  if (!state.game.scenes.has(startName)) throw new Error(`Starting game scene ${startName} is not declared`);
  for (const name of state.game.referencedScenes) {
    if (!state.game.scenes.has(name)) throw new Error(`Game scene ${name} is referenced but not declared`);
  }
}

function emitGameSceneApplyTransitionRoutine(asm) {
  asm.comment("Apply at most one requested scene transition between frames");
  asm.label("game_scene_apply_transition");
  asm.lda(abs(GAME_SCENE_PENDING));
  asm.cmp(imm(GAME_SCENE_NONE));
  asm.bne(rel("game_scene_transition_requested"));
  asm.rts();
  asm.label("game_scene_transition_requested");
  asm.cmp(abs(GAME_SCENE_CURRENT));
  asm.bne(rel("game_scene_transition_changed"));
  emitStoreImmediate(asm, GAME_SCENE_PENDING, GAME_SCENE_NONE);
  asm.rts();
  asm.label("game_scene_transition_changed");
  asm.pha();
  emitStoreImmediate(asm, GAME_SCENE_PENDING, GAME_SCENE_NONE);
  asm.jsr(abs("game_scene_exit_dispatch"));
  asm.pla();
  asm.sta(abs(GAME_SCENE_CURRENT));
  asm.jsr(abs("game_scene_enter_dispatch"));
  asm.rts();
}

function emitGameSceneDispatchRoutine(asm, state, phase) {
  const dispatchLabel = `game_scene_${phase}_dispatch`;
  asm.label(dispatchLabel);
  for (const scene of state.game.scenes.values()) {
    const nextLabel = `${dispatchLabel}_next_${scene.id}`;
    asm.lda(abs(GAME_SCENE_CURRENT));
    asm.cmp(imm(scene.id));
    asm.bne(rel(nextLabel));
    if (scene[phase].length > 0) asm.jsr(abs(`game_scene_${scene.name}_${phase}`));
    asm.rts();
    asm.label(nextLabel);
  }
  asm.rts();
}

function emitGameSceneRoutines(asm, state) {
  if (!state.game.frame?.sceneManaged) return;
  emitGameSceneApplyTransitionRoutine(asm);
  for (const phase of ["enter", "update", "exit"]) emitGameSceneDispatchRoutine(asm, state, phase);
  for (const scene of state.game.scenes.values()) {
    for (const phase of ["enter", "update", "exit"]) {
      if (scene[phase].length === 0) continue;
      asm.comment(`Scene ${scene.name}: ${phase}`);
      asm.label(`game_scene_${scene.name}_${phase}`);
      for (const instruction of scene[phase]) compileHighLevelInstruction(asm, instruction, state);
      asm.rts();
    }
  }
}

function emitGameFrameLoop(asm, state) {
  const frame = state.game.frame;
  if (!frame) {
    return;
  }
  validateGameScenes(state);
  // Multiplexed games update logical state late in the visible frame. Sorting
  // follows, but VIC registers are not touched until the next raster wrap.
  const scrollingFrameLine = [...state.assets.scrollers.values()][0]?.recommendedFrameRasterLine;
  const rasterLine = state.multiplexer.enabled
    ? SPRITE_MUX_FRAME_RASTER
    : (frame.options?.rasterLine ?? scrollingFrameLine ?? 240);
  const hz = frame.options?.hz ?? 50;
  ensureByte(rasterLine, "game frame raster line");
  if (hz !== 50 && hz !== "video") {
    throw new Error("c64.game.frame() supports hz: 50 or hz: \"video\"");
  }

  asm.comment("Deterministic game frame loop");
  emitStoreImmediate(asm, GAME_FRAME_COUNTER_LO, 0);
  emitStoreImmediate(asm, GAME_FRAME_COUNTER_HI, 0);
  emitStoreImmediate(asm, GAME_RATE_ACCUMULATOR, 0);
  for (const task of state.game.everyTasks) emitStoreImmediate(asm, task.runtimeCounterAddress, 0);
  for (const port of state.input.joystickPorts) {
    const addresses = joystickSnapshotAddresses(port);
    emitStoreImmediate(asm, addresses.current, 0xff);
    emitStoreImmediate(asm, addresses.previous, 0xff);
  }
  for (const keyCode of state.input.keyboardKeys) {
    const addresses = keyboardSnapshotAddresses(state, keyCode);
    emitStoreImmediate(asm, addresses.current, 1);
    emitStoreImmediate(asm, addresses.previous, 1);
  }

  emitVideoStandardDetection(asm);
  if (frame.sceneManaged) {
    emitStoreImmediate(asm, GAME_SCENE_CURRENT, gameSceneId(state.game.sceneStart.name));
    emitStoreImmediate(asm, GAME_SCENE_PENDING, GAME_SCENE_NONE);
    asm.jsr(abs("game_scene_enter_dispatch"));
  }

  const loopLabel = "game_frame_loop";
  const waitLeaveLabel = "game_frame_wait_leave";
  const waitTargetLabel = "game_frame_wait_target";
  asm.label(loopLabel);
  // First leave the target line, then wait until it is reached again. This
  // guarantees one logical update per video frame rather than many iterations
  // while $D012 still contains the same line number.
  asm.label(waitLeaveLabel);
  asm.lda(abs(c64.VIC_RASTER));
  asm.cmp(imm(rasterLine));
  asm.beq(rel(waitLeaveLabel));
  asm.label(waitTargetLabel);
  asm.lda(abs(c64.VIC_RASTER));
  asm.cmp(imm(rasterLine));
  asm.bne(rel(waitTargetLabel));

  if (hz === 50) {
    const logicalFrameLabel = "game_frame_logical_tick";
    asm.clc();
    asm.lda(abs(GAME_RATE_ACCUMULATOR));
    asm.adc(imm(50));
    asm.sta(abs(GAME_RATE_ACCUMULATOR));
    asm.cmp(abs(GAME_VIDEO_HZ));
    asm.bcs(rel(logicalFrameLabel));
    asm.jmp(abs(loopLabel));
    asm.label(logicalFrameLabel);
    asm.sec();
    asm.lda(abs(GAME_RATE_ACCUMULATOR));
    asm.sbc(abs(GAME_VIDEO_HZ));
    asm.sta(abs(GAME_RATE_ACCUMULATOR));
  }

  for (const port of state.input.joystickPorts) {
    const addresses = joystickSnapshotAddresses(port);
    asm.lda(abs(addresses.current));
    asm.sta(abs(addresses.previous));
    if (port === 1) {
      // Joystick 1 shares CIA1 port B with the keyboard matrix. Temporarily
      // release every keyboard row, read PRB, then restore the exact CIA setup.
      asm.lda(abs(c64.CIA1_PRA));
      asm.sta(abs(INPUT_SAVE_PRA));
      asm.lda(abs(c64.CIA1_DDRA));
      asm.sta(abs(INPUT_SAVE_DDRA));
      asm.lda(abs(c64.CIA1_DDRB));
      asm.sta(abs(INPUT_SAVE_DDRB));
      asm.lda(imm(0xff));
      asm.sta(abs(c64.CIA1_DDRA));
      asm.sta(abs(c64.CIA1_PRA));
      asm.lda(imm(0x00));
      asm.sta(abs(c64.CIA1_DDRB));
      asm.lda(abs(c64.JOYSTICK_PORT_1));
      asm.sta(abs(addresses.current));
      asm.lda(abs(INPUT_SAVE_PRA));
      asm.sta(abs(c64.CIA1_PRA));
      asm.lda(abs(INPUT_SAVE_DDRA));
      asm.sta(abs(c64.CIA1_DDRA));
      asm.lda(abs(INPUT_SAVE_DDRB));
      asm.sta(abs(c64.CIA1_DDRB));
      continue;
    }
    asm.lda(abs(c64.JOYSTICK_PORT_2));
    asm.sta(abs(addresses.current));
  }

  if (state.input.keyboardKeys.size > 0) {
    asm.lda(abs(c64.CIA1_PRA)); asm.sta(abs(INPUT_SAVE_PRA));
    asm.lda(abs(c64.CIA1_DDRA)); asm.sta(abs(INPUT_SAVE_DDRA));
    asm.lda(abs(c64.CIA1_DDRB)); asm.sta(abs(INPUT_SAVE_DDRB));
    asm.lda(imm(0xff)); asm.sta(abs(c64.CIA1_DDRA));
    asm.lda(imm(0x00)); asm.sta(abs(c64.CIA1_DDRB));
    for (const keyCode of state.input.keyboardKeys) {
      const addresses = keyboardSnapshotAddresses(state, keyCode);
      const row = Math.floor(keyCode / 8);
      const columnMask = 1 << (keyCode % 8);
      const pressedLabel = `keyboard_scan_pressed_${keyCode}`;
      const storedLabel = `keyboard_scan_stored_${keyCode}`;
      asm.lda(abs(addresses.current)); asm.sta(abs(addresses.previous));
      asm.lda(imm(0xff ^ (1 << row))); asm.sta(abs(c64.CIA1_PRA));
      asm.lda(abs(c64.CIA1_PRB)); asm.and(imm(columnMask));
      asm.beq(rel(pressedLabel));
      asm.lda(imm(1)); asm.jmp(abs(storedLabel));
      asm.label(pressedLabel); asm.lda(imm(0));
      asm.label(storedLabel); asm.sta(abs(addresses.current));
    }
    asm.lda(abs(INPUT_SAVE_PRA)); asm.sta(abs(c64.CIA1_PRA));
    asm.lda(abs(INPUT_SAVE_DDRA)); asm.sta(abs(c64.CIA1_DDRA));
    asm.lda(abs(INPUT_SAVE_DDRB)); asm.sta(abs(c64.CIA1_DDRB));
  }
  if (state.game.usesVicSpriteCollision) {
    asm.lda(abs(c64.VIC_SPRITE_SPRITE_COLLISION));
    asm.sta(abs(VIC_SPRITE_COLLISION_SNAPSHOT));
  }
  if (state.game.usesVicBackgroundCollision) {
    asm.lda(abs(c64.VIC_SPRITE_BACKGROUND_COLLISION));
    asm.sta(abs(VIC_BACKGROUND_COLLISION_SNAPSHOT));
  }

  asm.inc(abs(GAME_FRAME_COUNTER_LO));
  const counterDoneLabel = `game_frame_counter_done_${state.loopCounter++}`;
  asm.bne(rel(counterDoneLabel));
  asm.inc(abs(GAME_FRAME_COUNTER_HI));
  asm.label(counterDoneLabel);

  if (frame.sceneManaged) {
    asm.jsr(abs("game_scene_update_dispatch"));
    asm.jsr(abs("game_scene_apply_transition"));
  } else {
    for (const instruction of frame.instructions) compileHighLevelInstruction(asm, instruction, state);
  }

  emitPendingMapActivation(asm, state);

  if (state.multiplexer.enabled) {
    asm.jsr(abs("runtime_sprite_mux_render"));
  }
  asm.jmp(abs(loopLabel));
}

function emitStringPool(asm, state) {
  if (state.stringPool.size === 0) {
    return;
  }

  asm.comment("String pool");
  for (const entry of state.stringPool.values()) {
    asm.label(entry.label);
    asm.byte(entry.bytes);
  }
}

function emitDataPool(asm, state) {
  if (state.dataPool.size === 0) {
    return;
  }

  asm.comment("User data");
  for (const [name, bytes] of state.dataPool.entries()) {
    asm.label(name);
    asm.byte(bytes);
  }
}

function buildCompileResult(finalBytes, asm, codeStart, sysAddress) {
  // A single compilation produces several representations of the same program.
  const symbols = asm.getSymbolTable();
  const asmText = asm.toAsm();
  const listingText = asm.toListing();
  const dataText = exportBasicData(finalBytes);
  const basicText = createBasicDataProgram(finalBytes, sysAddress);

  return {
    origin: codeStart,
    sysAddress,
    bytes: finalBytes,
    prgBytes: createPrg(finalBytes, sysAddress, 0x0801, codeStart),
    asm: asmText,
    asmText,
    listing: listingText,
    listingText,
    symbols,
    data: dataText,
    dataText,
    basicProgram: basicText,
    basicText
  };
}

function buildDetailedMemoryReport(state, codeStart, finalBytes) {
  const ranges = [];
  const add = (name, start, end, kind, details = {}) => {
    if (!Number.isInteger(start) || !Number.isInteger(end) || end < start) return;
    ranges.push({ name, kind, start, end, bytes: end - start + 1, ...details });
  };
  add("program", codeStart, codeStart + finalBytes.length - 1, "program");
  add("screen RAM", state.screenBase, state.screenBase + 999, "video");
  add("color RAM", state.colorBase, state.colorBase + 999, "video");
  for (const range of RESERVED_RUNTIME_RANGES) add(range.name, range.start, range.end, "runtime");
  for (const [name, variable] of state.variables) {
    if (isCompilerSpriteVariable(name, variable.address, variable.size)) continue;
    add(`variable ${name}`, variable.address, variable.address + variable.size - 1, "variable");
  }
  if (state.disk.enabled && state.assets.mapTables.size > 0) {
    const largestMap = Math.max(...[...state.assets.mapTables.values()].map((info) => info.asset.map.data.length));
    add("active disk map slot", MAP_RUNTIME_BASE, MAP_RUNTIME_BASE + largestMap - 1, "map", { shared: true });
    const largestTables = Math.max(...[...state.assets.mapTables.values()].map((info) => info.tablesDiskAsset?.bytes ?? 0));
    if (largestTables > 0) add("active disk level tables", MAP_DISK_TABLE_BASE, MAP_DISK_TABLE_BASE + largestTables - 1, "map", { shared: true });
  } else {
    for (const info of state.assets.mapTables.values()) add(`map ${info.id}`, info.runtimeAddress, info.runtimeAddress + info.asset.map.data.length - 1, "map", { sourcePath: info.asset.sourcePath });
  }
  const seenCharsets = new Set();
  for (const entry of state.assets.report.filter(item => item.type === "charset")) {
    const key = `${entry.address}:${entry.endAddress}`;
    if (seenCharsets.has(key)) continue;
    seenCharsets.add(key);
    add("charset", entry.address, entry.endAddress, "charset", { mode: entry.mode });
  }
  for (const entry of state.assets.report.filter(item => item.type === "map-scroll-blank-charset")) {
    add("map scroll blank charset", entry.address, entry.endAddress, "charset");
  }
  const seenSpriteRanges = new Set();
  for (const asset of state.spriteDataAssets.values()) {
    const key = `${asset.targetAddress}:${asset.length}`;
    if (!seenSpriteRanges.has(key)) {
      seenSpriteRanges.add(key);
      add("sprite data", asset.targetAddress, asset.targetAddress + asset.length - 1, "sprite");
    }
  }
  for (const asset of state.spriteFrameAssets.values()) {
    const length = asset.count * 64;
    const key = `${asset.address}:${length}`;
    if (!seenSpriteRanges.has(key)) {
      seenSpriteRanges.add(key);
      add("sprite frames", asset.address, asset.address + length - 1, "sprite");
    }
  }
  const conflicts = [];
  for (let left = 0; left < ranges.length; left++) {
    for (let right = left + 1; right < ranges.length; right++) {
      const a = ranges[left];
      const b = ranges[right];
      if (a.end < b.start || b.end < a.start) continue;
      // Color RAM is I/O memory and intentionally shares the CPU address space;
      // duplicate sprite range registrations were removed above.
      conflicts.push({ first: a.name, second: b.name, start: Math.max(a.start, b.start), end: Math.min(a.end, b.end) });
    }
  }
  return {
    type: "memory-layout",
    ranges: ranges.sort((a, b) => a.start - b.start),
    conflicts,
    programBytes: finalBytes.length,
    assetBytes: ranges.filter(range => ["charset", "map", "sprite"].includes(range.kind)).reduce((sum, range) => sum + range.bytes, 0)
  };
}

function appendGameplayBudgetReports(state) {
  const runtimes = state.spriteRuntime.filter(Boolean);
  const entities = [...state.assets.entities.values()];
  if (runtimes.length === 0 && entities.length === 0) return;
  const spriteMemoryBytes = state.assets.report
    .filter((entry) => entry.type === "sprite-asset")
    .reduce((sum, entry) => sum + entry.bytes, 0);
  const entityReport = {
    type: "map-entity-budget",
    entityCount: entities.length,
    logicalSpriteCount: runtimes.length,
    physicalSprites: runtimes.filter((runtime) => runtime.ref.index < 8).length,
    virtualSprites: runtimes.filter((runtime) => runtime.ref.index >= 8).length,
    maxVisibleEntities: Math.min(16, entities.length),
    spriteMemoryBytes
  };
  state.assets.report.push(entityReport);
  if (!state.multiplexer.enabled) return;

  const entries = runtimes.map((runtime) => {
    const entity = entities.find((candidate) => candidate.sprite.index === runtime.ref.index);
    return {
      index: runtime.ref.index,
      y: entity?.object.worldY ?? runtime.initialY,
      height: runtime.flags.expandY ? 42 : 21
    };
  }).sort((left, right) => left.y - right.y || left.index - right.index);
  const events = entries.flatMap((entry) => [
    { y: entry.y, delta: 1 },
    { y: entry.y + entry.height, delta: -1 }
  ]).sort((left, right) => left.y - right.y || left.delta - right.delta);
  let overlap = 0;
  let maxOverlap = 0;
  for (const event of events) {
    overlap += event.delta;
    maxOverlap = Math.max(maxOverlap, overlap);
  }
  const slots = [];
  let minimumGap = null;
  let overflowCount = 0;
  for (const entry of entries) {
    if (slots.length < 8) {
      slots.push(entry.y + entry.height);
      continue;
    }
    const earliest = Math.min(...slots);
    const slot = slots.indexOf(earliest);
    const gap = entry.y - earliest;
    if (gap < 0) {
      overflowCount += 1;
      continue;
    }
    minimumGap = minimumGap === null ? gap : Math.min(minimumGap, gap);
    slots[slot] = entry.y + entry.height;
  }
  const requiredGap = 3;
  const unsafeGap = minimumGap !== null && minimumGap < requiredGap;
  const report = {
    type: "sprite-multiplexer-budget",
    logicalSprites: entries.length,
    hardwareSlots: 8,
    initialMaxRasterOverlap: maxOverlap,
    maxRasterBudget: 8,
    minimumReprogramGapLines: minimumGap,
    requiredReprogramGapLines: requiredGap,
    predictedOverflowSprites: overflowCount,
    overflowPolicy: "stable-y-sort-then-skip-later-sprites-until-a-hardware-slot-is-free",
    deterministic: true,
    status: overflowCount > 0 || unsafeGap ? "warning" : "ok"
  };
  state.assets.report.push(report);
  if (overflowCount > 0 || unsafeGap) {
    const reason = overflowCount > 0
      ? `${maxOverlap} sprites overlap the same raster band; ${overflowCount} later sprite(s) can be hidden for that frame`
      : `only ${minimumGap} raster line(s) remain to reprogram a VIC-II sprite (recommended: ${requiredGap})`;
    state.assets.report.push({
      type: "warning",
      code: "SPRITE_RASTER_BUDGET",
      message: `${reason}. Move sprites farther apart vertically or reduce their expanded height.`,
      details: report
    });
  }
}

function appendGameContractReport(state) {
  if (state.game.scenes.size === 0 && !state.assets.activationUsed && state.game.fixedPools.size === 0 && state.game.counters.size === 0 && !state.optimization.usesRng) return;
  state.assets.report.push({
    type: "game-runtime",
    scenes: [...state.game.scenes.keys()],
    startScene: state.game.sceneStart?.name ?? null,
    transitionPolicy: state.game.scenes.size > 0 ? "one-request-between-frames" : null,
    activeMapContract: state.assets.activationUsed,
    mapActivationPolicy: state.assets.activationUsed ? "deferred-after-frame-or-before-first-frame" : null,
    registeredMaps: state.assets.mapTables.size,
    sharedMapRamSlot: state.disk.enabled,
    deterministicRng: state.optimization.usesRng,
    fixedPools: [...state.game.fixedPools].map(([name, size]) => ({ name, size })),
    counters: [...state.game.counters.values()].map((counter) => ({ name: counter.name, digits: counter.digits, storage: "unpacked-bcd" }))
  });
}

function appendDiskAssetReport(state, programBytes) {
  if (!state.disk.enabled) return;
  const maps = [...state.assets.mapTables.values()];
  const levelDependencies = maps.map((info) => ({
    mapId: info.id,
    sourcePath: info.asset.sourcePath,
    files: [info.mapDiskAsset, info.tablesDiskAsset, info.charsetDiskAsset, ...info.diskSpriteDependencies.values()]
      .filter(Boolean)
      .map((descriptor) => descriptor.name)
  }));
  state.assets.report.push({
    type: "disk-assets",
    device: state.disk.device,
    mainProgramStorage: "prg",
    assetFileType: "prg-data-module",
    files: state.disk.files.map(({ name, kind, address, bytes, sourcePath }) => ({ name, kind, address, bytes, sourcePath })),
    levelDependencies,
    mainProgramBytes: programBytes,
    assetBytes: state.disk.files.reduce((sum, file) => sum + file.bytes, 0),
    sharedMapRamSlot: maps.length > 0,
    activeMapSlotAddress: maps.length > 0 ? MAP_RUNTIME_BASE : null,
    largestMapBytes: maps.length > 0 ? Math.max(...maps.map((info) => info.asset.map.data.length)) : 0
  });
  if (maps.length > 0 && !maps.some((info) => info.activationRequested)) {
    state.assets.report.push({
      type: "warning",
      code: "DISK_MAP_NOT_ACTIVATED",
      message: "Disk-backed maps are declared but no mapAsset.activate() call is present; the active map slot will remain empty."
    });
  }
  const usedLevelSprites = new Set(maps.flatMap((info) => [...info.diskSpriteDependencies.keys()]));
  for (const frameAsset of state.spriteFrameAssets.values()) {
    if (!frameAsset.resident && frameAsset.diskDescriptor && !usedLevelSprites.has(frameAsset.diskDescriptor.name)) {
      state.assets.report.push({
        type: "warning",
        code: "DISK_SPRITE_NOT_ACTIVATED",
        message: `Non-resident sprite ${frameAsset.diskDescriptor.sourcePath} is never listed in mapAsset.activate({ sprites: [...] }).`
      });
    }
  }
}

function appendSidAudioReport(state) {
  const song = state.sid.player.song;
  const effectCalls = state.optimization.sidEffectCount;
  const reservedSfxVoice = state.sid.player.sfxVoice;
  if (!song && effectCalls === 0 && reservedSfxVoice === null) return;

  const musicVoices = song ? sidMusicVoices(state) : [];
  const omittedVoiceBytes = song && reservedSfxVoice !== null ? song.length * 3 : 0;
  const report = {
    type: "sid-audio",
    player: Boolean(song),
    tempo: song?.tempo ?? null,
    expandedSteps: song?.expandedLength ?? null,
    storedSteps: song?.length ?? null,
    logicalTickRateHz: song ? 50 : null,
    videoStandardCompensation: song ? "automatic-pal-ntsc" : null,
    loop: song?.loop ?? false,
    musicVoices,
    reservedSfxVoice,
    effectCalls,
    fadeCalls: state.optimization.sidFadeCount,
    patterns: song?.patterns.map((pattern) => ({
      name: pattern.name,
      uses: pattern.uses,
      sourceEntries: pattern.sourceEntries
    })) ?? [],
    instruments: song?.instruments.map((instrument, index) => (
      instrument ? { voice: index + 1, name: instrument.name, waveform: instrument.waveform } : null
    )).filter(Boolean) ?? [],
    omittedReservedVoiceBytes: omittedVoiceBytes,
    compactedRepeatTableBytes: song ? song.compactedRepeatSteps * 3 * musicVoices.length : 0,
    pooledIdenticalVoiceTableBytes: song?.pooledVoiceTableBytes ?? 0,
    priorityPolicy: reservedSfxVoice === null ? "shared-voice-warning" : "reserved-sfx-voice"
  };
  state.assets.report.push(report);

  if (song && reservedSfxVoice !== null && song.voices[reservedSfxVoice - 1].hasNotes) {
    state.assets.report.push({
      type: "warning",
      code: "SID_RESERVED_VOICE_MUSIC_DATA",
      message: `SID voice ${reservedSfxVoice} is reserved for effects; its music notes are omitted from the PRG. Use rests on that song voice.`,
      details: report
    });
  } else if (song && effectCalls > 0 && reservedSfxVoice === null && song.voices[0].hasNotes) {
    state.assets.report.push({
      type: "warning",
      code: "SID_VOICE_CONFLICT",
      message: "Music and sound effects both modify SID voice 1. Call c64.sid.reserveSfxVoice(1..3) before playSong().",
      details: report
    });
  }
}

function appendOptimizationReport(state, finalBytes) {
  const candidates = state.optimization.rleCandidates;
  const profileFor = (mode) => {
    let assetProgramBytesEstimate = 0;
    let startupCyclesEstimate = 0;
    let compressedChunks = 0;
    for (const candidate of candidates) {
      const useRle = candidate.encodedBytes <= 255
        && shouldUseAssetRle(mode, candidate.netSavedBytes);
      assetProgramBytesEstimate += useRle ? candidate.rleProgramBytes : candidate.rawProgramBytes;
      startupCyclesEstimate += useRle ? candidate.rleCyclesEstimate : candidate.rawCyclesEstimate;
      if (useRle) compressedChunks += 1;
    }
    return {
      mode,
      assetProgramBytesEstimate,
      startupCyclesEstimate: Math.round(startupCyclesEstimate),
      compressedChunks,
      runtimeStrategy: mode === "speed" ? "inline-hot-paths" : "shared-repeated-routines"
    };
  };
  const profiles = ["size", "balanced", "speed"].map(profileFor);
  const selectedProfile = profiles.find((profile) => profile.mode === state.optimization.mode);
  for (const profile of profiles) {
    profile.estimatedProgramBytes = finalBytes.length
      + profile.assetProgramBytesEstimate
      - selectedProfile.assetProgramBytesEstimate;
    if (profile.mode === state.optimization.mode) profile.programBytes = finalBytes.length;
  }

  const omittedRoutines = [];
  if (!state.sid.player.installRequested) omittedRoutines.push("sid-player");
  if (state.optimization.sidFadeCount === 0) omittedRoutines.push("sid-fade");
  if (!state.spriteAnimator.installRequested) omittedRoutines.push("sprite-animator");
  if (!state.multiplexer.enabled) omittedRoutines.push("sprite-multiplexer");
  if (state.assets.mapTables.size === 0) omittedRoutines.push("map-runtime");
  if (!state.assets.activationUsed) omittedRoutines.push("map-activation");
  if (state.game.scenes.size === 0) omittedRoutines.push("game-scenes");
  if (!state.hires.runtimeNeeded) omittedRoutines.push("hires-runtime");

  const logicalSpriteCount = state.spriteRuntime.filter(Boolean).length;
  const muxSortComparisonsWorstCase = state.multiplexer.enabled
    ? (logicalSpriteCount * Math.max(0, logicalSpriteCount - 1)) / 2
    : 0;
  // Conservative, documented estimates for the generated insertion sort and
  // VIC-II channel projection. They make the optional multiplexer cost visible
  // in build reports without changing its deterministic runtime.
  const multiplexerProfile = {
    enabled: state.multiplexer.enabled,
    logicalSprites: logicalSpriteCount,
    sortComparisonsWorstCase: muxSortComparisonsWorstCase,
    sortCyclesEstimate: state.multiplexer.enabled ? muxSortComparisonsWorstCase * 34 : 0,
    projectionCyclesEstimate: state.multiplexer.enabled ? logicalSpriteCount * 96 : 0,
    totalCyclesEstimate: state.multiplexer.enabled
      ? muxSortComparisonsWorstCase * 34 + logicalSpriteCount * 96
      : 0
  };

  state.assets.report.push({
    type: "optimization-summary",
    mode: state.optimization.mode,
    programBytes: finalBytes.length,
    profiles,
    rle: {
      candidates: candidates.length,
      compressedChunks: candidates.filter((candidate) => candidate.compressed).length,
      rawBytes: candidates.reduce((sum, candidate) => sum + candidate.rawBytes, 0),
      storedBytes: candidates.reduce((sum, candidate) => sum + (candidate.compressed ? candidate.encodedBytes : candidate.rawBytes), 0),
      estimatedNetSavedBytes: candidates.filter((candidate) => candidate.compressed)
        .reduce((sum, candidate) => sum + candidate.netSavedBytes, 0)
    },
    sharedRoutines: {
      sidClick: state.sharedRoutines.sidClick,
      spriteSync: state.sharedRoutines.spriteSyncIndexes.size,
      spriteAabb: state.sharedRoutines.spriteAabbCompare
    },
    omittedRoutines,
    audio: {
      compactedRepeatTableBytes: state.sid.player.song
        ? state.sid.player.song.compactedRepeatSteps * 3 * sidMusicVoices(state).length
        : 0,
      pooledIdenticalVoiceTableBytes: state.sid.player.song?.pooledVoiceTableBytes ?? 0
    },
    multiplexer: multiplexerProfile
  });
}

function sanitizeInlineSource(source) {
  // compileJsToC64Outputs() accepts a code string. We allow a simple
  // `import { c64 } ...` line, then strip it because the runtime already
  // injects c64 for us.
  if (typeof source !== "string") {
    throw new Error("compileJsToC64Outputs(source) expects source to be a string");
  }

  const withoutC64Imports = source
    .replace(/^\s*import\s+\{\s*c64\s*\}\s+from\s+["'][^"']+["'];?\s*$/gm, "")
    .replace(/^\s*import\s+\{\s*c64\s*,[\s\S]*?\}\s+from\s+["'][^"']+["'];?\s*$/gm, "")
    .trim();

  if (/\bimport\s+/.test(withoutC64Imports) || /\bexport\s+/.test(withoutC64Imports)) {
    throw new Error("compileJsToC64Outputs() currently accepts DSL source without ESM import/export statements, except a simple `import { c64 } ...` line which is optional");
  }

  return withoutC64Imports;
}

async function executeInlineSource(source) {
  const sanitizedSource = sanitizeInlineSource(source);
  const runner = new AsyncFunction("c64", sanitizedSource);
  await runner(c64);
}

function normalizeCompileOptions(options = {}, forInlineSource = false) {
  // Inline source often wants codeStart and SYS to match, especially when
  // generating BASIC DATA loaders for custom addresses like 49152.
  const normalized = { ...options };
  if (forInlineSource && normalized.codeStart === undefined && normalized.sysAddress !== undefined) {
    normalized.codeStart = normalized.sysAddress;
  }
  return normalized;
}

export function compileInstructions(instructions, options = {}) {
  // This is the main entry point for compilation once the DSL instructions
  // already exist in memory.
  const programConfigs = instructions.filter((instruction) => instruction.op === "programConfig");
  if (programConfigs.length > 1) throw new Error("c64.program.start() can only be declared once");
  const programConfig = programConfigs[0]?.args[0] ?? {};
  const sidReservations = instructions.filter((instruction) => instruction.op === "sidReserveSfxVoice");
  if (sidReservations.length > 1) throw new Error("c64.sid.reserveSfxVoice() can only be declared once");
  const reservedSfxVoice = sidReservations[0]?.args[0] ?? null;
  if (reservedSfxVoice !== null) ensureSidVoice(reservedSfxVoice);
  const codeStart = options.codeStart ?? programConfig.codeStart ?? DEFAULT_CODE_START;
  const sysAddress = options.sysAddress ?? programConfig.sysAddress ?? (programConfig.codeStart ?? DEFAULT_SYS_ADDRESS);
  const optimizationMode = normalizeOptimizationMode(options.opt);
  const assetStorage = options.assets ?? "inline";
  if (!["inline", "disk"].includes(assetStorage)) throw new Error("asset storage must be inline or disk");
  const diskDevice = options.device ?? 8;
  if (!Number.isInteger(diskDevice) || diskDevice < 4 || diskDevice > 30) throw new Error("disk device must be between 4 and 30");
  const asm = new Assembler6502(codeStart);
  const optimization = collectBalancedOptimizationStats([
    instructions,
    ...(options.irqHandlers ?? []).map((handler) => handler.instructions)
  ]);
  optimization.mode = optimizationMode;
  optimization.rleCandidates = [];
  // compileState is the compiler's working memory. It tracks the current text
  // color, string/data pools, user variables, sprite state and optional IRQs.
  const state = {
    currentTextColor: 1,
    screenBase: 0x0400,
    colorBase: 0xd800,
    stringPool: new Map(),
    dataPool: new Map(),
    variables: new Map(),
    nextAutoVariableAddress: AUTO_VARIABLE_START,
    spriteState: Array.from({ length: SPRITE_LOGICAL_COUNT }, () => ({ x: null, y: null, dataAddress: null, dataLength: null })),
    spriteAnimations: Array.from({ length: SPRITE_LOGICAL_COUNT }, () => null),
    spriteRuntime: Array.from({ length: SPRITE_LOGICAL_COUNT }, () => null),
    spriteFrameAssets: new Map(),
    spriteDataAssets: new Map(),
    nextSpriteFrameAddress: assetStorage === "disk" ? 0x2000 : 0x3000,
    sharedRoutines: {
      sidClick: false,
      spriteSyncIndexes: new Set(),
      spriteAabbCompare: false
    },
    assets: {
      counter: 0,
      report: [],
      mapTables: new Map(),
      scrollers: new Map(),
      entities: new Map(),
      spriteAssets: new Map(),
      bytePool: new Map(),
      nextMapAddress: MAP_RUNTIME_BASE,
      activationUsed: optimization.usesMapActivation || assetStorage === "disk"
    },
    disk: {
      enabled: assetStorage === "disk",
      device: diskDevice,
      files: [],
      assetPool: new Map(),
      nameCounters: new Map(),
      loaderNeeded: false
    },
    optimization,
    multiplexer: {
      enabled: optimization.usesSpriteMultiplexer
    },
    spriteAnimator: {
      installRequested: false,
      line: 250
    },
    spriteAnimationBase: RUNTIME_RAM_LAYOUT.spriteAnimatorBase,
    spriteDataCounter: 0,
    stringCounter: 0,
    loopCounter: 0,
    input: {
      joystickPorts: new Set(),
      keyboardKeys: new Set()
    },
    game: {
      frame: null,
      scenes: new Map(),
      sceneStart: null,
      referencedScenes: new Set(),
      everyTasks: [],
      usesVicSpriteCollision: false,
      usesVicBackgroundCollision: false,
      spriteAabbCount: 0,
      fixedPools: new Map(),
      counters: new Map()
    },
    hires: {
      screenBase: c64.HIRES_SCREEN_RAM,
      bitmapBase: c64.HIRES_BITMAP_RAM,
      modeDirty: true,
      runtimeNeeded: false,
      lineRuntimeNeeded: false,
      hlineRuntimeNeeded: false,
      vlineRuntimeNeeded: false,
      fillRectRuntimeNeeded: false,
      circleRuntimeNeeded: false,
      backgroundColor: c64.COLOR_WHITE
    },
    sid: {
      voiceControls: [0x00, 0x00, 0x00],
      filterModeVol: 0x00,
      filterResonanceRoute: 0x00,
      player: {
        installRequested: false,
        line: 250,
        song: null,
        sfxVoice: reservedSfxVoice,
        fadeUsed: optimization.sidFadeCount > 0
      }
    },
    irq: {
      handlers: (options.irqHandlers ?? []).map((handler) => ({
        line: handler.line,
        instructions: [...handler.instructions]
      })),
      disableKernalTimer: false,
      chainToKernal: false,
      installRequested: false,
      autoInstallRequested: false
    }
  };

  emitSpriteMultiplexerStateInit(asm, state);
  if (optimization.usesMapActivation || state.disk.enabled) {
    emitStoreImmediate(asm, MAP_ACTIVE_ID, GAME_SCENE_NONE);
    emitStoreImmediate(asm, MAP_PENDING_ID, GAME_SCENE_NONE);
  }
  if (state.disk.enabled) emitStoreImmediate(asm, DISK_LOAD_ERROR, 0);
  if (optimization.usesGameScenes) {
    emitStoreImmediate(asm, GAME_SCENE_CURRENT, GAME_SCENE_NONE);
    emitStoreImmediate(asm, GAME_SCENE_PENDING, GAME_SCENE_NONE);
  }
  if (optimization.usesRng) emitStoreImmediate(asm, GAME_RANDOM_STATE, 0xa5);

  for (const instruction of instructions) {
    if (instruction.op === "programConfig") continue;
    if (instruction.op === "sidReserveSfxVoice") continue;
    if (instruction.op === "irqInstall") {
      state.irq.installRequested = true;
      continue;
    }

    if (instruction.op === "irqDisableKernalTimer") {
      state.irq.disableKernalTimer = true;
      continue;
    }

    if (instruction.op === "irqEnableKernalTimer") {
      state.irq.disableKernalTimer = false;
      continue;
    }

    if (instruction.op === "irqChainToKernal") {
      state.irq.chainToKernal = true;
      continue;
    }

    compileHighLevelInstruction(asm, instruction, state);
  }

  // An activation requested by c64.game.init() is completed before IRQs and
  // the first visible frame start. Requests made by a frame are handled again
  // at the safe transition point at the end of that frame.
  emitPendingMapActivation(asm, state);

  if (state.sid.player.installRequested && !state.game.frame) {
    emitVideoStandardDetection(asm, "sid_video");
  }

  if (state.irq.installRequested || state.irq.autoInstallRequested) {
    emitIrqInstall(asm, state);
  }

  if (state.multiplexer.enabled && !state.game.frame) {
    throw new Error("sprites 8..15 require one c64.game.frame() loop for raster-synchronized multiplexing");
  }
  if (state.multiplexer.enabled && state.optimization.usesLegacySpriteApi) {
    throw new Error("sprites 8..15 cannot be mixed with the legacy direct c64.sprite.* hardware API; use sprite objects returned by c64.sprite.create()");
  }

  if (state.sid.player.installRequested && !state.sid.player.song) {
    throw new Error("sid.installPlayer()/playSong() was requested without a configured song");
  }

  const useCombinedRuntimeIrq = state.irq.handlers.length === 0
    && state.sid.player.installRequested
    && state.spriteAnimator.installRequested;

  if (useCombinedRuntimeIrq) {
    emitSpriteAnimatorInit(asm, state);
    emitCombinedRuntimeInstall(asm, state);
  }

  if (state.sid.player.installRequested) {
    emitSidPlayerInstall(asm, state);
  }

  if (state.spriteAnimator.installRequested) {
    emitSpriteAnimatorInstall(asm, state);
  }

  if (state.irq.handlers.length > 0) {
    asm.jmp(abs("program_end"));
    emitRasterHandlers(asm, state);
    asm.label("program_end");
  }

  if (state.spriteAnimator.installRequested && state.irq.handlers.length === 0) {
    asm.jmp(abs("program_end_after_animator"));
    if (useCombinedRuntimeIrq) {
      emitCombinedRuntimeRoutine(asm, state);
    } else {
      emitSpriteAnimatorRoutine(asm, state);
    }
    asm.label("program_end_after_animator");
  }

  if (state.sid.player.installRequested && !useCombinedRuntimeIrq && state.irq.handlers.length === 0) {
    asm.jmp(abs("program_end_after_sid_player"));
    emitSidPlayerRoutine(asm, state);
    asm.label("program_end_after_sid_player");
  }

  if (state.game.frame) {
    emitGameFrameLoop(asm, state);
  } else {
    asm.rts();
  }
  emitGameSceneRoutines(asm, state);
  emitBalancedSharedRoutines(asm, state);
  emitMapRoutines(asm, state);
  emitDiskLoaderRoutine(asm, state);
  emitHiresRoutines(asm, state);
  // Strings and user data are emitted after code, then referenced by labels.
  emitStringPool(asm, state);
  emitDataPool(asm, state);

  const finalBytes = Uint8Array.from(Array.from(asm.toBytes()));
  appendGameplayBudgetReports(state);
  appendGameContractReport(state);
  appendDiskAssetReport(state, finalBytes.length);
  appendSidAudioReport(state);
  appendOptimizationReport(state, finalBytes);
  const memoryLayout = buildDetailedMemoryReport(state, codeStart, finalBytes);
  state.assets.report.push(memoryLayout);
  if (memoryLayout.conflicts.length) {
    const conflict = memoryLayout.conflicts[0];
    throw new Error(`memory overlap between ${conflict.first} and ${conflict.second} at $${conflict.start.toString(16).toUpperCase()}-$${conflict.end.toString(16).toUpperCase()}`);
  }
  return {
    ...buildCompileResult(finalBytes, asm, codeStart, sysAddress),
    assetReport: state.assets.report,
    diskFiles: state.disk.files.map((file) => ({ ...file, data: Uint8Array.from(file.data) }))
  };
}

export async function compileFile(inputFile, options = {}) {
  // File compilation executes the user's DSL module in Node.js, collects the
  // recorded instructions, then compiles them.
  const absolute = path.resolve(inputFile);
  const compileOptions = normalizeCompileOptions(options, false);
  resetRuntime();
  setAssetBaseDirectory(path.dirname(absolute));
  const moduleUrl = pathToFileURL(absolute);
  moduleUrl.searchParams.set("ts", String(Date.now()));
  await import(moduleUrl.href);
  const state = getProgramState();
  return compileInstructions(state.instructions, {
    ...compileOptions,
    irqHandlers: state.irq.handlers
  });
}

export async function compileJsToC64Outputs(source, options = {}) {
  // This variant is convenient for tools that generate DSL code dynamically,
  // for example an AI assistant or an editor integration.
  const compileOptions = normalizeCompileOptions(options, true);
  resetRuntime();
  setAssetBaseDirectory(process.cwd());
  await executeInlineSource(source);
  const state = getProgramState();
  return {
    source,
    ...compileInstructions(state.instructions, {
      ...compileOptions,
      irqHandlers: state.irq.handlers
    })
  };
}

export async function compileJsToBasicData(source, options = {}) {
  // Convenience helper when only the BASIC DATA text is needed.
  const result = await compileJsToC64Outputs(source, options);
  return result.basicText;
}
