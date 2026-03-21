export function SkeletonCard({ lines = 2 }) {
  return (
    <div className="card p-4 animate-pulse">
      <div className="h-4 bg-slate-800 rounded-lg w-3/4 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={`h-3 bg-slate-800 rounded-lg mb-2 ${i === lines - 1 ? 'w-1/2' : 'w-full'}`} />
      ))}
    </div>
  )
}

export function SkeletonStat() {
  return (
    <div className="stat-card animate-pulse">
      <div className="h-3 bg-slate-800 rounded w-2/3 mb-3" />
      <div className="h-8 bg-slate-800 rounded w-1/2" />
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={2} />
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-10 bg-slate-800/60 border-b border-slate-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-slate-800/50">
          <div className="h-5 bg-slate-800 rounded-full w-16" />
          <div className="h-4 bg-slate-800 rounded w-32" />
          <div className="h-3 bg-slate-800 rounded flex-1" />
          <div className="h-3 bg-slate-800 rounded w-20" />
        </div>
      ))}
    </div>
  )
}
