import { abs, absx, absy, imm, immHi, immLo, impl, ind, indx, indy, rel, zp, zpx, zpy, acc } from "./assembler6502.js";
import { createRasterApi } from "./irq/raster.js";

const initialState = () => ({
  instructions: [],
  currentTextColor: 1,
  screenBase: 0x0400,
  colorBase: 0xd800,
  assetBaseDirectory: process.cwd(),
  dataDefinitions: new Map(),
  input: {
    joystickPorts: [],
    keyboardKeys: []
  },
  irq: {
    handlers: [],
    disableKernalTimer: false,
    chainToKernal: false
  }
});

const state = initialState();

function cloneValue(value) {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }
  if (value && typeof value === "object") {
    return { ...value };
  }
  return value;
}

export function resetRuntime() {
  const fresh = initialState();
  state.instructions = fresh.instructions;
  state.currentTextColor = fresh.currentTextColor;
  state.screenBase = fresh.screenBase;
  state.colorBase = fresh.colorBase;
  state.assetBaseDirectory = fresh.assetBaseDirectory;
  state.dataDefinitions = fresh.dataDefinitions;
  state.input = fresh.input;
  state.irq = fresh.irq;
}

export function pushInstruction(op, ...args) {
  state.instructions.push({ op, args: args.map(cloneValue) });
}

export function captureBlock(callback) {
  const previous = state.instructions;
  state.instructions = [];
  callback();
  const captured = state.instructions;
  state.instructions = previous;
  return captured;
}

export function getProgramState() {
  return {
    instructions: state.instructions.map((instruction) => ({
      op: instruction.op,
      args: instruction.args.map(cloneValue)
    })),
    currentTextColor: state.currentTextColor,
    screenBase: state.screenBase,
    colorBase: state.colorBase,
    dataDefinitions: Object.fromEntries(state.dataDefinitions.entries()),
    input: {
      joystickPorts: [...state.input.joystickPorts],
      keyboardKeys: [...state.input.keyboardKeys]
    },
    irq: {
      handlers: state.irq.handlers.map((handler) => ({
        line: handler.line,
        instructions: handler.instructions.map((instruction) => ({
          op: instruction.op,
          args: instruction.args.map(cloneValue)
        }))
      })),
      disableKernalTimer: state.irq.disableKernalTimer,
      chainToKernal: state.irq.chainToKernal
    }
  };
}

export function defineRuntimeData(name, length) {
  state.dataDefinitions.set(name, length);
}

export function getRuntimeDataLength(name) {
  return state.dataDefinitions.get(name);
}

export function setTextColor(color) {
  state.currentTextColor = color & 0xff;
}

export function setScreenBase(address) {
  state.screenBase = address & 0xffff;
}

export function setColorBase(address) {
  state.colorBase = address & 0xffff;
}

export function setAssetBaseDirectory(directory) {
  state.assetBaseDirectory = directory;
}

export function getAssetBaseDirectory() {
  return state.assetBaseDirectory;
}

export function addRasterHandler(line, callback) {
  const instructions = captureBlock(callback);
  state.irq.handlers.push({ line, instructions });
}

export function useJoystickPort(port) {
  if (!Number.isInteger(port) || port < 1 || port > 2) {
    throw new Error("joystick port must be 1 or 2");
  }
  if (!state.input.joystickPorts.includes(port)) {
    state.input.joystickPorts.push(port);
    pushInstruction("inputUseJoystick", port);
  }
}

export function useKeyboardKey(keyCode) {
  if (!Number.isInteger(keyCode) || keyCode < 0 || keyCode > 63) {
    throw new Error("keyboard matrix key code must be between 0 and 63");
  }
  if (!state.input.keyboardKeys.includes(keyCode)) {
    state.input.keyboardKeys.push(keyCode);
    pushInstruction("inputUseKeyboardKey", keyCode);
  }
}

export function disableKernalTimerIrq() {
  state.irq.disableKernalTimer = true;
}

export function enableKernalTimerIrq() {
  state.irq.disableKernalTimer = false;
}

export function setChainToKernal() {
  state.irq.chainToKernal = true;
}

export function buildAsmNamespace() {
  const asm = {};
  for (const mnemonic of ["adc", "and", "asl", "bcc", "bcs", "beq", "bit", "bmi", "bne", "bpl", "brk", "bvc", "bvs", "clc", "cld", "cli", "clv", "cmp", "cpx", "cpy", "dec", "dex", "dey", "eor", "inc", "inx", "iny", "jmp", "jsr", "lda", "ldx", "ldy", "lsr", "nop", "ora", "pha", "php", "pla", "plp", "rol", "ror", "rti", "rts", "sbc", "sec", "sed", "sei", "sta", "stx", "sty", "tax", "tay", "tsx", "txa", "txs", "tya"]) {
    asm[mnemonic] = (operand = impl()) => pushInstruction("asm", mnemonic.toUpperCase(), operand);
  }
  asm.label = (name) => pushInstruction("label", name);
  asm.comment = (text) => pushInstruction("comment", text);
  asm.byte = (...values) => pushInstruction("byte", ...values.flat());
  return asm;
}

export function createRuntimeFacade(constants) {
  const api = {
    ...constants,
    imm,
    immLo,
    immHi,
    zp,
    zpx,
    zpy,
    abs,
    absx,
    absy,
    ind,
    indx,
    indy,
    rel,
    acc,
    impl,
    asm: buildAsmNamespace()
  };

  api.irq = createRasterApi({
    addRasterHandler,
    pushInstruction,
    disableKernalTimerIrq,
    enableKernalTimerIrq,
    setChainToKernal
  });

  return api;
}
