import passport from 'passport';
import { BasicStrategy } from 'passport-http';
import type { Request, Response, NextFunction } from 'express';

const USER = process.env.AUTH_USER;
const PASSWORD = process.env.AUTH_PASSWORD;

export function authCookie(req: Request, _res: Response, next: NextFunction) {
  if (!req.headers.authorization && req.cookies?.auth) {
    req.headers.authorization = 'Basic ' + req.cookies.auth;
  }
  next();
}

passport.use(
  new BasicStrategy((username, password, done) => {
    if (username === USER && password === PASSWORD) {
      return done(null, true);
    }
    return done(null, false);
  })
);

export const authMiddleware = [passport.initialize(), passport.authenticate('basic', { session: false })];
