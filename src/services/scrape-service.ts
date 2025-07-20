import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { readdir, stat, readFile } from 'fs/promises';
import path from 'path';
import { io } from '@lib/core';
import Service from '@lib/decorators/service-decorator';

@Service()
export default class ScrapeService {
  private _currentProcess: ChildProcessWithoutNullStreams | null = null;
  private _logCache: string[] = [];

  async start(script: string): Promise<void> {
    if (this._currentProcess) {
      throw new Error('A scraping task is already running');
    }

    this._logCache = [];
    return new Promise((resolve, reject) => {
      // Use npm to execute the script since it is more commonly available
      const child = spawn('npm', ['run', script], { shell: true });
      this._currentProcess = child;

      const send = (event: string, msg: string) => {
        if (this._logCache.length > 1000) {
          this._logCache.shift();
        }
        this._logCache.push(msg);
        io?.emit(event, msg);
      };

      child.stdout.on('data', (data) => send('log', data.toString()));
      child.stderr.on('data', (data) => send('log', data.toString()));
      child.on('error', (err) => {
        send('error', err.message);
        this._currentProcess = null;
        reject(err);
      });
      child.on('close', (code) => {
        send('done', `Process finished with code ${code}\n`);
        this._currentProcess = null;
        resolve();
      });
    });
  }

  async listFiles(): Promise<{ name: string; lastModified: string }[]> {
    const dir = path.join(process.cwd(), 'src', 'db');
    const files = await readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    return Promise.all(
      jsonFiles.map(async (name) => {
        const stats = await stat(path.join(dir, name));
        // Use the file creation time to determine when it was last scraped
        return { name, lastModified: stats.birthtime.toISOString() };
      })
    );
  }

  async readFile(name: string): Promise<any> {
    const dir = path.join(process.cwd(), 'src', 'db', name);
    const content = await readFile(dir, 'utf-8');
    return JSON.parse(content);
  }

  getLogs(): string[] {
    return this._logCache;
  }
}
