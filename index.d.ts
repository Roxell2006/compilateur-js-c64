export type Operand =
  | { mode: "imm" | "zp" | "zpx" | "zpy" | "abs" | "absx" | "absy" | "ind" | "indx" | "indy" | "rel" | "acc" | "impl"; value?: number | string }
  | number
  | string
  | null;

export interface CompileResult {
  origin: number;
  sysAddress: number;
  bytes: Uint8Array;
  prgBytes: Uint8Array;
  asm: string;
  asmText: string;
  listing: string;
  listingText: string;
  symbols: Record<string, number>;
  data: string;
  dataText: string;
  basicProgram: string;
  basicText: string;
  assetReport: Array<Record<string, unknown>>;
  diskFiles: Array<{
    name: string;
    kind: "map" | "charset" | "tables" | "sprite" | string;
    address: number;
    bytes: number;
    sourcePath: string;
    data: Uint8Array;
  }>;
}

export interface CompileOptions {
  codeStart?: number;
  sysAddress?: number;
  opt?: "size" | "speed" | "balanced";
  assets?: "inline" | "disk";
  device?: number;
}

export interface CharsetAsset {
  readonly type: "charsetAsset";
  readonly mode: "hires" | "multicolor";
  /** Compiler-derived ROM prefix. User assets omit this field; 0 is a legacy override. */
  readonly romCharacters: 0 | 64;
  readonly characterCount: number;
  /** Only bytes that must be stored in the generated program or disk module. */
  readonly storedBytes: ReadonlyArray<number>;
  readonly bytes: ReadonlyArray<number>;
}

export interface SpriteAssetFrame {
  readonly id: string;
  readonly data: ReadonlyArray<number>;
}

export interface SpriteAssetAnimation {
  readonly name: string;
  readonly frames: ReadonlyArray<number>;
  readonly speed: number;
  readonly loop: boolean;
}

export interface SpriteAsset {
  readonly type: "spriteAsset";
  readonly version: 1;
  readonly sourcePath: string;
  readonly id: string;
  readonly mode: "hires" | "multicolor";
  readonly color: number;
  readonly multicolor1: number | null;
  readonly multicolor2: number | null;
  readonly origin: Readonly<{ x: number; y: number }>;
  readonly hitbox: Readonly<Required<SpriteHitbox>>;
  readonly frames: ReadonlyArray<SpriteAssetFrame>;
  readonly animations: Readonly<Record<string, SpriteAssetAnimation>>;
  readonly initialAnimation: string | null;
  readonly framesRef: SpriteFramesRef;
  /** Loaded once at startup in disk mode. False means activate it with a level. */
  readonly resident: boolean;
}

export interface TileAsset {
  readonly chars: ReadonlyArray<number>;
  readonly colors: ReadonlyArray<number>;
  readonly collision: number;
  readonly properties: Readonly<Record<string, unknown>>;
}

export interface RawMapAsset {
  readonly type: "mapAsset";
  readonly version: 1;
  readonly sourcePath: string;
  readonly charset: CharsetAsset;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly tiles: ReadonlyArray<TileAsset>;
  readonly map: { readonly width: number; readonly height: number; readonly data: ReadonlyArray<number>; readonly objects: ReadonlyArray<MapObjectAsset> };
}

export interface MapObjectAsset {
  readonly id: string;
  readonly type: string;
  readonly x: number;
  readonly y: number;
  readonly worldX: number;
  readonly worldY: number;
  readonly sprite?: string;
  readonly properties: Readonly<Record<string, unknown>>;
}

export interface MapAsset {
  readonly type: "mapAsset";
  readonly version: 1;
  readonly sourcePath: string;
  readonly charset: CharsetAsset;
  readonly tileWidth: number;
  readonly tileHeight: number;
  readonly tiles: ReadonlyArray<TileAsset>;
  readonly map: {
    (x: number | RuntimeByteRef, y: number | RuntimeByteRef): MapTileRef;
    readonly width: number;
    readonly height: number;
    readonly data: ReadonlyArray<number>;
    readonly objects: ReadonlyArray<MapObjectAsset>;
    redraw(): void;
  };
  activate(options?: {
    /** Redraw the complete map after loading it. */
    draw?: boolean | { x?: number; y?: number };
    /** Non-resident sprite assets required by this level. */
    sprites?: ReadonlyArray<SpriteAsset>;
  }): void;
  isActive(): RuntimeCondition;
}

