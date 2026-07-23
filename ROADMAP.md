# ROADMAP — js-c64 Game Compiler

## Vision

`js-c64` doit permettre d'écrire en JavaScript un programme de jeu lisible, puis
de générer un programme 6502 compact et réellement exécutable sur Commodore 64.

Le projet ne cherche pas à faire tourner JavaScript sur le C64 et ne cherche pas
non plus à traduire tout le langage JavaScript en assembleur. Le modèle visé est :

1. le fichier JavaScript décrit le jeu avec un DSL ;
2. le DSL construit une représentation intermédiaire (IR) ;
3. le compilateur vérifie les types, la mémoire et les ressources VIC/SID ;
4. le backend génère l'assembleur 6502 et les données ;
5. un petit runtime coordonne la boucle de jeu, les IRQ, les sprites et le son.

Cette approche peut raisonnablement produire :

- Snake et Tetris en mode caractères ;
- un casse-brique utilisant caractères et sprites ;
- un jeu de labyrinthe inspiré de Pac-Man ;
- un petit jeu de plates-formes à écrans fixes puis avec scrolling ;
- des shooters et des démos avec sprites, musique et effets raster.

Un jeu de la taille et de la finition du Super Mario Bros original n'est pas un
objectif réaliste à court terme. En revanche, un « mini platformer » possédant
quelques niveaux, des tiles, des collisions, des ennemis simples, du scrolling
et du son est un excellent objectif pour valider le compilateur.

---

## Principes non négociables

Chaque nouvelle fonctionnalité doit respecter les règles suivantes :

- code 6502 déterministe et inspectable ;
- pas de conflit caché entre IRQ raster, musique, animation et boucle de jeu ;
- aucune allocation dynamique sur le C64 ;
- adresses mémoire connues et vérifiées à la compilation ;
- coût mémoire et coût CPU documentés ;
- compatibilité PAL en priorité, avec comportement NTSC explicitement testé ou
  signalé comme non pris en charge ;
- API débutant simple, avec possibilité d'insérer du `c64.asm.*` pour les usages
  avancés ;
- exemples jouables et tests de non-régression pour chaque jalon.

Une fonctionnalité n'est pas terminée parce que son API compile. Elle est
terminée lorsqu'un exemple jouable l'utilise sur un vrai émulateur C64.

---

## État actuel vérifié

Le projet possède déjà une base utile :

- assembleur NMOS 6502 avec labels, relocations et listing ;
- sorties PRG, BIN, ASM, LST et BASIC DATA ;
- texte, écran, couleurs, mémoire, données et variables ;
- lecture bloquante du clavier et exemples joystick bas niveau ;
- sprites matériels, données de sprites, déplacement et animation vers une cible ;
- dessin bitmap hires ;
- effets SID et lecteur musical trois voix non bloquant ;
- plusieurs handlers raster et coordination partielle SID/sprites/IRQ ;
- tests automatisés du code généré.

### Dette structurante à traiter avant les API de jeu

Le DSL actuel enregistre surtout une suite linéaire d'instructions. Un `if`, une
boucle ou une expression JavaScript ordinaire est évalué par Node.js pendant la
compilation, pas par le 6510 pendant le jeu.

Ce code ne doit donc pas être présenté comme valide tant que le contrôle de flux
runtime n'existe pas :

```js
if (c64.joystick.left(2)) {
  c64.sprite.moveX(0, -1);
}
```

Un modèle explicite doit d'abord être ajouté, par exemple :

```js
const playerX = c64.var.byte("playerX", { initial: 100 });
const joy = c64.input.joystick(2);

c64.game.frame(() => {
  c64.control.if(joy.left(), () => {
    playerX.sub(1);
  });
});
```

Les noms exacts pourront évoluer après prototypage, mais l'IR doit savoir
représenter les variables, expressions, conditions, branches et boucles.

### Cohérence des versions

Avant la prochaine publication, synchroniser `package.json`, `CHANGELOG.md`, les
guides et les annonces de versions. Le package déclare encore `0.1.0` alors que
plusieurs documents parlent déjà de fonctionnalités v0.6.0.

---

## Architecture cible

### 1. Frontend DSL et IR

Le frontend transforme les appels JavaScript en nœuds typés :

