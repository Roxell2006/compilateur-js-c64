import { c64 } from "./c64.js";

const SPRITE_DATA_ADDRESS = 0x2000;
const BALLOON_SPRITE_BYTES = [
  0, 127, 0, 1, 255, 192, 3, 255, 224, 3, 255, 224,
  7, 255, 240, 7, 255, 240, 7, 255, 240, 7, 255, 240,
  7, 255, 240, 3, 255, 224, 3, 255, 224, 1, 255, 192,
  0, 255, 0, 0, 126, 0, 0, 60, 0, 0, 60, 0,
  0, 24, 0, 0, 36, 0, 0, 126, 0, 0, 126, 0,
  0, 60, 0
];

c64.clearScreen();
c64.borderColor(c64.COLOR_CYAN);
c64.backgroundColor(c64.COLOR_BLUE);
c64.textColor(c64.COLOR_WHITE);
c64.printCentered(0, "C64 HOT AIR BALLOON");
c64.printCentered(2, "SPRITE 0 FROM THE USER MANUAL");

c64.sprite.data(0, BALLOON_SPRITE_BYTES, SPRITE_DATA_ADDRESS);
c64.sprite.color(0, c64.COLOR_RED);
c64.sprite.position(0, 120, 90);
c64.sprite.enable(0);
