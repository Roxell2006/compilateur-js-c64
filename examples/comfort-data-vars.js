import { c64 } from "./c64.js";

const COUNTER_ADDR = 0xc200;

c64.clearScreen();
c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLACK);
c64.textColor(c64.COLOR_WHITE);

c64.var.byte("counter", COUNTER_ADDR, 3);
c64.data.screenString("titleText", "DATA + VAR + COPY");

c64.copyDataTo(c64.SCREEN_RAM + 40, c64.dataRef("titleText", c64.data.length("titleText")));
c64.memsetColor(c64.COLOR_RAM + 40, c64.COLOR_YELLOW, c64.data.length("titleText"));
c64.poke(c64.varRef("counter"), 9);
c64.printAt(0, 4, "COUNTER STORED AT $C200");
