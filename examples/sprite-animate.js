import { c64 } from "./c64.js";

const balloon = [
  0, 127, 0, 1, 255, 192, 3, 255, 224, 3, 255, 224,
  7, 255, 240, 7, 255, 240, 7, 255, 240, 7, 255, 240,
  7, 255, 240, 3, 255, 224, 3, 255, 224, 1, 255, 192,
  0, 255, 0, 0, 126, 0, 0, 60, 0, 0, 60, 0,
  0, 24, 0, 0, 36, 0, 0, 126, 0, 0, 126, 0,
  0, 60, 0
];

// Une seconde frame légèrement différente donne vie à la corde du ballon.
const balloonSway = [...balloon];
balloonSway[48] = 0x18;
balloonSway[49] = 0x00;
balloonSway[51] = 0x0c;
balloonSway[52] = 0x00;

const balloonFrames = c64.sprite.frames("balloon", [balloon, balloonSway]);
const player = c64.sprite.create(0, {
  x: 32,
  y: 90,
  vx: 2,
  frames: balloonFrames,
  color: c64.COLOR_RED,
  minX: 24,
  maxX: 320,
  minY: 70,
  maxY: 120,
  bounceX: true
});

player.sequence("walk", [0, 1], { speed: 6, loop: true });
player.play("walk");

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_LIGHTBLUE);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printCentered(1, "SPRITE ANIMATION V0.8");
  c64.printCentered(3, "2 FRAMES + REBOND");
});

c64.game.frame(() => {
  player.update();
}, { hz: 50 });
