import dotEnv from 'dotenv';

// Charge les variables d'environnement depuis un fichier `.env` à la racine
// du projet. Cela permet de configurer l'application sans modifier le code.
dotEnv.config();

// Ré-exporte l'objet `process.env` afin de pouvoir l'importer partout de
// manière typée. Chaque clé correspond à une variable définie dans `.env`.
export default {
  ...process.env,
};
