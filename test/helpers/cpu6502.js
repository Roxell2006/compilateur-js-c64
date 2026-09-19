import { OPCODES_6502 } from "../../src/opcodes6502.js";

const decode = new Map(Object.entries(OPCODES_6502).flatMap(([name, modes]) =>
  Object.entries(modes).map(([mode, opcode]) => [opcode, { name, mode }])));

// Instruction-level harness for emitted runtime code. IO hooks model raster
// progress/interrupt delays; this is not a VIC-II or SID audio emulator.
export class Cpu6502 {
  constructor(result) {
    this.memory = new Uint8Array(65536);
    this.memory.set(result.bytes, result.origin);
    this.symbols = result.symbols;
    this.pc = result.origin;
    this.a = this.x = this.y = 0;
    this.sp = 0xff;
    this.p = 0x20;
    this.cycles = 0;
    this.writes = [];
    this.readHook = () => undefined;
  }
  read(address) { return this.readHook(address, this) ?? this.memory[address & 65535]; }
  write(address, value) {
    address &= 65535;
    this.memory[address] = value & 255;
    this.writes.push({ address, value: value & 255, cycles: this.cycles });
  }
  flag(bit, value) { this.p = value ? this.p | bit : this.p & ~bit; }
  nz(value) { value &= 255; this.flag(2, value === 0); this.flag(128, value & 128); return value; }
  push(value) { this.memory[0x100 + this.sp] = value; this.sp = (this.sp - 1) & 255; }
  pop() { this.sp = (this.sp + 1) & 255; return this.memory[0x100 + this.sp]; }
  byte() { const value = this.read(this.pc); this.pc = (this.pc + 1) & 65535; return value; }
  word() { return this.byte() | this.byte() << 8; }
  runUntil(predicate, limit = 200000) {
    for (let n = 0; n < limit; n++) { if (predicate(this)) return; this.step(); }
    throw new Error(`6502 instruction budget exceeded at $${this.pc.toString(16)}`);
  }
  call(label, limit) {
    const start = this.cycles;
    this.pc = this.symbols[label];
    if (this.pc === undefined) throw new Error(`Missing routine ${label}`);
    this.push(0xff); this.push(0xfe);
    this.runUntil(cpu => cpu.pc === 0xffff, limit);
    return this.cycles - start;
  }
  step() {
    const opcode = this.byte();
    const instruction = decode.get(opcode);
    if (!instruction) throw new Error(`Unknown opcode ${opcode}`);
    const { name, mode } = instruction;
    let address, value, base, cost = 2, crossed = false;
    if (mode === "imm" || mode === "rel") value = this.byte();
    else if (mode === "zp") { address = this.byte(); cost = 3; }
    else if (mode === "abs") { address = this.word(); cost = 4; }
    else if (mode === "absx" || mode === "absy") {
      base = this.word(); address = (base + (mode === "absx" ? this.x : this.y)) & 65535;
      crossed = (base & 0xff00) !== (address & 0xff00); cost = 4 + Number(crossed);
    } else if (mode === "indy") {
      const pointer = this.byte(); base = this.read(pointer) | this.read((pointer + 1) & 255) << 8;
      address = (base + this.y) & 65535; crossed = (base & 0xff00) !== (address & 0xff00);
      cost = 5 + Number(crossed);
    } else if (mode !== "impl" && mode !== "acc") throw new Error(`Unsupported mode ${mode}`);
    const operand = () => value ?? this.read(address);
    const compare = register => { const v = operand(); this.flag(1, register >= v); this.nz(register - v); };
    const branch = condition => {
      if (!condition) return;
      const previous = this.pc;
      this.pc = (this.pc + (value < 128 ? value : value - 256)) & 65535;
      cost += 1 + Number((previous & 0xff00) !== (this.pc & 0xff00));
    };
    switch (name) {
      case "LDA": this.a = this.nz(operand()); break;
      case "LDX": this.x = this.nz(operand()); break;
      case "LDY": this.y = this.nz(operand()); break;
      case "STA": case "STX": case "STY":
        if (["absx", "absy"].includes(mode)) cost = 5;
        if (mode === "indy") cost = 6;
        this.write(address, name === "STA" ? this.a : name === "STX" ? this.x : this.y); break;
      case "ADC": case "SBC": {
        if (this.p & 8) throw new Error("Decimal arithmetic is outside this harness");
        const v = operand() ^ (name === "SBC" ? 255 : 0);
        const sum = this.a + v + (this.p & 1);
        this.flag(64, (~(this.a ^ v) & (this.a ^ sum) & 128) !== 0);
        this.flag(1, sum > 255); this.a = this.nz(sum); break;
      }
      case "AND": this.a = this.nz(this.a & operand()); break;
      case "ORA": this.a = this.nz(this.a | operand()); break;
      case "EOR": this.a = this.nz(this.a ^ operand()); break;
      case "CMP": compare(this.a); break;
      case "CPX": compare(this.x); break;
      case "CPY": compare(this.y); break;
      case "INC": case "DEC":
        cost = mode === "zp" ? 5 : mode === "abs" ? 6 : 7;
        this.write(address, this.nz(operand() + (name === "INC" ? 1 : -1))); break;
      case "INX": this.x = this.nz(this.x + 1); break;
      case "INY": this.y = this.nz(this.y + 1); break;
      case "DEX": this.x = this.nz(this.x - 1); break;
      case "DEY": this.y = this.nz(this.y - 1); break;
      case "TAX": this.x = this.nz(this.a); break;
      case "TAY": this.y = this.nz(this.a); break;
      case "TXA": this.a = this.nz(this.x); break;
      case "TYA": this.a = this.nz(this.y); break;
      case "ASL": case "ROL": {
        const old = mode === "acc" ? this.a : operand();
        const carry = name === "ROL" ? this.p & 1 : 0;
        this.flag(1, old & 128);
        const shifted = this.nz((old << 1) | carry);
        if (mode === "acc") this.a = shifted;
        else { this.write(address, shifted); cost = mode === "zp" ? 5 : mode === "abs" ? 6 : 7; }
        break;
      }
      case "LSR": case "ROR": {
        const old = mode === "acc" ? this.a : operand();
        const carry = name === "ROR" ? (this.p & 1) << 7 : 0;
        this.flag(1, old & 1);
        const shifted = this.nz((old >> 1) | carry);
        if (mode === "acc") this.a = shifted;
        else { this.write(address, shifted); cost = mode === "zp" ? 5 : mode === "abs" ? 6 : 7; }
        break;
      }
      case "PHA": this.push(this.a); cost = 3; break;
      case "PLA": this.a = this.nz(this.pop()); cost = 4; break;
      case "PHP": this.push(this.p | 0x30); cost = 3; break;
      case "PLP": this.p = (this.pop() & ~0x10) | 0x20; cost = 4; break;
      case "SEC": this.flag(1, true); break;
      case "CLC": this.flag(1, false); break;
      case "SEI": this.flag(4, true); break;
      case "CLI": this.flag(4, false); break;
      case "CLD": this.flag(8, false); break;
      case "BEQ": branch(this.p & 2); break;
      case "BNE": branch(!(this.p & 2)); break;
      case "BCS": branch(this.p & 1); break;
      case "BCC": branch(!(this.p & 1)); break;
      case "BMI": branch(this.p & 128); break;
      case "BPL": branch(!(this.p & 128)); break;
      case "JMP": this.pc = address; cost = 3; break;
      case "JSR": this.push((this.pc - 1) >> 8); this.push((this.pc - 1) & 255); this.pc = address; cost = 6; break;
      case "RTS": this.pc = ((this.pop() | this.pop() << 8) + 1) & 65535; cost = 6; break;
      case "NOP": break;
      default: throw new Error(`Unsupported instruction ${name}`);
    }
    this.cycles += cost;
  }
}
