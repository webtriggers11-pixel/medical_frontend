/**
 * Subtle "updating" overlay for server-driven tables/lists.
 *
 * Server-side search/filter/pagination fetches keep the previous rows visible
 * (TanStack `keepPreviousData`), so `isLoading` is only true on the very first
 * load. For every subsequent filter/search/page change the query is
 * `isFetching` instead — render this over the table for that case so the user
 * gets feedback that new results are loading.
 *
 * Usage: wrap the table container in a `relative` element and drop this inside:
 *   <div className="relative">
 *     <BusyOverlay show={isFetching && !isLoading} />
 *     <Card padding="none"> ...table... </Card>
 *   </div>
 */
export function BusyOverlay({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center rounded-2xl bg-white/45 backdrop-blur-[1px] transition-opacity animate-fade-in">
      <span className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-500 shadow-card ring-1 ring-border">
        <svg className="h-3.5 w-3.5 animate-spin text-primary-500" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Updating…
      </span>
    </div>
  );
}
