import 'reflect-metadata';

/**
 * Décorateur de propriété permettant d'injecter automatiquement une instance
 * fournie par le conteneur DI. La classe cible doit avoir été décorée avec
 * `@Service`.
 */
export default function Inject(): PropertyDecorator {
  return function (target, propertyKey) {
    const containerClass = target.constructor;
    const PropertyType = Reflect.getMetadata('design:type', target, propertyKey);
    const injectedTypes = Reflect.getMetadata('dependencies-keys-property', target) ?? [];
    const data: any = {
      propertyKey,
      propertyType: PropertyType.name,
    };

    if (PropertyType.name) {
      Reflect.defineMetadata('dependencies-keys-property', [...injectedTypes, data], containerClass);
    }
  };
}
