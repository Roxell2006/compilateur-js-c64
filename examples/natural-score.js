"use c64";

import { c64 } from "./c64.js";

const joystick = c64.input.joystick(2);
const score = c64.game.score({ digits: 5 });
let bonus = c64.word(10);
let turns = c64.word(0);

function showValue(row, value) {
  c64.printNumber(15, row, value, { digits: 5, color: c64.COLOR_CYAN });
}

function drawHud() {
  score.draw(15, 6, { color: c64.COLOR_YELLOW });
  showValue(8, bonus);
  showValue(10, turns);
}

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.printAt(2, 2, "NATURAL JS - SCORE");
  c64.printAt(2, 6, "SCORE");
  c64.printAt(2, 8, "NEXT BONUS");
  c64.printAt(2, 10, "TURNS");
  c64.printAt(2, 14, "JOY 2 FIRE: ADD BONUS");
  c64.printAt(2, 16, "JOY 2 UP: RESET");
  drawHud();
});

c64.game.frame(() => {
  if (joystick.firePressed()) {
    score.add(bonus);
    bonus += 5;
    turns += 1;
    drawHud();
  }
  if (joystick.upPressed()) {
    score.set(0);
    bonus = 10;
    turns = 0;
    drawHud();
  }
});
