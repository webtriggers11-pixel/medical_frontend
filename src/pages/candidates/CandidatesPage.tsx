import { useState, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCandidates } from '../../features/candidates/hooks/useCandidates';
import { useBookings } from '../../features/booking/hooks/useBookings';
import { BulkUploadModal } from '../../features/candidates/components/BulkUploadModal';
import { candidatesService } from '../../services/candidates.service';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { format } from 'date-fns';
import type { CandidateType } from '../../types/candidate.types';
import { STATUS_LABEL, STATUS_VARIANT } from '../../types/booking.types';
import type { Booking } from '../../types/booking.types';

const typeVariant: Record<CandidateType, 'primary' | 'success' | 'warning'> = {
  NEW_JOINER: 'success',
  EXISTING: 'primary',
  ANNUAL: 'warning',
};

const typeLabel: Record<CandidateType, string> = {
  NEW_JOINER: 'New Joiner',
  EXISTING: 'Existing',
  ANNUAL: 'Annual',
};

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const DownloadIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const UploadIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

type TypeFilter = 'ALL' | CandidateType;

const STAT_TILES: { key: TypeFilter; label: string; bg: string; color: string; icon: React.ReactNode }[] = [
  {
    key: 'ALL', label: 'Total candidates', bg: 'bg-primary-50', color: 'text-primary-600',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  },
  {
    key: 'NEW_JOINER', label: 'New joiners', bg: 'bg-emerald-50', color: 'text-emerald-600',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>,
  },
  {
    key: 'EXISTING', label: 'Existing', bg: 'bg-sky-50', color: 'text-sky-600',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0z" /></svg>,
  },
  {
    key: 'ANNUAL', label: 'Annual', bg: 'bg-amber-50', color: 'text-amber-600',
    icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
];

export function CandidatesPage() {
  const navigate = useNavigate();
  const { data: candidates, isLoading, error } = useCandidates();
  const { data: bookings } = useBookings();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('ALL');
  const [bulkOpen, setBulkOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Active booking per candidate
  const bookingByCandidate = (bookings ?? []).reduce((acc, b) => {
    if (b.status === 'CANCELLED') return acc;
    if (!acc[b.candidateId]) acc[b.candidateId] = b;
    return acc;
  }, {} as Record<string, Booking>);

  const handleDownloadTemplate = async () => {
    setDownloading(true);
    try { await candidatesService.downloadTemplate(); }
    finally { setDownloading(false); }
  };

  const counts = (candidates ?? []).reduce(
    (acc, c) => { acc.ALL += 1; acc[c.candidateType] += 1; return acc; },
    { ALL: 0, NEW_JOINER: 0, EXISTING: 0, ANNUAL: 0 } as Record<TypeFilter, number>,
  );

  const filtered = candidates?.filter((c) => {
    if (typeFilter !== 'ALL' && c.candidateType !== typeFilter) return false;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.employeeCode.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.store?.name ?? '').toLowerCase().includes(q)
    );
  });

  const hasFilter = !!search || typeFilter !== 'ALL';
  const isEmpty = !!candidates && candidates.length === 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Management</h1>
          <p className="text-slate-500 mt-1">
            Add, import and track candidates
            {candidates && <span className="text-slate-400"> · {candidates.length} total</span>}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button icon={PlusIcon} onClick={() => navigate('/candidates/new')}>Add new candidate</Button>
          <Button variant="outline" icon={DownloadIcon} onClick={handleDownloadTemplate} loading={downloading}>
            Download template
          </Button>
          <Button variant="secondary" icon={UploadIcon} onClick={() => setBulkOpen(true)}>
            Bulk upload
          </Button>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {STAT_TILES.map((t) => {
          const active = typeFilter === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTypeFilter(t.key)}
              className={`group rounded-2xl border bg-surface p-4 text-left shadow-card transition-all hover:shadow-card-hover ${active ? 'border-primary-400 ring-2 ring-primary-500/15' : 'border-border/70'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold tracking-tight text-slate-900">{counts[t.key]}</span>
                <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${t.bg} ${t.color}`}>{t.icon}</span>
              </div>
              <p className="mt-1 text-sm text-slate-500">{t.label}</p>
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search candidates..." className="w-full sm:w-80" />
        <div className="flex items-center gap-3 text-sm text-slate-500">
          {filtered && <span>{filtered.length} {filtered.length === 1 ? 'candidate' : 'candidates'}{typeFilter !== 'ALL' && <> · {typeLabel[typeFilter]}</>}</span>}
          {hasFilter && <button onClick={() => { setSearch(''); setTypeFilter('ALL'); }} className="font-medium text-primary-600 hover:text-primary-700">Clear</button>}
        </div>
      </div>

      {isLoading && <SkeletonTable rows={5} />}

      {error && (
        <Card>
          <p className="text-sm font-medium text-red-600">Failed to load candidates. Please try again.</p>
        </Card>
      )}

      {filtered && filtered.length > 0 && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Emp. Code</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Mobile</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Store</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Appointment date</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((c) => {
                  const booking = bookingByCandidate[c.id];
                  const isExpanded = expandedId === c.id;
                  const isBooked = !!booking;
                  return (
                    <Fragment key={c.id}>
                      <tr className="group hover:bg-slate-50/70 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <Avatar name={c.name} size="sm" />
                            <div>
                              <p className="font-medium text-slate-900">{c.name}</p>
                              <p className="text-xs text-slate-500">{c.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{c.employeeCode}</td>
                        <td className="px-5 py-3.5 text-slate-600">{c.mobile}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={typeVariant[c.candidateType]} size="sm">{typeLabel[c.candidateType]}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{c.store?.name ?? '—'}</td>
                        <td className="px-5 py-3.5 text-slate-600">
                          {c.appointmentDate ? format(new Date(c.appointmentDate), 'd MMM yyyy') : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          {isBooked ? (
                            <Badge variant={STATUS_VARIANT[booking.status]} size="sm">{STATUS_LABEL[booking.status]}</Badge>
                          ) : c.appointmentDate ? (
                            <Badge variant="warning" size="sm">Requested</Badge>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5">
                          {isBooked ? (
                            <Button size="sm" variant="ghost" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                              {isExpanded ? 'Hide details' : 'View details'}
                            </Button>
                          ) : (
                            <span className="text-xs text-amber-600 font-medium">Awaiting admin</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && booking && (
                        <tr className="bg-slate-50/60">
                          <td colSpan={8} className="px-5 py-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Panel</p>
                                <p className="font-medium text-slate-800">{booking.panel?.name ?? '—'}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {(booking.panel?.bundledTest?.testsIncluded ?? []).map((t) => (
                                    <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-white border border-border text-slate-500">{t}</span>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Lab</p>
                                <p className="font-medium text-slate-800">{booking.lab?.name ?? '—'}</p>
                                <p className="text-xs text-slate-500">{booking.lab?.contactMobile}</p>
                                {booking.lab?.address && (
                                  <p className="text-xs text-slate-500 mt-0.5">{booking.lab.address}{booking.lab.pincode ? ` - ${booking.lab.pincode}` : ''}</p>
                                )}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Date & time</p>
                                <p className="font-medium text-slate-800">
                                  {booking.scheduledDate ? format(new Date(booking.scheduledDate), 'd MMM yyyy') : (booking.reqDate ? format(new Date(booking.reqDate), 'd MMM yyyy') : '—')}
                                </p>
                                <p className="text-xs text-slate-500">{booking.timeSlot ?? '—'}</p>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Status</p>
                                <Badge variant={STATUS_VARIANT[booking.status]} size="sm">{STATUS_LABEL[booking.status]}</Badge>
                                {booking.amountCharged != null && (
                                  <p className="text-xs text-slate-500 mt-1.5">Charged: ₹{Number(booking.amountCharged).toLocaleString('en-IN')}</p>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filtered && filtered.length === 0 && !isEmpty && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>}
            title="No matching candidates"
            description="Try a different search term or candidate type."
            action={<Button variant="secondary" size="sm" onClick={() => { setSearch(''); setTypeFilter('ALL'); }}>Clear filters</Button>}
          />
        </Card>
      )}

      {isEmpty && (
        <Card>
          <EmptyState
            icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" /></svg>}
            title="No candidates yet"
            description="Add your first candidate or import a batch."
            action={<Button size="sm" icon={PlusIcon} onClick={() => navigate('/candidates/new')}>Add new candidate</Button>}
          />
        </Card>
      )}

      <BulkUploadModal open={bulkOpen} onClose={() => setBulkOpen(false)} />
    </div>
  );
}
