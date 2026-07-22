import path from "node:path";
import { pathToFileURL } from "node:url";
import { Assembler6502, abs, absx, absy, acc, imm, immHi, immLo, indy, rel, zp, exportBasicData } from "./assembler6502.js";
import { c64, getProgramState, resetRuntime } from "./c64.js";
import { createBasicDataProgram, createPrg } from "./prgWriter.js";

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
const COLLISION_TEMP_BASE = 0xc7a0;
const VIC_SPRITE_COLLISION_SNAPSHOT = 0xc7b0;
const VIC_BACKGROUND_COLLISION_SNAPSHOT = 0xc7b1;
const AUTO_VARIABLE_START = 0xc100;
const AUTO_VARIABLE_END = 0xc2ff;
const RESERVED_RUNTIME_RANGES = Object.freeze([
  { start: c64.IRQ_STATE_INDEX, end: c64.IRQ_STATE_INDEX, name: "IRQ state" },
  { start: 0xc300, end: 0xc33f, name: "sprite animator" },
  { start: 0xc738, end: GAME_RATE_ACCUMULATOR, name: "compiler runtime" },
  { start: KEYBOARD_CURRENT_BASE, end: KEYBOARD_PREVIOUS_BASE + MAX_KEYBOARD_ACTIONS - 1, name: "keyboard input runtime" },
  { start: SPRITE_RUNTIME_BASE, end: SPRITE_RUNTIME_BASE + SPRITE_RUNTIME_STRIDE * SPRITE_LOGICAL_COUNT - 1, name: "sprite gameplay runtime" },
  { start: SPRITE_LOGICAL_STATE_BASE, end: SPRITE_LOGICAL_STATE_BASE + SPRITE_LOGICAL_STATE_STRIDE * SPRITE_LOGICAL_COUNT - 1, name: "sprite logical state" },
  { start: SPRITE_MUX_SORTED_BASE, end: SPRITE_MUX_SLOT_END_BASE + 7, name: "Y-sorted sprite multiplexer" },
  { start: COLLISION_TEMP_BASE, end: VIC_BACKGROUND_COLLISION_SNAPSHOT, name: "collision runtime" }
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
    playing: SID_PLAYER_PLAYING
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
    rateAccumulator: GAME_RATE_ACCUMULATOR
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

function buildSidSongSteps(songDefinition) {
  if (!songDefinition || typeof songDefinition !== "object") {
    throw new Error("c64.sid.playSong() expects a song object");
  }

  const tempo = songDefinition.tempo ?? 6;
  ensurePositiveByte(tempo, "SID song tempo");
  if (!Array.isArray(songDefinition.voices) || songDefinition.voices.length !== 3) {
    throw new Error("c64.sid.playSong() expects exactly 3 voices");
  }

  const voices = songDefinition.voices.map((voiceEntries) => {
    if (!Array.isArray(voiceEntries)) {
      throw new Error("Each SID song voice must be an array");
    }

    const steps = [];
    for (const rawEntry of voiceEntries) {
      const entry = normalizeSidSongEntry(rawEntry);
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

  const expandedVoices = voices.map((voice) => {
    const padded = voice.slice();
    while (padded.length < length) {
      padded.push({ action: 0, raw: 0 });
    }
    return {
      actionBytes: padded.map((step) => step.action & 0xff),
      freqLoBytes: padded.map((step) => step.raw & 0xff),
      freqHiBytes: padded.map((step) => (step.raw >> 8) & 0xff)
    };
  });

  return { tempo, length, voices: expandedVoices };
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

function emitSidBeep(asm, compileState) {
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, 1, "pulse");
  emitSidVoicePulseWidth(asm, 1, 0x0800);
  emitSidVoiceAttackDecay(asm, 1, 0x11);
  emitSidVoiceSustainRelease(asm, 1, 0xf0);
  emitSidNote(asm, compileState, 1, "C5", 10);
}

function emitSidClick(asm, compileState) {
  emitSidVolume(asm, compileState, 15);
  compileState.sid.voiceControls[0] = 0x11;
  if (compileState.optimization.sidClickCount > 1) {
    // Calls keep their volume write inline because the filter-mode bits in
    // $D418 can differ at each call site.
    compileState.sharedRoutines.sidClick = true;
    asm.jsr(abs("runtime_sid_click"));
    return;
  }
  emitSidClickBody(asm);
}

function emitSidClickBody(asm) {
  emitStoreImmediate(asm, sidVoiceBase(1) + 4, 0x00);
  emitStoreImmediate(asm, sidVoiceBase(1) + 4, 0x10);
  emitStoreImmediate(asm, sidVoiceBase(1) + 5, 0x00);
  emitStoreImmediate(asm, sidVoiceBase(1) + 6, 0x00);
  emitStoreImmediate(asm, sidVoiceBase(1), 0x39);
  emitStoreImmediate(asm, sidVoiceBase(1) + 1, 0x8b);
  emitStoreImmediate(asm, sidVoiceBase(1) + 4, 0x11);
}

function emitSharedSidClickRoutine(asm, state) {
  if (!state.sharedRoutines.sidClick) return;
  asm.comment("Shared non-blocking SID click");
  asm.label("runtime_sid_click");
  emitSidClickBody(asm);
  asm.rts();
}

function emitSidNoise(asm, compileState, duration = 12) {
  ensureSidDuration(duration);
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, 1, "noise");
  emitSidVoiceAttackDecay(asm, 1, 0x24);
  emitSidVoiceSustainRelease(asm, 1, 0xf4);
  emitSidVoiceFrequency(asm, 1, 0x1800);
  emitSidVoiceGate(asm, compileState, 1, true);
  emitSidDelay(asm, compileState, duration);
  emitSidVoiceGate(asm, compileState, 1, false);
  emitSidReleaseDelay(asm, compileState, duration);
}

function emitSidExplosion(asm, compileState) {
  emitSidNoise(asm, compileState, 20);
}

function emitSidLaser(asm, compileState) {
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, 1, "saw");
  emitSidVoiceAttackDecay(asm, 1, 0x01);
  emitSidVoiceSustainRelease(asm, 1, 0x82);
  emitSidNote(asm, compileState, 1, "C6", 6);
  emitSidNote(asm, compileState, 1, "G5", 8);
}

function emitSidPickup(asm, compileState) {
  emitSidVolume(asm, compileState, 15);
  emitSidVoiceWaveform(asm, compileState, 1, "triangle");
  emitSidVoiceAttackDecay(asm, 1, 0x11);
  emitSidVoiceSustainRelease(asm, 1, 0xb2);
  emitSidNote(asm, compileState, 1, "C5", 5);
  emitSidNote(asm, compileState, 1, "G5", 5);
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

function emitSidPlayerStop(asm, compileState) {
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x00);
  for (let voice = 1; voice <= 3; voice += 1) {
    const control = compileState.sid.voiceControls[voice - 1] & 0xfe;
    emitStoreImmediate(asm, sidVoiceBase(voice) + 4, control);
  }
}

function emitSidPlayerInitState(asm, state) {
  if (!state.sid.player.installRequested || !state.sid.player.song) {
    return;
  }

  emitStoreImmediate(asm, SID_PLAYER_STEP_INDEX, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_TICK_COUNT, 0x00);
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x01);
}

function createSidPlayerRuntime(state, prefix) {
  const song = state.sid.player.song;
  if (!state.sid.player.installRequested || !song) {
    return null;
  }

  const songId = state.stringCounter++;
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
  const voiceLabels = song.voices.map((voice, index) => ({
    action: `${labelBase}_v${index + 1}_action`,
    lo: `${labelBase}_v${index + 1}_lo`,
    hi: `${labelBase}_v${index + 1}_hi`,
    bytes: voice
  }));

  return {
    song,
    songId,
    processLabel: `${prefix}_process_${songId}`,
    stopLabel: `${prefix}_stop_${songId}`,
    doneLabel: `${prefix}_done_${songId}`,
    doneJumpLabel: `${prefix}_done_jump_${songId}`,
    processJumpLabel: `${prefix}_process_jump_${songId}`,
    stopContinueLabel: `${prefix}_stop_continue_${songId}`,
    voiceDoneLabels,
    voiceRestLabels,
    voiceHoldLabels,
    baseControls,
    voiceLabels
  };
}

function registerSidPlayerData(state, runtime) {
  for (const labels of runtime.voiceLabels) {
    registerData(state, labels.action, labels.bytes.actionBytes);
    registerData(state, labels.lo, labels.bytes.freqLoBytes);
    registerData(state, labels.hi, labels.bytes.freqHiBytes);
  }
}

function emitSidPlayerCore(asm, runtime) {
  asm.lda(abs(SID_PLAYER_PLAYING));
  asm.beq(rel(runtime.doneJumpLabel));
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
  asm.jmp(abs(runtime.stopLabel));
  asm.label(runtime.stopContinueLabel);

  for (let voice = 1; voice <= 3; voice += 1) {
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
  emitStoreImmediate(asm, SID_PLAYER_TICK_COUNT, runtime.song.tempo);
  asm.jmp(abs(runtime.doneLabel));

  asm.label(runtime.stopLabel);
  emitStoreImmediate(asm, SID_PLAYER_PLAYING, 0x00);
  for (let voice = 1; voice <= 3; voice += 1) {
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

function emitPrintAt(asm, x, y, text, color, screenBase, colorBase, compileState) {
  // printAt() writes directly to screen RAM and color RAM instead of using
  // CHROUT. This is faster and gives exact control over the target position.
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(color, "color");
  const rowOffset = y * 40;
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

function emitWriteChar(asm, x, y, char, color, screenBase, colorBase) {
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(color, "color");
  const rowOffset = y * 40;
  const screen = screenBase + rowOffset + x;
  const colors = colorBase + rowOffset + x;
  const screenCode = typeof char === "string" ? asciiToScreenCode(char[0] ?? " ") : char;

  emitStoreImmediate(asm, screen, screenCode);
  emitStoreImmediate(asm, colors, color);
}

function emitFillRect(asm, x, y, w, h, char, color, screenBase, colorBase, currentTextColor = color) {
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

  if (x === 0 && w === 40) {
    const start = y * 40;
    const total = h * 40;
    emitMemsetRange(asm, screenBase + start, screenCode, total);
    emitMemsetRange(asm, colorBase + start, color, total);
    return;
  }

  for (let row = 0; row < h; row += 1) {
    const rowOffset = (y + row) * 40 + x;
    emitMemset(asm, screenBase + rowOffset, screenCode, w);
    emitMemset(asm, colorBase + rowOffset, color, w);
  }
}

function emitDrawFrame(asm, x, y, w, h, char, color, screenBase, colorBase, currentTextColor = color) {
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(w, "w");
  ensureByte(h, "h");
  if (w === 0 || h === 0) {
    return;
  }

  emitFillRect(asm, x, y, w, 1, char, color, screenBase, colorBase, currentTextColor);
  if (h > 1) {
    emitFillRect(asm, x, y + h - 1, w, 1, char, color, screenBase, colorBase, currentTextColor);
  }
  for (let row = 1; row < h - 1; row += 1) {
    emitWriteChar(asm, x, y + row, char, color, screenBase, colorBase);
    if (w > 1) {
      emitWriteChar(asm, x + w - 1, y + row, char, color, screenBase, colorBase);
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
    const label = `sprite_data_${index}_${compileState.spriteDataCounter++}`;
    registerData(compileState, label, bytes);
    emitCopyDataTo(asm, compileState, targetAddress, label, bytes.length);
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
  if (callCount > 1) {
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

function emitSpriteFrames(asm, compileState, frameRef, frames, explicitAddress) {
  if (compileState.spriteFrameAssets.has(frameRef.name)) throw new Error(`Sprite frames already defined: ${frameRef.name}`);
  if (frames.length === 0) throw new Error("sprite.frames() needs at least one frame");
  const address = explicitAddress ?? compileState.nextSpriteFrameAddress;
  if (address % 64 !== 0) throw new Error("sprite frame address must be aligned to 64 bytes");
  if (address < 0x2000 || address + frames.length * 64 > 0x4000) throw new Error("sprite frames must fit in VIC bank 0 between $2000 and $3FFF");
  frames.forEach((frame, frameIndex) => {
    if (frame.length > 63) throw new Error("a sprite frame can contain at most 63 bytes");
    const bytes = [...frame.map((value) => value & 0xff), ...new Array(63 - frame.length).fill(0)];
    const label = `sprite_frames_${frameRef.name}_${frameIndex}`;
    registerData(compileState, label, bytes);
    emitCopyDataTo(asm, compileState, address + frameIndex * 64, label, 63);
    emitStoreImmediate(asm, address + frameIndex * 64 + 63, 0);
  });
  compileState.spriteFrameAssets.set(frameRef.name, { address, count: frames.length, firstBlock: address / 64 });
  compileState.nextSpriteFrameAddress = Math.max(compileState.nextSpriteFrameAddress, address + frames.length * 64);
}

function emitSpritePlaySequence(asm, compileState, spriteRef, name) {
  const runtime = getSpriteRuntime(compileState, spriteRef);
  const sequence = runtime.sequences.get(name);
  if (!sequence) throw new Error(`Unknown sprite sequence ${name} for sprite ${spriteRef.index}`);
  const internal = spriteRuntimeInternal(spriteRef.index);
  emitStoreImmediate(asm, internal.sequence, sequence.id);
  emitStoreImmediate(asm, internal.frame, 0);
  emitStoreImmediate(asm, internal.tick, 0);
  emitStoreImmediate(asm, internal.playing, 1);
  emitRuntimeSpritePointer(asm, compileState, spriteRef, abs(sequence.tableLabel));
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
  if (compileState.game.spriteAabbCount > 1) {
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

  // Synchronize with the real start of the next frame before touching VIC
  // registers. If a worst-case sort ended just after the NTSC wrap, a low
  // raster value tells us that we are already inside the new top border.
  asm.lda(abs(c64.VIC_CONTROL_1)); asm.bmi(rel("runtime_sprite_mux_wait_low_raster"));
  asm.lda(abs(c64.VIC_RASTER)); asm.cmp(imm(64)); asm.bcc(rel("runtime_sprite_mux_frame_ready"));
  asm.label("runtime_sprite_mux_wait_high_raster"); asm.lda(abs(c64.VIC_CONTROL_1)); asm.bpl(rel("runtime_sprite_mux_wait_high_raster"));
  asm.label("runtime_sprite_mux_wait_low_raster"); asm.lda(abs(c64.VIC_CONTROL_1)); asm.bmi(rel("runtime_sprite_mux_wait_low_raster"));
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
        song: baseState.sid.player.song
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
  const stats = { sidClickCount: 0, spriteSyncCallCounts: new Map(), usesSpriteMultiplexer: false, usesLegacySpriteApi: false };
  const addSpriteSync = (instruction) => {
    const spriteRef = instruction.args[0];
    if (!spriteRef || spriteRef.type !== "spriteRef") return;
    stats.spriteSyncCallCounts.set(spriteRef.index, (stats.spriteSyncCallCounts.get(spriteRef.index) ?? 0) + 1);
  };
  const visit = (instructions) => {
    for (const instruction of instructions ?? []) {
      if (instruction.op === "sidClick") stats.sidClickCount += 1;
      if (MULTIPLEX_CONFLICTING_LEGACY_OPS.has(instruction.op)) stats.usesLegacySpriteApi = true;
      if (["spriteCreateRuntime", "spriteRuntimeSync", "spriteRuntimeUpdate"].includes(instruction.op)) addSpriteSync(instruction);
      if (instruction.op === "spriteCreateRuntime" && instruction.args[0]?.index >= 8) stats.usesSpriteMultiplexer = true;
      if (["gameInit", "gameFrame"].includes(instruction.op)) visit(instruction.args[0]);
      if (["gameEvery", "controlRepeat", "controlWhile", "controlRoutine"].includes(instruction.op)) visit(instruction.args[1]);
      if (instruction.op === "controlIf") {
        visit(instruction.args[1]);
        visit(instruction.args[2]);
      }
    }
  };
  for (const group of instructionGroups) visit(group);
  return stats;
}

function emitSpriteMultiplexerStateInit(asm, state) {
  if (!state.multiplexer.enabled) return;
  const loopLabel = "sprite_mux_init_loop";
  asm.comment("Clear all 16 logical sprite slots before user initialization");
  asm.ldx(imm(0));
  asm.label(loopLabel);
  asm.lda(imm(0));
  asm.sta(absx(SPRITE_LOGICAL_STATE_BASE + 5));
  asm.sta(absx(SPRITE_RUNTIME_BASE + 4));
  asm.sta(absx(SPRITE_RUNTIME_BASE + 5));
  asm.sta(absx(SPRITE_RUNTIME_BASE + 6));
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
      song: localState.sid.player.song
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

  if (runtimeCondition.operator === "spriteAabb") {
    emitSpriteAabbOrJumpFalse(asm, compileState, runtimeCondition.left, falseLabel);
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
  const doneLabel = `control_repeat_done_${id}`;
  emitRuntimeValueToA(asm, compileState, count, "repeat count");
  asm.sta(abs(counterAddress));
  asm.label(loopLabel);
  asm.lda(abs(counterAddress));
  asm.beq(rel(doneLabel));
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
  const doneLabel = `control_while_done_${id}`;
  emitStoreImmediate(asm, counterAddress, maxIterations);
  asm.label(loopLabel);
  asm.lda(abs(counterAddress));
  asm.beq(rel(doneLabel));
  emitConditionOrJump(asm, compileState, runtimeCondition, doneLabel);
  for (const instruction of instructions) compileHighLevelInstruction(asm, instruction, compileState);
  asm.dec(abs(counterAddress));
  asm.jmp(abs(loopLabel));
  asm.label(doneLabel);
}

function safeRoutineLabel(name) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
    throw new Error(`Invalid routine name: ${name}`);
  }
  return `user_routine_${name}`;
}

const GAME_FRAME_COMPILE_TIME_ONLY_OPS = new Set([
  "dataByte", "dataWord", "dataString", "dataScreenString",
  "varByte", "varWord", "screen", "colorRam",
  "sidPlaySong", "sidInstallPlayer", "spriteInstallAnimator",
  "spriteMoveX", "spriteMoveY", "spriteMoveToX", "spriteMoveToY",
  "spriteAnimateTo", "spriteStop", "spriteStopX", "spriteStopY",
  "irqInstall", "irqChainToKernal", "irqDisableKernalTimer", "irqEnableKernalTimer",
  "gameFrame", "gameInit", "controlRoutine",
  "spriteCreateRuntime", "spriteRuntimeData", "spriteRuntimeColor", "spriteRuntimeFlag",
  "spriteFrames", "spriteUseFrames", "spriteSequence", "spriteRuntimeBounds"
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
      emitWriteChar(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], compileState.screenBase, compileState.colorBase);
      break;
    case "fillRect":
      emitFillRect(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4], instruction.args[5], compileState.screenBase, compileState.colorBase, compileState.currentTextColor);
      break;
    case "drawFrame":
      emitDrawFrame(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4], instruction.args[5], compileState.screenBase, compileState.colorBase, compileState.currentTextColor);
      break;
    case "clearLine":
      emitFillRect(asm, 0, instruction.args[0], 40, 1, instruction.args[1], instruction.args[2], compileState.screenBase, compileState.colorBase, compileState.currentTextColor);
      break;
    case "screen":
      compileState.screenBase = instruction.args[0];
      break;
    case "colorRam":
      compileState.colorBase = instruction.args[0];
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
        throw new Error("Only one c64.game.frame() loop can be declared");
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
      compileState.spriteRuntime[spriteRef.index] = { ref: spriteRef, bounds, frames: null, sequences: new Map() };
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
      getSpriteRuntime(compileState, instruction.args[0]);
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

function emitGameFrameLoop(asm, state) {
  const frame = state.game.frame;
  if (!frame) {
    return;
  }
  // Multiplexed games update logical state late in the visible frame. Sorting
  // follows, but VIC registers are not touched until the next raster wrap.
  const rasterLine = state.multiplexer.enabled ? SPRITE_MUX_FRAME_RASTER : (frame.options?.rasterLine ?? 240);
  const hz = frame.options?.hz ?? 50;
  ensureByte(rasterLine, "game frame raster line");
  if (hz !== 50 && hz !== "video") {
    throw new Error("c64.game.frame() supports hz: 50 or hz: \"video\"");
  }

  asm.comment("Deterministic game frame loop");
  emitStoreImmediate(asm, GAME_FRAME_COUNTER_LO, 0);
  emitStoreImmediate(asm, GAME_FRAME_COUNTER_HI, 0);
  emitStoreImmediate(asm, GAME_RATE_ACCUMULATOR, 0);
  emitStoreImmediate(asm, GAME_VIDEO_HZ, 60);
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

  // Detect whether the VIC-II reaches raster lines above 287. PAL does, while
  // NTSC leaves the high-raster phase before $D012 reaches $20.
  const detectLowLabel = "game_video_detect_low";
  const detectHighLabel = "game_video_detect_high";
  const detectScanLabel = "game_video_detect_scan";
  const detectPalLabel = "game_video_detect_pal";
  const detectDoneLabel = "game_video_detect_done";
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

  for (const instruction of frame.instructions) {
    compileHighLevelInstruction(asm, instruction, state);
  }

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
  const codeStart = options.codeStart ?? DEFAULT_CODE_START;
  const sysAddress = options.sysAddress ?? DEFAULT_SYS_ADDRESS;
  const asm = new Assembler6502(codeStart);
  const optimization = collectBalancedOptimizationStats([
    instructions,
    ...(options.irqHandlers ?? []).map((handler) => handler.instructions)
  ]);
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
    nextSpriteFrameAddress: 0x3000,
    sharedRoutines: {
      sidClick: false,
      spriteSyncIndexes: new Set(),
      spriteAabbCompare: false
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
      everyTasks: [],
      usesVicSpriteCollision: false,
      usesVicBackgroundCollision: false,
      spriteAabbCount: 0
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
        song: null
      }
    },
    irq: {
      handlers: options.irqHandlers ?? [],
      disableKernalTimer: false,
      chainToKernal: false
    }
  };

  emitSpriteMultiplexerStateInit(asm, state);

  for (const instruction of instructions) {
    if (instruction.op === "irqInstall") {
      emitIrqInstall(asm, state);
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

  if (state.multiplexer.enabled && !state.game.frame) {
    throw new Error("sprites 8..15 require one c64.game.frame() loop for raster-synchronized multiplexing");
  }
  if (state.multiplexer.enabled && state.optimization.usesLegacySpriteApi) {
    throw new Error("sprites 8..15 cannot be mixed with the legacy direct c64.sprite.* hardware API; use sprite objects returned by c64.sprite.create()");
  }

  if (state.sid.player.installRequested && !state.sid.player.song) {
    throw new Error("sid.installPlayer()/playSong() was requested without a configured song");
  }

  const useCombinedRuntimeIrq = state.sid.player.installRequested && state.spriteAnimator.installRequested;

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
  emitBalancedSharedRoutines(asm, state);
  emitHiresRoutines(asm, state);
  // Strings and user data are emitted after code, then referenced by labels.
  emitStringPool(asm, state);
  emitDataPool(asm, state);

  const finalBytes = Uint8Array.from(Array.from(asm.toBytes()));
  return buildCompileResult(finalBytes, asm, codeStart, sysAddress);
}

export async function compileFile(inputFile, options = {}) {
  // File compilation executes the user's DSL module in Node.js, collects the
  // recorded instructions, then compiles them.
  const absolute = path.resolve(inputFile);
  const compileOptions = normalizeCompileOptions(options, false);
  resetRuntime();
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
