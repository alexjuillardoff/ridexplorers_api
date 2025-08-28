import 'reflect-metadata';
import { MetadataKeys } from '@lib/types';

/**
 * Décorateur de classe utilisé pour déclarer la route de base d'un contrôleur.
 * @param basePath chemin sous lequel seront montées toutes les routes du contrôleur
 */
export default function Controller(basePath: string = '/'): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MetadataKeys.BASE_PATH, basePath, target);
  };
}