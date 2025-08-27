import { __BLOG_FEEDS_DB_FILENAME__ } from '@app/constants';
import JsonDB from '@app/db';
import { Service } from '@lib/decorators';

@Service()
export default class BlogService {
  private _db: JsonDB;

  constructor() {
    this._db = JsonDB.getInstance();
    this._db.createDBFile(__BLOG_FEEDS_DB_FILENAME__, {});
  }

  public async createFeed(name: string, schema: any): Promise<void> {
    await this._db.createDBFile(`blog-${name}`, []);
    await this._db.pushKeyObjectToDB(__BLOG_FEEDS_DB_FILENAME__, {
      [name]: { id: name, schema },
    });
  }

  public async addItem(feed: string, item: any): Promise<void> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; schema: any }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    const feedInfo = feeds[feed];
    if (!feedInfo) {
      throw new Error(`Feed ${feed} not found`);
    }
    const schema = feedInfo.schema as Record<string, string>;
    const parsedItem = typeof item === 'string' ? JSON.parse(item) : item;
    for (const [key, type] of Object.entries(schema)) {
      if (!(key in parsedItem) || typeof parsedItem[key] !== type) {
        throw new Error('Invalid item');
      }
    }
    const items = await this._db.readDBFile<any[]>(`blog-${feed}`);
    items.push(parsedItem);
    await this._db.writeDBFile(`blog-${feed}`, items);
  }

  public async getFeedItems(feed: string): Promise<any[]> {
    try {
      return await this._db.readDBFile<any[]>(`blog-${feed}`);
    } catch {
      throw new Error(`Feed ${feed} not found`);
    }
  }

  public async listFeeds(): Promise<{ name: string; schema: any }[]> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; schema: any }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    return Object.keys(feeds).map((name) => ({ name, schema: feeds[name].schema }));
  }
}

