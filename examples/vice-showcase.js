import { c64 } from "./c64.js";

const SHOWCASE_COLOR_STATE = 0xc001;

c64.clearScreen();
c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLUE);
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "JS-C64 VICE SHOWCASE");
c64.printAt(0, 2, "IRQ DEMO RUNNING IN BACKGROUND");
c64.printAt(0, 4, "READY SHOULD REMAIN RESPONSIVE");
c64.printAt(0, 6, "BORDER AND BG KEEP CYCLING");

c64.irq.rasterLoop(245, () => {
  c64.asm.lda(c64.abs(SHOWCASE_COLOR_STATE));
  c64.asm.clc();
  c64.asm.adc(c64.imm(1));
  c64.asm.and(c64.imm(0x0f));
  c64.asm.sta(c64.abs(SHOWCASE_COLOR_STATE));
  c64.asm.sta(c64.abs(c64.VIC_BORDER_COLOR));
  c64.asm.eor(c64.imm(0x0f));
  c64.asm.sta(c64.abs(c64.VIC_BACKGROUND_COLOR));
});

c64.poke(SHOWCASE_COLOR_STATE, 0x05);
