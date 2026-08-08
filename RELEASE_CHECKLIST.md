# js-c64 1.0.0 release candidate

Candidate prepared on 2026-08-07. The NPM publication itself is intentionally
manual because it requires the package owner's authenticated account.

## Automated release gate

Run from the repository root:

```bash
npm ci
npm run release:check
```

This single gate must pass before `npm publish`. It runs 130 tests, compiles all
examples, creates the 174,848-byte multi-level D64, checks memory conflicts and
game budgets, inspects every published export, installs the generated tarball
in an empty project and executes its installed `npx c64js` command.

GitHub Actions repeats the gate on Windows and Linux with Node 18, 20 and 22. The
Linux/Node 22 job uploads `dist/release/` as the release-candidate artifact.

## Frozen validation budgets

The authoritative machine-readable limits are in `release-budgets.json`.

| Game | Measured PRG | PRG limit | Program limit | Asset limit | Startup-cycle limit | Reported frame-cycle limit |
|---|---:|---:|---:|---:|---:|---:|
| Snake | 4,110 B | 4,600 B | 4,600 B | 2,600 B | 50,000 | 20,000 |
| Breakout Mini | 3,361 B | 3,700 B | 3,700 B | 400 B | 1,000 | 20,000 |
| Maze Game | 2,002 B | 2,300 B | 2,300 B | 2,600 B | 42,000 | 20,000 |
| Platformer Mini | 11,102 B | 12,500 B | 12,500 B | 3,000 B | 45,000 | 16,250 |

`dist/release/validation.json` records fresh measurements for each run. A limit
is deliberately above the current value but low enough to catch an accidental
size or cycle regression.

## Manual owner steps

1. Confirm that CI is green and test the candidate artifact in VICE.
2. Run `npm whoami` and verify that this is the intended owner.
3. Recheck name availability with `npm view js-c64` immediately before release.
4. Inspect `npm pack --dry-run` if desired.
5. Publish with `npm publish`.
6. In a different directory, run `npm install js-c64` and compile one PRG with
   `npx c64js`.

Never reuse version `1.0.0` after it has been published. The next fixes must use
`1.0.1` or a later semantic version.
