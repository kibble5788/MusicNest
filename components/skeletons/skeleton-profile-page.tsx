import { Skeleton } from "@/components/ui/skeleton"

export function SkeletonProfilePage() {
  return (
    <div className="space-y-4">
      {/* 顶部栏 */}
      <div className="flex justify-end p-4 space-x-4">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-6" />
      </div>

      {/* 用户信息 */}
      <div className="flex items-center px-4 pb-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <div className="ml-4">
          <Skeleton className="h-6 w-32 mb-2" />
          <div className="flex items-center mt-2">
            <Skeleton className="h-8 w-32 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full ml-2" />
          </div>
        </div>
      </div>

      {/* 会员广告横幅 */}
      <Skeleton className="h-24 mx-2 rounded-xl" />

      {/* 会员中心和活动中心 */}
      <div className="grid grid-cols-2 gap-4 mx-2">
        <Skeleton className="h-16 rounded-xl" />
        <Skeleton className="h-16 rounded-xl" />
      </div>

      {/* 音乐分类标签 */}
      <div className="grid grid-cols-3 gap-2 mx-2">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>

      {/* 歌单标题 */}
      <div className="flex justify-between items-center px-2 py-2">
        <Skeleton className="h-6 w-48" />
        <div className="flex space-x-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-5" />
        </div>
      </div>

      {/* 歌单列表 */}
      <div className="px-2 space-y-4">
        {Array(5)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="flex items-center">
              <Skeleton className="w-12 h-12 rounded-md" />
              <div className="ml-3 flex-1">
                <Skeleton className="h-4 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}
