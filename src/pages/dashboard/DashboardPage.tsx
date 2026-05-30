import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { FunnelChart, type FunnelDatum } from '../../components/charts/FunnelChart';
import { SkeletonTable } from '../../components/ui/Skeleton';
import { useCandidates } from '../../features/candidates/hooks/useCandidates';

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

function AdminDashboard({ firstName }: { firstName: string }) {
  const { data: candidates, isLoading, error } = useCandidates();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-slate-500 mt-1">
          All candidates across the platform
          {candidates && (
            <span className="text-slate-400"> · {candidates.length} total</span>
          )}
        </p>
      </div>

      {/* Candidate list */}
      <Card padding="none">
        <CardHeader className="px-5 pt-5">
          <CardTitle>Candidates</CardTitle>
        </CardHeader>

        {isLoading && <SkeletonTable rows={8} />}

        {error && (
          <p className="px-5 py-10 text-center text-sm text-red-500">
            Failed to load candidates.
          </p>
        )}

        {!isLoading && !error && candidates?.length === 0 && (
          <p className="px-5 py-10 text-center text-sm text-slate-400">
            No candidates yet.
          </p>
        )}

        {!isLoading && !error && candidates && candidates.length > 0 && (
          <div className="overflow-x-auto">
            <div className="max-h-[calc(100vh-220px)] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Candidate</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Employee Code</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Mobile</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Gender</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Type</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Store</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Client</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">DOJ</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Appointment</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} size="sm" />
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900 truncate">{c.name}</p>
                            <p className="text-xs text-slate-400 truncate">{c.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 font-mono text-xs whitespace-nowrap">{c.employeeCode}</td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">{c.mobile}</td>
                      <td className="px-5 py-3.5">
                        <Badge variant="default" size="sm">{c.gender.toLowerCase()}</Badge>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant="primary" size="sm">
                          {c.candidateType.replace('_', ' ').toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {c.store ? (
                          <span>
                            {c.store.name}{' '}
                            <span className="text-xs text-slate-400">({c.store.storeCode})</span>
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 whitespace-nowrap">
                        {c.client?.name ?? c.client?.email ?? '—'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap text-xs">
                        {new Date(c.doj).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap text-xs">
                        {c.appointmentDate ? (
                          <span className="text-primary-600 font-medium">
                            {new Date(c.appointmentDate).toLocaleDateString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge variant={c.isActive ? 'success' : 'default'} size="sm">
                          {c.isActive ? 'active' : 'inactive'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
