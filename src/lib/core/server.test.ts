import { test } from 'node:test';
import assert from 'node:assert/strict';
import Server, { io } from './server';
import fs from 'fs';
import { execSync } from 'child_process';
import { Server as HttpsServer } from 'https';

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

test('uses https server when certificate paths provided', async () => {
  process.env.NODE_ENV = 'test';
  process.env.PORT = '0';
  const keyPath = './key.pem';
  const certPath = './cert.pem';
  execSync(
    `openssl req -x509 -newkey rsa:2048 -keyout ${keyPath} -out ${certPath} -nodes -subj "/CN=localhost" -days 1`,
    { stdio: 'ignore' }
  );
  process.env.SSL_KEY_PATH = keyPath;
  process.env.SSL_CERT_PATH = certPath;

  const server = new Server();
  server.start();
  assert.equal(server.server instanceof HttpsServer, true);
  await new Promise((resolve) => server.server.close(resolve));
  await new Promise((resolve) => io.close(resolve));

  fs.unlinkSync(keyPath);
  fs.unlinkSync(certPath);
  delete process.env.SSL_KEY_PATH;
  delete process.env.SSL_CERT_PATH;
  delete process.env.PORT;
});
