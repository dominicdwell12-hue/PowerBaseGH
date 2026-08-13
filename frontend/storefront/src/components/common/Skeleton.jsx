export function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-md bg-ink-600 ${className}`} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-ink-600 bg-ink-600">
      <SkeletonBlock className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <SkeletonBlock className="h-3 w-1/3" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-2/3" />
        <SkeletonBlock className="mt-1 h-6 w-1/2" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
