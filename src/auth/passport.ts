import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import session from 'express-session';
import type { Express } from 'express';

export function setupAuth(app: Express) {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    SESSION_SECRET = 'change-me',
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.warn('Google OAuth credentials not provided; skipping auth setup.');
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      (_accessToken, _refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((obj: any, done) => {
    done(null, obj);
  });

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());
}

export default passport;
