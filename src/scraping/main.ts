import Application from '@scraping/application';
import { program } from 'commander';
import type { Regions } from '@scraping/rcdb-application';

program.option('--startId <number>');
program.option('--endId <number>');
program.option('--startPage <number>');
program.option('--endPage <number>');
program.option('--region <region>');
program.option('--saveData <boolean>');

program.parse();

const {
  startId = '1',
  endId = '23000',
  startPage,
  endPage,
  region,
  saveData = 'true',
} = program.opts<{ startId: string; endId: string; startPage?: string; endPage?: string; region?: string; saveData: string }>();

const app = new Application();

if (region) {
  app.startByRegion({ region: region as any, saveData: saveData === 'true' });
} else if (startPage !== undefined && endPage !== undefined) {
  app.startByPageRange({
    startPage: Number(startPage),
    endPage: Number(endPage),
    saveData: saveData === 'true',
  });
} else {
  app.start({ startId: Number(startId), endId: Number(endId), saveData: saveData === 'true' });
}
