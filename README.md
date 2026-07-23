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
- `c64.var.byte(name, address, initialValue)` (legacy explicit address)
- `c64.var.byte(name, { initial, address? })` (typed runtime reference)
- `c64.var.word(name, address, initialValue)`
- `c64.varRef(name)`
- `c64.dataRef(name, length?)`

### Sprite API

The gameplay API represents a sprite as one object. Its X coordinate is a
9-bit runtime value, so positions from `0` through `511` work and the compiler
updates both `$D000..$D00E` and the matching bit in `$D010`.

Example:

```js
import { c64 } from "js-c64";

const pixels = Array(63).fill(0xff);
const player = c64.sprite.create(0, {
  x: 100, y: 120, data: pixels, color: c64.COLOR_RED,
  minX: 24, maxX: 320, minY: 50, maxY: 220,
  bounceX: true
});

player.setVelocity(2, 0);
c64.game.frame(() => player.update());
```

`player.x`, `y`, `vx`, `vy` and `active` are runtime variables. Use
`setPosition()`, `setVelocity()`, `setBounds()`, `update()`, `sync()`,
`enable()`, `disable()`, `reverseX()` and `reverseY()` to control them.

Animations use `c64.sprite.frames()`, then `sequence()`, `play()`,
`pauseAnimation()` and `resumeAnimation()`. Software hitboxes use
`a.collides(b)`. Hardware collision snapshots are available through
`vicCollides()` and `collidesWithBackground()`; the compiler reads the VIC-II
collision registers only once per frame because reading them clears them.

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

### v0.7 gameplay language and loop

The v0.7 gameplay layer provides typed runtime variables, explicit conditions,
bounded control flow, frame-snapshot input and a normalized game loop:

```js
import { c64 } from "js-c64";

const joystick = c64.input.joystick(2);
const player = c64.sprite.create(0, {
  x: 100, y: 120, data: Array(63).fill(255),
  minX: 24, maxX: 320
});

c64.game.frame(() => {
  player.setVelocity(0, 0);
  c64.control.if(joystick.left(), () => player.setVelocity(-2, 0));
  c64.control.if(joystick.right(), () => player.setVelocity(2, 0));
  player.update();
});
```

Runtime types are `c64.var.byte()`, `word()` and `bool()`. Operations include
`set`, `add`, `sub`, `inc`, `dec`, `and`, `or`, `xor` and `toggle`. Comparisons
are `eq`, `ne`, `lt`, `lte`, `gt` and `gte`. Joystick directions and fire expose
held conditions such as `left()`, edge conditions such as `firePressed()`, and
release conditions such as `fireReleased()`.

Additional v0.7 helpers include:

- `c64.game.init(fn)` and `c64.game.every(frameCount, fn)`
- `c64.control.repeat()`, bounded `while()`, named `routine()` and `call()`
- `c64.input.keyboard({ action: matrixKeyCode })`
- `c64.table.byte()` with runtime indexed `load()` and `store()`
- automatic PAL/NTSC detection

Runtime decisions must use `c64.control.if()`. A normal JavaScript `if` is
evaluated by Node.js while compiling and therefore does not represent a decision
made by the C64.

Only one `c64.game.frame()` loop may be declared. `{ hz: 50 }` produces 50
logical updates per second on PAL and NTSC; `{ hz: "video" }` follows the native
video rate (50 PAL, 60 NTSC). Frame tasks must always be bounded.
See [examples/game-loop-input.js](./examples/game-loop-input.js).

### v0.8 sprites, animation and collisions

Multiple 64-byte frames can be shared by sprites and arranged into named
sequences:

```js
const frames = c64.sprite.frames("hero", [idlePixels, walkPixels]);
const hero = c64.sprite.create(0, {
  x: 80, y: 120, frames,
  hitbox: { width: 16, height: 20 }
});

hero.sequence("walk", [0, 1], { speed: 5, loop: true });
hero.play("walk");

c64.game.frame(() => {
  hero.update();
  c64.control.if(hero.collides(enemy), () => hero.reverseX());
});
```

The ordinary eight-sprite movement path has a conservative static budget of at
most about 1,760 CPU cycles per frame (220 per active sprite, without AABB
tests). That is below 9% of a PAL frame's 19,656 cycles. Game logic, collision
tests, raster effects and SID work consume additional budget, so expensive work
should be distributed across frames. See
[examples/sprite-animate.js](./examples/sprite-animate.js) and the playable
[examples/breakout-mini.js](./examples/breakout-mini.js).

