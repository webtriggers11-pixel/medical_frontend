import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/style.css';

interface DatePickerProps {
  label?: string;
  value?: Date;
  onChange: (date: Date | undefined) => void;
  error?: string;
  required?: boolean;
  placeholder?: string;
  /** Disable dates after today (useful for past-only fields). */
  disableFuture?: boolean;
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  required,
  placeholder = 'Select date',
  disableFuture,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  // Position the portal popover relative to the trigger, flipping above when
  // there isn't room below and clamping inside the viewport.
  const reposition = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const r = trigger.getBoundingClientRect();
    const pop = popoverRef.current;
    const ph = pop?.offsetHeight ?? 340;
    const pw = pop?.offsetWidth ?? r.width;
    const gap = 8;

    let top = r.bottom + gap;
    if (top + ph > window.innerHeight - gap && r.top - ph - gap > gap) {
      top = r.top - ph - gap; // flip above
    }
    let left = r.left;
    if (left + pw > window.innerWidth - gap) left = window.innerWidth - pw - gap;
    if (left < gap) left = gap;

    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (open) reposition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScrollOrResize = () => reposition();
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || popoverRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`
            w-full h-10 rounded-xl border bg-surface text-sm text-left
            transition-all duration-200 flex items-center
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            ${error ? 'border-danger ring-2 ring-danger/10' : 'border-border hover:border-slate-300'}
            pl-3.5 pr-10
            ${value ? 'text-slate-900' : 'text-slate-400'}
          `}
        >
          {value ? format(value, 'd MMM, yyyy') : placeholder}
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          </span>
        </button>
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{
              position: 'fixed',
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
              zIndex: 1000,
              visibility: coords ? 'visible' : 'hidden',
            }}
            className="rounded-2xl border border-border bg-surface shadow-xl p-3 animate-scale-in"
          >
            <DayPicker
              mode="single"
              selected={value}
              defaultMonth={value}
              captionLayout="dropdown"
              startMonth={new Date(1980, 0)}
              endMonth={new Date(new Date().getFullYear() + 5, 11)}
              disabled={disableFuture ? { after: new Date() } : undefined}
              onSelect={(date) => {
                onChange(date);
                setOpen(false);
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  );
}
