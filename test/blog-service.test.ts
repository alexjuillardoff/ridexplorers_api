import test from 'node:test';
import assert from 'node:assert/strict';
import BlogService from '../src/services/blog-service';
import JsonDB from '../src/db';
import { __BLOG_FLOWS_DB_FILENAME__, __BLOG_ENTRIES_DB_FILENAME__ } from '../src/constants/database';

const db = JsonDB.getInstance();

async function resetDB() {
  await db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, []);
  await db.writeDBFile(__BLOG_ENTRIES_DB_FILENAME__, []);
}

test('create, duplicate, rename and delete flow', async () => {
  await resetDB();
  const service = new BlogService();
  await service.createFlow('News Parks', 'news-parks', { title: 'string' });
  await service.addEntry('news-parks', { title: 'A' });

  // duplicate with entries
  await service.duplicateFlow('news-parks', 'News Parks Copy', 'news-parks-copy', true);
  const list = await service.listFlows({});
  assert.equal(list.total, 2);

  // rename
  await service.renameFlow('news-parks', 'Parks Updates', 'parks-updates');
  const renamed = await service.listFlows({ q: 'parks-updates' });
  assert.equal(renamed.items[0].name, 'Parks Updates');

  // delete
  await service.deleteFlow('parks-updates');
  const afterDelete = await service.listFlows({});
  assert.equal(afterDelete.total, 1);
});

test('generates slugs from names when missing', async () => {
  await resetDB();
  const service = new BlogService();
  const created = await service.createFlow('Hello World', undefined, { title: 'string' });
  assert.equal(created.slug, 'hello-world');
  const duplicated = await service.duplicateFlow('hello-world', 'Copy Flow');
  assert.equal(duplicated.slug, 'copy-flow');
  const renamed = await service.renameFlow('hello-world', 'New Name');
  assert.equal(renamed.slug, 'new-name');
});

test('listFlows handles flows missing slug or name', async () => {
  await resetDB();
  const now = new Date().toISOString();
  await db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, [
    { id: 1, name: 'Valid', slug: 'valid', schema: {}, createdAt: now, updatedAt: now },
    { id: 2, name: 'Broken', schema: {}, createdAt: now, updatedAt: now } as any,
  ]);
  const service = new BlogService();
  const list = await service.listFlows({ q: 'something' });
  assert.equal(list.total, 0);
});
