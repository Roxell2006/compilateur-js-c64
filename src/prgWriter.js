import { createBasicSysStub, createBasicDataLoader } from "./basicStub.js";
import { exportBasicData } from "./assembler6502.js";

export function createPrg(machineCode, sysAddress = 2064, loadAddress = 0x0801, codeStart = 0x0810) {
  const header = Uint8Array.from([loadAddress & 0xff, (loadAddress >> 8) & 0xff]);
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
