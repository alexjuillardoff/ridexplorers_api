import type { ControllerInfo } from '@lib/types';

// Petit conteneur d'injection de dépendances maison. Il stocke les services et
// contrôleurs instanciés afin de pouvoir les réutiliser dans tout le projet
// via les décorateurs `@Inject` et `@Service`.
export default class DiContainer {
  private static _instance: DiContainer;
  private _injectables!: any;
  private _controllers: ControllerInfo[] = [];

  private constructor() {}

  /**
   * Enregistre un fournisseur (service, classe utilitaire, ...) sous une clé
   * unique. Il pourra ensuite être récupéré par `getInjectable`.
   */
  public setInjectable(key: string, provider: any): void {
    this._injectables = {
      ...this._injectables,
      [key]: provider,
    };
  }

  /**
   * Sauvegarde un contrôleur pour permettre son initialisation automatique lors
   * du démarrage du serveur.
   */
  public setController(controller: any): void {
    this._controllers = [...this._controllers, controller];
  }

  /**
   * Récupère un injectable à partir de sa clé. Lance une erreur si aucun
   * fournisseur n'a été enregistré.
   */
  public getInjectable(key: string): any {
    const injectable = this._injectables[key];

    if (!injectable) {
      throw new Error(`Not found ${key} injectable`);
    }

    return injectable;
  }

  public getControllers(): any {
    return this._controllers;
  }

  /**
   * Fournit l'instance unique du conteneur (pattern singleton).
   */
  public static getInstance(): DiContainer {
    if (!this._instance) {
      this._instance = new DiContainer();
    }

    return this._instance;
  }
}
