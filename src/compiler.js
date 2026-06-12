import path from "node:path";
import { pathToFileURL } from "node:url";
import { Assembler6502, abs, absx, acc, imm, immHi, immLo, indy, rel, zp, exportBasicData } from "./assembler6502.js";
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
  ensureWord(x, "sprite x");
  emitStoreImmediate(asm, spriteXAddress(index), x & 0xff);
  emitSetBitState(asm, c64.VIC_SPRITE_X_MSB, index, x > 255);
  compileState.spriteState[index].x = x;
}

function emitSpriteSetY(asm, compileState, index, y) {
  ensureSpriteIndex(index);
  ensureByte(y, "sprite y");
  emitStoreImmediate(asm, spriteYAddress(index), y);
  compileState.spriteState[index].y = y;
}

function emitSpritePointer(asm, index, blockIndex) {
  ensureSpriteIndex(index);
  ensureByte(blockIndex, "sprite block index");
  emitStoreImmediate(asm, spritePointerAddress(index), blockIndex);
}

function emitSpriteData(asm, compileState, index, dataSource, explicitAddress) {
  ensureSpriteIndex(index);
  const targetAddress = spriteDataAddress(index, explicitAddress);
  let length = 63;

  if (Array.isArray(dataSource)) {
    const label = `sprite_data_${index}_${compileState.spriteDataCounter++}`;
    registerData(compileState, label, dataSource.map((value) => value & 0xff));
    emitCopyDataTo(asm, compileState, targetAddress, label, dataSource.length);
    length = dataSource.length;
  } else if (isDataRef(dataSource) || typeof dataSource === "string") {
    const data = resolveDataRef(compileState, dataSource);
    length = data.declaredLength ?? data.bytes?.length ?? 63;
    emitCopyDataTo(asm, compileState, targetAddress, dataSource, length);
  } else {
    throw new Error("sprite data must be an array, dataRef, or label name");
  }

  emitSpritePointer(asm, index, Math.floor(targetAddress / 64));
  compileState.spriteState[index].dataAddress = targetAddress;
  compileState.spriteState[index].dataLength = length;
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
  asm.pha();
  asm.txa();
  asm.pha();
  asm.tya();
  asm.pha();

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
  emitIrqAck(asm);
  asm.pla();
  asm.tay();
  asm.pla();
  asm.tax();
  asm.pla();
  asm.jmp(abs(c64.KERNAL_IRQ));
}

function emitSpriteAnimatorInstall(asm, state) {
  if (!state.spriteAnimator.installRequested) {
    return;
  }
  if (state.irq.handlers.length > 0) {
    throw new Error("sprite.installAnimator() cannot yet be combined with custom raster IRQ handlers");
  }

  const hasAnimations = state.spriteAnimations.some(Boolean);
  if (!hasAnimations) {
    throw new Error("sprite.installAnimator() was called without any configured sprite animations");
  }

  emitSpriteAnimatorInit(asm, state);
  asm.sei();
  asm.lda(imm(0x01));
  asm.sta(abs(c64.VIC_IRQ_ENABLE));
  emitIrqAck(asm);
  setRasterLine(asm, state.spriteAnimator.line);
  asm.lda(immLo("sprite_animator_irq"));
  asm.sta(abs(c64.IRQ_VECTOR_LO));
  asm.lda(immHi("sprite_animator_irq"));
  asm.sta(abs(c64.IRQ_VECTOR_HI));
  asm.cli();
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

function emitIrqInstall(asm, state) {
  const handlers = state.irq.handlers;
  if (handlers.length === 0) {
    throw new Error("c64.irq.install() was called without any raster handlers");
  }

  asm.sei();

  if (state.irq.disableKernalTimer) {
    asm.lda(imm(0x7f));
    asm.sta(abs(c64.CIA1_IRQ_CONTROL));
    asm.sta(abs(c64.CIA2_IRQ_CONTROL));
    asm.lda(abs(c64.CIA1_IRQ_CONTROL));
    asm.lda(abs(c64.CIA2_IRQ_CONTROL));
  }

  asm.lda(imm(0x00));
  asm.sta(abs(c64.IRQ_STATE_INDEX));

  asm.lda(imm(0x01));
  asm.sta(abs(c64.VIC_IRQ_ENABLE));
  emitIrqAck(asm);

  setRasterLine(asm, handlers[0].line);

  asm.lda(immLo("irq_dispatch"));
  asm.sta(abs(c64.IRQ_VECTOR_LO));
  asm.lda(immHi("irq_dispatch"));
  asm.sta(abs(c64.IRQ_VECTOR_HI));

  asm.cli();
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
    spriteAnimator: baseState.spriteAnimator,
    spriteAnimationBase: baseState.spriteAnimationBase,
    spriteDataCounter: baseState.spriteDataCounter,
    stringCounter: baseState.stringCounter,
    loopCounter: baseState.loopCounter,
    hires: { ...baseState.hires }
  };
}

