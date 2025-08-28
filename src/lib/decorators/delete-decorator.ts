import { methodDecoratorFactory } from '@lib/decorators';
import { Methods } from '@lib/types';

// Décorateur pour les routes HTTP DELETE.
export default methodDecoratorFactory(Methods.DELETE);
