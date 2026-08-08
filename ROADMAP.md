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

- [x] fine scroll X via `$D016` en mode 38 colonnes ;
- [x] fine scroll Y via `$D011` en mode 24 lignes dans la bande scrollée ;
- [x] scroll horizontal grossier optimisé par déplacement des lignes visibles ;
- [x] streaming d'une seule colonne de tiles au wrap horizontal ;
- [x] streaming d'une seule ligne de tiles au wrap vertical ;
- [x] première caméra bornée suivant une position logique runtime ;
- [ ] double écran ou buffer adapté lorsque nécessaire ;
- [x] gestion conjointe de l'écran et de Color RAM dans le viewport ;
- [x] carte plus grande que 256 cases avec coordonnées 16 bits ;
- [ ] hooks de chargement de salle et de zone ;
- [ ] stratégie de décompression par morceaux ;
- [x] première estimation de coût selon les budgets CPU PAL/NTSC.

### État d'avancement initial

- [x] API `c64.map.drawViewport()` avec origine runtime et position écran ;
- [x] origine X/Y bornée automatiquement aux dimensions de la map ;
- [x] rendu d'une fenêtre de map sans développer toute la map à l'écran ;
- [x] collisions conservées en coordonnées monde, indépendantes de la caméra ;
- [x] rapport `map-viewport` : tuiles visibles, stratégie et cycles estimés ;
- [x] exemple `examples/tilemap-scroll-x.js` contrôlé au joystick ;
- [x] remplacer le redraw complet horizontal par le streaming de la colonne entrante ;
- [x] ajouter le fine scroll X, les bornes automatiques et la synchronisation à la frame ;
- [x] déplacer Screen RAM et Color RAM ensemble dans les deux directions ;
- [x] rapport `map-scroll` avec coûts X/Y, lignes raster et fenêtres PAL/NTSC ;
- [x] IRQ de bande partagée pour le scroll X avec panneau fixe au-dessus ou en dessous ;
- [x] scroll X/Y avec panneau inférieur, YSCROLL installé avant la première badline ;
- [x] transition verticale dans une IRQ longue et déterministe : normalisation
  de `RC` et `VCBASE` pour les huit phases YSCROLL, puis restauration de
  `$D011`, `$D016` et `$D018` avant le panneau ;
- [x] ligne de transition réservée avec charset vide couleur de fond, sans
  couture noire ni saut de 40 octets du panneau fixe ;
- [x] remappage automatique des écritures du panneau d'une ligne Screen RAM,
  sans changement des coordonnées JS utilisées par le programme ;
- [x] panneau exact via `{ position: "bottom"|"top", rows }` et les raccourcis
  `{ bottom: n }` / `{ top: n }` ;
- [x] compatibilité conservée avec `panel: "bottom"` et `panel: "top"` ;
- [ ] compensation FLD/badline pour autoriser le scroll Y sous un panneau supérieur fixe ;
- [x] coexistence de l'IRQ de bande avec le dispatcher raster, SID et animation de sprites ;
- [ ] valider visuellement l'absence de déchirement sur machines PAL et NTSC réelles/émulées.

### Risques techniques à traiter explicitement

- badlines VIC-II et temps CPU réellement disponible ;
- différences PAL/NTSC ;
- déchirement lors de la copie de Color RAM ;
- banque VIC commune au charset, à l'écran et aux sprites ;
- coexistence du streaming avec musique, animation et IRQ raster ;
- coût des maps 16 bits et des multiplications de coordonnées.

### Critères de sortie

- [x] scroll horizontal unidirectionnel synchronisé avec streaming de colonne ;
- [x] scroll horizontal bidirectionnel fin avec caméra bornée ;
- [x] scroll vertical bidirectionnel fin avec caméra bornée, streaming de ligne et panneau inférieur ;
- [x] collision démontrée pendant le déplacement de la caméra ;
- [x] exemple fin et bidirectionnel `examples/tilemap-scroll-x.js` ;
- [x] exemple `examples/platformer-mini.js` avec au moins deux zones jouables ;
- [x] premier profil CPU/mémoire inclus dans le rapport de build.

