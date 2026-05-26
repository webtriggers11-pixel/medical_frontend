import { type InputHTMLAttributes } from 'react';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  value?: string;
}

export function SearchInput({ onClear, value, className = '', ...props }: SearchInputProps) {
  return (
    <div className={`relative ${className}`}>
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={value}
        className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-surface text-sm text-slate-900 placeholder:text-slate-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 hover:border-slate-300"
        {...props}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
