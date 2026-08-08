import { c64 } from "./c64.js";

const level = c64.assets.loadMap("assets/snake-room.json");
const joystick = c64.input.joystick(2);
const keyboard = c64.input.keyboard({ restart: c64.KEY_SPACE });

// Reglage simple : nombre de frames entre deux deplacements.
// Une valeur plus petite rend le serpent plus rapide.
const speed = 6;

const playerSpawn = level.map.objects.find((object) => object.type === "player-spawn");
const foodSpawn = level.map.objects.find((object) => object.type === "food-spawn");
if (!playerSpawn) throw new Error('snake-room.json doit contenir un objet "player-spawn"');
if (!foodSpawn) throw new Error('snake-room.json doit contenir un objet "food-spawn"');
if (playerSpawn.x === foodSpawn.x && playerSpawn.y === foodSpawn.y) {
  throw new Error("player-spawn et food-spawn ne peuvent pas partager la meme case");
}

const directionValues = { up: 0, right: 1, down: 2, left: 3 };
const initialDirectionName = String(playerSpawn.properties.direction ?? "right").toLowerCase();
const initialDirection = directionValues[initialDirectionName];
if (initialDirection === undefined) {
  throw new Error('La direction de player-spawn doit etre "up", "right", "down" ou "left"');
}
if (!Number.isInteger(speed) || speed < 1 || speed > 255) {
  throw new Error("speed doit etre un entier compris entre 1 et 255");
}

const bodyX = c64.table.byte("snake_body_x", Array(64).fill(playerSpawn.x));
const bodyY = c64.table.byte("snake_body_y", Array(64).fill(playerSpawn.y));
const headX = c64.var.byte("snakeHeadX", { initial: playerSpawn.x });
const headY = c64.var.byte("snakeHeadY", { initial: playerSpawn.y });
const nextX = c64.var.byte("snakeNextX", { initial: playerSpawn.x });
const nextY = c64.var.byte("snakeNextY", { initial: playerSpawn.y });
const headSlot = c64.var.byte("snakeHeadSlot", { initial: 0 });
const tailSlot = c64.var.byte("snakeTailSlot", { initial: 0 });
const tailX = c64.var.byte("snakeTailX", { initial: playerSpawn.x });
const tailY = c64.var.byte("snakeTailY", { initial: playerSpawn.y });
const direction = c64.var.byte("snakeDirection", { initial: initialDirection });
const growing = c64.var.bool("snakeGrowing", { initial: false });
const gameOver = c64.var.bool("snakeGameOver", { initial: false });
const started = c64.var.bool("snakeStarted", { initial: false });
const restartRequested = c64.var.bool("snakeRestartRequested", { initial: false });
const foodPlaced = c64.var.bool("snakeFoodPlaced", { initial: true });
const foodX = c64.var.byte("snakeFoodX", { initial: foodSpawn.x });
const foodY = c64.var.byte("snakeFoodY", { initial: foodSpawn.y });
const score = c64.game.score({ name: "snakeScore", digits: 3, initial: 0 });
const resetX = c64.var.byte("snakeResetX", { initial: 1 });
const resetY = c64.var.byte("snakeResetY", { initial: 1 });

// Une seed fixe rend les parties et les tests reproductibles. Chaque nouvelle
// pomme commence sa recherche depuis une case pseudo-aleatoire, puis le moteur
// parcourt les cases suivantes jusqu'a en trouver une vraiment libre.
c64.random.seed(73);

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.charset.use(level.charset, { address: 0x3000 });
  c64.printAt(23, 4, "SNAKE V1.0", c64.COLOR_WHITE);
  c64.printAt(23, 6, "JOYSTICK 2", c64.COLOR_LIGHT_BLUE);
  c64.printAt(23, 8, "SCORE", c64.COLOR_WHITE);
  score.draw(29, 8, { color: c64.COLOR_YELLOW });
  c64.printAt(23, 10, "FIRE TO START");
  c64.map.draw(level, { x: 1, y: 4 });
  level.map(playerSpawn.x, playerSpawn.y).set(3);
  level.map(foodSpawn.x, foodSpawn.y).set(2);
  bodyX.store(0, headX);
  bodyY.store(0, headY);
});