Le scroll vertical complet peut être livré après le scroll horizontal si le
budget de la version devient trop important.

---

## v0.10.1 — Entités de map, 16 sprites et caméra de gameplay

### Objectif

Relier la tilemap, les objets placés dans le studio, les huit sprites matériels
et les huit sprites virtuels dans une seule API de gameplay. Un objet tel que
`player-spawn` doit pouvoir créer une entité, lui associer un sprite et une
hitbox, la déplacer dans le monde, tester les collisions de tuiles et servir de
cible à la caméra.

Cette version est le pont entre le moteur de scrolling de la v0.10.0 et les
jeux complets. Elle ne promet pas seize sprites matériels simultanés : les
indices 8 à 15 restent multiplexés et partagent les contraintes raster du
VIC-II.

### Principes d'architecture non négociables

- séparer les coordonnées monde des coordonnées écran du VIC-II ;
- stocker les positions monde et caméra sur 16 bits au minimum ;
- conserver une seule implémentation de sprite pour les indices 0 à 15 ;
- projeter à chaque frame `écran = monde - caméra + origine du viewport` ;
- masquer les sprites hors écran sans perdre leur position monde ;
- trier les sprites visibles selon Y avant de préparer le multiplexeur ;
- utiliser la couche logique de collision de la map, jamais la couleur ou le
  caractère affiché ;
- considérer par défaut `collision = 0` comme traversable et toute autre valeur
  comme bloquante ;
- utiliser des pools de taille connue à la compilation, sans allocation dans la
  boucle de jeu ;
- garder le studio graphique externe au package runtime : il produit des assets
  validés que le compilateur consomme.

La position 9 bits d'un sprite VIC-II n'est donc plus utilisée comme position
dans le niveau. Elle devient uniquement le résultat temporaire de la projection
de l'entité sur l'écran.

### Contrat des objets et des assets

- [x] donner à chaque objet de map un identifiant stable, un type, une position,
  des propriétés et, si nécessaire, une référence de sprite ;
- [x] normaliser les positions des objets en pixels monde pendant la compilation,
  tout en permettant au studio de les aligner sur la grille des tuiles ;
- [x] faire évoluer le schéma de map sans interprétation ambiguë des coordonnées
  des anciens fichiers JSON ;
- [x] ajouter un schéma versionné `sprite-asset-v1` séparé et réutilisable entre
  plusieurs maps ;
- [x] décrire dans cet asset le mode hires ou multicolore, les frames 24×21, les
  couleurs, l'origine, la hitbox et les animations nommées ;
- [x] permettre à un objet de sélectionner l'asset, l'animation initiale, le sens
  et les propriétés de gameplay ;
- [x] valider à la compilation les références manquantes, tailles, couleurs,
  frames, limites mémoire et conflits de banque VIC ;
- [x] produire des messages d'erreur qui citent le fichier, l'objet et la
  propriété concernés.

Exemple de donnée conforme au schéma :

```json
{
  "id": "player",
  "type": "player-spawn",
  "x": 6,
  "y": 18,
  "sprite": "hero",
  "properties": {
    "direction": "right",
    "animation": "idle-right"
  }
}
```

### API compilateur et runtime cible

L'API exacte pourra être ajustée pendant l'implémentation, mais le code utilisateur
doit rester aussi direct que ceci :

```js
const level = c64.assets.loadMap("assets/platformer-room.json");
const player = c64.map.spawn(level, "player-spawn", {
  sprite: 0,
  hitbox: { x: 4, y: 2, width: 16, height: 19 }
});

const camera = c64.map.scroller(level, {
  x: 0,
  y: 0,
  width: 40,
  height: 22,
  panel: "bottom"
});

camera.follow(player, {
  axis: "both",
  deadZone: { x: 120, y: 72, width: 80, height: 56 },
  clampToMap: true
});

player.moveAndCollide(dx, dy);

if (player.isOnGround() && joystick.firePressed()) {
  player.jump(4);
}

player.play("run-right");
```

