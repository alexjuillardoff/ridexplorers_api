import { Controller, Get, Inject } from '@lib/decorators';
import type { Request, Response } from 'express';
import { RandomScrapeService } from '@app/services';

@Controller('/api/scrape')
export default class ScrapingController {
  @Inject() private _randomScrapeService: RandomScrapeService;

  @Get('/random')
  public async scrapeRandomCoasters(_: Request, res: Response) {
    try {
      const coasters = await this._randomScrapeService.scrapeRandomCoasters();
      res.status(200).json(coasters);
    } catch (e) {
      res.status(500).json({ message: 'Error scraping random coasters', error: e });
    }
  }
}
