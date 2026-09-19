import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validatePackageContents } from "./check-package.js";

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

const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
if (!pkg.author || JSON.stringify(pkg.repository).includes("yourname")) throw new Error("package publication metadata is incomplete");

await run(process.execPath, [path.join(ROOT, "node_modules", "vitest", "vitest.mjs"), "run"]);
await run(process.execPath, [path.join(ROOT, "scripts", "build-release.js")]);

const temporaryRoot = await fs.mkdtemp(path.join(os.tmpdir(), "js-c64-release-"));
try {
  const packed = await run(npmCommand, [...npmPrefix, "pack", "--json", "--pack-destination", temporaryRoot], { capture: true });
  const packResult = JSON.parse(packed.stdout).at(0);
  const publishedFiles = validatePackageContents(packResult, pkg);

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

console.log(`js-c64 ${pkg.version} release check passed.`);
