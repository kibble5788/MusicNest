import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonSearchResults() {
  return (
    <div className="px-4 space-y-2">
      <Skeleton className="h-7 w-36 mb-4" />

      {/* Search result items */}
      {Array(5)
        .fill(0)
        .map((_, i) => (
          <div key={i} className="flex items-center gap-3 py-3">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        ))}
    </div>
  )
}
