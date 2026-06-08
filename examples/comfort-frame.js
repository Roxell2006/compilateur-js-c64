import { c64 } from "./c64.js";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLUE);
c64.backgroundColor(c64.COLOR_BLUE);
c64.fillRect(0, 0, 40, 25, 32, c64.COLOR_LIGHTBLUE);
c64.drawFrame(2, 3, 36, 10, 81, c64.COLOR_WHITE);
c64.printCentered(5, "JS-C64 V0.2.0");
c64.printCentered(7, "FRAME + FILLRECT + CENTER");
