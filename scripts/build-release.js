import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { compileFile } from "../src/compiler.js";
import { D64_SIZE } from "../src/d64Writer.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const RELEASE_DIR = path.join(ROOT, "dist", "release");
const budgets = JSON.parse(await fs.readFile(path.join(ROOT, "release-budgets.json"), "utf8"));

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: "inherit", shell: false });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`${command} exited with code ${code}`)));
  });
}

function metricsFor(result) {
  const memory = result.assetReport.find((entry) => entry.type === "memory-layout");
  const optimization = result.assetReport.find((entry) => entry.type === "optimization-summary");
  const profile = optimization?.profiles?.find((entry) => entry.mode === optimization.mode);
  const scroll = result.assetReport.find((entry) => entry.type === "map-scroll");
  const romCopyCycles = result.assetReport
    .filter((entry) => entry.type === "charset")
    .reduce((sum, entry) => sum + (entry.romCopyCyclesEstimate ?? 0), 0);
  return {
    prgBytes: result.prgBytes.length,
    programBytes: memory.programBytes,
    assetBytes: memory.assetBytes,
    startupCycles: (profile?.startupCyclesEstimate ?? 0) + romCopyCycles,
    reportedFrameCycles: Math.max(
      scroll?.horizontalWrapCyclesEstimate ?? 0,
      scroll?.verticalWrapCyclesEstimate ?? 0,
      optimization?.multiplexer?.totalCyclesEstimate ?? 0
    ),
    memoryConflicts: memory.conflicts
  };
}

function enforceBudget(name, measured, limits) {
  if (measured.memoryConflicts.length) throw new Error(`${name}: memory conflict detected`);
  const checks = [
    ["PRG bytes", measured.prgBytes, limits.maxPrgBytes],
    ["program bytes", measured.programBytes, limits.maxProgramBytes],
    ["asset bytes", measured.assetBytes, limits.maxAssetBytes],
    ["startup cycles", measured.startupCycles, limits.maxStartupCycles],
    ["reported frame cycles", measured.reportedFrameCycles, limits.maxReportedFrameCycles]
  ];
  for (const [label, value, maximum] of checks) {
    if (value > maximum) throw new Error(`${name}: ${label} ${value} exceeds release budget ${maximum}`);
  }
}

await fs.mkdir(RELEASE_DIR, { recursive: true });
await run(process.execPath, [path.join(ROOT, "scripts", "build-examples.js")]);
await run(process.execPath, [
  path.join(ROOT, "src", "cli.js"), "build", "examples/multilevel-d64.js",
  "-o", "dist/release/multilevel.d64", "--format", "d64",
  "--disk-name", "JS-C64 1.0", "--program-name", "MULTILEVEL",
  "--report", "dist/release/multilevel.report.json"
]);

const d64 = await fs.readFile(path.join(RELEASE_DIR, "multilevel.d64"));
if (d64.length !== D64_SIZE) throw new Error(`release D64 has ${d64.length} bytes instead of ${D64_SIZE}`);

const games = {};
for (const [name, limits] of Object.entries(budgets.games)) {
  const result = await compileFile(path.join(ROOT, "examples", `${name}.js`));
  const measured = metricsFor(result);
  enforceBudget(name, measured, limits);
  games[name] = { measured, limits };
}

const report = {
  packageVersion: "1.0.0",
  generatedAt: new Date().toISOString(),
  standards: ["PAL", "NTSC"],
  d64Bytes: d64.length,
  games
};
await fs.writeFile(path.join(RELEASE_DIR, "validation.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Release artifacts built in ${path.relative(ROOT, RELEASE_DIR)}; ${Object.keys(games).length} game budgets passed.`);
