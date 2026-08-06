import { c64 } from "./c64.js";

c64.program.start(0x4000);

// Mini jeu original de validation v0.10.1. Le niveau contient deux zones dans
// la meme map monde : la premiere sortie teleporte au second point de spawn.
const MAP_WIDTH = 80;
const MAP_HEIGHT = 30;
const EMPTY = 0;
const SOLID = 1;
const DANGER = 2;
const EXIT = 3;
const LADDER = 4;

c64.assets.loadSprite("assets/platformer-actors.sprite.json", { address: 0x2800 });
c64.assets.loadSprite("assets/platformer-enemy.sprite.json", { address: 0x2880 });
c64.assets.loadSprite("assets/platformer-coin.sprite.json", { address: 0x28c0 });

const data = Array(MAP_WIDTH * MAP_HEIGHT).fill(EMPTY);
const tile = (x, y, value) => { data[y * MAP_WIDTH + x] = value; };
const platform = (x, y, width) => {
  for (let offset = 0; offset < width; offset += 1) tile(x + offset, y, SOLID);
};

// Sol, fosses dangereuses et plateformes de la zone basse.
platform(0, 20, 80);
for (let x = 17; x <= 20; x += 1) tile(x, 20, DANGER);
for (let x = 42; x <= 45; x += 1) tile(x, 20, DANGER);
platform(9, 17, 6);
platform(24, 15, 7);
platform(35, 18, 5);
platform(49, 16, 7);
platform(61, 13, 6);
platform(71, 17, 6);
for (let y = 14; y < 20; y += 1) tile(58, y, LADDER);
tile(38, 19, EXIT);

// Seconde zone, plus haute : la camera doit aussi suivre l'axe Y.
platform(40, 10, 40);
for (let x = 53; x <= 55; x += 1) tile(x, 10, DANGER);
platform(44, 7, 6);
platform(58, 6, 7);
platform(69, 4, 7);
tile(77, 9, EXIT);

const level = c64.assets.defineMap({
  version: 1,
  charset: {
    mode: "hires",
    // Les codes pointent vers la ROM C64 : aucun charset RAM ne concurrence
    // le code du moteur, plus volumineux dans cette demo complete.
    characters: Array.from({ length: 161 }, () => Array(8).fill(0))
  },
  tiles: [
    { chars: [32], colors: [0], collision: 0 },
    { chars: [160], colors: [14], collision: 1 },
    { chars: [86], colors: [2], collision: 2 },
    { chars: [94], colors: [5], collision: 3 },
    { chars: [72], colors: [7], collision: 4 }
  ],
  map: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    data,
    objects: [
      { id: "player", type: "player-spawn", x: 3, y: 17, sprite: "platformerActors", properties: { animation: "idle-right" } },
      { id: "zone-2-spawn", type: "checkpoint", x: 43, y: 7 },
      { id: "enemy-a", type: "enemy", x: 28, y: 12, sprite: "platformerEnemy", properties: { animation: "enemy" } },
      { id: "coin-a", type: "collectible", x: 61, y: 3, sprite: "platformerCoin", properties: { animation: "coin" } }
    ]
  }
});

const collisionBehaviors = {
  1: "solid",
  2: "danger",
  3: "exit",
  4: "ladder"
};
const joystick = c64.input.joystick(2);
const facingLeft = c64.var.bool("platformerFacingLeft", false);
const zone = c64.var.byte("platformerZone", { initial: 0 });
const scoreDigit = c64.var.byte("platformerScoreDigit", { initial: 48 });

const player = c64.map.spawn(level, "player", { sprite: 0, maxCollisionSpeed: 8, collisionBehaviors });
const enemy = c64.map.spawn(level, "enemy-a", { sprite: 1, collisionBehaviors });
const collectible = c64.map.spawn(level, "coin-a", { sprite: 8, collisionBehaviors });

const camera = c64.map.scroller(level, {
  sourceX: 0,
  // Les lignes 2 a 20 contiennent les deux hauteurs jouables et le sol.
  sourceY: 2,
  // 36 colonnes laissent deux colonnes de garde de chaque cote au VIC-II.
  // Le recopiage d'une colonne complete reste ainsi dans le budget NTSC.
  width: 36,
  x: 2,
  panel: { bottom: 5 }
});

// Handler utilisateur volontairement partage avec les IRQ du panneau et du
// multiplexeur : il valide la coexistence du dispatcher raster complet.
c64.irq.raster(250, () => c64.backgroundColor(c64.COLOR_BLACK));
c64.irq.install();

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.textColor(c64.COLOR_WHITE);
  c64.printAt(1, 21, "PLATFORMER MINI  SCORE 0");
  c64.printAt(1, 23, "JOY2: MOVE / FIRE: JUMP");
  c64.sid.volume(12);
  camera.draw();
});

c64.game.frame(() => {
  player.velocityX.set(0);
  c64.control.if(joystick.left(), () => {
    player.velocityX.set(-2);
    facingLeft.set(true);
  });
  c64.control.if(joystick.right(), () => {
    player.velocityX.set(2);
    facingLeft.set(false);
  });

  c64.control.if(player.isOnGround(), () => {
    // Impulsion suffisante pour atteindre une plateforme situee trois
    // caracteres plus haut, sans depasser maxCollisionSpeed.
    c64.control.if(joystick.firePressed(), () => player.jump(8));
  });
  player.velocityY.add(1);
  player.moveAndCollide();

  c64.control.if(player.isOnGround(), () => {
    c64.control.if(player.velocityX.eq(0), () => {
      c64.control.if(facingLeft.eq(true), () => player.play("idle-left"), () => player.play("idle-right"));
    }, () => {
      c64.control.if(facingLeft.eq(true), () => player.play("run-left"), () => player.play("run-right"));
    });
  }, () => {
    c64.control.if(facingLeft.eq(true), () => player.play("jump-left"), () => player.play("jump-right"));
  });

  camera.follow(player, {
    axis: "x",
    deadZone: { x: 104, y: 48, width: 96, height: 48 },
    maxSpeed: 2,
    cullingMargin: { x: 24, y: 21 }
  });
  camera.project(enemy, { cullingMargin: { x: 24, y: 21 } });
  camera.project(collectible, { cullingMargin: { x: 24, y: 21 } });

  c64.control.if(player.isOnDanger(), () => {
    c64.control.if(zone.eq(0), () => player.respawn("player"), () => player.respawn("zone-2-spawn"));
    c64.sid.click();
  });
  c64.control.if(player.collides(enemy), () => {
    c64.control.if(zone.eq(0), () => player.respawn("player"), () => player.respawn("zone-2-spawn"));
    c64.sid.click();
  });
  c64.control.if(player.collides(collectible), () => {
    collectible.disable();
    scoreDigit.inc();
    c64.poke(c64.SCREEN_RAM + 24 + 21 * 40, scoreDigit);
    c64.sid.click();
  });

  c64.control.if(player.isAtExit(), () => {
    c64.control.if(zone.eq(0), () => {
      zone.set(1);
      player.respawn("zone-2-spawn");
    }, () => {
      c64.borderColor(c64.COLOR_GREEN);
    });
  });
}, { hz: 50 });
