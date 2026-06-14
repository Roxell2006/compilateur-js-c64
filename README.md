# js-c64

[![CI](https://github.com/yourname/js-c64/actions/workflows/ci.yml/badge.svg)](https://github.com/yourname/js-c64/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/js-c64.svg)](https://www.npmjs.com/package/js-c64)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

`js-c64` is a publishable Node.js library that lets you write a JavaScript DSL and emit Commodore 64 6502 machine code directly, without requiring `cc65`, `KickAssembler` or `ACME`.

## Quickstart

```bash
npm install js-c64
```

```js
import { c64 } from "js-c64";

c64.clearScreen();
c64.borderColor(c64.COLOR_BLUE);
c64.backgroundColor(c64.COLOR_BLUE);
c64.textColor(c64.COLOR_WHITE);
c64.printAt(0, 0, "Hello, C64!");
```

```bash
c64js build examples/hello.js -o hello.prg
c64js build examples/hello.js -o hello.asm --format asm
c64js build examples/hello.js -o hello.bas --format data
c64js build examples/hello.js -o hello.bas --format data --sys 49152
c64js build examples/raster-bars.js -o raster-bars.prg
```

The generated `.prg` uses a BASIC stub with `10 SYS 2064` and starts machine code at `$0810`.

For AI or emulator integrations, you can also compile a DSL source string directly in memory:

```js
import { compileJsToC64Outputs } from "js-c64";

const source = `
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLUE);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printAt(0, 0, "Hello, C64!");
`;

const result = await compileJsToC64Outputs(source, { sysAddress: 49152 });
console.log(result.basicText);
```

If you only want the final BASIC text directly, you can use the shortcut helper:

```js
import { compileJsToBasicData } from "js-c64";

const source = `
  c64.clearScreen();
  c64.borderColor(c64.COLOR_BLUE);
  c64.backgroundColor(c64.COLOR_BLUE);
  c64.textColor(c64.COLOR_WHITE);
  c64.printAt(0, 0, "Hello, C64!");
`;

const basicText = await compileJsToBasicData(source, { sysAddress: 49152 });
console.log(basicText);
```

## Features

- Full internal NMOS 6502 opcode table for the official instructions commonly used on the C64
- Labels, forward references, relative branches, symbol map and `.lst` listing generation
- High-level C64 DSL for screen, color RAM, memory and KERNAL interactions
- Raster IRQ support with multiple raster lines
- Exporters for `.prg`, raw `.bin`, readable `.asm`, `.lst` and BASIC loader + `DATA`
- CLI for `build` and `init`
- Vitest-based automated tests

## Library API

### High-level C64 DSL

- `c64.borderColor(color)`
- `c64.backgroundColor(color)`
- `c64.textColor(color)`
- `c64.clearScreen()`
- `c64.print(text)`
- `c64.printAt(x, y, text)`
- `c64.printCentered(y, text)`
- `c64.poke(address, value)`
- `c64.peek(address)`
- `c64.memset(address, value, length)`
- `c64.memcpy(dest, src, length)`
- `c64.copyDataTo(address, dataRefOrName, length)`
- `c64.memsetColor(address, color, length)`
- `c64.writeChar(x, y, char, color)`
- `c64.fillRect(x, y, w, h, char, color)`
- `c64.drawFrame(x, y, w, h, char, color)`
- `c64.clearLine(y, char, color)`
- `c64.screen(address = 0x0400)`
- `c64.colorRam(address = 0xD800)`
- `c64.sys(address)`
- `c64.label(name)`
- `c64.comment(text)`

### Data and variables

- `c64.data.byte(name, values)`
- `c64.data.word(name, values)`
- `c64.data.string(name, text)`
- `c64.data.screenString(name, text)`
- `c64.data.length(name)`
- `c64.var.byte(name, address, initialValue)`
- `c64.var.word(name, address, initialValue)`
- `c64.varRef(name)`
- `c64.dataRef(name, length?)`

### Sprite API

- `c64.sprite.enable(n)`
- `c64.sprite.disable(n)`
- `c64.sprite.show(n, x, y, color)`
- `c64.sprite.hide(n)`
- `c64.sprite.position(n, x, y)`
- `c64.sprite.setX(n, x)`
- `c64.sprite.setY(n, y)`
- `c64.sprite.moveX(n, dx)`
- `c64.sprite.moveY(n, dy)`
- `c64.sprite.moveToX(n, targetX, speed)`
- `c64.sprite.moveToY(n, targetY, speed)`
- `c64.sprite.animateTo(n, { x?, y?, speedX?, speedY? })`
- `c64.sprite.stop(n)`
- `c64.sprite.stopX(n)`
- `c64.sprite.stopY(n)`
- `c64.sprite.color(n, color)`
- `c64.sprite.data(n, bytesOrLabel, address?)`
- `c64.sprite.pointer(n, blockIndex)`
- `c64.sprite.multicolor(n, enabled)`
- `c64.sprite.expandX(n, enabled)`
- `c64.sprite.expandY(n, enabled)`
- `c64.sprite.priority(n, behindBackground)`
- `c64.sprite.sharedColor1(color)`
- `c64.sprite.sharedColor2(color)`
- `c64.sprite.installAnimator(line = 250)`

Example:

```js
import { c64 } from "js-c64";

c64.sprite.position(0, 32, 90);
c64.sprite.animateTo(0, {
  x: 240,
  y: 60,
  speedX: 2,
  speedY: 1
});
c64.sprite.installAnimator(250);
```

The sprite animator installs a small raster IRQ update loop that keeps the BASIC environment responsive by chaining back to the KERNAL IRQ when the frame update is done.

### Hires bitmap API

- `c64.hires.screen(address = 0x5C00)`
- `c64.hires.bitmap(address = 0x6000)`
- `c64.hires.enabled()`
- `c64.hires.disabled()`
- `c64.hires.clear(color = c64.COLOR_WHITE)`
- `c64.hires.point(x, y, color = c64.COLOR_WHITE)`
- `c64.hires.line(x1, y1, x2, y2, color = c64.COLOR_WHITE)`
- `c64.hires.rect(x, y, width, height, color = c64.COLOR_WHITE)`
- `c64.hires.fillRect(x, y, width, height, color = c64.COLOR_WHITE)`
- `c64.hires.circle(x, y, radius, color = c64.COLOR_WHITE)`
- `c64.hires.fillCircle(x, y, radius, color = c64.COLOR_WHITE)`

Example:

```js
import { c64 } from "js-c64";

c64.hires.screen(0x0400);
c64.hires.bitmap(0x2000);
c64.hires.enabled();
c64.hires.clear(c64.COLOR_WHITE);
c64.hires.line(10, 10, 310, 190, c64.COLOR_BLACK);
c64.hires.rect(60, 50, 200, 90, c64.COLOR_RED);
c64.hires.fillRect(90, 70, 40, 20, c64.COLOR_CYAN);
c64.hires.circle(180, 80, 24, c64.COLOR_ORANGE);
c64.hires.fillCircle(260, 140, 20, c64.COLOR_GREEN);
c64.waitKey();
c64.hires.disabled();
c64.clearScreen();
```

Current implementation notes:

- `enabled()` activates bitmap hires mode using the current `screen()` and `bitmap()` addresses
- `disabled()` switches the VIC back to standard text mode
- `point`, `line`, `rect` and `fillRect` use shared runtime routines to keep PRG size compact
- default hires screen RAM is `$5C00`
- default hires bitmap RAM is `$6000`
- hires color is limited by the C64 hardware to one foreground/background pair per `8x8` cell
- this means two differently colored lines crossing the same `8x8` block may visually share or overwrite the block color

### Keyboard wait helper

- `c64.waitKey()`

Example:

```js
import { c64 } from "js-c64";

c64.printAt(0, 0, "PRESS ANY KEY");
c64.waitKey();
c64.clearScreen();
```

`waitKey()` blocks the generated program until the user presses and releases a key on the C64 keyboard matrix.

### SID audio API

Current `v0.6.0` layer includes:

- `c64.sid.volume(value)`
- `c64.sid.filter(mode, cutoff, resonance)`
- `c64.sid.voice(voice).frequency(value)`
- `c64.sid.voice(voice).pulseWidth(value)`
- `c64.sid.voice(voice).waveform(type)`
- `c64.sid.voice(voice).gate(on = true)`
- `c64.sid.voice(voice).attackDecay(value)`
- `c64.sid.voice(voice).sustainRelease(value)`
- `c64.sid.note(voice, noteName, duration = 0)`
- `c64.sid.freq(voice, hzOrRawValue)`
- `c64.sid.rest(voice, duration = 0)`
- `c64.sid.playSong(songDefinition)`
- `c64.sid.installPlayer(line = 250)`
- `c64.sid.stopSong()`
- `c64.sid.beep()`
- `c64.sid.click()`
- `c64.sid.noise(duration = 12)`
- `c64.sid.explosion()`
- `c64.sid.laser()`
- `c64.sid.pickup()`

Supported waveforms:

- `triangle`
- `saw`
- `pulse`
- `noise`

Example:

```js
import { c64 } from "js-c64";

c64.sid.volume(15);
c64.sid.voice(1).waveform("pulse");
c64.sid.voice(1).pulseWidth(0x0800);
c64.sid.voice(1).attackDecay(0x11);
c64.sid.voice(1).sustainRelease(0xf0);
c64.sid.filter("lowpass", 1024, 8);
c64.sid.note(1, "C4", 10);
c64.sid.rest(1, 4);
c64.sid.note(1, "G4", 10);
```

Current notes:

- `note()` accepts names like `C4`, `F#4`, `Bb3`
- if `duration > 0`, the generated code waits briefly and then closes the gate
- `freq()` currently treats small values like `440` as Hertz and larger values as raw SID register values
- `filter(mode, cutoff, resonance)` writes the SID filter registers `$D415` to `$D418`
- `mode` accepts `off`, `lowpass`, `bandpass`, `highpass`, combinations like `lowpass+highpass`, or an array like `["lowpass", "bandpass"]`
- `cutoff` must be between `0` and `2047`
- `resonance` must be between `0` and `15`
- `playSong()` is now a non-blocking 3-voice IRQ player with a shared tempo
- `playSong()` can coexist with raster IRQ effects and the sprite animator
- one-shot effects like `beep()` or `laser()` are still simple immediate helpers, while `playSong()` is the background music layer

Song example:

```js
c64.sid.playSong({
  tempo: 8,
  voices: [
    ["C4", "E4", "G4", "C5"],
    [{ note: "C3", duration: 2 }, { note: "G2", duration: 2 }],
    ["R", "C5", "R", "G4"]
  ]
});
```

Music plus raster example:

```js
import { c64 } from "js-c64";

c64.sid.volume(15);
c64.sid.filter("lowpass", 1200, 8);
c64.sid.playSong({
  tempo: 18,
  voices: [
    ["C4", "E4", "G4", "C5"],
    ["C3", "R", "G2", "R"],
    ["R", "C5", "R", "G4"]
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
```

### Low-level assembler helpers

```js
import { c64 } from "js-c64";

c64.asm.label("loop");
c64.asm.lda(c64.imm(0));
c64.asm.sta(c64.abs(c64.VIC_BORDER_COLOR));
c64.asm.jmp(c64.abs("loop"));
```

### Raster IRQ

```js
import { c64 } from "js-c64";

c64.borderColor(c64.COLOR_BLACK);
c64.backgroundColor(c64.COLOR_BLACK);

c64.irq.disableKernalTimer();

c64.irq.raster(50, () => {
  c64.borderColor(c64.COLOR_RED);
});

c64.irq.raster(150, () => {
  c64.borderColor(c64.COLOR_BLUE);
});

c64.irq.install();
```

For long-running BASIC-friendly effects, you can use `rasterLoop()`:

```js
import { c64 } from "js-c64";

c64.irq.rasterLoop(245, () => {
  c64.asm.lda(c64.abs("color_state"));
  c64.asm.clc();
  c64.asm.adc(c64.imm(1));
  c64.asm.and(c64.imm(0x0f));
  c64.asm.sta(c64.abs("color_state"));
  c64.asm.sta(c64.abs(c64.VIC_BORDER_COLOR));
});

c64.asm.label("color_state");
c64.asm.byte(0x00);
```

`rasterLoop()` is a convenience helper:

- it registers one raster handler
- it chains to the KERNAL IRQ by default
- it installs the IRQ automatically unless disabled in options

This emits IRQ setup code including:

- `SEI`
- CIA IRQ masking when requested
- IRQ vector writes to `$0314/$0315`
- raster target setup via `$D012`
- high raster bit management through `$D011`
- VIC IRQ enable via `$D01A`
- IRQ acknowledge via `$D019`
- `RTI` or optional chaining to the KERNAL IRQ routine

## CLI

```bash
c64js build examples/hello.js -o hello.prg
c64js build examples/hello.js -o hello.bin --format bin --sys 8192
c64js build examples/hello.js -o hello.asm --format asm --sys 8192
c64js build examples/hello.js -o hello.lst --format lst --sys 8192 --map symbols.json
c64js build examples/hello.js -o hello.bas --format data --sys 49152
c64js init my-c64-demo
```

## Outputs

- `.prg`: C64 executable with load address `$0801`
- `.bin`: raw machine code
- `.asm`: readable 6502 assembly
- `.lst`: address and opcode listing
- `.bas`: BASIC loader plus `DATA`

## Examples

- [examples/hello.js](./examples/hello.js)
- [examples/colors.js](./examples/colors.js)
- [examples/comfort-frame.js](./examples/comfort-frame.js)
- [examples/comfort-data-vars.js](./examples/comfort-data-vars.js)
- [examples/screen-fill.js](./examples/screen-fill.js)
- [examples/keyboard.js](./examples/keyboard.js)
- [examples/joystick.js](./examples/joystick.js)
- [examples/raster-bars.js](./examples/raster-bars.js)
- [examples/raster-ready-border-cycle.js](./examples/raster-ready-border-cycle.js)
- [examples/vice-showcase.js](./examples/vice-showcase.js)
- [examples/sprite-api.js](./examples/sprite-api.js)
- [examples/sprite-animate.js](./examples/sprite-animate.js)
- [examples/sid-beep.js](./examples/sid-beep.js)
- [examples/combo-irq.js](./examples/combo-irq.js)
- [examples/sprite-basic.js](./examples/sprite-basic.js)

`examples/raster-bars.js` is the reference IRQ demo to try in VICE first.
`examples/raster-ready-border-cycle.js` shows a single raster IRQ that cycles the border color from `0` to `15` forever while chaining back to the KERNAL IRQ so the `READY.` prompt remains responsive.
`examples/vice-showcase.js` is the more presentation-oriented demo for VICE with animated border and background colors.
`examples/sprite-animate.js` shows the new `v0.4.0` sprite animator moving a balloon smoothly with an internal raster IRQ updater.
`examples/combo-irq.js` shows the current `v0.6.0` direction: background SID music plus raster color changes on the same IRQ system.

## Keeping READY Alive

If you want an IRQ effect to continue after `SYS 2064` returns to BASIC, prefer this pattern:

- install a raster IRQ
- do not disable the KERNAL timer IRQ unless you really need to
- call `c64.irq.chainToKernal()`
- store effect state in your own program variable or RAM location instead of relying on fragile temporary zero-page values

The `examples/raster-ready-border-cycle.js` demo follows this model.

## Development

```bash
npm install
npm test
npm run build:demos
```

## Security Considerations

The DSL works by executing the input JavaScript file in Node.js and capturing calls made to the `c64` API. This means source files passed to `c64js build` are code, not passive data.

Do not compile untrusted `.js` DSL files without sandboxing them yourself first. Running a malicious input file can execute arbitrary Node.js code with the permissions of the current user.

## Limits

This is not a full JavaScript compiler. It is a JavaScript DSL executed by Node.js that emits 6502 machine code.

Known limits in `0.1.0`:

- high-level operations are intentionally small and direct
- `peek()` is mainly useful together with `poke()` or custom low-level assembly flows
- IRQ helpers focus on raster setup and dispatch, not full interrupt framework abstraction
- the current sprite animator focuses on `moveTo`-style motion and does not yet include paths, bounce helpers, or callbacks on arrival
- screen text conversion is intentionally simple
- hires bitmap support is currently focused on the standard monochrome `320x200` mode with per-cell `8x8` color limits
