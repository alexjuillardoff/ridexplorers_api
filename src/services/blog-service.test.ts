import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import BlogService from './blog-service';

const dbFile = path.join(process.cwd(), 'src', 'db', 'blog-feeds.json');

beforeEach(async () => {
  try {
    await fs.rm(dbFile);
  } catch {
    // ignore if file does not exist
  }
});

afterEach(async () => {
  try {
    await fs.rm(dbFile);
  } catch {
    // ignore
  }
});

test('getFeed returns saved feed with items', async () => {
  const service = new BlogService();
  await service.saveFeed('test', { title: 'string' });
  await service.addItem('test', { title: 'hello' });
  const feed = await service.getFeed('test');
  assert.equal(feed.items.length, 1);
  assert.equal(feed.items[0].title, 'hello');
});

test('getFeed throws error when feed not found', async () => {
  const service = new BlogService();
  await assert.rejects(() => service.getFeed('unknown'));
});
