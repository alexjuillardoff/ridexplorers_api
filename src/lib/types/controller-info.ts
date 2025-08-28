// Informations conservées pour chaque contrôleur enregistré dans le
// conteneur DI. Elles permettent au serveur d'instancier et de monter les
// routes automatiquement.
export default interface ControllerInfo {
  name: string;
  basePath: string;
  controllerClass: any;
  instance: any;
}
