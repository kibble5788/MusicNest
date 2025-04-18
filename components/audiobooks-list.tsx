"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useInView } from "react-intersection-observer"
import { audiobookApiClient } from "@/lib/mock-audiobook-api"
import type { Audiobook } from "@/types/audiobook"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Filter, RefreshCw, AlertCircle } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { cn } from "@/lib/utils"

interface AudiobooksListProps {
  setHideNavigation?: (hide: boolean) => void
  onSelectAudiobook?: (book: Audiobook) => void
}

export default function AudiobooksList({ setHideNavigation, onSelectAudiobook }: AudiobooksListProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeSort, setActiveSort] = useState<"popular" | "newest" | "rating">("popular")
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [showFilters, setShowFilters] = useState(false)

  // 使用 Intersection Observer 实现无限滚动
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  })

  // 获取有声书列表
  const fetchAudiobooks = useCallback(
    async (reset = false, forceRefresh = false) => {
      try {
        const currentPage = reset ? 1 : page

        if (reset) {
          setIsLoading(true)
          setAudiobooks([])
        } else {
          setIsLoadingMore(true)
        }

        setError(null)

        const params = {
          page: currentPage,
          pageSize: 10,
          category: activeCategory !== "all" ? activeCategory : undefined,
          sort: activeSort,
          search: searchTerm || undefined,
          forceRefresh, // 添加强制刷新参数
        }

        const response = await audiobookApiClient.getAudiobooks(params)

        setAudiobooks((prev) => (reset ? response.books : [...prev, ...response.books]))
        setHasMore(response.hasMore)

        if (!reset) {
          setPage(currentPage + 1)
        } else {
          setPage(2)
        }
      } catch (err) {
        console.error("获取有声书列表失败:", err)
        setError(err instanceof Error ? err.message : "获取有声书列表失败")
        toast.error("获取有声书列表失败，请稍后重试")
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [page, activeCategory, activeSort, searchTerm],
  )

  // 初始加载和筛选条件变化时重新加载
  useEffect(() => {
    fetchAudiobooks(true)
  }, [activeCategory, activeSort])

  // 处理无限滚动
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      fetchAudiobooks()
    }
  }, [inView, hasMore, isLoading, isLoadingMore, fetchAudiobooks])

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchAudiobooks(true)
  }

  // 处理刷新
  const handleRefresh = () => {
    fetchAudiobooks(true, true) // 强制刷新
    toast.success("正在刷新数据...")
  }

  // 处理有声书点击
  const handleAudiobookClick = (book: Audiobook) => {
    if (onSelectAudiobook) {
      onSelectAudiobook(book)
    } else {
      router.push(`/audiobook/${book.id}`)
    }
  }

  return (
    <div className="space-y-4 pb-20">
      {/* 搜索栏 */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md pt-2 pb-4">
        <div className="flex items-start flex-col mb-2">
          <h1 className="text-3xl font-bold">AudioBook</h1>
          <div className="w-7 h-2 bg-emerald-400 rounded-full ml-1 mb-1"></div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索有声书、作者或分类"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/60 border-none rounded-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-highlight text-black hover:bg-highlight/90 rounded-full"
          >
            {isLoading ? <LoadingSpinner className="h-4 w-4" /> : "搜索"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className={cn("rounded-full", showFilters && "bg-highlight/20")}
          >
            <Filter className="h-5 w-5" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            className="rounded-full"
            title="刷新数据"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </form>

        {/* 筛选器 */}
        {showFilters && (
          <div className="mt-4 space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-medium mb-2">分类</h3>
              <div className="flex flex-wrap gap-2">
                {["all", "fiction", "history", "business", "science", "self-help", "biography"].map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className={activeCategory === category ? "bg-highlight text-black" : ""}
                  >
                    {category === "all"
                      ? "全部"
                      : category === "fiction"
                        ? "小说"
                        : category === "history"
                          ? "历史"
                          : category === "business"
                            ? "商业"
                            : category === "science"
                              ? "科学"
                              : category === "self-help"
                                ? "自助"
                                : "传记"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">排序</h3>
              <div className="flex gap-2">
                {[
                  { value: "popular", label: "最热" },
                  { value: "newest", label: "最新" },
                  { value: "rating", label: "评分" },
                ].map((sort) => (
                  <Button
                    key={sort.value}
                    variant={activeSort === sort.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveSort(sort.value as any)}
                    className={activeSort === sort.value ? "bg-highlight text-black" : ""}
                  >
                    {sort.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {isLoading && page === 1 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingSpinner className="h-12 w-12 mb-4" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        ) : error && audiobooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchAudiobooks(true)}>重试</Button>
          </div>
        ) : audiobooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">没有找到符合条件的有声书</p>
            <Button
              onClick={() => {
                setSearchTerm("")
                setActiveCategory("all")
                setActiveSort("popular")
                fetchAudiobooks(true)
              }}
            >
              重置筛选条件
            </Button>
          </div>
        ) : (
          <>
            {/* 有声书网格 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {audiobooks.map((book) => (
                <div
                  key={book.id}
                  className="flex flex-col space-y-2 cursor-pointer transform transition-transform active:scale-[0.98]"
                  onClick={() => handleAudiobookClick(book)}
                >
                  <div className="relative aspect-[3/4] rounded-md overflow-hidden bg-muted/50">
                    <img
                      src={book.cover || "/placeholder.svg"}
                      alt={book.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    {book.isVIP && (
                      <div className="absolute top-0 right-0 bg-amber-500 text-black text-xs px-2 py-1 rounded-bl-md">
                        VIP
                      </div>
                    )}
                    {book.isNew && (
                      <div className="absolute top-0 right-0 bg-emerald-500 text-black text-xs px-2 py-1 rounded-bl-md">
                        新书
                      </div>
                    )}
                    {book.progress !== undefined && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                        <div className="h-full bg-emerald-500" style={{ width: `${book.progress * 100}%` }}></div>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium line-clamp-2">{book.title}</h3>
                    <p className="text-xs text-muted-foreground">{book.author.name}</p>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <svg
                              key={i}
                              className={`h-3 w-3 ${i < Math.floor(book.rating) ? "text-amber-500" : "text-gray-500"}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                      </div>
                      <span className="text-xs text-muted-foreground ml-1">{book.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 加载更多 */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {isLoadingMore ? (
                <div className="flex items-center">
                  <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
                  <span className="text-muted-foreground">加载更多...</span>
                </div>
              ) : hasMore ? (
                <Button variant="ghost" onClick={() => fetchAudiobooks()} className="text-muted-foreground">
                  加载更多
                </Button>
              ) : (
                <p className="text-muted-foreground text-sm">没有更多内容了</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
