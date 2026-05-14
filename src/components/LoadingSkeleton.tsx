// ─── Base Shimmer Block ──────────────────────────────────────────────
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

// ─── Card Skeleton (recipe / category cards) ─────────────────────────
export const CardSkeleton = () => (
  <div className="hela-recipe-card">
    <Shimmer className="h-44 w-full rounded-none" />
    <div className="p-4 space-y-3">
      <Shimmer className="h-5 w-3/4" />
      <Shimmer className="h-4 w-full" />
      <Shimmer className="h-4 w-5/6" />
      <div className="flex justify-between pt-3 border-t border-gray-50">
        <Shimmer className="h-4 w-16" />
        <Shimmer className="h-4 w-16" />
      </div>
    </div>
  </div>
);

// ─── Card Grid Skeleton ──────────────────────────────────────────────
export const CardGridSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

// ─── List Row Skeleton ───────────────────────────────────────────────
export const ListSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <div className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 hela-card">
        <Shimmer className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Shimmer className="h-4 w-1/3" />
          <Shimmer className="h-3 w-2/3" />
        </div>
        <Shimmer className="h-8 w-20 rounded-md" />
      </div>
    ))}
  </div>
);

// ─── Text / Paragraph Skeleton ───────────────────────────────────────
export const TextSkeleton = ({ lines = 3 }: { lines?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer
        key={i}
        className={`h-4 ${i === lines - 1 ? 'w-3/5' : 'w-full'}`}
      />
    ))}
  </div>
);

// ─── Profile Skeleton ────────────────────────────────────────────────
export const ProfileSkeleton = () => (
  <div className="max-w-2xl mx-auto p-8 space-y-6">
    <div className="flex items-center gap-5">
      <Shimmer className="h-20 w-20 rounded-full" />
      <div className="flex-1 space-y-2">
        <Shimmer className="h-6 w-1/3" />
        <Shimmer className="h-4 w-1/2" />
      </div>
    </div>
    <Shimmer className="h-px w-full" />
    <div className="space-y-4">
      <Shimmer className="h-10 w-full rounded-xl" />
      <Shimmer className="h-10 w-full rounded-xl" />
      <Shimmer className="h-10 w-full rounded-xl" />
    </div>
  </div>
);

export default CardSkeleton;
