import { c64 } from "./c64.js";

function diamondFrame(wide = false) {
  const bytes = Array(63).fill(0);
  const rows = wide
    ? [0x18, 0x3c, 0x7e, 0xff, 0xff, 0x7e, 0x3c, 0x18]
    : [0x00, 0x18, 0x3c, 0x7e, 0x7e, 0x3c, 0x18, 0x00];
  rows.forEach((value, row) => { bytes[(row + 6) * 3 + 1] = value; });
  return bytes;
}

const diamondFrames = c64.sprite.frames("multiplex_diamond", [diamondFrame(false), diamondFrame(true)]);
const colors = [
  c64.COLOR_WHITE, c64.COLOR_RED, c64.COLOR_CYAN, c64.COLOR_VIOLET,
  c64.COLOR_GREEN, c64.COLOR_BLUE, c64.COLOR_YELLOW, c64.COLOR_ORANGE
];

// Les indices sont volontairement melanges entre le haut, le centre et le
// bas. Le multiplexeur trie les 16 sprites selon leur Y a chaque image.
const startY = [
  175, 55, 215, 105, 135, 45, 225, 90,
  65, 195, 115, 235, 150, 80, 165, 125
];

const sprites = Array.from({ length: 16 }, (_, index) => {
  const column = index % 8;
  return c64.sprite.create(index, {
    x: 32 + column * 38,
    y: startY[index],
    vx: index === 0 ? 1 : index === 8 ? -1 : 0,
    vy: index === 0 ? -1 : index === 8 ? 1 : 0,
    frames: diamondFrames,
    color: colors[column],
    minX: 24,
    maxX: 320,
    minY: 45,
    maxY: 225,
    bounceX: index === 0 || index === 8,
    bounceY: index === 0 || index === 8
  });
});

sprites[0].sequence("pulse", [0, 1], { speed: 8, loop: true });
sprites[0].play("pulse");
sprites[8].sequence("pulse", [1, 0], { speed: 8, loop: true });
sprites[8].play("pulse");

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printCentered(0, "16 LOGICAL SPRITES");
  c64.printCentered(12, "AUTOMATIC Y SORTING");
});

c64.game.frame(() => {
  sprites[0].update();
  sprites[8].update();
}, { hz: 50 });
