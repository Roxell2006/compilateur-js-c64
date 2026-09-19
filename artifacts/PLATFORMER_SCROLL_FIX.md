# Scintillement de Platformer Mini : diagnostic et correction

Le cas reproduit vient du calendrier des copies de Screen RAM et de Color RAM.
La taille totale de la map n'est pas, à elle seule, l'explication : la fenêtre
affichée mesure ici 36 × 20 caractères, contre 28 × 7 caractères effectivement
scrollés dans `tilemap-scroll-x`. La physique et les sprites ajoutent du travail.

Avant cette correction, la logique commençait après la zone de scroll, puis
effectuait immédiatement la copie lors du passage d'une colonne. Dans la
reproduction PAL, la copie commençait vers les lignes 255 à 281. Le VIC pouvait
donc relire certaines lignes avant leur correction : une cellule de l'ancienne
colonne restait visible au bout d'une plateforme. La mémoire redevenait correcte
après la copie, ce qui échappait aux anciens tests qui contrôlaient uniquement
son état final. L'attente du multiplexeur pouvait ensuite perdre une image.

Le compilateur prépare maintenant le suivi après l'IRQ d'entrée, mémorise le
déplacement de colonne et attend la ligne 214 pour copier les lignes du haut
vers le bas. Les deux pas de caméra sont achevés avant la copie, même si le
premier pas franchit une colonne. Les trois sprites utilisent des canaux fixes
et sont présentés par l'IRQ 256. Un indicateur conserve une mise à jour reçue
pendant une copie. Les copies vers la gauche utilisent quatre cellules par
boucle et un index positif pour limiter les pénalités de franchissement de page.

Cette sélection automatique s'applique aux grandes fenêtres horizontales avec
un unique appel direct à `follow`, au plus huit sprites logiques et sans raster
de jeu explicite, mouvement manuel, appel de routine utilisateur ni changement
de scène/map. Les autres configurations conservent leur chemin de compilation.
La map, la fenêtre, la vitesse du joueur et les règles du jeu sont conservées.

## Mesures

Le modèle de test exécute les instructions 6502 produites, les IRQ installées,
les sauvegardes/restaurations KERNAL et simule prudemment les arrêts CPU des
badlines et des sprites. Il contrôle chaque ligne de caractères/couleurs au
début de sa lecture raster. Ce n'est pas un émulateur VIC complet.

| Reproduction de 100 images PAL | Avant | Après |
| --- | ---: | ---: |
| Lignes échantillonnées incorrectes | 27 / 1 980 | 0 / 1 980 |
| Mises à jour logiques | 90 | 100 |
| Début des copies, ligne raster | 255–281 | 214 |
| Durée maximale de copie, cycles écoulés avec IRQ et DMA modélisés | 18 891 | 17 634 |

La régression permanente `test/platformer-raster.test.js` parcourt ensuite
les 45 colonnes de caméra, dans les deux sens, avec trois sprites visibles :
420 mises à jour sur 420 images et plus de 8 000 lignes contrôlées sans cellule
incorrecte. Elle vérifie aussi la cohérence du décalage fin et de la position
pixel à l'entrée de la zone de scroll. Les positions des entités sont pilotées
par le test pour couvrir la map sans dépendre d'une partie jouée manuellement.

Le PRG reconstruit mesure **10 174 octets** : +959 par rapport au correctif
précédent de 9 215 octets, mais −928 par rapport à la version initiale de
11 102 octets. Le surcoût réduit le temps de copie ; le tri et l'attente du
multiplexeur ne sont plus émis pour ce profil. Budget maximal inchangé.

## Vérification et limites

- 163 tests réussis ; contrôle de release, budgets des quatre jeux et
  installation du paquet npm dans un projet vide réussis.
- Paquet npm : 61 fichiers ; tests, modèles de test, rapports et PRG locaux
  restent exclus de la publication.
- Le contrôle complet a utilisé un seul worker Vitest, les lancements avec
  le nombre de workers par défaut ayant échoué avec `ERR_IPC_CHANNEL_CLOSED`
  dans cet environnement Windows.
- Aucun test visuel dans VICE ou sur un vrai C64 n'a été effectué ici.
  Ce scénario vérifie le timing PAL ; il ne valide pas visuellement le NTSC.
  Les estimations `FitsPal`/`FitsNtsc` du rapport couvrent la copie CPU seule,
  pas le cumul des IRQ, du DMA et de la logique du jeu.

Le modèle des lectures de matrice et de couleurs s'appuie sur la description
des c-access/badlines dans [The MOS 6567/6569 video controller (VIC-II)](https://www.cebix.net/VIC-Article.txt).
Le PRG à essayer est `dist/platformer-mini.prg`.
