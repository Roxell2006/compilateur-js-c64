import { OPCODES_6502 } from "./opcodes6502.js";

const RELATIVE_MNEMONICS = new Set(["BCC", "BCS", "BEQ", "BMI", "BNE", "BPL", "BVC", "BVS"]);
const TWO_BYTE_MODES = new Set(["abs", "absx", "absy", "ind"]);
const ONE_BYTE_MODES = new Set(["imm", "zp", "zpx", "zpy", "indx", "indy", "rel"]);
const IMPLIED_MODES = new Set(["impl", "acc"]);

export function imm(value) {
  return { mode: "imm", value };
}

export function immLo(value) {
  return { mode: "imm", value, transform: "lo" };
}

export function immHi(value) {
  return { mode: "imm", value, transform: "hi" };
}

export function zp(value) {
  return { mode: "zp", value };
}

export function zpx(value) {
  return { mode: "zpx", value };
}

export function zpy(value) {
  return { mode: "zpy", value };
}

export function abs(value) {
  return { mode: "abs", value };
}

export function absx(value) {
  return { mode: "absx", value };
}

export function absy(value) {
  return { mode: "absy", value };
}

export function ind(value) {
  return { mode: "ind", value };
}

export function indx(value) {
  return { mode: "indx", value };
}

export function indy(value) {
  return { mode: "indy", value };
}

export function rel(value) {
  return { mode: "rel", value };
}

export function acc() {
  return { mode: "acc" };
}

export function impl() {
  return { mode: "impl" };
}

