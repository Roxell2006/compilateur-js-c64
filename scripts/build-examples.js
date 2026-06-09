import fs from "node:fs/promises";
import path from "node:path";
import { compileFile } from "../src/compiler.js";
import { createBasicDataProgram, createPrg } from "../src/prgWriter.js";

const EXAMPLES = [
  "hello",
  "colors",
  "comfort-frame",
  "comfort-data-vars",
  "screen-fill",
  "keyboard",
  "joystick",
  "raster-bars",
  "raster-ready-border-cycle",
  "vice-showcase",
  "sprite-api",
  "sprite-animate",
  "sid-beep",
  "sprite-basic"
];

async function writeOutput(filePath, content, encoding) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, encoding);
}

async function buildExample(name) {
  const input = path.resolve("examples", `${name}.js`);
  const result = await compileFile(input);
  await writeOutput(path.resolve("dist", `${name}.prg`), Buffer.from(createPrg(result.bytes)));
  await writeOutput(path.resolve("dist", `${name}.asm`), `${result.asm}\n`, "utf8");
  await writeOutput(path.resolve("dist", `${name}.lst`), `${result.listing}\n`, "utf8");
  await writeOutput(path.resolve("dist", `${name}.bas`), createBasicDataProgram(result.bytes), "utf8");
  await writeOutput(path.resolve("dist", `${name}.symbols.json`), `${JSON.stringify(result.symbols, null, 2)}\n`, "utf8");
}

for (const example of EXAMPLES) {
  await buildExample(example);
}
