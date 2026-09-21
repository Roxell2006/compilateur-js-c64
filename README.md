# js-c64

[![npm](https://img.shields.io/npm/v/js-c64.svg)](https://www.npmjs.com/package/js-c64)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Écrivez des programmes Commodore 64 en JavaScript naturel et compilez-les en
code machine 6502 : jeux, sprites, scroll, musique SID et graphismes haute
résolution. Aucun interpréteur JavaScript ne tourne sur le C64.

**La version 1.1.0 est en préparation.** Ce README présente le mode naturel de
la branche de développement. `package.json` reste en **1.0.1** ; les exemples
ci-dessous demandent le code contenant les nouveautés 1.1.0.

## Sommaire

- [Installation](#installation)
- [Premier programme](#premier-programme)
- [Fonctionnalités](#fonctionnalités)
- [JavaScript pris en charge](#javascript-pris-en-charge)
- [Compilation](#compilation)
- [API Node.js](#api-nodejs)
- [Exemples et documentation](#exemples-et-documentation)
- [Versions](#versions)
- [Développement](#développement)
- [Licence](#licence)

## Installation

Prérequis : **Node.js ≥ 18**, npm et un émulateur ou un C64 pour lancer les PRG.
Le compilateur et l'assembleur sont inclus dans le paquet.

### Essayer la future 1.1.0

Dans votre copie du dépôt, sur la branche contenant le mode naturel :

```sh
npm install
node src/cli.js build examples/natural-helpers.js -o dist/natural-helpers.prg
```

Pour créer un projet voisin de cette copie, nommée ici `js-c64` :

```sh
mkdir mon-jeu
cd mon-jeu
npm init -y
npm pkg set type=module
npm install "../js-c64"
```

Adaptez le chemin à votre dépôt local. Récupérer le dépôt public ne récupère
pas automatiquement une branche de travail non publiée.

### Après publication de la 1.1.0

L'installation depuis le registre sera :

```sh
npm install js-c64@^1.1.0
```

Pour utiliser explicitement la génération précédente : `npm install js-c64@1.0.1`.
Elle ne comprend pas toutes les fonctionnalités naturelles décrites ici.

`c64js init <dossier>` est disponible, mais son modèle utilise encore une
dépendance `^1.0.0` et un source minimal sans directive naturelle. Le guide
privilégie la création manuelle ci-dessus en attendant son adaptation.

## Premier programme

Créez `main.js` :

```js
"use c64";
import { c64 } from "js-c64";

const joystick = c64.input.joystick(2);
let couleur = 1;

function init() {
  c64.screen.setup({ color: c64.COLOR_CYAN });
  c64.printCentered(10, "FEU : CHANGER LA COULEUR");
}

function update() {
  if (joystick.firePressed()) {
    couleur = (couleur + 1) & 15;
    c64.borderColor(couleur);
  }
}

c64.game.run({ init, update });
```

Compilez, puis ouvrez le PRG avec l'autostart de votre émulateur :

```sh
npx c64js build main.js -o dist/mon-jeu.prg
```

Le source C64 passe par `c64js build`, pas par `node main.js`. Les appels simples
comme `c64.clearScreen()`, `c64.borderColor(...)` et `c64.backgroundColor(...)`
restent disponibles.

## Fonctionnalités

| Domaine | Outils |
| --- | --- |
| Langage naturel | Variables byte/word, conditions, boucles, fonctions, tableaux typés fixes |
| Écran texte | Préparation écran, texte positionné, nombres, cadres et rectangles |
| Boucle de jeu | Initialisation, mise à jour, cadence logique 50 Hz adaptée PAL/NTSC |
| Entrées | Joystick, clavier, appui/maintien/relâchement |
| Organisation | Scènes, compteurs décimaux, hasard reproductible, actions périodiques |
| Sprites | Propriétés naturelles, animations, collisions, multiplexage jusqu'à 16 sprites logiques |
| Maps et scroll | Charsets, tuiles, objets, entités, collisions de terrain, caméra et panneau fixe |
| Audio SID | Trois voix, instruments, patterns, musique et effets non bloquants |
| Haute résolution | Points, lignes, rectangles et cercles, paramètres calculés |
| Matériel | Assembleur 6502 intégré, mémoire et dispatcher raster partagé |
| Livraison | PRG, binaire brut, ASM, listing, BASIC/DATA et disquettes D64 |
| Diagnostic | Symboles, rapports de ressources, profils de compilation et optimisations naturelles |

Le multiplexeur réutilise les huit sprites matériels à différentes hauteurs ;
il ne permet pas seize sprites simultanés sur une même ligne raster. En HR,
les couleurs restent partagées par cellules de 8 × 8 pixels. Le budget CPU et
la mémoire du C64 restent des contraintes réelles.

## JavaScript pris en charge

La directive `"use c64"` active un **sous-ensemble de JavaScript compilé** :

- `let`, `const`, `if/else`, `for`, `while`, `break`, `continue` ;
- fonctions nommées, paramètres et retours scalaires, sans récursion ;
- entiers non signés 8 bits et 16 bits via `c64.byte(...)` / `c64.word(...)` ;
- comparaisons, logique court-circuitée, calculs entiers et opérations binaires ;
- multiplication par constante et décalages constants ;
- `Uint8Array` / `Uint16Array` de 1 à 256 éléments, indices, `length` et `fill` ;
- références aux sprites, entités, tableaux et autres ressources du moteur.

Il n'y a ni allocation dynamique générale, ni flottants, ni DOM, ni API Node.js
sur la cible. La division et le modulo dynamiques, les classes, les promesses
et les méthodes générales de `Array` ne sont pas disponibles. Les assets,
configurations et noms de ressources sont préparés à la compilation.

Les calculs débordent selon leur largeur : élargissez **avant** l'opération
avec `c64.word(valeur)` pour dépasser 255. Les paramètres signés de mouvement
ont leur propre convention ; les comparaisons naturelles restent non signées.

Les optimisations des temporaires, copies et boucles reconnues sont actives
par défaut. Le [guide](MODE_EMPLOI_DEBUTANT.txt) explique le langage et les limites
sans imposer de manipuler les détails du code 6502 au quotidien.

## Compilation

```text
c64js build <source.js> -o <sortie>
  --format prg|bin|asm|lst|data|d64
  --assets inline|disk
  --device 8
  --disk-name NOM
  --program-name NOM
  --sys ADRESSE
  --opt size|speed|balanced
  --map symboles.json
  --report rapport.json
```

Le format est déduit de l'extension si `--format` est omis.

| Extension | Résultat |
| --- | --- |
| `.prg` | Programme C64 chargeable avec lanceur BASIC |
| `.bin` | Octets bruts |
| `.asm` | Assembleur généré |
| `.lst` | Listing avec adresses et octets |
| `.bas` | Programme BASIC/DATA (`--format data`) |
| `.d64` | Image disque, assets séparés par défaut |

```sh
npx c64js build main.js -o dist/jeu.prg --opt balanced --report dist/rapport.json
npx c64js build main.js -o dist/jeu.lst --map dist/symboles.json
npx c64js build main.js -o dist/jeu.d64 --assets disk --device 8
```

Les profils choisissent les stratégies disponibles ; mesurez les gains sur
votre programme. Une compilation réussie ne remplace pas un test visuel,
sonore et de timing dans l'émulateur ou sur la machine ciblée.

## API Node.js

Pour vos outils de construction, dans un script Node.js distinct du source C64 :

```js
import { writeFile } from "node:fs/promises";
import { compileFile } from "js-c64";

const result = await compileFile("main.js", { opt: "balanced" });
await writeFile("jeu.prg", result.prgBytes);
console.log(result.assetReport);
```

`compileJsToC64Outputs` accepte un texte source. Les résultats exposent notamment
`prgBytes`, `bytes`, `asmText`, `listingText`, `symbols`, `basicText`, `assetReport`
et `diskFiles`. L'option `naturalOptimizations: false` permet une comparaison
diagnostique avec la passe naturelle désactivée.

Exports spécialisés : `js-c64/assembler`, `js-c64/compiler`, `js-c64/assets`,
`js-c64/d64`, `js-c64/irq/raster`. Les [types](index.d.ts) décrivent les objets et
options publics ; les [schémas](https://github.com/Roxell2006/compilateur-js-c64/tree/main/schemas)
décrivent les ressources JSON.

## Exemples et documentation

**Commencer : [Guide progressif en français](MODE_EMPLOI_DEBUTANT.txt).**
Installation, langage naturel, écran, jeu, assembleur, sprites, SID, HR,
interruptions, maps, scroll et disque, avec table des matières et référence rapide.

| Programme | Ce qu'il montre |
| --- | --- |
| [Tetris naturel](examples/natural-tetris.js) | Grille, tableaux, fonctions et rotations |
| [Platformer naturel](examples/natural-platformer.js) | Entités, physique, animation, caméra, collisions et scroll |
| [HR interactive](examples/natural-hires-interactive.js) | Calculs, pinceau et dessin conditionnel |
| [Helpers](examples/natural-helpers.js) | Préparation écran, tableaux et boucle de jeu |
| [Sprites](examples/natural-sprites.js) | Coordonnées, couleurs et entrées |
| [Scroll](examples/natural-scroll.js) | Commandes et scroller |

Les exemples et leurs assets sont livrés avec le paquet. Dans un projet
indépendant, adaptez leur import interne en `import { c64 } from "js-c64"` et
copiez les JSON référencés.

Le [dépôt source](https://github.com/Roxell2006/compilateur-js-c64) contient aussi
le Studio graphique (`studio graphique/index.html`), les tests, scripts et
rapports de validation (`docs/`). Ces dossiers ne sont pas inclus dans le paquet npm.
Les [notes de version](CHANGELOG.md) détaillent les changements.

## Versions

### 1.1.0 

L'objectif est de rendre l'écriture des programmes plus directe tout en
conservant la compilation native 6502 et les appels existants.

- Mode naturel : conditions, calculs, boucles, fonctions, valeurs byte/word et
  tableaux typés fixes, avec vérifications et diagnostics adaptés au C64.
- Accès naturel aux propriétés des sprites et entités ; paramètres calculés
  pour le texte, les formes HR et les opérations prises en charge.
- Abstractions communes : `screen.setup`, `game.run`, `game.every`, remplissage
  de tableaux et `joystick.scroll`.
- Trois références réécrites : Tetris, Platformer et démo HR interactive.
- Corrections HR et validation des formes calculées.
- Optimisation conservatrice des temporaires, copies et boucles de remplissage,
  avec garde-fous pour les interruptions et les accès aux API.
- Guide réorganisé autour du mode naturel.

Les interfaces de la génération 1.0 restent conservées ; le parcours conseillé
pour les nouveaux programmes est le mode naturel. **Cette section décrit le
travail de développement, pas une version 1.1.0 déjà publiée sur npm.**

### 1.0.1 — corrections et fiabilisation

- Corrections de timing du Platformer et du scroll : préparation des déplacements,
  copies d'écran, phases fines/grossières et présentation des sprites.
- Fiabilisation des attentes raster et du multiplexeur, notamment au passage
  des lignes 255/256 et avec l'adaptation NTSC.
- Bruitages non bloquants à cadence 50 Hz PAL/NTSC, redéclenchement et préservation
  des temporaires de page zéro utilisés par les interruptions audio.
- Routines de lignes de maps partagées pour les grands niveaux ; corrections
  de références de labels en page zéro.
- Préservation des caractères système dans les charsets personnalisés,
  ajustements du Studio et corrections de Snake.
- Tests d'exécution renforcés pour maps, timing, audio et coexistence des moteurs.

### 1.0.0 — première version npm

- Compilation JavaScript vers 6502 et assembleur intégré.
- Écran texte, HR, sprites, animation, collisions, maps, scroll, SID et raster.
- Organisation des jeux : scènes, scores/vies, hasard déterministe et ressources
  fixes ; assets et chargement de niveaux.
- Sorties PRG, BIN, ASM, listing, BASIC/DATA et D64 ; profils d'optimisation et
  rapports de compilation.
- Distribution npm avec CLI, API, types, schémas, exemples et contrôles de livraison.

## Développement

Depuis le dépôt :

```sh
npm install
npm test
npm run build:demos
npm run package:check
```

`npm run release:check` reconstruit et valide la livraison, dont l'installation
du paquet produit. Les mesures et rapports d'optimisation se trouvent dans
`scripts/measure-natural-optimizations.js` et `docs/natural-compiler-optimization.md`.

Pour signaler un problème, joignez un source minimal, les assets nécessaires,
la commande de compilation, la version utilisée et le contexte PAL/NTSC dans
les [issues](https://github.com/Roxell2006/compilateur-js-c64/issues).

## Licence

[MIT](LICENSE) — Roxell2006.
