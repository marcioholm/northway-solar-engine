import { Allow } from 'class-validator';
export class PaginationDto {
  @Allow()
  page?: number = 1;
  @Allow()
  limit?: number = 50;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data: items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
}
