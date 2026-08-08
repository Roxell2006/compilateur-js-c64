const D64_TRACK_SECTORS = Object.freeze([
  0,
  ...Array(17).fill(21),
  ...Array(7).fill(19),
  ...Array(6).fill(18),
  ...Array(5).fill(17)
]);

export const D64_SIZE = 174848;
const SECTOR_BYTES = 256;
const FILE_PAYLOAD_BYTES = 254;
const DIRECTORY_TRACK = 18;
const BAM_SECTOR = 0;
const FIRST_DIRECTORY_SECTOR = 1;
const PETSCII_PAD = 0xa0;

function sectorCount(track) {
  const count = D64_TRACK_SECTORS[track];
  if (!count) throw new Error(`Invalid D64 track: ${track}`);
  return count;
}

export function d64SectorOffset(track, sector) {
  const count = sectorCount(track);
  if (!Number.isInteger(sector) || sector < 0 || sector >= count) {
    throw new Error(`Invalid D64 sector: ${track}/${sector}`);
  }
  let precedingSectors = 0;
  for (let current = 1; current < track; current += 1) precedingSectors += sectorCount(current);
  return (precedingSectors + sector) * SECTOR_BYTES;
}

function petsciiName(value, length = 16) {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();
  if (!normalized) throw new Error("D64 file and disk names cannot be empty");
  if (normalized.length > length) throw new Error(`D64 name ${normalized} exceeds ${length} characters`);
  const bytes = [];
  for (const char of normalized) {
    const code = char.charCodeAt(0);
    bytes.push(code >= 0x20 && code <= 0x7e ? code : 0x3f);
  }
  while (bytes.length < length) bytes.push(PETSCII_PAD);
  return bytes;
}

function normalizeFile(file) {
  if (!file || !["prg", "usr"].includes(String(file.type).toLowerCase())) {
    throw new Error("D64 files need type prg or usr");
  }
  const name = String(file.name ?? "").trim().toUpperCase();
  petsciiName(name);
  const data = Uint8Array.from(file.data ?? []);
  if (data.length === 0) throw new Error(`D64 file ${name} cannot be empty`);
  return { name, type: String(file.type).toLowerCase(), data };
}

function allDataSectors() {
  const sectors = [];
  for (let track = 1; track <= 35; track += 1) {
    // Track 18 belongs to the BAM/directory. A freshly formatted 35-track disk
    // therefore exposes the canonical 664 data blocks, not all 683 sectors.
    if (track === DIRECTORY_TRACK) continue;
    for (let sector = 0; sector < sectorCount(track); sector += 1) {
      sectors.push({ track, sector });
    }
  }
  return sectors;
}

function writeFileChain(image, file, availableSectors, usedSectors) {
  const blockCount = Math.max(1, Math.ceil(file.data.length / FILE_PAYLOAD_BYTES));
  if (availableSectors.length < blockCount) throw new Error(`D64 is full while writing ${file.name}`);
  const chain = availableSectors.splice(0, blockCount);
  let sourceOffset = 0;
  chain.forEach((location, index) => {
    const imageOffset = d64SectorOffset(location.track, location.sector);
    const last = index === chain.length - 1;
    if (last) {
      const remaining = file.data.length - sourceOffset;
      image[imageOffset] = 0;
      image[imageOffset + 1] = Math.min(FILE_PAYLOAD_BYTES, remaining) + 1;
    } else {
      image[imageOffset] = chain[index + 1].track;
      image[imageOffset + 1] = chain[index + 1].sector;
    }
    const count = Math.min(FILE_PAYLOAD_BYTES, file.data.length - sourceOffset);
    image.set(file.data.slice(sourceOffset, sourceOffset + count), imageOffset + 2);
    sourceOffset += count;
    usedSectors.add(`${location.track}/${location.sector}`);
  });
  return { start: chain[0], blocks: blockCount };
}

