(function () {
  "use strict";

  const COLORS = [
    "#000000", "#ffffff", "#813338", "#75cec8",
    "#8e3c97", "#56ac4d", "#2e2c9b", "#edf171",
    "#8e5029", "#553800", "#c46c71", "#4a4a4a",
    "#7b7b7b", "#a9ff9f", "#706deb", "#b2b2b2"
  ];
  const STORAGE_KEY = "js-c64-asset-studio-v1";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const blankChar = () => Array(8).fill(0);
  const SYSTEM_CHAR_COUNT = 65;
  const C64_LETTERS = [
    [24,60,102,126,102,102,102,0], [124,102,102,124,102,102,124,0],
    [60,102,96,96,96,102,60,0], [120,108,102,102,102,108,120,0],
    [126,96,96,120,96,96,126,0], [126,96,96,120,96,96,96,0],
    [60,102,96,110,102,102,60,0], [102,102,102,126,102,102,102,0],
    [60,24,24,24,24,24,60,0], [30,12,12,12,12,108,56,0],
    [102,108,120,112,120,108,102,0], [96,96,96,96,96,96,126,0],
    [99,119,127,107,99,99,99,0], [102,118,126,126,110,102,102,0],
    [60,102,102,102,102,102,60,0], [124,102,102,124,96,96,96,0],
    [60,102,102,102,110,60,14,0], [124,102,102,124,120,108,102,0],
    [60,102,96,60,6,102,60,0], [126,24,24,24,24,24,24,0],
    [102,102,102,102,102,102,60,0], [102,102,102,102,102,60,24,0],
    [99,99,99,107,127,119,99,0], [102,102,60,24,60,102,102,0],
    [102,102,102,60,24,24,24,0], [126,6,12,24,48,96,126,0]
  ];
  const C64_DIGITS = [
    [60,102,110,118,102,102,60,0], [24,56,24,24,24,24,126,0],
    [60,102,6,12,48,96,126,0], [60,102,6,28,6,102,60,0],
    [6,14,30,102,127,6,6,0], [126,96,124,6,6,102,60,0],
    [60,102,96,124,102,102,60,0], [126,102,12,24,24,24,24,0],
    [60,102,102,60,102,102,60,0], [60,102,102,62,6,102,60,0]
  ];
  const C64_PUNCTUATION = {
    33: [24,24,24,24,0,0,24,0], 34: [102,102,102,0,0,0,0,0],
    35: [102,102,255,102,255,102,102,0], 36: [24,62,96,60,6,124,24,0],
    37: [98,102,12,24,48,102,70,0], 38: [60,102,60,56,103,102,63,0],
    39: [6,12,24,0,0,0,0,0], 40: [12,24,48,48,48,24,12,0],
    41: [48,24,12,12,12,24,48,0], 42: [0,102,60,255,60,102,0,0],
    43: [0,24,24,126,24,24,0,0], 44: [0,0,0,0,0,24,24,48],
    45: [0,0,0,126,0,0,0,0], 46: [0,0,0,0,0,24,24,0],
    47: [0,6,12,24,48,96,0,0], 58: [0,0,24,0,0,24,0,0],
    59: [0,0,24,0,0,24,24,48], 60: [14,24,48,96,48,24,14,0],
    61: [0,0,126,0,126,0,0,0], 62: [112,24,12,6,12,24,112,0],
    63: [60,102,6,12,24,0,24,0]
  };

  function createSystemCharset() {
    const characters = Array.from({ length: SYSTEM_CHAR_COUNT }, blankChar);
    C64_LETTERS.forEach((character, index) => { characters[index + 1] = [...character]; });
    C64_DIGITS.forEach((character, index) => { characters[index + 48] = [...character]; });
    Object.entries(C64_PUNCTUATION).forEach(([index, character]) => { characters[Number(index)] = [...character]; });
    return characters;
  }

  function hasSystemCharset(asset) {
    const expected = createSystemCharset();
    const characters = asset?.charset?.characters;
    return Array.isArray(characters) && characters.length >= SYSTEM_CHAR_COUNT
      && expected.every((character, index) => character.every((byte, row) => characters[index]?.[row] === byte));
  }

  function installSystemCharacters(asset) {
    if (hasSystemCharset(asset)) return false;
    if (asset.charset.characters.length + SYSTEM_CHAR_COUNT > 256) throw new Error("Il faut libérer 65 caractères avant d’installer le charset système.");
    asset.charset.characters = [...createSystemCharset(), ...asset.charset.characters.map(character => [...character])];
    asset.tiles.forEach(tile => { tile.chars = tile.chars.map(index => index + SYSTEM_CHAR_COUNT); });
    return true;
  }

  function isSystemCharacter(index) {
    return hasSystemCharset(project) && index < SYSTEM_CHAR_COUNT;
  }

  const starterProject = () => ({
    version: 1,
    charset: {
      mode: "hires",
      characters: [
        ...createSystemCharset(),
        [255, 129, 129, 129, 129, 129, 129, 255],
        [0, 24, 60, 126, 255, 126, 60, 24],
        [170, 85, 170, 85, 170, 85, 170, 85]
      ]
    },
    tileWidth: 1,
    tileHeight: 1,
    tiles: [
      { chars: [32], colors: [1], collision: 0, properties: {} },
      { chars: [65], colors: [14], collision: 1, properties: { solid: true } },
      { chars: [66], colors: [7], collision: 0, properties: { collectible: true } },
      { chars: [67], colors: [5], collision: 1, properties: { solid: true } }
    ],
    map: {
      width: 16,
      height: 12,
      objects: [],
      data: Array.from({ length: 192 }, (_, index) => {
        const x = index % 16;
        const y = Math.floor(index / 16);
        return x === 0 || x === 15 || y === 0 || y === 11 ? 1 : 0;
      })
    }
  });

  let project = loadLocalProject();
  let currentView = "charset";
  let selectedChar = Math.min(SYSTEM_CHAR_COUNT, project.charset.characters.length - 1);
  let selectedTile = 0;
  let tilePaintChar = selectedChar;
  let tilePaintColor = 1;
  let foreground = 1;
  let background = 0;
  let multicolor1 = 5;
  let multicolor2 = 10;
  let paintPixelValue = 1;
  let mapTool = "pencil";
  let mapZoom = 3;
  let charClipboard = null;
  let mapClipboard = null;
  let mapSelection = null;
  let selectedObject = -1;
  let pointerStart = null;
  let drawing = false;
  let drawValue = 1;
  let liveSnapshot = null;
  let toastTimer = null;
  const past = [];
  const future = [];

  function loadLocalProject() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return starterProject();
      const parsed = JSON.parse(raw);
      if (validateAsset(parsed).errors.length) return starterProject();
      const normalized = normalizeAsset(parsed);
      try { installSystemCharacters(normalized); } catch (_) { /* Installation manuelle possible. */ }
      return normalized;
    } catch (_) {
      return starterProject();
    }
  }

  function normalizeAsset(asset) {
    const result = clone(asset);
    if (!result.charset.characters && Array.isArray(result.charset.bytes)) {
      result.charset.characters = [];
      for (let index = 0; index < result.charset.bytes.length; index += 8) {
        result.charset.characters.push(result.charset.bytes.slice(index, index + 8));
      }
      delete result.charset.bytes;
    }
    result.tileWidth ??= 1;
    result.tileHeight ??= 1;
    result.map.objects ??= [];
    result.tiles.forEach(tile => {
      tile.colors ??= Array(tile.chars.length).fill(1);
      tile.collision ??= 0;
      tile.properties ??= {};
    });
    return result;
  }

  function snapshot() {
    return JSON.stringify(project);
  }

  function pushHistory(previous) {
    if (previous === snapshot()) return;
    past.push(previous);
    if (past.length > 100) past.shift();
    future.length = 0;
  }

  function mutate(change, render = true) {
    const previous = snapshot();
    change();
    pushHistory(previous);
    persist();
    if (render) renderAll();
  }

  function beginLiveEdit() {
    if (liveSnapshot === null) liveSnapshot = snapshot();
  }

  function endLiveEdit() {
    if (liveSnapshot === null) return;
    pushHistory(liveSnapshot);
    liveSnapshot = null;
    persist();
    renderAll();
  }

  function persist() {
    localStorage.setItem(STORAGE_KEY, snapshot());
    $("#saveState").textContent = "Sauvegardé localement";
    updateHistoryButtons();
  }

  function undo() {
    if (!past.length) return;
    future.push(snapshot());
    project = JSON.parse(past.pop());
    clampSelections();
    persist();
    renderAll();
  }

  function redo() {
    if (!future.length) return;
    past.push(snapshot());
    project = JSON.parse(future.pop());
    clampSelections();
    persist();
    renderAll();
  }

  function clampSelections() {
    selectedChar = Math.min(selectedChar, project.charset.characters.length - 1);
    selectedTile = Math.min(selectedTile, project.tiles.length - 1);
    tilePaintChar = Math.min(tilePaintChar, project.charset.characters.length - 1);
    mapSelection = null;
  }

  function updateHistoryButtons() {
    $("#undo").disabled = !past.length;
    $("#redo").disabled = !future.length;
  }

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  function setView(view) {
    currentView = view;
    $$(".tab").forEach(button => button.classList.toggle("active", button.dataset.view === view));
    $$(".view").forEach(panel => panel.classList.toggle("active", panel.id === `${view}View`));
    history.replaceState(null, "", `#${view}`);
    updateContextHelp();
    if (view === "map") renderMap();
  }

  function updateContextHelp() {
    const charsetHelp = isSystemCharacter(selectedChar)
      ? `Code écran ${selectedChar} protégé pour conserver l’affichage des textes et des scores.`
      : "Dessinez dans la grille 8 × 8. Clic gauche : dessiner. Clic droit : effacer.";
    const content = {
      charset: [`${characterLabel(selectedChar)} · code ${selectedChar}`, charsetHelp],
      tiles: [`Métatuile ${selectedTile}`, "Assemblez caractères et couleurs, puis associez collision et propriétés de gameplay."],
      map: [`Tuile ${selectedTile}`, "Dessinez la carte. Les collisions proviennent de chaque métatuile."]
    }[currentView];
    $("#selectionTitle").textContent = content[0];
    $("#selectionHelp").textContent = content[1];
  }

  function characterLabel(index) {
    if (!hasSystemCharset(project)) return `P${index}`;
    if (index >= 1 && index <= 26) return String.fromCharCode(64 + index);
    if (index === 32) return "Espace";
    if (index >= 48 && index <= 57) return String(index - 48);
    const punctuation = { 33: "!", 34: '"', 35: "#", 36: "$", 37: "%", 38: "&", 39: "'", 40: "(", 41: ")", 42: "*", 43: "+", 44: ",", 45: "-", 46: ".", 47: "/", 58: ":", 59: ";", 60: "<", 61: "=", 62: ">", 63: "?" };
    if (punctuation[index]) return punctuation[index];
    if (index >= 65 && index <= 90) return `Shift+${String.fromCharCode(index)}`;
    if (index < SYSTEM_CHAR_COUNT) return `S${index}`;
    return `P${index}`;
  }

  function textScreenCode(character) {
    const code = character.charCodeAt(0);
    if (character === " ") return 32;
    if (code >= 65 && code <= 90) return code - 64;
    if (code >= 97 && code <= 122) return code - 96;
    return code & 0xff;
  }

  function renderTextPreview() {
    const canvas = $("#textPreviewCanvas");
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = COLORS[background]; ctx.fillRect(0, 0, canvas.width, canvas.height);
    const text = $("#textPreviewInput").value;
    [...text].slice(0, 32).forEach((character, index) => {
      const code = textScreenCode(character);
      const glyph = project.charset.characters[code] || blankChar();
      drawCharacter(ctx, glyph, index * 8, 12, 8, COLORS[foreground], COLORS[background], false, "hires");
    });
  }

  function createPalette(container, selected, onSelect) {
    container.replaceChildren();
    COLORS.forEach((color, index) => {
      const button = document.createElement("button");
      button.className = `swatch${index === selected ? " selected" : ""}`;
      button.style.background = color;
      button.title = `${index} · ${color}`;
      button.setAttribute("aria-label", `Couleur C64 ${index}`);
      button.addEventListener("click", () => onSelect(index));
      container.append(button);
    });
  }

  function charPixelValue(character, x, y, mode = project.charset.mode) {
    if (mode === "multicolor") return (character[y] >> ((3 - x) * 2)) & 3;
    return (character[y] & (128 >> x)) !== 0 ? 1 : 0;
  }

  function setCharPixelValue(character, x, y, value, mode = project.charset.mode) {
    if (mode === "multicolor") {
      const shift = (3 - x) * 2;
      character[y] = (character[y] & ~(3 << shift)) | ((value & 3) << shift);
      return;
    }
    const mask = 128 >> x;
    character[y] = value ? character[y] | mask : character[y] & ~mask;
  }

  function drawCharacter(ctx, character, x, y, size, foregroundColor, backgroundColor, transparent = false, mode = project.charset.mode) {
    if (!transparent) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(x, y, size, size);
    }
    const logicalWidth = mode === "multicolor" ? 4 : 8;
    const pixelWidth = size / logicalWidth;
    const pixelHeight = size / 8;
    const valueColors = [backgroundColor, COLORS[multicolor1], COLORS[multicolor2], foregroundColor];
    for (let py = 0; py < 8; py++) {
      for (let px = 0; px < logicalWidth; px++) {
        const value = charPixelValue(character, px, py, mode);
        if (value) {
          ctx.fillStyle = mode === "multicolor" ? valueColors[value] : foregroundColor;
          ctx.fillRect(x + px * pixelWidth, y + py * pixelHeight, pixelWidth, pixelHeight);
        }
      }
    }
  }

  function makePreviewCanvas(character, color = 1, size = 64, mode = project.charset.mode) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawCharacter(ctx, character, 0, 0, size, COLORS[color], COLORS[background], false, mode);
    return canvas;
  }

  function renderCharset() {
    const character = project.charset.characters[selectedChar];
    const editMode = isSystemCharacter(selectedChar) ? "hires" : project.charset.mode;
    const logicalWidth = editMode === "multicolor" ? 4 : 8;
    const grid = $("#pixelGrid");
    grid.replaceChildren();
    grid.classList.toggle("multicolor", editMode === "multicolor");
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < logicalWidth; x++) {
        const pixel = document.createElement("button");
        const value = charPixelValue(character, x, y, editMode);
        pixel.className = `pixel${value ? " on" : ""}`;
        pixel.dataset.x = x;
        pixel.dataset.y = y;
        pixel.dataset.value = value;
        pixel.setAttribute("role", "gridcell");
        pixel.setAttribute("aria-label", `Pixel ${x}, ${y}`);
        grid.append(pixel);
      }
    }
    grid.style.setProperty("--pixel-on", COLORS[foreground]);
    const pixelColors = [background, multicolor1, multicolor2, foreground];
    $$(".pixel", grid).forEach(pixel => pixel.style.background = COLORS[pixelColors[Number(pixel.dataset.value)]]);

    const preview = $("#charPreview");
    const ctx = preview.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawCharacter(ctx, character, 0, 0, preview.width, COLORS[foreground], COLORS[background], false, editMode);
    $("#charBytes").textContent = character.map(byte => `$${byte.toString(16).padStart(2, "0").toUpperCase()}`).join(" ");
    $("#charCount").textContent = `${project.charset.characters.length} / 256`;
    const protectedCharacter = isSystemCharacter(selectedChar);
    $("#deleteChar").disabled = protectedCharacter;
    $("#clearChar").disabled = protectedCharacter;
    $("#pasteChar").disabled = protectedCharacter;
    $("#moveCharBack").disabled = protectedCharacter || selectedChar <= (hasSystemCharset(project) ? SYSTEM_CHAR_COUNT : 0);
    $("#moveCharNext").disabled = protectedCharacter || selectedChar >= project.charset.characters.length - 1;

    createPalette($("#charForegroundPalette"), foreground, value => { foreground = value; renderCharset(); });
    createPalette($("#charBackgroundPalette"), background, value => { background = value; renderAll(); });
    $("#charsetMode").value = project.charset.mode;
    $('[data-transform="rotate"]').textContent = project.charset.mode === "multicolor" ? "Rotation 180°" : "Rotation 90°";
    $("#multicolorControls").hidden = editMode !== "multicolor";
    if (editMode === "multicolor") {
      createPalette($("#multicolor1Palette"), multicolor1, value => { multicolor1 = value; renderAll(); });
      createPalette($("#multicolor2Palette"), multicolor2, value => { multicolor2 = value; renderAll(); });
      const valueButtons = $("#pixelValueButtons");
      valueButtons.replaceChildren();
      [0, 1, 2, 3].forEach(value => {
        const button = document.createElement("button");
        button.className = `button ghost${paintPixelValue === value ? " selected" : ""}`;
        button.textContent = `${value}`;
        button.style.borderColor = COLORS[pixelColors[value]];
        button.addEventListener("click", () => { paintPixelValue = value; renderCharset(); });
        valueButtons.append(button);
      });
    }
    renderCharacterLibrary($("#charLibrary"), selectedChar, index => { selectedChar = index; renderAll(); });
    renderTextPreview();
  }

  function renderCharacterLibrary(container, selected, onSelect) {
    container.replaceChildren();
    const systemReady = hasSystemCharset(project);
    project.charset.characters.forEach((character, index) => {
      const button = document.createElement("button");
      button.className = `asset-item${index === selected ? " selected" : ""}`;
      button.append(makePreviewCanvas(character, foreground, 64, systemReady && index < SYSTEM_CHAR_COUNT ? "hires" : project.charset.mode));
      button.classList.toggle("system", systemReady && index < SYSTEM_CHAR_COUNT);
      button.classList.toggle("custom-start", systemReady && index === SYSTEM_CHAR_COUNT);
      const number = document.createElement("small");
      number.textContent = characterLabel(index);
      button.append(number);
      button.title = `${characterLabel(index)} · code écran ${index}${systemReady && index < SYSTEM_CHAR_COUNT ? " · protégé" : " · personnalisé"}`;
      button.addEventListener("click", () => onSelect(index));
      container.append(button);
    });
  }

  function paintPixel(target, forcedValue = null) {
    if (isSystemCharacter(selectedChar)) return;
    const x = Number(target.dataset.x);
    const y = Number(target.dataset.y);
    const character = project.charset.characters[selectedChar];
    const value = forcedValue === null ? (charPixelValue(character, x, y) ? 0 : paintPixelValue) : forcedValue;
    setCharPixelValue(character, x, y, value);
    target.dataset.value = value;
    target.classList.toggle("on", value !== 0);
    target.style.background = COLORS[[background, multicolor1, multicolor2, foreground][value]];
    renderCharacterDependencies();
  }

  function renderCharacterDependencies() {
    const character = project.charset.characters[selectedChar];
    const preview = $("#charPreview");
    const mode = isSystemCharacter(selectedChar) ? "hires" : project.charset.mode;
    drawCharacter(preview.getContext("2d"), character, 0, 0, preview.width, COLORS[foreground], COLORS[background], false, mode);
    $("#charBytes").textContent = character.map(byte => `$${byte.toString(16).padStart(2, "0").toUpperCase()}`).join(" ");
  }

  function transformCharacter(kind) {
    if (isSystemCharacter(selectedChar)) return showToast("Les caractères système sont protégés. Dupliquez-en un pour créer une variante.");
    mutate(() => {
      const old = project.charset.characters[selectedChar];
      const next = blankChar();
      const logicalWidth = project.charset.mode === "multicolor" ? 4 : 8;
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < logicalWidth; x++) {
          const value = charPixelValue(old, x, y);
          if (!value) continue;
          let nx = x;
          let ny = y;
          if (kind === "mirrorX") nx = logicalWidth - 1 - x;
          if (kind === "mirrorY") ny = 7 - y;
          if (kind === "rotate") {
            if (logicalWidth === 8) { nx = 7 - y; ny = x; }
            else { nx = logicalWidth - 1 - x; ny = 7 - y; }
          }
          if (kind === "left") nx = (x + logicalWidth - 1) % logicalWidth;
          if (kind === "right") nx = (x + 1) % logicalWidth;
          if (kind === "up") ny = (y + 7) % 8;
          if (kind === "down") ny = (y + 1) % 8;
          setCharPixelValue(next, nx, ny, value);
        }
      }
      project.charset.characters[selectedChar] = next;
    });
  }

  function remapCharacterIndices(a, b) {
    project.tiles.forEach(tile => {
      tile.chars = tile.chars.map(value => value === a ? b : value === b ? a : value);
    });
  }

  function moveCharacter(delta) {
    const destination = selectedChar + delta;
    const customStart = hasSystemCharset(project) ? SYSTEM_CHAR_COUNT : 0;
    if (selectedChar < customStart || destination < customStart || destination >= project.charset.characters.length) return;
    mutate(() => {
      [project.charset.characters[selectedChar], project.charset.characters[destination]] = [project.charset.characters[destination], project.charset.characters[selectedChar]];
      remapCharacterIndices(selectedChar, destination);
      selectedChar = destination;
      tilePaintChar = destination;
    });
  }

  function resizeAllTiles(width, height) {
    const oldWidth = project.tileWidth;
    const oldHeight = project.tileHeight;
    project.tiles.forEach(tile => {
      const chars = Array(width * height).fill(0);
      const colors = Array(width * height).fill(1);
      for (let y = 0; y < Math.min(height, oldHeight); y++) {
        for (let x = 0; x < Math.min(width, oldWidth); x++) {
          chars[y * width + x] = tile.chars[y * oldWidth + x];
          colors[y * width + x] = tile.colors[y * oldWidth + x];
        }
      }
      tile.chars = chars;
      tile.colors = colors;
    });
    project.tileWidth = width;
    project.tileHeight = height;
  }

  function drawTile(ctx, tile, x, y, width, height, bg = background) {
    ctx.fillStyle = COLORS[bg];
    ctx.fillRect(x, y, width, height);
    const charWidth = width / project.tileWidth;
    const charHeight = height / project.tileHeight;
    const charSize = Math.min(charWidth, charHeight);
    for (let ty = 0; ty < project.tileHeight; ty++) {
      for (let tx = 0; tx < project.tileWidth; tx++) {
        const index = ty * project.tileWidth + tx;
        const character = project.charset.characters[tile.chars[index]] || project.charset.characters[0];
        drawCharacter(ctx, character, x + tx * charWidth, y + ty * charHeight, charSize, COLORS[tile.colors[index] ?? 1], COLORS[bg]);
      }
    }
  }

  function makeTilePreview(tile, size = 72) {
    const ratio = project.tileWidth / project.tileHeight;
    const canvas = document.createElement("canvas");
    canvas.width = ratio >= 1 ? size : Math.max(1, Math.round(size * ratio));
    canvas.height = ratio <= 1 ? size : Math.max(1, Math.round(size / ratio));
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    drawTile(ctx, tile, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function renderTileLibrary(container, selected, onSelect) {
    container.replaceChildren();
    project.tiles.forEach((tile, index) => {
      const button = document.createElement("button");
      button.className = `asset-item${index === selected ? " selected" : ""}`;
      button.append(makeTilePreview(tile));
      const number = document.createElement("small");
      number.textContent = index;
      button.append(number);
      button.title = `Métatuile ${index} · collision ${tile.collision}`;
      button.addEventListener("click", () => onSelect(index));
      container.append(button);
    });
  }

  function renderTiles() {
    const tile = project.tiles[selectedTile];
    $("#tileWidth").value = project.tileWidth;
    $("#tileHeight").value = project.tileHeight;
    $("#tileDimensions").textContent = `${project.tileWidth} × ${project.tileHeight} caractère${project.tileWidth * project.tileHeight > 1 ? "s" : ""}`;
    $("#tileCount").textContent = `${project.tiles.length} / 256`;
    $("#tileCollision").value = tile.collision;
    if (document.activeElement !== $("#tileProperties")) $("#tileProperties").value = JSON.stringify(tile.properties, null, 2);
    $("#propertyError").textContent = "";

    const grid = $("#tileGrid");
    grid.replaceChildren();
    grid.style.gridTemplateColumns = `repeat(${project.tileWidth}, 72px)`;
    for (let index = 0; index < tile.chars.length; index++) {
      const button = document.createElement("button");
      button.className = "tile-cell";
      button.dataset.index = index;
      button.title = `Case ${index % project.tileWidth}, ${Math.floor(index / project.tileWidth)} · caractère ${tile.chars[index]} · couleur ${tile.colors[index]}`;
      button.append(makePreviewCanvas(project.charset.characters[tile.chars[index]], tile.colors[index], 64));
      button.addEventListener("click", () => mutate(() => {
        tile.chars[index] = tilePaintChar;
        tile.colors[index] = tilePaintColor;
      }));
      button.addEventListener("contextmenu", event => {
        event.preventDefault();
        mutate(() => { tile.chars[index] = 0; tile.colors[index] = tilePaintColor; });
      });
      grid.append(button);
    }
    renderCharacterLibrary($("#tileCharPicker"), tilePaintChar, index => { tilePaintChar = index; renderTiles(); });
    createPalette($("#tileColorPalette"), tilePaintColor, value => {
      if (project.charset.mode === "multicolor" && value > 7) return showToast("En mode multicolore, la couleur propre de la cellule est limitée à 0–7.");
      tilePaintColor = value; renderTiles();
    });
    renderTileLibrary($("#tileLibrary"), selectedTile, index => { selectedTile = index; renderAll(); });
  }

  function remapTileIndicesAfterDelete(deleted) {
    project.map.data = project.map.data.map(value => value === deleted ? 0 : value > deleted ? value - 1 : value);
  }

  function renderMap() {
    const canvas = $("#mapCanvas");
    const cellWidth = project.tileWidth * 8 * mapZoom;
    const cellHeight = project.tileHeight * 8 * mapZoom;
    canvas.width = project.map.width * cellWidth;
    canvas.height = project.map.height * cellHeight;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < project.map.height; y++) {
      for (let x = 0; x < project.map.width; x++) {
        const index = y * project.map.width + x;
        const tile = project.tiles[project.map.data[index]] || project.tiles[0];
        drawTile(ctx, tile, x * cellWidth, y * cellHeight, cellWidth, cellHeight);
        if ($("#showCollision").checked && tile.collision) {
          ctx.fillStyle = "rgba(255, 74, 98, .38)";
          ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
          ctx.fillStyle = "white";
          ctx.font = `${Math.max(9, Math.min(16, cellHeight / 2))}px monospace`;
          ctx.fillText(String(tile.collision), x * cellWidth + 3, y * cellHeight + Math.min(16, cellHeight - 2));
        }
      }
    }
    if ($("#showGrid").checked) {
      ctx.strokeStyle = "rgba(255,255,255,.22)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= project.map.width; x++) { ctx.moveTo(x * cellWidth + .5, 0); ctx.lineTo(x * cellWidth + .5, canvas.height); }
      for (let y = 0; y <= project.map.height; y++) { ctx.moveTo(0, y * cellHeight + .5); ctx.lineTo(canvas.width, y * cellHeight + .5); }
      ctx.stroke();
    }
    if (mapSelection) {
      const rect = normalizedRect(mapSelection.start, mapSelection.end);
      ctx.strokeStyle = COLORS[7];
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(rect.x * cellWidth + 1, rect.y * cellHeight + 1, rect.width * cellWidth - 2, rect.height * cellHeight - 2);
      ctx.setLineDash([]);
    }
    for (let index = 0; index < (project.map.objects || []).length; index++) {
      const object = project.map.objects[index];
      const cx = object.x * cellWidth + cellWidth / 2;
      const cy = object.y * cellHeight + cellHeight / 2;
      ctx.fillStyle = index === selectedObject ? COLORS[7] : COLORS[2];
      ctx.beginPath(); ctx.arc(cx, cy, Math.max(4, Math.min(cellWidth, cellHeight) * .28), 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "white"; ctx.font = `${Math.max(8, Math.min(12, cellHeight / 2))}px sans-serif`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(object.type.slice(0, 1).toUpperCase(), cx, cy);
    }
    ctx.textAlign = "start"; ctx.textBaseline = "alphabetic";

    $("#mapWidth").value = project.map.width;
    $("#mapHeight").value = project.map.height;
    $("#mapSizeLabel").textContent = `${project.map.width} × ${project.map.height}`;
    $("#mapPixelSize").textContent = `${project.map.width * project.tileWidth * 8} × ${project.map.height * project.tileHeight * 8} px`;
    $("#rleSizeLabel").textContent = `RLE : ${encodeRle(project.map.data).length} / ${project.map.data.length} octets`;
    $("#selectedTileLabel").textContent = `Tuile ${selectedTile}`;
    $("#selectionInfo").textContent = mapSelection ? selectionDescription() : "Aucune sélection";
    $("#copySelection").disabled = !mapSelection;
    $("#pasteSelection").disabled = !mapClipboard;
    renderTileLibrary($("#mapTilePicker"), selectedTile, index => { selectedTile = index; renderAll(); });
    renderObjectList();
  }

  function renderObjectList() {
    const list = $("#objectList");
    list.replaceChildren();
    (project.map.objects || []).forEach((object, index) => {
      const button = document.createElement("button");
      button.className = index === selectedObject ? "selected" : "";
      button.textContent = `${object.type} · ${object.x},${object.y}`;
      button.addEventListener("click", () => { selectedObject = index; renderMap(); });
      list.append(button);
    });
    const object = project.map.objects?.[selectedObject];
    $("#deleteObject").disabled = !object;
    if (object && document.activeElement !== $("#objectType")) $("#objectType").value = object.type;
    if (object && document.activeElement !== $("#objectProperties")) $("#objectProperties").value = JSON.stringify(object.properties || {}, null, 2);
  }

  function addMapObject(x, y) {
    let properties = {};
    try { properties = JSON.parse($("#objectProperties").value || "{}"); } catch (_) { return showToast("Les propriétés de l’objet ne sont pas un JSON valide."); }
    const type = $("#objectType").value.trim();
    if (!type) return showToast("Le type de l’objet est obligatoire.");
    mutate(() => {
      project.map.objects ??= [];
      project.map.objects.push({ type, x, y, properties });
      selectedObject = project.map.objects.length - 1;
    });
  }

  function mapCellFromEvent(event) {
    const canvas = $("#mapCanvas");
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((event.clientX - rect.left) / (project.tileWidth * 8 * mapZoom));
    const y = Math.floor((event.clientY - rect.top) / (project.tileHeight * 8 * mapZoom));
    if (x < 0 || y < 0 || x >= project.map.width || y >= project.map.height) return null;
    return { x, y };
  }

  function setMapCell(x, y, value) {
    project.map.data[y * project.map.width + x] = value;
  }

  function normalizedRect(start, end) {
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    return { x, y, width: Math.abs(start.x - end.x) + 1, height: Math.abs(start.y - end.y) + 1 };
  }

  function fillRectangle(start, end, value) {
    const rect = normalizedRect(start, end);
    for (let y = rect.y; y < rect.y + rect.height; y++) {
      for (let x = rect.x; x < rect.x + rect.width; x++) setMapCell(x, y, value);
    }
  }

  function floodFill(origin, replacement) {
    const target = project.map.data[origin.y * project.map.width + origin.x];
    if (target === replacement) return;
    const queue = [origin];
    const visited = new Set();
    while (queue.length) {
      const cell = queue.pop();
      const key = `${cell.x},${cell.y}`;
      if (visited.has(key) || cell.x < 0 || cell.y < 0 || cell.x >= project.map.width || cell.y >= project.map.height) continue;
      visited.add(key);
      const index = cell.y * project.map.width + cell.x;
      if (project.map.data[index] !== target) continue;
      project.map.data[index] = replacement;
      queue.push({ x: cell.x - 1, y: cell.y }, { x: cell.x + 1, y: cell.y }, { x: cell.x, y: cell.y - 1 }, { x: cell.x, y: cell.y + 1 });
    }
  }

  function selectionDescription() {
    const rect = normalizedRect(mapSelection.start, mapSelection.end);
    return `${rect.width} × ${rect.height} à (${rect.x}, ${rect.y})`;
  }

  function copySelection() {
    if (!mapSelection) return;
    const rect = normalizedRect(mapSelection.start, mapSelection.end);
    mapClipboard = { width: rect.width, height: rect.height, data: [] };
    for (let y = 0; y < rect.height; y++) {
      for (let x = 0; x < rect.width; x++) mapClipboard.data.push(project.map.data[(rect.y + y) * project.map.width + rect.x + x]);
    }
    $("#pasteSelection").disabled = false;
    showToast(`Sélection ${rect.width} × ${rect.height} copiée.`);
  }

  function pasteSelection() {
    if (!mapClipboard) return;
    const origin = mapSelection ? normalizedRect(mapSelection.start, mapSelection.end) : { x: 0, y: 0 };
    mutate(() => {
      for (let y = 0; y < mapClipboard.height; y++) {
        for (let x = 0; x < mapClipboard.width; x++) {
          if (origin.x + x < project.map.width && origin.y + y < project.map.height) {
            setMapCell(origin.x + x, origin.y + y, mapClipboard.data[y * mapClipboard.width + x]);
          }
        }
      }
    });
  }

  function validateAsset(asset) {
    const errors = [];
    const warnings = [];
    if (!asset || typeof asset !== "object" || Array.isArray(asset)) return { errors: ["Le document doit être un objet JSON."], warnings };
    const allowedTop = ["version", "charset", "tileWidth", "tileHeight", "tiles", "map"];
    Object.keys(asset).filter(key => !allowedTop.includes(key)).forEach(key => errors.push(`Champ racine inconnu : ${key}.`));
    if (asset.version !== 1) errors.push("version doit valoir 1.");
    if (!asset.charset || !["hires", "multicolor"].includes(asset.charset.mode)) errors.push("charset.mode doit valoir \"hires\" ou \"multicolor\".");
    const byteCharset = asset.charset?.bytes;
    const characters = asset.charset?.characters;
    const characterCount = Array.isArray(characters) ? characters.length : Array.isArray(byteCharset) ? byteCharset.length / 8 : 0;
    if (characters !== undefined && byteCharset !== undefined) errors.push("charset doit utiliser characters ou bytes, pas les deux.");
    if (byteCharset !== undefined && (!Array.isArray(byteCharset) || byteCharset.length < 8 || byteCharset.length > 2048 || byteCharset.length % 8 !== 0 || byteCharset.some(value => !Number.isInteger(value) || value < 0 || value > 255))) errors.push("charset.bytes doit contenir un multiple de 8 octets valides.");
    else if (!Array.isArray(characters) && byteCharset === undefined) errors.push("charset doit contenir characters ou bytes.");
    else if (Array.isArray(characters) && (characters.length < 1 || characters.length > 256)) errors.push("charset.characters doit contenir de 1 à 256 caractères.");
    else if (Array.isArray(characters)) characters.forEach((character, ci) => {
      if (!Array.isArray(character) || character.length !== 8 || character.some(value => !Number.isInteger(value) || value < 0 || value > 255)) errors.push(`Caractère ${ci} invalide : 8 octets attendus.`);
    });
    const tw = asset.tileWidth ?? 1;
    const th = asset.tileHeight ?? 1;
    if (!Number.isInteger(tw) || tw < 1 || tw > 8 || !Number.isInteger(th) || th < 1 || th > 8) errors.push("tileWidth et tileHeight doivent être compris entre 1 et 8.");
    if (!Array.isArray(asset.tiles) || asset.tiles.length < 1 || asset.tiles.length > 256) errors.push("tiles doit contenir de 1 à 256 métatuiles.");
    else asset.tiles.forEach((tile, ti) => {
      if (!tile || !Array.isArray(tile.chars) || tile.chars.length !== tw * th) errors.push(`Métatuile ${ti} : ${tw * th} indices de caractères attendus.`);
      else if (tile.chars.some(value => !Number.isInteger(value) || value < 0 || value >= characterCount)) errors.push(`Métatuile ${ti} : référence de caractère invalide.`);
      if (tile.colors !== undefined && (!Array.isArray(tile.colors) || tile.colors.length !== tw * th || tile.colors.some(value => !Number.isInteger(value) || value < 0 || value > 15))) errors.push(`Métatuile ${ti} : couleurs invalides.`);
      if (asset.charset?.mode === "multicolor" && tile.colors?.some(value => value > 7)) errors.push(`Métatuile ${ti} : en multicolore, les couleurs de cellule sont limitées à 0–7.`);
      if (tile.collision !== undefined && (!Number.isInteger(tile.collision) || tile.collision < 0 || tile.collision > 255)) errors.push(`Métatuile ${ti} : collision invalide.`);
      if (tile.properties !== undefined && (!tile.properties || typeof tile.properties !== "object" || Array.isArray(tile.properties))) errors.push(`Métatuile ${ti} : properties doit être un objet.`);
    });
    if (!asset.map || !Number.isInteger(asset.map.width) || asset.map.width < 1 || asset.map.width > 255 || !Number.isInteger(asset.map.height) || asset.map.height < 1 || asset.map.height > 255) errors.push("map.width et map.height doivent être compris entre 1 et 255.");
    else if (!Array.isArray(asset.map.data) || asset.map.data.length !== asset.map.width * asset.map.height) errors.push(`map.data doit contenir ${asset.map.width * asset.map.height} cases.`);
    else if (asset.map.data.some(value => !Number.isInteger(value) || value < 0 || value >= (asset.tiles?.length || 0))) errors.push("map.data contient une référence de métatuile invalide.");
    if (asset.map?.objects !== undefined && !Array.isArray(asset.map.objects)) errors.push("map.objects doit être un tableau.");
    else (asset.map?.objects || []).forEach((object, index) => {
      if (!object || typeof object.type !== "string" || !object.type || !Number.isInteger(object.x) || !Number.isInteger(object.y) || object.x < 0 || object.y < 0 || object.x >= asset.map.width || object.y >= asset.map.height || !object.properties || typeof object.properties !== "object" || Array.isArray(object.properties)) errors.push(`Objet ${index} invalide.`);
    });
    if (asset.map && asset.map.width * asset.map.height > 8192) errors.push("La map dépasse les 8192 cases disponibles dans la RAM dynamique actuelle.");
    if (asset.map && (asset.map.width * tw > 40 || asset.map.height * th > 25)) warnings.push("La map dépasse l’écran C64 de 40 × 25 caractères et nécessitera scrolling ou découpage.");
    if (Array.isArray(characters) && !hasSystemCharset(asset)) warnings.push("Le charset ne contient pas encore la zone système A–Z / 0–9 ; utilisez le bouton d’installation avant d’écrire du texte.");
    return { errors, warnings };
  }

  function renderValidation() {
    const { errors, warnings } = validateAsset(project);
    const badge = $("#validationBadge");
    const list = $("#validationList");
    list.replaceChildren();
    if (!errors.length && !warnings.length) {
      badge.className = "badge success";
      badge.textContent = "Valide";
      const item = document.createElement("li");
      item.textContent = "Compatible avec c64.assets.loadMap().";
      list.append(item);
      return;
    }
    badge.className = `badge ${errors.length ? "error" : "warning"}`;
    badge.textContent = errors.length ? `${errors.length} erreur${errors.length > 1 ? "s" : ""}` : "Attention";
    [...errors, ...warnings].slice(0, 6).forEach(message => {
      const item = document.createElement("li");
      item.textContent = `${errors.includes(message) ? "✕" : "!"} ${message}`;
      list.append(item);
    });
  }

  function renderAll() {
    clampSelections();
    renderCharset();
    renderTiles();
    if (currentView === "map") renderMap();
    renderValidation();
    updateContextHelp();
    updateHistoryButtons();
  }

  function resizeMap(width, height) {
    const old = project.map;
    const data = Array(width * height).fill(0);
    for (let y = 0; y < Math.min(height, old.height); y++) {
      for (let x = 0; x < Math.min(width, old.width); x++) data[y * width + x] = old.data[y * old.width + x];
    }
    project.map = { width, height, data, objects: (old.objects || []).filter(object => object.x < width && object.y < height) };
    mapSelection = null;
    selectedObject = -1;
  }

  function sanitizedName() {
    return ($("#projectName").value || "js-c64-map").trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "js-c64-map";
  }

  function download(content, filename, type) {
    const blob = content instanceof Uint8Array ? new Blob([content], { type }) : new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`${filename} exporté.`);
  }

  function exportJson() {
    const validation = validateAsset(project);
    if (validation.errors.length) return showToast("Export impossible : corrigez les erreurs signalées.");
    download(`${JSON.stringify(project, null, 2)}\n`, `${sanitizedName()}.json`, "application/json");
  }

  function exportBin() {
    const bytes = new Uint8Array(2048);
    project.charset.characters.forEach((character, index) => bytes.set(character, index * 8));
    download(bytes, `${sanitizedName()}-charset.bin`, "application/octet-stream");
  }

  function encodeRle(values) {
    const output = [];
    for (let index = 0; index < values.length;) {
      const value = values[index];
      let count = 1;
      while (index + count < values.length && values[index + count] === value && count < 255) count++;
      output.push(count, value);
      index += count;
    }
    return Uint8Array.from(output);
  }

  function exportMapBin() {
    download(Uint8Array.from(project.map.data), `${sanitizedName()}-map.bin`, "application/octet-stream");
  }

  function exportMapRle() {
    download(encodeRle(project.map.data), `${sanitizedName()}-map-rle.bin`, "application/octet-stream");
  }

  function exportJs() {
    download(`// Généré par JS-C64 Asset Studio v0.9\nexport default ${JSON.stringify(project, null, 2)};\n`, `${sanitizedName()}.js`, "text/javascript");
  }

  function asmBytes(values, perLine = 16) {
    const lines = [];
    for (let index = 0; index < values.length; index += perLine) {
      lines.push(`    .byte ${values.slice(index, index + perLine).map(value => `$${value.toString(16).padStart(2, "0").toUpperCase()}`).join(", ")}`);
    }
    return lines.join("\n");
  }

  function exportAsm() {
    const charset = project.charset.characters.flat();
    const tileChars = project.tiles.flatMap(tile => tile.chars);
    const tileColors = project.tiles.flatMap(tile => tile.colors);
    const collisions = project.tiles.map(tile => tile.collision);
    const objects = project.map.objects || [];
    const objectTypes = objects.map((object, index) => `; objet ${index}: ${object.type} ${JSON.stringify(object.properties || {})}`).join("\n");
    const source = `; Généré par JS-C64 Asset Studio v0.9\n; ${project.charset.characters.length} caractères, ${project.tiles.length} métatuiles, map ${project.map.width}x${project.map.height}\n\nasset_tile_width = ${project.tileWidth}\nasset_tile_height = ${project.tileHeight}\nasset_map_width = ${project.map.width}\nasset_map_height = ${project.map.height}\nasset_object_count = ${objects.length}\n\nasset_charset:\n${asmBytes(charset)}\n\nasset_tile_chars:\n${asmBytes(tileChars)}\n\nasset_tile_colors:\n${asmBytes(tileColors)}\n\nasset_tile_collisions:\n${asmBytes(collisions)}\n\nasset_map:\n${asmBytes(project.map.data)}\n\n${objectTypes}\nasset_object_x:\n${asmBytes(objects.map(object => object.x))}\nasset_object_y:\n${asmBytes(objects.map(object => object.y))}\n`;
    download(source, `${sanitizedName()}.asm`, "text/plain");
  }

  function importFile(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        const validation = validateAsset(imported);
        if (validation.errors.length) throw new Error(validation.errors.join(" "));
        const previous = snapshot();
        project = normalizeAsset(imported);
        let systemAdded = false;
        try { systemAdded = installSystemCharacters(project); } catch (_) { /* Le projet reste importable et affiche un avertissement. */ }
        if (systemAdded) { selectedChar = SYSTEM_CHAR_COUNT; tilePaintChar = selectedChar; }
        pushHistory(previous);
        clampSelections();
        persist();
        renderAll();
        showToast(systemAdded
          ? `${file.name} importé ; A–Z / 0–9 ajoutés et indices de tuiles remappés.`
          : `${file.name} importé sans perte.`);
      } catch (error) {
        showToast(`Import refusé : ${error.message}`);
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function bindEvents() {
    $$(".tab").forEach(button => button.addEventListener("click", () => setView(button.dataset.view)));
    $("#undo").addEventListener("click", undo);
    $("#redo").addEventListener("click", redo);
    $("#projectName").addEventListener("change", () => localStorage.setItem(`${STORAGE_KEY}-name`, $("#projectName").value));
    $("#textPreviewInput").addEventListener("input", renderTextPreview);
    $("#newProject").addEventListener("click", () => {
      if (!confirm("Créer un nouveau projet ? Le projet actuel reste récupérable avec Annuler.")) return;
      const previous = snapshot();
      project = starterProject();
      selectedChar = SYSTEM_CHAR_COUNT;
      tilePaintChar = selectedChar;
      pushHistory(previous);
      clampSelections();
      persist();
      renderAll();
    });
    $("#importProject").addEventListener("click", () => $("#fileInput").click());
    $("#fileInput").addEventListener("change", event => {
      if (event.target.files[0]) importFile(event.target.files[0]);
      event.target.value = "";
    });
    $("#exportJson").addEventListener("click", exportJson);
    $$('[data-export]').forEach(button => button.addEventListener("click", () => {
      ({ bin: exportBin, "map-bin": exportMapBin, "map-rle": exportMapRle, js: exportJs, asm: exportAsm })[button.dataset.export]();
      button.closest("details").removeAttribute("open");
    }));

    const pixelGrid = $("#pixelGrid");
    pixelGrid.addEventListener("contextmenu", event => event.preventDefault());
    pixelGrid.addEventListener("pointerdown", event => {
      const pixel = event.target.closest(".pixel");
      if (!pixel) return;
      event.preventDefault();
      drawing = true;
      drawValue = event.button === 2 ? 0 : (project.charset.mode === "multicolor" ? paintPixelValue : 1);
      beginLiveEdit();
      pixelGrid.setPointerCapture(event.pointerId);
      paintPixel(pixel, drawValue);
    });
    pixelGrid.addEventListener("pointermove", event => {
      if (!drawing) return;
      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".pixel");
      if (target && target.closest("#pixelGrid")) paintPixel(target, drawValue);
    });
    pixelGrid.addEventListener("pointerup", () => { drawing = false; endLiveEdit(); });
    pixelGrid.addEventListener("pointercancel", () => { drawing = false; endLiveEdit(); });
    $$('[data-transform]').forEach(button => button.addEventListener("click", () => transformCharacter(button.dataset.transform)));
    $("#charsetMode").addEventListener("change", event => mutate(() => {
      project.charset.mode = event.target.value;
      paintPixelValue = 1;
    }));
    $("#clearChar").addEventListener("click", () => {
      if (isSystemCharacter(selectedChar)) return;
      mutate(() => { project.charset.characters[selectedChar] = blankChar(); });
    });
    $("#copyChar").addEventListener("click", () => { charClipboard = [...project.charset.characters[selectedChar]]; showToast("Caractère copié."); });
    $("#pasteChar").addEventListener("click", () => { if (charClipboard && !isSystemCharacter(selectedChar)) mutate(() => { project.charset.characters[selectedChar] = [...charClipboard]; }); });
    $("#moveCharBack").addEventListener("click", () => moveCharacter(-1));
    $("#moveCharNext").addEventListener("click", () => moveCharacter(1));
    $("#addChar").addEventListener("click", () => {
      if (project.charset.characters.length >= 256) return showToast("Le format est limité à 256 caractères.");
      mutate(() => { project.charset.characters.push(blankChar()); selectedChar = project.charset.characters.length - 1; tilePaintChar = selectedChar; });
    });
    $("#duplicateChar").addEventListener("click", () => {
      if (project.charset.characters.length >= 256) return showToast("Le format est limité à 256 caractères.");
      mutate(() => {
        if (isSystemCharacter(selectedChar)) {
          project.charset.characters.push([...project.charset.characters[selectedChar]]);
          selectedChar = project.charset.characters.length - 1;
          tilePaintChar = selectedChar;
          return;
        }
        const inserted = selectedChar + 1;
        project.charset.characters.splice(inserted, 0, [...project.charset.characters[selectedChar]]);
        project.tiles.forEach(tile => { tile.chars = tile.chars.map(value => value >= inserted ? value + 1 : value); });
        selectedChar = inserted;
        tilePaintChar = selectedChar;
      });
    });
    $("#deleteChar").addEventListener("click", () => {
      if (isSystemCharacter(selectedChar)) return showToast("Les caractères système A–Z et 0–9 ne peuvent pas être supprimés.");
      if (project.charset.characters.length === 1) return showToast("Le charset doit garder au moins un caractère.");
      mutate(() => {
        project.charset.characters.splice(selectedChar, 1);
        project.tiles.forEach(tile => { tile.chars = tile.chars.map(value => value === selectedChar ? 0 : value > selectedChar ? value - 1 : value); });
        selectedChar = Math.min(selectedChar, project.charset.characters.length - 1);
        tilePaintChar = Math.min(tilePaintChar, project.charset.characters.length - 1);
      });
    });
    $("#installSystemCharset").addEventListener("click", () => {
      try {
        mutate(() => {
          if (hasSystemCharset(project)) {
            const system = createSystemCharset();
            for (let index = 0; index < SYSTEM_CHAR_COUNT; index++) project.charset.characters[index] = [...system[index]];
          } else {
            installSystemCharacters(project);
            selectedChar = SYSTEM_CHAR_COUNT;
            tilePaintChar = selectedChar;
          }
        });
        showToast("Alphabet C64 A–Z, espace et chiffres 0–9 prêts aux codes écran d’origine.");
      } catch (error) {
        showToast(error.message);
      }
    });

    $("#resizeTiles").addEventListener("click", () => {
      const width = Number($("#tileWidth").value);
      const height = Number($("#tileHeight").value);
      if (!Number.isInteger(width) || width < 1 || width > 8 || !Number.isInteger(height) || height < 1 || height > 8) return showToast("La taille doit être comprise entre 1 et 8.");
      mutate(() => resizeAllTiles(width, height));
    });
    $("#tileCollision").addEventListener("change", event => {
      const value = Number(event.target.value);
      if (Number.isInteger(value) && value >= 0 && value <= 255) mutate(() => { project.tiles[selectedTile].collision = value; });
    });
    $("#tileProperties").addEventListener("change", event => {
      try {
        const value = JSON.parse(event.target.value);
        if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Un objet JSON est attendu.");
        mutate(() => { project.tiles[selectedTile].properties = value; });
      } catch (error) {
        $("#propertyError").textContent = error.message;
      }
    });
    $("#addTile").addEventListener("click", () => {
      if (project.tiles.length >= 256) return showToast("Le format est limité à 256 métatuiles.");
      mutate(() => {
        const count = project.tileWidth * project.tileHeight;
        project.tiles.push({ chars: Array(count).fill(0), colors: Array(count).fill(1), collision: 0, properties: {} });
        selectedTile = project.tiles.length - 1;
      });
    });
    $("#duplicateTile").addEventListener("click", () => {
      if (project.tiles.length >= 256) return showToast("Le format est limité à 256 métatuiles.");
      mutate(() => {
        const inserted = selectedTile + 1;
        project.tiles.splice(inserted, 0, clone(project.tiles[selectedTile]));
        project.map.data = project.map.data.map(value => value >= inserted ? value + 1 : value);
        selectedTile = inserted;
      });
    });
    $("#deleteTile").addEventListener("click", () => {
      if (project.tiles.length === 1) return showToast("Le projet doit garder au moins une métatuile.");
      mutate(() => {
        project.tiles.splice(selectedTile, 1);
        remapTileIndicesAfterDelete(selectedTile);
        selectedTile = Math.min(selectedTile, project.tiles.length - 1);
      });
    });

    $$(".tool").forEach(button => button.addEventListener("click", () => {
      mapTool = button.dataset.tool;
      $$(".tool").forEach(item => item.classList.toggle("active", item === button));
    }));
    $("#showGrid").addEventListener("change", renderMap);
    $("#showCollision").addEventListener("change", renderMap);
    $("#mapZoom").addEventListener("input", event => { mapZoom = Number(event.target.value); renderMap(); });
    $("#resizeMap").addEventListener("click", () => {
      const width = Number($("#mapWidth").value);
      const height = Number($("#mapHeight").value);
      if (!Number.isInteger(width) || width < 1 || width > 255 || !Number.isInteger(height) || height < 1 || height > 255) return showToast("Largeur et hauteur doivent être comprises entre 1 et 255.");
      mutate(() => resizeMap(width, height));
    });
    $("#copySelection").addEventListener("click", copySelection);
    $("#pasteSelection").addEventListener("click", pasteSelection);
    $("#addObject").addEventListener("click", () => addMapObject(Math.floor(project.map.width / 2), Math.floor(project.map.height / 2)));
    $("#deleteObject").addEventListener("click", () => {
      if (selectedObject < 0) return;
      mutate(() => { project.map.objects.splice(selectedObject, 1); selectedObject = -1; });
    });
    $("#objectType").addEventListener("change", event => {
      if (selectedObject < 0 || !event.target.value.trim()) return;
      mutate(() => { project.map.objects[selectedObject].type = event.target.value.trim(); });
    });
    $("#objectProperties").addEventListener("change", event => {
      if (selectedObject < 0) return;
      try {
        const properties = JSON.parse(event.target.value || "{}");
        if (!properties || typeof properties !== "object" || Array.isArray(properties)) throw new Error();
        mutate(() => { project.map.objects[selectedObject].properties = properties; });
      } catch (_) { showToast("Les propriétés de l’objet doivent former un objet JSON."); }
    });

    const mapCanvas = $("#mapCanvas");
    mapCanvas.addEventListener("contextmenu", event => event.preventDefault());
    mapCanvas.addEventListener("pointerdown", event => {
      const cell = mapCellFromEvent(event);
      if (!cell) return;
      event.preventDefault();
      pointerStart = cell;
      drawing = true;
      drawValue = event.button === 2 ? 0 : selectedTile;
      mapCanvas.setPointerCapture(event.pointerId);
      if (["pencil", "eraser"].includes(mapTool)) {
        beginLiveEdit();
        if (mapTool === "eraser") drawValue = 0;
        setMapCell(cell.x, cell.y, drawValue);
        renderMap();
      } else if (mapTool === "fill") {
        mutate(() => floodFill(cell, selectedTile));
        drawing = false;
      } else if (mapTool === "picker") {
        selectedTile = project.map.data[cell.y * project.map.width + cell.x];
        drawing = false;
        renderAll();
      } else if (mapTool === "select") {
        mapSelection = { start: cell, end: cell };
        renderMap();
      } else if (mapTool === "object") {
        const existing = (project.map.objects || []).findIndex(object => object.x === cell.x && object.y === cell.y);
        if (existing >= 0) { selectedObject = existing; drawing = false; renderMap(); }
        else { drawing = false; addMapObject(cell.x, cell.y); }
      }
    });
    mapCanvas.addEventListener("pointermove", event => {
      const cell = mapCellFromEvent(event);
      $("#cursorPosition").textContent = cell ? `x: ${cell.x} · y: ${cell.y} · tuile: ${project.map.data[cell.y * project.map.width + cell.x]}` : "x: — · y: —";
      if (!drawing || !cell) return;
      if (["pencil", "eraser"].includes(mapTool)) {
        setMapCell(cell.x, cell.y, drawValue);
        renderMap();
      } else if (mapTool === "select") {
        mapSelection.end = cell;
        renderMap();
      }
    });
    mapCanvas.addEventListener("pointerleave", () => { $("#cursorPosition").textContent = "x: — · y: —"; });
    mapCanvas.addEventListener("pointerup", event => {
      if (!drawing) return;
      const cell = mapCellFromEvent(event) || pointerStart;
      if (mapTool === "rect") mutate(() => fillRectangle(pointerStart, cell, drawValue));
      else if (["pencil", "eraser"].includes(mapTool)) endLiveEdit();
      else if (mapTool === "select") { mapSelection.end = cell; renderMap(); }
      drawing = false;
      pointerStart = null;
    });
    mapCanvas.addEventListener("pointercancel", () => { drawing = false; pointerStart = null; endLiveEdit(); });

    document.addEventListener("keydown", event => {
      const editingText = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") { event.preventDefault(); event.shiftKey ? redo() : undo(); }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") { event.preventDefault(); redo(); }
      if (!editingText && currentView === "map" && event.key === "Escape") { mapSelection = null; renderMap(); }
    });
  }

  function init() {
    bindEvents();
    $("#projectName").value = localStorage.getItem(`${STORAGE_KEY}-name`) || "ma-map-c64";
    const requestedView = location.hash.slice(1);
    setView(["charset", "tiles", "map"].includes(requestedView) ? requestedView : "charset");
    persist();
    renderAll();
  }

  init();
})();
