import { RandomCoasterService } from '@app/services';
import { Controller, Get, Inject } from '@lib/decorators';
import type { Request, Response } from 'express';
import type { RollerCoaster } from '@app/types';

@Controller('/api/random-coasters')
/**
 * Endpoints to retrieve coasters selected at random.
 */
export default class RandomCoastersController {
  @Inject() private _randomCoasterService: RandomCoasterService;

  @Get()
  public async indexRoute(_: Request, res: Response) {
    try {
      const coasters: RollerCoaster[] = await this._randomCoasterService.getRandomCoasters();
      res.status(200).json(coasters);
    } catch (e: any) {
      res.status(400).json({ message: 'Error retrieving random coasters', cause: e });
    }
  }
}
