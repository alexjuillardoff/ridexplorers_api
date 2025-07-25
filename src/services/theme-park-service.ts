import { Service } from '@lib/decorators';
import JsonDB from '@app/db';
import type { ThemePark } from '@app/types';
import { __THEME_PARKS_DB_FILENAME__ } from 'constants/database';
import { PaginatedResponse } from '@app/models';

@Service()
/**
 * Service providing access to theme park information stored in JSON files.
 */
export default class ThemeParkService {
  private _dbJson: JsonDB;

  constructor() {
    this._dbJson = JsonDB.getInstance();
  }

  private async _getThemeParksDb(): Promise<ThemePark[]> {
    return await this._dbJson.readDBFile<ThemePark[]>(__THEME_PARKS_DB_FILENAME__);
  }

  public async getPaginatedThemeParks(offset: number, limit: number): Promise<PaginatedResponse<ThemePark>> {
    const themeParks: ThemePark[] = await this._getThemeParksDb();
    const paginatedResponse = new PaginatedResponse<ThemePark>(themeParks, offset, limit);

    return paginatedResponse;
  }

  public async getThemeParkById(themeParkId: number): Promise<ThemePark | undefined> {
    const themeParks: ThemePark[] = await this._getThemeParksDb();

    // Return the park with the matching id if it exists
    return themeParks.find(({ id }: ThemePark) => id === themeParkId);
  }

  /**
   * Search a theme park by name.
   */
  public async searchThemeParks(searchTerm: string): Promise<ThemePark[]> {
    const themeParks: ThemePark[] = await this._getThemeParksDb();

    return themeParks.filter(({ name }: ThemePark) =>
      name?.toLowerCase()?.includes(searchTerm.toLowerCase())
    );
  }

  public async getThemeParksByRegion(region: string): Promise<ThemePark[]> {
    const themeParks = await this._getThemeParksDb();
    return themeParks.filter(
      ({ country, state, city }: ThemePark) =>
        country?.toLowerCase().includes(region.toLowerCase()) ||
        state?.toLowerCase().includes(region.toLowerCase()) ||
        city?.toLowerCase().includes(region.toLowerCase())
    );
  }
}
