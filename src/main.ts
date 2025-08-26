import 'dotenv/config';
import Server from '@lib/core';

import {
  RollerCoastersController,
  IndexController,
  ThemeParksController,
  ScrapeController,
  CookieController,
  BlogController,
} from '@app/controllers';

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
    ]);

  }

  start() {
    this._appServer.start();
  }
}

const application = new Application();

application.start();

export default application._appServer.app;
