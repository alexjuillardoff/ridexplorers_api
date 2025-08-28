import passport from 'passport';
import { BasicStrategy } from 'passport-http';

const USER = process.env.AUTH_USER;
const PASSWORD = process.env.AUTH_PASSWORD;

// Configure une authentification HTTP Basic simple. Si les identifiants
// correspondent à ceux définis dans les variables d'environnement, la requête
// est autorisée.
passport.use(
  new BasicStrategy((username, password, done) => {
    if (username === USER && password === PASSWORD) {
      return done(null, true);
    }
    return done(null, false);
  })
);

// Middleware à appliquer sur les routes protégées.
export const authMiddleware = [passport.initialize(), passport.authenticate('basic', { session: false })];
