import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createD64, d64SectorOffset, D64_SIZE } from "../src/d64Writer.js";

const execFileAsync = promisify(execFile);

function readDirectory(image) {
  const entries = [];
  let track = 18;
  let sector = 1;
  while (track !== 0) {
    const offset = d64SectorOffset(track, sector);
    for (let slot = 0; slot < 8; slot += 1) {
      const entry = offset + slot * 32;
      if ((image[entry + 2] & 0x07) === 0) continue;
      const name = Array.from(image.slice(entry + 5, entry + 21))
        .filter((value) => value !== 0xa0)
        .map((value) => String.fromCharCode(value))
        .join("");
      entries.push({
        type: image[entry + 2] & 0x07,
        name,
        track: image[entry + 3],
        sector: image[entry + 4],
        blocks: image[entry + 30] | (image[entry + 31] << 8)
      });
    }
    track = image[offset];
    sector = image[offset + 1];
  }
  return entries;
}

function readFile(image, entry) {
  const bytes = [];
  let track = entry.track;
  let sector = entry.sector;
  while (track !== 0) {
    const offset = d64SectorOffset(track, sector);
    const nextTrack = image[offset];
    const nextSector = image[offset + 1];
    const count = nextTrack === 0 ? nextSector - 1 : 254;
    bytes.push(...image.slice(offset + 2, offset + 2 + count));
    track = nextTrack;
    sector = nextSector;
  }
  return bytes;
}

describe("D64 writer", () => {
  it("writes a mountable 35-track image with PRG and USR entries", () => {
    const prg = Uint8Array.from([0x01, 0x08, 0x60]);
    const usr = Uint8Array.from([0x00, 0x30, ...Array.from({ length: 300 }, (_, index) => index & 0xff)]);
    const result = createD64({
      name: "TEST DISK",
      files: [
        { name: "MAIN", type: "prg", data: prg },
        { name: "LEVEL0", type: "usr", data: usr }
      ]
    });

    expect(result.bytes).toHaveLength(D64_SIZE);
    expect(result.bytes[d64SectorOffset(18, 0)]).toBe(18);
    expect(result.bytes[d64SectorOffset(18, 0) + 1]).toBe(1);
    const directory = readDirectory(result.bytes);
    expect(directory).toEqual([
      expect.objectContaining({ name: "MAIN", type: 2, blocks: 1 }),
      expect.objectContaining({ name: "LEVEL0", type: 3, blocks: 2 })
    ]);
    expect(readFile(result.bytes, directory[0])).toEqual(Array.from(prg));
    expect(readFile(result.bytes, directory[1])).toEqual(Array.from(usr));
    expect(result.freeBlocks).toBe(661);
    expect(result.usedBlocks).toBe(3);
  });

  it("chains directory sectors and rejects duplicate names", () => {
    const files = Array.from({ length: 9 }, (_, index) => ({
      name: `FILE${index}`,
      type: index === 0 ? "prg" : "usr",
      data: [index + 1]
    }));
    const result = createD64({ files });
    expect(readDirectory(result.bytes)).toHaveLength(9);
    expect(result.bytes[d64SectorOffset(18, 1)]).toBe(18);
    expect(result.bytes[d64SectorOffset(18, 1) + 1]).toBe(2);
    expect(() => createD64({ files: [files[0], files[0]] })).toThrow(/duplicate d64 filename/i);
  });

  it("writes CLI disk assets as KERNAL-loadable PRG data modules", async () => {
    const temporaryDirectory = await fs.mkdtemp(path.join(os.tmpdir(), "js-c64-d64-"));
    const output = path.join(temporaryDirectory, "multilevel.d64");
    try {
      await execFileAsync(process.execPath, [
        "src/cli.js", "build", "examples/multilevel-d64.js", "-o", output
      ], { cwd: process.cwd() });
      const directory = readDirectory(new Uint8Array(await fs.readFile(output)));
      expect(directory).toHaveLength(12);
      expect(directory.every((entry) => entry.type === 2)).toBe(true);
      expect(directory[0].name).toBe("MULTILEVEL");
      expect(directory.slice(1).map((entry) => entry.name)).toContain("LEVEL0");
    } finally {
      await fs.rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
