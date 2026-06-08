import { c64 } from "./c64.js";

c64.clearScreen();
c64.backgroundColor(c64.COLOR_BLACK);
c64.borderColor(c64.COLOR_BLACK);

for (let i = 0; i < 16; i += 1) {
  c64.textColor(i);
  c64.printAt(0, i, `COLOR ${i}`);
}
