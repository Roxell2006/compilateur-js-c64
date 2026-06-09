import { c64 } from "./c64.js";

const BALLOON_SPRITE = [
  0, 127, 0, 1, 255, 192, 3, 255, 224, 3, 255, 224,
  7, 255, 240, 7, 255, 240, 7, 255, 240, 7, 255, 240,
  7, 255, 240, 3, 255, 224, 3, 255, 224, 1, 255, 192,
  0, 255, 0, 0, 126, 0, 0, 60, 0, 0, 60, 0,
  0, 24, 0, 0, 36, 0, 0, 126, 0, 0, 126, 0,
  0, 60, 0
];

c64.clearScreen();
c64.borderColor(c64.COLOR_LIGHTBLUE);
c64.backgroundColor(c64.COLOR_BLUE);
c64.textColor(c64.COLOR_WHITE);
c64.fillRect(0, 0, 40, 25, 32, c64.COLOR_BLUE);
c64.printCentered(1, "SPRITE ANIMATE");
c64.printCentered(3, "BALLOON TO THE RIGHT");

c64.sprite.data(0, BALLOON_SPRITE);
c64.sprite.color(0, c64.COLOR_RED);
c64.sprite.expandX(0, true);
c64.sprite.expandY(0, true);
c64.sprite.position(0, 32, 90);
c64.sprite.enable(0);

c64.sprite.animateTo(0, {
  x: 240,
  y: 60,
  speedX: 2,
  speedY: 1
});

c64.sprite.installAnimator(250);
