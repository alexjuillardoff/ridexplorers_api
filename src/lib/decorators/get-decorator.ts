import { methodDecoratorFactory } from '@lib/decorators';
import { Methods } from '@lib/types';

// Décorateur spécifique pour les routes HTTP GET.
export default methodDecoratorFactory(Methods.GET);
