import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonAudiobooksPage() {
  return (
    <div className="space-y-4">
      {/* 标题和搜索框 */}
      <div className="space-y-4">
        <div className="flex items-start flex-col">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-2 w-7 mt-1 ml-1" />
        </div>
        <div className="relative">
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>

      {/* 分类标签 */}
      <div className="grid grid-cols-3 gap-2">
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
        <Skeleton className="h-10 rounded-md" />
      </div>

      {/* 有声书网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
      </div>

      {/* 第二个分类标题 */}
      <Skeleton className="h-6 w-36 mt-6" />

      {/* 第二个有声书网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-square rounded-md" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
      </div>
    </div>
  )
}
