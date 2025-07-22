import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import path from 'path';
import { io } from '@lib/core';
import Service from '@lib/decorators/service-decorator';

type TaskStatus = 'running' | 'completed' | 'failed' | 'cancelled';

export interface ScrapeTask {
  id: number;
  script: string;
  status: TaskStatus;
  logs: string[];
  startTime: Date;
  endTime?: Date;
}

@Service()
/**
 * Runs the scraping npm scripts and streams their output through Socket.IO.
 */
export default class ScrapeService {
  private _currentProcess: ChildProcessWithoutNullStreams | null = null;
  private _logCache: string[] = [];
  private _tasks: Map<number, ScrapeTask> = new Map();
  private _taskId = 0;
  private _currentTaskId: number | null = null;

  /**
   * Launch a scraping npm script and forward its output to connected clients.
   * Only one task can run at a time. Returns the task information when started.
   */
  async start(script: string): Promise<ScrapeTask> {
    if (this._currentProcess) {
      throw new Error('A scraping task is already running');
    }

    const id = ++this._taskId;
    const task: ScrapeTask = {
      id,
      script,
      status: 'running',
      logs: [],
      startTime: new Date(),
    };
    this._tasks.set(id, task);
    this._currentTaskId = id;
    this._logCache = task.logs;

    return new Promise((resolve, reject) => {
      const child = spawn('npm', ['run', script], { shell: true });
      this._currentProcess = child;

      const send = (event: string, msg: string) => {
        if (task.logs.length > 1000) {
          task.logs.shift();
        }
        task.logs.push(msg);
        io?.emit(event, msg);
      };

      child.stdout.on('data', (data) => send('log', data.toString()));
      child.stderr.on('data', (data) => send('log', data.toString()));
      child.on('error', (err) => {
        send('error', err.message);
        task.status = 'failed';
        task.endTime = new Date();
        this._currentProcess = null;
        this._currentTaskId = null;
        reject(err);
      });
      child.on('close', (code) => {
        send('done', `Process finished with code ${code}\n`);
        task.status = code === 0 ? 'completed' : 'failed';
        task.endTime = new Date();
        this._currentProcess = null;
        this._currentTaskId = null;
        resolve(task);
      });
    });
  }

  /**
   * Return the list of JSON files in the `src/db` directory along with their
   * creation date. This is useful to inspect the available scraped datasets.
   */
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

  async saveFile(name: string, data: Buffer): Promise<void> {
    const dir = path.join(process.cwd(), 'src', 'db', name);
    await writeFile(dir, data);
  }

  cancel(): void {
    if (this._currentProcess) {
      this._currentProcess.kill();
      const task = this._currentTaskId ? this._tasks.get(this._currentTaskId) : undefined;
      if (task) {
        task.status = 'cancelled';
        task.endTime = new Date();
      }
      this._currentProcess = null;
      this._currentTaskId = null;
    }
  }

  getTasks(): ScrapeTask[] {
    return Array.from(this._tasks.values());
  }

  getTask(id: number): ScrapeTask | undefined {
    return this._tasks.get(id);
  }

  getLogs(id?: number): string[] {
    if (typeof id === 'number') {
      return this._tasks.get(id)?.logs ?? [];
    }
    return this._currentTaskId ? this._tasks.get(this._currentTaskId)?.logs ?? [] : [];
  }
}
