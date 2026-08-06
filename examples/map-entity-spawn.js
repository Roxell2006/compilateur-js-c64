import { c64 } from "./c64.js";

const MAP_WIDTH = 80;
const MAP_HEIGHT = 20;

const EMPTY = 0;
const SOLID = 1;
const WALL_CAP = 2;
const PLATFORM = 3;

// Le fichier sprite-asset-v1 contient les pixels, la couleur, la hitbox et les
// animations nommees. Son id "hero" sera retrouve depuis l'objet de la map.
c64.assets.loadSprite("assets/v10-hero.sprite.json", { address: 0x2e00 });

// Niveau de 80 x 20 caractères. Les murs bas utilisent une tuile solide de
// 8 pixels et un sommet décoratif traversable de 2 pixels : ils mesurent donc
// visuellement 10 pixels, tout en gardant la collision logique alignée sur la
// grille de caractères du C64.
const mapData = Array(MAP_WIDTH * MAP_HEIGHT).fill(EMPTY);
const setTile = (x, y, tile) => { mapData[y * MAP_WIDTH + x] = tile; };

for (let x = 0; x < MAP_WIDTH; x += 1) setTile(x, MAP_HEIGHT - 1, SOLID);

function lowWall(x, width = 2) {
  for (let column = 0; column < width; column += 1) {
    setTile(x + column, MAP_HEIGHT - 2, SOLID);
    setTile(x + column, MAP_HEIGHT - 3, WALL_CAP);
  }
}

lowWall(12, 2);
lowWall(24, 3);
lowWall(39, 2);
lowWall(55, 3);
lowWall(70, 2);

// Quelques plateformes plus hautes pour vérifier les contacts au sol et au
// plafond après les premiers murs.
for (let x = 31; x <= 36; x += 1) setTile(x, 15, PLATFORM);
for (let x = 47; x <= 52; x += 1) setTile(x, 13, PLATFORM);
for (let x = 63; x <= 68; x += 1) setTile(x, 16, PLATFORM);

const level = c64.assets.defineMap({
  version: 1,
  charset: {
    mode: "hires",
    characters: [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [255, 129, 189, 165, 165, 189, 129, 255],
      [0, 0, 0, 0, 0, 0, 255, 255],
      [255, 255, 24, 24, 24, 24, 24, 24]
    ]
  },
  tiles: [
    { chars: [0], colors: [0], collision: 0 },
    { chars: [1], colors: [14], collision: 1, properties: { solid: true } },
    { chars: [2], colors: [7], collision: 0, properties: { decorativeCap: true } },
    { chars: [3], colors: [5], collision: 1, properties: { solid: true, platform: true } }
  ],
  map: {
    width: MAP_WIDTH,
    height: MAP_HEIGHT,
    data: mapData,
    objects: [
      {
        id: "player",
        type: "player-spawn",
        x: 3,
        y: 16,
        sprite: "hero",
        properties: { direction: "right", animation: "idle-right" }
      }
    ]
  }
});

const joystick = c64.input.joystick(2);

const player = c64.map.spawn(level, "player", {
  sprite: 0,
  maxCollisionSpeed: 8
});

// Le fine scroll utilise 38 colonnes visibles et une colonne de travail cachée
// de chaque côté. C'est la largeur horizontale utile maximale sans afficher de
// données parasites pendant le déplacement pixel par pixel.
const camera = c64.map.scroller(level, {
  sourceX: 0,
  sourceY: 0,
  width: 38,
  x: 1,
  panel: { bottom: 5 }
});

c64.game.init(() => {
  c64.charset.use(level.charset, { address: 0x3000 });
  c64.borderColor(c64.COLOR_BLACK);
  c64.backgroundColor(c64.COLOR_BLACK);
  camera.draw();
});

c64.game.frame(() => {
  player.velocityX.set(0);
  c64.control.if(joystick.left(), () => player.velocityX.set(-2));
  c64.control.if(joystick.right(), () => player.velocityX.set(2));

  // La sequence depend du mouvement reel. play() est idempotent : rappeler la
  // meme animation a chaque frame ne la redemarre pas depuis sa premiere image.
  c64.control.if(
    player.velocityX.eq(0),
    () => player.play("idle-right"),
    () => player.play("run-right")
  );

  // FIRE ne déclenche le saut que lorsque la sonde sous la hitbox touche le sol.
  c64.control.if(player.isOnGround(), () => {
    c64.control.if(joystick.firePressed(), () => player.jump(6));
  });

  // Gravité simple. Les valeurs négatives de velocityY représentent la montée.
  player.velocityY.add(1);
  player.moveAndCollide();

  camera.follow(player, {
    axis: "x",
    deadZone: { x: 104, y: 48, width: 96, height: 64 },
    maxSpeed: 2
  });
});