The compiler uses balanced size optimization by default. Repeated sprite
synchronization, AABB comparisons and `sid.click()` effects are emitted once as
shared 6502 subroutines when sharing is smaller than inline code. Reusing the
identical sprite pixels also share one VIC-II data block. Passing an explicit
`dataAddress` keeps a private writable block instead. These optimizations
require no change to normal user JavaScript. On `breakout-mini`, they reduce the PRG from 4,644 to
3,335 bytes (about 28%) while retaining the logical state needed for 16 sprites. A shared `JSR`/`RTS` costs 12 additional CPU cycles per
call, which is the intended balanced tradeoff between speed and size.

### v0.8.2 virtual sprites 8..15

`c64.sprite.create()` accepts logical indexes `0..15`. Creating index 8 or
higher automatically enables a compact Y-sorted multiplexer; no additional API
call is required. Logical indexes no longer determine an upper or lower zone.
Every active sprite is sorted from its current Y coordinate once per frame and
assigned to an available VIC-II channel.

```js
const sprite0 = c64.sprite.create(0, { x: 80, y: 190, frames });
const sprite8 = c64.sprite.create(8, { x: 180, y: 60, frames });

c64.game.frame(() => {
  sprite0.update();
  sprite8.update();
});
```

The generated scheduler keeps each sprite assigned for its complete 21-line
height, or 42 lines with `expandY`. A sprite crossing the middle of the screen
is therefore not cut and does not need to be duplicated in two fixed banks.
Its limits are:

- one `c64.game.frame()` loop is required;
- the logical update starts near raster line 200; only logical RAM is changed,
  and VIC registers are left untouched until the real start of the next frame;
- all indexes `0..15` may move freely between the top, middle and bottom;
- no more than eight sprites can overlap the same raster lines;
- when a ninth sprite overlaps the same vertical interval, that sprite is
  omitted for the frame because the VIC-II has no ninth physical channel;
- software `collides()` works across all 16 logical sprites;
- `vicCollides()` and `collidesWithBackground()` are unavailable because VIC
  collision bits refer to reused physical channels;
- do not mix virtual sprites with the legacy direct `c64.sprite.position()` and
  related hardware API; use the returned sprite objects;
- frame work must stay bounded so sorting and the first eight channel writes
  finish before the next visible frame.

See [examples/sprite-multiplex-16.js](./examples/sprite-multiplex-16.js).

### v0.9 static charset and map assets

The NPM package owns the stable asset format, validation and generated C64
runtime. The dependency-free visual editor lives in `studio graphique/` and
exports the same JSON schema without making the compiler depend on a browser UI framework.

```js
const room = c64.assets.loadMap("assets/room.json");

c64.game.init(() => {
  c64.charset.use(room.charset, { address: 0x3000 });
  c64.map.draw(room, { x: 0, y: 0 });
});

const tileX = c64.var.byte("tileX", { initial: 1 });
const tileY = c64.var.byte("tileY", { initial: 1 });

c64.game.frame(() => {
  const tile = room.map(tileX, tileY);
  c64.control.if(tile.isSolid(), () => tileX.set(0));
  tile.set(1); // updates runtime map RAM and redraws only this tile
});
```

Current v0.9 foundation includes:

- JSON loading relative to the compiled JavaScript file;
- inline assets through `c64.assets.defineMap()`;
- lossless hires 8x8 and multicolor 4x8 charset data, padded to the VIC-II 2 KB format;
- configurable metatiles from 1x1 to 8x8 characters;
- per-cell colors and a separate logical collision value per tile;
- compile-time validation of dimensions, byte values and tile references;
- charset bank/alignment validation and automatic `$DD00`/`$D018` setup;
- maps stored as mutable two-dimensional runtime state in `$8000..$9FFF`;
- callable cells with `level.map(x, y)` and the `set()`, `load()`, `eq()`,
  `ne()`, `isSolid()` and `hasCollision()` operations;
- automatic redraw of only the changed character or metatile after `set()`;
- explicit full redraw through `level.map.redraw()`;
- 16-bit runtime indexing for maps up to 8,192 cells;
- pixel/tile and character/tile runtime coordinate conversions;
- an optional object/spawn layer with typed JSON properties;
- a detailed `assetReport` with address ranges and overlap detection.

