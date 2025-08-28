import type { PaginationMetadata } from '@app/types';

/**
 * Objet utilitaire retourné par certaines routes pour encapsuler les données
 * paginées ainsi que les informations de pagination.
 */
export default class PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadata;

  constructor(data: T[], offset: number = 0, limit: number = 4000) {
    // Sélectionne seulement la portion de données demandée.
    this.data = [...data].splice(offset, limit);
    this.pagination = {
      count: limit,
      total: data.length,
      offset,
      limit,
    };
  }
}
