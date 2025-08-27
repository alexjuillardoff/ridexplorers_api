import { BlogService } from '@app/services';
import { Controller, Get, Post, Patch, Delete, Inject } from '@lib/decorators';
import type { Request, Response } from 'express';
import multer from 'multer';

const upload = multer();

@Controller('/api/blog')
export default class BlogController {
  @Inject() private _blogService: BlogService;

  @Get('/flows')
  public async listFlows(req: Request, res: Response) {
    const { q, page, limit } = req.query;
    const data = await this._blogService.listFlows({
      q: q as string,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
    });
    res.status(200).json(data);
  }

  @Post('/flows')
  public async createFlow(req: Request, res: Response) {
    const { name, slug, schema = {} } = req.body;
    try {
      const flow = await this._blogService.createFlow(name, slug, schema);
      res.status(201).json(flow);
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Patch('/flows/:slug')
  public async rename(req: Request, res: Response) {
    const { slug } = req.params;
    const { name, newSlug } = req.body;
    try {
      const flow = await this._blogService.renameFlow(slug, name, newSlug);
      res.status(200).json({ ...flow, jsonUrl: `/api/blog/${flow.slug}`, message: 'Flow renamed successfully.' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Post('/flows/:slug/duplicate')
  public async duplicate(req: Request, res: Response) {
    const { slug } = req.params;
    const { newName, newSlug, withEntries = false } = req.body;
    try {
      const flow = await this._blogService.duplicateFlow(slug, newName, newSlug, withEntries);
      res.status(201).json({
        ...flow,
        copiedSchema: true,
        copiedEntries: withEntries,
        jsonUrl: `/api/blog/${flow.slug}`,
        message: 'Flow duplicated successfully.',
      });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Delete('/flows/:slug')
  public async remove(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      await this._blogService.deleteFlow(slug);
      res.status(200).json({ message: 'Flow deleted.' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Get('/:slug')
  public async getEntries(req: Request, res: Response) {
    const { slug } = req.params;
    const { page, limit, sort, since, until } = req.query;
    try {
      const data = await this._blogService.getEntries(slug, {
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
        sort: sort === 'asc' ? 'asc' : 'desc',
        since: since as string | undefined,
        until: until as string | undefined,
      });
      res.status(200).json(data);
    } catch (e: any) {
      res.status(404).json({ message: e.message });
    }
  }

  @Post('/:slug')
  public async addEntry(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      await this._blogService.addEntry(slug, req.body);
      res.status(201).json({ message: 'created' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Patch('/:slug/:entryId')
  public async updateEntry(req: Request, res: Response) {
    const { slug, entryId } = req.params;
    try {
      await this._blogService.updateEntry(slug, Number(entryId), req.body);
      res.status(200).json({ message: 'updated' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Post('/:slug/upload')
  public uploadJson(req: Request, res: Response) {
    const { slug } = req.params;
    upload.single('file')(req, res, (err: any) => {
      if (err) return res.status(400).json({ message: err.message });
      try {
        const raw = req.file?.buffer.toString() ?? '[]';
        const entries = JSON.parse(raw);
        if (!Array.isArray(entries)) throw new Error('Invalid JSON');
        entries.forEach((entry) => this._blogService.addEntry(slug, entry));
        res.status(201).json({ message: 'uploaded', count: entries.length });
      } catch (e: any) {
        res.status(400).json({ message: e.message });
      }
    });
  }
}
