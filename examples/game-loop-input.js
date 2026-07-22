import { c64 } from "./c64.js";

// A 24x5 hardware-sprite paddle.
const PADDLE_SPRITE = Array.from({ length: 63 }, (_, index) => index < 15 ? 0xff : 0x00);
const paused = c64.var.bool("paused", { initial: false });
const heartbeat = c64.var.bool("heartbeat", { initial: false });
const elapsedFrames = c64.var.word("elapsedFrames", { initial: 0 });

const joystick = c64.input.joystick(2);
const keys = c64.input.keyboard({ pause: c64.KEY_SPACE });

const paddle = c64.sprite.create(0, {
  x: 100,
  y: 210,
  data: PADDLE_SPRITE,
  color: c64.COLOR_YELLOW,
  hitbox: { width: 24, height: 5 },
  minX: 24,
  maxX: 320,
  minY: 210,
  maxY: 210
});

c64.control.routine("move_player_left", () => {
  paddle.setVelocity(-3, 0);
});

c64.control.routine("move_player_right", () => {
  paddle.setVelocity(3, 0);
});

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printCentered(1, "V0.8 GAMEPLAY SPRITE");
  c64.printCentered(3, "MOVE: JOYSTICK PORT 2");
  c64.printCentered(4, "FIRE: BORDER / SPACE: PAUSE");

  c64.sid.volume(12);
  c64.sid.voice(1).waveform("triangle");
  c64.sid.voice(1).attackDecay(0x11);
  c64.sid.voice(1).sustainRelease(0x90);
  c64.sid.playSong({
    tempo: 6,
    voices: [
      ["C4", "E4", "G4", "E4"],
      ["C3", "R", "G2", "R"],
      ["R", "C5", "R", "G4"]
    ]
  });
});

c64.game.frame(() => {
  elapsedFrames.inc();
  paddle.setVelocity(0, 0);

  c64.control.if(paused.eq(false), () => {
    c64.control.if(joystick.left(), () => c64.control.call("move_player_left"));
    c64.control.if(joystick.right(), () => c64.control.call("move_player_right"));
  });

  // pressed() is true for one logical frame only, even if FIRE stays held.
  c64.control.if(joystick.firePressed(), () => {
    c64.borderColor(c64.COLOR_RED);
  });
  c64.control.if(joystick.fireReleased(), () => {
    c64.borderColor(c64.COLOR_BLACK);
  });

  c64.control.if(keys.pause.pressed(), () => paused.toggle());

  c64.game.every(25, () => {
    heartbeat.toggle();
    c64.control.if(
      heartbeat.eq(true),
      () => c64.backgroundColor(c64.COLOR_BLUE),
      () => c64.backgroundColor(c64.COLOR_VIOLET)
    );
  });

  paddle.update();
}, { hz: 50 });
