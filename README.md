# 🎢 RIDEXPLORERS API

RIDEXPLORERS API fournit une API REST simple contenant des données récupérées sur [RCDB](https://rcdb.com). Elle est construite en **TypeScript** avec **Express** et expose des points d'entrées pour interroger les montagnes russes et les parcs d'attractions. Une documentation générée à partir de la spécification OpenAPI est disponible sur `/docs` lorsque le serveur est lancé.

## Fonctionnalités

- Interrogation des montagnes russes et des parcs d'attractions via des routes REST.
- Recherche de montagnes russes ou de parcs par nom.
- Sélection aléatoire de montagnes russes préalablement scrappées.
- Obtention d'une montagne russe aléatoire.
- Lancement et suivi des scripts de scraping depuis l'API ou l'interface web.
- Téléversement et lecture de fichiers JSON de données.
- Authentification Basic configurée par variables d'environnement.
- Consentement aux cookies conforme RGPD via l'endpoint `/cookies/consent` et une bannière d'information.

Ce projet nécessite **Node.js 18** ou plus récent.

---

## Prérequis

- Node 18+ et npm.

---

## Démarrage rapide (installation locale Node.js)

1. Installer les dépendances
   ```bash
   npm install
   ```
2. Construire le projet
   ```bash
   npm run build
   ```
3. Lancer l'API
   - Développement: recompilation et rechargement automatiques via `nodemon`.
     ```bash
     npm run start:dev
     ```
   - Production: exécute le JavaScript compilé depuis `dist/`.
     ```bash
     npm run start:prod
     ```

### Variables d'environnement

Le serveur lit plusieurs variables facultatives dans un fichier `.env`. Ces variables sont chargées automatiquement au démarrage grâce à `dotenv`.

- `PORT` - port sur lequel l'API sera accessible (défaut: `8000`).
- `RCDB_URL` - URL de base utilisée pour le scraping de RCDB (défaut: `https://rcdb.com`).
- `AUTH_USER` - nom d'utilisateur pour l'authentification Basic.
- `AUTH_PASSWORD` - mot de passe associé.

Un fichier `.env.example` est fourni. Dupliquez-le en `.env` et adaptez les valeurs.

---

## Scraping des données (installation locale)

L'API fonctionne avec des fichiers JSON situés dans `src/db/`. Ces fichiers sont générés en scrappant RCDB. Plusieurs scripts npm sont fournis.

- `npm run scrape` - récupère les montagnes russes depuis RCDB. Options `--startId`/`--endId` ou `--startPage`/`--endPage`. Les données brutes sont enregistrées dans `src/db/coasters-raw.json` puis, si `--saveData` vaut `true`, dans `src/db/coasters.json`.
- `npm run scrape:theme-parks` - récupère les informations des parcs et les sauvegarde dans `src/db/theme-parks.json`.
- `npm run scrape:map-coaster-photos` - associe les URL d'images des montagnes russes déjà récupérées avec l'URL de base configurée.
- `npm run scrape:random` - récupère un échantillon aléatoire de montagnes russes et le stocke dans `src/db/random-coasters.json`.

Ces scripts téléchargent les pages RCDB via `axios`, extraient les données avec `cheerio` et écrivent les fichiers JSON dans `src/db/`. Ils peuvent aussi être déclenchés via l'interface web qui communique avec un service démarrant les scripts npm et diffusant les logs en temps réel.

### Routes de gestion des fichiers de scraping

- `GET /scrape/files` - liste les fichiers JSON extraits disponibles.
- `GET /scrape/files/:name` - récupère le contenu d'un fichier de scraping.
- `POST /scrape/upload` - charge manuellement un fichier JSON dans `src/db/` (jusqu'à 1 Go). Envoyez le fichier au format `multipart/form-data`.

> Remarque: l'URL RCDB par défaut est `https://rcdb.com` et peut être modifiée via `RCDB_URL`.

---

## Endpoints

| Verbe HTTP | Chemin                          | Description |
| --------- | ------------------------------- | ----------- |
| `GET`     | `/` ou `/api`                   | Liste des endpoints disponibles |
| `GET`     | `/api/coasters`                 | Liste paginée de montagnes russes. Paramètres `offset` et `limit`. |
| `GET`     | `/api/coasters/:id`             | Montagne russe par id. `404` si non trouvée. |
| `GET`     | `/api/coasters/random`          | Montagne russe aléatoire. |
| `GET`     | `/api/coasters/search?q=`       | Recherche par nom de montagne russe ou de parc. |
| `GET`     | `/api/coasters/region/{region}` | Montagnes russes d'une région. |
| `GET`     | `/api/coasters/filter`          | Filtre par caractéristiques via query params. |
| `GET`     | `/api/theme-parks`              | Liste paginée des parcs. Paramètres `offset` et `limit`. |
| `GET`     | `/api/theme-parks/:id`          | Parc par id. `400` si non trouvé. |
| `GET`     | `/api/theme-parks/search?q=`    | Recherche de parcs par nom. |
| `GET`     | `/api/theme-parks/region/{region}` | Parcs d'une région. |
| `GET`     | `/scrape/files`                 | Liste des fichiers JSON disponibles. |
| `GET`     | `/scrape/files/:name`           | Récupère le contenu d'un fichier de scraping. |
| `POST`    | `/scrape/upload`                | Téléverse un fichier JSON (<= 1 Go) sur le serveur. |

---

## Fichiers de données

- `src/db/coasters.json` - toutes les montagnes russes scrappées avec leurs images mappées.
- `src/db/coasters-raw.json` - données brutes avant le mapping des images.
- `src/db/theme-parks.json` - données extraites des parcs d'attractions.
- `src/db/random-coasters.json` - échantillon aléatoire obtenu via `scrape:random`.
- `src/db/.last-scrape` - horodatage du dernier passage de l'automatisation.

---

## Structure du dépôt

```text
.
├── src/
│   └── db/
│       └── .gitkeep
├── static/
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Sécurité et bonnes pratiques

- Activez l'authentification Basic via `AUTH_USER` et `AUTH_PASSWORD` si l'API est exposée.
- Surveillez la taille du dossier `src/db/` et archivez régulièrement si nécessaire.
- Ne poussez jamais de données réelles ni de secrets. Utilisez `.env.example` pour documenter les variables.

Bonne visite et bons rides !

