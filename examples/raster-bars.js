import { c64 } from "./c64.js";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLACK);
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "SAFE RASTER BARS");
c64.printAt(0, 2, "RED AT LINE 50");
c64.printAt(0, 3, "BLUE AT LINE 150");

c64.irq.raster(50, () => {
  c64.borderColor(c64.COLOR_RED);
});

c64.irq.raster(150, () => {
  c64.borderColor(c64.COLOR_BLUE);
});

c64.irq.chainToKernal();
c64.irq.install();
