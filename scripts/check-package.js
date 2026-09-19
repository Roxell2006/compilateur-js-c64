import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DOCUMENTS = ["package.json", "README.md", "LICENSE", "CHANGELOG.md", "MODE_EMPLOI_DEBUTANT.txt", "index.d.ts"];

export function validatePackageContents(packResult, pkg) {
  const files = new Set(packResult.files.map(entry => entry.path.replaceAll("\\", "/")));
  const forbidden = [...files].filter(file => {
    const allowed = PUBLIC_DOCUMENTS.includes(file)
      || /^src\/.+\.js$/.test(file)
      || /^schemas\/[^/]+\.schema\.json$/.test(file)
      || /^examples\/[^/]+\.js$/.test(file)
      || /^examples\/assets\/[^/]+\.json$/.test(file);
    const development = /(^|\/)(test|tests|__tests__|__fixtures__|fixtures|coverage|node_modules|artifacts|tmp)\//.test(file)
      || /\.(test|spec)\.js$/.test(file);
    return !allowed || development;
  });
  if (forbidden.length) throw new Error(`Unwanted files in npm package:\n${forbidden.join("\n")}`);

  const exportTargets = Object.values(pkg.exports).flatMap(value => typeof value === "string"
    ? [value] : Object.values(value).filter(entry => typeof entry === "string"));
  const required = [...PUBLIC_DOCUMENTS, pkg.main, pkg.types, ...Object.values(pkg.bin), ...exportTargets,
    "schemas/map-asset-v1.schema.json", "schemas/sprite-asset-v1.schema.json", "examples/c64.js"];
  for (const target of required) {
    if (!files.has(target.replace(/^\.\//, ""))) throw new Error(`Published package is missing ${target}`);
  }
  return files;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const pkg = JSON.parse(await fs.readFile(path.join(ROOT, "package.json"), "utf8"));
  const command = process.platform === "win32" ? process.execPath : "npm";
  const prefix = process.platform === "win32"
    ? [path.join(path.dirname(process.execPath), "node_modules", "npm", "bin", "npm-cli.js")] : [];
  const result = spawnSync(command, [...prefix, "pack", "--dry-run", "--json"], { cwd: ROOT, encoding: "utf8", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(result.stderr || result.stdout || "npm pack failed");
  const packed = JSON.parse(result.stdout).at(0);
  const files = validatePackageContents(packed, pkg);
  console.log(`${packed.filename}: ${files.size} allowed files, ${packed.size} bytes packed. No development files included.`);
}
