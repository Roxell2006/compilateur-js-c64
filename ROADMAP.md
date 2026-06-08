# ROADMAP

This roadmap gives `js-c64` a clear progression from a practical DSL into a more complete creative toolkit for Commodore 64 graphics, sprites, animation, and SID audio.

## Guiding Direction

The long-term goal is to make `js-c64`:

- easy enough for beginners to get visible results quickly
- powerful enough for small demos, intros, toys, and games
- structured enough to stay pleasant as projects grow

The recommended order is:

- `v0.2.0` = comfort
- `v0.3.0` = sprites
- `v0.4.0` = animation
- `v0.5.0` = bitmap graphics
- `v0.6.0` = SID audio and music

---

## v0.2.0 - Comfort

### Goal

Make the library nicer to write with every day.

### Main Priorities

- add a proper data API
- add symbolic variables instead of hard-coded RAM everywhere
- add practical screen/text helpers
- reduce the need for low-level `poke()` in common situations

### Recommended Features

#### Data and variables

- `c64.data.byte(name, values)`
- `c64.data.word(name, values)`
- `c64.data.string(name, text)`
- `c64.data.screenString(name, text)`
- `c64.var.byte(name, address, initialValue = 0)`
- `c64.var.word(name, address, initialValue = 0)`
- `c64.varRef(name)`

#### Text/screen helpers

- `c64.printCentered(y, text)`
- `c64.clearLine(y, char = 32, color = currentColor)`
- `c64.fillRect(x, y, w, h, char, color)`
- `c64.drawFrame(x, y, w, h, char, color)`
- `c64.writeChar(x, y, char, color)`

#### Memory helpers

- `c64.copyDataTo(address, label, length)`
- `c64.memsetColor(address, color, length)`

### Why This Version Matters

- it removes a lot of friction
- it prepares the engine for more ambitious systems later
- it makes examples shorter and easier to understand

### Example Target

```js
c64.fillRect(0, 0, 40, 25, 32, c64.COLOR_BLUE);
c64.drawFrame(2, 2, 36, 20, 81, c64.COLOR_WHITE);
c64.printCentered(10, "JS-C64");
```

### Technical Notes

- data must be emitted safely without ever falling into executable code
- variables should be declarative and exportable in symbols/listings
- screen helpers should reuse compact loops where possible

---

## v0.3.0 - Sprites

### Goal

Provide a full high-level sprite layer that feels natural to use.

### Main Priorities

- make sprite setup easy
- hide the common VIC-II sprite register boilerplate
- support single-color and multicolor workflows

### Recommended Features

#### Basic sprite control

- `c64.sprite.enable(n)`
- `c64.sprite.disable(n)`
- `c64.sprite.position(n, x, y)`
- `c64.sprite.setX(n, x)`
- `c64.sprite.setY(n, y)`
- `c64.sprite.color(n, color)`
- `c64.sprite.priority(n, behindBackground)`

#### Sprite data and display options

- `c64.sprite.data(n, bytesOrLabel)`
- `c64.sprite.pointer(n, blockIndex)`
- `c64.sprite.multicolor(n, enabled)`
- `c64.sprite.expandX(n, enabled)`
- `c64.sprite.expandY(n, enabled)`
- `c64.sprite.sharedColor1(color)`
- `c64.sprite.sharedColor2(color)`

#### Convenience helpers

- `c64.sprite.show(n, x, y, color)`
- `c64.sprite.hide(n)`
- `c64.sprite.moveX(n, dx)`
- `c64.sprite.moveY(n, dy)`

### Why This Version Matters

- sprites are one of the most iconic parts of the C64
- the library becomes immediately more fun
- this creates the base required for animation in the next version

### Example Target

```js
c64.sprite.enable(0);
c64.sprite.position(0, 120, 80);
c64.sprite.color(0, c64.COLOR_RED);
c64.sprite.data(0, "balloonSprite");
```

### Technical Notes

