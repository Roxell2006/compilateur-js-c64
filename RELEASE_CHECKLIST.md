# Préparation de js-c64 1.1.0

Ce fichier est réservé à la maintenance du dépôt et exclu du paquet npm.
La publication reste une opération manuelle du propriétaire du paquet.

## Vérification complète

Depuis le dépôt :

```sh
npm ci
npm run release:check
```

Cette commande ne publie rien. Elle :

1. Vérifie la cohérence de version entre package.json et package-lock.json.
2. Exécute les tests, dont les tests d'exécution 6502 et de timing PAL/NTSC.
3. Recompile les exemples et le D64 multi-niveaux.
4. Contrôle les budgets de sept programmes, dont Tetris, Platformer et HR interactive.
5. Construit l'archive npm et refuse les fichiers de développement ou les exports manquants.
6. Installe l'archive dans un projet temporaire, vérifie les exports et compile les exemples et les programmes du guide/README.
7. Teste le CLI installé et le projet créé par `c64js init`.
8. Conserve l'archive validée, son manifeste et son empreinte SHA-512 dans `dist/release/`.

`npm run package:check` inspecte seulement le contenu prévu par `npm pack`.
`prepublishOnly` exécute le contrôle complet lors d'une publication depuis le dépôt.

Dans un environnement sans réseau, après installation des dépendances :

```sh
npm run release:check -- --offline
```

Cette variante utilise des archives des dépendances locales dont les versions
correspondent au lockfile. Elle installe toujours le paquet js-c64 dans un projet
vide, sans lien vers ses sources. Le rapport indique cette provenance ; ce
contrôle ne vérifie pas la disponibilité du registre npm. Les dépendances de
l'archive publiée restent inchangées.

## Contenu livré

Inclus : compilateur et runtime JavaScript, CLI, types, schémas, exemples utiles,
assets JSON, README, changelog, licence et guide utilisateur.

Exclus : tests et fixtures, scripts de construction et de validation, rapports,
PRG/ASM/listings/D64 générés, caches, fichiers temporaires, Studio graphique,
configuration de développement et documents de maintenance. L'ancien exemple
`hires-test.js` reste dans le dépôt mais est exclu de npm ; les exemples HR
utilisateur sont fournis séparément.

Les tests ne doivent pas être supprimés du dépôt : ils empêchent les régressions.
La liste `files` de package.json et le validateur de contenu contrôlent l'archive.

## Artefacts vérifiables

- `dist/release/js-c64-1.1.0.tgz` : archive à publier manuellement.
- `dist/release/pack-manifest.json` : inventaire exact des fichiers de cette archive.
- `dist/release/package-validation.json` : version, environnement vérifié, résultats et intégrité.
- `dist/release/validation.json` : mesures et budgets des programmes.
- `dist/release/multilevel.d64` : image disque de référence reconstruite.

Les budgets ne remplacent pas les tests de jeu. Les cycles indiqués dans le
rapport de ressources sont des estimations ciblées, pas le coût total de toute
une frame. Les tests d'exécution vérifient séparément plusieurs comportements.

## Publication manuelle

Après validation, vérifiez le compte npm et publiez l'archive exacte :

```sh
npm whoami
npm publish ./dist/release/js-c64-1.1.0.tgz
```

Cette deuxième commande est réservée au propriétaire : elle n'est exécutée par
aucun script de préparation. Si le contenu livré est modifié, relancez d'abord
`npm run release:check` pour reconstruire et revalider l'archive.

Après publication, vérifiez dans un projet distinct l'installation de
`js-c64@1.1.0` et la compilation d'un PRG avec `npx c64js`.
Ne réutilisez pas un numéro de version déjà publié.

## Portée des vérifications

Le rapport `package-validation.json` indique la plateforme et la version Node
réellement utilisées lors du contrôle local. La CI est configurée pour répéter
le contrôle sous Windows/Linux et Node 18/20/22 ; une exécution locale ne prouve
pas que tous ces jobs distants ont été exécutés.
Un dernier essai visuel et sonore dans VICE ou sur le C64 ciblé complète les
tests automatisés avant la publication.
