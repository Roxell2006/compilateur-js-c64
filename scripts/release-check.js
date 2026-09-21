import fs from "node:fs/promises";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validatePackageContents } from "./check-package.js";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const npmCommand = process.platform === "win32" ? process.execPath : "npm";
const npxCommand = process.platform === "win32" ? process.execPath : "npx";
const npmPrefix = process.platform === "win32" ? [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")] : [];
const npxPrefix = process.platform === "win32" ? [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npx-cli.js")] : [];
const offline = process.argv.includes("--offline");
if (process.argv.slice(2).some(arg => arg !== "--offline")) throw new Error("Usage: release-check.js [--offline]");

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
const lock = JSON.parse(await fs.readFile(path.join(ROOT, "package-lock.json"), "utf8"));
assert.equal(lock.version, pkg.version, "package-lock root version differs");
assert.equal(lock.packages[""].version, pkg.version, "package-lock package version differs");
if (!pkg.author || JSON.stringify(pkg.repository).includes("yourname")) throw new Error("package publication metadata is incomplete");

await run(process.execPath, [path.join(ROOT, "node_modules", "vitest", "vitest.mjs"), "run"]);
await run(process.execPath, [path.join(ROOT, "scripts", "build-release.js")]);

const temporaryParent = path.join(ROOT, "tmp");
await fs.mkdir(temporaryParent, { recursive: true });
const temporaryRoot = await fs.mkdtemp(path.join(temporaryParent, "js-c64-release-"));
try {
  const packed = await run(npmCommand, [...npmPrefix, "pack", "--json", "--pack-destination", temporaryRoot], { capture: true });
  const packResult = JSON.parse(packed.stdout).at(0);
  const publishedFiles = validatePackageContents(packResult, pkg);

  const project = path.join(temporaryRoot, "consumer");
  await fs.mkdir(project);
  await fs.writeFile(path.join(project, "package.json"), JSON.stringify({ name: "js-c64-release-consumer", private: true, type: "module" }), "utf8");
  await fs.writeFile(path.join(project, "hello.js"), [
    '"use c64";',
    'import { c64 } from "js-c64";',
    "const cells = new Uint8Array(16);",
    "cells.fill(7);",
    "function color(index) { return cells[index]; }",
    "c64.screen.setup();",
    "for (let i = 0; i < cells.length; i++) c64.writeChar(i, 0, 81, color(i));",
    'c64.printAt(0, 2, "NPM PACKAGE OK");',
    ""
  ].join("\n"), "utf8");
  const tarball = path.join(temporaryRoot, packResult.filename);
  const dependencyArchives = [];
  if (offline) {
    // Install actual tarballs in the consumer, without linking back to this
    // repository. Leave the dependency declarations in js-c64 unchanged.
    for (const name of Object.keys(pkg.dependencies ?? {})) {
      const directory = path.join(ROOT, "node_modules", name);
      const dependency = JSON.parse(await fs.readFile(path.join(directory, "package.json"), "utf8"));
      assert.equal(dependency.version, lock.packages[`node_modules/${name}`]?.version,
        `installed ${name} does not match the lockfile; run npm ci first`);
      const packedDependency = await run(npmCommand, [...npmPrefix, "pack", directory,
        "--ignore-scripts", "--offline", "--json", "--pack-destination", temporaryRoot], { capture: true });
      dependencyArchives.push(path.join(temporaryRoot, JSON.parse(packedDependency.stdout).at(0).filename));
    }
  }
  await run(npmCommand, [...npmPrefix, "install", "--ignore-scripts", "--no-audit", "--no-fund",
    offline ? "--offline" : "--prefer-offline", ...dependencyArchives, tarball], { cwd: project });
  await run(npxCommand, [...npxPrefix, "--no-install", "c64js", "build", "hello.js", "-o", "hello.prg"], { cwd: project });
  await fs.copyFile(path.join(ROOT, "scripts", "check-installed-package.js"), path.join(project, "check-installed-package.js"));
  await run(process.execPath, ["check-installed-package.js", pkg.version], { cwd: project });
  const installedCli = path.join(project, "node_modules", "js-c64", "src", "cli.js");
  await run(process.execPath, [installedCli, "init", "starter"], { cwd: project });
  const starter = path.join(project, "starter");
  const starterPkg = JSON.parse(await fs.readFile(path.join(starter, "package.json"), "utf8"));
  assert.equal(starterPkg.dependencies["js-c64"], `^${pkg.version}`);
  assert.match(await fs.readFile(path.join(starter, "examples", "hello.js"), "utf8"), /^"use c64";/);
  await run(npmCommand, [...npmPrefix, "run", "build"], { cwd: starter });
  assert.ok((await fs.stat(path.join(starter, "build", "hello.prg"))).size > 20);
  const prg = await fs.stat(path.join(project, "hello.prg"));
  if (prg.size < 20) throw new Error("installed c64js produced an invalid PRG");
  const releaseDir = path.join(ROOT, "dist", "release");
  const archive = await fs.readFile(tarball);
  const integrity = `sha512-${createHash("sha512").update(archive).digest("base64")}`;
  assert.equal(integrity, packResult.integrity, "archive integrity differs from npm manifest");
  const installed = JSON.parse(await fs.readFile(path.join(project, "installed-validation.json"), "utf8"));
  await fs.copyFile(tarball, path.join(releaseDir, packResult.filename));
  await fs.writeFile(path.join(releaseDir, "pack-manifest.json"), `${JSON.stringify(packResult, null, 2)}\n`, "utf8");
  await fs.writeFile(path.join(releaseDir, "package-validation.json"), `${JSON.stringify({
    ...installed, platform: process.platform, node: process.version, generatedAt: new Date().toISOString(),
    dependencySource: offline ? "local tarballs matching package-lock" : "npm registry/cache",
    archive: packResult.filename, integrity, files: publishedFiles.size,
    packedBytes: packResult.size, unpackedBytes: packResult.unpackedSize, starter: "passed", published: false
  }, null, 2)}\n`, "utf8");
  console.log(`npm package ${packResult.filename}: ${publishedFiles.size} files, clean install and npx build passed on ${process.platform}.`);
} finally {
  if (path.dirname(path.resolve(temporaryRoot)) !== path.resolve(temporaryParent)
      || !path.basename(temporaryRoot).startsWith("js-c64-release-")) {
    throw new Error("Refusing to remove a temporary directory outside the release workspace");
  }
  await fs.rm(temporaryRoot, { recursive: true, force: true });
}

console.log(`js-c64 ${pkg.version} release check passed.`);