function toHexByte(value) {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function toHexWord(value) {
  return value.toString(16).toUpperCase().padStart(4, "0");
}

function wordToBytes(value) {
  return [value & 0xff, (value >> 8) & 0xff];
}

function normalizeOperand(operand, mnemonic) {
  if (operand === undefined || operand === null) {
    return { mode: "impl" };
  }

  if (typeof operand === "string") {
    if (RELATIVE_MNEMONICS.has(mnemonic)) {
      return { mode: "rel", value: operand };
    }
    return { mode: "abs", value: operand };
  }

  if (typeof operand === "number") {
    return { mode: operand <= 0xff ? "zp" : "abs", value: operand };
  }

  return operand;
}

function operandToAsm(operand) {
  if (!operand || operand.mode === "impl") {
    return "";
  }

  if (operand.mode === "acc") {
    return "A";
  }

  const raw = typeof operand.value === "number"
    ? operand.value
    : operand.value;

  switch (operand.mode) {
    case "imm":
      if (typeof raw === "number") {
        return `#$${toHexByte(raw)}`;
      }
      return operand.transform === "hi" ? `#>${raw}` : `#<${raw}`;
    case "zp":
      return `$${toHexByte(raw)}`;
    case "zpx":
      return `$${toHexByte(raw)},X`;
    case "zpy":
      return `$${toHexByte(raw)},Y`;
    case "abs":
      return typeof raw === "number" ? `$${toHexWord(raw)}` : raw;
    case "absx":
      return typeof raw === "number" ? `$${toHexWord(raw)},X` : `${raw},X`;
    case "absy":
      return typeof raw === "number" ? `$${toHexWord(raw)},Y` : `${raw},Y`;
    case "ind":
      return typeof raw === "number" ? `($${toHexWord(raw)})` : `(${raw})`;
    case "indx":
      return typeof raw === "number" ? `($${toHexByte(raw)},X)` : `(${raw},X)`;
    case "indy":
      return typeof raw === "number" ? `($${toHexByte(raw)}),Y` : `(${raw}),Y`;
    case "rel":
      return `${raw}`;
    default:
      throw new Error(`Unsupported operand mode: ${operand.mode}`);
  }
}

export class Assembler6502 {
  constructor(origin = 0x0810) {
    this.origin = origin;
    this.bytes = [];
    this.symbols = new Map();
    this.fixups = [];
    this.lines = [];
  }

  get pc() {
    return this.origin + this.bytes.length;
  }

  comment(text) {
    this.lines.push({ type: "comment", text });
    return this;
  }

  label(name) {
    if (this.symbols.has(name)) {
      throw new Error(`Label already defined: ${name}`);
    }
    this.symbols.set(name, this.pc);
    this.lines.push({ type: "label", name, address: this.pc });
    return this;
  }

  byte(...values) {
    const flat = values.flat();
    const address = this.pc;
    for (const value of flat) {
      this.bytes.push(value & 0xff);
    }
    this.lines.push({ type: "bytes", address, size: flat.length, text: `.byte ${flat.map((value) => `$${toHexByte(value)}`).join(", ")}` });
    return this;
  }

  emit(mnemonic, operand) {
    const upper = mnemonic.toUpperCase();
    const normalized = normalizeOperand(operand, upper);
    const opcodeSet = OPCODES_6502[upper];

    if (!opcodeSet) {
      throw new Error(`Unsupported mnemonic: ${upper}`);
    }

    const opcode = opcodeSet[normalized.mode];
    if (opcode === undefined) {
      throw new Error(`Unsupported addressing mode for ${upper}: ${normalized.mode}`);
    }

    const address = this.pc;
    const text = `${upper}${operandToAsm(normalized) ? ` ${operandToAsm(normalized)}` : ""}`;
    this.bytes.push(opcode);

    if (ONE_BYTE_MODES.has(normalized.mode)) {
      if (typeof normalized.value === "string") {
        this.fixups.push({ type: normalized.mode, offset: this.bytes.length, lineAddress: address, label: normalized.value, transform: normalized.transform });
        this.bytes.push(0x00);
      } else {
        this.bytes.push(normalized.value & 0xff);
      }
    } else if (TWO_BYTE_MODES.has(normalized.mode)) {
      if (typeof normalized.value === "string") {
        this.fixups.push({ type: normalized.mode, offset: this.bytes.length, lineAddress: address, label: normalized.value });
        this.bytes.push(0x00, 0x00);
      } else {
        this.bytes.push(...wordToBytes(normalized.value));
      }
    } else if (!IMPLIED_MODES.has(normalized.mode)) {
      throw new Error(`Unsupported mode emission: ${normalized.mode}`);
    }

    this.lines.push({ type: "instruction", address, size: this.pc - address, text });
    return this;
  }

  resolveFixups() {
    for (const fixup of this.fixups) {
      const target = this.symbols.get(fixup.label);
      if (target === undefined) {
        throw new Error(`Unknown label reference: ${fixup.label}`);
      }

      if (fixup.type === "rel") {
        const branchFrom = this.origin + fixup.offset + 1;
        const delta = target - branchFrom;
        if (delta < -128 || delta > 127) {
          throw new Error(`Branch target out of range for ${fixup.label} from $${toHexWord(fixup.lineAddress)}`);
        }
        this.bytes[fixup.offset] = delta & 0xff;
      } else if (fixup.type === "imm") {
        this.bytes[fixup.offset] = fixup.transform === "hi"
          ? ((target >> 8) & 0xff)
          : (target & 0xff);
      } else {
        const [lo, hi] = wordToBytes(target);
        this.bytes[fixup.offset] = lo;
        this.bytes[fixup.offset + 1] = hi;
      }
    }
  }

  toBytes() {
    this.resolveFixups();
    return Uint8Array.from(this.bytes);
  }

  toAsm() {
    this.resolveFixups();
    return this.lines.map((line) => {
      if (line.type === "comment") {
        return `; ${line.text}`;
      }
      if (line.type === "label") {
        return `${line.name}:`;
      }
      return `  ${line.text}`;
    }).join("\n");
  }

  toListing() {
    this.resolveFixups();
    return this.lines.map((line) => {
      if (line.type === "comment") {
        return `            ; ${line.text}`;
      }
      if (line.type === "label") {
        return `${toHexWord(line.address)}        ${line.name}:`;
      }

      const start = line.address - this.origin;
      const slice = this.bytes.slice(start, start + line.size);
      const byteText = slice.map((value) => toHexByte(value)).join(" ").padEnd(11, " ");
      return `${toHexWord(line.address)}  ${byteText} ${line.text}`;
    }).join("\n");
  }

  getSymbolTable() {
    this.resolveFixups();
    return Object.fromEntries(
      [...this.symbols.entries()].map(([name, value]) => [name, value])
    );
  }
}

for (const mnemonic of Object.keys(OPCODES_6502)) {
  Assembler6502.prototype[mnemonic.toLowerCase()] = function method(operand) {
    return this.emit(mnemonic, operand);
  };
}

export function exportBasicData(bytes, startLine = 100, step = 10, chunkSize = 8) {
  const lines = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = Array.from(bytes.slice(i, i + chunkSize));
    lines.push(`${startLine + (i / chunkSize) * step} DATA ${chunk.join(",")}`);
  }
  return lines.join("\n");
}
