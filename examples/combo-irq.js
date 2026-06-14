import { c64 } from "./c64.js";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLACK);
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "COMBO IRQ");
c64.printAt(0, 2, "MUSIC + RASTER");
c64.printAt(0, 4, "READY RESTE ACTIF");

c64.sid.volume(15);

c64.sid.voice(1).waveform("pulse");
c64.sid.voice(1).pulseWidth(0x0800);
c64.sid.voice(1).attackDecay(0x11);
c64.sid.voice(1).sustainRelease(0xf0);

c64.sid.voice(2).waveform("triangle");
c64.sid.voice(2).attackDecay(0x11);
c64.sid.voice(2).sustainRelease(0xd0);

c64.sid.voice(3).waveform("saw");
c64.sid.voice(3).attackDecay(0x11);
c64.sid.voice(3).sustainRelease(0xa0);

c64.sid.playSong({
  tempo: 18,
  voices: [
    ["C4", "E4", "G4", "C5", "G4", "E4", "D4", "R"],
    [
      { note: "C3", duration: 2 },
      { note: "G2", duration: 2 },
      { note: "A2", duration: 2 },
      { note: "G2", duration: 2 }
    ],
    [
      { note: "C5", duration: 1 },
      { note: "R", duration: 1 },
      { note: "E5", duration: 1 },
      { note: "R", duration: 1 },
      { note: "G5", duration: 1 },
      { note: "R", duration: 1 },
      { note: "E5", duration: 1 },
      { note: "R", duration: 1 }
    ]
  ]
});

c64.irq.raster(50, () => {
  c64.borderColor(c64.COLOR_RED);
});

c64.irq.raster(150, () => {
  c64.borderColor(c64.COLOR_BLUE);
});

c64.irq.chainToKernal();
c64.irq.install();
