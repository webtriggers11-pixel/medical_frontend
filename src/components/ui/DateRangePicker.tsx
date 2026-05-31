import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker, type DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';

export type { DateRange };

interface DateRangePickerProps {
  label?: string;
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  placeholder?: string;
}

export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = 'All dates',
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const reposition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const pop = popoverRef.current;
    const ph = pop?.offsetHeight ?? 340;
    const pw = pop?.offsetWidth ?? 640;
    const gap = 8;

    let top = r.bottom + gap;
    if (top + ph > window.innerHeight - gap && r.top - ph - gap > gap) top = r.top - ph - gap;
    let left = r.left;
    if (left + pw > window.innerWidth - gap) left = window.innerWidth - pw - gap;
    if (left < gap) left = gap;
    setCoords({ top, left });
  };

  useLayoutEffect(() => { if (open) reposition(); }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => reposition();
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const displayValue = value?.from
    ? value.to
      ? `${format(value.from, 'd MMM yyyy')} – ${format(value.to, 'd MMM yyyy')}`
      : `From ${format(value.from, 'd MMM yyyy')}`
    : null;

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">{label}</label>
      )}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`
          flex w-full items-center gap-2 h-10 rounded-xl border bg-surface px-3.5 text-sm text-left
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
          ${open ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-border hover:border-slate-300'}
        `}
      >
        <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
        <span className={`flex-1 truncate ${displayValue ? 'text-slate-900' : 'text-slate-400'}`}>
          {displayValue ?? placeholder}
        </span>
        {displayValue && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
            className="text-slate-400 hover:text-slate-600 shrink-0"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
        )}
      </button>

      {open && createPortal(
        <div
          ref={popoverRef}
          style={{ position: 'fixed', top: coords?.top ?? -9999, left: coords?.left ?? -9999, zIndex: 9999, visibility: coords ? 'visible' : 'hidden' }}
          className="rounded-2xl border border-border bg-surface shadow-xl p-3 animate-scale-in"
        >
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            captionLayout="dropdown"
            startMonth={new Date(2024, 0)}
            endMonth={new Date(new Date().getFullYear() + 2, 11)}
          />
        </div>,
        document.body,
      )}
    </div>
  );
}
