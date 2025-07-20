import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { readdir, stat, readFile } from 'fs/promises';
import path from 'path';
import { io } from '@lib/core';
import Service from '@lib/decorators/service-decorator';

@Service()
export default class ScrapeService {
  private _currentProcess: ChildProcessWithoutNullStreams | null = null;

  async start(script: string): Promise<void> {
    if (this._currentProcess) {
      throw new Error('A scraping task is already running');
    }

    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', script], { shell: true });
      this._currentProcess = child;

      const send = (event: string, msg: string) => io?.emit(event, msg);

      child.stdout.on('data', (data) => send('log', data.toString()));
      child.stderr.on('data', (data) => send('log', data.toString()));
      child.on('error', (err) => {
        send('error', err.message);
        this._currentProcess = null;
        reject(err);
      });
      child.on('close', (code) => {
        send('done', String(code));
        this._currentProcess = null;
        resolve();
      });
    });
  }

  async listFiles(): Promise<{ name: string; createdAt: string }[]> {
    const dir = path.join(process.cwd(), 'src', 'db');
    const files = await readdir(dir);
    const jsonFiles = files.filter((f) => f.endsWith('.json'));
    return Promise.all(
      jsonFiles.map(async (name) => {
        const stats = await stat(path.join(dir, name));
        return { name, createdAt: stats.birthtime.toISOString() };
      })
    );
  }

  async readFile(name: string): Promise<any> {
    const dir = path.join(process.cwd(), 'src', 'db', name);
    const content = await readFile(dir, 'utf-8');
    return JSON.parse(content);
  }
}
