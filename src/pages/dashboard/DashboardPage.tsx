import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { Button } from '../../components/ui/Button';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Combobox } from '../../components/ui/Combobox';
import { DateRangePicker, type DateRange } from '../../components/ui/DateRangePicker';
import { FunnelChart, type FunnelDatum } from '../../components/charts/FunnelChart';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { usePagination } from '../../hooks/usePagination';
import { useCandidates, useSetCandidateApproval } from '../../features/candidates/hooks/useCandidates';
import { Switch } from '../../components/ui/Switch';
import { useBookings } from '../../features/booking/hooks/useBookings';
import { RescheduleModal } from '../../features/booking/components/RescheduleModal';
import { UploadReportModal } from '../../features/reports/components/UploadReportModal';
import { EditReportModal } from '../../features/reports/components/EditReportModal';
import { useReports } from '../../features/reports/hooks/useReports';
import type { Booking } from '../../types/booking.types';
import { bookingStatusLabel, bookingStatusVariant, isRescheduled } from '../../types/booking.types';
import type { Report } from '../../types/report.types';

/* ── client (USER) dashboard — dummy data for now ─────────────────────── */

// Health-checkup pipeline, from active employees down to fit-certified.
const PIPELINE: FunnelDatum[] = [
  { name: 'Active Employed', value: 1248 },
  { name: 'Appointment Requested', value: 920 },
  { name: 'Scheduled', value: 640 },
  { name: 'Visited', value: 470 },
  { name: 'Report Uploaded', value: 300 },
  { name: 'Fit Certified', value: 250 },
];

const PIPELINE_COLORS = ['#4F46E5', '#6366F1', '#8B5CF6', '#A855F7', '#D6459F', '#EC6A88'];

const UsersIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const CalendarIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const ClockDocIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
const BadgeCheckIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const StoreIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72M6.75 18h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
);
const PlusIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);
const ListIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
  </svg>
);

const CLIENT_ACTIONS: { label: string; icon: React.ReactNode; to: string }[] = [
  { label: 'Add new candidate', icon: PlusIcon, to: '/candidates/new' },
  { label: 'View candidates', icon: ListIcon, to: '/candidates' },
  { label: 'Add new store', icon: PlusIcon, to: '/stores/new' },
  { label: 'View stores', icon: StoreIcon, to: '/stores' },
];

const MaximizeIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 8.25V4.5h3.75M16.5 4.5h3.75v3.75M20.25 15.75v3.75H16.5M7.5 19.5H3.75v-3.75" />
  </svg>
);
const MinimizeIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M15 9V4.5M15 9h4.5M9 15v4.5M9 15H4.5M15 15v4.5M15 15h4.5" />
  </svg>
);

