import Application from '@scraping/application';
import { program } from 'commander';

program.option('--startId <number>');
program.option('--endId <number>');
program.option('--startPage <number>');
program.option('--endPage <number>');
program.option('--saveData <boolean>');

program.parse();

const {
  startId = '1',
  endId = '30000',
  startPage,
  endPage,
  saveData = 'true',
} = program.opts<{ startId: string; endId: string; startPage?: string; endPage?: string; saveData: string }>();

const app = new Application();

if (startPage !== undefined && endPage !== undefined) {
  app.startByPageRange({
    startPage: Number(startPage),
    endPage: Number(endPage),
    saveData: saveData === 'true',
  });
} else {
  app.start({ startId: Number(startId), endId: Number(endId), saveData: saveData === 'true' });
}
