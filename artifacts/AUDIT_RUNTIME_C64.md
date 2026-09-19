# Audit et optimisations du runtime C64

Date : 11 septembre 2026.

Le cas signalé est `tilemap-scroll-x.js`, avec une carte agrandie, dans un
émulateur PAL. La carte modifiée exacte n'étant pas disponible, une variante
127 × 64 cases a été construite avec la fenêtre originale de 28 × 8 caractères
(dont une ligne réservée à la transition verticale).

## Corrections

| Zone | Problème identifié | Modification |
|---|---|---|
| Boucle de jeu | Une attente d'égalité sur `$D012` peut manquer sa ligne si une IRQ l'occupe ; le bit 8 n'était pas vérifié. | Attente du franchissement de la ligne sur le raster complet, avec traitement de la ligne 0. |
| Scroll + sprites virtuels | Le multiplexeur imposait la ligne 200 même si la tilemap était encore visible. | Utilisation de la ligne recommandée après la bande de scroll ; conservation d'une surcharge explicite par `rasterLine`. |
| Copie de tilemap | La nouvelle phase fine était publiée après la copie, trop tard si l'IRQ d'entrée intervenait pendant celle-ci. | Publication de la phase avant la copie des lignes. |
| Grande carte | Le calcul d'adresse était développé à chaque site d'appel, avec un coût dépendant des bits de la largeur. | Routine partagée ; table des adresses de lignes pour les scrollers en modes `balanced`/`speed`, calcul arithmétique partagé en mode `size`. |
| Taille du scroll | Les quatre routines de copie étaient présentes même pour une seule direction utilisée. | Émission des seules directions référencées. |
| Multiplexage | `$D012` recommence à zéro à la ligne 256, avant le changement d'image. Un canal pouvait être recyclé avant son affichage prévu. | Attente explicite du changement d'image avant le recyclage. |
| Multiplexage NTSC | Une image sans mise à jour logique 50 Hz ne rejouait pas les canaux multiplexés. | Rejeu du rendu à chaque image vidéo. |
| Attributs des sprites | Y pouvait être écrit avant les attributs ; les mises à jour de bits écrivaient des états intermédiaires. | Écriture de Y après les attributs, une seule écriture par bit de registre, contrôle du délai restant avant Y. |
| Interruptions | Le travail du lecteur musical pouvait retarder les écritures VIC d'un split ; le multiplexeur seul restait exposé au timer KERNAL. | Exécution des écritures du handler avant les runtimes audio ; désactivation par défaut du timer KERNAL pour le multiplexage. |
| Bruitages | `beep`, `noise`, `explosion`, `laser`, `pickup` utilisaient des boucles CPU bloquantes. | Séquenceur IRQ partagé, temporisé à 50 Hz sur PAL et NTSC, demandes atomiques et tables mutualisées. |
| Assembleur | Une référence de label en page zéro écrivait deux octets, écrasant l'opcode suivant. | Correction sur un octet et rejet d'un label hors page zéro. |

Le séquenceur de bruitages occupe sept octets d'état (`$C5B0..$C5B6`). Il
préserve `$FB/$FC`, également utilisés par la tilemap, et le masque
d'interruption du code qui déclenche un effet. Les mesures du banc de test
donnent moins de 80 cycles pour chaque déclenchement et moins de 300 cycles
pour un tick du séquenceur, hors entrée/sortie d'IRQ et DMA VIC.

`click()` seul conserve son implantation compacte sans séquenceur. Si des
effets temporisés sont utilisés, il rejoint leur séquenceur. Le dernier effet
demandé remplace le précédent sur la voix réservée, ou la voix 1 par défaut.
Les appels consécutifs ne constituent pas une file de lecture. Les durées sont
maintenant liées à l'horloge vidéo ; les bruitages peuvent donc avoir une durée
différente de celle produite par les anciennes attentes CPU.

`sid.note()` et `sid.rest()` avec une durée positive restent synchrones pour
préserver leur sémantique historique. Leur utilisation produit désormais le
diagnostic `SID_BLOCKING_DELAY`. Pour une suite de notes en fond, utiliser
`playSong()` ; les six helpers de bruitage sont non bloquants.

## Résultats de taille

Comparaison par compilation des mêmes sources avant/après, mode `balanced`.
Les nombres incluent le chargeur et l'en-tête PRG.

