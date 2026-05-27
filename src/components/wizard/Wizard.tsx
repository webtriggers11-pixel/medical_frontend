import { type ReactNode } from 'react';

/* Shared chrome for full-page step wizards (Add Store, Add Candidate, …).
   Keeps every wizard visually identical: gradient hero, sticky live-summary
   sidebar, vertical/mobile steppers, gradient step headings. */

export interface WizardStep {
  title: string;
  desc: string;
  icon: ReactNode;
}

/* ── shared icons ────────────────────────────────────────────────────── */

export const ArrowLeftIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
  </svg>
);
export const ArrowRightIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);
export const CheckIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);
export const LockIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a2.25 2.25 0 012.25 2.25v6.75a2.25 2.25 0 01-2.25 2.25H6.75a2.25 2.25 0 01-2.25-2.25v-6.75a2.25 2.25 0 012.25-2.25z" />
  </svg>
);

/* ── hero ────────────────────────────────────────────────────────────── */

export function WizardHero({
  eyebrow,
  title,
  subtitle,
  watermark,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  watermark: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-primary-700 px-6 py-7 text-white shadow-lg sm:px-9 sm:py-8">
      <div className="pointer-events-none absolute -right-12 -top-20 h-52 w-52 rounded-full bg-white/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-28 h-48 w-48 rounded-full bg-primary-300/40 blur-3xl" />
      <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 text-white/15 sm:block [&_svg]:h-44 [&_svg]:w-44">
        {watermark}
      </div>
      <div className="relative">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-white" />
          {eyebrow}
        </span>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-md text-sm text-white/80">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── steppers ────────────────────────────────────────────────────────── */

function StepNode({ step, done, active }: { step: WizardStep; done: boolean; active: boolean }) {
  return (
    <div
      className={`
        relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border transition-all duration-300
        ${done ? 'border-primary-600 bg-primary-600 text-white shadow-sm' : ''}
        ${active ? 'border-primary-500 bg-primary-50 text-primary-600 ring-4 ring-primary-500/10' : ''}
        ${!done && !active ? 'border-border bg-surface text-slate-400' : ''}
      `}
    >
      <span className={`absolute transition-all duration-300 ${done ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>{CheckIcon}</span>
      <span className={`transition-all duration-300 ${done ? 'scale-50 opacity-0 absolute' : 'scale-100 opacity-100'}`}>{step.icon}</span>
    </div>
  );
}

/* Compact horizontal stepper — shown on mobile above the step card. */
export function StepperMobile({ steps, current }: { steps: WizardStep[]; current: number }) {
  return (
    <div className="flex items-center lg:hidden">
      {steps.map((s, i) => (
        <div key={s.title} className="flex flex-1 items-center last:flex-none">
          <StepNode step={s} done={i < current} active={i === current} />
          {i < steps.length - 1 && (
            <div className="mx-2.5 h-0.5 flex-1 overflow-hidden rounded-full bg-border">
              <div className="h-full rounded-full bg-primary-500 transition-all duration-500 ease-out" style={{ width: i < current ? '100%' : '0%' }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* Vertical stepper that doubles as a live build summary (desktop sidebar).
   `values[i]` (when set) replaces the step description with the chosen value. */
export function StepperVertical({
  steps,
  current,
  values = [],
}: {
  steps: WizardStep[];
  current: number;
  values?: (string | undefined)[];
}) {
  return (
    <ol className="relative">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const value = values[i];
        return (
          <li key={s.title} className="relative flex gap-3.5 pb-7 last:pb-0">
            {i < steps.length - 1 && (
              <span
                className={`absolute left-[19px] top-11 h-[calc(100%-2.5rem)] w-px transition-colors duration-500 ${done ? 'bg-primary-400' : 'bg-border'}`}
              />
            )}
            <StepNode step={s} done={done} active={active} />
            <div className="min-w-0 pt-1">
              <p className={`text-sm font-semibold transition-colors ${active || done ? 'text-slate-900' : 'text-slate-400'}`}>{s.title}</p>
              <p className={`truncate text-xs transition-colors ${value ? 'font-medium text-primary-600' : 'text-slate-400'}`}>
                {value || s.desc}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ── step heading ────────────────────────────────────────────────────── */

export function StepHeading({ icon, title, subtitle }: { icon: ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-start gap-3.5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-sm">
        {icon}
      </div>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

/* ── locked summary field ────────────────────────────────────────────── */

export function LockedField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">{label}</label>
      <div className="flex h-10 w-full items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 text-sm">
        <span className="text-primary-500">{LockIcon}</span>
        <span className="flex-1 truncate font-medium text-slate-700">{value}</span>
      </div>
    </div>
  );
}
