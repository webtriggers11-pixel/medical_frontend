import { BRAND_NAME, BRAND_COLOR } from '../../config/brand';

type BrandNameSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

const sizeClasses: Record<BrandNameSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-xl',
  xl: 'text-3xl',
};

interface BrandNameProps {
  size?: BrandNameSize;
  className?: string;
  /** Allow the name to wrap across lines (default keeps it on a single line). */
  wrap?: boolean;
}

/** The brand wordmark rendered as styled text (matches the logo's red). */
export function BrandName({ size = 'md', className = '', wrap = false }: BrandNameProps) {
  return (
    <span
      style={{ color: BRAND_COLOR }}
      className={`font-extrabold tracking-tight leading-tight ${
        wrap ? '' : 'whitespace-nowrap'
      } ${sizeClasses[size]} ${className}`}
    >
      {BRAND_NAME}
    </span>
  );
}
