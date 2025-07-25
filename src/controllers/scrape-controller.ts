import { Controller, Get, Inject, Post } from '@lib/decorators';
import type { Request, Response } from 'express';
import multer from 'multer';
import { ScrapeService } from '@app/services';

@Controller('/scrape')
/**
 * Exposes HTTP endpoints to run and monitor the scraping routines.
 */
export default class ScrapeController {
  @Inject() private _scrapeService: ScrapeService;


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


  @Post('/upload')
  public async upload(req: Request, res: Response) {
    const upload = multer().single('file');
    upload(req, res, async (err: any) => {
      if (err) {
        res.status(400).json({ message: err.message });
        return;
      }
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
      }
      try {
        await this._scrapeService.saveFile(req.file.originalname, req.file.buffer);
        res.json({ message: 'File uploaded' });
      } catch (e: any) {
        res.status(500).json({ message: e.message });
      }
    });
  }
}
