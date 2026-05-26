interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div className={`animate-pulse rounded-lg bg-slate-100 ${className}`} />
  );
}

export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden">
      <div className="p-5 border-b border-border">
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-5 w-16 rounded-full ml-auto" />
            <Skeleton className="h-5 w-14 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
