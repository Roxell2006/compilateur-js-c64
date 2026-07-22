import { c64 } from "./c64.js";

const paddlePixels = Array.from({ length: 63 }, (_, i) => i < 15 ? 0xff : 0x00);
const blockPixels = Array.from({ length: 63 }, (_, i) => i < 21 ? 0xff : 0x00);

function ballFrame(shift) {
  const bytes = Array(63).fill(0);
  const rows = [0x3c, 0x7e, 0xff, 0xff, 0xff, 0xff, 0x7e, 0x3c];
  rows.forEach((value, row) => { bytes[row * 3] = shift ? ((value >> 1) | ((value & 1) << 7)) : value; });
  return bytes;
}

const ballFrames = c64.sprite.frames("breakout_ball", [ballFrame(0), ballFrame(1)]);
const joystick = c64.input.joystick(2);
const blocksRemaining = c64.var.byte("blocksRemaining", { initial: 5 });
const scoreChar = c64.var.byte("scoreChar", { initial: 53 });

const paddle = c64.sprite.create(0, {
  x: 160, y: 230, data: paddlePixels, color: c64.COLOR_YELLOW,
  hitbox: { width: 24, height: 5 }, minX: 24, maxX: 320, minY: 230, maxY: 230
});

const ball = c64.sprite.create(1, {
  x: 160, y: 150, frames: ballFrames, color: c64.COLOR_WHITE,
  hitbox: { width: 8, height: 8 }, minX: 24, maxX: 336, minY: 55, maxY: 250,
  bounceX: true, bounceY: false, vx: 2, vy: -2
});
ball.sequence("spin", [0, 1], { speed: 4, loop: true });
ball.play("spin");

const blockColors = [c64.COLOR_RED, c64.COLOR_ORANGE, c64.COLOR_GREEN, c64.COLOR_CYAN, c64.COLOR_VIOLET];
const blocks = blockColors.map((color, index) => c64.sprite.create(index + 2, {
  x: 45 + index * 60, y: 85, data: blockPixels, color,
  hitbox: { width: 24, height: 7 }, minX: 0, maxX: 511, minY: 0, maxY: 255
}));

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printAt(0, 0, "BREAKOUT MINI - JOYSTICK 2");
  c64.printAt(0, 1, "BLOCKS: 5");
  c64.sid.volume(12);
});

c64.game.frame(() => {
  paddle.setVelocity(0, 0);
  c64.control.if(joystick.left(), () => paddle.setVelocity(-4, 0));
  c64.control.if(joystick.right(), () => paddle.setVelocity(4, 0));

  paddle.update();
  ball.update();

  // Le haut rebondit, mais le bas reste ouvert : une balle manquée sort de
  // l'écran avant de repartir depuis sa position initiale.
  c64.control.if(ball.y.lte(55), () => ball.vy.set(2));
  c64.control.if(ball.collides(paddle), () => ball.vy.set(-2));

  c64.control.if(ball.y.gte(250), () => {
    ball.setPosition(160, 150);
    ball.setVelocity(2, -2);
  });

  blocks.forEach((block) => {
    c64.control.if(ball.collides(block), () => {
      block.disable();
      ball.reverseY();
      blocksRemaining.dec();
      scoreChar.set(blocksRemaining);
      scoreChar.add(48);
      c64.poke(c64.SCREEN_RAM + 8 + 40, scoreChar);
      c64.sid.click();
    });
  });

  c64.control.if(blocksRemaining.eq(0), () => {
    c64.borderColor(c64.COLOR_GREEN);
  });
}, { hz: 50 });