Fonctions prévues :

- [x] `c64.map.object()` et `c64.map.objects()` pour retrouver un objet ou une
  famille d'objets par identifiant ou par type ;
- [x] `c64.map.spawn()` et `c64.map.spawnAll()` pour créer et lier les entités aux
  objets de la map ;
- [x] propriétés lisibles `worldX`, `worldY`, `screenX`, `screenY`, `velocityX`
  et `velocityY` ;
- [x] déplacement avec résolution des collisions et états `onGround`,
  `hitCeiling`, `hitLeft` et `hitRight` ;
- [x] animation par nom et orientation sans recopier les tables de frames ;
- [x] association automatique aux sprites logiques 0 à 15, réels ou virtuels ;
- [x] désactivation, réapparition et changement de zone/spawn sans recréer le moteur ;
- [x] accès à l'objet source et à ses propriétés depuis l'entité.

### Premier incrément livré

- [x] champs JSON optionnels `id` et `sprite`, avec identifiants uniques validés ;
- [x] migration transparente des anciennes maps par identifiant déterministe ;
- [x] coordonnées constantes `worldX` et `worldY` calculées depuis la grille ;
- [x] coordonnées runtime 16 bits propres à chaque entité ;
- [x] projection explicite `entity.project()` avec caméra 16 bits optionnelle ;
- [x] masquage automatique lorsque l'origine de l'entité sort du viewport ;
- [x] champs identifiant et référence de sprite dans le studio graphique ;
- [x] exemple initial `examples/map-entity-spawn.js` ;
- [x] tests de sélection, ambiguïté, coordonnées monde, sprite virtuel, projection,
  hitbox et génération des contacts de tuiles.

La projection explicite reste disponible en complément du suivi automatique
pour les entités secondaires.

### Incrément sprite-asset-v1 livré

- [x] schéma JSON externe `schemas/sprite-asset-v1.schema.json` ;
- [x] `c64.assets.loadSprite()` et `defineSprite()` avec diagnostic du fichier ;
- [x] frames 24×21 hires ou multicolores, origine, hitbox et couleurs validées ;
- [x] animations nommées partageant les mêmes frames, avec vitesse et boucle ;
- [x] sélection automatique par `map.objects[].sprite` et
  `properties.animation` ;
- [x] `entity.play(name, direction)`, pause et reprise de l'animation ;
- [x] couleurs multicolores partagées contrôlées et conflits refusés ;
- [x] rapport `sprite-asset` avec source, mémoire, frames et animations ;
- [x] exemple `examples/assets/v10-hero.sprite.json` utilisé par
  `examples/map-entity-spawn.js`.

### Incrément caméra suiveuse livré

- [x] position caméra canonique en pixels monde 16 bits, synchronisée avec les
  phases fines et grossières du scroller ;
- [x] `camera.follow(entity)` avec axe X, Y ou les deux ;
- [x] zone morte configurable en pixels du viewport ;
- [x] vitesse de rattrapage déterministe de 1 à 8 pixels par frame ;
- [x] bornes automatiques aux quatre limites de la map ;
- [x] projection automatique de l'entité suivie ;
- [x] `camera.project(entity)` pour les autres sprites réels ou virtuels ;
- [x] rapport `map-camera-follow` avec cible, axe, zone morte et vitesse ;
- [x] tests du panneau inférieur, du suivi X seul, du suivi X/Y, des erreurs de
  configuration et de la projection d'un sprite virtuel.

Le suivi doit être appelé après le déplacement de l'entité dans
`c64.game.frame()`. Un panneau supérieur reste limité au suivi horizontal tant
que la compensation FLD/badline du scroll vertical n'est pas disponible.

### Stabilisation professionnelle du scroll X livrée

