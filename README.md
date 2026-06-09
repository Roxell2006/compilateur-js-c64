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
- `c64.sprite.color(n, color)`
- `c64.sprite.data(n, bytesOrLabel, address?)`
- `c64.sprite.pointer(n, blockIndex)`
- `c64.sprite.multicolor(n, enabled)`
- `c64.sprite.expandX(n, enabled)`
- `c64.sprite.expandY(n, enabled)`
- `c64.sprite.priority(n, behindBackground)`
- `c64.sprite.sharedColor1(color)`
- `c64.sprite.sharedColor2(color)`

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
- [examples/sid-beep.js](./examples/sid-beep.js)
- [examples/sprite-basic.js](./examples/sprite-basic.js)

`examples/raster-bars.js` is the reference IRQ demo to try in VICE first.
`examples/raster-ready-border-cycle.js` shows a single raster IRQ that cycles the border color from `0` to `15` forever while chaining back to the KERNAL IRQ so the `READY.` prompt remains responsive.
`examples/vice-showcase.js` is the more presentation-oriented demo for VICE with animated border and background colors.

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
- screen text conversion is intentionally simple
