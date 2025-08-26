import { BlogService } from '@app/services';
import { Controller, Get, Post, Inject } from '@lib/decorators';
import type { Request, Response } from 'express';
import multer from 'multer';

const upload = multer();

@Controller('/api/blog')
export default class BlogController {
  @Inject() private _blogService: BlogService;

  @Get('/:flow')
  public getFlow(req: Request, res: Response) {
    const { flow } = req.params;
    const data = this._blogService.getFlow(flow);
    if (!data) {
      return res.status(404).json({ message: `Flow ${flow} not found` });
    }
    res.status(200).json({ flux: flow, entries: data.entries });
  }

  @Post('/flows')
  public createFlow(req: Request, res: Response) {
    const { name, keys = [] } = req.body;
    try {
      this._blogService.createFlow(name, Array.isArray(keys) ? keys : []);
      res.status(201).json({ message: 'created' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Post('/:flow')
  public addEntry(req: Request, res: Response) {
    const { flow } = req.params;
    try {
      this._blogService.addEntry(flow, req.body);
      res.status(201).json({ message: 'created' });
    } catch (e: any) {
      res.status(400).json({ message: e.message });
    }
  }

  @Post('/:flow/upload')
  public uploadJson(req: Request, res: Response) {
    const { flow } = req.params;
    upload.single('file')(req, res, (err: any) => {
      if (err) return res.status(400).json({ message: err.message });
      try {
        const raw = req.file?.buffer.toString() ?? '[]';
        const entries = JSON.parse(raw);
        if (!Array.isArray(entries)) throw new Error('Invalid JSON');
        entries.forEach((entry) => this._blogService.addEntry(flow, entry));
        res.status(201).json({ message: 'uploaded', count: entries.length });
      } catch (e: any) {
        res.status(400).json({ message: e.message });
      }
    });
  }
}
