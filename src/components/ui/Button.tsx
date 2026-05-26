import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm',
  secondary:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
  ghost:
    'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
  danger:
    'bg-danger text-white hover:bg-red-600 active:bg-red-700 shadow-sm',
  outline:
    'border border-border text-slate-700 hover:bg-surface-hover active:bg-surface-active',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-9 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2 rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  loading,
  fullWidth,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-200 ease-out
        focus-ring cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children && <span>{children}</span>}
      {iconRight && <span className="shrink-0">{iconRight}</span>}
    </button>
  );
}
