import passport from 'passport';
import { BasicStrategy } from 'passport-http';

const USER = process.env.AUTH_USER;
const PASSWORD = process.env.AUTH_PASSWORD;

passport.use(
  new BasicStrategy((username, password, done) => {
    if (username === USER && password === PASSWORD) {
      return done(null, true);
    }
    return done(null, false);
  })
);

export const authMiddleware = [passport.initialize(), passport.authenticate('basic', { session: false })];
