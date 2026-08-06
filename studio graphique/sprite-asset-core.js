(function (root) {
  "use strict";

  const ID = /^[A-Za-z_][A-Za-z0-9_]*$/;
  const FRAME_ID = /^[A-Za-z_][A-Za-z0-9_-]*$/;
  const clone = value => JSON.parse(JSON.stringify(value));

  function blankFrame(id = "idle") {
    return { id, data: Array(63).fill(0) };
  }

  function createSprite(id = "hero") {
    return {
      version: 1,
      id,
      mode: "hires",
      color: 7,
      origin: { x: 0, y: 0 },
      hitbox: { offsetX: 0, offsetY: 0, width: 24, height: 21 },
      frames: [blankFrame()],
      animations: {
        idle: { frames: ["idle"], speed: 8, loop: true }
      },
      initialAnimation: "idle"
    };
  }

  function normalizeSprite(value) {
    const sprite = clone(value);
    sprite.version ??= 1;
    sprite.mode ??= "hires";
    sprite.color ??= 1;
    sprite.origin = { x: sprite.origin?.x ?? 0, y: sprite.origin?.y ?? 0 };
    sprite.hitbox = {
      offsetX: sprite.hitbox?.offsetX ?? 0,
      offsetY: sprite.hitbox?.offsetY ?? 0,
      width: sprite.hitbox?.width ?? 24,
      height: sprite.hitbox?.height ?? 21
    };
    sprite.frames = (sprite.frames || []).map((frame, index) => ({
      id: frame.id || `frame_${index + 1}`,
      data: Array.from({ length: 63 }, (_, byte) => frame.data?.[byte] ?? 0)
    }));
    sprite.animations ??= {};
    Object.values(sprite.animations).forEach(animation => {
      animation.speed ??= 6;
      animation.loop ??= true;
    });
    return sprite;
  }

  function validateSprite(sprite) {
    const errors = [];
    if (!sprite || typeof sprite !== "object" || Array.isArray(sprite)) return ["Le sprite doit etre un objet JSON."];
    if (sprite.version !== 1) errors.push("version doit valoir 1.");
    if (typeof sprite.id !== "string" || !ID.test(sprite.id) || sprite.id.length > 64) errors.push("id doit commencer par une lettre ou _ et ne contenir que lettres, chiffres ou _.");
    if (!["hires", "multicolor"].includes(sprite.mode)) errors.push("mode doit valoir hires ou multicolor.");
    if (!Number.isInteger(sprite.color) || sprite.color < 0 || sprite.color > 15) errors.push("color doit etre comprise entre 0 et 15.");
    if (sprite.mode === "multicolor") {
      if (!Number.isInteger(sprite.multicolor1) || sprite.multicolor1 < 0 || sprite.multicolor1 > 15) errors.push("multicolor1 doit etre comprise entre 0 et 15.");
      if (!Number.isInteger(sprite.multicolor2) || sprite.multicolor2 < 0 || sprite.multicolor2 > 15) errors.push("multicolor2 doit etre comprise entre 0 et 15.");
    }
    const origin = sprite.origin || {};
    if (!Number.isInteger(origin.x) || origin.x < 0 || origin.x > 23 || !Number.isInteger(origin.y) || origin.y < 0 || origin.y > 20) errors.push("origin doit rester dans le canevas 24 x 21.");
    const hitbox = sprite.hitbox || {};
    if (!Number.isInteger(hitbox.offsetX) || hitbox.offsetX < 0 || hitbox.offsetX > 23
      || !Number.isInteger(hitbox.offsetY) || hitbox.offsetY < 0 || hitbox.offsetY > 20
      || !Number.isInteger(hitbox.width) || hitbox.width < 1 || hitbox.width > 24
      || !Number.isInteger(hitbox.height) || hitbox.height < 1 || hitbox.height > 21
      || hitbox.offsetX + hitbox.width > 24 || hitbox.offsetY + hitbox.height > 21) {
      errors.push("La hitbox doit tenir entierement dans le canevas 24 x 21.");
    }
    if (!Array.isArray(sprite.frames) || sprite.frames.length < 1 || sprite.frames.length > 128) {
      errors.push("frames doit contenir de 1 a 128 images.");
    } else {
      const frameIds = new Set();
      sprite.frames.forEach((frame, index) => {
        if (!frame || typeof frame.id !== "string" || !FRAME_ID.test(frame.id) || frame.id.length > 64 || frameIds.has(frame.id)) errors.push(`Frame ${index}: identifiant invalide ou duplique.`);
        if (!Array.isArray(frame?.data) || frame.data.length !== 63 || frame.data.some(byte => !Number.isInteger(byte) || byte < 0 || byte > 255)) errors.push(`Frame ${index}: 63 octets sont attendus.`);
        if (frame?.id) frameIds.add(frame.id);
      });
      if (!sprite.animations || typeof sprite.animations !== "object" || Array.isArray(sprite.animations)) errors.push("animations doit etre un objet.");
      else Object.entries(sprite.animations).forEach(([name, animation]) => {
        if (!FRAME_ID.test(name) || name.length > 64) errors.push(`Animation ${name}: nom invalide.`);
        if (!animation || !Array.isArray(animation.frames) || !animation.frames.length || animation.frames.some(frame => !frameIds.has(typeof frame === "number" ? sprite.frames[frame]?.id : frame))) errors.push(`Animation ${name}: reference de frame invalide.`);
        if (!Number.isInteger(animation?.speed) || animation.speed < 1 || animation.speed > 255) errors.push(`Animation ${name}: speed doit etre comprise entre 1 et 255.`);
        if (typeof animation?.loop !== "boolean") errors.push(`Animation ${name}: loop doit etre booleen.`);
      });
      if (sprite.initialAnimation !== undefined && !Object.hasOwn(sprite.animations || {}, sprite.initialAnimation)) errors.push("initialAnimation doit referencer une animation existante.");
    }
    return errors;
  }

  function pixelValue(frame, x, y, mode) {
    if (mode === "multicolor") {
      const byte = y * 3 + Math.floor(x / 4);
      return (frame.data[byte] >> ((3 - (x % 4)) * 2)) & 3;
    }
    const byte = y * 3 + Math.floor(x / 8);
    return (frame.data[byte] & (128 >> (x % 8))) ? 1 : 0;
  }

  function setPixelValue(frame, x, y, value, mode) {
    if (mode === "multicolor") {
      const byte = y * 3 + Math.floor(x / 4);
      const shift = (3 - (x % 4)) * 2;
      frame.data[byte] = (frame.data[byte] & ~(3 << shift)) | ((value & 3) << shift);
      return;
    }
    const byte = y * 3 + Math.floor(x / 8);
    const mask = 128 >> (x % 8);
    frame.data[byte] = value ? frame.data[byte] | mask : frame.data[byte] & ~mask;
  }

  root.JsC64SpriteAsset = Object.freeze({
    blankFrame,
    createSprite,
    normalizeSprite,
    validateSprite,
    pixelValue,
    setPixelValue
  });
})(globalThis);
