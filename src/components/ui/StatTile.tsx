import type { ReactNode } from 'react';

/* Shared stat cards used by the admin Stats page and the client dashboard.
   Styled to the app theme: white surface, pastel icon tint, soft card shadow. */

export type Accent =
  | 'primary' | 'violet' | 'sky' | 'emerald'
  | 'amber' | 'rose' | 'blue' | 'teal' | 'indigo';

const ACCENT: Record<Accent, { iconBg: string; iconText: string; fill: string; text: string }> = {
  primary: { iconBg: 'bg-primary-50', iconText: 'text-primary-600', fill: 'bg-primary-500', text: 'text-primary-600' },
  violet:  { iconBg: 'bg-violet-50',  iconText: 'text-violet-600',  fill: 'bg-violet-500',  text: 'text-violet-600' },
  sky:     { iconBg: 'bg-sky-50',     iconText: 'text-sky-600',     fill: 'bg-sky-500',     text: 'text-sky-600' },
  emerald: { iconBg: 'bg-emerald-50', iconText: 'text-emerald-600', fill: 'bg-emerald-500', text: 'text-emerald-600' },
  amber:   { iconBg: 'bg-amber-50',   iconText: 'text-amber-600',   fill: 'bg-amber-500',   text: 'text-amber-600' },
  rose:    { iconBg: 'bg-rose-50',    iconText: 'text-rose-600',    fill: 'bg-rose-500',    text: 'text-rose-600' },
  blue:    { iconBg: 'bg-blue-50',    iconText: 'text-blue-600',    fill: 'bg-blue-500',    text: 'text-blue-600' },
  teal:    { iconBg: 'bg-teal-50',    iconText: 'text-teal-600',    fill: 'bg-teal-500',    text: 'text-teal-600' },
  indigo:  { iconBg: 'bg-indigo-50',  iconText: 'text-indigo-600',  fill: 'bg-indigo-500',  text: 'text-indigo-600' },
};

export function StatTile({
  accent, title, value, icon, ratio, caption,
}: {
  accent: Accent;
  title: string;
  value: ReactNode;
  icon: ReactNode;
  /** Renders a progress bar of value/total under the number. */
  ratio?: { value: number; total: number; label: string };
  /** Plain caption shown when there is no ratio. */
  caption?: string;
}) {
  const a = ACCENT[accent];
  const pct = ratio && ratio.total > 0 ? Math.round((ratio.value / ratio.total) * 100) : 0;

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText} transition-transform duration-200 group-hover:scale-105`}>
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>

      <div className="mt-auto pt-4">
        {ratio ? (
          <>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-slate-500">{ratio.value.toLocaleString('en-IN')} {ratio.label}</span>
              <span className={`font-semibold ${a.text}`}>{pct}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${a.fill} transition-[width] duration-700 ease-out`} style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <span className="text-xs font-medium text-slate-400">{caption}</span>
        )}
      </div>
    </div>
  );
}

export function MoneyCard({
  accent, title, value, icon, delta,
}: {
  accent: Accent;
  title: string;
  value: string;
  icon: ReactNode;
  delta?: { text: string; positive: boolean };
}) {
  const a = ACCENT[accent];
  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${a.iconBg} ${a.iconText} transition-transform duration-200 group-hover:scale-105`}>
          {icon}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      <p className={`mt-2 text-xs font-semibold ${delta ? (delta.positive ? 'text-success' : 'text-danger') : 'text-transparent'}`}>
        {delta?.text ?? '—'}
      </p>
    </div>
  );
}