export type GameSceneName = "title" | "game" | "pause" | "gameOver";

export interface GameSceneHandlers {
  enter?: () => void;
  update?: () => void;
  exit?: () => void;
}

export interface MapTileRef {
  readonly type: "mapTileRef";
  set(value: number | RuntimeByteRef): void;
  load(target: RuntimeByteRef): void;
  eq(value: number | RuntimeByteRef): RuntimeCondition;
  ne(value: number | RuntimeByteRef): RuntimeCondition;
  isSolid(): RuntimeCondition;
  hasCollision(value: number): RuntimeCondition;
}

export interface MapHorizontalScrollerRef {
  readonly type: "mapHorizontalScrollerRef";
  draw(): void;
  left(pixels?: number): void;
  right(pixels?: number): void;
  up(pixels?: number): void;
  down(pixels?: number): void;
  follow(entity: MapEntityRef, options?: {
    axis?: "x" | "y" | "both";
    deadZone?: { x: number; y: number; width: number; height: number };
    offset?: { x?: number; y?: number };
    offsetX?: number;
    offsetY?: number;
    maxSpeed?: number;
    project?: boolean;
    cullingMargin?: number | { x?: number; y?: number };
  }): void;
  project(entity: MapEntityRef, options?: { cullingMargin?: number | { x?: number; y?: number }; margin?: number | { x?: number; y?: number } }): void;
}

export type MapScrollerPanel = "top" | "bottom"
  | { position: "top" | "bottom"; rows: number }
  | { top: number }
  | { bottom: number };

export interface MapEntityProjectionOptions {
  cameraX?: number | RuntimeWordRef;
  cameraY?: number | RuntimeWordRef;
  screenOffsetX?: number;
  screenOffsetY?: number;
  viewportWidth?: number;
  viewportHeight?: number;
  cullingMargin?: number | { x?: number; y?: number };
  margin?: number | { x?: number; y?: number };
}

export type MapCollisionBehavior = "solid" | "platform" | "danger" | "ladder" | "exit" | "passable";

export type SidSongEntry = string | { note: string; duration?: number } | { rest: true; duration?: number };

export interface SidPatternRepeatRef {
  readonly type: "sidPatternRepeat";
  readonly pattern: SidPatternRef;
  readonly count: number;
}

export interface SidPatternRef {
  readonly type: "sidPattern";
  readonly name: string;
  readonly entries: ReadonlyArray<SidSongEntry | SidPatternRef | SidPatternRepeatRef>;
  repeat(count: number): SidPatternRepeatRef;
}

export interface SidInstrumentRef {
  readonly type: "sidInstrument";
  readonly name: string;
  readonly waveform?: "triangle" | "saw" | "pulse" | "noise";
  readonly pulseWidth?: number;
  readonly attackDecay?: number;
  readonly sustainRelease?: number;
}

export type SidVoiceSequence = ReadonlyArray<SidSongEntry | SidPatternRef | SidPatternRepeatRef> | SidPatternRef | SidPatternRepeatRef;

export interface SidSongDefinition {
  tempo?: number;
  loop?: boolean;
  instruments?: [SidInstrumentRef | null, SidInstrumentRef | null, SidInstrumentRef | null];
  voices: [SidVoiceSequence, SidVoiceSequence, SidVoiceSequence];
}

