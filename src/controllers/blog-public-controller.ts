import { BlogService } from '@app/services';
import { Controller, Get, Inject } from '@lib/decorators';
import type { Request, Response } from 'express';

@Controller('/blog')
/**
 * Version publique (non authentifiée) du contrôleur de blog. Elle permet de
 * récupérer le contenu des flux pour l'affichage côté client.
 */
export default class BlogPublicController {
  @Inject() private _blogService: BlogService;

  /**
   * Retourne le contenu JSON du flux demandé.
   */
  @Get('/:slug')
  public async getFeed(req: Request, res: Response): Promise<void> {
    const { slug } = req.params;
    try {
      const content = await this._blogService.getFeed(slug);
      res.status(200).json(content);
    } catch (e: any) {
      res.status(404).json({ error: e.message });
    }
  }
}
