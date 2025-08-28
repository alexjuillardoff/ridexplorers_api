import 'reflect-metadata';
import { DiContainer } from '@lib/core';
import type { Route } from '@lib/types';
import { MetadataKeys } from '@lib/types';
import type { Express, Handler } from 'express';
import express, { Router } from 'express';
import { readFileSync } from 'fs';
import { Server as HttpServer } from 'http';
import https, { Server as HttpsServer } from 'https';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { authMiddleware } from '@lib/middleware/auth';

export let io: SocketServer;

const DEFAULT_SERVER_PORT = 8000;

/**
 * Wrapper around an Express application that also exposes a Socket.IO instance.
 * Controllers decorated with `@Controller` are discovered and registered at
 * startup.
 */
export default class Server {
  private readonly _app: Express;
  private readonly _port: number;
  private _server: HttpServer | HttpsServer;
  private _io!: SocketServer;
  private _controllers: any[] = [];
  private _diContainer: DiContainer;

  constructor() {
    this._app = express();
    // Permet de parser de gros payloads JSON jusqu'à 1 Go pour les téléversements
    // manuels de fichiers. Les requêtes classiques restent inchangées.
    this._app.use(express.json({ limit: '1gb' }));
    // Activation du parseur de cookies pour lire les préférences utilisateurs
    this._app.use(cookieParser());
    this._app.use(express.static('static'));
    this._app.use(cors());
    if (process.env.NODE_ENV !== 'test') {
      const swaggerDocument = require('../../swagger.json');
      this._app.get('/swagger.json', (_req, res) => res.json(swaggerDocument));
      this._app.use('/docs', swaggerUi.serve, swaggerUi.setup(undefined, { swaggerUrl: '/swagger.json' }));
    }
    if (process.env.AUTH_USER && process.env.AUTH_PASSWORD) {
      this._app.use('/api/blog', authMiddleware);
    }
    this._port = Number(process.env.PORT ?? DEFAULT_SERVER_PORT);
    this._diContainer = DiContainer.getInstance();
  }

  get app() {
    return this._app;
  }

  get port() {
    return this._port;
  }

  get server() {
    return this._server;
  }

  setControllers(controllers: any[]) {
    this._controllers = controllers;
  }

  /**
   * Register all controllers declared via `setControllers` by reading the
   * metadata added by the decorators. Routes are bound to an Express router and
   * mounted under the controller base path.
   */
  private _initControllers() {
    [...this._controllers]?.forEach((ControllerClass) => {
      const basePath: string = Reflect.getMetadata(MetadataKeys.BASE_PATH, ControllerClass);
      const routes: Route[] = Reflect.getMetadata(MetadataKeys.ROUTES, ControllerClass);
      const injectedProperties: any[] = Reflect.getMetadata('dependencies-keys-property', ControllerClass) ?? [];
      const expressRouter = Router();
      const controllerInstance: { [handleName: string]: Handler } = new ControllerClass();

      // Injecte les dépendances déclarées via les décorateurs.
      // Chaque propriété typée reçoit l'instance correspondante du conteneur DI.
      injectedProperties.forEach(({ propertyKey, propertyType }) => {
        controllerInstance[propertyKey] = this._diContainer.getInjectable(propertyType);
      });

      routes.forEach(({ method, path, handlerName }: Route) => {
        expressRouter[method](path, controllerInstance[String(handlerName)].bind(controllerInstance));

        console.info(
          `🚀[server] ${method.toLocaleUpperCase()} ${basePath + path} controller registered. (${
            ControllerClass.name
          }.${String(handlerName)})`
        );
      });

      this._app.use(basePath, expressRouter);
    });
  }

  /**
   * Start the HTTP and WebSocket servers. Controllers must be registered
   * before calling this method.
   */
  start() {
    this._initControllers();
    const certPath = process.env.SSL_CERT_PATH;
    const keyPath = process.env.SSL_KEY_PATH;

    if (certPath && keyPath) {
      const credentials = {
        cert: readFileSync(certPath),
        key: readFileSync(keyPath)
      };
      this._server = https.createServer(credentials, this._app).listen(this._port, () => {
        console.log(`⚡[server]: Server is running at https://localhost:${this._port}`);
      });
    } else {
      this._server = this._app.listen(this._port, () => {
        console.log(`⚡[server]: Server is running at http://localhost:${this._port}`);
      });
    }

    this._io = new SocketServer(this._server, { cors: { origin: '*' } });
    io = this._io;
  }
}
