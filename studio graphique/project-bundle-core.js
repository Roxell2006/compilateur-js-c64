(function (root) {
  "use strict";

  const FORMAT = "js-c64-studio-project";
  const VERSION = 1;
  const clone = value => JSON.parse(JSON.stringify(value));

  function createBundle(name, map, sprites) {
    return {
      format: FORMAT,
      version: VERSION,
      name: String(name || "projet-c64").slice(0, 64),
      map: clone(map),
      sprites: clone(sprites)
    };
  }

  function validateBundle(bundle, validators = {}) {
    const errors = [];
    if (!bundle || typeof bundle !== "object" || Array.isArray(bundle)) return ["Le projet studio doit etre un objet JSON."];
    const allowed = new Set(["format", "version", "name", "map", "sprites"]);
    Object.keys(bundle).filter(key => !allowed.has(key)).forEach(key => errors.push(`Champ de projet inconnu : ${key}.`));
    if (bundle.format !== FORMAT) errors.push(`format doit valoir ${FORMAT}.`);
    if (bundle.version !== VERSION) errors.push(`version doit valoir ${VERSION}.`);
    if (typeof bundle.name !== "string" || !bundle.name.trim() || bundle.name.length > 64) errors.push("name doit contenir de 1 a 64 caracteres.");
    if (!bundle.map || typeof bundle.map !== "object" || Array.isArray(bundle.map)) errors.push("map doit contenir un asset de map.");
    else if (validators.validateMap) errors.push(...validators.validateMap(bundle.map));
    if (!Array.isArray(bundle.sprites) || !bundle.sprites.length) errors.push("sprites doit contenir au moins un sprite-asset-v1.");
    else {
      const ids = new Set();
      bundle.sprites.forEach((sprite, index) => {
        if (validators.validateSprite) errors.push(...validators.validateSprite(sprite).map(message => `Sprite ${index}: ${message}`));
        if (sprite?.id && ids.has(sprite.id)) errors.push(`Sprite ${index}: identifiant ${sprite.id} duplique.`);
        if (sprite?.id) ids.add(sprite.id);
      });
      for (const object of bundle.map?.map?.objects || []) {
        if (object.sprite && !ids.has(object.sprite)) errors.push(`Objet ${object.id || object.type}: sprite ${object.sprite} absent du projet.`);
      }
    }
    return errors;
  }

  function parseBundle(text, validators = {}) {
    let parsed;
    try { parsed = JSON.parse(text); }
    catch (error) { throw new Error(`JSON invalide : ${error.message}`); }
    const errors = validateBundle(parsed, validators);
    if (errors.length) throw new Error(errors.join(" "));
    return clone(parsed);
  }

  function nextObjectId(preferred, objects = [], fallback = "object") {
    const used = new Set((objects || []).map(object => object?.id).filter(Boolean));
    let requested = String(preferred || fallback || "object").trim() || "object";
    requested = requested.slice(0, 64);
    if (!used.has(requested)) return requested;

    const numbered = requested.match(/^(.*?)([-_ ]?)(\d+)$/);
    const base = numbered ? numbered[1] : requested;
    const separator = numbered ? numbered[2] : "-";
    let number = numbered ? Number(numbered[3]) + 1 : 2;
    while (true) {
      const suffix = `${separator}${number}`;
      const candidate = `${base.slice(0, Math.max(1, 64 - suffix.length))}${suffix}`;
      if (!used.has(candidate)) return candidate;
      number += 1;
    }
  }

  function objectPositionError(objects, movingIndex, x, y, width, height) {
    if (!Number.isInteger(x) || !Number.isInteger(y)) return "Les coordonnees X et Y doivent etre des nombres entiers.";
    if (x < 0 || y < 0 || x >= width || y >= height) return `La position ${x},${y} se trouve hors de la map.`;
    const occupied = (objects || []).some((object, index) => index !== movingIndex && object?.x === x && object?.y === y);
    return occupied ? `La case ${x},${y} contient deja un autre objet.` : null;
  }

  root.JsC64StudioProject = Object.freeze({
    FORMAT, VERSION, createBundle, validateBundle, parseBundle, nextObjectId, objectPositionError
  });
})(globalThis);