- sprite X high-bit handling must be robust
- memory pointers for sprite data should be easy to manage
- future animation systems should build on this API, not bypass it

---

## v0.4.0 - Animation

### Goal

Move from static visuals to live, time-based behavior.

### Main Priorities

- animate sprites without manual per-frame assembly
- provide a small internal timing/update engine
- keep compatibility with IRQ-driven and BASIC-friendly workflows

### Recommended Features

#### Sprite animation primitives

- `c64.sprite.moveToX(n, targetX, speed)`
- `c64.sprite.moveToY(n, targetY, speed)`
- `c64.sprite.animateTo(n, { x, y, speedX, speedY })`
- `c64.sprite.stop(n)`
- `c64.sprite.stopX(n)`
- `c64.sprite.stopY(n)`
- `c64.sprite.onReached(n, callbackOrLabel)`

#### Motion patterns

- `c64.sprite.bounceX(n, minX, maxX, speed)`
- `c64.sprite.bounceY(n, minY, maxY, speed)`
- `c64.sprite.path(n, points, speed)`
- `c64.sprite.follow(n, targetXRef, targetYRef, speed)`

#### Runtime/update helpers

- `c64.sprite.installAnimator()`
- `c64.anim.every(n, fn)`
- `c64.anim.frameCounter(address)`
- `c64.anim.waitFrames(n)`

### Why This Version Matters

- this is where demos and games start feeling alive
- beginners get smooth movement without hand-writing update loops
- it opens the door to higher-level scene systems later

### Example Target

```js
c64.sprite.enable(0);
c64.sprite.position(0, 24, 80);
c64.sprite.moveToX(0, 200, 2);
c64.sprite.moveToY(0, 120, 1);
c64.sprite.installAnimator();
```

### Technical Notes

- sprite animation state must live in safe RAM, not fragile zero-page locations
- updates should be driven by a predictable tick or IRQ
- target clamping is essential to avoid overshooting

---

## v0.5.0 - Bitmap Graphics

### Goal

Add a true graphics layer for high-resolution bitmap work.

### Main Priorities

- support C64 bitmap setup cleanly
- provide a set of drawing primitives
- make graphical demos much easier to build

### Recommended Features

#### Bitmap mode management

- `c64.hires.enable()`
- `c64.hires.disable()`
- `c64.hires.bitmap(address = 0x2000)`
- `c64.hires.screen(address = 0x0400)`
- `c64.hires.clear(color = 0)`

#### Drawing primitives

- `c64.hires.point(x, y, color)`
- `c64.hires.line(x1, y1, x2, y2, color)`
- `c64.hires.rect(x, y, w, h, color)`
- `c64.hires.fillRect(x, y, w, h, color)`
- `c64.hires.circle(cx, cy, r, color)`
- `c64.hires.fillCircle(cx, cy, r, color)`

#### Optional next step inside bitmap work

- `c64.multiBitmap.enable()`
- `c64.multiBitmap.point(...)`
- `c64.multiBitmap.fillRect(...)`

### Why This Version Matters

- it transforms `js-c64` into a real graphics playground
- it enables logos, shapes, HUDs, diagrams, and demo art
- it combines naturally with raster effects and sprite animation

### Example Target

```js
c64.hires.enable();
c64.hires.clear(0);
c64.hires.line(0, 0, 319, 199, 1);
c64.hires.circle(160, 100, 40, 1);
c64.hires.fillRect(20, 20, 60, 30, 1);
```

### Technical Notes

- VIC-II bitmap memory layout must be abstracted carefully
- color handling will need clear rules and documentation
- line/circle algorithms should favor predictable code generation over excessive cleverness

---

## v0.6.0 - SID Audio and Music

### Goal

Give `js-c64` a real sound layer for effects, melodies, and simple 3-voice music during games or animations.

### Main Priorities

- make it easy to play immediate sound effects
- support melodic playback with notes and durations
- support three simultaneous voices
- let audio run alongside animations and raster effects

### Recommended Features

