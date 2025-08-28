import { methodDecoratorFactory } from '@lib/decorators';
import { Methods } from '@lib/types';

// Décorateur pour les routes HTTP POST.
export default methodDecoratorFactory(Methods.POST);
