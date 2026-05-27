import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export interface ComboboxOption {
  value: string;
  label: string;
  sublabel?: string;
}

interface ComboboxProps {
  label?: string;
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  emptyText?: string;
  icon?: ReactNode;
  /** When set, an inline "+ Create …" row appears for an unmatched query. */
  allowCreate?: boolean;
  onCreate?: (label: string) => void;
  createLabel?: (query: string) => string;
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

const CheckIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

const PlusIcon = (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const SpinnerIcon = (
  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export function Combobox({
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
  icon,
  allowCreate,
  onCreate,
  createLabel = (q) => `Create “${q}”`,
  className = '',
}: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const fieldId = useId();

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.sublabel?.toLowerCase().includes(q),
    );
  }, [options, query]);

  const trimmed = query.trim();
  const showCreate =
    !!allowCreate &&
    trimmed.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === trimmed.toLowerCase());
  const rowCount = filtered.length + (showCreate ? 1 : 0);

  // Position the floating panel under the trigger (viewport coordinates).
  const updatePosition = useCallback(() => {
    const r = triggerRef.current?.getBoundingClientRect();
    if (r) setCoords({ top: r.bottom + 6, left: r.left, width: r.width });
  }, []);

  // Close on outside click — the panel lives in a portal, so check both refs.
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

  // Reposition while open if the page scrolls or resizes.
  useEffect(() => {
    if (!open) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [open, updatePosition]);

  // Focus the search field when the menu opens.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => inputRef.current?.focus(), 20);
    return () => clearTimeout(t);
  }, [open]);

  // Keep the active row scrolled into view.
  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.children[activeIndex] as HTMLElement | undefined;
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const toggleOpen = () => {
    if (open) {
      setOpen(false);
    } else {
      updatePosition();
      setQuery('');
      setActiveIndex(0);
      setOpen(true);
    }
  };

  const updateQuery = (next: string) => {
    setQuery(next);
    setActiveIndex(0);
  };

  const choose = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  const create = () => {
    onCreate?.(trimmed);
    setOpen(false);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, rowCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex < filtered.length) choose(filtered[activeIndex].value);
      else if (showCreate) create();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    }
  };

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
        {icon && <span className="shrink-0 text-slate-400">{icon}</span>}
        <span className={`flex-1 truncate ${selected ? 'text-slate-900' : 'text-slate-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <span
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          {ChevronIcon}
        </span>
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: coords.top, left: coords.left, width: coords.width, zIndex: 9999 }}
            className="origin-top rounded-xl border border-border bg-surface shadow-xl animate-scale-in overflow-hidden"
          >
            <div className="flex items-center gap-2 border-b border-border-light px-3 py-2.5">
              <span className="text-slate-400">{SearchIcon}</span>
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
              />
              {loading && <span className="text-slate-400">{SpinnerIcon}</span>}
            </div>

            <ul ref={listRef} className="max-h-60 overflow-y-auto p-1.5">
              {filtered.map((opt, i) => {
                const isSelected = opt.value === value;
                const isActive = i === activeIndex;
                return (
                  <li key={opt.value}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => choose(opt.value)}
                      className={`
                        flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors
                        ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-700'}
                      `}
                    >
                      <span className="flex-1 min-w-0">
                        <span className="block truncate font-medium">{opt.label}</span>
                        {opt.sublabel && (
                          <span className="block truncate text-xs text-slate-400">{opt.sublabel}</span>
                        )}
                      </span>
                      {isSelected && <span className="shrink-0 text-primary-600">{CheckIcon}</span>}
                    </button>
                  </li>
                );
              })}

              {showCreate && (
                <li>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(filtered.length)}
                    onClick={create}
                    className={`
                      flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-colors
                      ${activeIndex === filtered.length ? 'bg-primary-50 text-primary-700' : 'text-primary-600'}
                    `}
                  >
                    <span className="shrink-0">{PlusIcon}</span>
                    <span className="truncate">{createLabel(trimmed)}</span>
                  </button>
                </li>
              )}

              {filtered.length === 0 && !showCreate && (
                <li className="px-2.5 py-6 text-center text-sm text-slate-400">{emptyText}</li>
              )}
            </ul>
          </div>,
          document.body,
        )}

      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
