# Guide de démarrage pour les débutants

Ce document explique pas à pas comment installer et utiliser **RIDEXPLORERS API**. Aucune connaissance préalable en développement n'est supposée.

## 1. Pré-requis

- **Node.js 18** ou version supérieure. Vous pouvez le télécharger sur [nodejs.org](https://nodejs.org/).
- **Git** pour récupérer le code du projet.

## 2. Récupérer le code du projet

Ouvrez un terminal puis exécutez les commandes suivantes :

```bash
# Clone le dépôt (remplacez l'URL si nécessaire)
git clone <URL-du-dépôt>
cd ridexplorers_api
```

Vous vous trouvez maintenant dans le dossier du projet.

## 3. Installer les dépendances

Toutes les bibliothèques nécessaires sont listées dans `package.json`. Installez-les avec :

```bash
npm install
```

Cette étape peut prendre quelques minutes.

## 4. Configurer les variables d'environnement

Le serveur lit certaines variables dans un fichier `.env` situé à la racine du projet. Créez ce fichier et ajoutez-y par exemple :

```env
PORT=8000
RCDB_URL=https://rcdb.com
AUTH_USER=admin
AUTH_PASSWORD=secret
```

Vous pouvez modifier les valeurs selon vos besoins. Si vous ne créez pas ce fichier, le serveur démarrera quand même avec ses valeurs par défaut.

## 5. Construire le projet

Avant de lancer le serveur en production, compilez le code TypeScript vers JavaScript :

```bash
npm run build
```

Un dossier `dist/` sera créé avec les fichiers compilés.

## 6. Lancer le serveur

- **Mode développement** (recharge automatique à chaque modification) :

```bash
npm run start:dev
```

- **Mode production** (exécute la version compilée) :

```bash
npm run start:prod
```

Par défaut, l'API écoute sur le port `8000`. Une fois démarrée, ouvrez [http://localhost:8000/docs](http://localhost:8000/docs) pour accéder à la documentation interactive.

## 7. Faire une première requête

Voici un exemple pour récupérer la liste des montagnes russes :

```bash
curl http://localhost:8000/api/coasters
```

Selon la configuration de l'authentification Basic (variables `AUTH_USER` et `AUTH_PASSWORD`), vous devrez peut-être ajouter `-u utilisateur:motdepasse` à la commande `curl`.

## 8. Lancer les scripts de scraping

Le projet permet de récupérer les données depuis RCDB. Les scripts se lancent soit depuis les commandes npm, soit via l'API.

- Depuis le terminal :

```bash
npm run scrape           # récupère les montagnes russes
npm run scrape:theme-parks
npm run scrape:random
```

- Via l'API (exemple) :

```bash
curl "http://localhost:8000/scrape/start?script=scrape"
```

Les fichiers générés se trouvent dans `src/db/`.

## 9. Aller plus loin

Consultez le fichier `README.md` pour une description complète de toutes les routes et fonctionnalités disponibles.

Bonne exploration !
