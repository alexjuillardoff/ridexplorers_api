import { Request, Response, NextFunction } from 'express';

export default function apiAuth(req: Request, res: Response, next: NextFunction) {
  const expectedToken = process.env.API_TOKEN;
  const headerToken = req.get('Authorization');
  if (req.isAuthenticated?.()) {
    return next();
  }
  if (expectedToken && headerToken === expectedToken) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
}
