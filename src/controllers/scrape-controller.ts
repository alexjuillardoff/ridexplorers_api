import { Controller, Get, Inject, Post } from '@lib/decorators';
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
      const task = await this._scrapeService.start(script);
      res.json({ message: 'Scraping started', taskId: task.id });
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

  @Post('/cancel')
  public async cancel(_: Request, res: Response) {
    this._scrapeService.cancel();
    res.json({ message: 'Scraping cancelled' });
  }

  @Get('/tasks')
  public async tasks(_: Request, res: Response) {
    res.json(this._scrapeService.getTasks());
  }

  @Get('/logs')
  public async logs(req: Request, res: Response) {
    const { id } = req.query;
    const taskId = typeof id === 'string' ? Number(id) : undefined;
    const logs = this._scrapeService.getLogs(taskId);
    res.json(logs);
  }
}
