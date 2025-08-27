import 'dotenv/config';
import Server from '@lib/core';

import {
  RollerCoastersController,
  IndexController,
  ThemeParksController,
  ScrapeController,
  CookieController,
  BlogController,
  BlogPublicController
} from '@app/controllers';

/**
 * Point d'entrée principal de l'application.
 * Initialise le serveur Express et enregistre les différents contrôleurs.
 */
class Application {
  _appServer: Server;

  constructor() {
    this._appServer = new Server();
    this._appServer.setControllers([
      IndexController,
      RollerCoastersController,
      ThemeParksController,
      ScrapeController,
      CookieController,
      BlogController,
      BlogPublicController
    ]);

  }

  start() {
    this._appServer.start();
  }
}

const application = new Application();

application.start();

export default application._appServer.app;
