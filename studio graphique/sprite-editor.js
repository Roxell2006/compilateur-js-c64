(function () {
  "use strict";

  const Core = globalThis.JsC64SpriteAsset;
  if (!Core) throw new Error("sprite-asset-core.js doit etre charge avant sprite-editor.js");

  const COLORS = [
    "#000000", "#ffffff", "#813338", "#75cec8",
    "#8e3c97", "#56ac4d", "#2e2c9b", "#edf171",
    "#8e5029", "#553800", "#c46c71", "#4a4a4a",
    "#7b7b7b", "#a9ff9f", "#706deb", "#b2b2b2"
  ];
  const STORAGE_KEY = "js-c64-asset-studio-sprites-v1";
  const $ = selector => document.querySelector(selector);
  const clone = value => JSON.parse(JSON.stringify(value));
  const framePattern = /^[A-Za-z_][A-Za-z0-9_-]*$/;
  let assets = loadAssets();
  let selectedAsset = 0;
  let selectedFrame = 0;
  let selectedAnimation = Object.keys(assets[0].animations)[0] || "";
  let paintValue = 1;
  let drawing = false;
  let previewFrame = 0;
  let previewTick = 0;

  function loadAssets() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!Array.isArray(parsed) || !parsed.length) throw new Error();
      const normalized = parsed.map(Core.normalizeSprite);
      if (normalized.some(sprite => Core.validateSprite(sprite).length)) throw new Error();
      return normalized;
    } catch (_) {
      return [Core.createSprite("hero")];
    }
  }

  function asset() { return assets[selectedAsset]; }
  function frame() { return asset().frames[selectedFrame]; }

  function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
    document.dispatchEvent(new CustomEvent("assetstudio:sprites-changed", { detail: clone(assets) }));
  }

  function show(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("visible");
    clearTimeout(show.timer);
    show.timer = setTimeout(() => toast.classList.remove("visible"), 2600);
  }

  function mutate(change) {
    change();
    selectedAsset = Math.max(0, Math.min(selectedAsset, assets.length - 1));
    selectedFrame = Math.max(0, Math.min(selectedFrame, asset().frames.length - 1));
    persist();
    render();
  }

  function uniqueName(base, used) {
    const safe = String(base || "asset").replace(/[^A-Za-z0-9_-]/g, "_").replace(/^[^A-Za-z_]/, "_$&") || "asset";
    let result = safe;
    let suffix = 2;
    while (used.has(result)) result = `${safe}_${suffix++}`;
    return result;
  }

  function createPalette(container, selected, onSelect) {
    container.replaceChildren();
    COLORS.forEach((color, index) => {
      const button = document.createElement("button");
      button.className = `swatch${index === selected ? " selected" : ""}`;
      button.style.background = color;
      button.title = `Couleur C64 ${index}`;
      button.addEventListener("click", () => onSelect(index));
      container.append(button);
    });
  }

  function pixelColor(sprite, value) {
    if (!value) return COLORS[0];
    if (sprite.mode === "hires") return COLORS[sprite.color];
    return COLORS[[0, sprite.multicolor1, sprite.multicolor2, sprite.color][value]];
  }

  function drawSprite(canvas, sprite, sourceFrame, overlay = false) {
    const ctx = canvas.getContext("2d");
    const scaleX = canvas.width / 24;
    const scaleY = canvas.height / 21;
    const logicalWidth = sprite.mode === "multicolor" ? 12 : 24;
    const physicalWidth = sprite.mode === "multicolor" ? 2 : 1;
    const flip = overlay && $("#spriteFlipPreview").checked;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = COLORS[0];
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < logicalWidth; x++) {
        const value = Core.pixelValue(sourceFrame, x, y, sprite.mode);
        if (!value) continue;
        const physicalX = x * physicalWidth;
        const drawnX = flip ? 24 - physicalX - physicalWidth : physicalX;
        ctx.fillStyle = pixelColor(sprite, value);
        ctx.fillRect(drawnX * scaleX, y * scaleY, physicalWidth * scaleX, scaleY);
      }
    }
    if (!overlay) return;
    const hitbox = sprite.hitbox;
    const boxX = flip ? 24 - hitbox.offsetX - hitbox.width : hitbox.offsetX;
    const originX = flip ? 23 - sprite.origin.x : sprite.origin.x;
    ctx.strokeStyle = "#ff6d7a";
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(boxX * scaleX + 1, hitbox.offsetY * scaleY + 1, hitbox.width * scaleX - 2, hitbox.height * scaleY - 2);
    ctx.setLineDash([]);
    ctx.strokeStyle = "#52dec4";
    ctx.beginPath();
    ctx.moveTo(originX * scaleX, sprite.origin.y * scaleY - 7);
    ctx.lineTo(originX * scaleX, sprite.origin.y * scaleY + 7);
    ctx.moveTo(originX * scaleX - 7, sprite.origin.y * scaleY);
    ctx.lineTo(originX * scaleX + 7, sprite.origin.y * scaleY);
    ctx.stroke();
  }

  function animationFrames(sprite) {
    const animation = sprite.animations[selectedAnimation];
    if (!animation) return [selectedFrame];
    return animation.frames.map(reference => typeof reference === "number"
      ? reference
      : sprite.frames.findIndex(item => item.id === reference)).filter(index => index >= 0);
  }

  function drawAnimatedPreview() {
    const sprite = asset();
    const frames = animationFrames(sprite);
    const index = frames[previewFrame % Math.max(1, frames.length)] ?? selectedFrame;
    drawSprite($("#spritePreview"), sprite, sprite.frames[index], true);
  }

  function renderGrid() {
    const sprite = asset();
    const sourceFrame = frame();
    const width = sprite.mode === "multicolor" ? 12 : 24;
    const grid = $("#spritePixelGrid");
    grid.replaceChildren();
    grid.classList.toggle("multicolor", sprite.mode === "multicolor");
    for (let y = 0; y < 21; y++) {
      for (let x = 0; x < width; x++) {
        const value = Core.pixelValue(sourceFrame, x, y, sprite.mode);
        const pixel = document.createElement("button");
        pixel.className = "sprite-pixel";
        pixel.dataset.x = x;
        pixel.dataset.y = y;
        pixel.dataset.value = value;
        pixel.style.background = pixelColor(sprite, value);
        pixel.setAttribute("aria-label", `Pixel ${x}, ${y}, valeur ${value}`);
        grid.append(pixel);
      }
    }
    const values = $("#spritePixelValues");
    values.replaceChildren();
    const maximum = sprite.mode === "multicolor" ? 3 : 1;
    for (let value = 0; value <= maximum; value++) {
      const button = document.createElement("button");
      button.className = `button ghost${paintValue === value ? " selected" : ""}`;
      button.textContent = value === 0 ? "Effacer" : `Couleur ${value}`;
      button.style.borderColor = pixelColor(sprite, value);
      button.addEventListener("click", () => { paintValue = value; renderGrid(); });
      values.append(button);
    }
  }

  function renderFrameLibrary() {
    const library = $("#spriteFrameLibrary");
    library.replaceChildren();
    asset().frames.forEach((item, index) => {
      const button = document.createElement("button");
      button.className = `sprite-frame-item${index === selectedFrame ? " selected" : ""}`;
      const canvas = document.createElement("canvas");
      canvas.width = 48; canvas.height = 42;
      drawSprite(canvas, asset(), item);
      const label = document.createElement("small");
      label.textContent = item.id;
      button.append(canvas, label);
      button.addEventListener("click", () => { selectedFrame = index; previewFrame = 0; render(); });
      library.append(button);
    });
    $("#spriteFrameCount").textContent = `${asset().frames.length} / 128`;
    $("#spriteFrameId").value = frame().id;
    $("#spriteFrameHeading").textContent = `Frame ${frame().id}`;
    $("#deleteSpriteFrame").disabled = asset().frames.length === 1;
    $("#moveSpriteFrameBack").disabled = selectedFrame === 0;
    $("#moveSpriteFrameNext").disabled = selectedFrame === asset().frames.length - 1;
  }

  function renderAnimations() {
    const names = Object.keys(asset().animations);
    if (!names.includes(selectedAnimation)) selectedAnimation = names[0] || "";
    const select = $("#spriteAnimationSelect");
    select.replaceChildren();
    if (!names.length) select.append(new Option("Aucune animation", ""));
    names.forEach(name => select.append(new Option(name, name)));
    select.value = selectedAnimation;
    const animation = asset().animations[selectedAnimation];
    $("#spriteAnimationName").value = selectedAnimation;
    $("#spriteAnimationFrames").value = animation?.frames.map(reference => typeof reference === "number" ? asset().frames[reference]?.id : reference).join(", ") || "";
    $("#spriteAnimationSpeed").value = animation?.speed ?? 6;
    $("#spriteAnimationLoop").checked = animation?.loop ?? true;
    $("#spriteAnimationInitial").checked = asset().initialAnimation === selectedAnimation;
    $("#deleteSpriteAnimation").disabled = !animation;
  }

  function renderAssociation() {
    const spriteSelect = $("#objectSpriteAsset");
    const current = $("#objectSprite").value.trim();
    spriteSelect.replaceChildren(new Option("Aucun / saisie libre", ""));
    assets.forEach(sprite => spriteSelect.append(new Option(sprite.id, sprite.id)));
    spriteSelect.value = assets.some(sprite => sprite.id === current) ? current : "";
    const selected = assets.find(sprite => sprite.id === current);
    const animationSelect = $("#objectSpriteAnimation");
    let currentAnimation = "";
    try { currentAnimation = JSON.parse($("#objectProperties").value || "{}").animation || ""; } catch (_) { /* main.js affichera l'erreur. */ }
    animationSelect.replaceChildren(new Option("Selon l'asset", ""));
    Object.keys(selected?.animations || {}).forEach(name => animationSelect.append(new Option(name, name)));
    animationSelect.value = Object.hasOwn(selected?.animations || {}, currentAnimation) ? currentAnimation : "";
    animationSelect.disabled = !selected;
  }

  function renderValidation() {
    const errors = Core.validateSprite(asset());
    const badge = $("#spriteValidationBadge");
    badge.className = `badge ${errors.length ? "error" : "success"}`;
    badge.textContent = errors.length ? `${errors.length} erreur${errors.length > 1 ? "s" : ""}` : "Valide";
    $("#spriteValidationText").textContent = errors[0] || "Compatible avec c64.assets.loadSprite().";
  }

  function render() {
    const sprite = asset();
    const selector = $("#spriteAssetSelect");
    selector.replaceChildren();
    assets.forEach((item, index) => selector.append(new Option(item.id, String(index))));
    selector.value = String(selectedAsset);
    if (document.activeElement !== $("#spriteId")) $("#spriteId").value = sprite.id;
    $("#spriteMode").value = sprite.mode;
    $("#spriteMulticolorControls").hidden = sprite.mode !== "multicolor";
    $("#deleteSpriteAsset").disabled = assets.length === 1;
    renderGrid();
    renderFrameLibrary();
    renderAnimations();
    createPalette($("#spriteColorPalette"), sprite.color, value => mutate(() => { sprite.color = value; }));
    if (sprite.mode === "multicolor") {
      createPalette($("#spriteMulticolor1Palette"), sprite.multicolor1, value => mutate(() => { sprite.multicolor1 = value; }));
      createPalette($("#spriteMulticolor2Palette"), sprite.multicolor2, value => mutate(() => { sprite.multicolor2 = value; }));
    }
    $("#spriteOriginX").value = sprite.origin.x;
    $("#spriteOriginY").value = sprite.origin.y;
    $("#spriteHitboxX").value = sprite.hitbox.offsetX;
    $("#spriteHitboxY").value = sprite.hitbox.offsetY;
    $("#spriteHitboxWidth").value = sprite.hitbox.width;
    $("#spriteHitboxHeight").value = sprite.hitbox.height;
    renderValidation();
    renderAssociation();
    previewFrame = 0;
    previewTick = 0;
    drawAnimatedPreview();
  }

  function downloadSprite() {
    const errors = Core.validateSprite(asset());
    if (errors.length) return show(`Export impossible : ${errors[0]}`);
    const blob = new Blob([`${JSON.stringify(asset(), null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${asset().id}.sprite.json`;
    document.body.append(anchor);
    anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    show(`${asset().id}.sprite.json exporte.`);
  }

  function importSprite(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = Core.normalizeSprite(JSON.parse(reader.result));
        const errors = Core.validateSprite(imported);
        if (errors.length) throw new Error(errors.join(" "));
        const existing = assets.findIndex(item => item.id === imported.id);
        if (existing >= 0) {
          if (!confirm(`Remplacer le sprite ${imported.id} ?`)) return;
          assets[existing] = imported;
          selectedAsset = existing;
        } else {
          assets.push(imported);
          selectedAsset = assets.length - 1;
        }
        selectedFrame = 0;
        selectedAnimation = imported.initialAnimation || Object.keys(imported.animations)[0] || "";
        persist(); render();
        show(`${file.name} importe sans perte.`);
      } catch (error) { show(`Import refuse : ${error.message}`); }
    };
    reader.readAsText(file, "utf-8");
  }

  function projectValidators() {
    return {
      validateMap: value => globalThis.JsC64MapStudio.validateProject(value),
      validateSprite: value => Core.validateSprite(value)
    };
  }

  function replaceAssets(values) {
    if (!Array.isArray(values) || !values.length) throw new Error("Le projet doit contenir au moins un sprite.");
    const normalized = values.map(Core.normalizeSprite);
    const ids = new Set();
    normalized.forEach((sprite, index) => {
      const errors = Core.validateSprite(sprite);
      if (errors.length) throw new Error(`Sprite ${index}: ${errors.join(" ")}`);
      if (ids.has(sprite.id)) throw new Error(`Identifiant de sprite duplique : ${sprite.id}.`);
      ids.add(sprite.id);
    });
    assets = normalized;
    selectedAsset = 0;
    selectedFrame = 0;
    selectedAnimation = assets[0].initialAnimation || Object.keys(assets[0].animations)[0] || "";
    persist();
    render();
  }

  function exportStudioProject() {
    const Project = globalThis.JsC64StudioProject;
    const MapStudio = globalThis.JsC64MapStudio;
    if (!Project || !MapStudio) return show("Le module de projet studio n'est pas disponible.");
    const bundle = Project.createBundle(MapStudio.getName(), MapStudio.getProject(), assets);
    const errors = Project.validateBundle(bundle, projectValidators());
    if (errors.length) return show(`Export impossible : ${errors[0]}`);
    const blob = new Blob([`${JSON.stringify(bundle, null, 2)}\n`], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    const safeName = bundle.name.trim().replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "") || "projet-c64";
    anchor.download = `${safeName}.studio.json`;
    document.body.append(anchor);
    anchor.click(); anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("#exportStudioProject").closest("details")?.removeAttribute("open");
    show(`${safeName}.studio.json exporte sans modifier les assets.`);
  }

  function importStudioProject(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const Project = globalThis.JsC64StudioProject;
        const bundle = Project.parseBundle(reader.result, projectValidators());
        if (!confirm(`Remplacer le projet courant par ${bundle.name} ?`)) return;
        globalThis.JsC64MapStudio.replaceProject(bundle.map, bundle.name);
        replaceAssets(bundle.sprites);
        $("#importStudioProject").closest("details")?.removeAttribute("open");
        show(`${file.name} importe : map, charset, sprites et references restaures.`);
      } catch (error) { show(`Import de projet refuse : ${error.message}`); }
    };
    reader.readAsText(file, "utf-8");
  }

  function updateBounds() {
    mutate(() => {
      const sprite = asset();
      sprite.origin.x = Number($("#spriteOriginX").value);
      sprite.origin.y = Number($("#spriteOriginY").value);
      sprite.hitbox.offsetX = Number($("#spriteHitboxX").value);
      sprite.hitbox.offsetY = Number($("#spriteHitboxY").value);
      sprite.hitbox.width = Number($("#spriteHitboxWidth").value);
      sprite.hitbox.height = Number($("#spriteHitboxHeight").value);
    });
  }

  function bindEvents() {
    document.querySelector('[data-view="sprites"]').addEventListener("click", render);
    $("#spriteAssetSelect").addEventListener("change", event => {
      selectedAsset = Number(event.target.value); selectedFrame = 0;
      selectedAnimation = asset().initialAnimation || Object.keys(asset().animations)[0] || ""; render();
    });
    $("#newSpriteAsset").addEventListener("click", () => mutate(() => {
      const id = uniqueName("sprite", new Set(assets.map(item => item.id)));
      assets.push(Core.createSprite(id)); selectedAsset = assets.length - 1; selectedFrame = 0; selectedAnimation = "idle";
    }));
    $("#duplicateSpriteAsset").addEventListener("click", () => mutate(() => {
      const copy = clone(asset());
      copy.id = uniqueName(`${copy.id}_copy`, new Set(assets.map(item => item.id)));
      assets.splice(selectedAsset + 1, 0, copy); selectedAsset++; selectedFrame = 0;
    }));
    $("#deleteSpriteAsset").addEventListener("click", () => {
      if (assets.length === 1 || !confirm(`Supprimer le sprite ${asset().id} ?`)) return;
      mutate(() => { assets.splice(selectedAsset, 1); selectedAsset = Math.min(selectedAsset, assets.length - 1); selectedFrame = 0; });
    });
    $("#spriteId").addEventListener("change", event => {
      const id = event.target.value.trim();
      if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(id) || id.length > 64 || assets.some((item, index) => index !== selectedAsset && item.id === id)) return show("Identifiant de sprite invalide ou deja utilise.");
      mutate(() => { asset().id = id; });
    });
    $("#spriteMode").addEventListener("change", event => mutate(() => {
      asset().mode = event.target.value;
      if (asset().mode === "multicolor") { asset().multicolor1 ??= 5; asset().multicolor2 ??= 10; }
      paintValue = 1;
    }));
    $("#importSpriteAsset").addEventListener("click", () => $("#spriteFileInput").click());
    $("#spriteFileInput").addEventListener("change", event => { if (event.target.files[0]) importSprite(event.target.files[0]); event.target.value = ""; });
    $("#exportSpriteAsset").addEventListener("click", downloadSprite);
    $("#exportStudioProject").addEventListener("click", exportStudioProject);
    $("#importStudioProject").addEventListener("click", () => $("#studioProjectFileInput").click());
    $("#studioProjectFileInput").addEventListener("change", event => {
      if (event.target.files[0]) importStudioProject(event.target.files[0]);
      event.target.value = "";
    });

    const grid = $("#spritePixelGrid");
    grid.addEventListener("contextmenu", event => event.preventDefault());
    grid.addEventListener("pointerdown", event => {
      const pixel = event.target.closest(".sprite-pixel");
      if (!pixel) return;
      event.preventDefault(); drawing = true; grid.setPointerCapture(event.pointerId);
      const value = event.button === 2 ? 0 : paintValue;
      Core.setPixelValue(frame(), Number(pixel.dataset.x), Number(pixel.dataset.y), value, asset().mode);
      persist(); renderGrid(); drawAnimatedPreview();
    });
    grid.addEventListener("pointermove", event => {
      if (!drawing) return;
      const pixel = document.elementFromPoint(event.clientX, event.clientY)?.closest(".sprite-pixel");
      if (!pixel || !pixel.closest("#spritePixelGrid")) return;
      Core.setPixelValue(frame(), Number(pixel.dataset.x), Number(pixel.dataset.y), paintValue, asset().mode);
      pixel.style.background = pixelColor(asset(), paintValue); drawAnimatedPreview();
    });
    const finishDraw = () => { if (!drawing) return; drawing = false; persist(); render(); };
    grid.addEventListener("pointerup", finishDraw); grid.addEventListener("pointercancel", finishDraw);
    $("#clearSpriteFrame").addEventListener("click", () => mutate(() => { frame().data.fill(0); }));
    $("#mirrorSpriteFrame").addEventListener("click", () => mutate(() => {
      const width = asset().mode === "multicolor" ? 12 : 24;
      const values = Array.from({ length: 21 }, (_, y) => Array.from({ length: width }, (_, x) => Core.pixelValue(frame(), x, y, asset().mode)));
      for (let y = 0; y < 21; y++) for (let x = 0; x < width; x++) Core.setPixelValue(frame(), x, y, values[y][width - 1 - x], asset().mode);
    }));
    $("#spriteFlipPreview").addEventListener("change", drawAnimatedPreview);

    $("#addSpriteFrame").addEventListener("click", () => {
      if (asset().frames.length >= 128) return show("Un sprite est limite a 128 frames.");
      mutate(() => { const id = uniqueName("frame", new Set(asset().frames.map(item => item.id))); asset().frames.push(Core.blankFrame(id)); selectedFrame = asset().frames.length - 1; });
    });
    $("#duplicateSpriteFrame").addEventListener("click", () => {
      if (asset().frames.length >= 128) return show("Un sprite est limite a 128 frames.");
      mutate(() => { const copy = clone(frame()); copy.id = uniqueName(`${copy.id}_copy`, new Set(asset().frames.map(item => item.id))); asset().frames.splice(selectedFrame + 1, 0, copy); selectedFrame++; });
    });
    $("#deleteSpriteFrame").addEventListener("click", () => {
      if (asset().frames.length === 1) return;
      mutate(() => {
        const removed = frame().id; asset().frames.splice(selectedFrame, 1);
        Object.keys(asset().animations).forEach(name => {
          asset().animations[name].frames = asset().animations[name].frames.filter(reference => reference !== removed);
          if (!asset().animations[name].frames.length) delete asset().animations[name];
        });
        if (!Object.hasOwn(asset().animations, asset().initialAnimation)) asset().initialAnimation = Object.keys(asset().animations)[0];
      });
    });
    $("#spriteFrameId").addEventListener("change", event => {
      const id = event.target.value.trim(); const old = frame().id;
      if (!framePattern.test(id) || id.length > 64 || asset().frames.some((item, index) => index !== selectedFrame && item.id === id)) return show("Nom de frame invalide ou deja utilise.");
      mutate(() => { frame().id = id; Object.values(asset().animations).forEach(animation => { animation.frames = animation.frames.map(reference => reference === old ? id : reference); }); });
    });
    const moveFrame = delta => mutate(() => { const next = selectedFrame + delta; [asset().frames[selectedFrame], asset().frames[next]] = [asset().frames[next], asset().frames[selectedFrame]]; selectedFrame = next; });
    $("#moveSpriteFrameBack").addEventListener("click", () => moveFrame(-1));
    $("#moveSpriteFrameNext").addEventListener("click", () => moveFrame(1));

    $("#spriteAnimationSelect").addEventListener("change", event => { selectedAnimation = event.target.value; previewFrame = 0; renderAnimations(); drawAnimatedPreview(); });
    $("#newSpriteAnimation").addEventListener("click", () => mutate(() => {
      selectedAnimation = uniqueName("animation", new Set(Object.keys(asset().animations)));
      asset().animations[selectedAnimation] = { frames: [frame().id], speed: 6, loop: true };
      asset().initialAnimation ??= selectedAnimation;
    }));
    $("#saveSpriteAnimation").addEventListener("click", () => {
      const old = selectedAnimation;
      const name = $("#spriteAnimationName").value.trim();
      const frames = $("#spriteAnimationFrames").value.split(",").map(item => item.trim()).filter(Boolean);
      const speed = Number($("#spriteAnimationSpeed").value);
      if (!framePattern.test(name) || name.length > 64 || (name !== old && Object.hasOwn(asset().animations, name))) return show("Nom d'animation invalide ou deja utilise.");
      if (!frames.length || frames.some(id => !asset().frames.some(item => item.id === id))) return show("Toutes les frames de l'animation doivent exister.");
      if (!Number.isInteger(speed) || speed < 1 || speed > 255) return show("La vitesse doit etre comprise entre 1 et 255.");
      mutate(() => {
        if (old && old !== name) delete asset().animations[old];
        asset().animations[name] = { frames, speed, loop: $("#spriteAnimationLoop").checked };
        if ($("#spriteAnimationInitial").checked || asset().initialAnimation === old) asset().initialAnimation = name;
        selectedAnimation = name;
      });
    });
    $("#deleteSpriteAnimation").addEventListener("click", () => {
      if (!selectedAnimation) return;
      mutate(() => { delete asset().animations[selectedAnimation]; selectedAnimation = Object.keys(asset().animations)[0] || ""; asset().initialAnimation = selectedAnimation || undefined; });
    });

    ["#spriteOriginX", "#spriteOriginY", "#spriteHitboxX", "#spriteHitboxY", "#spriteHitboxWidth", "#spriteHitboxHeight"].forEach(selector => $(selector).addEventListener("change", updateBounds));

    $("#objectSpriteAsset").addEventListener("change", event => {
      $("#objectSprite").value = event.target.value;
      $("#objectSprite").dispatchEvent(new Event("change", { bubbles: true }));
      renderAssociation();
    });
    $("#objectSpriteAnimation").addEventListener("change", event => {
      try {
        const properties = JSON.parse($("#objectProperties").value || "{}");
        if (event.target.value) properties.animation = event.target.value; else delete properties.animation;
        $("#objectProperties").value = JSON.stringify(properties, null, 2);
        $("#objectProperties").dispatchEvent(new Event("change", { bubbles: true }));
      } catch (_) { show("Corrigez d'abord les proprietes JSON de l'objet."); }
    });
    $("#objectList").addEventListener("click", () => setTimeout(renderAssociation));
    document.querySelector('[data-view="map"]').addEventListener("click", () => setTimeout(renderAssociation));
  }

  globalThis.JsC64SpriteStudio = Object.freeze({
    getAssets: () => assets,
    replaceAssets: values => replaceAssets(clone(values))
  });

  bindEvents();
  render();
  setInterval(() => {
    if (!$("#spritesView").classList.contains("active")) return;
    const animation = asset().animations[selectedAnimation];
    if (!animation) return drawAnimatedPreview();
    previewTick++;
    if (previewTick < animation.speed) return;
    previewTick = 0;
    const frames = animationFrames(asset());
    if (previewFrame + 1 < frames.length) previewFrame++;
    else if (animation.loop) previewFrame = 0;
    drawAnimatedPreview();
  }, 1000 / 60);
})();