// The funnel chart + its header — reused inline and in the maximized overlay.
function PipelineChart({
  maximized,
  onToggle,
  fill,
}: {
  maximized: boolean;
  onToggle: () => void;
  fill?: boolean;
}) {
  return (
    <>
      <CardHeader className="px-5 pt-5">
        <div>
          <CardTitle>Health checkup pipeline</CardTitle>
          <p className="text-sm text-slate-500 mt-0.5">From active employees to fit certification</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="default" size="sm">Sample data</Badge>
          <button
            type="button"
            onClick={onToggle}
            title={maximized ? 'Minimize' : 'Maximize'}
            aria-label={maximized ? 'Minimize' : 'Maximize'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            {maximized ? MinimizeIcon : MaximizeIcon}
          </button>
        </div>
      </CardHeader>
      <div className={fill ? 'flex-1 min-h-0 px-3 pb-3' : 'px-3 pb-4'}>
        <FunnelChart data={PIPELINE} colors={PIPELINE_COLORS} height={fill ? '100%' : 380} />
      </div>
    </>
  );
}

function ClientDashboard({ firstName }: { firstName: string }) {
  const navigate = useNavigate();
  const [maximized, setMaximized] = useState(false);

  // Lock scroll + close on Escape while maximized.
  useEffect(() => {
    if (!maximized) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMaximized(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [maximized]);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-slate-500 mt-1">Here's your employee health-checkup overview.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <StatsCard
          title="Total Active Employed"
          value="1,248"
          change={{ value: '4.2%', positive: true }}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          icon={UsersIcon}
        />
        <StatsCard
          title="Scheduled Bookings"
          value="86"
          change={{ value: '12 this week', positive: true }}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          icon={CalendarIcon}
        />
        <StatsCard
          title="Pending Reports"
          value="32"
          change={{ value: '5 overdue', positive: false }}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          icon={ClockDocIcon}
        />
        <StatsCard
          title="Fit Certified"
          value="940"
          change={{ value: '75.3%', positive: true }}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          icon={BadgeCheckIcon}
        />
      </div>

      {/* Funnel + quick actions */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5 lg:gap-6">
        {/* Funnel */}
        <Card padding="none" className="xl:col-span-3">
          <PipelineChart maximized={false} onToggle={() => setMaximized(true)} />
        </Card>

        {/* Quick actions */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="p-3 space-y-1">
            {CLIENT_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => navigate(action.to)}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-200 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors duration-200 shrink-0">
                  {action.icon}
                </div>
                {action.label}
                <svg className="w-4 h-4 text-slate-300 ml-auto group-hover:text-slate-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Maximized funnel overlay */}
      {maximized && (
        <div className="fixed inset-0 z-50 flex flex-col p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm animate-fade-in"
            onClick={() => setMaximized(false)}
          />
          <div className="relative z-10 flex flex-1 flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-xl animate-scale-in">
            <PipelineChart maximized onToggle={() => setMaximized(false)} fill />
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.email?.split('@')[0] ?? 'User';

  // Clients (USER role) get the employee health-checkup overview + funnel.
  if (user?.role === 'USER') {
    return <ClientDashboard firstName={firstName} />;
  }

  return <AdminDashboard firstName={firstName} />;
}

/* ── Stat chip for the hero ──────────────────────────────────── */

function StatPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className={`flex flex-col items-center px-4 py-2 rounded-2xl ${color}`}>
      <span className="text-xl font-bold leading-none">{value}</span>
      <span className="text-xs font-medium mt-0.5 opacity-75">{label}</span>
    </div>
  );
}

/* ── Filter chip (active filter indicator) ───────────────────── */

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary-50 border border-primary-200 text-xs font-medium text-primary-700">
      {label}
      <button onClick={onRemove} className="hover:text-primary-900 transition-colors leading-none ml-0.5">
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </span>
  );
}

/* ── Admin dashboard ─────────────────────────────────────────── */

const ALL = '';
const APPROVE_OPTIONS = [
  { value: ALL, label: 'All' },
  { value: 'true', label: 'Approved' },
  { value: 'false', label: 'Not approved' },
];

// Booking-status filter buckets (grouped over the raw booking statuses).
const STATUS_OPTIONS = [
  { value: ALL, label: 'All statuses' },
  { value: 'APPT_REQ', label: 'Appointment requested' },
  { value: 'SCHEDULE', label: 'Scheduled' },
  { value: 'RESCHEDULE', label: 'Reschedule' },
  { value: 'REPORT_PENDING', label: 'Report pending' },
  { value: 'DONE', label: 'Done' },
];

/** Map a candidate's latest booking (or none) to a status filter bucket. */
function statusBucket(booking?: Booking): string {
  if (!booking) return 'APPT_REQ';
  switch (booking.status) {
    case 'SCHEDULED':
      return isRescheduled(booking) ? 'RESCHEDULE' : 'SCHEDULE';
    case 'CANCELLED':
      return 'RESCHEDULE';
    case 'VISITED':
      return 'REPORT_PENDING';
    case 'REPORT_UPLOADED':
    case 'FIT':
    case 'UNFIT':
      return 'DONE';
    case 'APPOINTMENT_REQUESTED':
    default:
      // no booking yet, or still an appointment request
      return 'APPT_REQ';
  }
}


function AdminDashboard({ firstName }: { firstName: string }) {
  const navigate = useNavigate();
  const { data: candidates, isLoading, error } = useCandidates();
  const { data: bookings } = useBookings();
  const { data: reports } = useReports();
  const setApproval = useSetCandidateApproval();

  /* ── filters ── */
  const [fClient, setFClient] = useState(ALL);
  const [fZone, setFZone] = useState(ALL);
  const [fCity, setFCity] = useState(ALL);
  const [fStore, setFStore] = useState(ALL);
  const [fLab, setFLab] = useState(ALL);
  const [fStatus, setFStatus] = useState(ALL);
  const [fApprove, setFApprove] = useState(ALL);
  const [fDateRange, setFDateRange] = useState<DateRange | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(true);

  const resetFilters = () => { setFClient(ALL); setFZone(ALL); setFCity(ALL); setFStore(ALL); setFLab(ALL); setFStatus(ALL); setFApprove(ALL); setFDateRange(undefined); };
  const hasFilter = !!(fClient || fZone || fCity || fStore || fLab || fStatus || fApprove || fDateRange?.from);
  const activeFilterCount = [fClient, fZone, fCity, fStore, fLab, fStatus, fApprove].filter(Boolean).length + (fDateRange?.from ? 1 : 0);

  /* ── booking map ── */
  const bookingMap = useMemo(() => {
    const m = new Map<string, typeof bookings extends (infer T)[] | undefined ? T : never>();
    bookings?.forEach((b) => { const ex = m.get(b.candidateId); if (!ex || new Date(b.createdAt) > new Date(ex.createdAt)) m.set(b.candidateId, b); });
    return m;
  }, [bookings]);

  /* ── report map — keyed by bookingId ── */
  const reportMap = useMemo(() => {
    const m = new Map<string, Report>();
    reports?.forEach((r) => m.set(r.bookingId, r));
    return m;
  }, [reports]);

  /* ── derived options ── */
  const clientOpts = useMemo(() => { const s = new Map<string, string>(); candidates?.forEach((c) => { if (c.client) s.set(c.clientId, c.client.name ?? c.client.email); }); return [{ value: ALL, label: 'All clients' }, ...Array.from(s, ([v, l]) => ({ value: v, label: l }))]; }, [candidates]);
  const zoneOpts = useMemo(() => { const s = new Map<string, string>(); candidates?.forEach((c) => { const z = c.store?.city?.zone; if (z) s.set(z.id, z.name); }); return [{ value: ALL, label: 'All zones' }, ...Array.from(s, ([v, l]) => ({ value: v, label: l }))]; }, [candidates]);
  const cityOpts = useMemo(() => { const s = new Map<string, string>(); candidates?.forEach((c) => { const city = c.store?.city; if (!city) return; if (fZone && city.zone?.id !== fZone) return; s.set(city.id, city.name); }); return [{ value: ALL, label: 'All cities' }, ...Array.from(s, ([v, l]) => ({ value: v, label: l }))]; }, [candidates, fZone]);
  const storeOpts = useMemo(() => { const s = new Map<string, string>(); candidates?.forEach((c) => { if (!c.store) return; if (fCity && c.store.city?.id !== fCity) return; if (fZone && c.store.city?.zone?.id !== fZone) return; s.set(c.storeId, `${c.store.name} (${c.store.storeCode})`); }); return [{ value: ALL, label: 'All stores' }, ...Array.from(s, ([v, l]) => ({ value: v, label: l }))]; }, [candidates, fCity, fZone]);
  const labOpts = useMemo(() => { const s = new Map<string, string>(); bookings?.forEach((b) => { if (b.lab) s.set(b.lab.id, b.lab.name); }); return [{ value: ALL, label: 'All labs' }, ...Array.from(s, ([v, l]) => ({ value: v, label: l }))]; }, [bookings]);

  /* ── filtered list ── */
  // Everything except the booking-status filter — so the status breakdown can
  // always show the count for each bucket within the current scope.
  const baseFiltered = useMemo(() => {
    if (!candidates) return [];
    return candidates.filter((c) => {
      if (fClient && c.clientId !== fClient) return false;
      if (fZone && c.store?.city?.zone?.id !== fZone) return false;
      if (fCity && c.store?.city?.id !== fCity) return false;
      if (fStore && c.storeId !== fStore) return false;
      if (fLab) { const b = bookingMap.get(c.id); if (b?.lab?.id !== fLab) return false; }
      if (fApprove !== ALL && String(c.isApproved) !== fApprove) return false;
      if (fDateRange?.from) {
        if (!c.appointmentDate) return false;
        const d = new Date(c.appointmentDate); d.setHours(0, 0, 0, 0);
        const from = new Date(fDateRange.from); from.setHours(0, 0, 0, 0);
        if (d < from) return false;
        if (fDateRange.to) { const to = new Date(fDateRange.to); to.setHours(23, 59, 59, 999); if (d > to) return false; }
      }
      return true;
    });
  }, [candidates, bookingMap, fClient, fZone, fCity, fStore, fLab, fApprove, fDateRange]);

  const filtered = useMemo(
    () => (fStatus ? baseFiltered.filter((c) => statusBucket(bookingMap.get(c.id)) === fStatus) : baseFiltered),
    [baseFiltered, fStatus, bookingMap],
  );

  // Count per status bucket (within the non-status filters).
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    baseFiltered.forEach((c) => {
      const b = statusBucket(bookingMap.get(c.id));
      counts[b] = (counts[b] ?? 0) + 1;
    });
    return counts;
  }, [baseFiltered, bookingMap]);

  const { page, setPage, totalPages, pageItems } = usePagination(filtered, {
    resetKey: `${fClient}|${fZone}|${fCity}|${fStore}|${fLab}|${fStatus}|${fApprove}|${fDateRange?.from?.toISOString() ?? ''}|${fDateRange?.to?.toISOString() ?? ''}`,
  });

  /* ── stats ── */
  const totalBooked = useMemo(() => filtered.filter((c) => bookingMap.has(c.id)).length, [filtered, bookingMap]);
  const totalApproved = useMemo(() => filtered.filter((c) => c.isApproved).length, [filtered]);
  const totalPending = filtered.length - totalBooked;

  const [uploadTarget, setUploadTarget] = useState<{ bookingId: string; candidateName: string; tests: string[] } | null>(null);
  const [editReportTarget, setEditReportTarget] = useState<{ report: Report; candidateName: string } | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<{ booking: Booking; candidateName: string } | null>(null);

  const th = 'text-left px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap';

  /* ── label lookup helpers ── */
  const clientLabel = clientOpts.find((o) => o.value === fClient)?.label;
  const zoneLabel = zoneOpts.find((o) => o.value === fZone)?.label;
  const cityLabel = cityOpts.find((o) => o.value === fCity)?.label;
  const storeLabel = storeOpts.find((o) => o.value === fStore)?.label;
  const labLabel = labOpts.find((o) => o.value === fLab)?.label;
  const statusLabel = STATUS_OPTIONS.find((o) => o.value === fStatus)?.label;
  const approveLabel = APPROVE_OPTIONS.find((o) => o.value === fApprove)?.label;

  return (
    <div className="space-y-6 animate-fade-in">

      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-6 py-7 sm:px-9">
        <div className="pointer-events-none absolute -right-10 -top-14 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-primary-300/30 blur-3xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-white/60 text-sm font-medium">Admin Portal</p>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mt-0.5">
              Welcome back, {firstName}
            </h1>
            <p className="text-white/60 text-sm mt-1">
              {candidates?.length ?? 0} candidates across the platform
            </p>
          </div>
          {/* stat pills */}
          <div className="flex gap-2 flex-wrap">
            <StatPill label="Total" value={candidates?.length ?? 0} color="bg-white/15 text-white" />
            <StatPill label="Booked" value={totalBooked} color="bg-emerald-400/20 text-emerald-100" />
            <StatPill label="Pending" value={totalPending} color="bg-amber-400/20 text-amber-100" />
            <StatPill label="Approved" value={totalApproved} color="bg-sky-400/20 text-sky-100" />
          </div>
        </div>
      </div>

      {/* ── Booking status breakdown (click to filter) ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {STATUS_OPTIONS.filter((o) => o.value !== ALL).map((o) => {
          const active = fStatus === o.value;
          return (
            <button
              key={o.value}
              onClick={() => setFStatus(active ? ALL : o.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition-colors ${
                active
                  ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-200'
                  : 'border-border bg-surface hover:bg-slate-50'
              }`}
            >
              <p className="text-2xl font-bold text-slate-900 leading-none">{statusCounts[o.value] ?? 0}</p>
              <p className={`text-xs font-medium mt-1.5 ${active ? 'text-primary-700' : 'text-slate-500'}`}>{o.label}</p>
            </button>
          );
        })}
      </div>

      {/* ── Filters ── */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {/* filter header */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="w-full flex items-center justify-between gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
              </svg>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-slate-800">Filters</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeFilterCount > 0 ? `${activeFilterCount} active · ${filtered.length} of ${candidates?.length ?? 0} shown` : 'All candidates shown'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-[11px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
            <svg className={`w-4 h-4 text-slate-400 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </button>

        {/* active filter chips */}
        {hasFilter && (
          <div className="flex flex-wrap gap-1.5 px-6 pb-3 pt-0">
            {fClient && <FilterChip label={`Client: ${clientLabel}`} onRemove={() => setFClient(ALL)} />}
            {fZone && <FilterChip label={`Zone: ${zoneLabel}`} onRemove={() => { setFZone(ALL); setFCity(ALL); setFStore(ALL); }} />}
            {fCity && <FilterChip label={`City: ${cityLabel}`} onRemove={() => { setFCity(ALL); setFStore(ALL); }} />}
            {fStore && <FilterChip label={`Store: ${storeLabel}`} onRemove={() => setFStore(ALL)} />}
            {fLab && <FilterChip label={`Lab: ${labLabel}`} onRemove={() => setFLab(ALL)} />}
            {fStatus && <FilterChip label={`Status: ${statusLabel}`} onRemove={() => setFStatus(ALL)} />}
            {fApprove && <FilterChip label={`Approval: ${approveLabel}`} onRemove={() => setFApprove(ALL)} />}
            {fDateRange?.from && (
              <FilterChip
                label={`Date: ${fDateRange.from.toLocaleDateString('en-IN')}${fDateRange.to ? ` – ${fDateRange.to.toLocaleDateString('en-IN')}` : ''}`}
                onRemove={() => setFDateRange(undefined)}
              />
            )}
            <button onClick={resetFilters} className="text-xs font-medium text-slate-400 hover:text-red-500 transition-colors px-1">
              Clear all
            </button>
          </div>
        )}

        {/* filter panel */}
        {filtersOpen && (
          <div className="px-6 pb-5 pt-1 border-t border-border bg-slate-50/40 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <Combobox options={clientOpts} value={fClient} onChange={setFClient} placeholder="All clients" label="Client" />
              <Combobox options={zoneOpts} value={fZone} onChange={(v) => { setFZone(v); setFCity(ALL); setFStore(ALL); }} placeholder="All zones" label="Zone" />
              <Combobox options={cityOpts} value={fCity} onChange={(v) => { setFCity(v); setFStore(ALL); }} placeholder="All cities" label="City" disabled={!fZone && cityOpts.length <= 1} />
              <Combobox options={storeOpts} value={fStore} onChange={setFStore} placeholder="All stores" label="Store" />
              <Combobox options={labOpts} value={fLab} onChange={setFLab} placeholder="All labs" label="Lab" />
              <Combobox options={STATUS_OPTIONS} value={fStatus} onChange={setFStatus} placeholder="All statuses" label="Booking status" />
              <Combobox options={APPROVE_OPTIONS} value={fApprove} onChange={setFApprove} placeholder="All" label="Approve status" />
              <div className="lg:col-span-2">
                <DateRangePicker label="Appointment date range" value={fDateRange} onChange={setFDateRange} placeholder="All dates" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Candidate table ── */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        {/* table header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border">
          <div>
            <p className="font-semibold text-slate-900">Candidates</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {hasFilter
                ? <span><span className="font-medium text-primary-600">{filtered.length}</span> of {candidates?.length} match filters</span>
                : <span><span className="font-medium text-slate-600">{candidates?.length ?? 0}</span> total</span>
              }
            </p>
          </div>
        </div>

        {isLoading && <SkeletonTable rows={8} />}

        {error && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-500">Failed to load candidates</p>
          </div>
        )}

        {!isLoading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center py-14 gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
            </div>
            <p className="text-sm font-medium text-slate-500">
              {hasFilter ? 'No candidates match the selected filters' : 'No candidates yet'}
            </p>
            {hasFilter && <button onClick={resetFilters} className="text-xs text-primary-600 hover:text-primary-700 font-medium">Clear filters</button>}
          </div>
        )}

        {!isLoading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-360px)] overflow-y-auto">
              <table className="w-max min-w-full text-sm">
                <thead className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border">
                  <tr>
                    <th className={th}>Candidate</th>
                    <th className={th}>Emp. Code</th>
                    <th className={th}>Mobile</th>
                    <th className={th}>Gender</th>
                    <th className={th}>Type</th>
                    <th className={th}>Store</th>
                    <th className={th}>Client</th>
                    <th className={th}>DOJ</th>
                    <th className={th}>Appointment</th>
                    <th className={th}>Visit Time</th>
                    <th className={th}>Requested</th>
                    <th className={th}>Scheduled</th>
                    <th className={th}>Lab Booked</th>
                    <th className={th}>Booking Status</th>
                    <th className={th}>Report</th>
                    <th className={th}>Approved</th>
                    <th className={th}>Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {pageItems.map((c) => {
                    const booking = bookingMap.get(c.id);
                    const isBooked = !!booking;
                    return (
                      <tr key={c.id} className={`transition-colors group ${isBooked ? 'hover:bg-emerald-50/30' : 'hover:bg-primary-50/20'}`}>

                        {/* Candidate */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar name={c.name} size="sm" />
                            <div className="min-w-0 max-w-[200px]">
                              <p className="font-semibold text-slate-900 truncate leading-tight">{c.name}</p>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">{c.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Emp code */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">{c.employeeCode}</span>
                        </td>

                        {/* Mobile */}
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap text-xs">{c.mobile}</td>

                        {/* Gender */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant="default" size="sm">{c.gender.toLowerCase()}</Badge>
                        </td>

                        {/* Type */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant="primary" size="sm">{c.candidateType.replace('_', ' ').toLowerCase()}</Badge>
                        </td>

                        {/* Store */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {c.store ? (
                            <div>
                              <p className="text-xs font-medium text-slate-800">{c.store.name}</p>
                              <p className="text-[11px] text-slate-400 font-mono">{c.store.storeCode}</p>
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Client */}
                        <td className="px-4 py-3.5 text-xs font-medium text-slate-700 whitespace-nowrap">
                          {c.client?.name ?? c.client?.email ?? '—'}
                        </td>

                        {/* DOJ */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(c.doj).toLocaleDateString('en-IN')}
                        </td>

                        {/* Appointment + Book / Reschedule */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {c.appointmentDate && (
                            <p className="text-[11px] font-semibold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full inline-block mb-1.5">
                              {new Date(c.appointmentDate).toLocaleDateString('en-IN')}
                            </p>
                          )}
                          {isRescheduled(booking) ? (
                            <Button size="sm" variant="outline" onClick={() => setRescheduleTarget({ booking: booking!, candidateName: c.name })}>
                              Reschedule
                            </Button>
                          ) : !booking || booking.status === 'APPOINTMENT_REQUESTED' || booking.status === 'CANCELLED' ? (
                            <Button size="sm" onClick={() => navigate('/admin/book-lab', {
                              state: { candidateId: c.id, clientId: c.clientId, storeId: c.storeId },
                            })}>Book</Button>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>

                        {/* Visit time */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {booking?.visitTime ? (
                            <div>
                              <p className="text-xs font-medium text-slate-700">
                                {new Date(booking.visitTime).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {new Date(booking.visitTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>

                        {/* Requested date */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {booking?.reqDate
                            ? new Date(booking.reqDate).toLocaleDateString('en-IN')
                            : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Scheduled date */}
                        <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                          {booking?.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString('en-IN')
                            : <span className="text-slate-300">—</span>}
                        </td>

                        {/* Lab booked */}
                        <td className="px-4 py-3.5">
                          {booking?.lab ? (
                            <div>
                              <p className="text-xs font-semibold text-slate-800 whitespace-nowrap">{booking.lab.name}</p>
                              {booking.lab.contactMobile && (
                                <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">{booking.lab.contactMobile}</p>
                              )}
                              {booking.lab.address && (
                                <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] leading-snug" title={`${booking.lab.address}${booking.lab.pincode ? ` – ${booking.lab.pincode}` : ''}`}>
                                  {booking.lab.address}{booking.lab.pincode ? ` – ${booking.lab.pincode}` : ''}
                                </p>
                              )}
                            </div>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>

                        {/* Booking status */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <Badge variant={booking ? bookingStatusVariant(booking) : 'warning'} size="sm">
                            {!booking ? 'Appointment requested' : bookingStatusLabel(booking)}
                          </Badge>
                        </td>

                        {/* Report */}
                        <td className="px-4 py-3.5">
                          {booking?.status === 'REPORT_UPLOADED' || booking?.status === 'FIT' || booking?.status === 'UNFIT' ? (
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                                Uploaded
                              </span>
                              {(() => {
                                const report = booking && reportMap.get(booking.id);
                                return report ? (
                                  <Button size="sm" variant="ghost" onClick={() => setEditReportTarget({ report, candidateName: c.name })}>
                                    Edit
                                  </Button>
                                ) : null;
                              })()}
                            </div>
                          ) : booking ? (
                            <Button size="sm" variant="outline" onClick={() => setUploadTarget({ bookingId: booking.id, candidateName: c.name, tests: booking.panel?.bundledTest?.testsIncluded ?? [] })}>
                              Upload
                            </Button>
                          ) : <span className="text-slate-300 text-xs">—</span>}
                        </td>

                        {/* Approved toggle */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={c.isApproved}
                              onChange={(val) => setApproval.mutate({ id: c.id, isApproved: val })}
                              loading={setApproval.isPending && setApproval.variables?.id === c.id}
                              label="Approve candidate"
                            />
                            <span className={`text-[11px] font-medium ${c.isApproved ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {c.isApproved ? 'Yes' : 'No'}
                            </span>
                          </div>
                        </td>

                        {/* Active */}
                        <td className="px-4 py-3.5">
                          <Badge variant={c.isActive ? 'success' : 'default'} size="sm">
                            {c.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex justify-end px-4 py-3 border-t border-border">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </div>
        )}
      </div>

      {uploadTarget && (
        <UploadReportModal
          open={!!uploadTarget}
          onClose={() => setUploadTarget(null)}
          bookingId={uploadTarget.bookingId}
          candidateName={uploadTarget.candidateName}
          tests={uploadTarget.tests}
        />
      )}

      {rescheduleTarget && (
        <RescheduleModal
          open={!!rescheduleTarget}
          onClose={() => setRescheduleTarget(null)}
          booking={rescheduleTarget.booking}
          candidateName={rescheduleTarget.candidateName}
        />
      )}

      {editReportTarget && (
        <EditReportModal
          open={!!editReportTarget}
          onClose={() => setEditReportTarget(null)}
          report={editReportTarget.report}
          candidateName={editReportTarget.candidateName}
        />
      )}
    </div>
  );
}
