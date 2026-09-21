import { compileFile, compileJsToC64Outputs } from "../src/compiler.js";
import { PalRasterCpu } from "../test/helpers/pal-raster.js";
import { Cpu6502 } from "../test/helpers/cpu6502.js";

function summarize(result, costs) {
  const layout = result.assetReport.find(a => a.type === "memory-layout");
  return {
    prgBytes: result.prgBytes.length,
    scalarBytes: layout.ranges.filter(a => a.kind === "variable").reduce((n, a) => n + a.bytes, 0),
    minimumCycles: Math.min(...costs), maximumCycles: Math.max(...costs),
    meanCycles: Math.round(costs.reduce((a, b) => a + b, 0) / costs.length),
    optimization: result.assetReport.find(a => a.type === "natural-optimization")
  };
}

const report = {
  scope: "60 no-input logical PAL ticks after initialization; tick body including modeled DMA/IRQs, excluding frame wait. Fill measured separately with Cpu6502.",
  programs: {}
};
for (const example of ["natural-tetris", "natural-platformer", "natural-hires-interactive"]) {
  const variants = {};
  for (const naturalOptimizations of [false, true]) {
    const result = await compileFile(`examples/${example}.js`, { naturalOptimizations });
    const cpu = new PalRasterCpu(result);
    cpu.memory[0xdc01] = 255;
    cpu.runUntil(c => c.pc === result.symbols.game_frame_loop, 3000000);
    const costs = [];
    for (let i = 0; i < 60; i++) {
      cpu.runUntil(c => c.pc === result.symbols.game_frame_logical_tick, 3000000);
      const start = cpu.cycles;
      cpu.runUntil(c => c.pc === result.symbols.game_frame_loop, 3000000);
      costs.push(cpu.cycles - start);
    }
    variants[naturalOptimizations ? "optimized" : "baseline"] = summarize(result, costs);
  }
  report.programs[example] = variants;
}
report.fill64 = {};
for (const naturalOptimizations of [false, true]) {
  const result = await compileJsToC64Outputs(`"use c64";
    const cells = new Uint8Array(64);
    for (let i = 0; i < cells.length; i++) cells[i] = 7;
  `, { naturalOptimizations });
  const cpu = new Cpu6502(result);
  cpu.push(255); cpu.push(254);
  cpu.runUntil(c => c.pc === 65535);
  report.fill64[naturalOptimizations ? "optimized" : "baseline"] = summarize(result, [cpu.cycles]);
}
process.stdout.write(JSON.stringify(report, null, 2) + "\n");
