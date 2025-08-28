// Tests unitaires basés sur le runner natif de Node pour vérifier le
// comportement du service de blog.
import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import BlogService from './blog-service';

const dbPath = path.join(process.cwd(), 'src', 'db');

async function clean() {
  try {
    const files = await fs.readdir(dbPath);
    for (const file of files) {
      if (file.startsWith('blog')) {
        await fs.rm(path.join(dbPath, file));
      }
    }
  } catch {}
}

beforeEach(clean);
afterEach(clean);

test('create, update and list feeds', async () => {
  const service = new BlogService();
  const { slug } = await service.createFeed('Test Feed');
  let feeds = await service.listFeeds();
  assert.deepEqual(feeds, [{ name: 'Test Feed', slug }]);
  let content = await service.getFeed(slug);
  assert.deepEqual(content, {});
  await service.updateFeed(slug, { hello: 'world' });
  content = await service.getFeed(slug);
  assert.deepEqual(content, { hello: 'world' });
});

test('rename and delete feed', async () => {
  const service = new BlogService();
  const { slug } = await service.createFeed('Old');
  await service.updateFeed(slug, { a: 1 });
  const renamed = await service.renameFeed(slug, 'New Name');
  assert.equal(renamed.name, 'New Name');
  const content = await service.getFeed(renamed.slug);
  assert.deepEqual(content, { a: 1 });
  await service.deleteFeed(renamed.slug);
  const feeds = await service.listFeeds();
  assert.equal(feeds.length, 0);
  await assert.rejects(() => service.getFeed(renamed.slug));
});
