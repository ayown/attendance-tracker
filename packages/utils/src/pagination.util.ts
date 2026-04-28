import type { PaginationQuery, PaginatedResponse } from '@attendance-tracker/shared-types';
import { PAGINATION_DEFAULTS } from '@attendance-tracker/config';

export function parsePagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || PAGINATION_DEFAULTS.PAGE);
  const limit = Math.min(
    PAGINATION_DEFAULTS.MAX_LIMIT,
    Math.max(1, Number(query.limit) || PAGINATION_DEFAULTS.LIMIT)
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function paginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
