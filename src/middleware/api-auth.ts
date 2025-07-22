import { Request, Response, NextFunction } from 'express';

export default function apiAuth(req: Request, res: Response, next: NextFunction) {
  const expectedToken = process.env.API_TOKEN;
  const headerToken = req.get('Authorization');

  if (expectedToken && headerToken === expectedToken) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}
