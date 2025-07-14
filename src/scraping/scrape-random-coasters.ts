import RcdbScraper from '@scraping/rcdb-application';
import { getRandom } from '@app/utils';
import JsonDB from '@app/db';
import { __RANDOM_COASTERS_DB_FILENAME__ } from '@app/constants';

const rcdbScraper: RcdbScraper = RcdbScraper.getInstance();

function getRandomIds(amount: number, min: number, max: number): number[] {
  const ids: number[] = [];
  while (ids.length < amount) {
    const id = getRandom(min, max);
    if (!ids.includes(id)) {
      ids.push(id);
    }
  }
  return ids;
}

(async () => {
  const ids: number[] = getRandomIds(20, 1, 23000);
  const db = JsonDB.getInstance();
  const coasters = await rcdbScraper.scrapeCoastersByIds(ids);

  await db.writeDBFile(__RANDOM_COASTERS_DB_FILENAME__, coasters);

  // If you need to map images to a static path, run:
  // npm run scrape:map-coaster-photos
})();