#### Simple one-shot sound helpers

- `c64.sid.beep()`
- `c64.sid.noise(duration)`
- `c64.sid.click()`
- `c64.sid.explosion()`
- `c64.sid.laser()`
- `c64.sid.pickup()`

These should be convenience wrappers built from normal SID register writes.

#### Voice-oriented API

- `c64.sid.voice(1).frequency(value)`
- `c64.sid.voice(1).pulseWidth(value)`
- `c64.sid.voice(1).waveform(type)`
- `c64.sid.voice(1).gate(on)`
- `c64.sid.voice(1).attackDecay(value)`
- `c64.sid.voice(1).sustainRelease(value)`

Possible waveforms:

- `triangle`
- `saw`
- `pulse`
- `noise`

#### Musical note helpers

- `c64.sid.note(voice, noteName, duration)`
- `c64.sid.freq(voice, hzOrRawValue)`
- `c64.sid.rest(voice, duration)`
- `c64.sid.volume(value)`
- `c64.sid.filter(mode, cutoff, resonance)`

#### Music pattern helpers

- `c64.sid.sequence(voice, notes)`
- `c64.sid.playSong(songDefinition)`
- `c64.sid.stopSong()`
- `c64.sid.pauseSong()`
- `c64.sid.resumeSong()`

#### 3-voice music support

- `c64.sid.song({
    tempo: 6,
    voices: [
      [...voice1Notes],
      [...voice2Notes],
      [...voice3Notes]
    ]
  })`

#### Sync with animation/game loops

- `c64.sid.installPlayer()`
- `c64.sid.tick()`
- `c64.sid.onBeat(fn)`
- `c64.sid.playDuringIrq()` or equivalent internal hook

### Why This Version Matters

- sound is the missing half of the C64 feel
- demos become much more memorable
- small games become dramatically more alive
- music + animation + raster together is where `js-c64` starts to feel special

### Example Targets

#### Simple sound effect

```js
c64.sid.beep();
```

#### Manual voice setup

```js
c64.sid.volume(15);
c64.sid.voice(1).waveform("pulse");
c64.sid.voice(1).attackDecay(0x11);
c64.sid.voice(1).sustainRelease(0xf0);
c64.sid.note(1, "C4", 12);
```

#### 3-voice music idea

```js
c64.sid.playSong({
  tempo: 6,
  voices: [
    ["C4", "E4", "G4", "C5"],
    ["C3", "C3", "G2", "G2"],
    ["R", "C2", "R", "C2"]
  ]
});
```

#### Sound during animation

```js
c64.sprite.moveToX(0, 200, 2);
c64.sid.playSong(myTune);
c64.sprite.installAnimator();
```

### Technical Notes

- note-to-frequency conversion needs a stable internal table
- duration/tempo needs a tick system, likely driven by IRQ or a frame clock
- the sound player must not interfere with raster handlers or KERNAL stability
- one-shot effects and music playback should coexist cleanly

### Recommended Internal Strategy

Build SID support in layers:

1. raw register helpers
2. voice builder API
3. note/frequency helpers
4. pattern playback
5. song player with 3 voices

This will keep the system flexible and easier to debug.

---

## Cross-Version Priorities

These are important across all versions:

- keep generated code compact and readable
- keep examples updated whenever a feature lands
- keep beginner documentation aligned with the real API
- keep IRQ and runtime state in safe RAM areas
- expand tests with each new subsystem

---

## Suggested Milestone Order

If development time is limited, this is the most valuable order:

1. `v0.2.0`
- data
- variables
- text/screen helpers

2. `v0.3.0`
- sprite engine

3. `v0.4.0`
- sprite animation

4. `v0.5.0`
- bitmap graphics

5. `v0.6.0`
- SID sound and music

---

## Long-Term Result

If this roadmap is completed, `js-c64` becomes:

- a beginner-friendly entry point into C64 development
- a productive DSL for small retro experiments
- a fun tool for demos, sprite scenes, and audiovisual projects

