import { c64 } from "./c64.js";

const level = c64.assets.loadMap("assets/maze-room.json");
const joystick = c64.input.joystick(2);
const playerX = c64.var.byte("mazePlayerX", { initial: 1 });
const playerY = c64.var.byte("mazePlayerY", { initial: 1 });
const nextX = c64.var.byte("mazeNextX", { initial: 1 });
const nextY = c64.var.byte("mazeNextY", { initial: 1 });

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.charset.use(level.charset, { address: 0x3000, background: 0, multicolor1: 5, multicolor2: 10 });
  c64.map.draw(level, { x: 1, y: 4 });
  c64.printAt(23, 4, "MAZE V0.9", c64.COLOR_WHITE);
  c64.printAt(23, 6, "RAMASSEZ", c64.COLOR_YELLOW);
  c64.printAt(23, 7, "LES CROIX", c64.COLOR_YELLOW);
});

c64.control.routine("maze_try_move", () => {
  c64.control.if(level.map(nextX, nextY).isSolid(), () => {}, () => {
    level.map(playerX, playerY).set(0);
    c64.control.if(level.map(nextX, nextY).eq(2), () => c64.sid.click());
    playerX.set(nextX); playerY.set(nextY);
    level.map(playerX, playerY).set(3);
  });
});

c64.game.frame(() => {
  nextX.set(playerX); nextY.set(playerY);
  c64.control.if(joystick.upPressed(), () => { nextY.dec(); c64.control.call("maze_try_move"); });
  c64.control.if(joystick.downPressed(), () => { nextY.inc(); c64.control.call("maze_try_move"); });
  c64.control.if(joystick.leftPressed(), () => { nextX.dec(); c64.control.call("maze_try_move"); });
  c64.control.if(joystick.rightPressed(), () => { nextX.inc(); c64.control.call("maze_try_move"); });
}, { hz: 50 });
