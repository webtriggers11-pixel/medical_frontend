import type { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
}

export function StatsCard({ title, value, change, icon, iconBg, iconColor }: StatsCardProps) {
  return (
    <div className="group bg-surface rounded-2xl border border-border shadow-card p-5 transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
          {change && (
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-semibold ${
                  change.positive ? 'text-emerald-600' : 'text-red-500'
                }`}
              >
                <svg
                  className={`w-3.5 h-3.5 ${change.positive ? '' : 'rotate-180'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                {change.value}
              </span>
              <span className="text-xs text-slate-400">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${iconBg} transition-transform duration-200 group-hover:scale-110`}>
          <div className={iconColor}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