| Exemple | Avant | Après | Différence |
|---|---:|---:|---:|
| tilemap-scroll-x | 3 342 | 2 809 | −533 octets (−15,9 %) |
| platformer-mini | 11 102 | 9 215 | −1 887 octets (−17,0 %) |
| snake | 4 110 | 2 859 | −1 251 octets |
| maze-game | 1 807 | 1 361 | −446 octets |
| sprite-multiplex-16 | 2 237 | 2 267 | +30 octets |
| sid-game-audio | 989 | 999 | +10 octets |
| sid-beep | 575 | 575 | 0 |
| breakout-mini | 3 361 | 3 371 | +10 octets |

Les petites augmentations correspondent à la synchronisation renforcée. Le
séquenceur audio n'est ajouté qu'aux programmes qui utilisent les effets
temporisés ; `sid-beep.js` utilise le lecteur musical existant.

La variante PAL de 127 × 64 cases produit un PRG de **3 769 octets**, sans
conflit mémoire détecté. Ses données se compressent bien ; une carte contenant
des données différentes n'aura pas nécessairement cette taille.

## Vérifications réalisées

- **162 tests réussis** : assembleur, compilateur, assets/studio, API, PRG/BASIC,
  disque D64 et exécution des routines 6502 ajoutées.
- Adressage de chacune des **8 128 cases** d'une carte 127 × 64 dans les modes
  `balanced` et `size`. Avec les tables, au plus **42 cycles**, `JSR` compris.
- Copies dans les quatre directions sur cette grande carte : caractères,
  couleurs, franchissements de pages, phase fine et conservation du panneau.
- Les pas grossiers de la fenêtre testée restent sous **5 500 cycles CPU**.
- Raster 0, 30, 200 et 250 ; interruption simulée recouvrant la ligne attendue.
- Recyclage des sprites aux changements de raster PAL/NTSC et six rendus pour
  cinq mises à jour logiques dans six images NTSC.
- Durées, fin de note, remplacement d'effet, durée maximale de 255 ticks,
  préservation de la pile et du pointeur de map.
- Connexion du séquenceur aux IRQ autonome, musicale, animateur, combinée et
  utilisateur, avec un seul appel par image.
- `release:check` réussi : reconstruction des exemples, quatre budgets de jeux,
  création du D64, `npm pack`, installation locale dans un projet vierge et
  compilation avec le CLI installé. Aucun paquet n'a été publié.

## Limites de la validation

Le banc 6502 exécute les octets générés ; il ne simule pas le VIC-II ou le rendu
audio du SID au cycle près. Les estimations CPU excluent le vol de cycles du
VIC, le travail des autres IRQ et la logique du jeu. Les tests ne constituent
donc pas une certification visuelle ou sonore sur matériel réel.

Le multiplexeur reste un ordonnanceur par polling, avec huit canaux matériels.
Les sprites trop proches ou déjà en retard sont omis pour l'image courante.
La préparation commence dans le bord inférieur : les sprites étendus jusque
dans ce bord et les très petits Y demandent une validation particulière. Une
grande fenêtre avec copies simultanées X/Y et beaucoup de sprites peut encore
dépasser le temps disponible. Les rapports de budget sont des estimations,
pas une garantie de 50 images/s pour toute combinaison de code utilisateur.

La dimension totale de la carte et celle de la fenêtre visible sont distinctes.
Agrandir la fenêtre augmente directement le nombre de copies Screen/Color RAM.
Les calculs d'adresse ont été optimisés, mais cette contrainte reste présente.

Le comportement des IRQ, du neuvième bit du raster et du DMA a été recoupé avec
la [description du VIC-II par Christian Bauer](https://www.cebix.net/VIC-Article.txt).

## Fichiers pour le retest PAL

- [Exemple original reconstruit](../dist/tilemap-scroll-x.prg)
- [Variante grande carte PAL](tilemap-scroll-large-pal.prg)
- [Source de la variante](tilemap-scroll-large-pal.js)
- [Rapport mémoire et budgets de la variante](tilemap-scroll-large-pal.report.json)
- [Journal de validation du paquet](release-check.txt)
- [Comparaison de tailles en JSON](runtime-size-comparison.json)

Le retest visuel dans l'émulateur PAL et avec la carte modifiée exacte reste
nécessaire pour confirmer la disparition du symptôme initial.
