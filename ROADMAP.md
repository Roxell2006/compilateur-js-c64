# ROADMAP

This roadmap repositions `js-c64` as a practical game creation toolkit for Commodore 64.

The goal is no longer only to generate small assembly programs, but to help build:

- playable arcade-style games
- scrolling action scenes
- sprite-based demos with music
- structured retro game prototypes

The long-term direction is:

- keep the DSL beginner-friendly
- keep generated machine code compact
- make subsystems coexist cleanly
- progressively add the classic building blocks of a C64 game engine

---

## Core Direction

`js-c64` should evolve into a layered tool:

1. machine-code generator
2. practical C64 API
3. runtime helpers for animation, audio and IRQ
4. game-oriented systems for input, collisions, maps and scenes

To stay healthy as the project grows, every new subsystem should respect these rules:

- no fragile IRQ conflicts
- safe RAM usage
- compact emitted code
- readable generated ASM
- examples and docs updated whenever a feature lands

---

## Current State

Already in place today:

- screen and text helpers
- data and variable helpers
- raster IRQ helpers
- sprite setup and animation
- hires bitmap layer
- SID sound effects
- non-blocking 3-voice SID song playback
- coexistence between SID music, raster IRQ and sprite animation

This is a strong base.

The next roadmap focuses on turning that base into a real game-oriented toolkit.

---

## v0.7.0 - Gameplay Foundations

### Goal

Add the missing building blocks needed for interactive programs and small games.

### Main Priorities

- read player inputs cleanly
- add predictable frame/timer helpers
- provide a simple structured game loop
- reduce the amount of manual polling code users need to write

### Recommended Features

#### Keyboard input

- `c64.input.keyPressed(key)`
- `c64.input.keyReleased(key)`
- `c64.input.anyKeyPressed()`
- `c64.input.readMatrix()` or equivalent internal helper

#### Joystick input

- `c64.joystick.read(port)`
- `c64.joystick.up(port)`
- `c64.joystick.down(port)`
- `c64.joystick.left(port)`
- `c64.joystick.right(port)`
- `c64.joystick.fire(port)`

#### Timing helpers

- `c64.anim.frameCounter(address)`
- `c64.anim.waitFrames(count)`
- `c64.anim.every(count, fn)`
- `c64.timer.every(count, fn)`

#### Loop helpers

- `c64.loop.forever(fn)`
- `c64.loop.until(condition, fn)`
- `c64.loop.while(condition, fn)`

#### Small utility helpers

- `c64.var.bool(name, address, initialValue = 0)`
- `c64.var.inc(name)`
- `c64.var.dec(name)`

### Why This Version Matters

- games need input before they need complexity
- predictable timing is the heart of gameplay
- beginners should be able to build a moving, controllable sprite quickly

### Example Target

```js
c64.loop.forever(() => {
  if (c64.joystick.left(2)) c64.sprite.moveX(0, -1);
  if (c64.joystick.right(2)) c64.sprite.moveX(0, 1);
  if (c64.joystick.fire(2)) c64.sid.beep();
});
```

### Technical Notes

- input polling must coexist with raster and SID IRQ systems
- helper APIs should compile to compact loops, not repeated boilerplate
- frame-driven gameplay should stay deterministic

---

## v0.8.0 - Sprites Pro

### Goal

Turn the sprite system into a proper gameplay-ready subsystem.

### Main Priorities

- collision support
- multi-frame animation
- better movement helpers
- more convenient sprite state handling

### Recommended Features

#### Collision helpers

- `c64.sprite.collidesWithSprite(a, b)`
- `c64.sprite.collidesWithBackground(n)`
- `c64.sprite.onCollision(a, b, fn)`
- `c64.sprite.onBackgroundCollision(n, fn)`

#### Sprite animation helpers

- `c64.sprite.frame(n, frameIndex)`
- `c64.sprite.frames(n, frameList)`
- `c64.sprite.nextFrame(n)`
- `c64.sprite.animateFrames(n, frames, speed)`

#### Movement helpers

- `c64.sprite.velocity(n, vx, vy)`
- `c64.sprite.acceleration(n, ax, ay)`
- `c64.sprite.limit(n, minX, maxX, minY, maxY)`
- `c64.sprite.bounceX(n, minX, maxX, speed)`
- `c64.sprite.bounceY(n, minY, maxY, speed)`

#### State and convenience helpers

- `c64.sprite.active(n, enabled)`
- `c64.sprite.cloneData(n, sourceLabelOrFrames)`
- `c64.sprite.showFrame(n, frameIndex, x, y, color)`

### Why This Version Matters

- collisions are the base of gameplay
- multi-frame animation makes a game feel alive immediately
- movement primitives reduce a lot of repetitive assembly logic

### Example Target

```js
c64.sprite.enable(0);
c64.sprite.position(0, 40, 120);
c64.sprite.animateFrames(0, [0, 1, 2, 1], 6);

if (c64.sprite.collidesWithSprite(0, 1)) {
  c64.sid.explosion();
}
```

### Technical Notes

- collision helpers can build on VIC-II collision registers where possible
- sprite frame animation should reuse existing animation IRQ infrastructure
- generated code should prefer per-frame state machines, not full code duplication

---

## v0.9.0 - Charset, Tiles, Scrolling

### Goal

Add the classic building blocks required for level-based C64 games.

