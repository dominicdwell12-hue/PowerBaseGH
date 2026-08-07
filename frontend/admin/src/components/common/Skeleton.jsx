export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-ink-50 ${className}`} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 6, columns = 5 }) {
  return (
    <div className="overflow-hidden rounded-xl border border-ink-50" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, r) => (
        // eslint-disable-next-line react/no-array-index-key
        <div key={r} className="flex gap-4 border-b border-ink-50 p-3 last:border-0">
          {Array.from({ length: columns }).map((__, c) => (
            // eslint-disable-next-line react/no-array-index-key
            <SkeletonBlock key={c} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