- [x] origine pixel commune entre la phase initiale `$D016=7`, la caméra, les
  sprites projetés et les hitboxes de collision ;
- [x] calcul `y * largeur de map` par multiplication constante shift/add au lieu
  d'une boucle proportionnelle à la hauteur ;
- [x] copie grossière Screen RAM + Color RAM ligne par ligne, avec deux cellules
  traitées par branche pour respecter le faisceau PAL ;
- [x] IRQ de sortie placée une ligne avant la badline du panneau fixe ;
- [x] pré-transition verticale placée treize lignes avant le panneau afin que les
  huit phases YSCROLL chargent exactement le même nombre de lignes de map ;
- [x] timer CIA du KERNAL désactivé automatiquement pour empêcher une collision
  CIA/VIC de retarder la phase fine pendant une frame au repos ;
- [x] origine verticale compensée de 4 pixels entre `$D011=3` et `$D011=7` ;
- [x] copies verticales accélérées deux cellules par branche, avec diagnostics
  séparés pour les wraps haut et bas ;
- [x] refus de compilation d'un sens vertical qui dépasse encore le budget PAL,
  plutôt que de produire un wrap visuellement instable ;
- [x] ligne de boucle de jeu choisie automatiquement après la bande scrollée,
  tout en conservant `rasterLine` comme réglage manuel prioritaire ;
- [x] rapport de build enrichi avec la ligne recommandée, la stratégie
  `beamRacedRows` et les budgets PAL/NTSC.

Une fenêtre 38×20 avec panneau inférieur de cinq lignes respecte maintenant le
budget horizontal PAL. Le rapport signale encore qu'une fenêtre aussi haute
dépasse le budget NTSC et que le wrap vertical plein écran reste à optimiser.

### Collisions entre sprites et tilemap

- [x] utiliser la hitbox de l'entité, indépendante des 24×21 pixels graphiques ;
- [x] convertir seulement les bords utiles de la hitbox en coordonnées de tuiles ;
- [x] résoudre séparément les axes X puis Y pour obtenir des contacts stables ;
- [x] empêcher la traversée d'une tuile lorsque la vitesse dépasse un pixel par
  frame, par balayage ou sous-pas bornés ;
- [x] remettre l'entité exactement contre le bord de la tuile après un contact ;
- [x] prendre immédiatement en compte les modifications faites avec
  `level.map(x, y).set(value)` ;
- [x] permettre une table optionnelle de comportements pour préparer les
  plateformes traversables, dangers, échelles et sorties de niveau ;
- [x] réutiliser l'AABB existante pour les collisions entre entités, sans la
  confondre avec la collision de décor.

La première livraison doit garantir les blocs pleins. Les pentes, collisions au
pixel près et plateformes mobiles complexes restent hors périmètre tant que le
socle n'est pas stable.

### Caméra, affichage et multiplexage

- [x] `camera.follow(entity)` avec choix de l'axe, décalage, zone morte et bornes
  automatiques de la map ;
- [x] suivi déterministe sans interpolation coûteuse, avec vitesse maximale
  optionnelle ;
- [x] première projection et synchronisation explicite des sprites visibles après le
  déplacement de la caméra ;
- [x] culling des entités hors viewport, avec marge configurable pour éviter le
  clignotement aux bords ;
- [x] tri Y automatique des sprites virtuels après projection écran ;
- [x] conservation correcte du bit X supérieur pour les positions visibles
  supérieures à 255 ;
- [x] coexistence testée avec le scroll X/Y, le panneau fixe, les animations,
  le SID et le dispatcher raster ;
- [x] avertissement de build lorsqu'une scène demande plus de huit sprites sur
  une même bande raster ou ne laisse pas assez de lignes pour reprogrammer le
  VIC-II ;
- [x] comportement documenté et déterministe lorsqu'une scène dépasse le budget
  d'affichage.

### Extension du studio graphique externe

