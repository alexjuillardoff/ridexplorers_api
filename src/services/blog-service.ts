import { Service } from '@lib/decorators';
import JsonDB from '@app/db';
import { __BLOG_FLOWS_DB_FILENAME__, __BLOG_ENTRIES_DB_FILENAME__ } from '@app/constants';
import type { BlogFlow, BlogEntry } from '@app/types/blog';

interface ListOptions {
  q?: string;
  page?: number;
  limit?: number;
}

interface EntryQuery {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
  since?: string;
  until?: string;
}

@Service()
export default class BlogService {
  private _db: JsonDB;

  constructor() {
    this._db = JsonDB.getInstance();
    this._db.createDBFile(__BLOG_FLOWS_DB_FILENAME__, []);
    this._db.createDBFile(__BLOG_ENTRIES_DB_FILENAME__, []);
  }

  private _now(): string {
    return new Date().toISOString();
  }

  private async _getFlows(): Promise<BlogFlow[]> {
    return await this._db.readDBFile<BlogFlow[]>(__BLOG_FLOWS_DB_FILENAME__);
  }

  private async _getEntries(): Promise<BlogEntry[]> {
    return await this._db.readDBFile<BlogEntry[]>(__BLOG_ENTRIES_DB_FILENAME__);
  }

  public async listFlows({ q = '', page = 1, limit = 25 }: ListOptions) {
    const flows = (await this._getFlows()).filter((f) => !f.deletedAt);
    const entries = await this._getEntries();
    let items = flows.map((flow) => ({
      name: flow.name,
      slug: flow.slug,
      entriesCount: entries.filter((e) => e.flowId === flow.id).length,
      updatedAt: flow.updatedAt,
      jsonUrl: `/api/blog/${flow.slug}`,
    }));
    if (q) {
      const lower = q.toLowerCase();
      items = items.filter(
        (f) =>
          (f.name && f.name.toLowerCase().includes(lower)) ||
          (f.slug && f.slug.toLowerCase().includes(lower))
      );
    }
    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);
    return { items: paginated, page, limit, total };
  }

  public async createFlow(name: string, slug: string, schema: { [key: string]: string }): Promise<BlogFlow> {
    const flows = await this._getFlows();
    if (flows.some((f) => f.slug === slug && !f.deletedAt)) {
      throw new Error('Flow already exists');
    }
    const now = this._now();
    const flow: BlogFlow = { id: Date.now(), name, slug, schema, createdAt: now, updatedAt: now };
    flows.push(flow);
    await this._db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, flows);
    return flow;
  }

  public async renameFlow(slug: string, newName: string, newSlug: string): Promise<BlogFlow> {
    const flows = await this._getFlows();
    const flow = flows.find((f) => f.slug === slug && !f.deletedAt);
    if (!flow) throw new Error('Flow not found');
    if (newSlug !== slug && flows.some((f) => f.slug === newSlug && !f.deletedAt)) {
      throw new Error('Slug already exists');
    }
    flow.name = newName;
    flow.slug = newSlug;
    flow.updatedAt = this._now();
    await this._db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, flows);
    return flow;
  }

  public async duplicateFlow(slug: string, newName: string, newSlug: string, withEntries: boolean): Promise<BlogFlow> {
    const flows = await this._getFlows();
    const original = flows.find((f) => f.slug === slug && !f.deletedAt);
    if (!original) throw new Error('Flow not found');
    if (flows.some((f) => f.slug === newSlug && !f.deletedAt)) throw new Error('Slug already exists');
    const now = this._now();
    const copy: BlogFlow = { id: Date.now(), name: newName, slug: newSlug, schema: { ...original.schema }, createdAt: now, updatedAt: now };
    flows.push(copy);
    await this._db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, flows);
    if (withEntries) {
      const entries = await this._getEntries();
      const newEntries = entries
        .filter((e) => e.flowId === original.id)
        .map((e) => ({ id: Date.now() + Math.random(), flowId: copy.id, payload: e.payload, createdAt: now, updatedAt: now }));
      await this._db.writeDBFile(__BLOG_ENTRIES_DB_FILENAME__, [...entries, ...newEntries]);
    }
    return copy;
  }

  public async deleteFlow(slug: string): Promise<void> {
    const flows = await this._getFlows();
    const flow = flows.find((f) => f.slug === slug && !f.deletedAt);
    if (!flow) throw new Error('Flow not found');
    flow.deletedAt = this._now();
    await this._db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, flows);
  }

  public async addEntry(slug: string, payload: { [key: string]: any }) {
    const flows = await this._getFlows();
    const flow = flows.find((f) => f.slug === slug && !f.deletedAt);
    if (!flow) throw new Error(`Flow ${slug} not found`);
    const entryKeys = Object.keys(payload);
    const hasSameKeys =
      Object.keys(flow.schema).every((k) => entryKeys.includes(k)) &&
      entryKeys.every((k) => Object.keys(flow.schema).includes(k));
    if (!hasSameKeys) throw new Error('Invalid entry keys');
    const entries = await this._getEntries();
    const now = this._now();
    entries.push({ id: Date.now(), flowId: flow.id, payload, createdAt: now, updatedAt: now });
    flow.updatedAt = now;
    await this._db.writeDBFile(__BLOG_ENTRIES_DB_FILENAME__, entries);
    await this._db.writeDBFile(__BLOG_FLOWS_DB_FILENAME__, flows);
  }

  public async getEntries(slug: string, { page = 1, limit = 25, sort = 'desc', since, until }: EntryQuery) {
    const flows = await this._getFlows();
    const flow = flows.find((f) => f.slug === slug && !f.deletedAt);
    if (!flow) throw new Error('Flow not found');
    let items = (await this._getEntries()).filter((e) => e.flowId === flow.id);
    if (since) items = items.filter((e) => e.createdAt >= since);
    if (until) items = items.filter((e) => e.createdAt <= until);
    items.sort((a, b) =>
      sort === 'asc'
        ? a.createdAt.localeCompare(b.createdAt)
        : b.createdAt.localeCompare(a.createdAt)
    );
    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);
    return { items: paginated, page, limit, total };
  }
}
