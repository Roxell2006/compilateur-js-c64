import { c64 } from "./c64.js";

// La musique utilise les voix 1 et 2. La voix 3 appartient exclusivement aux
// bruitages : le lecteur musical ne peut donc jamais couper un effet en cours.
c64.sid.reserveSfxVoice(3);
c64.sid.volume(12);

const lead = c64.sid.instrument("lead", {
  waveform: "pulse",
  pulseWidth: 0x0800,
  attackDecay: 0x11,
  sustainRelease: 0x98
});
const bass = c64.sid.instrument("bass", {
  waveform: "triangle",
  attackDecay: 0x12,
  sustainRelease: 0x88
});

const melody = c64.sid.pattern("melody", [
  "C4", "E4", "G4", "E4", "D4", "F4", "A4", "F4"
]);
const bassLine = c64.sid.pattern("bass-line", [
  { note: "C3", duration: 2 },
  { note: "G2", duration: 2 },
  { note: "D3", duration: 2 },
  { note: "A2", duration: 2 }
]);
const sfxSilence = c64.sid.pattern("sfx-silence", [
  { rest: true, duration: 8 }
]);

c64.sid.playSong({
  // Un tick vaut toujours 1/50 s, sur C64 PAL comme sur C64 NTSC.
  tempo: 5,
  loop: true,
  instruments: [lead, bass, null],
  voices: [
    melody.repeat(2),
    bassLine.repeat(2),
    // Ces silences documentent que la voix 3 est reservee aux effets.
    sfxSilence.repeat(2)
  ]
});

const joystick = c64.input.joystick(2);

c64.game.init(() => {
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLUE);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printCentered(7, "AUDIO DE JEU V0.11");
  c64.printCentered(10, "HAUT : PAUSE");
  c64.printCentered(12, "BAS  : REPRISE");
  c64.printCentered(14, "GAUCHE/DROITE : FADE");
  c64.printCentered(16, "FEU  : BRUITAGE");
});

c64.game.frame(() => {
  c64.control.if(joystick.upPressed(), () => c64.sid.pauseSong());
  c64.control.if(joystick.downPressed(), () => c64.sid.resumeSong());
  c64.control.if(joystick.leftPressed(), () => c64.sid.fadeSong(0, 3));
  c64.control.if(joystick.rightPressed(), () => c64.sid.fadeSong(12, 3));
  c64.control.if(joystick.firePressed(), () => c64.sid.click());
}, { hz: "video" });
