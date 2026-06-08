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

## 0.1.0

- First npm-oriented release of `js-c64`
- Added a complete NMOS 6502 assembler core with labels, relocation and listing support
- Added Commodore 64 DSL helpers and raster IRQ support
- Added PRG, BIN, ASM, LST and BASIC DATA exporters
- Added CLI `c64js build` and `c64js init`
- Added `c64.irq.rasterLoop()` for READY-safe looping effects
- Added VICE-oriented showcase demos and a bulk demo build script
