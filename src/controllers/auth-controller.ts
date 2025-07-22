import { Controller, Get } from '@lib/decorators';
import type { Request, Response, NextFunction } from 'express';
import passport from '@app/auth/passport';

@Controller()
export default class AuthController {
  @Get('/auth/google')
  google(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
  }

  @Get('/auth/google/callback')
  googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
      successRedirect: '/',
      failureRedirect: '/login?error=google',
    })(req, res, next);
  }

  @Get('/logout')
  logout(req: Request, res: Response) {
    req.logout?.(() => {});
    res.redirect('/');
  }
}
