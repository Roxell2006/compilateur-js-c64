import path from "node:path";
import { pathToFileURL } from "node:url";
import { Assembler6502, abs, absx, imm, immHi, immLo, rel, zp, exportBasicData } from "./assembler6502.js";
import { c64, getProgramState, resetRuntime } from "./c64.js";
import { createBasicDataProgram } from "./prgWriter.js";

const DEFAULT_CODE_START = 0x0810;
const DEFAULT_SYS_ADDRESS = 2064;

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
  asm.jmp(abs(loopLabel));
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
  asm.jmp(abs(loopLabel));
  asm.label(doneLabel);
}

function emitMemset(asm, address, value, length) {
  ensureWord(address, "address");
  ensureByte(value, "value");
  ensureByte(length, "length");
  const loop = `memset_${address.toString(16)}_${value}_${length}`;
  asm.ldx(imm(0));
  asm.label(loop);
  asm.lda(imm(value));
  asm.sta(addressModeX(address));
  asm.inx();
  asm.cpx(imm(length));
  asm.bne(rel(loop));
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
    stringCounter: baseState.stringCounter,
    loopCounter: baseState.loopCounter
  };
}

function syncInstructionCompileState(baseState, localState) {
  baseState.currentTextColor = localState.currentTextColor;
  baseState.screenBase = localState.screenBase;
  baseState.colorBase = localState.colorBase;
  baseState.stringCounter = localState.stringCounter;
  baseState.loopCounter = localState.loopCounter;
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
    case "poke":
      if (isPeekRef(instruction.args[1])) {
        emitLoadAndStore(asm, instruction.args[1].address, instruction.args[0]);
      } else {
        emitStoreImmediate(asm, instruction.args[0], instruction.args[1]);
      }
      break;
    case "memset":
      emitMemset(asm, instruction.args[0], instruction.args[1], instruction.args[2]);
      break;
    case "memcpy":
      emitMemcpy(asm, instruction.args[0], instruction.args[1], instruction.args[2]);
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

export function compileInstructions(instructions, options = {}) {
  const codeStart = options.codeStart ?? DEFAULT_CODE_START;
  const asm = new Assembler6502(codeStart);
  const state = {
    currentTextColor: 1,
    screenBase: 0x0400,
    colorBase: 0xd800,
    stringPool: new Map(),
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

  if (state.irq.handlers.length > 0) {
    asm.jmp(abs("program_end"));
    emitRasterHandlers(asm, state);
    asm.label("program_end");
  }
  asm.rts();
  emitStringPool(asm, state);

  const bytes = Array.from(asm.toBytes());
  const symbols = asm.getSymbolTable();
  const finalBytes = Uint8Array.from(bytes);

  return {
    origin: codeStart,
    bytes: finalBytes,
    asm: asm.toAsm(),
    listing: asm.toListing(),
    symbols,
    data: exportBasicData(finalBytes),
    basicProgram: createBasicDataProgram(finalBytes, options.sysAddress ?? DEFAULT_SYS_ADDRESS)
  };
}

export async function compileFile(inputFile, options = {}) {
  const absolute = path.resolve(inputFile);
  resetRuntime();
  const moduleUrl = pathToFileURL(absolute);
  moduleUrl.searchParams.set("ts", String(Date.now()));
  await import(moduleUrl.href);
  const state = getProgramState();
  return compileInstructions(state.instructions, {
    ...options,
    irqHandlers: state.irq.handlers
  });
}
