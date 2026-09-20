"use c64";

import { c64 } from "./c64.js";

// JOY 2 moves the brush. Hold FIRE: left/right changes its size, up changes
// color, down selects outline circle / filled circle / filled square.
// SPACE clears the drawing; RETURN exits to text mode.
const joystick = c64.input.joystick(2);
const keys = c64.input.keyboard({ clear: c64.KEY_SPACE, exit: c64.KEY_RETURN });
let x = c64.word(160);
let y = 100;
let radius = 8;
let ink = 1;
let shape = 0;
let active = true;

function draw() {
  if (shape === 0) c64.hires.circle(x, y, radius, ink);
  else if (shape === 1) c64.hires.fillCircle(x, y, radius, ink);
  else c64.hires.fillRect(x - radius, y - radius, radius * 2 + 1, radius * 2 + 1, ink);
}

function init() {
  c64.screen.setup({ mode: "hires" });
  draw();
}

function update() {
  if (!active) return;
  if (keys.exit.pressed()) {
    active = false;
    c64.screen.setup();
    c64.printAt(8, 12, "HIRES DEMO FINISHED");
    return;
  }
  let changed = false;
  if (keys.clear.pressed()) { c64.hires.clear(0); changed = true; }
  if (joystick.fire()) {
    if (joystick.leftPressed() && radius > 2) { radius--; changed = true; }
    if (joystick.rightPressed() && radius < 16) { radius++; changed = true; }
    if (joystick.upPressed()) { ink = (ink + 1) & 15; changed = true; }
    if (joystick.downPressed()) {
      shape++;
      if (shape === 3) shape = 0;
      changed = true;
    }
  } else {
    // A fixed 16-pixel margin accommodates every brush size.
    if (joystick.left() && x > 17) { x -= 2; changed = true; }
    if (joystick.right() && x < 302) { x += 2; changed = true; }
    if (joystick.up() && y > 17) { y -= 2; changed = true; }
    if (joystick.down() && y < 182) { y += 2; changed = true; }
  }
  if (changed) draw();
}

c64.game.run({ init, update });