export interface MapEntityRef {
  readonly type: "mapEntityRef";
  readonly id: number;
  readonly asset: MapAsset;
  readonly object: MapObjectAsset;
  readonly sprite: SpriteRef;
  readonly spriteAsset: SpriteAsset | null;
  readonly initialAnimation: string | null;
  readonly worldX: RuntimeWordRef;
  readonly worldY: RuntimeWordRef;
  readonly screenX: RuntimeWordRef;
  readonly screenY: RuntimeByteRef;
  readonly velocityX: RuntimeByteRef;
  readonly velocityY: RuntimeByteRef;
  readonly onGround: RuntimeBoolRef;
  readonly hitCeiling: RuntimeBoolRef;
  readonly hitLeft: RuntimeBoolRef;
  readonly hitRight: RuntimeBoolRef;
  readonly enabled: RuntimeBoolRef;
  readonly onDanger: RuntimeBoolRef;
  readonly onLadder: RuntimeBoolRef;
  readonly atExit: RuntimeBoolRef;
  readonly hitbox: Required<SpriteHitbox>;
  setWorldPosition(x: number | RuntimeWordRef, y: number | RuntimeWordRef): void;
  setVelocity(x: number | RuntimeByteRef, y: number | RuntimeByteRef): void;
  moveAndCollide(x?: number | RuntimeByteRef, y?: number | RuntimeByteRef): void;
  jump(speed: number): void;
  isOnGround(): RuntimeCondition;
  isActive(): RuntimeCondition;
  isOnDanger(): RuntimeCondition;
  isOnLadder(): RuntimeCondition;
  isAtExit(): RuntimeCondition;
  project(options?: MapEntityProjectionOptions): void;
  enable(): void;
  disable(): void;
  respawn(selector?: string | { id?: string; type?: string }): void;
  collides(other: MapEntityRef): RuntimeCondition;
  play(name: string, direction?: "left" | "right" | string): void;
  pauseAnimation(): void;
  resumeAnimation(): void;
}

export interface RuntimeCondition {
  readonly type: "runtimeCondition";
}

export interface RuntimeByteRef {
  readonly type: "varRef";
  readonly valueType: "byte";
  readonly name: string;
  set(value: number | RuntimeByteRef): void;
  add(value: number | RuntimeByteRef): void;
  sub(value: number | RuntimeByteRef): void;
  inc(): void;
  dec(): void;
  and(value: number | RuntimeByteRef): void;
  or(value: number | RuntimeByteRef): void;
  xor(value: number | RuntimeByteRef): void;
  toggle(): void;
  eq(value: number | RuntimeByteRef): RuntimeCondition;
  ne(value: number | RuntimeByteRef): RuntimeCondition;
  lt(value: number | RuntimeByteRef): RuntimeCondition;
  lte(value: number | RuntimeByteRef): RuntimeCondition;
  gt(value: number | RuntimeByteRef): RuntimeCondition;
  gte(value: number | RuntimeByteRef): RuntimeCondition;
}

export interface RuntimeWordRef {
  readonly type: "varRef";
  readonly valueType: "word";
  readonly name: string;
  set(value: number | RuntimeWordRef): void;
  add(value: number | RuntimeWordRef): void;
  sub(value: number | RuntimeWordRef): void;
  inc(): void;
  dec(): void;
  eq(value: number | RuntimeWordRef): RuntimeCondition;
  ne(value: number | RuntimeWordRef): RuntimeCondition;
  lt(value: number | RuntimeWordRef): RuntimeCondition;
  lte(value: number | RuntimeWordRef): RuntimeCondition;
  gt(value: number | RuntimeWordRef): RuntimeCondition;
  gte(value: number | RuntimeWordRef): RuntimeCondition;
}

export interface RuntimeBoolRef {
  readonly type: "varRef";
  readonly valueType: "bool";
  readonly name: string;
  set(value: boolean | RuntimeBoolRef): void;
  toggle(): void;
  eq(value: boolean | RuntimeBoolRef): RuntimeCondition;
  ne(value: boolean | RuntimeBoolRef): RuntimeCondition;
}

export interface GameCounterRef {
  readonly type: "gameCounterRef";
  readonly name: string;
  readonly digits: number;
  readonly digitRefs: ReadonlyArray<RuntimeByteRef>;
  set(value: number): void;
  add(value?: number): void;
  sub(value?: number): void;
  inc(): void;
  dec(): void;
  draw(x: number, y: number, options?: { color?: number }): void;
}

export interface FixedPoolRef<T> {
  readonly type: "fixedPoolRef";
  readonly name: string;
  readonly size: number;
  readonly items: ReadonlyArray<T>;
  at(index: number): T;
  forEach(handler: (item: T, index: number) => void): void;
}

export interface InputButton {
  held(): RuntimeCondition;
  pressed(): RuntimeCondition;
  released(): RuntimeCondition;
}

export interface JoystickInput {
  up(): RuntimeCondition;
  down(): RuntimeCondition;
  left(): RuntimeCondition;
  right(): RuntimeCondition;
  fire(): RuntimeCondition;
  upPressed(): RuntimeCondition;
  downPressed(): RuntimeCondition;
  leftPressed(): RuntimeCondition;
  rightPressed(): RuntimeCondition;
  firePressed(): RuntimeCondition;
  upReleased(): RuntimeCondition;
  downReleased(): RuntimeCondition;
  leftReleased(): RuntimeCondition;
  rightReleased(): RuntimeCondition;
  fireReleased(): RuntimeCondition;
}

