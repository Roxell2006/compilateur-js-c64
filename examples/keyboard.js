import { c64 } from "./c64.js";

c64.clearScreen();
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "PRESS ANY KEY");
c64.asm.jsr(c64.abs(c64.KERNAL_SCNKEY));
c64.asm.jsr(c64.abs(c64.KERNAL_GETIN));
c64.asm.sta(c64.abs(0x0400 + 40));