c64.control.routine("snake_reset", () => {
  // Nettoie les 18 x 13 cases jouables sans toucher aux murs de la map.
  resetX.set(1);
  resetY.set(1);
  c64.control.while(resetY.lt(level.map.height - 1), () => {
    level.map(resetX, resetY).set(0);
    resetX.inc();
    c64.control.if(resetX.gte(level.map.width - 1), () => {
      resetX.set(1);
      resetY.inc();
    });
  }, { maxIterations: (level.map.width - 2) * (level.map.height - 2) });

  headX.set(playerSpawn.x); headY.set(playerSpawn.y);
  nextX.set(playerSpawn.x); nextY.set(playerSpawn.y);
  headSlot.set(0); tailSlot.set(0);
  tailX.set(playerSpawn.x); tailY.set(playerSpawn.y);
  direction.set(initialDirection);
  growing.set(false);
  gameOver.set(false);
  started.set(false);
  foodPlaced.set(true);
  foodX.set(foodSpawn.x); foodY.set(foodSpawn.y);
  score.set(0);
  score.draw(29, 8, { color: c64.COLOR_YELLOW });
  c64.random.seed(73);
  level.map(playerSpawn.x, playerSpawn.y).set(3);
  level.map(foodSpawn.x, foodSpawn.y).set(2);
  bodyX.store(0, headX);
  bodyY.store(0, headY);
  c64.borderColor(c64.COLOR_BLACK);
  c64.printAt(23, 10, "FIRE TO START    ");
  c64.printAt(23, 11, "                 ");
});

c64.control.routine("snake_spawn_food", () => {
  foodPlaced.set(false);
  c64.random.range(foodX, level.map.width - 2);
  c64.random.range(foodY, level.map.height - 2);
  foodX.inc();
  foodY.inc();
  // Parcourt au maximum toutes les cases interieures. La boucle s'arrete des
  // qu'une case vide est trouvee : la pomme ne remplace donc jamais le serpent.
  c64.control.while(foodPlaced.eq(false), () => {
    foodX.inc();
    c64.control.if(foodX.gte(level.map.width - 1), () => {
      foodX.set(1);
      foodY.inc();
      c64.control.if(foodY.gte(level.map.height - 1), () => foodY.set(1));
    });
    c64.control.if(level.map(foodX, foodY).eq(0), () => {
      level.map(foodX, foodY).set(2);
      foodPlaced.set(true);
    });
  }, { maxIterations: (level.map.width - 2) * (level.map.height - 2) });
});

c64.control.routine("snake_step", () => {
  nextX.set(headX); nextY.set(headY);
  c64.control.if(direction.eq(0), () => nextY.dec());
  c64.control.if(direction.eq(1), () => nextX.inc());
  c64.control.if(direction.eq(2), () => nextY.inc());
  c64.control.if(direction.eq(3), () => nextX.dec());
  c64.control.if(
    level.map(nextX, nextY).eq(0),
    () => growing.set(false),
    () => c64.control.if(
      level.map(nextX, nextY).eq(2),
      () => growing.set(true),
      () => gameOver.set(true)
    )
  );
  c64.control.if(gameOver.eq(false), () => {
    c64.control.if(growing.eq(false), () => {
      bodyX.load(tailSlot, tailX); bodyY.load(tailSlot, tailY);
      level.map(tailX, tailY).set(0);
      tailSlot.inc(); tailSlot.and(63);
    }, () => {
      score.inc();
      score.draw(29, 8, { color: c64.COLOR_YELLOW });
      c64.sid.click();
      c64.control.call("snake_spawn_food");
    });
    headSlot.inc(); headSlot.and(63);
    headX.set(nextX); headY.set(nextY);
    bodyX.store(headSlot, headX); bodyY.store(headSlot, headY);
    level.map(headX, headY).set(3);
  }, () => c64.borderColor(c64.COLOR_RED));
});

c64.game.frame(() => {
  restartRequested.set(false);
  c64.control.if(gameOver.eq(true), () => {
    c64.borderColor(c64.COLOR_RED);
    c64.printAt(23, 10, "GAME OVER        ");
    c64.printAt(23, 11, "FIRE/SPACE: RESET");
    c64.control.if(joystick.firePressed(), () => restartRequested.set(true));
    c64.control.if(keyboard.restart.pressed(), () => restartRequested.set(true));
    c64.control.if(restartRequested.eq(true), () => c64.control.call("snake_reset"));
  });

  c64.control.if(gameOver.eq(false), () => {
    c64.control.if(started.eq(false), () => {
      c64.control.if(joystick.firePressed(), () => {
        started.set(true);
        c64.printAt(23, 10, "                 ");
        c64.printAt(23, 11, "                 ");
      });
    });
    c64.control.if(started.eq(true), () => {
      c64.control.if(joystick.upPressed(), () => direction.set(0));
      c64.control.if(joystick.rightPressed(), () => direction.set(1));
      c64.control.if(joystick.downPressed(), () => direction.set(2));
      c64.control.if(joystick.leftPressed(), () => direction.set(3));
      c64.game.every(speed, () => c64.control.call("snake_step"));
    });
  });
}, { hz: 50 });
