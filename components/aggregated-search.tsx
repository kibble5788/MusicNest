"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SongCard } from "@/components/song-card"
import { Search, RefreshCw } from "lucide-react"
import type { Song } from "@/types/song"
import { mockSearch } from "@/lib/mock-data"
import { LoadingSpinner } from "@/components/loading-spinner"
import { VirtualList } from "@/components/virtual-list"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"

export default function AggregatedSearch() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<{
    all: Song[]
    qq: Song[]
    netease: Song[]
    audiobooks: Song[]
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeCategory, setActiveCategory] = useState("all")

  const containerRef = useRef<HTMLDivElement>(null)

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!searchTerm.trim()) return

    setIsSearching(true)

    try {
      // 模拟API请求
      const results = await mockSearch(searchTerm)
      setSearchResults(results)
    } catch (error) {
      console.error("搜索失败:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing || !searchTerm.trim()) return

    setIsRefreshing(true)

    try {
      // 模拟API请求
      const results = await mockSearch(searchTerm)
      setSearchResults(results)
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

  const renderSongItem = useCallback(({ index, data }: { index: number; data: Song[] }) => {
    const song = data[index]
    return <SongCard key={song.id} song={song} layout="list" />
  }, [])

  return (
    <div className="space-y-6" ref={containerRef} {...pullToRefreshProps}>
      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm">刷新中...</span>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start flex-col">
          <h1 className="text-3xl font-bold">Search</h1>
          <div className="w-7 h-2 bg-emerald-400 rounded-full ml-1 mb-1"></div>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="搜索歌曲、歌手或专辑"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/60 border-none rounded-full"
            />
          </div>
          <Button
            type="submit"
            disabled={isSearching}
            className="bg-highlight text-black hover:bg-highlight/90 rounded-full"
          >
            {isSearching ? <LoadingSpinner className="h-4 w-4" /> : "搜索"}
          </Button>
        </form>
      </div>

      {searchResults && (
        <div className="space-y-4">
          <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide">
            <Button
              variant={activeCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("all")}
              className={activeCategory === "all" ? "bg-highlight text-black" : ""}
            >
              全部
            </Button>
            <Button
              variant={activeCategory === "qq" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("qq")}
              className={activeCategory === "qq" ? "bg-highlight text-black" : ""}
            >
              QQ音乐
            </Button>
            <Button
              variant={activeCategory === "netease" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("netease")}
              className={activeCategory === "netease" ? "bg-highlight text-black" : ""}
            >
              网易云
            </Button>
            <Button
              variant={activeCategory === "audiobooks" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory("audiobooks")}
              className={activeCategory === "audiobooks" ? "bg-highlight text-black" : ""}
            >
              有声书
            </Button>
          </div>

          {searchResults[activeCategory as keyof typeof searchResults].length > 0 ? (
            <div className="space-y-3">
              <VirtualList
                data={searchResults[activeCategory as keyof typeof searchResults]}
                height={500}
                itemHeight={72}
                renderItem={renderSongItem}
                containerRef={containerRef}
              />
            </div>
          ) : (
            <p className="text-center py-8 text-muted-foreground">未找到相关结果</p>
          )}
        </div>
      )}

      {!searchResults && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">搜索您喜欢的音乐</p>
        </div>
      )}
    </div>
  )
}