- [x] ajouter un éditeur de sprites hires 24×21 en pixels 1 bit ;
- [x] ajouter un éditeur multicolore 12×21 en pixels logiques 2 bits avec aperçu
  24×21 ;
- [x] configurer la couleur propre au sprite et les deux couleurs multicolores
  partagées ;
- [x] créer, dupliquer, supprimer et réordonner les frames ;
- [x] créer des animations nommées avec vitesse, boucle et frame initiale ;
- [x] éditer l'origine et la hitbox avec retour visuel dans l'aperçu ;
- [x] prévisualiser l'animation, le retournement et les couleurs C64 ;
- [x] associer un asset et une animation à un objet placé sur la map ;
- [x] afficher l'emprise de la hitbox et la position de spawn dans l'éditeur de
  map ;
- [x] importer/exporter individuellement le JSON `sprite-asset-v1` ;
- [x] importer/exporter un projet regroupant map, charset, sprites et
  références ;
- [x] vérifier un aller-retour import/export sans perte et sans dépendance au
  runtime npm.

### Exemple cible : `examples/platformer-mini.js`

Créer un mini jeu de plates-formes original, inspiré des classiques 8 bits sans
reprendre de graphismes, noms ni niveaux protégés :

- joueur créé depuis l'objet `player-spawn` ;
- marche gauche/droite, gravité, saut et contact stable avec les plateformes ;
- animations idle, course et saut dans les deux directions ;
- collisions pilotées par les valeurs logiques de la tilemap ;
- caméra suivant le joueur avec zone morte et limites de niveau ;
- au moins deux zones ou salles jouables ;
- ennemis, objets ou collectibles provenant eux aussi d'objets de map ;
- utilisation simultanée de sprites matériels et virtuels ;
- chute hors niveau, réapparition au spawn et petit objectif de fin ;
- sons non bloquants et panneau de score fixe compatible avec le scrolling.

### Ordre d'implémentation

1. [x] figer les schémas d'objets et de sprites avec tests de validation ;
2. [x] introduire les coordonnées monde et le pool d'entités ;
3. [x] ajouter hitboxes, mouvement et collisions de tuiles ;
4. [x] relier la caméra, le culling et le multiplexeur ;
5. [x] étendre le studio graphique et vérifier les exports ;
6. [x] produire le mini jeu, les tests PAL/NTSC, la documentation et les profils.

### Critères de sortie

- [x] seize entités peuvent être liées aux sprites logiques 0 à 15 depuis des
  objets de map ;
- [x] leur position monde reste exacte lorsque la caméra et le viewport bougent ;
- [x] un sprite ne traverse pas une tuile dont `collision != 0` et traverse une
  tuile dont `collision == 0` ;
- [x] les contacts au sol, plafond, gauche et droite sont testés aux limites des
  tuiles et à plusieurs vitesses ;
- [x] la caméra suit une entité sur les deux axes sans sortir de la map ;
- [x] les sprites hors écran sont masqués puis réapparaissent à la bonne position ;
- [x] les contraintes des huit sprites virtuels sont testées, diagnostiquées et
  expliquées dans `MODE_EMPLOI_DEBUTANT.txt` ;
- [x] le studio crée un sprite hires, un sprite multicolore et une animation,
  puis les rattache à un objet de map sans retouche manuelle du JSON ;
- [x] `examples/platformer-mini.js` compile en ASM, BAS, LST et PRG avec un
  profil horizontal sûr en PAL/NTSC ; le scroll X/Y reste couvert séparément ;
- [x] le rapport de build indique la mémoire des sprites, le nombre d'entités
  visibles et le budget raster maximal ;
- [x] les tests existants de scroll, map dynamique, sprites et multiplexage ne
  régressent pas.

### Risques à mesurer avant validation

- coût CPU du cumul scroll, collision, animation et multiplexage dans une frame ;
- pression sur la banque VIC et alignement des données de sprites ;
- limite physique de huit sprites sur une même ligne raster malgré les seize
  indices logiques ;