function syncInstructionCompileState(baseState, localState) {
  baseState.currentTextColor = localState.currentTextColor;
  baseState.screenBase = localState.screenBase;
  baseState.colorBase = localState.colorBase;
  baseState.spriteDataCounter = localState.spriteDataCounter;
  baseState.stringCounter = localState.stringCounter;
  baseState.loopCounter = localState.loopCounter;
  baseState.hires = { ...localState.hires };
}

function registerData(compileState, name, bytes) {
  if (compileState.dataPool.has(name)) {
    throw new Error(`Data label already defined: ${name}`);
  }
  compileState.dataPool.set(name, bytes);
}

function registerVariable(compileState, name, address, size) {
  if (compileState.variables.has(name)) {
    throw new Error(`Variable already defined: ${name}`);
  }
  compileState.variables.set(name, { address, size });
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
      registerVariable(compileState, instruction.args[0], instruction.args[1], 1);
      emitStoreImmediate(asm, instruction.args[1], instruction.args[2]);
      break;
    case "varWord":
      registerVariable(compileState, instruction.args[0], instruction.args[1], 2);
      ensureWord(instruction.args[2], "initialValue");
      emitStoreImmediate(asm, instruction.args[1], instruction.args[2] & 0xff);
      emitStoreImmediate(asm, instruction.args[1] + 1, (instruction.args[2] >> 8) & 0xff);
      break;
    case "spriteEnable":
      emitSetBitState(asm, c64.VIC_SPRITE_ENABLE, instruction.args[0], true);
      break;
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
  asm.pha();
  asm.txa();
  asm.pha();
  asm.tya();
  asm.pha();

  asm.lda(abs(c64.IRQ_STATE_INDEX));

  for (let index = 0; index < handlers.length; index += 1) {
    asm.cmp(imm(index));
    asm.beq(rel(`irq_handler_${index}`));
  }

  asm.jmp(abs("irq_handler_0"));

  handlers.forEach((handler, index) => {
    asm.label(`irq_handler_${index}`);
    const handlerState = createInstructionCompileState(state);

    for (const instruction of handler.instructions) {
      compileHighLevelInstruction(asm, instruction, handlerState);
    }
    syncInstructionCompileState(state, handlerState);

    const nextIndex = (index + 1) % handlers.length;
    const nextLine = handlers[nextIndex].line;
    asm.lda(imm(nextIndex));
    asm.sta(abs(c64.IRQ_STATE_INDEX));
    setRasterLine(asm, nextLine);
    emitIrqAck(asm);
    asm.pla();
    asm.tay();
    asm.pla();
    asm.tax();
    asm.pla();

    if (state.irq.chainToKernal) {
      asm.jmp(abs(c64.KERNAL_IRQ));
    } else {
      asm.rti();
    }
  });
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
  // compileState is the compiler's working memory. It tracks the current text
  // color, string/data pools, user variables, sprite state and optional IRQs.
  const state = {
    currentTextColor: 1,
    screenBase: 0x0400,
    colorBase: 0xd800,
    stringPool: new Map(),
    dataPool: new Map(),
    variables: new Map(),
    spriteState: Array.from({ length: 8 }, () => ({ x: null, y: null, dataAddress: null, dataLength: null })),
    spriteAnimations: Array.from({ length: 8 }, () => null),
    spriteAnimator: {
      installRequested: false,
      line: 250
    },
    spriteAnimationBase: 0xc300,
    spriteDataCounter: 0,
    stringCounter: 0,
    loopCounter: 0,
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
    irq: {
      handlers: options.irqHandlers ?? [],
      disableKernalTimer: false,
      chainToKernal: false
    }
  };

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

  if (state.spriteAnimator.installRequested) {
    emitSpriteAnimatorInstall(asm, state);
  }

  if (state.irq.handlers.length > 0) {
    asm.jmp(abs("program_end"));
    emitRasterHandlers(asm, state);
    asm.label("program_end");
  }

  if (state.spriteAnimator.installRequested) {
    asm.jmp(abs("program_end_after_animator"));
    emitSpriteAnimatorRoutine(asm, state);
    asm.label("program_end_after_animator");
  }

  asm.rts();
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
