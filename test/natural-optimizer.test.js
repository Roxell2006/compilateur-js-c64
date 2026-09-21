import { describe, it, expect } from "vitest";
import { compileJsToC64Outputs, compileFile } from "../src/compiler.js";
import { Cpu6502 } from "./helpers/cpu6502.js";

const report = r => r.assetReport.find(a => a.type === "natural-optimization");
const ram = r => r.assetReport.find(a => a.type === "memory-layout").ranges.filter(a => a.kind === "variable").reduce((n, a) => n + a.bytes, 0);
async function run(source, enabled) {
  const result = await compileJsToC64Outputs(`"use c64"; ${source}`, { naturalOptimizations: enabled });
  const cpu = new Cpu6502(result);
  cpu.push(255); cpu.push(254);
  cpu.runUntil(c => c.pc === 65535, 3000000);
  return { result, cpu };
}

describe("natural compiler optimizations", () => {
  it("writes expression results directly to destinations and reuses temporary storage", async () => {
    const source = `let a = 2; let b = 3;
      let first = (a + b) * 5;
      let second = (a * 3) + (b * 5);
      c64.poke(0x400, first); c64.poke(0x401, second);
      c64.borderColor((a + b) * 2); c64.backgroundColor((a + b) * 3);`;
    const slow = await run(source, false), fast = await run(source, true);
    expect(Array.from(fast.cpu.memory.slice(0x400, 0x402))).toEqual([25, 21]);
    expect(fast.cpu.memory[0xd020]).toBe(10);
    expect(fast.cpu.memory[0xd021]).toBe(15);
    expect(fast.result.prgBytes.length).toBeLessThan(slow.result.prgBytes.length);
    expect(fast.cpu.cycles).toBeLessThan(slow.cpu.cycles);
    expect(ram(fast.result)).toBeLessThan(ram(slow.result));
    expect(report(fast.result).copiesRemoved).toBeGreaterThan(0);
    expect(report(fast.result).temporaryBytesSaved).toBe(ram(slow.result) - ram(fast.result));
  });

  it.each([
    `let a = 4; let b = 7; a = b + a; c64.poke(0x400,a);
     const table = new Uint8Array([9,8,7,6]); let index = 1; index = table[index]; c64.poke(0x401,index);`,
    `let value = c64.word(65535); let n = 255;
     let a = c64.byte(value) + n; let b = c64.word(n) + 1;
     c64.poke(0x400,a); c64.printNumber(0,1,b,{digits:5});`,
    `let n = 3;
     function change() { n++; return n; }
     function pair(a,b) { return a * 10 + b; }
     function twice(a) { return a * 2; }
     c64.poke(0x400,pair(n,change())); c64.poke(0x401,twice(twice(n)));
     c64.poke(0x402,(n + 2) + change());`,
    `let total = 0;
     for(let i=0; i<10; i++) { if(i===3) continue; if(i===8) break;
       let n = i < 5 ? i + 2 : i + 4; total += n; }
     c64.poke(0x400,total);`,
    `let temp = 2; let element = 3;
     const config = { color: (temp + element) * 2 };
     function draw() { c64.borderColor(config.color); }
     c64.backgroundColor((temp+element)*3); draw();
     c64.poke(0x400,temp); c64.poke(0x401,element);`,
    `const data = new Uint8Array([4,5,6]); let i = 0;
     function change() { i++; return 9; }
     data[i] = change(); data[i] += 2;
     c64.poke(0x400,data[0]); c64.poke(0x401,data[1]);`,
  ])("preserves aliasing, widths, snapshots and control flow: %s", async source => {
    const slow = await run(source, false), fast = await run(source, true);
    expect(fast.cpu.memory.slice(0x400, 0x800)).toEqual(slow.cpu.memory.slice(0x400, 0x800));
    expect(fast.cpu.memory.slice(0xd020, 0xd022)).toEqual(slow.cpu.memory.slice(0xd020, 0xd022));
  });

  it.each([1, 16, 255, 256])("recognizes a full-array loop of %i elements", async length => {
    const source = `const values = new Uint16Array(${length}); let ink = c64.word(500);
      for(let i = ${length === 256 ? "c64.word(0)" : "0"}; i < values.length; i++) values[i] = ink;`;
    const slow = await run(source, false), fast = await run(source, true);
    const lo = fast.result.symbols.__js_array_0, hi = fast.result.symbols.__js_array_0_hi;
    expect(Array.from(fast.cpu.memory.slice(lo, lo + length))).toEqual(Array(length).fill(244));
    expect(Array.from(fast.cpu.memory.slice(hi, hi + length))).toEqual(Array(length).fill(1));
    expect(report(fast.result).fillLoops).toBe(1);
    expect(fast.cpu.cycles).toBeLessThan(slow.cpu.cycles);
    expect(fast.result.prgBytes.length).toBeLessThan(slow.result.prgBytes.length);
  });

  it.each([
    'const a=new Uint8Array(256); for(let i=0;i<a.length;i++) a[i]=7;', // Would wrap forever.
    'const a=new Uint8Array(16); for(let i=1;i<a.length;i++) a[i]=7;',
    'const a=new Uint8Array(16); for(let i=0;i<a.length;i++) a[i]=i;',
    'const a=new Uint8Array(16); for(let i=0;i<a.length;i++) { a[i]=7; break; }',
    'const a=new Uint8Array(16); function value(){return 7;} for(let i=0;i<a.length;i++) a[i]=value();',
    'const a=new Uint8Array(16); const clock=c64.var.byte("clock",0xd012); for(let i=0;i<a.length;i++) a[i]=clock;',
    'const a=new Uint8Array(16); c64.irq.raster(100,()=>c64.borderColor(a[0])); for(let i=0;i<a.length;i++) a[i]=7;',
    'const a=new Uint8Array(16); for(let i=0;i<a.length;i++) a[i]=7; const api=c64; const key="i"+"rq"; api[key].raster(100,()=>c64.borderColor(a[0]));',
  ])("does not rewrite non-equivalent fill loops: %s", async source => {
    const result = await compileJsToC64Outputs(`"use c64"; ${source}`);
    expect(report(result).fillLoops).toBe(0);
  });

  it("preserves expression storage while an IRQ function runs", async () => {
    const result = await compileJsToC64Outputs(`"use c64";
      let n = 2; let visible = 9;
      function interrupt() { c64.backgroundColor((n + 4) * 3); c64.poke(0x400, visible); }
      c64.irq.raster(100, interrupt); c64.irq.install();
      visible = (n + 1) * 5;
      c64.borderColor((n + 3) * 2);
    `);
    const cpu = new Cpu6502(result);
    cpu.push(255); cpu.push(254);
    const irq = Object.keys(result.symbols).find(n => /^user_routine___js_interrupt_\d+$/.test(n));
    let interrupts = 0;
    cpu.runUntil(c => {
      if (c.pc === 65535) return true;
      const saved = { pc: c.pc, a: c.a, x: c.x, y: c.y, p: c.p };
      c.call(irq);
      // The final border result checks that IRQ scratch never clobbers main.
      Object.assign(c, saved);
      interrupts++;
      return false;
    });
    expect(interrupts).toBeGreaterThan(20);
    expect(cpu.memory[0xd020]).toBe(10);
    expect(cpu.memory[0xd021]).toBe(18);
    expect(cpu.memory[0x400]).toBe(15);
    // visible must only receive its old or final value, never partial math.
    expect(cpu.writes.filter(w => w.address === 0x400).every(w => [0,9,15].includes(w.value))).toBe(true);
  });

  it("measurably reduces Tetris RAM and binary size without changing its source", async () => {
    const slow = await compileFile("examples/natural-tetris.js", { naturalOptimizations: false });
    const fast = await compileFile("examples/natural-tetris.js");
    expect(ram(fast)).toBeLessThanOrEqual(64);
    expect(ram(slow) - ram(fast)).toBeGreaterThanOrEqual(40);
    expect(fast.prgBytes.length).toBeLessThan(slow.prgBytes.length);
  });
});
