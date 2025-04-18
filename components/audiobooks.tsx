"use client"

import { useEffect, useState } from "react"
import { SongCard } from "@/components/song-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import type { Song } from "@/types/song"
import { mockAudiobooksData } from "@/lib/mock-data"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { RefreshCw, Search } from "lucide-react"
import { SkeletonAudiobooksPage } from "@/components/skeletons/skeleton-audiobooks-page"
import SearchPage from "@/components/search-page"
import type { Audiobook } from "@/types/audiobook"
import AudiobookPlayer from "@/components/audiobook-player"
import { setWithExpiry, getWithExpiry } from "@/lib/local-storage"

// Cache key for audiobooks data
const AUDIOBOOKS_CACHE_KEY = "audiobooks_data"
// Cache expiration time: 30 minutes (in milliseconds)
const AUDIOBOOKS_CACHE_TTL = 30 * 60 * 1000

// Update the component props to include setHideNavigation
interface AudiobooksProps {
  setHideNavigation?: (hide: boolean) => void
}

export default function Audiobooks({ setHideNavigation }: AudiobooksProps) {
  const [data, setData] = useState<{
    featured: Song[]
    popular: Song[]
    categories: {
      name: string
      books: Song[]
    }[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [showSearchPage, setShowSearchPage] = useState(false)
  const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null)
  const [selectedChapterId, setSelectedChapterId] = useState<string | undefined>(undefined)

  const fetchData = async (forceRefresh = false) => {
    try {
      setIsLoading(true)

      // Check if we have cached data and not forcing refresh
      if (!forceRefresh) {
        const cachedData = getWithExpiry<typeof data>(AUDIOBOOKS_CACHE_KEY)
        if (cachedData) {
          console.log("Using cached audiobooks data")
          setData(cachedData)
          setIsLoading(false)
          return
        }
      }

      // No cache or forcing refresh, fetch from API
      console.log("Fetching fresh audiobooks data")

      // 模拟API请求延迟
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // 获取模拟数据
      const result = await mockAudiobooksData()

      // Cache the result with expiration
      setWithExpiry(AUDIOBOOKS_CACHE_KEY, result, AUDIOBOOKS_CACHE_TTL)

      setData(result)
    } catch (error) {
      console.error("获取有声书数据失败:", error)
      // 即使失败也设置一些默认数据
      setData({
        featured: [],
        popular: [],
        categories: [],
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleRefresh = async () => {
    if (isRefreshing) return

    setIsRefreshing(true)

    try {
      // Force refresh to bypass cache
      await fetchData(true)
    } catch (error) {
      console.error("刷新失败:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const { pullToRefreshProps } = usePullToRefresh({
    onRefresh: handleRefresh,
    isRefreshing,
  })

  const handleSearchClick = () => {
    setShowSearchPage(true)
  }

  const handleBackFromSearch = () => {
    setShowSearchPage(false)
  }

  const handleSelectAudiobook = (book: Audiobook) => {
    setSelectedAudiobook(book)
    // 如果有章节信息，选择第一章
    if (book.chapters && book.chapters.length > 0) {
      setSelectedChapterId(book.chapters[0].id)
    } else {
      setSelectedChapterId(undefined)
    }
  }

  const handleBackFromPlayer = () => {
    setSelectedAudiobook(null)
    setSelectedChapterId(undefined)
  }

  if (showSearchPage) {
    return <SearchPage type="audiobook" onBack={handleBackFromSearch} setHideNavigation={setHideNavigation} />
  }

  // 如果选择了有声书，显示播放器
  if (selectedAudiobook) {
    return (
      <AudiobookPlayer
        bookId={selectedAudiobook.id}
        chapterId={selectedChapterId}
        onBack={handleBackFromPlayer}
        setHideNavigation={setHideNavigation}
      />
    )
  }

  // 显示骨架屏
  if (isLoading) {
    return <SkeletonAudiobooksPage />
  }

  return (
    <div className="space-y-4" {...pullToRefreshProps}>
      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm">刷新中...</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start flex-col">
          <h1 className="text-3xl font-bold">AudioBook</h1>
          <div className="w-7 h-2 bg-emerald-400 rounded-full ml-1 mb-1"></div>
        </div>

        <div className="relative" onClick={handleSearchClick}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索有声书、作者或分类"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/60 border-none rounded-full h-12 focus:outline-none focus:ring-0 focus:border-0"
            readOnly
            onClick={handleSearchClick}
          />
        </div>
      </div>

      <Tabs defaultValue="featured">
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="featured">精选</TabsTrigger>
          <TabsTrigger value="popular">热门</TabsTrigger>
          <TabsTrigger value="categories">分类</TabsTrigger>
        </TabsList>

        <TabsContent value="featured" className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {data?.featured.map((book) => (
              <SongCard key={book.id} song={{ ...book, source: "audiobook" }} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-4">
          <div className="space-y-3">
            {data?.popular.map((book) => (
              <SongCard key={book.id} song={{ ...book, source: "audiobook" }} layout="list" />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <div className="space-y-6">
            {data?.categories.map((category) => (
              <div key={category.name} className="space-y-3">
                <h2 className="text-lg font-medium">{category.name}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {category.books.map((book) => (
                    <SongCard key={book.id} song={{ ...book, source: "audiobook" }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
