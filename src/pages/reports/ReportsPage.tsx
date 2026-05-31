import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { useCandidates } from '../../features/candidates/hooks/useCandidates';
import { useReports } from '../../features/reports/hooks/useReports';
import { reportService } from '../../services/report.service';
import { FITNESS_VARIANT } from '../../types/report.types';
import type { Report, ReportFile } from '../../types/report.types';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';

const fmtSize = (bytes?: number | null) => {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

/** Open a (pre-signed) URL for download/view. */
function triggerDownload(url: string, name: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.target = '_blank';
  a.rel = 'noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/** Resolve a fresh pre-signed URL for the file, then download/open it. */
async function downloadFile(file: ReportFile) {
  const url = await reportService.getFileUrl(file.id);
  triggerDownload(url, file.fileName);
}

/** Download several files, lightly staggered so the browser doesn't block them. */
async function downloadFiles(files: ReportFile[]) {
  for (const f of files) {
    try {
      const url = await reportService.getFileUrl(f.id);
      triggerDownload(url, f.fileName);
    } catch {
      /* skip files that fail to resolve */
    }
    await new Promise((r) => setTimeout(r, 350));
  }
}

const DownloadIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const ZipIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
  </svg>
);

const FileIcon = (
  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export function ReportsPage() {
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  const { data: reports, isLoading: reportsLoading } = useReports();
  const [search, setSearch] = useState('');
  const [exportNote, setExportNote] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const reportsByCandidate = useMemo(() => {
    const m = new Map<string, Report[]>();
    (reports ?? []).forEach((r) => {
      const list = m.get(r.candidateId) ?? [];
      list.push(r);
      m.set(r.candidateId, list);
    });
    return m;
  }, [reports]);

  const filesFor = (candidateId: string): ReportFile[] =>
    (reportsByCandidate.get(candidateId) ?? []).flatMap((r) => r.files ?? []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (candidates ?? []).filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.employeeCode.toLowerCase().includes(q) ||
        (c.store?.name ?? '').toLowerCase().includes(q),
    );
  }, [candidates, search]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, {
    resetKey: search,
  });

  // Only candidates that actually have report files can be selected.
  const selectableIds = useMemo(
    () => filtered.filter((c) => filesFor(c.id).length > 0).map((c) => c.id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filtered, reportsByCandidate],
  );
  const allChecked = selectableIds.length > 0 && selectableIds.every((id) => selected.has(id));
  const someChecked = !allChecked && selectableIds.some((id) => selected.has(id));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allChecked ? new Set() : new Set(selectableIds));

  const selectedFiles = useMemo(
    () => Array.from(selected).flatMap((id) => filesFor(id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, reportsByCandidate],
  );

  const isLoading = candidatesLoading || reportsLoading;
  const withReports = reportsByCandidate.size;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h1>
          <p className="text-slate-500 mt-1">
            Medical reports uploaded by the admin for your candidates
            {candidates && (
              <span className="text-slate-400"> · {withReports} of {candidates.length} candidates have a report</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            icon={DownloadIcon}
            variant="outline"
            onClick={() => downloadFiles(selectedFiles)}
            disabled={selectedFiles.length === 0}
            title={selectedFiles.length === 0 ? 'Select candidates to download' : 'Download selected report files'}
          >
            Download selected{selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}
          </Button>
          <Button
            icon={ZipIcon}
            onClick={() => setExportNote(true)}
            disabled={selectedFiles.length === 0}
            title={selectedFiles.length === 0 ? 'Select candidates to export' : 'Export selected reports as a ZIP'}
          >
            Export ZIP{selectedFiles.length > 0 ? ` (${selectedFiles.length})` : ''}
          </Button>
        </div>
      </div>

      {exportNote && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">ZIP export is coming soon.</p>
            <p className="mt-0.5 text-amber-600">
              Bundling reports into a single ZIP needs cloud (S3) storage, which isn't enabled yet. For now use{' '}
              <span className="font-medium">Download selected</span> (or the per-row download options) to get the files.
            </p>
          </div>
          <button onClick={() => setExportNote(false)} className="text-amber-500 hover:text-amber-700 shrink-0" aria-label="Dismiss">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onClear={() => setSearch('')}
          placeholder="Search candidates…"
          className="w-full sm:w-72"
        />
        {selected.size > 0 && (
          <button onClick={() => setSelected(new Set())} className="text-sm font-medium text-slate-500 hover:text-slate-700">
            Clear selection ({selected.size})
          </button>
        )}
      </div>

      {isLoading && <SkeletonTable rows={6} />}

      {!isLoading && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  <th className="px-5 py-3.5 w-10">
                    <input
                      type="checkbox"
                      checked={allChecked}
                      ref={(el) => { if (el) el.indeterminate = someChecked; }}
                      onChange={toggleAll}
                      disabled={selectableIds.length === 0}
                      className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-40"
                    />
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Fitness</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Uploaded</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Report files</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((c) => {
                  const reps = reportsByCandidate.get(c.id) ?? [];
                  const latest = reps[0]; // backend returns newest first
                  const files = reps.flatMap((r) => r.files ?? []);
                  const hasFiles = files.length > 0;
                  const checked = selected.has(c.id);
                  return (
                    <tr key={c.id} className={`transition-colors align-top ${checked ? 'bg-primary-50/40' : 'hover:bg-slate-50/50'}`}>
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(c.id)}
                          disabled={!hasFiles}
                          title={hasFiles ? 'Select for bulk download / export' : 'No report files'}
                          className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900 whitespace-nowrap">{c.name}</p>
                        <p className="text-xs text-slate-400 font-mono">{c.employeeCode}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-600 whitespace-nowrap">
                        {c.store?.name ?? '—'}
                        {c.store?.city?.name && <span className="text-xs text-slate-400"> · {c.store.city.name}</span>}
                      </td>
                      <td className="px-5 py-4">
                        {latest ? (
                          <Badge variant={FITNESS_VARIANT[latest.fitnessStatus]} size="sm">
                            {latest.fitnessStatus.toLowerCase()}
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">No report yet</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                        {latest ? format(new Date(latest.uploadedAt ?? latest.createdAt), 'd MMM yyyy') : '—'}
                      </td>
                      <td className="px-5 py-4">
                        {hasFiles ? (
                          <div className="space-y-1.5 max-w-[360px]">
                            {files.map((f) => (
                              <div key={f.id} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => downloadFile(f)}
                                  className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-primary-600 min-w-0"
                                  title="View / download"
                                >
                                  {FileIcon}
                                  <span className="truncate">{f.fileName}</span>
                                  {f.fileSize ? <span className="text-xs text-slate-400 shrink-0">· {fmtSize(f.fileSize)}</span> : null}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => downloadFile(f)}
                                  className="text-xs font-medium text-primary-600 hover:text-primary-700 shrink-0"
                                  title="Download this file"
                                >
                                  Download
                                </button>
                              </div>
                            ))}
                            {files.length > 1 && (
                              <button
                                type="button"
                                onClick={() => downloadFiles(files)}
                                className="text-xs font-semibold text-primary-600 hover:text-primary-700"
                              >
                                Download all ({files.length})
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
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
      )}

      {!isLoading && filtered.length === 0 && (
        <Card>
          <EmptyState
            icon={FileIcon}
            title={search ? 'No candidates found' : 'No candidates yet'}
            description={search ? `No results for "${search}"` : 'Once you add candidates and the admin uploads their reports, they will appear here.'}
          />
        </Card>
      )}
    </div>
  );
}
