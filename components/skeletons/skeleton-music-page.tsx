import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonMusicPage() {
  return (
    <div className="space-y-6">
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

      {/* 特色卡片 */}
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-xl p-3 bg-card/30 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-3 w-24" />
            <div className="mt-2">
              <Skeleton className="aspect-square rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* 偶遇心动单曲 */}
      <div className="space-y-3">
        <div className="flex items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-6 w-6 rounded-full ml-2" />
        </div>

        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3 py-2">
            <Skeleton className="w-12 h-12 rounded" />
            <div className="flex-1">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        ))}
      </div>

      {/* 宝藏歌单库 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-5 w-5" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
