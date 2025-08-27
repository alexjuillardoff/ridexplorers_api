import { __BLOG_FEEDS_DB_FILENAME__ } from '@app/constants';
import JsonDB from '@app/db';
import type { BlogFeed, BlogFeeds } from '@app/types';
import { Service } from '@lib/decorators';

@Service()
export default class BlogService {
  private _db: JsonDB;

  constructor() {
    this._db = JsonDB.getInstance();
    this._db.createDBFile(__BLOG_FEEDS_DB_FILENAME__, {});
  }

  private async _getFeeds(): Promise<BlogFeeds> {
    return await this._db.readDBFile<BlogFeeds>(__BLOG_FEEDS_DB_FILENAME__);
  }

  public async listFeeds(): Promise<{ name: string; schema: any }[]> {
    const feeds = await this._getFeeds();
    return Object.entries(feeds).map(([name, { schema }]) => ({ name, schema }));
  }

  public async saveFeed(name: string, schema: any): Promise<void> {
    const feeds = await this._getFeeds();
    const items = feeds[name]?.items ?? [];
    feeds[name] = { schema, items } as BlogFeed;
    await this._db.writeDBFile(__BLOG_FEEDS_DB_FILENAME__, feeds);
  }

  public async addItem(feedName: string, item: any): Promise<void> {
    const feeds = await this._getFeeds();
    const feed = feeds[feedName];
    if (!feed) {
      throw new Error(`Feed ${feedName} not found`);
    }
    feed.items.push(item);
    await this._db.writeDBFile(__BLOG_FEEDS_DB_FILENAME__, feeds);
  }
}