export interface SpriteFramesRef {
  readonly type: "spriteFrames";
  readonly name: string;
}

export interface SpriteHitbox {
  offsetX?: number;
  offsetY?: number;
  width?: number;
  height?: number;
}

export interface SpriteCreateOptions {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  active?: boolean;
  data?: Iterable<number> | string;
  dataAddress?: number;
  frames?: SpriteFramesRef;
  color?: number;
  multicolor?: boolean;
  expandX?: boolean;
  expandY?: boolean;
  priority?: boolean;
  hitbox?: SpriteHitbox;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  bounceX?: boolean;
  bounceY?: boolean;
}

export interface SpriteRef {
  readonly type: "spriteRef";
  readonly index: number;
  readonly x: RuntimeWordRef;
  readonly y: RuntimeByteRef;
  readonly vx: RuntimeByteRef;
  readonly vy: RuntimeByteRef;
  readonly active: RuntimeBoolRef;
  readonly hitbox: Required<SpriteHitbox>;
  setPosition(x: number | RuntimeWordRef, y: number | RuntimeByteRef): void;
  setVelocity(vx: number | RuntimeByteRef, vy: number | RuntimeByteRef): void;
  setBounds(minX: number, maxX: number, minY: number, maxY: number, options?: { bounceX?: boolean; bounceY?: boolean }): void;
  update(): void;
  reverseX(): void;
  reverseY(): void;
  sync(): void;
  enable(): void;
  disable(): void;
  sequence(name: string, frameIndexes: Iterable<number>, options?: { speed?: number; loop?: boolean }): void;
  play(name: string): void;
  pauseAnimation(): void;
  resumeAnimation(): void;
  collides(other: SpriteRef): RuntimeCondition;
  vicCollides(other: SpriteRef): RuntimeCondition;
  collidesWithBackground(): RuntimeCondition;
}

