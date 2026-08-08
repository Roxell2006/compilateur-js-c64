import { c64 } from "./c64.js";

const level = c64.assets.loadMap("assets/tetris-room.json");
const joystick = c64.input.joystick(2);
const NORMAL_DROP_FRAMES = 12;
const FAST_DROP_FRAMES = 2;
const FRAME_CHAR = 67; // Quatrieme caractere personnalise, apres les 64 caracteres ROM.

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
const scanX = c64.var.byte("tetrisScanX", { initial: 0 });
const scanY = c64.var.byte("tetrisScanY", { initial: 19 });
const sourceY = c64.var.byte("tetrisSourceY", { initial: 0 });
const filledCells = c64.var.byte("tetrisFilledCells", { initial: 0 });
const checkedRows = c64.var.byte("tetrisCheckedRows", { initial: 0 });
const movedTile = c64.var.byte("tetrisMovedTile", { initial: 0 });
const score = c64.game.score({ name: "tetrisScore", digits: 5, initial: 0 });

c64.game.init(() => {
  c64.charset.use(level.charset, { address: 0x3000 });
  c64.control.call("new_game");
});

c64.control.routine("clear_board", () => {
  scanY.set(0);
  c64.control.repeat(level.map.height, () => {
    scanX.set(0);
    c64.control.repeat(level.map.width, () => {
      level.map(scanX, scanY).set(0);
      scanX.inc();
    });
    scanY.inc();
  });
});

c64.control.routine("new_game", () => {
  c64.control.call("clear_board");
  gameOver.set(false);
  rng.set(37);
  score.set(0);
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.printAt(1, 3, "TETRIS MINI", c64.COLOR_WHITE);
  c64.printAt(1, 6, "SCORE", c64.COLOR_LIGHT_BLUE);
  score.draw(1, 8, { color: c64.COLOR_YELLOW });
  c64.printAt(1, 12, "JOY 2", c64.COLOR_LIGHT_BLUE);
  c64.printAt(1, 14, "BAS: RAPIDE", c64.COLOR_WHITE);
  c64.printAt(1, 16, "FIRE: TOURNE", c64.COLOR_WHITE);
  c64.drawFrame(14, 2, 12, 22, FRAME_CHAR, c64.COLOR_WHITE);
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
  score.inc();
  score.draw(1, 8, { color: c64.COLOR_YELLOW });
  c64.control.call("clear_full_lines");
  c64.sid.click();
});

// Part du bas et remonte. Lorsqu'une ligne est pleine, toutes les lignes
// superieures descendent d'une case. La ligne courante est alors verifiee une
// seconde fois, ce qui permet d'effacer plusieurs lignes en un seul coup.
c64.control.routine("clear_full_lines", () => {
  scanY.set(level.map.height - 1);
  checkedRows.set(0);
  c64.control.while(checkedRows.lt(level.map.height), () => {
    scanX.set(0);
    filledCells.set(0);
    c64.control.repeat(level.map.width, () => {
      c64.control.if(level.map(scanX, scanY).ne(0), () => filledCells.inc());
      scanX.inc();
    });

    c64.control.if(
      filledCells.eq(level.map.width),
      () => {
        sourceY.set(scanY);
        c64.control.while(sourceY.gt(0), () => {
          scanX.set(0);
          c64.control.repeat(level.map.width, () => {
            sourceY.dec();
            level.map(scanX, sourceY).load(movedTile);
            sourceY.inc();
            level.map(scanX, sourceY).set(movedTile);
            scanX.inc();
          });
          sourceY.dec();
        }, { maxIterations: level.map.height - 1 });

        scanX.set(0);
        c64.control.repeat(level.map.width, () => {
          level.map(scanX, 0).set(0);
          scanX.inc();
        });
        score.add(10);
        score.draw(1, 8, { color: c64.COLOR_YELLOW });
      },
      () => {
        scanY.dec();
        checkedRows.inc();
      }
    );
  }, { maxIterations: level.map.height + 4 });
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
      c64.printAt(1, 19, "GAME OVER", c64.COLOR_RED);
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
  c64.control.if(
    gameOver.eq(false),
    () => {
      c64.control.if(joystick.leftPressed(), () => c64.control.call("move_left"));
      c64.control.if(joystick.rightPressed(), () => c64.control.call("move_right"));
      c64.control.if(joystick.firePressed(), () => c64.control.call("rotate_piece"));
      c64.control.if(
        joystick.down(),
        () => c64.game.every(FAST_DROP_FRAMES, () => c64.control.call("drop_piece")),
        () => c64.game.every(NORMAL_DROP_FRAMES, () => c64.control.call("drop_piece"))
      );
    },
    () => c64.control.if(joystick.firePressed(), () => c64.control.call("new_game"))
  );
}, { hz: 50 });