- mémoire des frames d'animation et duplication involontaire des assets ;
- différences de budget entre PAL et NTSC ;
- stabilité du panneau fixe pendant un suivi vertical de caméra.

---

## v0.11.0 — Audio de jeu, outils et optimisation

### Objectif

Rendre les jeux agréables à produire, déboguer et optimiser avant de figer l'API
1.0.

### État au 7 août 2026

La v0.11.0 est terminée et validée par `examples/sid-game-audio.js`. Cette
évolution conserve l'ancienne forme de `playSong()`, ajoute la gestion sûre des
voix, les instruments, les patterns et le fade IRQ, puis fournit trois profils
d'optimisation mesurables avant le gel de l'API 1.0.

### Audio

- [x] priorité déterministe des effets grâce à une voix SID réservée ;
- [x] réservation configurable avec `c64.sid.reserveSfxVoice(1..3)` ;
- [x] pause/reprise de la musique sans perdre sa position ;
- [x] fade progressif non bloquant dans l'IRQ musicale ;
- [x] patterns imbriquables/répétables et instruments réutilisables ;
- [x] tempo logique 50 Hz stable PAL/NTSC par accumulateur ;
- [x] diagnostic lorsque musique et effet modifient la même voix ;
- [x] boucle optionnelle avec `loop: true` ;
- [x] rapport `sid-audio` sur les voix, le timing et les octets économisés.


### Optimisation

- [x] audit complet et élimination des familles de routines inutilisées, avec la liste dans le rapport de build ;
- [x] suppression automatique des trois tables musicales de la voix réservée ;
- [x] runtime de fade émis seulement à la demande ;
- [x] mutualisation des tables musicales identiques entre plusieurs voix ;
- [x] encodage compact des répétitions internes exactes aux tables musicales bouclées ;
- [x] choix `--opt size`, `--opt speed` et `--opt balanced`, avec `balanced` par défaut ;
- [x] compression RLE par bloc des maps et charsets seulement lorsque données et décompresseur réduisent réellement le PRG ;
- [x] rapport JSON comparatif taille/vitesse avec `--report`, économies RLE/audio et routines partagées ou omises.

### Option avancée

- [x] profilage du multiplexeur dans `optimization-summary` : comparaisons de tri,
  projection VIC-II et estimation conservatrice des cycles ;
- [x] conservation de la limite déterministe de seize sprites logiques. Une
  augmentation au-delà de seize reste une étude postérieure et ne bloque pas la
  1.0.

---

## v1.0.0 — Mini moteur de jeux C64

### Objectif

Stabiliser une API cohérente, documentée et validée par plusieurs jeux complets,
puis livrer un package NPM capable de produire aussi bien un PRG autonome qu'un
jeu multi-niveaux sur disquette D64.

### Décision d'architecture pour les jeux multi-niveaux

`c64.assets.loadMap()` et `loadSprite()` sont exécutés par Node.js pendant la
compilation : ils déclarent les fichiers connus du jeu. Ils ne peuvent donc pas,
à eux seuls, représenter le moment où le C64 change de niveau.

Le modèle 1.0 doit rester simple :

```js
const level1 = c64.assets.loadMap("assets/level1.json");
const level2 = c64.assets.loadMap("assets/level2.json");

c64.game.init(() => level1.activate());

c64.game.frame(() => {
  c64.control.if(levelFinished, () => level2.activate());
});
```

- dans un build PRG normal, les assets restent intégrés et `activate()` prépare
  le niveau depuis les données du programme ;
- dans un build D64, chaque `loadMap()`/`loadSprite()` est repéré par le
  compilateur et son contenu volumineux devient un module PRG de données sur la
  disquette ; ce type de répertoire est requis par la routine KERNAL `LOAD` ;
- `activate()` charge immédiatement pendant l'initialisation ou demande une
  transition différée lorsqu'il est appelé dans la frame. Le chargeur KERNAL
  installe alors la map, son charset, ses tables et ses sprites dépendants avant
  de reprendre le jeu ;
