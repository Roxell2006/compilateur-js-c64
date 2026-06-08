import { c64 } from "./c64.js";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLUE);
c64.backgroundColor(c64.COLOR_BLUE);
c64.fillRect(0, 0, 40, 25, 81, c64.COLOR_LIGHTBLUE);
c64.printCentered(12, "SCREEN FILLED");
