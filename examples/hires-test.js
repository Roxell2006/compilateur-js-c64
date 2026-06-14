import { c64 } from "./c64.js";

// Par defaut:
// - screen RAM hires = $5C00
// - bitmap hires     = $6000
c64.hires.screen(0x0400); // mémoire caractères 1024 ($0400)
c64.hires.bitmap(0x2000); // bitmap 8192 ($2000)
c64.hires.enabled(); // active le mode hires

// Efface le bitmap hires et initialise la memoire ecran hires.
// La couleur par defaut est blanche.
c64.hires.clear(c64.COLOR_BLACK);
c64.borderColor(c64.COLOR_BLACK); // bordure noire pour avoir tout l'écran noir

// Un de chaque forme, bien separé.
c64.hires.line(20, 20, 300, 20, c64.COLOR_WHITE);
c64.hires.fillRect(30, 50, 60, 30, c64.COLOR_CYAN);
c64.hires.circle(180, 80, 24, c64.COLOR_RED);
c64.hires.fillCircle(260, 140, 10, c64.COLOR_GREEN);

// Attend une touche, puis repasse en mode texte normal avant de rendre la main
c64.waitKey();
c64.hires.disabled();
c64.clearScreen();