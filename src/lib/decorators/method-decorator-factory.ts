import 'reflect-metadata';
import { MetadataKeys } from '@lib/types';
import type { Methods, Route } from '@lib/types';

/**
 * Fabrique de décorateurs pour les méthodes HTTP (`@Get`, `@Post`, ...).
 * Elle enregistre pour chaque méthode décorée le verbe HTTP et le chemin
 * associé dans les métadonnées du contrôleur.
 */
export default function methodDecoratorFactory(method: Methods) {
  return (path: string = ''): MethodDecorator => {
    return (target, propertyKey) => {
      const controllerClass = target.constructor;
      const routers: Route[] = Reflect.hasMetadata(MetadataKeys.ROUTES, controllerClass)
        ? Reflect.getMetadata(MetadataKeys.ROUTES, controllerClass)
        : [];
      routers.push({
        method,
        path,
        handlerName: propertyKey,
      });
      Reflect.defineMetadata(MetadataKeys.ROUTES, routers, controllerClass);
    };
  };
}
