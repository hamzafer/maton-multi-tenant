"use client";

function Bone({ className = "" }: { className?: string }) {
  return (
    <div className={`skeleton-bone rounded-lg ${className}`} />
  );
}

export function DashboardSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Bone className="h-6 w-32 mb-2" />
        <Bone className="h-4 w-48" />
      </div>

      {/* App grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4" style={{ animationDelay: `${i * 80}ms` }}>
            <div className="flex items-center justify-between mb-3">
              <Bone className="w-9 h-9 rounded-lg" />
              <Bone className="w-12 h-4 rounded-full" />
            </div>
            <Bone className="h-4 w-24 mb-1" />
            <Bone className="h-3 w-full mb-3" />
            <Bone className="h-8 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Bone className="h-6 w-20 mb-2" />
        <Bone className="h-4 w-56" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card rounded-xl p-4" style={{ animationDelay: `${i * 60}ms` }}>
            <Bone className="h-3 w-12 mb-3" />
            <Bone className="h-8 w-10" />
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)]">
          <Bone className="h-3 w-24" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 border-b border-[rgba(255,255,255,0.03)] flex items-center gap-6" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="flex items-center gap-2.5">
              <Bone className="w-7 h-7 rounded-full" />
              <Bone className="h-3.5 w-36" />
            </div>
            <Bone className="h-3.5 w-24" />
            <Bone className="h-5 w-16 rounded-full" />
            <Bone className="h-3.5 w-16" />
            <Bone className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Bone className="h-6 w-28 mb-2" />
        <Bone className="h-4 w-64" />
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-4 mb-6">
        <Bone className="h-3 w-32 mb-3" />
        <div className="flex items-end gap-[3px] h-16">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="skeleton-bone flex-1 min-w-[3px] rounded-t-sm"
              style={{ height: `${20 + Math.random() * 80}%`, animationDelay: `${i * 30}ms` }}
            />
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.04)]">
          <Bone className="h-3 w-20" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-2.5 border-b border-[rgba(255,255,255,0.03)] flex items-center gap-4" style={{ animationDelay: `${i * 40}ms` }}>
            <Bone className="h-3 w-16" />
            <Bone className="h-3 w-24" />
            <Bone className="h-3 w-10" />
            <Bone className="h-3 w-48 flex-1" />
            <Bone className="h-3 w-8" />
            <Bone className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}
