import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { validatePackageContents } from "../scripts/check-package.js";

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
function sources(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const file = path.join(directory, entry.name).replaceAll("\\", "/");
    return entry.isDirectory() ? sources(file) : [file];
  });
}
const publicFiles = ["package.json", "README.md", "LICENSE", "CHANGELOG.md", "MODE_EMPLOI_DEBUTANT.txt", "index.d.ts",
  ...sources("src"), ...sources("schemas"), ...sources("examples").filter(file => file !== "examples/hires-test.js")];
const manifest = files => ({ files: files.map(file => ({ path: file })) });

describe("npm publication boundary", () => {
  it("accepts the runtime, examples, resources and public documentation", () => {
    expect(validatePackageContents(manifest(publicFiles), pkg).size).toBe(publicFiles.length);
  });

  it.each([
    "test/compiler.test.js", "scripts/build-release.js", "dist/game.prg", "artifacts/report.json",
    "src/accidental.test.js", "src/accidental.spec.js", "src/tests/helper.js", "src/__fixtures__/sample.js",
    "src/fixtures/sample.js", "src/build/generated.js", "src/.cache/private.js", "examples/hires-test.js",
    "examples/assets/fixture.test.json", "examples/assets/.private.json"
  ])("rejects development file %s even inside an allowed directory", file => {
    expect(() => validatePackageContents(manifest([...publicFiles, file]), pkg)).toThrow(/Unwanted files/);
  });

  it.each(["src/natural.js", "src/natural-optimizer.js", "src/cli.js", "examples/natural-platformer.js", "index.d.ts"])(
    "rejects a package missing %s", missing => {
      expect(() => validatePackageContents(manifest(publicFiles.filter(file => file !== missing)), pkg)).toThrow(/missing/);
    }
  );

  it("keeps the release version in sync with the lockfile", () => {
    const lock = JSON.parse(fs.readFileSync(new URL("../package-lock.json", import.meta.url), "utf8"));
    expect(lock.version).toBe(pkg.version);
    expect(lock.packages[""].version).toBe(pkg.version);
  });
});