- constantes byte, word et bool ;
- références mémoire ;
- expressions arithmétiques et bit à bit ;
- comparaisons ;
- `if/else`, boucles bornées et appels de routines ;
- blocs d'initialisation, de frame, de scène et d'IRQ ;
- données de sprites, charset, tiles, maps et musique.

L'IR doit être indépendant de l'assembleur afin de pouvoir être validé et
optimisé avant l'émission du code.

### 2. Backend 6502

Le backend est responsable de :

- choisir les modes d'adressage ;
- réutiliser les routines communes ;
- préserver les registres selon une convention documentée ;
- produire symboles, listing et carte mémoire ;
- signaler les branches trop longues, chevauchements et dépassements de budget.

### 3. Runtime unifié

Un seul ordonnanceur doit coordonner :

- IRQ VIC-II et CIA ;
- tick logique de jeu ;
- musique et effets sonores ;
- animation des sprites ;
- scrolling et streaming de map.

Les handlers doivent être enregistrés comme tâches avec une fréquence, une
priorité et un budget approximatif, plutôt que d'installer plusieurs systèmes
d'interruptions concurrents.

### 4. Planificateur mémoire

Le compilateur doit connaître et réserver :

- code et données du programme ;
- variables et état du runtime ;
- écran et Color RAM ;
- charset ;
- données de sprites et pointeurs ;
- buffers de map et de scrolling ;
- bitmap hires éventuel ;
- zones utilisées par le KERNAL lorsque celui-ci reste actif.

Une commande comme `c64js build ... --map memory.json` doit pouvoir produire un
rapport lisible et refuser les chevauchements dangereux.

### 5. Pipeline d'assets

Les assets doivent être compilés séparément puis intégrés au programme :

```text
éditeur d'assets -> JSON source -> validation -> BIN/JS/ASM -> linker js-c64
```

Le JSON reste la source éditable. Les fichiers binaires sont les données finales
compactes destinées au C64.

---

## v0.7.0 — Langage de gameplay et boucle de jeu

### Objectif

Rendre possible une logique de jeu runtime déterministe, sans écrire les branches
et boucles principales directement en assembleur.

### État d'avancement

Implémentation v0.7 disponible :

- [x] variables byte auto-allouées dans une zone RAM dédiée ;
- [x] opérations `set`, `add`, `sub`, `inc` et `dec` ;
- [x] comparaisons `eq`, `ne`, `lt`, `lte`, `gt` et `gte` ;
- [x] branche `c64.control.if()` avec `else` optionnel ;
- [x] snapshot joystick ports 1 et 2 par frame ;
- [x] états joystick maintenu, pressé et relâché ;
- [x] boucle `c64.game.frame()` à une mise à jour par frame ;
- [x] compteur interne 16 bits ;
- [x] protection des principales zones RAM réservées ;
- [x] exemple `examples/game-loop-input.js` et tests de compilation ;
- [x] variables word et bool typées avec opérations runtime ;
- [x] expressions bit à bit et tableaux indexés ;
- [x] `repeat`, `while` borné et routines nommées ;
- [x] clavier non bloquant par actions ;
- [x] `game.init()` et tâches `every()` ;
- [x] détection PAL/NTSC et fréquence logique configurable ;
- [ ] validation jouable dans VICE PAL et NTSC.

Cette première tranche est volontairement additive : les anciennes déclarations
`c64.var.byte(name, address, initialValue)` restent acceptées.

Le code et les tests automatisés de la v0.7 sont terminés. La dernière case est
un contrôle externe manuel : elle doit être cochée après exécution du PRG dans
VICE PAL puis NTSC, VICE n'étant pas fourni avec le projet.

### Fonctionnalités prioritaires

#### Valeurs et expressions runtime

- allocation automatique ou explicite de variables `byte`, `word` et `bool` ;
- références typées plutôt que simples descripteurs non vérifiés ;
- `set`, `add`, `sub`, `inc`, `dec`, `and`, `or`, `xor` ;
- comparaisons `eq`, `ne`, `lt`, `lte`, `gt`, `gte` ;
- constantes signées pour les vitesses ;
- tableaux byte statiques avec index runtime.

#### Contrôle de flux

