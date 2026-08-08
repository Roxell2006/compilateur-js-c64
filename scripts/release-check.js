import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? process.execPath : "npm";
const npxCommand = process.platform === "win32" ? process.execPath : "npx";
const npmPrefix = process.platform === "win32" ? [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")] : [];
const npxPrefix = process.platform === "win32" ? [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js")] : [];

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd ?? ROOT,
      shell: false,
      stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit"
    });
    let stdout = "";
    let stderr = "";
    child.stdout?.on("data", (chunk) => { stdout += chunk; });
    child.stderr?.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("exit", (code) => code === 0
      ? resolve({ stdout, stderr })
      : reject(new Error(`${command} ${args.join(" ")} exited with ${code}\n${stderr || stdout}`)));
  });
}

function exportTargets(exportsField) {
  return Object.values(exportsField).flatMap((value) => typeof value === "string"
    ? [value]
    : Object.values(value).filter((entry) => typeof entry === "string"));
}

const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
if (pkg.version !== "1.0.0") throw new Error(`package version must be 1.0.0, found ${pkg.version}`);
if (!pkg.author || JSON.stringify(pkg.repository).includes("yourname")) throw new Error("package publication metadata is incomplete");

await run(process.execPath, [path.join(ROOT, "node_modules", "vitest", "vitest.mjs"), "run"]);
await run(process.execPath, [path.join(ROOT, "scripts", "build-release.js")]);

const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "js-c64-release-"));
try {
  const packed = await run(npmCommand, [...npmPrefix, "pack", "--json", "--pack-destination", temporaryRoot], { capture: true });
  const packResult = JSON.parse(packed.stdout).at(0);
  const publishedFiles = new Set(packResult.files.map((entry) => entry.path.replaceAll("\\", "/")));
  for (const target of [pkg.main, pkg.types, pkg.bin.c64js, ...exportTargets(pkg.exports)]) {
    const normalized = target.replace(/^\.\//, "");
    if (!publishedFiles.has(normalized)) throw new Error(`published package is missing ${normalized}`);
  }
  const frozenFiles = [
    "README.md", "LICENSE", "CHANGELOG.md", "index.d.ts",
    "RELEASE_CHECKLIST.md", "release-budgets.json",
    "MODE_EMPLOI_DEBUTANT.txt", "MODE_EMPLOI_PUBLICATION_NPM.txt",
    "schemas/map-asset-v1.schema.json", "schemas/sprite-asset-v1.schema.json"
  ];
  for (const file of frozenFiles) {
    if (!publishedFiles.has(file)) throw new Error(`published package is missing ${file}`);
  }

  const project = path.join(temporaryRoot, "consumer");
  await fs.mkdir(project);
  await fs.writeFile(path.join(project, "package.json"), JSON.stringify({ name: "js-c64-release-consumer", private: true, type: "module" }), "utf8");
  await fs.writeFile(path.join(project, "hello.js"), [
    'import { c64 } from "js-c64";',
    "c64.clearScreen();",
    "c64.borderColor(c64.COLOR_BLUE);",
    'c64.printAt(0, 0, "NPM 1.0 OK");',
    ""
  ].join("\n"), "utf8");
  const tarball = path.join(temporaryRoot, packResult.filename);
  await run(npmCommand, [...npmPrefix, "install", "--ignore-scripts", tarball], { cwd: project });
  await run(npxCommand, [...npxPrefix, "--no-install", "c64js", "build", "hello.js", "-o", "hello.prg"], { cwd: project });
  await run(process.execPath, ["--input-type=module", "-e", 'import("js-c64").then(m => { if (!m.c64 || !m.compileFile || !m.createD64) process.exit(1); })'], { cwd: project });
  const prg = await fs.stat(path.join(project, "hello.prg"));
  if (prg.size < 20) throw new Error("installed c64js produced an invalid PRG");
  console.log(`npm package ${packResult.filename}: ${publishedFiles.size} files, clean install and npx build passed on ${process.platform}.`);
} finally {
  await fs.rm(temporaryRoot, { recursive: true, force: true });
}

console.log("js-c64 1.0.0 release check passed.");
