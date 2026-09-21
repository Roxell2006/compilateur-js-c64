# Natural compiler: temporaries, copies and fill loops

The natural frontend now optimizes its intermediate instructions before 6502
generation. Existing source programs need no changes. The legacy recording DSL
is unaffected.

## Implemented transformations

- A private expression result can be computed directly into its destination,
  removing the final copy and the temporary. This requires matching widths and
  no observation of the destination's old value inside the expression chain.
- Compiler-created temporaries whose lifetime fits in a single straight-line
  block can reuse slots when their lifetimes do not overlap. Named variables,
  function parameters, return slots, and snapshots spanning calls remain
  separate. Storage pools are separate for routines and IRQ handlers.
- A full-array ascending loop with a local counter and a constant or invariant
  natural scalar fill value can become the existing compact descending 6502
  fill loop. Its counter and element-copy storage are removed.

For example, these now produce the same fill operation:

```js
for (let i = 0; i < cells.length; i++) cells[i] = 7;
cells.fill(7);
```

This is not general loop optimization. Partial ranges, side effects, early exits,
index-dependent values and volatile references retain their original code. A
256-entry loop needs `let i = c64.word(0)`: the compiler must not replace an
otherwise infinite byte-counter loop with a terminating fill.

User IRQs disable fill-loop replacement, including IRQs registered through API
aliases after the loop. IRQ-visible destinations are excluded from copy motion,
and API/hardware fields are not treated as private expression destinations.
Arithmetic width, unsigned wrapping, argument evaluation order and snapshots
are preserved. Bounds checks remain in general indexed accesses.

## Results

Same source, default compilation profile, with natural optimizations disabled
and enabled respectively:

| Reference | PRG bytes before → after | Scalar RAM before → after |
| --- | ---: | ---: |
| Tetris | 3,906 → 3,768 | 104 → 64 |
| Platformer | 10,335 → 10,335 | 64 → 64 |
| Interactive HR | 3,079 → 3,073 | 25 → 21 |

Tetris eliminates 23 copies and saves 40 scalar bytes. Over the same 60 no-input
PAL logical ticks used by reference validation, its mean elapsed update cost
drops from 562 to 530 cycles, and the sample maximum from 5,361 to 4,973 cycles.
These measurements include automatic drops, not worst-case line clears. HR's
idle cost and Platformer's measured timing are unchanged.

For a separate 64-byte array fill, the finite test program drops from 147 to
92 PRG bytes, from 3 to 0 scalar bytes, and from 4,119 to 649 executed cycles
(about 6.3 times faster). The PRG figures include the array itself.

Reproduce the measurements from the repository root:

```sh
node scripts/measure-natural-optimizations.js
```

The script uses instruction-level CPU/PAL models from the test suite. These are
scenario-specific measurements, not full-emulator or hardware certification.

## Reports and regression checks

`assetReport` contains a `natural-optimization` entry with `copiesRemoved`,
`temporaryBytesSaved`, `fillLoops`, `loopVariableBytesSaved`, and `enabled`.
For diagnostics, the compiler API accepts:

```js
await compileFile("examples/natural-tetris.js", {
  naturalOptimizations: false
});
```

The default is `true`. This switch is independent of `opt: "size" | "speed" |
"balanced"`; it controls only these natural-frontend transformations.

Tests compare enabled/disabled outputs for aliasing, byte/word arithmetic,
nested calls, snapshots, branches and array writes. An interrupt routine is
injected between main-program instructions to exercise storage isolation and
visibility of writes. Fill tests cover 1, 16, 255 and 256 entries, and explicitly
reject unsafe loop transformations. The complete gameplay and PAL raster
regressions continue to run on the optimized programs.