- `c64.control.if(condition, thenFn, elseFn?)` ;
- `c64.control.repeat(count, fn)` pour les boucles bornées ;
- `c64.control.while(condition, fn, { maxIterations })` uniquement avec garde ;
- routines nommées et appels `JSR/RTS` ;
- erreurs de compilation pour les conditions JavaScript ambiguës.

#### Entrées

- snapshot joystick par frame pour les ports 1 et 2 ;
- états `held`, `pressed` et `released` ;
- clavier par actions configurables plutôt que seulement par codes de matrice ;
- prévention des conflits clavier/joystick sur les lignes CIA partagées.

#### Boucle de jeu

- `c64.game.init(fn)` ;
- `c64.game.frame(fn, { hz: 50 })` ;
- compteur de frames 16 bits ;
- tâches `every(n, fn)` compilées en compteurs ;
- attente verticale sans boucle de délai dépendante du processeur ;
- politique PAL/NTSC documentée.

### Exemple cible

```js
const joy = c64.input.joystick(2);
const player = c64.sprite.create(0, {
  x: 100, y: 120, data: Array(63).fill(255), minX: 24, maxX: 320
});

c64.game.frame(() => {
  player.setVelocity(0, 0);
  c64.control.if(joy.left(), () => player.setVelocity(-2, 0));
  c64.control.if(joy.right(), () => player.setVelocity(2, 0));
  player.update();
});
```

### Critères de sortie

- une raquette déplaçable reste fluide avec musique SID active ;
- un appui unique ne se répète pas lorsqu'on utilise `pressed` ;
- aucun exemple de documentation ne dépend d'un `if` JavaScript évalué à tort ;
- tests unitaires de l'IR, du contrôle de flux et du code 6502 généré ;
- exemple `examples/game-loop-input.js` prêt pour validation dans VICE PAL et NTSC
  (validation manuelle externe encore à effectuer).

---

## v0.8.0 — Sprites, animations et collisions

### Objectif

Transformer les sprites existants en objets réellement utilisables pour le
gameplay.

### État d'avancement

Implémentation terminée dans le compilateur et couverte par les tests
automatiques. Les exemples générés restent à valider visuellement dans VICE sur
une machine PAL et une machine NTSC.

### Fonctionnalités prioritaires

#### État des sprites

- position 9 bits en X et 8 bits en Y dans des variables runtime ;
- vitesse signée `vx/vy` ;
- limites, clamp et rebond ;
- activation/désactivation ;
- synchronisation explicite entre état logiciel et registres VIC-II.

#### Animation par frames

- plusieurs blocs de 64 octets par sprite ;
- séquences nommées (`idle`, `walk`, `hit`) ;
- vitesse, boucle, pause et changement de séquence ;
- partage des frames entre plusieurs sprites ;
- changement atomique du pointeur de sprite pendant la frame.

#### Collisions

- AABB logiciel avec hitboxes configurables ;
- collision sprite/sprite VIC-II optionnelle ;
- lecture centralisée des registres de collision VIC, qui sont effacés à la
  lecture et ne doivent jamais être lus indépendamment par plusieurs systèmes ;
- événements `enter`, `stay` et `leave` seulement si leur coût reste raisonnable ;
- aucune promesse de collision pixel-perfect générique à ce stade.

Les collisions avec une tilemap appartiennent à la v0.9.0.

### Critères de sortie

