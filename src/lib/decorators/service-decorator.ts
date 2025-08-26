import DiContainer from '@lib/core/di-container';

export default function Service(): Function {
  return (target: { new (): any }): void => {   
    const injectionContainer: DiContainer = DiContainer.getInstance();
    const classInstance = new target();
    const { name } = classInstance.constructor;

    injectionContainer.setInjectable(name, classInstance);
  };
}
