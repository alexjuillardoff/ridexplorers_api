import Server from '@lib/core';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import elFinder from 'elfinder-node';
import {
  RollerCoastersController,
  IndexController,
  ThemeParksController,
  RandomCoastersController,
  ScrapeController,
} from '@app/controllers';

class Application {
  _appServer: Server;

  constructor() {
    dotenv.config();

    this._appServer = new Server();
    this._appServer.setControllers([
      IndexController,
      RollerCoastersController,
      ThemeParksController,
      RandomCoastersController,
      ScrapeController,
    ]);

    // Serve files under src/db so the connector can generate URLs
    const dbPath = path.join(process.cwd(), 'src', 'db');
    this._appServer.app.use('/db', express.static(dbPath));

    const connector = elFinder([
      {
        driver: (elFinder as any).LocalFileStorage,
        path: dbPath,
        URL: '/db/',
        permissions: { read: 1, write: 1, lock: 0 },
      },
    ]);

    const connectorRouter = express.Router();
    connectorRouter.use((req, _res, next) => {
      if (typeof req.query.target === 'string' && req.query.target.trim() === '') {
        delete req.query.target;
      }
      next();
    });
    connectorRouter.use(connector);

    this._appServer.app.use('/connector', connectorRouter);
  }

  start() {
    this._appServer.start();
  }
}

const application = new Application();

application.start();

export default application._appServer.app;
