import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { StatsCard } from '../../components/ui/StatsCard';
import { Card, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { FunnelChart, type FunnelDatum } from '../../components/charts/FunnelChart';

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

const recentActivity = [
  { id: 1, user: 'Dr. Sarah Chen', action: 'Completed patient consultation', time: '2 min ago', type: 'success' as const },
  { id: 2, user: 'Admin', action: 'Updated system settings', time: '15 min ago', type: 'info' as const },
  { id: 3, user: 'Dr. James Lee', action: 'Submitted lab report', time: '1 hour ago', type: 'default' as const },
  { id: 4, user: 'Reception', action: 'Registered new patient', time: '2 hours ago', type: 'primary' as const },
  { id: 5, user: 'Dr. Maria Garcia', action: 'Prescribed medication', time: '3 hours ago', type: 'warning' as const },
];

const quickActions = [
  { label: 'New Patient', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 019.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
    </svg>
  )},
  { label: 'Appointment', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
    </svg>
  )},
  { label: 'Lab Report', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )},
  { label: 'Prescription', icon: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
    </svg>
  )},
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const firstName = user?.email?.split('@')[0] ?? 'User';

  // Clients (USER role) get the employee health-checkup overview + funnel.
  if (user?.role === 'USER') {
    return <ClientDashboard firstName={firstName} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your clinic today.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
        <StatsCard
          title="Total Patients"
          value="2,847"
          change={{ value: '12.5%', positive: true }}
          iconBg="bg-primary-50"
          iconColor="text-primary-600"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Appointments Today"
          value="48"
          change={{ value: '8.2%', positive: true }}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
        />
        <StatsCard
          title="Revenue"
          value="$34,500"
          change={{ value: '3.1%', positive: false }}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatsCard
          title="Active Staff"
          value="24"
          change={{ value: '2 new', positive: true }}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          }
        />
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 lg:gap-6">
        {/* Activity feed */}
        <Card padding="none" className="xl:col-span-2">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Recent Activity</CardTitle>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              View all
            </button>
          </CardHeader>
          <div className="divide-y divide-border">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center gap-3.5 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                <Avatar name={item.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900">
                    <span className="font-medium">{item.user}</span>{' '}
                    <span className="text-slate-500">{item.action}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
                </div>
                <Badge variant={item.type} size="sm">
                  {item.type === 'success' ? 'Done' : item.type === 'info' ? 'Update' : item.type === 'primary' ? 'New' : item.type === 'warning' ? 'Review' : 'Log'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick actions */}
        <Card padding="none">
          <CardHeader className="px-5 pt-5">
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <div className="p-3 space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.label}
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

          {/* Chart placeholder */}
          <div className="mx-5 mb-5 mt-2">
            <div className="rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 border border-border p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-slate-200/60 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <p className="text-xs font-medium text-slate-500">Analytics Chart</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Connect data to view</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
