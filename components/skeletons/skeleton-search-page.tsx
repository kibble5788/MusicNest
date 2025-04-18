import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonSearchPage() {
  return (
    <div className="min-h-screen pb-20">
      {/* 搜索栏 */}
      <div className="p-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-12 flex-1 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 w-16 rounded-md" />
        </div>
      </div>

      {/* 分类过滤器 */}
      <div className="flex justify-around px-4 py-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="w-10 h-3 mt-1" />
          </div>
        ))}
      </div>

      {/* 历史记录 */}
      <div className="px-4 mt-4">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-5 w-5 rounded" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </div>

      {/* 大家都在搜 */}
      <div className="px-4 mt-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 rounded-full" />
          ))}
        </div>
      </div>

      {/* 搜索发现 */}
      <div className="px-4 mt-6">
        <Skeleton className="h-6 w-32 mb-2" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-16 h-16 rounded-md mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
