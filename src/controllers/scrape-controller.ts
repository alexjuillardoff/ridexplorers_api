import { Controller, Get, Inject } from '@lib/decorators';
import type { Request, Response } from 'express';
import { ScrapeService } from '@app/services';

@Controller('/scrape')
/**
 * Exposes HTTP endpoints to run and monitor the scraping routines.
 */
export default class ScrapeController {
  @Inject() private _scrapeService: ScrapeService;

  @Get('/start')
  public async start(req: Request, res: Response) {
    const { script } = req.query;
    if (typeof script !== 'string') {
      res.status(400).json({ message: 'Missing script' });
      return;
    }
    try {
      await this._scrapeService.start(script);
      res.json({ message: 'Scraping started' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Get('/files')
  public async files(_: Request, res: Response) {
    const files = await this._scrapeService.listFiles();
    res.json(files);
  }

  @Get('/files/:name')
  public async file(req: Request, res: Response) {
    try {
      const data = await this._scrapeService.readFile(req.params.name);
      res.json(data);
    } catch (e) {
      res.status(404).json({ message: 'File not found' });
    }
  }

  @Get('/logs')
  public async logs(_: Request, res: Response) {
    const logs = this._scrapeService.getLogs();
    res.json(logs);
  }
}
