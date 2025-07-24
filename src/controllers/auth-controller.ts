import { Controller, Post } from '@lib/decorators';
import type { Request, Response } from 'express';

const USER = process.env.AUTH_USER;
const PASSWORD = process.env.AUTH_PASSWORD;

@Controller()
export default class AuthController {
  @Post('/login')
  login(req: Request, res: Response) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      return res.status(400).json({ message: 'Missing Authorization header' });
    }
    const base64 = authHeader.split(' ')[1];
    const [username, password] = Buffer.from(base64, 'base64')
      .toString()
      .split(':');
    if (username !== USER || password !== PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.cookie('auth', base64, { httpOnly: true });
    return res.json({ message: 'Cookie set' });
  }

  @Post('/logout')
  logout(_req: Request, res: Response) {
    res.clearCookie('auth');
    return res.json({ message: 'Logged out' });
  }
}