- le PRG principal contient uniquement le code, le chargeur, les noms de
  fichiers et les petites métadonnées indispensables, pas les pixels ni les
  cellules des niveaux externalisés ;
- une seule map de niveau occupe le slot RAM actif. Changer de niveau réutilise
  ce slot au lieu de réserver simultanément la RAM de `level1`, `level2`, etc. ;
- les sprites peuvent être `resident` (joueur/interface, chargés une fois) ou
  dépendre d'un niveau et partager des slots rechargeables ;
- le chargement est volontairement bloquant mais exécuté uniquement hors d'une
  frame active. Une demande faite pendant la frame est traitée juste après
  celle-ci. La musique et les IRQ sont suspendues puis restaurées proprement.

Cette activation explicite évite un chargement disque imprévisible au milieu
d'une IRQ tout en conservant un JavaScript lisible pour un débutant.

### Plan de livraison — trois phases maximum

#### Phase 1 — API de jeu 1.0 et contrat des niveaux

- [x] créer les scènes fixes `title`, `game`, `pause` et `gameOver`, avec des
  transitions explicites et sans allocation dynamique ;
- [x] ajouter score, vies et affichage numérique sans conversion coûteuse dans
  la boucle de frame ;
- [x] ajouter un générateur pseudo-aléatoire déterministe avec seed ;
- [x] ajouter des pools de taille connue à la compilation pour ennemis,
  projectiles et objets temporaires ;
- [x] stabiliser les spawns provenant de la couche objets des maps ;
- [x] ajouter `mapAsset.activate()`, `isActive()` et les identifiants de map
  active/en attente, sans casser l'initialisation des jeux à une seule map ;
- [x] ajouter une demande de changement de niveau bornée à un seul slot afin
  qu'un `activate()` appelé dans la frame soit exécuté en sécurité entre deux
  frames ;
- [x] faire réutiliser le même slot de cellules RAM par toutes les maps de niveau
  dans le mode disque (`$8000-$9FFF`) au lieu de conserver leur allocation
  distincte ;
- [x] définir les sprites `resident` et les sprites rechargeables par niveau via
  `loadSprite(..., { resident: false })` et `activate({ sprites: [...] })` ;
- [x] figer l'API publique, les types TypeScript, les erreurs et le plan mémoire
  avant de commencer le writer D64.

Les entités restent dans des pools fixes décidés à la compilation. La 1.0
n'introduit ni allocation générale, ni héritage runtime, ni ramasse-miettes.
La sauvegarde de configuration ou du high-score reste facultative et ne bloque
pas la sortie 1.0.

#### Phase 2 — Build D64 et chargement d'assets sur 1541

- [x] ajouter `--format d64` et la détection automatique de l'extension `.d64` ;
  un build D64 implique automatiquement le mode d'assets disque ;
- [x] prévoir `--disk-name`, `--program-name` et `--device` avec des valeurs par
  défaut utilisables immédiatement par un débutant ;
- [x] ajouter l'option orthogonale `--assets inline|disk` afin de produire un
  `.asm`, `.lst` ou `.bas` correspondant exactement au runtime disque ;
- [x] produire une image D64 standard de 174 848 octets avec BAM, répertoire,
  un programme principal `PRG` et des modules PRG de données avec adresse de
  chargement ;
- [x] générer des noms PETSCII uniques de seize caractères maximum et signaler
  clairement les collisions de noms ou le manque de blocs libres ;
- [x] créer un manifeste déterministe reliant chaque source JSON à son fichier
  disque, son type, son adresse/slot RAM et sa taille ;
- [x] externaliser map, charset, tables de tiles/collisions et données de sprites,
  sans recopier le JSON source ; les objets utiles deviennent les valeurs fixes
  d'initialisation des pools d'entités dans le PRG ;
