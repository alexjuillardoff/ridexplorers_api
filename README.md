# 🎢 RIDEXPLORERS API

RIDEXPLORERS API fournit une API REST simple contenant des données récupérées sur [RCDB](https://rcdb.com). Elle est construite en **TypeScript** avec **Express** et expose des points d'entrées pour interroger les montagnes russes et les parcs d'attractions. Une documentation générée à partir de la spécification OpenAPI est disponible sur `/docs` lorsque le serveur est lancé.

## Fonctionnalités

- Interrogation des montagnes russes et des parcs d'attractions via des routes REST.
- Recherche de montagnes russes ou de parcs par nom.
- Sélection aléatoire de montagnes russes préalablement scrappées.
- Lancement et suivi des scripts de scraping depuis l'API ou l'interface web.
- Téléversement et lecture de fichiers JSON de données.
- Authentification Basic configurée par variables d'environnement.
- Consentement aux cookies conforme RGPD via l'endpoint `/cookies/consent` et une bannière d'information.

Ce projet nécessite **Node.js 18** ou plus récent.

## Démarrage rapide

1. **Installer les dépendances**
   ```bash
   npm install
   ```
2. **Construire le projet**
   ```bash
   npm run build
   ```
3. **Lancer l'API**
   - Développement : recompilation et rechargement automatiques via `nodemon`.
     ```bash
     npm run start:dev
     ```
   - Production : exécute le JavaScript compilé depuis `dist/`.
     ```bash
     npm run start:prod
     ```

### Variables d'environnement

Le serveur lit plusieurs variables facultatives dans un fichier `.env`. Ces
variables sont chargées automatiquement au démarrage grâce à `dotenv` :

- `PORT` – port sur lequel l'API sera accessible (défaut : `8000`).
- `RCDB_URL` – URL de base utilisée pour le scraping de RCDB.
- `AUTH_USER` – nom d'utilisateur pour l'authentification Basic.
- `AUTH_PASSWORD` – mot de passe associé.

### Scraping des données
L'API fonctionne avec des fichiers JSON situés dans `src/db/`. Ces fichiers sont générés en scrappant RCDB. Plusieurs scripts npm sont fournis :

- `npm run scrape` – scrappe les données de montagnes russes sur une plage d'identifiants ou de pages et stocke le résultat dans `src/db/coasters.json`. Les images sont transformées en URL absolue grâce à `scrape:map-coaster-photos`.
- `npm run scrape:theme-parks` – récupère les informations des parcs et les sauvegarde dans `src/db/theme-parks.json`.
- `npm run scrape:random` – récupère un ensemble aléatoire de montagnes russes et les enregistre dans `src/db/random-coasters.json`.
- `npm run scrape:map-coaster-photos` – associe les URL d'images des montagnes russes déjà récupérées avec l'URL de base configurée.

Les tâches de scraping peuvent également être contrôlées à l'exécution grâce aux routes HTTP suivantes :

- `GET /scrape/start?script=<name>` – lance l'un des scripts npm de scraping.
- `POST /scrape/cancel` – annule la tâche de scraping en cours.
- `GET /scrape/tasks` – liste les tâches exécutées avec leur statut.
- `GET /scrape/logs?id=<taskId>` – récupère les logs d'une tâche (par défaut celle en cours).
- `GET /scrape/files` – liste les fichiers JSON extraits disponibles.
- `GET /scrape/files/:name` – récupère le contenu d'un fichier de scraping.
- `POST /scrape/upload` – charge manuellement un fichier JSON dans `src/db/`.

> **Remarque** : l'URL de base RCDB est `https://rcdb.com` par défaut. Vous pouvez la modifier via la variable `RCDB_URL`.

## Endpoints

| Verbe HTTP | Chemin                     | Description |
| --------- | -------------------------- | ----------- |
| `GET`     | `/` ou `/api`              | Liste des endpoints disponibles |
| `GET`     | `/api/coasters`            | Retourne une liste paginée de montagnes russes. Utilisez les paramètres `offset` et `limit`. |
| `GET`     | `/api/coasters/:id`        | Retourne les informations d'une montagne russe par id. Renvoie `404` si non trouvée. |
| `GET`     | `/api/random-coasters`     | Retourne la liste des montagnes russes récupérées avec `scrape:random`. |
| `GET`     | `/api/coasters/search?q=`  | Retourne les montagnes russes dont le nom ou le parc correspond à `q`. |
| `GET`     | `/api/theme-parks`         | Retourne une liste paginée de parcs d'attractions. Utilisez `offset` et `limit`. |
| `GET`     | `/api/theme-parks/:id`     | Retourne un parc par id. Renvoie `400` si non trouvé. |
| `GET`     | `/api/theme-parks/search?q=` | Retourne les parcs dont le nom correspond à `q`. |
| `GET`     | `/scrape/start`            | Lance un script de scraping spécifié via le paramètre `script`. |
| `POST`    | `/scrape/cancel`           | Annule la tâche de scraping en cours. |
| `GET`     | `/scrape/tasks`            | Liste toutes les tâches de scraping avec leur statut. |
| `GET`     | `/scrape/logs`             | Récupère les logs de la tâche active ou de celle précisée par `id`. |
| `GET`     | `/scrape/files`            | Liste les fichiers JSON extraits disponibles. |
| `GET`     | `/scrape/files/:name`      | Récupère le contenu d'un fichier de scraping. |
| `POST`    | `/scrape/upload`           | Téléverse un fichier JSON sur le serveur. |

## Fichiers de données
- `src/db/coasters.json` – toutes les montagnes russes scrappées avec leurs images mappées.
- `src/db/coasters-raw.json` – données brutes avant le mapping des images.
- `src/db/theme-parks.json` – données extraites des parcs d'attractions.
- `src/db/random-coasters.json` – résultats de `npm run scrape:random`.

Bonne visite !
