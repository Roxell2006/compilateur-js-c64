"use c64";

import { c64 } from "./c64.js";

// Coordonnees, dimensions et couleurs calculees sur le C64.
let x = c64.word(20);
let width = 40;
let color = 1;

function drawShapes(column, size, ink) {
  c64.hires.rect(column, 25, size, 25, ink);
  c64.hires.fillRect(column, 65, size, 15, ink);
  c64.hires.circle(column + 20, 110, 12, ink);
  c64.hires.fillCircle(column + 20, 155, 12, ink);
}

c64.screen.setup({ mode: "hires" });

while (x < 280) {
  drawShapes(x, width, color);
  x += 60;
  width += 2;
  color += 2;
}

c64.waitKey();
c64.hires.disabled();
