import { c64 } from "./c64.js";

// Première tranche de l'API 1.0 : les quatre scènes utilisent une seule boucle
// de frame générée automatiquement par c64.game.start().
const joystick = c64.input.joystick(2);
const playTicks = c64.var.word("scenePlayTicks", { initial: 0 });

c64.game.scene("title", {
  enter() {
    playTicks.set(0);
    c64.clearScreen();
    c64.borderColor(c64.COLOR_BLUE);
    c64.backgroundColor(c64.COLOR_BLUE);
    c64.textColor(c64.COLOR_WHITE);
    c64.printCentered(9, "JS-C64 SCENES");
    c64.printCentered(12, "FIRE POUR JOUER");
  },
  update() {
    c64.control.if(joystick.firePressed(), () => c64.game.go("game"));
  }
});

c64.game.scene("game", {
  enter() {
    c64.clearScreen();
    c64.backgroundColor(c64.COLOR_BLACK);
    c64.printCentered(10, "JEU EN COURS");
    c64.printCentered(12, "FIRE: PAUSE");
  },
  update() {
    playTicks.inc();
    c64.control.if(joystick.firePressed(), () => c64.game.go("pause"));
    c64.control.if(playTicks.gte(250), () => c64.game.go("gameOver"));
  }
});

c64.game.scene("pause", {
  enter() {
    c64.printCentered(14, "PAUSE - FIRE POUR REPRENDRE");
  },
  update() {
    c64.control.if(joystick.firePressed(), () => c64.game.go("game"));
  }
});

c64.game.scene("gameOver", {
  enter() {
    c64.clearScreen();
    c64.backgroundColor(c64.COLOR_RED);
    c64.printCentered(10, "GAME OVER");
    c64.printCentered(12, "FIRE: TITRE");
  },
  update() {
    c64.control.if(joystick.firePressed(), () => c64.game.go("title"));
  }
});

c64.game.start("title", { hz: 50 });
