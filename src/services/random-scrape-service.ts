import RcdbScraper from '@scraping/rcdb-application';
import JsonDB from '@app/db';
import { __RANDOM_COASTERS_DB_FILENAME__ } from '@app/constants';
import { getRandom } from '@app/utils';
import type { RollerCoaster } from '@app/types';
import { Service } from '@lib/decorators';

@Service()
export default class RandomScrapeService {
  private _scraper: RcdbScraper;
  private _db: JsonDB;

  constructor() {
    this._scraper = RcdbScraper.getInstance();
    this._db = JsonDB.getInstance();
  }

  private _getRandomIds(amount: number, min: number, max: number): number[] {
    const ids: number[] = [];
    while (ids.length < amount) {
      const id: number = getRandom(min, max);
      if (!ids.includes(id)) {
        ids.push(id);
      }
    }
    return ids;
  }

  public async scrapeRandomCoasters(amount = 20, min = 1, max = 23000): Promise<RollerCoaster[]> {
    const ids = this._getRandomIds(amount, min, max);
    const coasters = await this._scraper.scrapeCoastersByIds(ids);
    await this._db.writeDBFile(__RANDOM_COASTERS_DB_FILENAME__, coasters);
    return coasters;
  }
}
