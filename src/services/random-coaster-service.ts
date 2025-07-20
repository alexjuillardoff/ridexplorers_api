import { __RANDOM_COASTERS_DB_FILENAME__ } from '@app/constants';
import JsonDB from '@app/db';
import type { RollerCoaster } from '@app/types';
import { Service } from '@lib/decorators';

@Service()
export default class RandomCoasterService {
  private _db: JsonDB;

  constructor() {
    this._db = JsonDB.getInstance();
  }

  public async getRandomCoasters(): Promise<RollerCoaster[]> {
    return await this._db.readDBFile<RollerCoaster[]>(__RANDOM_COASTERS_DB_FILENAME__);
  }
}
