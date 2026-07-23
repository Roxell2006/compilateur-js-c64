import { c64 } from "./c64.js";

// Le JSON reste un fichier source lisible. Le compilateur valide et transforme
// charset, metatiles et map en donnees C64 compactes pendant le build.
const room = c64.assets.loadMap("assets/v09-room.json");

c64.game.init(() => {
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.charset.use(room.charset, { address: 0x3000 });
  c64.map.draw(room, { x: 10, y: 6 });
});
