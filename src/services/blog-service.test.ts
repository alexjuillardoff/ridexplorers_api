import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import BlogService from './blog-service';

const feedsFile = path.join(process.cwd(), 'src', 'db', 'blog-feeds.json');
const feedItemsFile = (name: string) => path.join(process.cwd(), 'src', 'db', `blog-${name}.json`);

beforeEach(async () => {
  for (const file of [feedsFile, feedItemsFile('test')]) {
    try {
      await fs.rm(file);
    } catch {
      // ignore if file does not exist
    }
  }
});

afterEach(async () => {
  for (const file of [feedsFile, feedItemsFile('test')]) {
    try {
      await fs.rm(file);
    } catch {
      // ignore
    }
  }
});

test('createFeed saves schema and allows adding items', async () => {
  const service = new BlogService();
  await service.createFeed('test', { title: 'string' });
  await service.addItem('test', { id: 1, title: 'hello' });
  const items = await service.getFeedItems('test');
  assert.equal(items.length, 1);
  assert.equal(items[0].title, 'hello');
  const feeds = await service.listFeeds();
  assert.deepEqual(feeds, [{ name: 'test', schema: { title: 'string' } }]);
});

test('getFeedItems throws error when feed not found', async () => {
  const service = new BlogService();
  await assert.rejects(() => service.getFeedItems('unknown'));
});

test('addItem validates objects against schema', async () => {
  const service = new BlogService();
  await service.createFeed('test', { title: 'string' });
  await assert.rejects(() => service.addItem('test', { id: 1 }), /Invalid item/);
  await assert.rejects(() => service.addItem('test', { title: 1 }), /Invalid item/);
});

