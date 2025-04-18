"use client"

import { useState, useEffect } from "react"
import { getLikedSongs, removeLikedSong } from "@/lib/user-music-storage"
import { useMusic } from "@/context/music-context"
import { SongCard } from "@/components/song-card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Heart, Trash2, Music, Headphones } from "lucide-react"
import type { Song } from "@/types/song"
import toast from "react-hot-toast"

interface LikedSongsProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function LikedSongs({ onBack, setHideNavigation }: LikedSongsProps) {
  const { playSong } = useMusic()
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set())
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

  // 加载喜欢的歌曲
  useEffect(() => {
    const loadLikedSongs = () => {
      setIsLoading(true)
      try {
        const likedSongs = getLikedSongs()
        setSongs(likedSongs)
      } catch (error) {
        console.error("加载喜欢的���曲失败:", error)
        toast.error("加载喜欢的歌曲失败")
      } finally {
        setIsLoading(false)
      }
    }

    loadLikedSongs()
  }, [])

  // 根据当前标签过滤歌曲
  const filteredSongs = songs.filter((song) =>
    activeTab === "music" ? song.source !== "audiobook" : song.source === "audiobook",
  )

  // 处理歌曲点击
  const handleSongClick = (song: Song) => {
    if (isEditing) {
      // 在编辑模式下，点击歌曲会选中/取消选中
      const newSelected = new Set(selectedSongs)
      if (newSelected.has(song.id)) {
        newSelected.delete(song.id)
      } else {
        newSelected.add(song.id)
      }
      setSelectedSongs(newSelected)
    } else {
      // 正常模式下，点击歌曲会播放
      playSong(song)
    }
  }

  // 处理删除选中的歌曲
  const handleDeleteSelected = () => {
    if (selectedSongs.size === 0) {
      toast.error("请先选择要删除的歌曲")
      return
    }

    // 确认删除
    if (!confirm(`确定要从喜欢列表中移除 ${selectedSongs.size} 首歌曲吗？`)) {
      return
    }

    // 删除选中的歌曲
    selectedSongs.forEach((songId) => {
      removeLikedSong(songId)
    })

    // 更新列表
    setSongs((prevSongs) => prevSongs.filter((song) => !selectedSongs.has(song.id)))

    // 清空选中状态
    setSelectedSongs(new Set())

    // 退出编辑模式
    setIsEditing(false)

    toast.success(`已从喜欢列表中移除 ${selectedSongs.size} 首歌曲`)
  }

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditing(!isEditing)
    setSelectedSongs(new Set())
  }

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedSongs.size === filteredSongs.length) {
      // 如果已全选，则取消全选
      setSelectedSongs(new Set())
    } else {
      // 否则全选当前标签下的所有歌曲
      setSelectedSongs(new Set(filteredSongs.map((song) => song.id)))
    }
  }

  // 处理标签切换
  const handleTabChange = (value: string) => {
    setActiveTab(value as "music" | "audiobook")
    // 切换标签时退出编辑模式并清空选择
    setIsEditing(false)
    setSelectedSongs(new Set())
  }

  // 计算音乐和有声书的数量
  const musicCount = songs.filter((song) => song.source !== "audiobook").length
  const audiobookCount = songs.filter((song) => song.source === "audiobook").length

  // 右侧内容
  const headerRightContent = (
    <>
      {isEditing ? (
        <Button variant="ghost" size="sm" onClick={toggleEditMode}>
          取消
        </Button>
      ) : (
        <Button variant="ghost" size="sm" onClick={toggleEditMode}>
          编辑
        </Button>
      )}
    </>
  )

  return (
    <div className="min-h-screen pb-20 pt-14">
      {/* 使用共用的PageHeader组件 */}
      <PageHeader title="我喜欢的内容" onBack={onBack} rightContent={headerRightContent} />

      {/* 内容区域 */}
      <div className="px-4 py-4">
        {/* 顶部信息 */}
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 rounded-lg bg-pink-500 flex items-center justify-center">
            <Heart className="h-8 w-8 text-white" />
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-bold">我喜欢的内容</h2>
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

        {/* 编辑模式工具栏 */}
        {isEditing && (
          <div className="flex justify-between items-center mb-4 bg-gray-800/50 p-3 rounded-lg">
            <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
              {selectedSongs.size === filteredSongs.length ? "取消全选" : "全选"}
            </Button>
            <span className="text-sm text-gray-400">已选择 {selectedSongs.size} 首</span>
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={selectedSongs.size === 0}>
              <Trash2 className="h-4 w-4 mr-1" />
              删除
            </Button>
          </div>
        )}

        {/* 歌曲列表 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner className="h-8 w-8" />
          </div>
        ) : filteredSongs.length > 0 ? (
          <div className="space-y-2">
            {filteredSongs.map((song) => (
              <div key={song.id} className="relative" onClick={() => handleSongClick(song)}>
                {isEditing && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10">
                    <div
                      className={`w-5 h-5 rounded-full border ${
                        selectedSongs.has(song.id) ? "bg-pink-500 border-pink-500" : "border-gray-400"
                      } flex items-center justify-center`}
                    >
                      {selectedSongs.has(song.id) && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                  </div>
                )}
                <SongCard song={song} layout="list" className={isEditing ? "pl-8" : ""} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mb-4" />
            <p className="text-gray-400 mb-2">{activeTab === "music" ? "还没有喜欢的音乐" : "还没有喜欢的有声书"}</p>
            <p className="text-gray-500 text-sm">
              {activeTab === "music"
                ? "在播放音乐时点击心形图标，将歌曲添加到喜欢列表"
                : "在播放有声书时点击心形图标，将有声书添加到喜欢列表"}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
