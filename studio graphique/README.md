# JS-C64 Asset Studio

Application externe et autonome pour créer les assets graphiques de `js-c64` v0.9 :

- caractères hires 8 × 8 ou multicolores 4 × 8 et charset C64 ;
- zone système protégée avec `A–Z` aux codes écran 1–26, espace au code 32,
  ponctuation courante et `0–9` aux codes 48–57 ;
- métatuiles de 1 × 1 à 8 × 8 caractères, avec couleurs, collision et propriétés ;
- maps redimensionnables avec crayon, rectangle, remplissage, pipette, gomme et sélection ;
- couche d'objets/spawns avec type, coordonnées et propriétés JSON ;
- import/export JSON v1 compatible avec `c64.assets.loadMap("...")` ;
- exports du charset en `.bin`, du projet en module `.js` et des données en `.asm`.
- exports de map en `.bin` brut ou compressé RLE, avec comparaison des tailles.

## Lancer le studio

Ouvrez simplement `index.html` dans un navigateur récent. Le studio ne dépend ni de npm, ni d'un serveur, ni d'une connexion Internet. Le projet courant est sauvegardé automatiquement dans le stockage local du navigateur.

## Textes, scores et caractères personnalisés

Un nouveau projet conserve les indices employés par `c64.printAt()` et les autres
fonctions de texte. Le champ `Tester un texte ou un score` permet de vérifier
directement un texte comme `SCORE: 000`.

Les codes 0 à 64 forment la zone système et sont protégés contre la modification,
le déplacement et la suppression. Dupliquer une lettre crée toutefois une copie
modifiable à la fin du charset. Les créations commencent au code 65, affiché comme
`Shift+A`, puis continuent avec `Shift+B` jusqu'à `Shift+Z` et les codes spéciaux.
Dans un jeu, utilisez le code numérique du caractère personnalisé :

```js
c64.writeChar(10, 10, 65, c64.COLOR_YELLOW); // premier caractère personnalisé
```

Lorsqu'un ancien JSON possède assez de place, le studio ajoute automatiquement la
zone système devant ses caractères et remappe tous les indices de métatuiles : leur
apparence reste inchangée. Le bouton `Restaurer A–Z / 0–9` permet de refaire cette
installation manuellement.

Pour utiliser un export JSON dans un programme `js-c64`, placez le fichier dans votre projet puis chargez-le :

```js
const level = c64.assets.loadMap("assets/ma-map-c64.json");
level.draw();
```

Les modes `hires` et `multicolor`, ainsi que `map.objects`, sont directement compatibles avec le schéma `map-asset-v1`. En multicolore, une cellule utilise les trois couleurs globales du charset et sa couleur propre, limitée à 0–7 par le VIC-II.