- [x] ajouter un chargeur 6502 fondé sur `SETNAM`, `SETLFS` et `LOAD`, avec
  périphérique 8 configurable, contrôle d'erreur et restauration des IRQ/SID ;
- [x] charger directement dans les slots RAM définitifs lorsque possible et
  n'utiliser une zone temporaire que pour un format compressé ;
- [x] dédupliquer les sprites résidents communs à plusieurs niveaux et recharger
  seulement les dépendances propres au prochain niveau ;
- [x] exposer dans `assetReport` le contenu de la disquette, les blocs utilisés,
  les adresses, les dépendances et la taille du PRG principal ;
- [x] ajouter `examples/multilevel-d64.js` avec trois maps, un joueur résident,
  des sprites propres aux niveaux et une vraie transition `level1 → level2 → level3` ;
- [x] tester l'image dans VICE : montage, `LOAD"*",8,1`, démarrage, trois
  changements de niveau et gestion lisible d'un fichier absent.

État de la phase 2 : la chaîne automatique, les tests unitaires et la démo sont
terminés. `dist/multilevel.d64` a été contrôlé avec VICE 3.7 en émulation 1541
réelle jusqu'au troisième niveau. Ce contrôle a notamment révélé puis corrigé
le rejet `TYPE MISMATCH` des anciennes entrées USR par le KERNAL `LOAD`.

Commandes cibles :

```powershell
c64js build examples/multilevel-d64.js -o dist/multilevel.d64 --format d64
c64js build examples/multilevel-d64.js -o dist/multilevel.asm --format asm --assets disk
c64js build examples/multilevel-d64.js -o dist/multilevel.prg --format prg --assets inline
```

#### Phase 3 — Validation, gel de l'API et publication NPM

- [x] rendre jouables et stables les quatre jeux de validation en PAL et NTSC ;
- [x] ajouter des tests déterministes de scènes, RNG, pools, activation de niveau,
  writer D64, chaîne de secteurs 1541 et chargeur disque ;
- [x] faire construire tous les exemples PRG et le jeu D64 dans la CI ;
- [x] ajouter un test `npm pack`, installation dans un projet vide et exécution
  réelle de `npx c64js` sous Linux et Windows ;
- [x] corriger les métadonnées de publication (`author`, dépôt GitHub, version
  `1.0.0`) et vérifier automatiquement que chaque export NPM cible bien un
  fichier publié ;
- [x] figer README, guide débutant, guide D64, schémas, types et changelog ;
- [x] établir des budgets maximums de RAM, cycles et taille pour chaque jeu ;
- [x] produire une release candidate et effectuer le contrôle dans VICE. La
  publication NPM reste volontairement une action manuelle authentifiée et ne
  doit être lancée que si `npm run release:check` reste entièrement vert.

### Hors périmètre bloquant de la 1.0

- sauvegarde de high-score sur disque ;
- chargement rapide avec fastloader spécifique ;
- compression disque sophistiquée et chargement continu pendant le gameplay ;
- plus de seize sprites logiques ;
- allocation dynamique ou moteur de scènes généraliste.

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

## État de livraison 1.0

Les trois phases sont terminées. `npm run release:check` constitue désormais la
porte de sortie unique : 130 tests, tous les exemples, le D64 multi-niveaux, les
budgets des quatre jeux, le contenu du tarball et une installation réelle de la
CLI. La seule étape non automatisée est `npm publish`, qui exige volontairement
la connexion et la confirmation du propriétaire du compte NPM.

---

## Résultat attendu

Si ces jalons sont respectés, `js-c64` deviendra :

- un compilateur DSL accessible aux débutants ;
- un générateur d'assembleur 6502 lisible et optimisable ;
- une chaîne de création complète pour code, sprites, caractères, tiles et maps ;
- un outil capable de produire de vrais petits jeux C64 avec animation et son ;
- une base assez ouverte pour permettre aux utilisateurs avancés d'ajouter leurs
  propres routines assembleur lorsque le moteur atteint ses limites.
