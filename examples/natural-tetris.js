"use c64";

import { c64 } from "./c64.js";

const level = c64.assets.loadMap("assets/tetris-room.json");
const joystick = c64.input.joystick(2);
const score = c64.game.score({ digits: 5 });
const board = new Uint8Array(200); // 10 columns, 20 rows; active piece is separate.
// T, O, I, L: four rotations of four cells each.
const shapeX = new Uint8Array([
  0,1,2,1, 1,0,1,1, 1,0,1,2, 0,0,1,0,
  0,1,0,1, 0,1,0,1, 0,1,0,1, 0,1,0,1,
  0,1,2,3, 0,0,0,0, 0,1,2,3, 0,0,0,0,
  0,0,0,1, 0,0,1,2, 0,1,1,1, 0,1,2,2
]);
const shapeY = new Uint8Array([
  0,0,0,1, 0,1,1,2, 0,1,1,1, 0,1,1,2,
  0,0,1,1, 0,0,1,1, 0,0,1,1, 0,0,1,1,
  0,0,0,0, 0,1,2,3, 0,0,0,0, 0,1,2,3,
  0,1,2,2, 0,1,0,0, 0,0,1,2, 1,1,1,0
]);
let pieceX = 3;
let pieceY = 0;
let kind = 0;
let rotation = 0;
let rng = 37;
let gameOver = false;

function drawCell(x, y, value) {
  c64.writeChar(15 + x, 3 + y, 64 + value, value === 2 ? c64.COLOR_YELLOW : c64.COLOR_LIGHTBLUE);
}

function drawBoard() {
  for (let y = 0; y < 20; y++) {
    for (let x = 0; x < 10; x++) drawCell(x, y, board[y * 10 + x]);
  }
  score.draw(1, 8, { color: c64.COLOR_YELLOW });
}

function fits(x, y, turn) {
  if (x >= 10 || y >= 20) return false; // Also rejects unsigned underflow.
  for (let i = 0; i < 4; i++) {
    let index = kind + turn + i;
    let cx = x + shapeX[index];
    let cy = y + shapeY[index];
    if (cx >= 10 || cy >= 20) return false;
    if (board[cy * 10 + cx] !== 0) return false;
  }
  return true;
}

function paintPiece(value) {
  for (let i = 0; i < 4; i++) {
    let index = kind + rotation + i;
    let x = pieceX + shapeX[index];
    let y = pieceY + shapeY[index];
    drawCell(x, y, value);
    if (value === 1) board[y * 10 + x] = 1;
  }
}

function spawn() {
  rng = (rng + 73) ^ 0xa7;
  pieceX = (rng & 3) + 2;
  pieceY = 0;
  kind = rng & 0x30;
  rotation = rng & 12;
  gameOver = !fits(pieceX, pieceY, rotation);
  if (gameOver) {
    c64.borderColor(c64.COLOR_RED);
    c64.printAt(1, 19, "GAME OVER", c64.COLOR_RED);
  } else paintPiece(2);
}

function clearLines() {
  let row = 20;
  let cleared = false;
  while (row > 0) {
    row--;
    let full = true;
    for (let x = 0; x < 10; x++) {
      if (board[row * 10 + x] === 0) full = false;
    }
    if (full) {
      cleared = true;
      for (let y = row; y > 0; y--) {
        for (let x = 0; x < 10; x++) board[y * 10 + x] = board[(y - 1) * 10 + x];
      }
      for (let x = 0; x < 10; x++) board[x] = 0;
      score.add(10);
      row++; // Recheck this row after the rows above have fallen.
    }
  }
  return cleared;
}

function move(x, y, turn) {
  if (!fits(x, y, turn)) return false;
  paintPiece(0);
  pieceX = x;
  pieceY = y;
  rotation = turn;
  paintPiece(2);
  return true;
}

function drop() {
  if (move(pieceX, pieceY + 1, rotation)) return;
  paintPiece(1);
  score.inc();
  if (clearLines()) drawBoard();
  else score.draw(1, 8, { color: c64.COLOR_YELLOW });
  c64.sid.click();
  spawn();
}

function newGame() {
  board.fill(0);
  rng = 37;
  score.set(0);
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.printAt(1, 3, "TETRIS MINI");
  c64.printAt(1, 6, "SCORE");
  c64.printAt(1, 12, "JOY 2");
  c64.printAt(1, 14, "DOWN: FAST");
  c64.printAt(1, 16, "FIRE: TURN");
  c64.drawFrame(14, 2, 12, 22, 67);
  drawBoard();
  spawn();
}

function update() {
  if (gameOver) {
    if (joystick.firePressed()) newGame();
    return;
  }
  if (joystick.leftPressed()) move(pieceX - 1, pieceY, rotation);
  if (joystick.rightPressed()) move(pieceX + 1, pieceY, rotation);
  if (joystick.firePressed()) move(pieceX, pieceY, (rotation + 4) & 15);
  if (joystick.down()) c64.game.every(2, drop);
  else c64.game.every(12, drop);
}

function init() {
  c64.screen.setup();
  c64.charset.use(level.charset, { address: 0x3000 });
  newGame();
}

c64.game.run({ init, update });
