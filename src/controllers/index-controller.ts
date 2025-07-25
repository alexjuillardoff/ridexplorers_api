import { Controller, Get } from '@lib/decorators';
import type { Request, Response } from 'express';

@Controller()
export default class IndexController {
  private _endpoints: any[] = [
    { endpoint: '/api/coasters?offset=0&limit=20', description: 'Returns all coasters information' },
    { endpoint: '/api/coasters/:id', description: 'Returns coaster with matched id' },
    { endpoint: '/api/random-coasters', description: 'Returns random scraped coasters' },
    { endpoint: '/api/coasters/random', description: 'Returns one random coaster' },
    { endpoint: '/api/coasters/search?q=Steel', description: 'Returns matched coaster' },
    { endpoint: '/api/theme-parks/search?q=Magic', description: 'Returns matched theme park' },
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
