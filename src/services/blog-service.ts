import { Service } from '@lib/decorators';
import type { BlogFlow, BlogEntry } from '@app/types/blog';

interface Flows {
  [name: string]: BlogFlow;
}

@Service()
export default class BlogService {
  private _flows: Flows = {};

  public createFlow(name: string, keys: string[]) {
    if (this._flows[name]) {
      throw new Error(`Flow ${name} already exists`);
    }
    this._flows[name] = { keys, entries: [] };
  }

  public getFlow(name: string) {
    return this._flows[name];
  }

  public addEntry(flowName: string, entry: BlogEntry) {
    const flow = this._flows[flowName];
    if (!flow) throw new Error(`Flow ${flowName} not found`);

    const entryKeys = Object.keys(entry);
    const hasSameKeys =
      flow.keys.every((k: string) => entryKeys.includes(k)) &&
      entryKeys.every((k: string) => flow.keys.includes(k));

    if (!hasSameKeys) {
      throw new Error('Invalid entry keys');
    }

    flow.entries.push(entry);
  }
}
