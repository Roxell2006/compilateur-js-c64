// Copied into an empty consumer project by release-check.js. All package imports
// must resolve to the installed tarball, never to the repository's sources.
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { compileFile, compileJsToC64Outputs, createD64, c64 } from "js-c64";

const root = path.resolve("node_modules/js-c64");
const pkg = JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8"));
assert.equal(pkg.version, process.argv[2]);
assert.equal(typeof compileFile, "function");
assert.equal(typeof createD64, "function");
assert.equal(typeof c64.game.run, "function");

for (const subpath of Object.keys(pkg.exports)) {
  const module = await import(subpath === "." ? "js-c64" : `js-c64${subpath.slice(1)}`);
  assert.ok(Object.keys(module).length > 0, `empty export: ${subpath}`);
}

const examples = (await fs.readdir(path.join(root, "examples")))
  .filter(name => name.endsWith(".js") && name !== "c64.js").sort();
for (const name of examples) {
  const result = await compileFile(path.join(root, "examples", name));
  assert.ok(result.prgBytes.length > 20, name);
  assert.deepEqual(result.assetReport.find(entry => entry.type === "memory-layout").conflicts, [], name);
}

const guide = await fs.readFile(path.join(root, "MODE_EMPLOI_DEBUTANT.txt"), "utf8");
const readme = await fs.readFile(path.join(root, "README.md"), "utf8");
const samples = [...guide.matchAll(/--- Programme complet : (.*?) ---\r?\n([\s\S]*?)--- Fin du programme ---/g)]
  .map(match => ({ name: match[1], source: match[2] }));
for (const match of readme.matchAll(/```js\r?\n([\s\S]*?)```/g)) {
  if (match[1].startsWith('"use c64";')) samples.push({ name: "readme", source: match[1] });
}
assert.ok(samples.length >= 15, "missing documentation programs");
await fs.mkdir("documentation", { recursive: true });
await fs.cp(path.join(root, "examples/assets"), "documentation/assets", { recursive: true });
for (const [index, sample] of samples.entries()) {
  const file = path.resolve("documentation", `${index}.js`);
  await fs.writeFile(file, sample.source, "utf8");
  const result = await compileFile(file);
  assert.ok(result.prgBytes.length > 20, sample.name);
}

const inline = await compileJsToC64Outputs('"use c64"; import { c64 } from "js-c64"; let n = 1; n += 2; c64.borderColor(n);');
assert.ok(inline.prgBytes.length > 20);
const summary = { packageVersion: pkg.version, exports: Object.keys(pkg.exports).length,
  examples: examples.length, documentationPrograms: samples.length };
await fs.writeFile("installed-validation.json", `${JSON.stringify(summary, null, 2)}\n`, "utf8");
console.log(`Installed package: ${summary.exports} exports, ${summary.examples} examples, ${samples.length} documentation programs passed.`);
