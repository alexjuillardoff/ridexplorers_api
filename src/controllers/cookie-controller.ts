import { Controller, Get, Post } from '@lib/decorators';
import type { Request, Response } from 'express';

@Controller('/cookies')
/**
 * Endpoints pour gérer le consentement aux cookies (RGPD).
 */
export default class CookieController {
  /**
   * Renvoie l'état actuel du consentement.
   */
  @Get('/consent')
  public consent(req: Request, res: Response) {
    const consent = req.cookies.consent === 'true';
    res.json({ consent });
  }

  /**
   * Enregistre la décision de l'utilisateur concernant les cookies.
   */
  @Post('/consent')
  public setConsent(req: Request, res: Response) {
    const { consent } = req.body as { consent: boolean };
    res.cookie('consent', Boolean(consent), { sameSite: 'lax', maxAge: 31536000000 }); // 1 an
    res.json({ consent: Boolean(consent) });
  }
}
