// Envelope returned by paginated list endpoints (backend buildPaginated()).
// The axios layer already unwraps the { statusCode, data, timestamp } wrapper,
// so services receive this shape directly as `.data.data`.
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  meta: PaginationMeta;
}
