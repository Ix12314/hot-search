interface Props {
  rows?: number;
}

export function Skeleton({ rows = 5 }: Props) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-xl border border-ink-100 bg-canvas"
        >
          <div className="skeleton-row w-6 h-6 rounded-md" />
          <div className="flex-1 space-y-2">
            <div className="skeleton-row h-3 w-3/4 rounded-md" />
            <div className="skeleton-row h-2 w-1/3 rounded-md" />
          </div>
          <div className="skeleton-row h-3 w-12 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-ink-100 bg-canvas overflow-hidden">
      <div className="px-5 py-4 border-b border-ink-100 flex items-center gap-3">
        <div className="skeleton-row w-8 h-8 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="skeleton-row h-3 w-24 rounded-md" />
          <div className="skeleton-row h-2 w-16 rounded-md" />
        </div>
      </div>
      <div className="p-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-3 py-2.5"
          >
            <div className="skeleton-row w-5 h-5 rounded-md" />
            <div className="flex-1">
              <div className="skeleton-row h-2.5 w-full rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
