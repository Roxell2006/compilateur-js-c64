"use c64";

import { c64 } from "./c64.js";

const artwork = c64.assets.loadSprite("assets/v10-hero.sprite.json");
const joystick = c64.input.joystick(2);
const player = c64.sprite.create(0, {
  x: 160, y: 120,
  frames: artwork.framesRef,
  color: c64.COLOR_YELLOW
});

function updatePlayer() {
  if (joystick.left() && player.x > 24) player.x -= 2;
  if (joystick.right() && player.x < 320) player.x += 2;
  if (joystick.up() && player.y > 50) player.y -= 2;
  if (joystick.down() && player.y < 220) player.y += 2;
  player.expandX(joystick.fire());
  player.color(joystick.fire() ? c64.COLOR_CYAN : c64.COLOR_YELLOW);
  player.sync();
  c64.printNumber(4, 3, player.x, { digits: 3, color: c64.COLOR_WHITE });
  c64.printNumber(13, 3, player.y, { digits: 3, color: c64.COLOR_WHITE });
}

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.printAt(1, 1, "JOYSTICK 2: MOVE");
  c64.printAt(1, 3, "X:       Y:");
  c64.printAt(1, 5, "FIRE: EXPAND / COLOR");
});

c64.game.frame(updatePlayer);
