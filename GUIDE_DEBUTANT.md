# Guide de démarrage pour les débutants

Ce guide décrit, étape par étape, comment installer et exécuter **RIDEXPLORERS API**. Toutes les commandes sont détaillées pour qu'une personne n'ayant jamais lancé un projet Node puisse suivre.

## 1. Pré-requis

- **Node.js 18** ou version supérieure. Téléchargez l'installateur depuis [nodejs.org](https://nodejs.org/) et installez-le comme n'importe quel programme.
- **Git** pour récupérer le code du projet. Sur Windows vous pouvez installer [Git for Windows](https://git-scm.com/download/win). Sur macOS ou Linux, `git` est généralement disponible via le gestionnaire de paquets (`brew`, `apt`, `dnf`, ...).
- **pnpm** pour gérer les dépendances (`npm install -g pnpm` si besoin).

Vérifiez que les outils sont bien installés :

```bash
node -v   # affiche la version de Node.js
git --version
```

## 2. Récupérer le code du projet

Ouvrez un terminal (PowerShell, Terminal macOS ou console Linux) et tapez :

```bash
# Clone le dépôt (remplacez l'URL si nécessaire)
git clone <URL-du-dépôt>
cd ridexplorers_api
```

La dernière ligne vous place dans le dossier du projet. Toutes les commandes suivantes se font depuis ce dossier.

## 3. Installer les dépendances

Toutes les bibliothèques nécessaires sont listées dans `package.json`. Installez-les avec :

```bash
pnpm install   # télécharge toutes les dépendances
```

Cette étape peut prendre quelques minutes.

## 4. Configurer les variables d'environnement

Le serveur lit certaines variables dans un fichier `.env` situé à la racine du projet. Créez ce fichier s'il n'existe pas et ajoutez-y par exemple :

```env
PORT=8000
RCDB_URL=https://rcdb.com
AUTH_USER=admin
AUTH_PASSWORD=secret
```

Chaque variable a un rôle précis :

- **PORT** – port sur lequel l'API répondra.
- **RCDB_URL** – URL de base utilisée lors du scraping des données.
- **AUTH_USER** et **AUTH_PASSWORD** – identifiants demandés par l'authentification Basic.

Vous pouvez modifier les valeurs selon vos besoins. Si vous ne créez pas ce fichier, le serveur démarrera quand même avec ses valeurs par défaut.

## 5. Construire le projet

Avant de lancer le serveur en production, compilez le code TypeScript vers JavaScript :

```bash
pnpm run build   # génère les fichiers dans le dossier dist/
```

Cette commande crée un dossier `dist/` contenant le JavaScript prêt pour la production.

## 6. Lancer le serveur

- **Mode développement** (recharge automatique à chaque modification) :

```bash
pnpm run start:dev
```

- **Mode production** (exécute la version compilée) :

```bash
pnpm run start:prod
```

Par défaut, l'API écoute sur le port `8000`. Une fois démarrée, ouvrez [http://localhost:8000/docs](http://localhost:8000/docs) pour accéder à la documentation interactive.
Si tout se passe bien, la page Swagger s'affiche dans le navigateur. Pour arrêter le serveur, revenez dans le terminal et pressez `Ctrl+C`.

## 7. Faire une première requête

Voici un exemple pour récupérer la liste des montagnes russes :

```bash
curl http://localhost:8000/api/coasters
```

Si le serveur répond avec du JSON, tout fonctionne ! Selon la configuration de l'authentification Basic (variables `AUTH_USER` et `AUTH_PASSWORD`), vous devrez peut-être ajouter `-u utilisateur:motdepasse` à la commande `curl`.

## 8. Lancer les scripts de scraping

Le projet permet de récupérer les données depuis RCDB. Les scripts peuvent être lancés à la main ou depuis l'API.

- Depuis le terminal :

```bash
pnpm run scrape           # récupère les montagnes russes
pnpm run scrape:theme-parks # récupère les parcs d'attractions
pnpm run scrape:random # récupère un échantillon aléatoire
```

- Via l'API (exemple) :

```bash
curl "http://localhost:8000/scrape/start?script=scrape"
```

Les fichiers générés se trouvent dans `src/db/`.

## 9. Exécuter les tests

Avant toute contribution, assurez-vous que la suite de tests passe :

```bash
pnpm test
```

Vous devriez voir tous les tests en vert.

## 10. Aller plus loin

Consultez le fichier `README.md` pour une description complète de toutes les routes et fonctionnalités disponibles.

Bonne exploration !
