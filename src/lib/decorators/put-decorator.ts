import { methodDecoratorFactory } from '@lib/decorators';
import { Methods } from '@lib/types';

// Décorateur pour les routes HTTP PUT.
export default methodDecoratorFactory(Methods.PUT);
