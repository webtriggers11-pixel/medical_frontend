type LogoVariant = 'full' | 'mark';

interface LogoProps {
  /** `full` renders the complete logo lockup; `mark` shows only the icon. */
  variant?: LogoVariant;
  /** Sizing/spacing utilities. Set a height (e.g. `h-9`) — width is derived. */
  className?: string;
}

const LOGO_SRC = '/medisync-logo.jpeg';
const LOGO_ALT = 'Lifecare Health Services';

/**
 * App logo. The source asset is a single horizontal lockup (icon + wordmark)
 * with the icon on the far left, so the `mark` variant simply crops the lockup
 * to its leading square to surface just the icon for tight spaces.
 */
export function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'mark') {
    return (
      <span className={`inline-flex aspect-square overflow-hidden ${className}`}>
        <img src={LOGO_SRC} alt={LOGO_ALT} className="h-full w-auto max-w-none object-left" />
      </span>
    );
  }

  return <img src={LOGO_SRC} alt={LOGO_ALT} className={`w-auto object-contain ${className}`} />;
}
