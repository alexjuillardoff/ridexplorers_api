import { BlogService } from '@app/services';
import { Controller, Get, Inject, Post } from '@lib/decorators';
import type { Request, Response } from 'express';

@Controller('/api/blog')
export default class BlogController {
  @Inject() private _blogService: BlogService;

  @Get('/feeds')
  public async listFeeds(_: Request, res: Response): Promise<void> {
    const feeds = await this._blogService.listFeeds();
    res.status(200).json(feeds);
  }

  @Post('/feeds')
  public async createFeed(req: Request, res: Response): Promise<void> {
    const { name, schema } = req.body;
    if (!name || !schema) {
      res.status(400).json({ error: 'name and schema required' });
      return;
    }
    await this._blogService.createFeed(name, schema);
    res.status(200).json({ name, schema });
  }

  @Get('/feeds/:feed')
  public async getFeedItems(req: Request, res: Response): Promise<void> {
    const { feed } = req.params;
    try {
      const items = await this._blogService.getFeedItems(feed);
      res.status(200).json(items);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  }

  @Post('/feeds/:feed/items')
  public async addItem(req: Request, res: Response): Promise<void> {
    const { feed } = req.params;
    const item = req.body;
    try {
      await this._blogService.addItem(feed, item);
      res.status(200).json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
