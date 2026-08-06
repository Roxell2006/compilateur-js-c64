#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { compileFile } from "./compiler.js";
import { createRawBinary } from "./prgWriter.js";

function usage() {
  return [
    "Usage:",
    "  c64js build <input.js> -o <output> [--format prg|bin|asm|lst|data] [--sys address] [--map symbols.json]",
    "  c64js init <folder>"
  ].join("\n");
}

function parseSysAddress(value) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed > 0xffff) {
    throw new Error(`Invalid --sys value: ${value}`);
  }
  return parsed;
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  if (!command) {
    throw new Error(usage());
  }

  if (command === "build") {
    const args = { command, input: null, output: null, format: null, map: null, sys: null };
    for (let i = 0; i < rest.length; i += 1) {
      const token = rest[i];
      if (!args.input && !token.startsWith("-")) {
        args.input = token;
      } else if (token === "-o" || token === "--output") {
        args.output = rest[++i];
      } else if (token === "--format") {
        args.format = rest[++i];
      } else if (token === "--sys") {
        args.sys = parseSysAddress(rest[++i]);
      } else if (token === "--map") {
        args.map = rest[++i];
      } else {
        throw new Error(`Unknown argument: ${token}`);
      }
    }
    if (!args.input || !args.output) {
      throw new Error(usage());
    }
    return args;
  }

  if (command === "init") {
    return { command, folder: rest[0] };
  }

  throw new Error(usage());
}

function inferFormat(filePath, explicitFormat) {
  if (explicitFormat) {
    return explicitFormat;
  }
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".prg") return "prg";
  if (ext === ".bin") return "bin";
  if (ext === ".asm") return "asm";
  if (ext === ".lst") return "lst";
  if (ext === ".bas") return "data";
  return "prg";
}

async function writeFileEnsured(filePath, content, encoding) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content, encoding);
}

async function handleBuild(args) {
  const format = inferFormat(args.output, args.format);
  const compileOptions = {};

  if (args.sys !== null) {
    compileOptions.codeStart = args.sys;
    compileOptions.sysAddress = args.sys;
  }

  const result = await compileFile(args.input, compileOptions);
  for (const warning of result.assetReport?.filter((entry) => entry.type === "warning") ?? []) {
    console.warn(`warning ${warning.code}: ${warning.message}`);
  }

  if (format === "prg") {
    await writeFileEnsured(args.output, Buffer.from(result.prgBytes), undefined);
  } else if (format === "bin") {
    await writeFileEnsured(args.output, Buffer.from(createRawBinary(result.bytes)), undefined);
  } else if (format === "asm") {
    await writeFileEnsured(args.output, `${result.asm}\n`, "utf8");
  } else if (format === "lst") {
    await writeFileEnsured(args.output, `${result.listing}\n`, "utf8");
  } else if (format === "data") {
    await writeFileEnsured(args.output, result.basicText, "utf8");
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  if (args.map) {
    await writeFileEnsured(args.map, `${JSON.stringify(result.symbols, null, 2)}\n`, "utf8");
  }
}

async function handleInit(args) {
  if (!args.folder) {
    throw new Error("c64js init <folder>");
  }

  const target = path.resolve(args.folder);
  await fs.mkdir(path.join(target, "src"), { recursive: true });
  await fs.mkdir(path.join(target, "examples"), { recursive: true });
  await fs.writeFile(
    path.join(target, "package.json"),
    JSON.stringify({
      name: path.basename(target),
      version: "0.0.1",
      type: "module",
      scripts: {
        build: "c64js build examples/hello.js -o build/hello.prg"
      },
      dependencies: {
        "js-c64": "^0.1.0"
      }
    }, null, 2),
    "utf8"
  );
  await fs.writeFile(
    path.join(target, "examples", "hello.js"),
    [
      'import { c64 } from "js-c64";',
      "",
      "c64.clearScreen();",
      "c64.borderColor(c64.COLOR_BLUE);",
      "c64.backgroundColor(c64.COLOR_BLUE);",
      "c64.textColor(c64.COLOR_WHITE);",
      'c64.printAt(0, 0, "Hello from js-c64!");',
      ""
    ].join("\n"),
    "utf8"
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === "build") {
    await handleBuild(args);
  } else {
    await handleInit(args);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