### Main Priorities

- custom character sets
- tilemap-friendly workflows
- horizontal and vertical scrolling
- camera-style screen movement

### Recommended Features

#### Custom charset helpers

- `c64.charset.address(address)`
- `c64.charset.copyDefault(toAddress)`
- `c64.charset.define(charCode, bytes)`
- `c64.charset.enable(address)`
- `c64.charset.disable()`

#### Tile helpers

- `c64.tile.define(name, charCode, color)`
- `c64.map.define(name, width, height, tiles)`
- `c64.map.draw(name, screenX, screenY)`
- `c64.map.getTile(name, x, y)`
- `c64.map.setTile(name, x, y, value)`

#### Scrolling helpers

- `c64.scroll.horizontal(speed)`
- `c64.scroll.vertical(speed)`
- `c64.scroll.setFineX(value)`
- `c64.scroll.setFineY(value)`
- `c64.scroll.followSprite(n)`
- `c64.scroll.camera(xRef, yRef)`

#### Screen streaming helpers

- `c64.map.streamColumn(...)`
- `c64.map.streamRow(...)`
- `c64.scroll.onWrap(fn)`

### Why This Version Matters

- this is what makes real levels possible
- custom charset plus scroll is one of the most important C64 game combinations
- users can begin building platformers, maze games and shooters with moving backgrounds

### Example Target

```js
c64.charset.enable(0x3000);
c64.map.draw("level1", 0, 0);
c64.scroll.followSprite(0);
```

### Technical Notes

- VIC memory pointers must stay compatible with hires and sprite data strategies
- scroll helpers should cooperate with raster and animation runtimes
- tile streaming should be designed for compact code generation

---

## v1.0.0 - Mini C64 Game Engine

### Goal

Provide a small but coherent game engine layer on top of the DSL.

### Main Priorities

- scene/state management
- HUD and score helpers
- gameplay entity helpers
- stronger runtime coordination

### Recommended Features

#### Scene helpers

- `c64.scene.define(name, fn)`
- `c64.scene.switch(name)`
- `c64.scene.reset(name)`

#### Game state helpers

- `c64.state.set(name, value)`
- `c64.state.get(name)`
- `c64.state.inc(name)`
- `c64.state.dec(name)`

#### HUD helpers

- `c64.score.set(value)`
- `c64.score.add(value)`
- `c64.lives.set(value)`
- `c64.lives.dec()`
- `c64.hud.printValue(x, y, valueRef)`

#### Entity/gameplay helpers

- `c64.enemy.spawn(type, x, y)`
- `c64.bullet.spawn(x, y, vx, vy)`
- `c64.hitbox.define(name, data)`
- `c64.random.byte()`
- `c64.random.range(min, max)`

#### Audio/game sync helpers

- `c64.sid.pauseSong()`
- `c64.sid.resumeSong()`
- `c64.sid.sequence(voice, notes)`
- `c64.sid.onBeat(fn)`

### Why This Version Matters

- users move from “writing routines” to “building games”
- demos and prototypes gain real structure
- more ambitious projects become easier to maintain

### Example Target

```js
c64.scene.define("title", () => {
  c64.printCentered(10, "PRESS FIRE");
});

c64.scene.define("game", () => {
  c64.sprite.enable(0);
  c64.sprite.position(0, 40, 120);
});
```

### Technical Notes

- avoid hiding too much low-level behavior
- keep advanced users free to mix high-level and low-level APIs
- runtime state must remain predictable and exportable

---

## Cross-Version Technical Priorities

These priorities matter across every future version.

### 1. Unified IRQ Runtime

All long-running systems should cooperate through one coherent runtime strategy:

- raster effects
- sprite animation
- SID music
- gameplay timers
- scrolling

This is critical for stability.

### 2. Safe Memory Strategy

Document and formalize:

- runtime RAM usage
- animation state RAM
- SID player state RAM
- map/charset reserved areas
- safe defaults for beginners

### 3. Output Optimization

Add optional optimization modes later:

- `--opt size`
- `--opt speed`
- `--opt balanced`

### 4. Better Diagnostics

Improve developer feedback with:

- clearer compile-time errors
- better symbol exports
- optional memory map reports
- optional runtime warnings for risky overlaps

### 5. Strong Example Coverage

Every major feature should land with at least one working example.

Recommended future examples:

- `examples/player-move.js`
- `examples/joystick-game-loop.js`
- `examples/sprite-collision.js`
- `examples/sprite-animation-frames.js`
- `examples/custom-charset.js`
- `examples/tilemap-scroll-x.js`
- `examples/tilemap-scroll-y.js`
- `examples/shooter-demo.js`
- `examples/platform-demo.js`

---

## Recommended Implementation Order

If development time is limited, this is the highest-value order:

1. `v0.7.0`
- inputs
- timers
- loops

2. `v0.8.0`
- collisions
- multi-frame sprite animation
- richer movement helpers

3. `v0.9.0`
- custom charset
- tilemaps
- scrolling

4. `v1.0.0`
- scenes
- score/lives/state
- entity-style helpers

---

## Long-Term Result

If this roadmap is completed, `js-c64` becomes:

- a beginner-friendly entry point to C64 game programming
- a compact DSL for small but real retro games
- a practical prototype tool for sprites, scroll, sound and gameplay
- a creative engine for demos, toy engines and arcade experiments
