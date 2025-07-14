import RcdbScraper from '@scraping/rcdb-application';
import { getRandom } from '@app/utils';

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
  await rcdbScraper.scrapeCoastersByIds(ids);
})();
