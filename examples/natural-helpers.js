"use c64";

import { c64 } from "./c64.js";

const joystick = c64.input.joystick(2);
const colors = new Uint8Array(16);
let ink = 1;

function paint() {
  colors.fill(ink);
  for (let i = 0; i < colors.length; i++) {
    c64.writeChar(12 + (i & 3) * 4, 8 + (i >> 2) * 2, 81, colors[i]);
  }
  c64.printNumber(21, 18, ink, { digits: 2 });
}

function init() {
  c64.screen.setup({ color: c64.COLOR_CYAN });
  c64.printAt(9, 3, "COMMON HELPERS - JS");
  c64.printAt(7, 5, "JOY 2 FIRE: NEXT COLOR");
  c64.printAt(13, 18, "COLOR:");
  paint();
}

function update() {
  if (joystick.firePressed()) {
    ink = (ink + 1) & 15;
    paint();
  }
}

c64.game.run({ init, update });
