import { c64 } from "./c64.js";

const level = c64.assets.loadMap("assets/snake-room.json");
const joystick = c64.input.joystick(2);
const bodyX = c64.table.byte("snake_body_x", Array(64).fill(10));
const bodyY = c64.table.byte("snake_body_y", Array(64).fill(7));
const headX = c64.var.byte("snakeHeadX", { initial: 10 });
const headY = c64.var.byte("snakeHeadY", { initial: 7 });
const nextX = c64.var.byte("snakeNextX", { initial: 10 });
const nextY = c64.var.byte("snakeNextY", { initial: 7 });
const headSlot = c64.var.byte("snakeHeadSlot", { initial: 0 });
const tailSlot = c64.var.byte("snakeTailSlot", { initial: 0 });
const tailX = c64.var.byte("snakeTailX", { initial: 10 });
const tailY = c64.var.byte("snakeTailY", { initial: 7 });
const direction = c64.var.byte("snakeDirection", { initial: 1 }); // 0 up, 1 right, 2 down, 3 left
const growing = c64.var.bool("snakeGrowing", { initial: false });
const gameOver = c64.var.bool("snakeGameOver", { initial: false });
const foodStep = c64.var.byte("snakeFoodStep", { initial: 0 });
const foodX = c64.var.byte("snakeFoodX", { initial: 14 });
const foodY = c64.var.byte("snakeFoodY", { initial: 6 });

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.charset.use(level.charset, { address: 0x3000 });
  c64.printAt(23, 4, "SNAKE V0.9", c64.COLOR_WHITE);
  c64.printAt(23, 6, "JOYSTICK 2", c64.COLOR_LIGHT_BLUE);
  c64.map.draw(level, { x: 1, y: 4 });
  bodyX.store(0, headX);
  bodyY.store(0, headY);
});

c64.control.routine("snake_spawn_food", () => {
  foodStep.inc();
  foodX.set(foodStep); foodX.and(15); foodX.add(2);
  foodY.set(foodStep); foodY.and(7); foodY.add(3);
  c64.control.if(level.map(foodX, foodY).eq(0), () => level.map(foodX, foodY).set(2));
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
    }, () => { c64.sid.click(); c64.control.call("snake_spawn_food"); });
    headSlot.inc(); headSlot.and(63);
    headX.set(nextX); headY.set(nextY);
    bodyX.store(headSlot, headX); bodyY.store(headSlot, headY);
    level.map(headX, headY).set(3);
  }, () => c64.borderColor(c64.COLOR_RED));
});

c64.game.frame(() => {
  c64.control.if(joystick.upPressed(), () => direction.set(0));
  c64.control.if(joystick.rightPressed(), () => direction.set(1));
  c64.control.if(joystick.downPressed(), () => direction.set(2));
  c64.control.if(joystick.leftPressed(), () => direction.set(3));
  c64.control.if(gameOver.eq(false), () => c64.game.every(6, () => c64.control.call("snake_step")));
}, { hz: 50 });
