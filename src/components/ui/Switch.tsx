interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export function Switch({ checked, onChange, loading, disabled, label }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && !loading && onChange(!checked)}
      className={`
        relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full
        border-2 border-transparent transition-colors duration-200 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:ring-offset-1
        disabled:opacity-50 disabled:cursor-not-allowed
        ${checked ? 'bg-primary-600' : 'bg-slate-200'}
      `}
    >
      {loading ? (
        <span
          className={`
            pointer-events-none inline-flex h-4 w-4 items-center justify-center
            rounded-full bg-white shadow transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        >
          <svg
            className="h-2.5 w-2.5 animate-spin text-primary-500"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </span>
      ) : (
        <span
          className={`
            pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow
            transition-transform duration-200 ease-in-out
            ${checked ? 'translate-x-4' : 'translate-x-0'}
          `}
        />
      )}
    </button>
  );
}
