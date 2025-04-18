"use client"

import { useState, useEffect } from "react"
import { getRecentSongs, clearRecentSongs } from "@/lib/user-music-storage"
import { useMusic } from "@/context/music-context"
import { SongCard } from "@/components/song-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, Trash2, Music, Headphones } from "lucide-react"
import type { Song } from "@/types/song"
import toast from "react-hot-toast"

interface RecentSongsProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function RecentSongs({ onBack, setHideNavigation }: RecentSongsProps) {
  const { playSong } = useMusic()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"music" | "audiobook">("music")

  // 隐藏导航栏
  useEffect(() => {
    if (setHideNavigation) {
      setHideNavigation(true)
    }

    return () => {
      if (setHideNavigation) {
        setHideNavigation(false)
      }
    }
  }, [setHideNavigation])

  // 加载最近播放的歌曲
  useEffect(() => {
    const loadRecentSongs = () => {
      setIsLoading(true)
      try {
        const recentSongs = getRecentSongs()
        setSongs(recentSongs)
      } catch (error) {
        console.error("加载最近播放失败:", error)
        toast.error("加载最近播放失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentSongs()
  }, [])

  // 根据当前标签过滤歌曲
  const filteredSongs = songs.filter((song) =>
    activeTab === "music" ? song.source !== "audiobook" : song.source === "audiobook",
  )

  // 处理歌曲点击
  const handleSongClick = (song: Song) => {
    playSong(song)
  }

  // 清空历史记录
  const handleClearHistory = () => {
    if (!confirm("确定要清空最近播放记录吗？")) {
      return
    }

    clearRecentSongs()
    setSongs([])
    toast.success("已清空最近播放记录")
  }

  // 处理标签切换
  const handleTabChange = (value: string) => {
    setActiveTab(value as "music" | "audiobook")
  }

  // 计算音乐和有声书的数量
  const musicCount = songs.filter((song) => song.source !== "audiobook").length
  const audiobookCount = songs.filter((song) => song.source === "audiobook").length

  // 右侧内容
  const headerRightContent = (
    <>
      {songs.length > 0 && (
        <Button variant="ghost" size="sm" onClick={handleClearHistory}>
          <Trash2 className="h-4 w-4 mr-1" />
          清空
        </Button>
      )}
    </>
  )

  return (
    <div className="min-h-screen pb-20 pt-14">
      {/* 使用共用的PageHeader组件 */}
      <PageHeader title="最近播放" onBack={onBack} rightContent={headerRightContent} />

      {/* 内容区域 */}
      <div className="px-4 py-4">
        {/* 顶部信息 */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-lg bg-green-500 flex items-center justify-center">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">最近播放</h2>
            <p className="text-gray-400 text-sm">
              {activeTab === "music" ? `${musicCount} 首音乐` : `${audiobookCount} 本有声书`}
            </p>
          </div>
        </div>

        {/* 标签切换 */}
        <Tabs defaultValue="music" value={activeTab} onValueChange={handleTabChange} className="mb-6">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="music" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              <span>音乐 ({musicCount})</span>
            </TabsTrigger>
            <TabsTrigger value="audiobook" className="flex items-center gap-2">
              <Headphones className="h-4 w-4" />
              <span>有声书 ({audiobookCount})</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* 歌曲列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : filteredSongs.length > 0 ? (
          <div className="space-y-2">
            {filteredSongs.map((song) => (
              <div key={song.id} onClick={() => handleSongClick(song)}>
                <SongCard song={song} layout="list" />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Clock className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-400 mb-2">
              {activeTab === "music" ? "还没有最近播放的音乐" : "还没有最近播放的有声书"}
            </p>
            <p className="text-gray-500 text-sm">
              {activeTab === "music"
                ? "播放音乐后，这里会显示您最近播放的歌曲"
                : "播放有声书后，这里会显示您最近收听的内容"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
