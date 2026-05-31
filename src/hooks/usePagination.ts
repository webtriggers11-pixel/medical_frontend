import { useState } from 'react';

/** Default rows per page for every table/list in the app. */
export const DEFAULT_PAGE_SIZE = 10;

/**
 * Client-side pagination over an already-filtered array.
 *
 * Pass a `resetKey` built from the active filters/search so the view jumps
 * back to page 1 whenever the filtered set changes. The returned `page` is
 * always clamped to the valid range, so a shrinking list never strands the
 * user on an empty page.
 */
export function usePagination<T>(
  items: T[],
  options?: { pageSize?: number; resetKey?: unknown },
) {
  const pageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const [page, setPage] = useState(1);

  // Reset to the first page whenever the filter signature changes. Adjusting
  // state during render (rather than in an effect) is React's recommended way
  // to react to a changed input — it avoids an extra render + flash.
  const [prevKey, setPrevKey] = useState(options?.resetKey);
  if (options?.resetKey !== prevKey) {
    setPrevKey(options?.resetKey);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  return {
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    pageSize,
    total: items.length,
  };
}
