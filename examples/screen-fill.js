import { c64 } from "./c64.js";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLUE);
c64.backgroundColor(c64.COLOR_BLUE);
c64.memset(c64.SCREEN_RAM, 81, 255);
c64.memset(c64.COLOR_RAM, c64.COLOR_LIGHTBLUE, 255);
