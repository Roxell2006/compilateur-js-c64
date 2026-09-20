"use c64";

import { c64 } from "./c64.js";

// Same level, physics and PAL raster layout as Platformer Mini.
c64.program.start(0x4000);
c64.assets.loadSprite("assets/platformer-actors.sprite.json", { address: 0x2800 });
c64.assets.loadSprite("assets/platformer-enemy.sprite.json", { address: 0x2880 });
c64.assets.loadSprite("assets/platformer-coin.sprite.json", { address: 0x28c0 });
const level = c64.assets.loadMap("assets/platformer-room.json");
const collisions = { 1: "solid", 2: "danger", 3: "exit", 4: "ladder" };
const joystick = c64.input.joystick(2);
const player = c64.map.spawn(level, "player", { sprite: 0, maxCollisionSpeed: 8, collisionBehaviors: collisions });
const enemy = c64.map.spawn(level, "enemy-a", { sprite: 1, collisionBehaviors: collisions });
const coin = c64.map.spawn(level, "coin-a", { sprite: 8, collisionBehaviors: collisions });
const camera = c64.map.scroller(level, { sourceY: 2, width: 36, x: 2, panel: { bottom: 5 } });
const margin = { x: 24, y: 21 };
let facingLeft = false;
let zone = 0;
let score = 0;
let collected = false;

function respawn() {
  if (zone === 0) player.respawn("player");
  else player.respawn("zone-2-spawn");
  c64.sid.click();
}

function animate() {
  if (!player.isOnGround()) {
    if (facingLeft) player.play("jump-left");
    else player.play("jump-right");
  } else if (player.velocityX === 0) {
    if (facingLeft) player.play("idle-left");
    else player.play("idle-right");
  } else {
    if (facingLeft) player.play("run-left");
    else player.play("run-right");
  }
}

function update() {
  player.velocityX = 0;
  if (joystick.left()) { player.velocityX = -2; facingLeft = true; }
  if (joystick.right()) { player.velocityX = 2; facingLeft = false; }
  if (player.isOnGround() && joystick.firePressed()) player.jump(8);
  player.velocityY += 1;
  player.moveAndCollide();
  animate();

  camera.follow(player, { axis: "x", deadZone: { x: 104, y: 48, width: 96, height: 48 }, maxSpeed: 2, cullingMargin: margin });
  camera.project(enemy, { cullingMargin: margin });
  camera.project(coin, { cullingMargin: margin });

  if (player.isOnDanger() || player.collides(enemy)) respawn();
  if (!collected && player.collides(coin)) {
    collected = true;
    coin.disable();
    score++;
    c64.printNumber(24, 21, score, { digits: 1 });
    c64.sid.click();
  }
  if (player.isAtExit()) {
    if (zone === 0) { zone = 1; player.respawn("zone-2-spawn"); }
    else c64.borderColor(c64.COLOR_GREEN);
  }
}

function init() {
  c64.screen.setup();
  c64.printAt(1, 21, "PLATFORMER MINI  SCORE  0");
  c64.printAt(1, 23, "JOY2: MOVE / FIRE: JUMP");
  c64.sid.volume(12);
  camera.draw();
}

// Keep the shared raster dispatcher exercised alongside scroll and sprites.
c64.irq.raster(250, () => c64.backgroundColor(c64.COLOR_BLACK));
c64.irq.install();
c64.game.run({ init, update }, { hz: 50 });
