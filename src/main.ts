import 'dotenv/config';
import Server from '@lib/core';

import {
  RollerCoastersController,
  IndexController,
  ThemeParksController,
  RandomCoastersController,
  ScrapeController,
  AuthController,
} from '@app/controllers';

class Application {
  _appServer: Server;

  constructor() {
    this._appServer = new Server();
    this._appServer.setControllers([
      IndexController,
      RollerCoastersController,
      ThemeParksController,
      RandomCoastersController,
      ScrapeController,
      AuthController,
    ]);

  }

  start() {
    this._appServer.start();
  }
}

const application = new Application();

application.start();

export default application._appServer.app;
