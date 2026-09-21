# Natural JavaScript reference programs

These are complete opt-in `"use c64"` rewrites. The original examples remain
available for compatibility comparisons. This validation does not publish 1.1.

The figures below record the initial rewrites, before temporary/copy optimization.
For current optimized costs and a reproducible comparison script, see
[natural compiler optimization](natural-compiler-optimization.md).

| Program | Original JS lines | Natural JS lines | Original PRG | Natural PRG |
| --- | ---: | ---: | ---: | ---: |
| Tetris Mini | 304 | 151 | 3,432 bytes | 3,906 bytes |
| Platformer Mini | 178 | 80 | 10,174 bytes | 10,335 bytes |
| Interactive HR | — | 57 | — | 3,079 bytes |

Line counts include comments and blank lines. Platformer's map construction has
been moved into `examples/assets/platformer-room.json`; its cells, tiles, objects
and sprite references are retained. The 80-line figure counts gameplay and setup,
not the external level data. Both versions use horizontal camera follow, matching
the actual original implementation; its second exit teleports to the upper zone.

## Programs and controls

- `examples/natural-tetris.js`: joystick 2 left/right on press, FIRE rotates,
  DOWN accelerates the fall, FIRE restarts after loss. Retains the original four
  tetrominoes and their four rotations, locking, consecutive line clearing,
  five-digit score, sound and restart. The board is a 200-byte typed array;
  the active piece is drawn separately. Full redraw occurs only after clearing
  lines or restarting, not after every piece locks.
- `examples/natural-platformer.js`: joystick 2 moves, FIRE jumps while grounded.
  Retains collision behaviors, sprite animations, enemy, collectible, respawn,
  two exits, raster handler, scrolling and sprite multiplexing. Collection is
  explicitly latched so a disabled collectible cannot score a second time.
- `examples/natural-hires-interactive.js`: joystick 2 moves the brush. Hold FIRE
  and press left/right to change radius, up to change color, down to switch
  outline circle / filled circle / filled square. SPACE clears; RETURN returns
  to text mode and stops drawing. The brush leaves a trail. Drawing occurs only
  when input changes something. Filled shapes can take several video frames;
  this demo does not promise one complete redraw per 50 Hz tick.

Build each with `node src/cli.js build examples/NAME.js -o dist/NAME.prg`.

## Executed-code checks

`test/natural-programs.test.js` runs emitted 6502 instructions with modeled PAL
timing. It verifies input-driven rotation and movement, wall/occupied-cell
rejection, fast drop and locking, consecutive full rows, scoring, loss/restart,
grounded jump, danger/enemy respawn, one-time collection, both exits, HR brush
position/radius/shape/color, bitmap clearing, and return to text mode.

`test/platformer-raster.test.js` exercises both Platformer versions for 420 PAL
frames, across all 45 camera columns in both directions with three sprites. It
checks character/color fetches during display, fine/coarse scroll consistency,
copy start at raster 214, and 420 logical ticks. This is an instruction-level
timing model, not a visual VICE or physical-hardware certification.

The existing hires regression continues checking bitmap and color addresses for
all 64,000 screen coordinates. All shipped examples remain in the compatibility
compile test.

## Measured costs and limits

The reference test measures 60 no-input logical ticks after initialization,
from `game_frame_logical_tick` to the next `game_frame_loop`. Counts include
modeled PAL stalls/interrupts, exclude the frame wait, and are specific to that
scenario. Tetris includes its automatic falls but not a line-clear worst case.

| Program | Mean elapsed cycles/tick | Maximum in sample | Allocated scalar variable bytes |
| --- | ---: | ---: | ---: |
| Original Tetris | 779 | 8,631 | 29 |
| Natural Tetris | 562 | 5,361 | 104 |
| Original Platformer | 2,608 | 4,053 | 56 |
| Natural Platformer | 2,643 | 4,134 | 64 |

Variable bytes exclude arrays, assets and fixed runtime areas. Natural function
parameters, return slots and temporaries use static RAM. The simpler source does
not mean a smaller binary or zero overhead: Tetris's PRG grows about 14%, while
its measured automatic-fall path is faster; Platformer's PRG grows about 1.6%.
Tests enforce a 4 KiB/128 scalar-byte Tetris budget, an 80 scalar-byte Platformer
budget and under 5% additional Platformer PRG size and measured tick cost.

## Compiler issues exposed by the rewrites

- Entity collision calls legitimately consume only part of an API handle.
  Runtime-argument validation now distinguishes resource handles from numeric
  options instead of rejecting these valid calls.
- Named natural updates previously hid camera follow from presentation analysis.
  The compiler now follows known routine calls and selects deferred scrolling
  before emitting their bodies. Sharing a JS function no longer disables the
  raster-safe presentation schedule. Unknown legacy calls retain the conservative
  fallback.
- Map/scroller IDs are reset between compilations. Repeated compilation now
  produces identical reference PRGs and reports in the same Node process.

Run `npm test` for the full regression suite and `npm run package:check` for the
packaging check. No version number is changed by this validation step.
