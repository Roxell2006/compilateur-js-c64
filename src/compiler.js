import path from "node:path";
import { pathToFileURL } from "node:url";
import { Assembler6502, abs, absx, imm, immHi, immLo, rel, zp, exportBasicData } from "./assembler6502.js";
import { c64, getProgramState, resetRuntime } from "./c64.js";
import { createBasicDataProgram, createPrg } from "./prgWriter.js";

const DEFAULT_CODE_START = 0x0810;
const DEFAULT_SYS_ADDRESS = 2064;
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

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

function getStringBytes(text, encoder) {
  return Array.from(text, encoder);
}

function requestStringLabel(compileState, kind, text, encoder) {
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

function emitMemset(asm, address, value, length) {
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
    loopCounter: baseState.loopCounter
  };
}

function syncInstructionCompileState(baseState, localState) {
  baseState.currentTextColor = localState.currentTextColor;
  baseState.screenBase = localState.screenBase;
  baseState.colorBase = localState.colorBase;
  baseState.spriteDataCounter = localState.spriteDataCounter;
  baseState.stringCounter = localState.stringCounter;
  baseState.loopCounter = localState.loopCounter;
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
  const normalized = { ...options };
  if (forInlineSource && normalized.codeStart === undefined && normalized.sysAddress !== undefined) {
    normalized.codeStart = normalized.sysAddress;
  }
  return normalized;
}

export function compileInstructions(instructions, options = {}) {
  const codeStart = options.codeStart ?? DEFAULT_CODE_START;
  const sysAddress = options.sysAddress ?? DEFAULT_SYS_ADDRESS;
  const asm = new Assembler6502(codeStart);
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
  emitStringPool(asm, state);
  emitDataPool(asm, state);

  const finalBytes = Uint8Array.from(Array.from(asm.toBytes()));
  return buildCompileResult(finalBytes, asm, codeStart, sysAddress);
}

export async function compileFile(inputFile, options = {}) {
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
  const result = await compileJsToC64Outputs(source, options);
  return result.basicText;
}
