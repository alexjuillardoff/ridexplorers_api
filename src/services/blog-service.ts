import { __BLOG_FEEDS_DB_FILENAME__ } from '@app/constants';
import JsonDB from '@app/db';
import { slugify } from '@app/utils';
import { Service } from '@lib/decorators';
import { promises as fs } from 'fs';
import path from 'path';

@Service()
export default class BlogService {
  private _db: JsonDB;
  private _dbPath: string;

  constructor() {
    this._db = JsonDB.getInstance();
    this._db.createDBFile(__BLOG_FEEDS_DB_FILENAME__, {});
    this._dbPath = path.join(process.cwd(), 'src', 'db');
  }

  public async listFeeds(): Promise<{ name: string; slug: string }[]> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    return Object.keys(feeds).map((slug) => ({ slug, name: feeds[slug].name }));
  }

  public async createFeed(name: string): Promise<{ name: string; slug: string }> {
    const slug = slugify(name);
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    if (feeds[slug]) {
      throw new Error('Feed already exists');
    }
    await this._db.createDBFile(`blog-${slug}`, {});
    await this._db.pushKeyObjectToDB(__BLOG_FEEDS_DB_FILENAME__, {
      [slug]: { id: slug, name },
    });
    return { name, slug };
  }

  public async getFeed(slug: string): Promise<any> {
    try {
      return await this._db.readDBFile<any>(`blog-${slug}`);
    } catch {
      throw new Error(`Feed ${slug} not found`);
    }
  }

  public async updateFeed(slug: string, content: any): Promise<void> {
    await this._db.writeDBFile(`blog-${slug}`, content);
  }

  public async deleteFeed(slug: string): Promise<void> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    if (!feeds[slug]) {
      throw new Error(`Feed ${slug} not found`);
    }
    delete feeds[slug];
    await this._db.writeDBFile(__BLOG_FEEDS_DB_FILENAME__, feeds);
    await fs.rm(path.join(this._dbPath, `blog-${slug}.json`), { force: true });
  }

  public async renameFeed(
    slug: string,
    newName: string
  ): Promise<{ name: string; slug: string }> {
    const feeds = await this._db.readDBFile<Record<string, { id: string; name: string }>>(
      __BLOG_FEEDS_DB_FILENAME__
    );
    if (!feeds[slug]) {
      throw new Error(`Feed ${slug} not found`);
    }
    const newSlug = slugify(newName);
    if (feeds[newSlug]) {
      throw new Error('Feed already exists');
    }
    await fs.rename(
      path.join(this._dbPath, `blog-${slug}.json`),
      path.join(this._dbPath, `blog-${newSlug}.json`)
    );
    delete feeds[slug];
    feeds[newSlug] = { id: newSlug, name: newName };
    await this._db.writeDBFile(__BLOG_FEEDS_DB_FILENAME__, feeds);
    return { name: newName, slug: newSlug };
  }
}
