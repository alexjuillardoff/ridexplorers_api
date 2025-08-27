import { BlogService } from '@app/services';
import { Controller, Delete, Get, Inject, Post, Put } from '@lib/decorators';
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
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'name required' });
      return;
    }
    try {
      const feed = await this._blogService.createFeed(name);
      res.status(200).json(feed);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  @Get('/feeds/:slug')
  public async getFeed(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    try {
      const content = await this._blogService.getFeed(slug);
      res.status(200).json(content);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  }

  @Put('/feeds/:slug')
  public async updateFeed(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const content = req.body;
    try {
      await this._blogService.updateFeed(slug, content);
      res.status(200).json({ ok: true });
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }

  @Delete('/feeds/:slug')
  public async deleteFeed(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    try {
      await this._blogService.deleteFeed(slug);
      res.status(200).json({ ok: true });
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  }

  @Post('/feeds/:slug/rename')
  public async renameFeed(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'name required' });
      return;
    }
    try {
      const feed = await this._blogService.renameFeed(slug, name);
      res.status(200).json(feed);
    } catch (e: any) {
      res.status(400).json({ error: e.message });
    }
  }
}
