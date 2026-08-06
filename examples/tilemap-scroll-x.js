import { c64 } from "./c64.js";

// Scroll horizontal v0.10 : le VIC-II déplace la fenêtre d'un pixel avec $D016.
// Tous les 8 pixels, le runtime décale Screen RAM et Color RAM puis ne dessine
// que la nouvelle colonne de la map.
const MAP_WIDTH = 48;
const MAP_HEIGHT = 20;
const VIEW_WIDTH = 28;
const VIEW_HEIGHT = 8;

// Le charset n'est pas installé : les codes 32, 81 et 160 utilisent donc la
// ROM de caractères d'origine du C64, ce qui laisse également le texte intact.
const room = c64.assets.defineMap({
  version: 1,
  charset: { characters: Array.from({ length: 161 }, () => Array(8).fill(0)) },
  tiles: [
    { chars: [32], colors: [0], collision: 0 },
    { chars: [160], colors: [5], collision: 1, properties: { solid: true } },
    { chars: [81], colors: [7], collision: 0, properties: { marker: true } }
  ],
  map: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    data: Array.from({ length: MAP_WIDTH * MAP_HEIGHT }, (_, index) => {
      const x = index % MAP_WIDTH;
      const y = Math.floor(index / MAP_WIDTH);
      if (y === MAP_HEIGHT - 1) return 1;
      if (y === 5 && x % 9 >= 2 && x % 9 <= 5) return 1;
      if (y === 3 && x % 6 === 0) return 2;
      return 0;
    })
  }
});

const joystick = c64.input.joystick(2);
const scroll = c64.map.horizontalScroller(room, {
  sourceX: 0,
  sourceY: 0,
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
  x: 6,
  y: 6,
  panel: "bottom"
});

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  c64.textColor(c64.COLOR_WHITE);
  c64.printCentered(20, "V0.10 FINE SCROLL X/Y");
  c64.printCentered(22, "SCORE 0000 - JOYSTICK 4 DIRECTIONS");
  scroll.draw();
});

c64.game.frame(() => {
  c64.control.if(joystick.left(), () => scroll.left());
  c64.control.if(joystick.right(), () => scroll.right());
  c64.control.if(joystick.up(), () => scroll.up());
  c64.control.if(joystick.down(), () => scroll.down());
}, { hz: 50 });
