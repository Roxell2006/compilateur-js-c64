"use c64";

import { c64 } from "./c64.js";

const room = c64.assets.loadMap("assets/maze-room.json");
const joystick = c64.input.joystick(2);
const camera = c64.map.scroller(room, {
  width: 12, height: 8, x: 4, y: 5, panel: "bottom"
});

function moveCamera() {
  const speed = joystick.fire() ? 4 : 1;
  joystick.scroll(camera, speed);
  c64.printNumber(21, 22, speed, { digits: 1, color: c64.COLOR_WHITE });
}

c64.game.init(() => {
  c64.screen.setup();
  c64.charset.use(room.charset);
  c64.printAt(1, 20, "JOYSTICK 2: SCROLL");
  c64.printAt(1, 22, "FIRE: FAST - SPEED:");
  camera.draw();
});

c64.game.frame(moveCamera);