Fine scrolling and line removal helpers remain later milestones. See
[examples/tilemap-static.js](./examples/tilemap-static.js) and its
[JSON source](./examples/assets/v09-room.json). The package also ships the
formal [v1 JSON Schema](./schemas/map-asset-v1.schema.json) for editor and IDE
integration.

The playable [examples/tetris-mini.js](./examples/tetris-mini.js) demonstrates
dynamic reads and writes: T, O, I and L tetrominoes are selected with a compact
pseudo-random generator, move with joystick port 2, rotate with FIRE, test the
map and become solid when they land.
The demo intentionally focuses on dynamic-map movement, rotation, spawning and
collision; complete-line removal and scoring remain future gameplay additions.

The playable [Snake](./examples/snake.js) and [multicolor maze](./examples/maze-game.js)
examples both use 20x15 (300-cell) maps, logical collisions and JSON object/spawn
metadata. Coordinate conversion is explicit and allocation-free:

```js
c64.map.pixelToTile(level, { x: playerPixelX, y: playerPixelY }, { x: tileX, y: tileY });
c64.map.tileToCharacter(level, { x: tileX, y: tileY }, { x: charX, y: charY });
```

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
- `c64.sid.click()` (non-blocking envelope retrigger, safe inside the game loop)
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
- it keeps the KERNAL CIA timer IRQ active by default
- it installs the IRQ automatically unless disabled in options

This emits IRQ setup code including:

- `SEI`
- CIA IRQ masking when requested
- IRQ vector writes to `$0314/$0315`
- raster target setup via `$D012`
- high raster bit management through `$D011`
- VIC IRQ enable via `$D01A`
- IRQ acknowledge via `$D019`
- VIC/CIA source filtering through `$D019`
- a fast raster exit through the KERNAL epilogue at `$EA81`
- optional chaining of CIA timer IRQs to the KERNAL routine at `$EA31`

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
- [examples/game-loop-input.js](./examples/game-loop-input.js)
- [examples/breakout-mini.js](./examples/breakout-mini.js)
- [examples/raster-bars.js](./examples/raster-bars.js)
- [examples/raster-ready-border-cycle.js](./examples/raster-ready-border-cycle.js)
- [examples/vice-showcase.js](./examples/vice-showcase.js)
- [examples/sprite-api.js](./examples/sprite-api.js)
- [examples/sprite-animate.js](./examples/sprite-animate.js)
- [examples/sprite-multiplex-16.js](./examples/sprite-multiplex-16.js)
- [examples/tilemap-static.js](./examples/tilemap-static.js)
- [examples/tetris-mini.js](./examples/tetris-mini.js)
- [examples/sid-beep.js](./examples/sid-beep.js)
- [examples/combo-irq.js](./examples/combo-irq.js)
- [examples/sprite-basic.js](./examples/sprite-basic.js)

`examples/raster-bars.js` is the stable-timing IRQ reference to try in VICE
first. It disables the CIA timer so nothing can delay its two raster splits.
`examples/raster-ready-border-cycle.js` shows a single raster IRQ that cycles the border color from `0` to `15` forever while chaining back to the KERNAL IRQ so the `READY.` prompt remains responsive.
`examples/vice-showcase.js` is the more presentation-oriented demo for VICE with animated border and background colors.
`examples/sprite-animate.js` shows v0.8 multi-frame animation and bounded movement.
`examples/sprite-multiplex-16.js` shows the dynamic Y-sorted renderer displaying all 16 logical sprites.
`examples/breakout-mini.js` combines seven sprites, AABB collisions, sound and a minimal score.
`examples/combo-irq.js` shows the current `v0.6.0` direction: background SID music plus raster color changes on the same IRQ system.

## Keeping READY Alive

If you want an IRQ effect to continue after `SYS 2064` returns to BASIC, prefer this pattern:

- install a raster IRQ
- do not disable the KERNAL timer IRQ unless you really need to
- call `c64.irq.chainToKernal()`
- store effect state in your own program variable or RAM location instead of relying on fragile temporary zero-page values

The `examples/raster-ready-border-cycle.js` demo follows this model.

Raster hits themselves use the short KERNAL exit at `$EA81`; only CIA timer
hits run the full `$EA31` handler. This keeps raster splits deterministic while
the keyboard, clock and `READY.` prompt continue to work normally.

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
- sprite AABB collisions are rectangle-based; generic pixel-perfect collision and tilemap collision are not part of v0.8
- screen text conversion is intentionally simple
- hires bitmap support is currently focused on the standard monochrome `320x200` mode with per-cell `8x8` color limits
