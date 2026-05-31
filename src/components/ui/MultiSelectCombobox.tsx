import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

export interface MultiSelectOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface MultiSelectComboboxProps {
  label?: string;
  options: MultiSelectOption[];
  value: string[];                        // selected ids
  onChange: (value: string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
  className?: string;
}

const ChevronIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const SearchIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
  </svg>
);

const SpinnerIcon = (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export function MultiSelectCombobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  searchPlaceholder = 'Search…',
  error,
  hint,
  required,
  disabled,
  loading,
  emptyText = 'No matches',
  className = '',
}: MultiSelectComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = useId();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const updatePosition = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Reposition on scroll / resize
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Focus search when opened
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
    } else {
      updatePosition();
      setQuery('');
      setOpen(true);
    }
  };

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  // Trigger label: show selected names (up to 2) or count
  const selectedOptions = options.filter((o) => value.includes(o.value));
  const triggerLabel = (() => {
    if (selectedOptions.length === 0) return null;
    if (selectedOptions.length <= 2) return selectedOptions.map((o) => o.label).join(', ');
    return `${selectedOptions.length} tests selected`;
  })();

  return (
    <div className="space-y-1.5" ref={rootRef}>
      {label && (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-danger ml-0.5">*</span>}
        </label>
      )}

      <button
        ref={triggerRef}
        id={fieldId}
        type="button"
        disabled={disabled}
        onClick={() => !disabled && toggleOpen()}
        className={`
          group flex w-full items-center gap-2.5 h-10 rounded-xl border bg-surface px-3.5 text-left text-sm
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
          disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50
          ${open ? 'border-primary-500 ring-2 ring-primary-500/20' : ''}
          ${error ? 'border-danger ring-2 ring-danger/10' : 'border-border hover:border-slate-300'}
          ${className}
        `}
      >
        <span className={`flex-1 truncate ${triggerLabel ? 'text-slate-900' : 'text-slate-400'}`}>
          {triggerLabel ?? placeholder}
        </span>
        {selectedOptions.length > 0 && (
          <span className="shrink-0 flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary-100 text-primary-700 text-xs font-semibold">
            {selectedOptions.length}
          </span>
        )}
        <span className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          {ChevronIcon}
        </span>
      </button>

      {/* Selected chips below trigger */}
      {selectedOptions.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-0.5">
          {selectedOptions.map((o) => (
            <span
              key={o.value}
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium"
            >
              {o.label}
              <button
                type="button"
                onClick={() => toggle(o.value)}
                className="hover:text-primary-900 focus:outline-none"
                aria-label={`Remove ${o.label}`}
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
            className="origin-top rounded-xl border border-border bg-surface shadow-xl animate-scale-in overflow-hidden"
          >
            {/* Search */}
            <div className="flex items-center gap-2 border-b border-border-light px-3 py-2.5">
              <span className="text-slate-400">{SearchIcon}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {loading && <span className="text-slate-400">{SpinnerIcon}</span>}
            </div>

            {/* Options */}
            <ul className="max-h-60 overflow-y-auto p-1.5">
              {loading && filtered.length === 0 && (
                Array.from({ length: 4 }).map((_, i) => (
                  <li key={`sk-${i}`} className="flex items-center gap-2.5 px-2.5 py-2">
                    <span className="h-4 w-4 animate-pulse rounded bg-slate-100 shrink-0" />
                    <span className="h-4 flex-1 animate-pulse rounded bg-slate-100" style={{ maxWidth: `${70 - i * 8}%` }} />
                  </li>
                ))
              )}

              {filtered.map((opt) => {
                const isSelected = value.includes(opt.value);
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onClick={() => toggle(opt.value)}
                      className={`
                        flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors
                        hover:bg-primary-50 hover:text-primary-700
                        ${isSelected ? 'bg-primary-50/60' : 'text-slate-700'}
                      `}
                    >
                      {/* Checkbox visual */}
                      <span
                        className={`
                          shrink-0 flex items-center justify-center w-4 h-4 rounded border transition-colors
                          ${isSelected
                            ? 'bg-primary-600 border-primary-600 text-white'
                            : 'border-slate-300 bg-white'}
                        `}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={`block truncate font-medium ${isSelected ? 'text-primary-700' : ''}`}>
                          {opt.label}
                        </span>
                        {opt.sublabel && (
                          <span className="block truncate text-xs text-slate-400">{opt.sublabel}</span>
                        )}
                      </span>
                    </button>
                  </li>
                );
              })}

              {filtered.length === 0 && !loading && (
                <li className="px-2.5 py-6 text-center text-sm text-slate-400">{emptyText}</li>
              )}
            </ul>

            {/* Footer — shows count + Done button */}
            {selectedOptions.length > 0 && (
              <div className="flex items-center justify-between px-3 py-2.5 border-t border-border bg-slate-50/60">
                <span className="text-xs text-slate-500">{selectedOptions.length} selected</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-xs font-semibold text-primary-600 hover:text-primary-800 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}

      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
