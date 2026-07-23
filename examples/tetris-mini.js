import { c64 } from "./c64.js";

const level = c64.assets.loadMap("assets/tetris-room.json");
const joystick = c64.input.joystick(2);

// Four tetrominoes (T, O, I and L), each with four rotations. Every group of
// four values describes the four cells of one orientation.
const shapeX = c64.table.byte("tetris_shape_x", [
  0, 1, 2, 1,  1, 0, 1, 1,
  1, 0, 1, 2,  0, 0, 1, 0,

  0, 1, 0, 1,  0, 1, 0, 1,
  0, 1, 0, 1,  0, 1, 0, 1,

  0, 1, 2, 3,  0, 0, 0, 0,
  0, 1, 2, 3,  0, 0, 0, 0,

  0, 0, 0, 1,  0, 0, 1, 2,
  0, 1, 1, 1,  0, 1, 2, 2
]);
const shapeY = c64.table.byte("tetris_shape_y", [
  0, 0, 0, 1,  0, 1, 1, 2,
  0, 1, 1, 1,  0, 1, 1, 2,

  0, 0, 1, 1,  0, 0, 1, 1,
  0, 0, 1, 1,  0, 0, 1, 1,

  0, 0, 0, 0,  0, 1, 2, 3,
  0, 0, 0, 0,  0, 1, 2, 3,

  0, 1, 2, 2,  0, 1, 0, 0,
  0, 0, 1, 2,  1, 1, 1, 0
]);

const pieceX = c64.var.byte("pieceX", { initial: 3 });
const pieceY = c64.var.byte("pieceY", { initial: 0 });
const shapeBase = c64.var.byte("shapeBase", { initial: 0 });
const pieceTypeBase = c64.var.byte("pieceTypeBase", { initial: 0 });
const rotation = c64.var.byte("rotation", { initial: 0 });
const workRotation = c64.var.byte("workRotation", { initial: 0 });
const workX = c64.var.byte("workX", { initial: 0 });
const workY = c64.var.byte("workY", { initial: 0 });
const workShape = c64.var.byte("workShape", { initial: 0 });
const cellIndex = c64.var.byte("cellIndex", { initial: 0 });
const tableIndex = c64.var.byte("tableIndex", { initial: 0 });
const offsetX = c64.var.byte("offsetX", { initial: 0 });
const offsetY = c64.var.byte("offsetY", { initial: 0 });
const cellX = c64.var.byte("cellX", { initial: 0 });
const cellY = c64.var.byte("cellY", { initial: 0 });
const blocked = c64.var.bool("blocked", { initial: false });
const gameOver = c64.var.bool("gameOver", { initial: false });
const rng = c64.var.byte("rng", { initial: 37 });

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.charset.use(level.charset, { address: 0x3000 });
  c64.drawFrame(14, 2, 12, 22, 3, c64.COLOR_WHITE);
  c64.map.draw(level, { x: 15, y: 3 });
  c64.control.call("spawn_piece");
});

c64.control.routine("prepare_cell", () => {
  tableIndex.set(workShape);
  tableIndex.add(cellIndex);
  shapeX.load(tableIndex, offsetX);
  shapeY.load(tableIndex, offsetY);
  cellX.set(workX);
  cellX.add(offsetX);
  cellY.set(workY);
  cellY.add(offsetY);
});

c64.control.routine("use_current_piece", () => {
  workX.set(pieceX);
  workY.set(pieceY);
  workShape.set(shapeBase);
});

c64.control.routine("clear_piece", () => {
  c64.control.call("use_current_piece");
  cellIndex.set(0);
  c64.control.repeat(4, () => {
    c64.control.call("prepare_cell");
    level.map(cellX, cellY).set(0);
    cellIndex.inc();
  });
});

c64.control.routine("draw_piece", () => {
  c64.control.call("use_current_piece");
  cellIndex.set(0);
  c64.control.repeat(4, () => {
    c64.control.call("prepare_cell");
    level.map(cellX, cellY).set(2);
    cellIndex.inc();
  });
});

c64.control.routine("lock_piece", () => {
  c64.control.call("use_current_piece");
  cellIndex.set(0);
  c64.control.repeat(4, () => {
    c64.control.call("prepare_cell");
    level.map(cellX, cellY).set(1);
    cellIndex.inc();
  });
  c64.sid.click();
});

c64.control.routine("test_work_piece", () => {
  blocked.set(false);
  cellIndex.set(0);
  c64.control.repeat(4, () => {
    c64.control.call("prepare_cell");
    c64.control.if(
      level.map(cellX, cellY).eq(0),
      () => {},
      () => blocked.set(true)
    );
    cellIndex.inc();
  });
});

c64.control.routine("spawn_piece", () => {
  rng.add(73);
  rng.xor(0xa7);
  pieceX.set(rng);
  pieceX.and(3);
  pieceX.add(2);
  pieceY.set(0);
  pieceTypeBase.set(rng);
  pieceTypeBase.and(0x30);
  rotation.set(rng);
  rotation.and(0x0c);
  shapeBase.set(pieceTypeBase);
  shapeBase.add(rotation);
  c64.control.call("use_current_piece");
  c64.control.call("test_work_piece");
  c64.control.if(
    blocked.eq(false),
    () => c64.control.call("draw_piece"),
    () => {
      gameOver.set(true);
      c64.borderColor(c64.COLOR_RED);
    }
  );
});

c64.control.routine("move_left", () => {
  c64.control.call("clear_piece");
  c64.control.call("use_current_piece");
  workX.sub(1);
  c64.control.call("test_work_piece");
  c64.control.if(blocked.eq(false), () => pieceX.set(workX));
  c64.control.call("draw_piece");
});

c64.control.routine("move_right", () => {
  c64.control.call("clear_piece");
  c64.control.call("use_current_piece");
  workX.add(1);
  c64.control.call("test_work_piece");
  c64.control.if(blocked.eq(false), () => pieceX.set(workX));
  c64.control.call("draw_piece");
});

c64.control.routine("rotate_piece", () => {
  c64.control.call("clear_piece");
  c64.control.call("use_current_piece");
  workRotation.set(rotation);
  workRotation.add(4);
  workRotation.and(0x0f);
  workShape.set(pieceTypeBase);
  workShape.add(workRotation);
  c64.control.call("test_work_piece");
  c64.control.if(blocked.eq(false), () => {
    rotation.set(workRotation);
    shapeBase.set(workShape);
  });
  c64.control.call("draw_piece");
});

c64.control.routine("drop_piece", () => {
  c64.control.call("clear_piece");
  c64.control.call("use_current_piece");
  workY.add(1);
  c64.control.call("test_work_piece");
  c64.control.if(
    blocked.eq(false),
    () => {
      pieceY.set(workY);
      c64.control.call("draw_piece");
    },
    () => {
      c64.control.call("lock_piece");
      c64.control.call("spawn_piece");
    }
  );
});

c64.game.frame(() => {
  c64.control.if(gameOver.eq(false), () => {
    c64.control.if(joystick.leftPressed(), () => c64.control.call("move_left"));
    c64.control.if(joystick.rightPressed(), () => c64.control.call("move_right"));
    c64.control.if(joystick.firePressed(), () => c64.control.call("rotate_piece"));
    c64.game.every(10, () => c64.control.call("drop_piece"));
  });
}, { hz: 50 });
