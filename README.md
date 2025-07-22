# 🎢 RIDEXPLORERS API

RIDEXPLORERS API expose une interface REST simple contenant des données récupérées sur [RCDB](https://rcdb.com). Le projet est écrit en **TypeScript** avec **Express** et la documentation issue du fichier OpenAPI est disponible sur `/docs` lorsque le serveur est lancé.

## Prérequis

- **Node.js 18** ou supérieur
- [pnpm](https://pnpm.io/) pour installer les dépendances

## Installation

```bash
pnpm install
```

### Compilation

```bash
pnpm run build
```

### Lancement de l'API

- **Développement** – recompilation et rechargement automatique grâce à `nodemon` :
  ```bash
  pnpm run start:dev
  ```
- **Production** – exécute le code compilé depuis `dist/` :
  ```bash
  pnpm run start:prod
  ```

Une interface web minimale est disponible à la racine (`/`) pour consulter les fichiers JSON présents dans `src/db/` et suivre les logs des tâches de scraping.

## Variables d'environnement

Les variables suivantes peuvent être définies dans un fichier `.env` :

- `PORT` – port d'écoute de l'API (par défaut `8000`)
- `RCDB_URL` – URL de base utilisée pour le scraping de RCDB

## Scraping des données

Les scripts de scraping génèrent des fichiers JSON dans `src/db/`.

- `pnpm run scrape` – récupère une série de montagnes russes et stocke les données dans `src/db/coasters.json`. Les images sont ensuite mises à jour via `scrape:map-coaster-photos`.
- `pnpm run scrape:theme-parks` – récupère la liste des parcs à thèmes et l'enregistre dans `src/db/theme-parks.json`.
- `pnpm run scrape:random` – génère un ensemble aléatoire de coasters dans `src/db/random-coasters.json`.
- `pnpm run scrape:map-coaster-photos` – met à jour les URL d'images des coasters précédemment récupérés.

Les mêmes actions peuvent être lancées via HTTP :

- `GET /scrape/start?script=<nom>` – démarre l'un des scripts de scraping ci-dessus
- `POST /scrape/cancel` – annule la tâche en cours
- `GET /scrape/tasks` – liste des tâches exécutées et de leur statut
- `GET /scrape/logs?id=<taskId>` – récupère les logs d'une tâche
- `GET /scrape/files` – liste les fichiers JSON disponibles
- `GET /scrape/files/:name` – affiche le contenu d'un fichier JSON
- `POST /scrape/upload` – envoie manuellement un fichier JSON dans `src/db/`

> Par défaut, `RCDB_URL` vaut `https://rcdb.com`.

## Endpoints principaux

| Méthode | Chemin                    | Description                                                                 |
| ------- | ------------------------- | --------------------------------------------------------------------------- |
| `GET`   | `/` ou `/api`             | Retourne la liste des endpoints disponibles                                 |
| `GET`   | `/api/coasters`           | Liste paginée des coasters (`offset` et `limit` en paramètres)              |
| `GET`   | `/api/coasters/:id`       | Informations sur un coaster par id (404 si inconnu)                         |
| `GET`   | `/api/random-coasters`    | Liste des coasters récupérés via `scrape:random`                            |
| `GET`   | `/api/coasters/search?q=` | Recherche par nom de coaster ou de parc                                     |
| `GET`   | `/api/theme-parks`        | Liste paginée des parcs à thèmes                                            |
| `GET`   | `/api/theme-parks/:id`    | Informations sur un parc (404 si inconnu)                                   |
| `GET`   | `/scrape/start`           | Lance un script de scraping précisé via le paramètre `script`               |
| `POST`  | `/scrape/cancel`          | Annule la tâche de scraping en cours                                        |
| `GET`   | `/scrape/tasks`           | Liste des tâches de scraping                                                |
| `GET`   | `/scrape/logs`            | Récupère les logs de la tâche active ou de celle identifiée par `id`        |
| `GET`   | `/scrape/files`           | Liste les fichiers JSON disponibles                                         |
| `GET`   | `/scrape/files/:name`     | Récupère le contenu d'un fichier JSON                                       |
| `POST`  | `/scrape/upload`          | Dépose un fichier JSON sur le serveur                                       |

## Fichiers de données

- `src/db/coasters.json` – coasters récupérés avec URLs d'images mises à jour
- `src/db/coasters-raw.json` – données brutes avant mise à jour des images
- `src/db/theme-parks.json` – parcs à thèmes récupérés
- `src/db/random-coasters.json` – résultat de `pnpm run scrape:random`

Bon ride !