- [x] animation de marche à plusieurs frames (`examples/sprite-animate.js`) ;
- [x] balle avec vitesse signée et rebond stable ;
- [x] collision balle/raquette/blocs par hitboxes AABB ;
- [x] exemple jouable `examples/breakout-mini.js` avec son et score minimal ;
- [x] chemin de mise à jour audité à au plus 220 cycles par sprite actif, soit
  environ 1 760 cycles pour les 8 sprites sans tests AABB (moins de 9 % des
  19 656 cycles théoriques d'une frame PAL) ;
- [ ] validation visuelle externe dans VICE PAL et NTSC.

Les événements de collision `enter`, `stay` et `leave` restent volontairement
hors de cette étape : le gameplay cible fonctionne sans leur coût en mémoire et
en CPU. Ils pourront être ajoutés plus tard à partir d'un besoin concret.

---

## v0.8.1 — Optimisation équilibrée du code généré

Cette étape est terminée avant le démarrage de la v0.9. Elle ne modifie pas le
JavaScript écrit par l'utilisateur.

- [x] partage automatique d'un bloc VIC-II pour les données de pixels
  identiques ;
- [x] désactivation du partage avec `dataAddress` lorsqu'un bloc indépendant et
  modifiable est nécessaire ;
- [x] sous-routines générées pour les synchronisations de sprites répétées ;
- [x] comparaison AABB commune lorsqu'une frame contient plusieurs collisions ;
- [x] sous-routine commune pour plusieurs appels à `c64.sid.click()` ;
- [x] code court conservé en ligne lorsqu'un seul appel serait moins coûteux ;
- [x] tests automatiques de taille et de mutualisation ;
- [x] `breakout-mini.prg` réduit de 4 644 à 3 335 octets, soit environ 28 %,
  tout en ajoutant l'état logique nécessaire aux 16 sprites.

Le compromis équilibré ajoute 12 cycles par appel partagé (`JSR` + `RTS`) mais
réduit fortement la taille sans introduire de boucle non bornée ni modifier le
comportement du DSL.

---

## v0.8.2 — 16 sprites logiques par multiplexage

La création d'un sprite `8..15` active automatiquement un multiplexeur compact.
À chaque image, les sprites actifs sont triés selon leur Y et les huit canaux
VIC-II sont réattribués dès que le sprite précédent est entièrement terminé.

- [x] `c64.sprite.create(0..15)` sans nouvelle API obligatoire ;
- [x] état logique 9 bits X, Y, vitesse, activation, pointeur, couleur et flags
  pour 16 sprites ;
- [x] tri automatique des sprites actifs selon leur coordonnée Y ;
- [x] une seule routine assembleur de rendu réutilisée pour les 16 sprites ;
- [x] prise en compte de la hauteur 21 pixels et de `expandY` (42 pixels) ;
- [x] aucune séparation fixe entre zone haute, centrale et basse ;
- [x] partage automatique des frames et des pixels conservé ;
- [x] animations runtime disponibles pour les sprites 8 à 15 ;
- [x] collisions AABB entre tous les sprites logiques ;
- [x] refus explicite des collisions VIC ambiguës et de l'ancienne API directe ;
- [x] exemple `examples/sprite-multiplex-16.js` inférieur à 2,5 Ko ;
- [x] tests des indices, du renderer, des erreurs et de la taille ;
- [ ] validation visuelle dans VICE PAL et NTSC.

Limitation matérielle assumée : neuf sprites ou davantage ne peuvent pas
occuper les mêmes lignes raster. Dans ce cas, les sprites sans canal disponible
sont omis pendant l'image concernée. Les collisions VIC restent ambiguës ; les
collisions AABB logiques restent disponibles.

---

## v0.9.0 — Charset Studio, tiles et maps statiques

### Objectif

Fournir le pipeline complet permettant de dessiner des caractères, de construire
des tiles et des niveaux, puis de les utiliser sans recopier manuellement des
tableaux d'octets dans le code JavaScript.

Le générateur de caractères est non seulement possible, mais recommandé : il
réduit fortement la difficulté de création d'un jeu C64 et évite de nombreuses
erreurs de format.

### Décision d'architecture : format intégré, studio séparé

Le coeur NPM `js-c64` contient le schéma d'assets, leur validation, le
compilateur et le runtime C64. Le studio graphique sera un outil séparé qui
importe et exporte exactement le même JSON versionné.

Cette séparation évite d'ajouter un serveur web, un framework d'interface et
de nombreuses dépendances au compilateur installé par tous les utilisateurs.
Elle permet aussi de publier et mettre à jour le studio indépendamment, sans
casser l'API de génération des PRG.

Le studio pourra être lancé depuis son propre package, éventuellement avec :

```text
c64js assets
```

L'outil sera une petite application web locale indépendante du compilateur
principal. Elle devra fonctionner hors ligne et proposer :

- éditeur pixel 8 × 8 avec zoom ;
- modes caractère hires 1 bit et multicolore 2 bits ;
- palette C64 fixe de 16 couleurs ;
- aperçu de tous les caractères du charset ;
- copier/coller, miroir X/Y, décalage et rotation simple ;
- duplication et réorganisation des caractères ;
- aperçu sur une grille d'écran C64 ;
- import/export JSON sans perte ;
- export `.bin`, module `.js` et éventuellement `.asm` ;
- validation de la taille et des contraintes multicolores.

Un import PNG indexé peut être ajouté ensuite, mais il ne doit pas être la seule
source : la conversion automatique de couleurs et de pixels doit toujours
afficher les pertes avant export.

### 2. Tiles et metatiles

Un tile n'est pas limité à un caractère. Le studio doit permettre des metatiles
configurables, par exemple 1 × 1, 2 × 2 ou 4 × 4 caractères, contenant :

- indices de caractères ;
- couleurs par cellule ;
- type de collision ;
- propriétés utilisateur (`solid`, `ladder`, `danger`, `collectible`, etc.).

### 3. Éditeur de map

- grille redimensionnable ;
- palette de tiles ;
- outils crayon, rectangle, remplissage et sélection ;
- couche visuelle ;
- couche de collision ;
- couche d'objets/spawns séparée de l'image ;
- coordonnées et propriétés d'objets ;
- export JSON source et données binaires compactes ;
- compression RLE optionnelle, avec taille avant/après affichée.

### 4. API compilateur et runtime

API indicative :

```js
const level = c64.assets.loadMap("assets/level1.json");

c64.charset.use(level.charset, { address: 0x3000 });
c64.map.draw(level, { x: 0, y: 0 });

const tile = level.map(playerTileX, playerTileY);
c64.control.if(tile.isSolid(), () => {
  playerX.set(previousX);
});

// Détruit le bloc et rafraîchit uniquement le metatile concerné.
tile.set(0);
```

Fonctionnalités nécessaires :

- [x] format JSON versionné commun au compilateur et au futur studio ;
- [x] JSON Schema v1 publié avec le package NPM ;
- [x] chargement d'assets relatif au fichier JavaScript compilé ;
- [x] définition inline avec `c64.assets.defineMap()` pour les tests et outils ;
- [x] validation des caractères 8 x 8 hires, metatiles, couleurs et indices ;
- [x] charset à une adresse alignée et compatible avec la banque VIC ;
- [x] configuration automatique de `$DD00` et `$D018` ;
- [x] copie des données de charset vers la RAM C64 ;
- [x] dessin d'une map ou d'une zone positionnée ;
- [x] map mutable stockée en RAM et accessible avec `level.map(x, y)` ;
- [x] `tileAt()` et `level.map(x,y)` avec coordonnées runtime et index 16 bits ;
- [x] requêtes `isSolid()` et `hasCollision()` sur la couche logique ;
- [x] lecture avec `load()`, comparaisons `eq()`/`ne()` et écriture `set()` ;
- [x] rafraîchissement automatique du metatile modifié ;
- [x] rafraîchissement complet explicite avec `level.map.redraw()` ;
- [x] premier rapport mémoire `assetReport` dans le résultat du compilateur ;
- [x] `setTile()` avec coordonnées runtime ;
- [x] maps runtime de plus de 256 cases avec index 16 bits, jusqu'à 8 192 cases ;
- [x] conversion coordonnées pixel, caractère et tile ;
- [x] rapport mémoire détaillé avec plages et détection de chevauchement ;
- [x] mode charset multicolore 2 bits.

### État du studio graphique

- [x] projet externe autonome dans `studio graphique/`, sans dépendance au package ;
- [x] éditeur de caractères hires et multicolore, palette, transformations et réorganisation ;
- [x] éditeur de metatiles 1 x 1 à 8 x 8, couleurs et propriétés ;
- [x] éditeur de maps redimensionnables avec dessin, sélection et collisions ;
- [x] couche séparée d'objets/spawns avec type, coordonnées et propriétés ;
- [x] import/export sans perte des données du schéma JSON v1 ;
- [x] export `.bin`, `.js` et `.asm` ;
- [x] export map binaire brut et compression RLE avec taille avant/après ;
- [x] historique annuler/rétablir et sauvegarde locale automatique.

Le compilateur fournit déjà un fichier JSON écrit à la main et une démo de
référence : `examples/assets/v09-room.json` et
`examples/tilemap-static.js`. La map dynamique est testée dans
`examples/tetris-mini.js` avec `examples/assets/tetris-room.json`. Ces fichiers
servent désormais de contrat initial au futur studio.

### Périmètre volontaire

La v0.9.0 doit d'abord réussir les maps statiques et les changements de salle.
Le scrolling fin et le streaming continu sont reportés en v0.10.0. Les livrer en
même temps rendrait la version trop risquée et beaucoup plus difficile à tester.

### Critères de sortie

- [x] un charset peut être dessiné, sauvegardé, rouvert et exporté sans perte ;
- [x] une map JSON peut être validée et compilée dans un PRG ;
- [x] les collisions utilisent la couche logique, pas la couleur affichée ;
- [x] metatiles et couleurs par cellule pris en charge ;
- [x] exemple source `examples/tilemap-static.js` avec son JSON ;
- [x] exemple `examples/snake.js` ;
- [x] exemple jouable `examples/tetris-mini.js` ;
- [x] exemple `examples/maze-game.js` ;
- [x] un projet exemple contient les sources JSON des assets, pas seulement le BIN.

---

## v0.10.0 — Scrolling, caméra et streaming de niveaux

### Objectif

Permettre des niveaux plus grands que l'écran et préparer un petit jeu de
plates-formes ou un shooter à scrolling.

### Fonctionnalités prioritaires

- fine scroll X/Y via `$D016` et `$D011` ;
- grossier scroll par déplacement de lignes/colonnes ;
- streaming d'une colonne ou d'une ligne de tiles au wrap ;
- caméra bornée suivant une position logique ;
- double écran ou buffer adapté lorsque nécessaire ;
- gestion correcte de Color RAM ;
- carte plus grande que 256 cases avec coordonnées 16 bits ;
- hooks de chargement de salle et de zone ;
- stratégie de décompression par morceaux ;
- limites de vitesse selon le budget CPU.

### Risques techniques à traiter explicitement

- badlines VIC-II et temps CPU réellement disponible ;
- différences PAL/NTSC ;
- déchirement lors de la copie de Color RAM ;
- banque VIC commune au charset, à l'écran et aux sprites ;
- coexistence du streaming avec musique, animation et IRQ raster ;
- coût des maps 16 bits et des multiplications de coordonnées.

### Critères de sortie

- scroll horizontal unidirectionnel sans déchirement ;
- scroll horizontal bidirectionnel avec caméra bornée ;
- collision correcte pendant le déplacement de la caméra ;
- exemple `examples/tilemap-scroll-x.js` ;
- exemple `examples/platformer-mini.js` avec au moins deux zones jouables ;
- profil CPU/mémoire inclus dans le rapport de build.

Le scroll vertical complet peut être livré après le scroll horizontal si le
budget de la version devient trop important.

---

## v0.11.0 — Audio de jeu, outils et optimisation

### Objectif

Rendre les jeux agréables à produire, déboguer et optimiser avant de figer l'API
1.0.

### Audio

- priorité entre musique et effets sonores ;
- réservation configurable d'une voix SID pour les bruitages ;
- pause/reprise/fade de la musique ;
- patterns et instruments réutilisables ;
- tempo stable PAL/NTSC ;
- diagnostic lorsque musique et effet modifient la même voix.

### Diagnostics

- rapport mémoire détaillé ;
- estimation des cycles des routines critiques ;
- avertissement lorsqu'une tâche de frame dépasse son budget ;
- symboles exploitables dans le moniteur VICE ;
- assertion runtime optionnelle en build debug ;
- modes `--debug` et `--release`.

### Optimisation

- élimination des routines inutilisées ;
- mutualisation des séquences répétées ;
- choix `--opt size`, `--opt speed` et `--opt balanced` seulement après mesure ;
- compression RLE des maps et charsets quand elle réduit réellement la taille ;
- rapport comparatif taille/vitesse.

### Option avancée

Un multiplexeur de sprites peut être étudié ici, mais il ne doit pas bloquer la
1.0. Les petits jeux visés peuvent déjà fonctionner avec les huit sprites
matériels et des éléments de décor en caractères.

---

## v1.0.0 — Mini moteur de jeux C64

### Objectif

Stabiliser une API cohérente, documentée et validée par plusieurs jeux complets.

### Systèmes de haut niveau

- scènes `title`, `game`, `pause`, `gameOver` ;
- transitions explicites entre scènes ;
- score, vies et affichage numérique ;
- générateur pseudo-aléatoire déterministe avec seed ;
- pools fixes d'entités, projectiles et ennemis ;
- spawns provenant de la couche objets d'une map ;
- sauvegarde de configuration ou high-score en option, hors cœur initial.

Les entités doivent utiliser des pools de taille fixe décidée à la compilation.
Il ne faut pas introduire de système général avec allocation dynamique, héritage
ou ramasse-miettes sur le C64.

### Jeux de validation obligatoires

La 1.0 ne doit pas reposer sur une seule démo technique. Elle doit compiler et
faire fonctionner au minimum :

1. `snake.js` — grille, input, timer, score et hasard ;
2. `breakout-mini.js` — sprites, collisions, son et niveaux ;
3. `maze-game.js` — charset, tilemap, collecte et ennemis simples ;
4. `platformer-mini.js` — animation, collisions de tiles, caméra et scrolling.

Un mini Tetris peut remplacer ou compléter Snake comme validation du mode
caractères.

---

## Matrice des jeux cibles

| Jeu cible | Fondations indispensables | Version minimale réaliste |
|---|---|---:|
| Snake | boucle frame, input, grille, hasard, score | v0.9.0 |
| Tetris | grille, rotations, collisions logiques, timer | v0.9.0 |
| Casse-brique | sprites, AABB, vitesse, score, SID | v0.8.0 |
| Labyrinthe type Pac-Man | tilemap, collisions, animations, IA simple | v0.9.0 |
| Mini platformer écran fixe | tiles, collisions, animation, scènes | v0.9.0 |
| Mini platformer avec scroll | caméra, streaming, collisions de map | v0.10.0 |

---

## Stratégie de tests et critères communs

Chaque fonctionnalité doit être couverte à plusieurs niveaux :

1. test de l'IR produit par le DSL ;
2. test des octets et symboles assembleur générés ;
3. test d'intégration compilant un exemple complet ;
4. test automatisé en émulateur quand cela devient possible ;
5. contrôle visuel et jouable dans VICE pour les releases.

À ajouter progressivement :

- captures d'état mémoire après un nombre déterminé de frames ;
- tests PAL et NTSC ;
- tests des limites X=255/256, changements de banque et wrap de map ;
- tests de collision reproductibles ;
- budgets maximums de RAM, taille PRG et cycles par frame ;
- build de tous les exemples dans la CI.

---

## Ordre d'implémentation recommandé

Si le temps est limité, suivre cet ordre sans commencer le scrolling trop tôt :

1. figer une syntaxe minimale d'expressions et de conditions ;
2. créer l'IR typé et les branches 6502 ;
3. créer une boucle de frame et des inputs snapshot ;
4. formaliser le runtime IRQ et le plan mémoire ;
5. livrer le mouvement et les collisions sprites ;
6. réaliser un casse-brique jouable ;
7. définir le format JSON charset/tile/map ;
8. créer d'abord le compilateur d'assets, puis l'éditeur visuel ;
9. livrer les maps statiques et leurs collisions ;
10. réaliser Snake/Tetris et un jeu de labyrinthe ;
11. seulement ensuite développer caméra, fine scroll et streaming ;
12. stabiliser scènes, pools d'entités, audio et diagnostics pour la 1.0.

---

## Prochaine tranche de travail concrète

La prochaine implémentation ne devrait pas commencer par une API de collision ou
par l'éditeur graphique. Elle devrait produire un petit prototype vertical :

1. `RuntimeValue` pour byte/bool ;
2. comparaisons et `c64.control.if()` ;
3. snapshot joystick port 2 ;
4. `c64.game.frame()` synchronisé à une frame ;
5. variable X 9 bits pour un sprite ;
6. exemple où le joueur déplace un sprite à gauche/droite ;
7. test du PRG dans VICE avec musique active.

Ce prototype vérifiera la décision d'architecture la plus importante avant que
de nombreuses API publiques dépendent d'elle.

---

## Résultat attendu

Si ces jalons sont respectés, `js-c64` deviendra :

- un compilateur DSL accessible aux débutants ;
- un générateur d'assembleur 6502 lisible et optimisable ;
- une chaîne de création complète pour code, sprites, caractères, tiles et maps ;
- un outil capable de produire de vrais petits jeux C64 avec animation et son ;
- une base assez ouverte pour permettre aux utilisateurs avancés d'ajouter leurs
  propres routines assembleur lorsque le moteur atteint ses limites.
