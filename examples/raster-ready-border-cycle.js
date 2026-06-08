import { c64 } from "./c64.js";

const BORDER_CYCLE_STATE = 0xc000;

c64.clearScreen();
c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLACK);
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "READY-SAFE RASTER BORDER");
c64.printAt(0, 2, "BORDER CYCLES 0..15");
c64.printAt(0, 4, "BASIC READY SHOULD STAY ALIVE");

c64.irq.raster(250, () => {
  c64.asm.lda(c64.abs(BORDER_CYCLE_STATE));
  c64.asm.clc();
  c64.asm.adc(c64.imm(1));
  c64.asm.and(c64.imm(0x0f));
  c64.asm.sta(c64.abs(BORDER_CYCLE_STATE));
  c64.asm.sta(c64.abs(c64.VIC_BORDER_COLOR));
});

c64.irq.chainToKernal();
c64.irq.install();
c64.poke(BORDER_CYCLE_STATE, 0xff);
