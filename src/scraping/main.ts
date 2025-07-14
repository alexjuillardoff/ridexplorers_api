import Application from '@scraping/application';
import { program } from 'commander';

program.option('--startId <number>');
program.option('--endId <number>');
program.option('--saveData <boolean>');

program.parse();

const { startId = '1', endId = '23000', saveData = 'true' } = program.opts<{ startId: string; endId: string; saveData: string }>();

const app = new Application();

app.start({ startId: Number(startId), endId: Number(endId), saveData: saveData === 'true' });
