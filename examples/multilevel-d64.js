import { c64 } from "./c64.js";

// Le meme JavaScript produit un PRG autonome (assets inline) ou une disquette
// dont les trois niveaux sont charges a la demande avec --format d64.
const level1 = c64.assets.loadMap("assets/d64-level1.json");
const level2 = c64.assets.loadMap("assets/d64-level2.json");
const level3 = c64.assets.loadMap("assets/d64-level3.json");

// Le joueur reste en memoire. Les trois objets de niveau partagent le meme
// slot $2200 et ne sont lus sur disquette qu'avec le niveau correspondant.
const playerAsset = c64.assets.loadSprite("assets/platformer-actors.sprite.json", {
  address: 0x2000,
  resident: true
});
const level1Sprite = c64.assets.loadSprite("assets/platformer-enemy.sprite.json", {
  address: 0x2200,
  resident: false
});
const level2Sprite = c64.assets.loadSprite("assets/platformer-coin.sprite.json", {
  address: 0x2200,
  resident: false
});
const level3Sprite = c64.assets.defineSprite({
  version: 1,
  id: "levelPortal",
  mode: "hires",
  color: c64.COLOR_CYAN,
  frames: [{ id: "portal", data: Array.from({ length: 63 }, (_, index) => index % 3 === 1 ? 0x7e : 0) }]
}, { address: 0x2200, resident: false });

const joystick = c64.input.joystick(2);
const player = c64.sprite.create(0, {
  x: 72, y: 170, frames: playerAsset.framesRef, color: c64.COLOR_YELLOW
});
const levelObject = c64.sprite.create(1, {
  x: 248, y: 170, frames: level1Sprite.framesRef, color: c64.COLOR_RED
});

c64.game.scene("title", {
  enter() {
    c64.clearScreen();
    c64.borderColor(c64.COLOR_BLUE);
    c64.backgroundColor(c64.COLOR_BLUE);
    c64.textColor(c64.COLOR_WHITE);
    c64.printCentered(10, "MULTILEVEL D64");
    c64.printCentered(13, "FIRE POUR CHARGER");
  },
  update() {
    c64.control.if(joystick.firePressed(), () => c64.game.go("game"));
  }
});

c64.game.scene("game", {
  enter() {
    level1.activate({ draw: true, sprites: [level1Sprite] });
  },
  update() {
    player.update();
    levelObject.update();
    c64.control.if(joystick.firePressed(), () => {
      c64.control.if(level1.isActive(), () => {
        level2.activate({ draw: true, sprites: [level2Sprite] });
        c64.sprite.color(1, c64.COLOR_YELLOW);
      });
      c64.control.if(level2.isActive(), () => {
        level3.activate({ draw: true, sprites: [level3Sprite] });
        c64.sprite.color(1, c64.COLOR_CYAN);
      });
      c64.control.if(level3.isActive(), () => c64.game.go("gameOver"));
    });
  }
});

c64.game.scene("gameOver", {
  enter() {
    player.disable();
    levelObject.disable();
  },
  update() {}
});

c64.game.start("title", { hz: 50 });
