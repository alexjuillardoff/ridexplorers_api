import DiContainer from '@lib/core/di-container';

/**
 * Décorateur de classe qui enregistre une instance dans le conteneur d'injection
 * de dépendances afin qu'elle puisse être récupérée ailleurs via `@Inject`.
 */
export default function Service(): Function {
  return (target: { new (): any }): void => {
    const injectionContainer: DiContainer = DiContainer.getInstance();
    const classInstance = new target();
    const { name } = classInstance.constructor;

    injectionContainer.setInjectable(name, classInstance);
  };
}
