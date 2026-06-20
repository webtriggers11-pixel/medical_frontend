import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useCandidatesPage } from '../../features/candidates/hooks/useCandidates';
import { downloadReportFiles as downloadFiles } from '../../features/reports/lib/fileDownload';
import { ReportPreviewDrawer } from '../../features/reports/components/ReportPreviewDrawer';
import { FITNESS_VARIANT } from '../../types/report.types';
import type { ReportFile } from '../../types/report.types';
import type { Candidate } from '../../types/candidate.types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { BusyOverlay } from '../../components/ui/BusyOverlay';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

const EyeIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);
const DownloadIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);
const FileIcon = (
  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export function ReportsPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);
  const [page, setPage] = useState(1);
  // Reset to page 1 when the search changes.
  useEffect(() => setPage(1), [debouncedSearch]);

  const { data, isLoading, isFetching } = useCandidatesPage({
    page,
    limit: 10,
    search: debouncedSearch,
    with: 'reports',
  });
  const pageItems = data?.items ?? [];
  const totalPages = data?.meta.totalPages ?? 1;
  const total = data?.meta.total ?? 0;

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<{ candidateName: string; files: ReportFile[]; index: number } | null>(null);
  // Selection is scoped to the current page; clear it when the page or search
  // changes so it never references off-page candidates.
  useEffect(() => setSelected(new Set()), [page, debouncedSearch]);

  const filesFor = (c: Candidate): ReportFile[] =>
    (c.reports ?? []).flatMap((r) => r.files ?? []);

  // Multi-select for bulk download — only candidates on this page with files.
  const selectableIds = pageItems.filter((c) => filesFor(c).length > 0).map((c) => c.id);
  const allChecked = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
  const someChecked = !allChecked && selectableIds.some((id) => selected.has(id));
  const toggle = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(selectableIds));
  const selectedFiles = pageItems
    .filter((c) => selected.has(c.id))
    .flatMap((c) => filesFor(c));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-slate-500 mt-1">
            Medical reports uploaded by the admin for your candidates
            {data && <span className="text-slate-400"> · {total} candidate{total === 1 ? '' : 's'}</span>}
          </p>
        </div>
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search candidates…"
          className="w-full sm:w-72"
        />
      </div>

      {/* contextual bulk-download bar — only when rows are selected */}
      {selectedFiles.length > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 animate-fade-in">
          <p className="text-sm font-medium text-primary-700">
            {selected.size} candidate{selected.size > 1 ? 's' : ''} selected
            <span className="text-primary-400"> · {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''}</span>
          </p>
          <div className="flex items-center gap-3">
            <button onClick={() => setSelected(new Set())} className="text-sm font-medium text-slate-500 hover:text-slate-700">Clear</button>
            <Button size="sm" icon={DownloadIcon} onClick={() => downloadFiles(selectedFiles)}>Download selected</Button>
          </div>
        </div>
      )}

      {isLoading && <SkeletonTable rows={6} />}

      {!isLoading && pageItems.length > 0 && (
        <div className="relative">
          <BusyOverlay show={isFetching && !isLoading} />
          <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked; }}
                      onChange={toggleAll}
                      disabled={selectableIds.length === 0}
                      aria-label="Select all"
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-40"
                    />
                  </th>
                  {['Candidate', 'Store', 'Fitness', 'Uploaded', 'Report'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((c) => {
                  const reps = c.reports ?? [];
                  const latest = reps[0]; // backend returns newest first
                  const files = filesFor(c);
                  const hasFiles = files.length > 0;
                  const checked = selected.has(c.id);
                  return (
                    <tr key={c.id} className={`transition-colors ${checked ? 'bg-primary-50/40' : 'hover:bg-slate-50/60'}`}>
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(c.id)}
                          disabled={!hasFiles}
                          title={hasFiles ? 'Select for bulk download' : 'No report files'}
                          aria-label={`Select ${c.name}`}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 whitespace-nowrap">{c.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{c.employeeCode || '—'}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {c.store?.name ?? '—'}
                        {c.store?.city?.name && <span className="text-xs text-slate-400"> · {c.store.city.name}</span>}
                      </td>
                      <td className="px-5 py-4">
                        {latest ? (
                          <Badge variant={FITNESS_VARIANT[latest.fitnessStatus]} size="sm">{latest.fitnessStatus.toLowerCase()}</Badge>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {latest ? format(new Date(latest.uploadedAt ?? latest.createdAt), 'd MMM yyyy') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {hasFiles ? (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setPreview({ candidateName: c.name, files, index: 0 })}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100"
                            >
                              {EyeIcon}
                              Preview{files.length > 1 ? ` (${files.length})` : ''}
                            </button>
                            <button
                              type="button"
                              onClick={() => downloadFiles(files)}
                              title="Download"
                              aria-label="Download report"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                            >
                              {DownloadIcon}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300">Not uploaded yet</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-end px-5 py-3 border-t border-border">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
          </Card>
        </div>
      )}

      {!isLoading && pageItems.length === 0 && (
        <Card>
          <EmptyState
            icon={FileIcon}
            title={search ? 'No candidates found' : 'No candidates yet'}
            description={search ? `No results for "${search}"` : 'Once you add candidates and the admin uploads their reports, they will appear here.'}
          />
        </Card>
      )}

      {preview && (
        <ReportPreviewDrawer
          open
          onClose={() => setPreview(null)}
          candidateName={preview.candidateName}
          files={preview.files}
          initialIndex={preview.index}
        />
      )}
    </div>
  );
}
