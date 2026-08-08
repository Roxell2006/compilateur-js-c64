import { c64 } from "js-c64";

const PLAYER_PIXELS = Array.from(
  { length: 63 },
  (_, index) => (index < 54 && index % 3 === 1 ? 0x7e : 0)
);

const joystick = c64.input.joystick(2);
const score = c64.game.score({ name: "demoScore", digits: 3, initial: 0 });

const player = c64.sprite.create(0, {
  x: 150,
  y: 120,
  data: PLAYER_PIXELS,
  color: c64.COLOR_YELLOW,
  minX: 24,
  maxX: 296,
  minY: 50,
  maxY: 220
});

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printCentered(2, "MON PREMIER MINI JEU");
  c64.printAt(2, 23, "JOY 2: BOUGER  FIRE: SCORE");
  c64.printAt(29, 2, "SCORE");
  score.draw(35, 2, { color: c64.COLOR_YELLOW });
});

c64.game.frame(() => {
  player.setVelocity(0, 0);

  c64.control.if(joystick.left(), () => player.setVelocity(-2, 0));
  c64.control.if(joystick.right(), () => player.setVelocity(2, 0));
  c64.control.if(joystick.up(), () => player.setVelocity(0, -2));
  c64.control.if(joystick.down(), () => player.setVelocity(0, 2));

  c64.control.if(joystick.firePressed(), () => {
    score.inc();
    score.draw(35, 2, { color: c64.COLOR_YELLOW });
    c64.sid.click();
  });

  player.update();
}, { hz: 50 });
