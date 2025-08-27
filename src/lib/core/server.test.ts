import { test } from 'node:test';
import assert from 'node:assert/strict';
import Server from './server';

test('does not apply auth middleware without credentials', () => {
  process.env.NODE_ENV = 'test';
  delete process.env.AUTH_USER;
  delete process.env.AUTH_PASSWORD;
  const server = new Server();
  const hasAuth = server.app._router.stack.some(
    (layer: any) => layer.name === 'authenticate' && layer.regexp?.test('/api/blog')
  );
  assert.equal(hasAuth, false);
});

test('applies auth middleware to /api/blog when credentials provided', () => {
  process.env.NODE_ENV = 'test';
  process.env.AUTH_USER = 'user';
  process.env.AUTH_PASSWORD = 'pass';
  const server = new Server();
  const hasAuth = server.app._router.stack.some(
    (layer: any) => layer.name === 'authenticate' && layer.regexp?.test('/api/blog')
  );
  assert.equal(hasAuth, true);
});
