import { c64 } from "./c64.js";

const DEMO_SPRITE = [
  0, 24, 0, 0, 60, 0, 0, 126, 0, 0, 255, 0,
  1, 255, 128, 3, 255, 192, 7, 255, 224, 15, 255, 240,
  31, 255, 248, 63, 255, 252, 31, 255, 248, 15, 255, 240,
  7, 255, 224, 3, 255, 192, 1, 255, 128, 0, 255, 0,
  0, 126, 0, 0, 60, 0, 0, 24, 0, 0, 0, 0,
  0, 0, 0
];

c64.clearScreen();
c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLUE);
c64.fillRect(0, 0, 40, 25, 32, c64.COLOR_LIGHTBLUE);
c64.drawFrame(1, 1, 38, 8, 81, c64.COLOR_WHITE);
c64.printCentered(3, "SPRITE API DEMO");

c64.sprite.data(0, DEMO_SPRITE);
c64.sprite.color(0, c64.COLOR_YELLOW);
c64.sprite.multicolor(0, false);
c64.sprite.expandX(0, true);
c64.sprite.expandY(0, true);
c64.sprite.position(0, 140, 100);
c64.sprite.enable(0);
