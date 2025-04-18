"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import { RefreshCw, Search, Play, ChevronRight } from "lucide-react"
import type { Song } from "@/types/song"
import { useMusic } from "@/context/music-context"
import PlaylistDetail from "@/components/playlist-detail"
import { SkeletonMusicPage } from "@/components/skeletons/skeleton-music-page"
import SearchPage from "@/components/search-page"
import { getPlaylists, getMusicData, formatListenCount } from "@/lib/playlist-api"

interface FeaturedCard {
  id: string
  title: string
  subtitle: string
  cover: string
  color: string
  type: "song" | "playlist"
  songId?: string
}

interface Playlist {
  id: string
  title: string
  cover: string
  songCount: number
  listenCount?: number
}

// Update the component props to include setHideNavigation
interface MusicProps {
  setHideNavigation?: (hide: boolean) => void
}

export default function Music({ setHideNavigation }: MusicProps) {
  const [data, setData] = useState<{
    featuredCards: FeaturedCard[]
    recommendedSongs: Song[]
    playlists: Playlist[]
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { playSong } = useMusic()
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [showSearchPage, setShowSearchPage] = useState(false)

  const fetchData = async (forceRefresh = false) => {
    try {
      setIsLoading(true)

      // 使用 axios 和缓存机制获取数据
      const [musicData, playlistsData] = await Promise.all([getMusicData(forceRefresh), getPlaylists(forceRefresh)])

      // 构建特色卡片
      const featuredCards: FeaturedCard[] = [
        {
          id: "trending-daily",
          title: "潮趣日推",
          subtitle: "周传雄-青花",
          cover: "/song-cover-1.png",
          color: "bg-emerald-300",
          type: "song",
          songId: musicData.trending[0].id,
        },
        {
          id: "new-releases",
          title: "新歌大赏",
          subtitle: "七喜-爱的就是你（无论我走多远）",
          cover: "/song-cover-2.png",
          color: "bg-purple-300",
          type: "song",
          songId: musicData.newReleases[0].id,
        },
        {
          id: "trending-weekly",
          title: "潮流周榜",
          subtitle: "热门流行音乐精选",
          cover: "/song-cover-3.png",
          color: "bg-pink-300",
          type: "playlist",
        },
      ]

      setData({
        featuredCards,
        recommendedSongs: [
          {
            id: "song1",
            title: "天下有情人 (国语版)",
            artist: "童瑶",
            cover: "/lovers-world.png",
            url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
            duration: 240,
            source: "qq" as const,
          },
          {
            id: "song2",
            title: "三月里的小雨",
            artist: "王怡怡",
            cover: "/march-rain.png",
            url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
            duration: 195,
            source: "qq" as const,
          },
          {
            id: "song3",
            title: "再度重相逢 (手鼓版)",
            artist: "晴天姐妹",
            cover: "/reunion-drums.png",
            url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
            duration: 218,
            source: "qq" as const,
          },
        ],
        playlists: playlistsData.playlists.slice(0, 3),
      })
    } catch (error) {
      console.error("获取音乐数据失败:", error)
      // 即使失败也设置一些默认数据
      setData({
        featuredCards: [],
        recommendedSongs: [],
        playlists: [],
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
      // 强制刷新数据，不使用缓存
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

  const handlePlaySong = (song: Song) => {
    playSong(song)
  }

  const handleCardClick = (card: FeaturedCard) => {
    if (card.type === "song" && card.songId) {
      // 模拟一个歌曲对象
      const song: Song = {
        id: card.songId,
        title: card.subtitle,
        artist: "Featured Artist",
        cover: card.cover,
        url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
        duration: 240,
        source: "qq",
      }
      playSong(song)
    } else if (card.type === "playlist") {
      setSelectedPlaylist(card.id)
    }
  }

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylist(playlistId)
  }

  const handleBackFromPlaylist = () => {
    setSelectedPlaylist(null)
  }

  const handleSearchClick = () => {
    setShowSearchPage(true)
  }

  const handleBackFromSearch = () => {
    setShowSearchPage(false)
  }

  if (showSearchPage) {
    return <SearchPage type="music" onBack={handleBackFromSearch} setHideNavigation={setHideNavigation} />
  }

  if (selectedPlaylist) {
    return (
      <PlaylistDetail id={selectedPlaylist} onBack={handleBackFromPlaylist} setHideNavigation={setHideNavigation} />
    )
  }
 

  // 显示骨架屏
  if (isLoading) {
    return <SkeletonMusicPage />
  }

  return (
    <div className="space-y-6 pb-20" {...pullToRefreshProps}>
      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm">刷新中...</span>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-start flex-col">
          <h1 className="text-3xl font-bold">Music</h1>
          <div className="w-7 h-2 bg-emerald-400 rounded-full ml-1 mb-1"></div>
        </div>

        <div className="relative" onClick={handleSearchClick}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="李灿烈签名专辑"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-card/60 border-none rounded-full h-11 focus:outline-none focus:ring-0 focus:border-0"
            readOnly
            onClick={handleSearchClick}
          />
        </div>
      </div>

      {/* 特色卡片 */}
      <div className="grid grid-cols-3 gap-3">
        {data?.featuredCards.map((card) => (
          <div
            key={card.id}
            className={`${card.color} rounded-xl p-3 flex flex-col justify-between relative overflow-hidden`}
            onClick={() => handleCardClick(card)}
          >
            <div className="space-y-1">
              <h3 className="text-black font-medium text-sm">{card.title}</h3>
              <p className="text-black/70 text-xs line-clamp-1">{card.subtitle}</p>
            </div>
            <div className="mt-2 relative">
              <div className="w-full aspect-square rounded-md overflow-hidden">
                <img src={card.cover || "/placeholder.svg"} alt={card.title} className="w-full h-full object-cover" />
              </div>
              <button className="absolute bottom-2 right-2 bg-black/50 rounded-full p-1.5">
                <Play className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 偶遇心动单曲 */}
      <div className="space-y-3">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">偶遇心动单曲</h2>
          <button className="bg-emerald-400 rounded-full p-1 ml-2">
            <Play className="h-4 w-4 text-black" />
          </button>
        </div>

        {data?.recommendedSongs.map((song) => (
          <div key={song.id} className="flex items-center space-x-3 py-2" onClick={() => handlePlaySong(song)}>
            <div className="w-12 h-12 rounded overflow-hidden">
              <img src={song.cover || "/placeholder.svg"} alt={song.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{song.title}</h3>
              <p className="text-gray-400 text-sm">{song.artist}</p>
            </div>
            <button className="text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>
          </div>
        ))}
      </div>

      {/* 宝藏歌单库 */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">宝藏歌单库</h2>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {data?.playlists.map((playlist) => (
            <div
              key={playlist.id}
              onClick={() => handlePlaylistClick(playlist.id)}
              className="transform transition-transform duration-200 hover:scale-105"
            >
              <div className="aspect-square rounded-md overflow-hidden relative">
                <img
                  src={playlist.cover || "/placeholder.svg"}
                  alt={playlist.title}
                  className="w-full h-full object-cover"
                />
                {/* 左上角收听人数 */}
                <div className="absolute top-1 left-1 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-xs text-white flex items-center">
                  <span className="mr-1">🎧</span>
                  {formatListenCount(playlist.listenCount || 0)}
                </div>
                {/* 底部歌单标题 */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="text-white text-xs font-medium line-clamp-2">{playlist.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
