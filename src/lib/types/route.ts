import { Methods } from '@lib/types';

// Décrit une route HTTP associée à un contrôleur.
export default interface Route {
  method: Methods;
  path: string;
  handlerName: string | symbol;
}