export interface C64Api {
  program: {
    start(address: number): void;
  };
  [key: string]: any;
  var: {
    byte(name: string, options?: { address?: number; initial?: number }): RuntimeByteRef;
    byte(name: string, address: number, initialValue?: number): RuntimeByteRef;
    word(name: string, options?: { address?: number; initial?: number }): RuntimeWordRef;
    word(name: string, address: number, initialValue?: number): RuntimeWordRef;
    bool(name: string, options?: { address?: number; initial?: boolean } | boolean): RuntimeBoolRef;
  };
  control: {
    if(condition: RuntimeCondition, thenHandler: () => void, elseHandler?: () => void): void;
    repeat(count: number | RuntimeByteRef, handler: () => void): void;
    while(condition: RuntimeCondition, handler: () => void, options: { maxIterations: number }): void;
    routine(name: string, handler: () => void): void;
    call(name: string): void;
  };
  pool: {
    fixed<T>(name: string, size: number, factory: (index: number) => T): FixedPoolRef<T>;
  };
  random: {
    seed(value: number): void;
    byte(target: RuntimeByteRef): void;
    range(target: RuntimeByteRef, maximum: number): void;
  };
  input: {
    joystick(port?: 1 | 2): JoystickInput;
    keyboard<T extends Record<string, number>>(bindings: T): { [K in keyof T]: InputButton };
  };
  sprite: {
    frames(name: string, frames: Iterable<Iterable<number>>, options?: { address?: number }): SpriteFramesRef;
    create(index: number, options?: SpriteCreateOptions): SpriteRef;
    [key: string]: any;
  };
  game: {
    init(handler: () => void): void;
    every(count: number, handler: () => void): void;
    frame(handler: () => void, options?: { rasterLine?: number; hz?: 50 | "video" }): void;
    scene(name: GameSceneName, handlers: GameSceneHandlers): void;
    start(name?: GameSceneName, options?: { rasterLine?: number; hz?: 50 | "video" }): void;
    go(name: GameSceneName): void;
    is(name: GameSceneName): RuntimeCondition;
    counter(name: string, options?: { digits?: number; initial?: number }): GameCounterRef;
    score(options?: { name?: string; digits?: number; initial?: number }): GameCounterRef;
    lives(options?: { name?: string; digits?: number; initial?: number }): GameCounterRef;
  };
  sid: {
    volume(value: number): void;
    filter(mode: string | ReadonlyArray<string>, cutoff: number, resonance: number): void;
    voice(voice: 1 | 2 | 3): {
      frequency(value: number): void;
      pulseWidth(value: number): void;
      waveform(type: "triangle" | "saw" | "pulse" | "noise"): void;
      gate(on?: boolean): void;
      attackDecay(value: number): void;
      sustainRelease(value: number): void;
    };
    note(voice: 1 | 2 | 3, noteName: string, duration?: number): void;
    freq(voice: 1 | 2 | 3, hzOrRawValue: number): void;
    rest(voice: 1 | 2 | 3, duration?: number): void;
    pattern(name: string, entries: ReadonlyArray<SidSongEntry | SidPatternRef | SidPatternRepeatRef>): SidPatternRef;
    instrument(name: string, options: {
      waveform?: "triangle" | "saw" | "pulse" | "noise";
      pulseWidth?: number;
      attackDecay?: number;
      sustainRelease?: number;
    }): SidInstrumentRef;
    reserveSfxVoice(voice: 1 | 2 | 3): void;
    playSong(song: SidSongDefinition): void;
    installPlayer(line?: number): void;
    pauseSong(): void;
    resumeSong(): void;
    fadeSong(targetVolume: number, stepEvery?: number): void;
    stopSong(): void;
    beep(): void;
    noise(duration?: number): void;
    click(): void;
    explosion(): void;
    laser(): void;
    pickup(): void;
  };
  table: {
    byte(name: string, values: Iterable<number>): {
      load(index: number | RuntimeByteRef, target: RuntimeByteRef): void;
      store(index: number | RuntimeByteRef, value: number | RuntimeByteRef): void;
    };
  };
  assets: {
    loadMap(filePath: string): MapAsset;
    defineMap(definition: unknown): MapAsset;
    loadSprite(filePath: string, options?: { address?: number; resident?: boolean }): SpriteAsset;
    defineSprite(definition: unknown, options?: { address?: number; resident?: boolean }): SpriteAsset;
  };
  charset: {
    use(charset: CharsetAsset | MapAsset, options?: { address?: number; background?: number; multicolor1?: number; multicolor2?: number }): void;
  };
  map: {
    draw(asset: MapAsset, options?: { x?: number; y?: number }): void;
    drawViewport(asset: MapAsset, options: {
      sourceX?: number | RuntimeByteRef;
      sourceY?: number | RuntimeByteRef;
      width: number;
      height: number;
      x?: number;
      y?: number;
    }): void;
    horizontalScroller(asset: MapAsset, options: {
      sourceX?: number;
      sourceY?: number;
      width: number;
      height: number;
      x?: number;
      y?: number;
      panel?: MapScrollerPanel;
    }): MapHorizontalScrollerRef;
    scroller(asset: MapAsset, options: {
      sourceX?: number;
      sourceY?: number;
      width: number;
      height: number;
      x?: number;
      y?: number;
      panel?: MapScrollerPanel;
    }): MapHorizontalScrollerRef;
    object(asset: MapAsset, selector: string | { id?: string; type?: string }): MapObjectAsset;
    objects(asset: MapAsset, selector?: string | { id?: string; type?: string }): ReadonlyArray<MapObjectAsset>;
    spawn(asset: MapAsset, selector: string | { id?: string; type?: string }, options: {
      sprite: number | SpriteRef;
      spriteAsset?: string | SpriteAsset;
      spriteOptions?: SpriteCreateOptions;
      hitbox?: SpriteHitbox;
      animation?: string;
      velocityX?: number;
      velocityY?: number;
      maxCollisionSpeed?: number;
      active?: boolean;
      collisionBehaviors?: Record<number, MapCollisionBehavior>;
    }): MapEntityRef;
    spawnAll(asset: MapAsset, selector: string | { id?: string; type?: string }, options?: {
      firstSprite?: number;
      spriteAsset?: string | SpriteAsset;
      spriteOptions?: SpriteCreateOptions;
      hitbox?: SpriteHitbox;
      animation?: string;
      velocityX?: number;
      velocityY?: number;
      maxCollisionSpeed?: number;
      active?: boolean;
      collisionBehaviors?: Record<number, MapCollisionBehavior>;
    }): ReadonlyArray<MapEntityRef>;
    tileAt(asset: MapAsset, x: number | RuntimeByteRef, y: number | RuntimeByteRef): MapTileRef;
    setTile(asset: MapAsset, x: number | RuntimeByteRef, y: number | RuntimeByteRef, value: number | RuntimeByteRef): void;
    pixelToTile(asset: MapAsset, source: { x: number | RuntimeByteRef | RuntimeWordRef; y: number | RuntimeByteRef | RuntimeWordRef }, target: { x: RuntimeByteRef | RuntimeWordRef; y: RuntimeByteRef | RuntimeWordRef }): void;
    tileToPixel(asset: MapAsset, source: { x: number | RuntimeByteRef | RuntimeWordRef; y: number | RuntimeByteRef | RuntimeWordRef }, target: { x: RuntimeByteRef | RuntimeWordRef; y: RuntimeByteRef | RuntimeWordRef }): void;
    characterToTile(asset: MapAsset, source: { x: number | RuntimeByteRef | RuntimeWordRef; y: number | RuntimeByteRef | RuntimeWordRef }, target: { x: RuntimeByteRef | RuntimeWordRef; y: RuntimeByteRef | RuntimeWordRef }): void;
    tileToCharacter(asset: MapAsset, source: { x: number | RuntimeByteRef | RuntimeWordRef; y: number | RuntimeByteRef | RuntimeWordRef }, target: { x: RuntimeByteRef | RuntimeWordRef; y: RuntimeByteRef | RuntimeWordRef }): void;
  };
}