function writeBam(image, usedSectors, diskName, diskId) {
  const offset = d64SectorOffset(DIRECTORY_TRACK, BAM_SECTOR);
  image[offset] = DIRECTORY_TRACK;
  image[offset + 1] = FIRST_DIRECTORY_SECTOR;
  image[offset + 2] = 0x41;
  image[offset + 3] = 0;
  for (let track = 1; track <= 35; track += 1) {
    const entry = offset + 4 + (track - 1) * 4;
    let free = 0;
    for (let sector = 0; sector < sectorCount(track); sector += 1) {
      if (usedSectors.has(`${track}/${sector}`)) continue;
      free += 1;
      image[entry + 1 + Math.floor(sector / 8)] |= 1 << (sector % 8);
    }
    image[entry] = free;
  }
  image.set(petsciiName(diskName), offset + 0x90);
  image[offset + 0xa0] = PETSCII_PAD;
  image[offset + 0xa1] = PETSCII_PAD;
  const id = petsciiName(diskId, 2);
  image[offset + 0xa2] = id[0];
  image[offset + 0xa3] = id[1];
  image[offset + 0xa4] = PETSCII_PAD;
  image[offset + 0xa5] = 0x32;
  image[offset + 0xa6] = 0x41;
  image[offset + 0xa7] = PETSCII_PAD;
  image[offset + 0xa8] = PETSCII_PAD;
  image[offset + 0xa9] = PETSCII_PAD;
}

function writeDirectory(image, files, allocations, directorySectors, usedSectors) {
  directorySectors.forEach((sector, index) => {
    const offset = d64SectorOffset(DIRECTORY_TRACK, sector);
    const next = directorySectors[index + 1];
    image[offset] = next === undefined ? 0 : DIRECTORY_TRACK;
    image[offset + 1] = next === undefined ? 0xff : next;
    usedSectors.add(`${DIRECTORY_TRACK}/${sector}`);
  });
  files.forEach((file, index) => {
    const directoryIndex = Math.floor(index / 8);
    const slot = index % 8;
    // A Commodore directory sector is made of eight 32-byte entries. The
    // track/sector link occupies bytes 0-1 of entry 0, so every file field is
    // addressed relative to its entry (type at +2, filename at +5). Keeping
    // the extra +2 outside the entry made slot 7 overflow into the following
    // sector and created a phantom directory entry.
    const offset = d64SectorOffset(DIRECTORY_TRACK, directorySectors[directoryIndex]) + slot * 32;
    const allocation = allocations[index];
    image[offset + 2] = file.type === "prg" ? 0x82 : 0x83;
    image[offset + 3] = allocation.start.track;
    image[offset + 4] = allocation.start.sector;
    image.set(petsciiName(file.name), offset + 5);
    image[offset + 30] = allocation.blocks & 0xff;
    image[offset + 31] = (allocation.blocks >> 8) & 0xff;
  });
}

export function createD64({ name = "JS-C64 DISK", id = "64", files = [] } = {}) {
  const normalizedFiles = files.map(normalizeFile);
  if (normalizedFiles.length === 0) throw new Error("createD64() needs at least one file");
  const names = new Set();
  for (const file of normalizedFiles) {
    if (names.has(file.name)) throw new Error(`Duplicate D64 filename: ${file.name}`);
    names.add(file.name);
  }
  const directoryBlockCount = Math.max(1, Math.ceil(normalizedFiles.length / 8));
  if (FIRST_DIRECTORY_SECTOR + directoryBlockCount > sectorCount(DIRECTORY_TRACK)) {
    throw new Error("D64 directory supports at most 144 files");
  }
  const directorySectors = Array.from({ length: directoryBlockCount }, (_, index) => FIRST_DIRECTORY_SECTOR + index);
  const image = new Uint8Array(D64_SIZE);
  const usedSectors = new Set([`${DIRECTORY_TRACK}/${BAM_SECTOR}`]);
  const availableSectors = allDataSectors();
  const allocations = normalizedFiles.map((file) => writeFileChain(image, file, availableSectors, usedSectors));
  writeDirectory(image, normalizedFiles, allocations, directorySectors, usedSectors);
  writeBam(image, usedSectors, name, id);
  return {
    bytes: image,
    files: normalizedFiles.map((file, index) => ({
      name: file.name,
      type: file.type,
      bytes: file.data.length,
      blocks: allocations[index].blocks,
      startTrack: allocations[index].start.track,
      startSector: allocations[index].start.sector
    })),
    usedBlocks: allocations.reduce((sum, allocation) => sum + allocation.blocks, 0),
    directoryBlocks: directorySectors.length,
    freeBlocks: availableSectors.length
  };
}
