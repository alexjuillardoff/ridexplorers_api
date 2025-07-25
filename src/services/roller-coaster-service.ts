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

  public async getCoastersByRegion(region: string): Promise<RollerCoaster[]> {
    const coasters = await this._getCoastersDB();
    return coasters.filter((c) => c.region?.toLowerCase() === region.toLowerCase());
  }

  public async filterCoasters(filters: {
    make?: string;
    model?: string;
    type?: string;
    design?: string;
    inversions?: string;
    elements?: string;
    height?: string;
  }): Promise<RollerCoaster[]> {
    const coasters = await this._getCoastersDB();
    return coasters.filter((c) => {
      if (filters.make && !c.make?.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.model && !c.model?.toLowerCase().includes(filters.model.toLowerCase())) return false;
      if (filters.type && !c.type?.toLowerCase().includes(filters.type.toLowerCase())) return false;
      if (filters.design && !c.design?.toLowerCase().includes(filters.design.toLowerCase())) return false;
      if (filters.inversions && !c.stats?.inversions?.toString().toLowerCase().includes(filters.inversions.toLowerCase())) return false;
      if (filters.elements) {
        const elems = Array.isArray(c.stats?.elements)
          ? (c.stats?.elements as string[])
          : c.stats?.elements
          ? [c.stats.elements as string]
          : [];
        if (!elems.some((e) => e.toLowerCase().includes(filters.elements!.toLowerCase()))) return false;
      }
      if (filters.height && !c.stats?.height?.toLowerCase().includes(filters.height.toLowerCase())) return false;
      return true;
    });
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