export declare class Assembler6502 {
  constructor(origin?: number);
  label(name: string): this;
  comment(text: string): this;
  emit(mnemonic: string, operand?: Operand): this;
  toBytes(): Uint8Array;
  toAsm(): string;
  toListing(): string;
  getSymbolTable(): Record<string, number>;
}

export declare function compileFile(inputFile: string, options?: CompileOptions): Promise<CompileResult>;
export declare function compileInstructions(instructions: Array<{ op: string; args?: any[] }>, options?: CompileOptions): CompileResult;
export declare function compileJsToC64Outputs(source: string, options?: CompileOptions): Promise<CompileResult & { source: string }>;
export declare function compileJsToBasicData(source: string, options?: CompileOptions): Promise<string>;
export declare function loadMapAsset(filePath: string, baseDirectory?: string): RawMapAsset;
export declare function normalizeMapAsset(definition: unknown, sourcePath?: string): RawMapAsset;
export declare function expandMapAsset(asset: RawMapAsset | MapAsset): { width: number; height: number; chars: number[]; colors: number[] };
export declare function loadSpriteAsset(filePath: string, baseDirectory?: string): Omit<SpriteAsset, "framesRef" | "resident">;
export declare function normalizeSpriteAsset(definition: unknown, sourcePath?: string): Omit<SpriteAsset, "framesRef" | "resident">;
export declare function createPrg(machineCode: Uint8Array, sysAddress?: number): Uint8Array;
export declare const D64_SIZE: 174848;
export declare function d64SectorOffset(track: number, sector: number): number;
export declare function createD64(options: {
  name?: string;
  id?: string;
  files: Array<{ name: string; type: "prg" | "usr"; data: Iterable<number> }>;
}): {
  bytes: Uint8Array;
  files: Array<{ name: string; type: "prg" | "usr"; bytes: number; blocks: number; startTrack: number; startSector: number }>;
  usedBlocks: number;
  directoryBlocks: number;
  freeBlocks: number;
};
export declare function createBasicSysStub(sysAddress?: number): Uint8Array;
export declare function exportBasicData(bytes: ArrayLike<number>, startLine?: number, step?: number, chunkSize?: number): string;
export declare const c64: C64Api;
export declare function imm(value: number): Operand;
export declare function immLo(value: number | string): Operand;
export declare function immHi(value: number | string): Operand;
export declare function zp(value: number | string): Operand;
export declare function zpx(value: number | string): Operand;
export declare function zpy(value: number | string): Operand;
export declare function abs(value: number | string): Operand;
export declare function absx(value: number | string): Operand;
export declare function absy(value: number | string): Operand;
export declare function ind(value: number | string): Operand;
export declare function indx(value: number | string): Operand;
export declare function indy(value: number | string): Operand;
export declare function rel(value: number | string): Operand;
export declare function acc(): Operand;
export declare function impl(): Operand;
