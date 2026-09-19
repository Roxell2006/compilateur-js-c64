import { Cpu6502 } from "./cpu6502.js";

// Instruction-level PAL timing model, not a full VIC emulator. Stops the CPU
// conservatively for badline BA (43 cycles) and three cycles per active sprite.
// Screen/color rows are sampled at the first c-access, before any row fetch.
export class PalRasterCpu extends Cpu6502 {
  constructor(result) {
    super(result);
    this.pendingIrq = false;
    this.onRow = () => {};
    this.onScrollLatch = () => {};
    this.memory[0xd011] = 0x1b;
    this.memory[0xd016] = 0xc8;
    this.memory[0xd018] = 0x14;
    this.memory[0xdc00] = 255;
    this.memory[0xffd2] = 0x60;
    this.readHook = address => address === 0xd011
      ? (this.memory[address] & 127) | (this.line >= 256 ? 128 : 0)
      : address === 0xd012 ? this.line & 255
      : address === 0xd019 ? Number(this.pendingIrq) : undefined;
  }
  get line() { return Math.floor(this.cycles / 63) % 312; }
  get frame() { return Math.floor(this.cycles / (63 * 312)); }
  write(address, value) {
    if (address === 0xd019) { if (value & 1) this.pendingIrq = false; return; }
    this.memory[address & 65535] = value & 255;
    if (address === 0xd016 && this.line >= 30 && this.line < 40) this.onScrollLatch();
  }
  advance(count) {
    while (count > 0) {
      const line = this.line, phase = this.cycles % 63;
      const bad = line >= 48 && line <= 247 && (this.memory[0xd011] & 16)
        && (line & 7) === (this.memory[0xd011] & 7);
      if (phase === 0 && line === (this.memory[0xd012] | (this.memory[0xd011] & 128) << 1)) this.pendingIrq = true;
      if (bad && phase === 14) this.onRow((line - 48) >> 3);
      let sprites = 0;
      for (let slot = 0; slot < 8; slot++) {
        const y = this.memory[0xd001 + slot * 2];
        const height = this.memory[0xd017] & (1 << slot) ? 42 : 21;
        if ((this.memory[0xd015] & (1 << slot)) && line >= y && line < y + height) sprites++;
      }
      if (!(bad && phase >= 11 && phase < 54) && phase >= sprites * 3) count--;
      this.cycles++;
    }
  }
  step() {
    if (this.pc === 0xea81) {
      this.y = this.pop(); this.x = this.pop(); this.a = this.pop();
      this.p = this.pop(); this.pc = this.pop() | this.pop() << 8;
      this.advance(22); return;
    }
    if (this.pendingIrq && (this.memory[0xd01a] & 1) && !(this.p & 4)) {
      this.push(this.pc >> 8); this.push(this.pc & 255); this.push(this.p & ~16);
      this.p |= 4;
      // KERNAL entry before the RAM vector at $0314.
      this.push(this.a); this.push(this.x); this.push(this.y);
      this.pc = this.memory[0x314] | this.memory[0x315] << 8;
      this.advance(40); return;
    }
    const start = this.cycles;
    super.step();
    const cost = this.cycles - start;
    this.cycles = start;
    this.advance(cost);
  }
}
