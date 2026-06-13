import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { StatTile, MoneyCard } from '../../components/ui/StatTile';
import { FunnelChart, type FunnelDatum } from '../../components/charts/FunnelChart';
import { useAdminStats } from '../../features/stats/hooks/useStats';
import type { BookingStatus } from '../../types/booking.types';

const PIPELINE_COLORS = ['#4F46E5', '#6366F1', '#8B5CF6', '#A855F7', '#D6459F', '#EC6A88'];

const inr = (n: number) =>
  n.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

/* ── icons ────────────────────────────────────────────────────────────── */

const UsersIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
);
const StoreIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72" />
  </svg>
);
const BeakerIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
  </svg>
);
const ClipboardIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
  </svg>
);
const CalendarIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);
const DocIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);
const TagIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
  </svg>
);
const RupeeIcon = (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6l-3-3h1.5a3 3 0 100-6M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ── bookings-by-status segmented bar ─────────────────────────────────── */

const STATUS_META: Record<BookingStatus, { label: string; bar: string; dot: string }> = {
  APPOINTMENT_REQUESTED: { label: 'Requested',       bar: 'bg-amber-400',   dot: 'bg-amber-400' },
  SCHEDULED:             { label: 'Scheduled',       bar: 'bg-primary-500', dot: 'bg-primary-500' },
  VISITED:               { label: 'Visited',         bar: 'bg-sky-500',     dot: 'bg-sky-500' },
  REPORT_UPLOADED:       { label: 'Report Uploaded', bar: 'bg-violet-500',  dot: 'bg-violet-500' },
  FIT:                   { label: 'Fit',             bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
  UNFIT:                 { label: 'Unfit',           bar: 'bg-rose-500',    dot: 'bg-rose-500' },
  CANCELLED:             { label: 'Cancelled',       bar: 'bg-slate-300',   dot: 'bg-slate-300' },
};

const STATUS_ORDER: BookingStatus[] = [
  'APPOINTMENT_REQUESTED', 'SCHEDULED', 'VISITED', 'REPORT_UPLOADED', 'FIT', 'UNFIT', 'CANCELLED',
];

function StatusBreakdown({ byStatus, total }: { byStatus: Record<BookingStatus, number>; total: number }) {
  return (
    <div>
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-slate-100">
        {total === 0
          ? <div className="h-full w-full bg-slate-100" />
          : STATUS_ORDER.map((s) => {
              const v = byStatus[s];
              if (!v) return null;
              return (
                <div
                  key={s}
                  className={`${STATUS_META[s].bar} h-full transition-all duration-700 ease-out`}
                  style={{ width: `${(v / total) * 100}%` }}
                  title={`${STATUS_META[s].label}: ${v}`}
                />
              );
            })}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3.5 sm:grid-cols-3 lg:grid-cols-4">
        {STATUS_ORDER.map((s) => {
          const v = byStatus[s];
          const pct = total > 0 ? Math.round((v / total) * 100) : 0;
          return (
            <div key={s} className="flex items-center gap-2.5">
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATUS_META[s].dot}`} />
              <span className="flex-1 truncate text-xs text-slate-500">{STATUS_META[s].label}</span>
              <span className="text-xs font-bold text-slate-700">{v}</span>
              <span className="w-8 text-right text-[11px] text-slate-400">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── page ─────────────────────────────────────────────────────────────── */

export function StatsPage() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) return <SkeletonTable rows={6} />;
  if (error || !stats) {
    return (
      <Card>
        <p className="text-sm text-red-600 font-medium">Failed to load stats. Please try again.</p>
      </Card>
    );
  }

  const { byStatus } = stats.bookings;
  const pipeline: FunnelDatum[] = [
    { name: 'Active Candidates', value: stats.candidates.active },
    { name: 'Appointment Requested', value: stats.candidates.withAppointment },
    { name: 'Scheduled', value: byStatus.SCHEDULED + byStatus.VISITED + byStatus.REPORT_UPLOADED + byStatus.FIT + byStatus.UNFIT },
    { name: 'Visited', value: byStatus.VISITED + byStatus.REPORT_UPLOADED + byStatus.FIT + byStatus.UNFIT },
    { name: 'Report Uploaded', value: byStatus.REPORT_UPLOADED + byStatus.FIT + byStatus.UNFIT },
    { name: 'Fit Certified', value: byStatus.FIT },
  ];

  const marginPct =
    stats.revenue.charged > 0
      ? Math.round((stats.revenue.margin / stats.revenue.charged) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Stats</h1>
          <p className="text-slate-500 mt-1">A live overview of everything on the platform.</p>
        </div>
        <Badge variant="success" dot size="sm">Live</Badge>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 lg:gap-5">
        <StatTile accent="primary" title="Clients" value={stats.clients.total} icon={UsersIcon}
          ratio={{ value: stats.clients.active, total: stats.clients.total, label: 'active' }} />
        <StatTile accent="violet" title="Candidates" value={stats.candidates.total} icon={UsersIcon}
          ratio={{ value: stats.candidates.approved, total: stats.candidates.total, label: 'approved' }} />
        <StatTile accent="sky" title="Stores" value={stats.stores.total} icon={StoreIcon}
          caption="Across all clients" />
        <StatTile accent="emerald" title="Labs" value={stats.labs.total} icon={BeakerIcon}
          ratio={{ value: stats.labs.active, total: stats.labs.total, label: 'active' }} />
        <StatTile accent="amber" title="Panels" value={stats.panels.total} icon={TagIcon}
          ratio={{ value: stats.panels.active, total: stats.panels.total, label: 'active' }} />
        <StatTile accent="rose" title="Tests" value={stats.tests.total} icon={ClipboardIcon}
          ratio={{ value: stats.tests.active, total: stats.tests.total, label: 'active' }} />
        <StatTile accent="blue" title="Bookings" value={stats.bookings.total} icon={CalendarIcon}
          caption={`${byStatus.SCHEDULED} currently scheduled`} />
        <StatTile accent="teal" title="Reports" value={stats.reports.total} icon={DocIcon}
          ratio={{ value: stats.reports.approved, total: stats.reports.total, label: 'approved' }} />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:gap-5">
        <MoneyCard accent="emerald" title="Billed to Clients" value={inr(stats.revenue.charged)} icon={RupeeIcon} />
        <MoneyCard accent="amber" title="Vendor Cost" value={inr(stats.revenue.vendorCost)} icon={RupeeIcon} />
        <MoneyCard
          accent="primary"
          title="Margin"
          value={inr(stats.revenue.margin)}
          icon={RupeeIcon}
          delta={{ text: `${marginPct}% ${stats.revenue.margin >= 0 ? 'profit' : 'loss'}`, positive: stats.revenue.margin >= 0 }}
        />
      </div>

      {/* Pipeline — full width */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5">
          <div>
            <CardTitle>Health checkup pipeline</CardTitle>
            <p className="text-sm text-slate-500 mt-0.5">From active candidates to fit certification</p>
          </div>
        </CardHeader>
        <div className="px-3 pb-4">
          <FunnelChart data={pipeline} colors={PIPELINE_COLORS} height={420} />
        </div>
      </Card>

      {/* Bookings by status */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5">
          <div className="flex items-baseline gap-2">
            <CardTitle>Bookings by status</CardTitle>
            <span className="text-sm text-slate-400">· {stats.bookings.total} total</span>
          </div>
        </CardHeader>
        <div className="px-5 pb-6 pt-2">
          <StatusBreakdown byStatus={byStatus} total={stats.bookings.total} />
        </div>
      </Card>
    </div>
  );
}
