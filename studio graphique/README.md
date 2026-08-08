# JS-C64 Asset Studio

Application externe et autonome pour créer les assets graphiques de `js-c64` v0.9 et v0.10.1 :

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

Les codes 0 à 63 forment la zone système et sont protégés contre la modification,
le déplacement et la suppression. Dupliquer une lettre crée toutefois une copie
modifiable à la fin du charset. Les créations commencent au code 64, puis les
codes 65 à 90 peuvent notamment servir aux variantes `Shift+A` à `Shift+Z`.
Dans un jeu, utilisez le code numérique du caractère personnalisé :

```js
c64.writeChar(10, 10, 64, c64.COLOR_YELLOW); // premier caractère personnalisé
```

Lorsqu'un ancien JSON possède assez de place, le studio ajoute automatiquement la
zone système devant ses caractères et remappe tous les indices de métatuiles : leur
apparence reste inchangée. Le bouton `Restaurer A–Z / 0–9` permet de refaire cette
installation manuellement.

À l'export JSON, JS, binaire ou assembleur, ces 64 caractères et leurs 512
octets ne sont jamais écrits. Seuls les caractères personnalisés sont exportés,
sans propriété spéciale à ajouter. Dès qu'un programme installe ce charset, le
compilateur copie automatiquement les glyphes originaux depuis la ROM du C64
vers la RAM, puis place les caractères personnalisés à partir du code écran 64.

Pour utiliser un export JSON dans un programme `js-c64`, placez le fichier dans votre projet puis chargez-le :

```js
const level = c64.assets.loadMap("assets/ma-map-c64.json");
level.draw();
```

Les modes `hires` et `multicolor`, ainsi que `map.objects`, sont directement compatibles avec le schéma `map-asset-v1`. En multicolore, une cellule utilise les trois couleurs globales du charset et sa couleur propre, limitée à 0–7 par le VIC-II.

## Sprites et animations v0.10.1

L'onglet `Sprites` crée des assets conformes à `sprite-asset-v1` :

- sprites hires 24 x 21 ou multicolores 12 x 21 pixels logiques ;
- couleur propre et deux couleurs multicolores partagées ;
- plusieurs frames que l'on peut créer, dupliquer, supprimer et réordonner ;
- animations nommées avec ordre des frames, vitesse, boucle et animation initiale ;
- origine et hitbox visibles dans l'aperçu animé ;
- import et export individuel en `nom.sprite.json`.

Dans l'onglet `Map`, sélectionnez d'abord un objet, puis choisissez `Asset du
studio` et `Animation initiale`. Le studio remplit automatiquement les champs
`sprite` et `properties.animation` attendus par `c64.map.spawn()`. Les sprites
restent stockés séparément de la map afin que les deux exports respectent leurs
schémas JSON respectifs.

Dans l'éditeur de map, les options `Sprites` et `Hitboxes` affichent la première
frame de l'animation choisie, l'emprise de collision, l'origine du sprite et la
position exacte du spawn. Ces repères sont uniquement des aides visuelles et ne
modifient pas les données exportées.

Pour déplacer un objet déjà placé, sélectionnez l'outil `Objet`, puis faites-le
glisser vers une autre case. Vous pouvez aussi le sélectionner dans la liste et
modifier précisément ses champs `Position X` et `Position Y`. Le studio refuse
les positions hors de la map et les cases déjà occupées par un autre objet.

## Projet studio complet

Le menu `Autres exports` propose `Projet complet .json`. Ce fichier
`.studio.json` regroupe :

- l'asset de map, son charset, ses métatuiles et ses objets ;
- toute la bibliothèque de sprites ;
- les références `object.sprite` et `properties.animation`.

`Importer projet complet` restaure ces données ensemble. Le format de projet
sert uniquement au travail dans le studio : pour compiler un jeu, continuez à
exporter la map avec `Exporter JSON` et chaque sprite avec `Exporter sprite JSON`.
Un test d'aller-retour JSON vérifie que les 63 octets de chaque frame, les
animations, les hitboxes et les références d'objets restent identiques.
