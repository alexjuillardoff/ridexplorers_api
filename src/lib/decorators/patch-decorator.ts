import { methodDecoratorFactory } from '@lib/decorators';
import { Methods } from '@lib/types';

// Décorateur pour les routes HTTP PATCH.
export default methodDecoratorFactory(Methods.PATCH);
