import { __COASTERS_DB_FILENAME__ } from '@app/constants';
import JsonDB from '@app/db';
import { PaginatedResponse } from '@app/models';
import type { RollerCoaster } from '@app/types';
import { getRandom } from '@app/utils';
import { Service } from '@lib/decorators';

@Service()
/**
 * Handles retrieval of coaster data from the local JSON database.
 */
export default class RollerCoasterService {
  private _db: JsonDB;

  constructor() {
    this._db = JsonDB.getInstance();
  }

  private async _getCoastersDB(): Promise<RollerCoaster[]> {
    return await this._db.readDBFile<RollerCoaster[]>(__COASTERS_DB_FILENAME__);
  }

  public async getPaginatedCoasters(offset: number, limit: number): Promise<PaginatedResponse<RollerCoaster>> {
    const coasters: RollerCoaster[] = await this._getCoastersDB();
    const paginatedResponse = new PaginatedResponse<RollerCoaster>(coasters, offset, limit);

    return paginatedResponse;
  }

  public async getCoasterById(id: number): Promise<RollerCoaster | undefined> {
    const coasters: RollerCoaster[] = await this._getCoastersDB();

    return coasters.find(({ id: coasterId }: RollerCoaster) => coasterId === id);
  }

  /**
   * Look up coasters whose name or park includes the provided search term.
   */
  public async searchCoasters(searchTerm: string): Promise<RollerCoaster[]> {
    const coasters: RollerCoaster[] = await this._getCoastersDB();

    return coasters.filter(
      ({ name, park }: RollerCoaster) =>
        park.name?.toLowerCase()?.includes(searchTerm.toLowerCase()) ||
        name?.toLowerCase()?.includes(searchTerm?.toLowerCase().toLowerCase())
    );
  }

  /**
   * Retrieve a single random coaster from the database.
   */
  public async getRandomCoaster(): Promise<RollerCoaster | undefined> {
    const coasters: RollerCoaster[] = await this._getCoastersDB();
    if (coasters.length === 0) return undefined;

    const index = getRandom(0, coasters.length);
    return coasters[index];
  }
}
