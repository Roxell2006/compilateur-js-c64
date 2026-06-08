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

function emitFillRect(asm, x, y, w, h, char, color, screenBase, colorBase) {
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

  for (let row = 0; row < h; row += 1) {
    const rowOffset = (y + row) * 40 + x;
    emitMemset(asm, screenBase + rowOffset, screenCode, w);
    emitMemset(asm, colorBase + rowOffset, color, w);
  }
}

function emitDrawFrame(asm, x, y, w, h, char, color, screenBase, colorBase) {
  ensureByte(x, "x");
  ensureByte(y, "y");
  ensureByte(w, "w");
  ensureByte(h, "h");
  if (w === 0 || h === 0) {
    return;
  }

  emitFillRect(asm, x, y, w, 1, char, color, screenBase, colorBase);
  if (h > 1) {
    emitFillRect(asm, x, y + h - 1, w, 1, char, color, screenBase, colorBase);
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

function emitCopyDataTo(asm, compileState, dest, dataRefOrName, explicitLength) {
  const data = resolveDataRef(compileState, dataRefOrName);
  const length = explicitLength ?? data.declaredLength ?? data.bytes?.length;
  if (length === undefined) {
    throw new Error(`copyDataTo needs an explicit length when data is not yet declared: ${data.name}`);
  }
  ensureWord(dest, "dest");
  ensureByte(length, "length");
  const loop = `copydata_${dest.toString(16)}_${data.name}_${length}_${compileState.loopCounter++}`;
  asm.ldx(imm(0));
  asm.label(loop);
  asm.lda(absx(data.name));
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
    dataPool: baseState.dataPool,
    variables: baseState.variables,
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
      emitFillRect(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4], instruction.args[5], compileState.screenBase, compileState.colorBase);
      break;
    case "drawFrame":
      emitDrawFrame(asm, instruction.args[0], instruction.args[1], instruction.args[2], instruction.args[3], instruction.args[4], instruction.args[5], compileState.screenBase, compileState.colorBase);
      break;
    case "clearLine":
      emitFillRect(asm, 0, instruction.args[0], 40, 1, instruction.args[1], instruction.args[2], compileState.screenBase, compileState.colorBase);
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

export function compileInstructions(instructions, options = {}) {
  const codeStart = options.codeStart ?? DEFAULT_CODE_START;
  const asm = new Assembler6502(codeStart);
  const state = {
    currentTextColor: 1,
    screenBase: 0x0400,
    colorBase: 0xd800,
    stringPool: new Map(),
    dataPool: new Map(),
    variables: new Map(),
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
  emitDataPool(asm, state);

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
