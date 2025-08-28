import { Controller, Get } from '@lib/decorators';
import type { Request, Response } from 'express';

@Controller()
/**
 * Fournit quelques routes de base listant les endpoints disponibles.
 */
export default class IndexController {
  private _endpoints: any[] = [
    { endpoint: '/api/coasters?offset=0&limit=20', description: 'Returns all coasters information' },
    { endpoint: '/api/coasters/:id', description: 'Returns coaster with matched id' },
    { endpoint: '/api/coasters/random', description: 'Returns one random coaster' },
    { endpoint: '/api/coasters/search?q=Steel', description: 'Returns matched coaster' },
    { endpoint: '/api/coasters/region/Europe', description: 'Returns coasters in specified region' },
    { endpoint: '/api/coasters/filter?make=Bolliger', description: 'Filter coasters by characteristics' },
    { endpoint: '/api/theme-parks/search?q=Magic', description: 'Returns matched theme park' },
    { endpoint: '/api/theme-parks/region/Spain', description: 'Returns parks in specified region' },
  ];

  @Get()
  public indexRoute(_: Request, res: Response) {
    res.json(this._endpoints);
  }

  @Get('/api')
  public apiRoute(_: Request, res: Response) {
    res.json(this._endpoints);
  }
}
