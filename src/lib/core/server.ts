import 'reflect-metadata';
import { DiContainer } from '@lib/core';
import type { Route } from '@lib/types';
import { MetadataKeys } from '@lib/types';
import type { Express, Handler } from 'express';
import express, { Router } from 'express';
import helmet, { contentSecurityPolicy } from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as HttpServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../../swagger.json';

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
  private _server: HttpServer;
  private _io!: SocketServer;
  private _controllers: any[] = [];
  private _diContainer: DiContainer;

  constructor() {
    this._app = express();
    const directives = contentSecurityPolicy.getDefaultDirectives();
    directives['script-src'] = [
      "'self'",
      "'unsafe-inline'",
      'https://cdnjs.cloudflare.com',
    ];
    directives['style-src'] = ["'self'", 'https:', "'unsafe-inline'"];
    this._app.use(
      helmet({
        contentSecurityPolicy: { directives },
      })
    );
    const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS ?? 60_000);
    const max = Number(process.env.RATE_LIMIT_MAX ?? 100);
    this._app.use(
      rateLimit({
        windowMs,
        max,
        standardHeaders: true,
        legacyHeaders: false,
      })
    );
    this._app.use(express.json());
    this._app.use(express.static('static'));
    this._app.use(cors({ origin: process.env.CORS_ORIGIN }));
    this._app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
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

      // TODO: Refactor this code to make property injection more clear
      // TODO: Define a service interface to be used as type to be injected
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

    this._server = this._app.listen(this._port, () => {
      console.log(`⚡[server]: Server is running at http://localhost:${this._port}`);
    });

    this._io = new SocketServer(this._server, { cors: { origin: '*' } });
    io = this._io;
  }
}
