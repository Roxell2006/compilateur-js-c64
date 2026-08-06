import fs from "node:fs/promises";
import path from "node:path";
import { compileFile } from "../src/compiler.js";

const EXAMPLES = (await fs.readdir(path.resolve("examples")))
  .filter((fileName) => fileName.endsWith(".js") && fileName !== "c64.js")
  .map((fileName) => path.basename(fileName, ".js"))
  .sort();

async function writeOutput(filePath, content, encoding) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, encoding);
}

async function buildExample(name) {
  const input = path.resolve("examples", `${name}.js`);
  const result = await compileFile(input);
  await writeOutput(path.resolve("dist", `${name}.prg`), Buffer.from(result.prgBytes));
  await writeOutput(path.resolve("dist", `${name}.asm`), `${result.asm}\n`, "utf8");
  await writeOutput(path.resolve("dist", `${name}.lst`), `${result.listing}\n`, "utf8");
  await writeOutput(path.resolve("dist", `${name}.bas`), result.basicText, "utf8");
  await writeOutput(path.resolve("dist", `${name}.symbols.json`), `${JSON.stringify(result.symbols, null, 2)}\n`, "utf8");
}

for (const example of EXAMPLES) {
  await buildExample(example);
}
