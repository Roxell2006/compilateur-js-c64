import { c64 } from "./c64.js";

c64.clearScreen();
c64.printAt(0, 0, "JOYSTICK PORT 2");
c64.asm.lda(c64.abs(c64.JOYSTICK_PORT_2));
c64.asm.sta(c64.abs(0x0400 + 40));
