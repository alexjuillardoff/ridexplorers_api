import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Very small helper around the filesystem used to persist JSON data. Each
 * database is represented by a file located in `src/db`.
 */
export default class JsonDB {
  private static _instance: JsonDB;
  private readonly __DB_PATH__: string = path.join(process.cwd(), 'src', 'db');

  private constructor() {}

  /**
   * Retrieve the singleton instance of the database helper.
   */
  public static getInstance(): JsonDB {
    if (!this._instance) {
      this._instance = new JsonDB();
    }

    return this._instance;
  }

  /**
   * Create a new JSON file if it does not already exist.
   */
  public async createDBFile(dbName: string, defaultData: any = []): Promise<void> {
    if (!existsSync(path.join(this.__DB_PATH__, `${dbName}.json`))) {
      await this.writeDBFile(dbName, defaultData);
    }
  }

  /**
   * Merge an entry into an existing database file. Arrays will preserve order
   * while objects will be shallowly merged.
   */
  public async addToDB<TData extends { id: string | number }, TDataBaseData = any | any[]>(
    dbName: string,
    data: TData
  ): Promise<void> {
    const currentDbContent: TDataBaseData = await this.readDBFile<TDataBaseData>(dbName);
    let dbData: TDataBaseData;

    if (Array.isArray(currentDbContent)) {
      const contentIndex: number = currentDbContent.indexOf(data.id);

      if (contentIndex) {
        currentDbContent[contentIndex] = data;
      } else {
        currentDbContent;
      }

      dbData = currentDbContent;
    } else {
      dbData = { ...currentDbContent, ...data };
    }

    this.writeDBFile<TDataBaseData>(dbName, dbData);
  }

  /**
   * Append or update nested objects inside a JSON file using the provided keys.
   */
  public async pushKeyObjectToDB<TData extends { [key: string]: { id: string | number } }>(
    dbName: string,
    data: TData
  ): Promise<void> {
    const objectKeys: string[] = Object.keys(data);
    const currentDbContent: { [key: string]: any } = await this.readDBFile<{ [key: string]: any }>(dbName);

    objectKeys.forEach((key: string) => {
      currentDbContent[key] = {
        ...currentDbContent[key],
        ...data[key],
      };
    });

    await this.writeDBFile(dbName, currentDbContent);
  }

  public async writeDBFile<T>(dbName: string, data: T) {
    // Persist data on disk under `src/db/{dbName}.json`.
    return await writeFile(`${this.__DB_PATH__}/${dbName}.json`, JSON.stringify(data, null, 2), {
      encoding: 'utf-8',
    });
  }

  public async readDBFile<T>(dbName: string): Promise<T> {
    // Read and parse data stored in `src/db/{dbName}.json`.
    return await readFile(`${this.__DB_PATH__}/${dbName}.json`, 'utf-8').then(JSON.parse);
  }
}
