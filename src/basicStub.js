function encodeBasicLine(startAddress, lineNumber, bytes) {
  const nextLine = startAddress + 4 + bytes.length + 1;
  return Uint8Array.from([
    nextLine & 0xff,
    (nextLine >> 8) & 0xff,
    lineNumber & 0xff,
    (lineNumber >> 8) & 0xff,
    ...bytes,
    0x00
  ]);
}

export function createBasicSysStub(sysAddress = 2064, loadAddress = 0x0801, codeStart = 0x0810) {
  const lineBytes = [0x9e, 0x20, ...Buffer.from(String(sysAddress), "ascii")];
  const line = encodeBasicLine(loadAddress, 10, lineBytes);
  const programEnd = Uint8Array.from([0x00, 0x00]);
  const used = line.length + programEnd.length;
  const targetLength = codeStart - loadAddress;
  const paddingLength = Math.max(0, targetLength - used);
  const padding = new Uint8Array(paddingLength);
  return Uint8Array.from([...line, ...programEnd, ...padding]);
}

export function createBasicDataLoader(machineCode, codeStart = 2064) {
  const lines = [];
  lines.push(`10 FORI=0TO${machineCode.length - 1}:READA:POKE${codeStart}+I,A:NEXT`);
  lines.push(`20 SYS ${codeStart}`);
  return `${lines.join("\n")}\n`;
}
