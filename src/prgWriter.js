import { createBasicSysStub, createBasicDataLoader } from "./basicStub.js";
import { Assembler6502, abs, imm, indy, rel, zp, exportBasicData } from "./assembler6502.js";

const DEFAULT_LOAD_ADDRESS = 0x0801;
const DEFAULT_CODE_START = 0x0810;
const RELOCATION_SOURCE_PTR = 0xfb;
const RELOCATION_DEST_PTR = 0xfd;

function createRelocationLoader(sourceAddress, destinationAddress, length, loaderAddress = DEFAULT_CODE_START) {
  const asm = new Assembler6502(loaderAddress);
  const pages = Math.floor(length / 256);
  const remainder = length & 0xff;
  asm.php();
  asm.sei();
  asm.lda(imm(sourceAddress & 0xff)); asm.sta(zp(RELOCATION_SOURCE_PTR));
  asm.lda(imm((sourceAddress >> 8) & 0xff)); asm.sta(zp(RELOCATION_SOURCE_PTR + 1));
  asm.lda(imm(destinationAddress & 0xff)); asm.sta(zp(RELOCATION_DEST_PTR));
  asm.lda(imm((destinationAddress >> 8) & 0xff)); asm.sta(zp(RELOCATION_DEST_PTR + 1));
  if (pages > 0) {
    asm.ldx(imm(pages));
    asm.label("relocate_page");
    asm.ldy(imm(0));
    asm.label("relocate_page_byte");
    asm.lda(indy(RELOCATION_SOURCE_PTR)); asm.sta(indy(RELOCATION_DEST_PTR));
    asm.iny(); asm.bne(rel("relocate_page_byte"));
    asm.inc(zp(RELOCATION_SOURCE_PTR + 1));
    asm.inc(zp(RELOCATION_DEST_PTR + 1));
    asm.dex(); asm.bne(rel("relocate_page"));
  }
  if (remainder > 0) {
    asm.ldy(imm(0));
    asm.label("relocate_remainder");
    asm.lda(indy(RELOCATION_SOURCE_PTR)); asm.sta(indy(RELOCATION_DEST_PTR));
    asm.iny(); asm.cpy(imm(remainder)); asm.bne(rel("relocate_remainder"));
  }
  asm.plp();
  asm.jmp(abs(destinationAddress));
  return Uint8Array.from(asm.toBytes());
}

function createCompactRelocatedPrg(machineCode, loadAddress, codeStart) {
  const loaderAddress = DEFAULT_CODE_START;
  const stub = createBasicSysStub(loaderAddress, loadAddress, loaderAddress);
  const provisionalLoader = createRelocationLoader(0, codeStart, machineCode.length, loaderAddress);
  const sourceAddress = loaderAddress + provisionalLoader.length;
  const sourceEnd = sourceAddress + machineCode.length - 1;
  if (sourceEnd >= codeStart) return null;
  const loader = createRelocationLoader(sourceAddress, codeStart, machineCode.length, loaderAddress);
  return Uint8Array.from([...stub, ...loader, ...machineCode]);
}

export function createPrg(machineCode, sysAddress = 2064, loadAddress = DEFAULT_LOAD_ADDRESS, codeStart = DEFAULT_CODE_START) {
  const header = Uint8Array.from([loadAddress & 0xff, (loadAddress >> 8) & 0xff]);
  if (loadAddress === DEFAULT_LOAD_ADDRESS && codeStart !== DEFAULT_CODE_START && sysAddress === codeStart) {
    const relocated = createCompactRelocatedPrg(machineCode, loadAddress, codeStart);
    if (relocated) return Uint8Array.from([...header, ...relocated]);
  }
  const stub = createBasicSysStub(sysAddress, loadAddress, codeStart);
  return Uint8Array.from([...header, ...stub, ...machineCode]);
}

export function createRawBinary(machineCode) {
  return Uint8Array.from(machineCode);
}

export function createBasicDataProgram(machineCode, codeStart = 2064) {
  const loader = createBasicDataLoader(machineCode, codeStart);
  const data = exportBasicData(machineCode, 100, 10, 8);
  return `${loader}${data}\n`;
}
