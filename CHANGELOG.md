# Changelog

# Changelog

## Unreleased

- Added `v0.2.0` comfort foundations
- Added `c64.data.*` declarations for bytes, words, PETSCII strings, and screen strings
- Added `c64.var.*` declarations plus `c64.varRef()`
- Added `c64.dataRef()`, `c64.copyDataTo()`, and `c64.memsetColor()`
- Added screen helpers including `printCentered`, `writeChar`, `fillRect`, `drawFrame`, and `clearLine`
- Added comfort-focused examples for frames, data, and variables
- Updated `examples/screen-fill.js` to use the new comfort API
- Started `v0.3.0` sprite foundations
- Added `c64.sprite.*` high-level helpers for enable/disable, position, colors, data, priority, multicolor, and expansion
- Reworked `examples/sprite-basic.js` to use the sprite API
- Started `v0.4.0` sprite animation foundations
- Added `c64.sprite.moveToX()`, `moveToY()`, `animateTo()`, `stop()`, `stopX()`, `stopY()`, and `installAnimator()`
- Added an internal raster IRQ sprite animator that updates X/Y over time and chains to the KERNAL IRQ
- Added `examples/sprite-animate.js`
- Added automated tests for sprite animator installation and error handling
- Added CLI `--sys` support for custom start addresses on data/bin/asm/lst outputs

## 0.1.0

- First npm-oriented release of `js-c64`
- Added a complete NMOS 6502 assembler core with labels, relocation and listing support
- Added Commodore 64 DSL helpers and raster IRQ support
- Added PRG, BIN, ASM, LST and BASIC DATA exporters
- Added CLI `c64js build` and `c64js init`
- Added `c64.irq.rasterLoop()` for READY-safe looping effects
- Added VICE-oriented showcase demos and a bulk demo build script
