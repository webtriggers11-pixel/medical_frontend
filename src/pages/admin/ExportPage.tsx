import { useMemo, useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { DateRangePicker, type DateRange } from '../../components/ui/DateRangePicker';
import { usePagination } from '../../hooks/usePagination';
import { useExportBookings } from '../../features/export/hooks/useExportBookings';
import { exportService } from '../../services/export.service';
import { getApiErrorMessage } from '../../lib/apiError';

type Preset = '7d' | '1m' | '6m' | 'all' | 'custom';

const PRESETS: { value: Preset; label: string }[] = [
  { value: '7d', label: 'Last 7 days' },
  { value: '1m', label: 'Last 1 month' },
  { value: '6m', label: 'Last 6 months' },
  { value: 'all', label: 'All time' },
  { value: 'custom', label: 'Custom range' },
];

const iso = (d: Date) => format(d, 'yyyy-MM-dd');

const DownloadIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const EmptyIcon = (
  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
  </svg>
);

export function ExportPage() {
  const [preset, setPreset] = useState<Preset>('1m');
  const [custom, setCustom] = useState<DateRange | undefined>(undefined);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  // Resolve the selected preset to {from, to} ISO dates (undefined = open-ended).
  const range = useMemo<{ from?: string; to?: string }>(() => {
    const today = new Date();
    switch (preset) {
      case '7d': return { from: iso(subDays(today, 7)), to: iso(today) };
      case '1m': return { from: iso(subMonths(today, 1)), to: iso(today) };
      case '6m': return { from: iso(subMonths(today, 6)), to: iso(today) };
      case 'all': return {};
      case 'custom':
        return {
          from: custom?.from ? iso(custom.from) : undefined,
          to: custom?.to ? iso(custom.to) : undefined,
        };
    }
  }, [preset, custom]);

  const customIncomplete = preset === 'custom' && (!range.from || !range.to);

  const { data, isLoading, isError } = useExportBookings(customIncomplete ? {} : range);
  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];

  const { page, setPage, totalPages, pageItems } = usePagination(rows, {
    resetKey: `${preset}:${range.from}:${range.to}`,
  });

  const handleDownload = async () => {
    setError('');
    setDownloading(true);
    try {
      await exportService.downloadBookings(range);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to export. Please try again.'));
    } finally {
      setDownloading(false);
    }
  };

  const rangeText =
    preset === 'all'
      ? 'All bookings'
      : range.from
        ? `${range.from} → ${range.to ?? 'today'}`
        : 'Pick a start and end date';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Export</h1>
          <p className="text-slate-500 mt-1">
            Download the full bookings billing dataset — client, store, candidate, lab and package details.
          </p>
        </div>
        <Button icon={DownloadIcon} loading={downloading} disabled={customIncomplete || rows.length === 0} onClick={handleDownload}>
          Download CSV
        </Button>
      </div>

      {/* Controls */}
      <Card>
        <div className="space-y-4">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600">{error}</p>}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Date range (by checkup date)</p>
            <div className="flex flex-wrap items-center gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPreset(p.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                    preset === p.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-border bg-surface text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
              {preset === 'custom' && (
                <DateRangePicker value={custom} onChange={setCustom} />
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge variant="default" size="sm">{rangeText}</Badge>
            {!customIncomplete && <span>· {rows.length} booking{rows.length === 1 ? '' : 's'} match</span>}
          </div>
        </div>
      </Card>

      {/* Preview table */}
      {customIncomplete ? (
        <EmptyState icon={EmptyIcon} title="Select a date range" description="Pick both a start and end date to preview and export." />
      ) : isLoading ? (
        <SkeletonTable rows={6} />
      ) : isError ? (
        <Card><p className="text-sm font-medium text-red-600">Failed to load data. Please try again.</p></Card>
      ) : rows.length === 0 ? (
        <EmptyState icon={EmptyIcon} title="No bookings in this range" description="Try a wider date range or 'All time'." />
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-max min-w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/60">
                  {columns.map((c, i) => (
                    <th key={`${c}-${i}`} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pageItems.map((row, ri) => (
                  <tr key={ri} className="hover:bg-slate-50/60 transition-colors">
                    {row.map((val, ci) => (
                      <td key={ci} className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {val === '' || val === null || val === undefined ? <span className="text-slate-300">—</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="border-t border-border px-4 py-3">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
