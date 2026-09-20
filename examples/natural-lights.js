"use c64";

import { c64 } from "./c64.js";

// Lights Out: turn off all 16 lights. FIRE flips a cross around the cursor.
const lights = new Uint8Array(16);
const joystick = c64.input.joystick(2);
const moves = c64.game.score({ digits: 3 });
let column = 0;
let row = 0;
let won = false;

function flip(board, index) {
  board[index] ^= 1;
}

function press(board, x, y) {
  let index = y * 4 + x;
  flip(board, index);
  if (x > 0) flip(board, index - 1);
  if (x < 3) flip(board, index + 1);
  if (y > 0) flip(board, index - 4);
  if (y < 3) flip(board, index + 4);
}

function solved(board) {
  for (let i = 0; i < board.length; i++) {
    if (board[i] !== 0) return false;
  }
  return true;
}

function message(text) {
  c64.clearLine(20);
  c64.printAt(2, 20, text);
}

function reset() {
  lights.fill(0);
  // Start from a solved board and apply legal moves: always solvable.
  press(lights, 0, 0);
  press(lights, 2, 1);
  press(lights, 1, 2);
  moves.set(0);
  column = 0;
  row = 0;
  won = false;
  message("JOY 2: MOVE / FIRE: FLIP");
}

function draw(board, counter) {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      let ink = board[y * 4 + x] ? c64.COLOR_YELLOW : c64.COLOR_GRAY1;
      if (x === column && y === row) ink = c64.COLOR_CYAN;
      let glyph = board[y * 4 + x] ? 81 : 87;
      c64.writeChar(14 + x * 3, 7 + y * 2, glyph, ink);
    }
  }
  counter.draw(20, 17, { color: c64.COLOR_WHITE });
}

function init() {
  c64.screen.setup();
  c64.printAt(11, 2, "LIGHTS OUT - JS");
  c64.printAt(7, 4, "TURN OFF ALL THE LIGHTS");
  c64.printAt(12, 17, "MOVES:");
  reset();
  draw(lights, moves);
}

function update() {
  let changed = false;
  if (joystick.leftPressed() && column > 0) { column--; changed = true; }
  if (joystick.rightPressed() && column < 3) { column++; changed = true; }
  if (joystick.upPressed() && row > 0) { row--; changed = true; }
  if (joystick.downPressed() && row < 3) { row++; changed = true; }
  if (joystick.firePressed()) {
    if (won) reset();
    else {
      press(lights, column, row);
      moves.add(1);
      won = solved(lights);
      if (won) message("SOLVED! FIRE TO PLAY AGAIN");
    }
    changed = true;
  }
  if (changed) draw(lights, moves);
}

c64.game.run({ init, update });
