import { createRuntimeFacade, defineRuntimeData, getProgramState, getRuntimeDataLength, pushInstruction, resetRuntime, setColorBase, setScreenBase, setTextColor } from "./runtime.js";

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
  SID_VOICE1_CONTROL: 0xd404,
  SID_VOICE1_ATTACK_DECAY: 0xd405,
  SID_VOICE1_SUSTAIN_RELEASE: 0xd406,
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
  KEY_SPACE: 0x3c,
  KEY_RETURN: 0x01,
  KEY_F1: 0x04,
  JOYSTICK_PORT_2: 0xdc00,
  JOYSTICK_PORT_1: 0xdc01,
  JOY_UP: 0x01,
  JOY_DOWN: 0x02,
  JOY_LEFT: 0x04,
  JOY_RIGHT: 0x08,
  JOY_FIRE: 0x10
};

export const c64 = createRuntimeFacade(C64_CONSTANTS);

c64.borderColor = (color) => pushInstruction("borderColor", color);
c64.backgroundColor = (color) => pushInstruction("backgroundColor", color);
c64.textColor = (color) => {
  setTextColor(color);
  pushInstruction("textColor", color);
};
c64.clearScreen = () => pushInstruction("clearScreen");
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

c64.var = {
  byte(name, address, initialValue = 0) {
    pushInstruction("varByte", name, address, initialValue);
  },
  word(name, address, initialValue = 0) {
    pushInstruction("varWord", name, address, initialValue);
  }
};

c64.varRef = (name) => ({ type: "varRef", name });
c64.dataRef = (name, length = undefined) => ({ type: "dataRef", name, length });

c64.sprite = {
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
  }
};

export { getProgramState, resetRuntime };
