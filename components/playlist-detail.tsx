"use client"

import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { Heart, Share2, Play, Download, MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMusic } from "@/context/music-context"
import { cn } from "@/lib/utils"
import type { Song } from "@/types/song"
import { PageHeader } from "@/components/page-header"
import type React from "react"

 
// Update the PlaylistDetailProps interface to include setHideNavigation
interface PlaylistDetailProps {
  id: string
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function PlaylistDetail({ id, onBack, setHideNavigation }: PlaylistDetailProps) {
  const { playSong } = useMusic()
  const [playlist, setPlaylist] = useState<{
    id: string
    title: string
    cover: string
    creator: {
      name: string
      avatar: string
    }
    songCount: number
    songs: Song[]
  } | null>(null)
  
  const [isFavorite, setIsFavorite] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  // 组件挂载后标记为已挂载状态，避免SSR不匹配
  useEffect(() => {
    setIsMounted(true)
  }, [])

 

  // Hide navigation when this component mounts
  useEffect(() => {
    if (setHideNavigation) {
      setHideNavigation(true)
    }
  
    // Show navigation again when component unmounts
    return () => {
      if (setHideNavigation) {
        setHideNavigation(false)
      }
    }
  }, [setHideNavigation, id])

  // Mock data for special playlists
  const mockFavorites: Song[] = [
    {
      id: "fav1",
      title: "Favorite Song 1",
      artist: "Artist A",
      cover: "/abstract-soundscape.png",
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
      duration: 200,
      source: "qq" as const,
    },
    {
      id: "fav2",
      title: "Favorite Song 2",
      artist: "Artist B",
      cover: "/abstract-soundscape.png",
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
      duration: 220,
      source: "qq" as const,
    },
  ]

  const mockHistory: Song[] = [
    {
      id: "hist1",
      title: "History Song 1",
      artist: "Artist C",
      cover: "/abstract-soundscape.png",
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
      duration: 190,
      source: "qq" as const,
    },
    {
      id: "hist2",
      title: "History Song 2",
      artist: "Artist D",
      cover: "/abstract-soundscape.png",
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
      duration: 210,
      source: "qq" as const,
    },
  ]

  const mockLocalMusic: Song[] = [
    {
      id: "local1",
      title: "Local Song 1",
      artist: "Artist E",
      cover: "/vibrant-city-sounds.png",
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
      duration: 180,
      source: "qq" as const,
    },
    {
      id: "local2",
      title: "Local Song 2",
      artist: "Artist F",
      cover: "/vibrant-city-sounds.png",
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
      duration: 230,
      source: "qq" as const,
    },
  ]

  useEffect(() => {
    const fetchPlaylist = async () => {
      
      try {

        // 处理特殊歌单类型
        if (id === "favorites") {
          // 喜欢的歌曲
          setPlaylist({
            id: "favorites",
            title: "我喜欢的音乐",
            cover: "/abstract-soundscape.png",
            creator: {
              name: "有干劲的小灰灰",
              avatar: "/profile-avatar.png",
            },
            songCount: mockFavorites.length,
            songs: mockFavorites,
          })
        } else if (id === "recent") {
          // 最近播放
          setPlaylist({
            id: "recent",
            title: "最近播放",
            cover: "/abstract-soundscape.png",
            creator: {
              name: "有干劲的小灰灰",
              avatar: "/profile-avatar.png",
            },
            songCount: mockHistory.length,
            songs: mockHistory,
          })
        } else if (id === "local") {
          // 本地音乐
          setPlaylist({
            id: "local",
            title: "本地音乐",
            cover: "/vibrant-city-sounds.png",
            creator: {
              name: "有干劲的小灰灰",
              avatar: "/profile-avatar.png",
            },
            songCount: mockLocalMusic.length,
            songs: mockLocalMusic,
          })
        } else {
          // 模拟获取歌单详情
          const mockPlaylist = {
            id,
            title:
              id === "atmosphere-rnb"
                ? "氛围R&B | 氤氲水汽 谁能拒绝耳畔的温"
                : id === "nightclub"
                  ? "夜店"
                  : `歌单 ${id}`,
            cover:
              id === "atmosphere-rnb"
                ? "/vibrant-nightclub-scene.png"
                : id === "nightclub"
                  ? "/vibrant-nightclub-scene.png"
                  : `/placeholder.svg?height=400&width=400&query=playlist+cover+${id}`,
            creator: {
              name: "有干劲的小灰灰",
              avatar: "/profile-avatar.png",
            },
            songCount: 70,
            songs: [
              {
                id: "song1",
                title: "Tk Ur Time (Explicit)",
                artist: "Haley Smalls",
                cover: "/vibrant-nightclub-scene.png",
                url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
                duration: 187,
                source: "qq" as const,
              },
              {
                id: "song2",
                title: "All Mine (Explicit)",
                artist: "Plaza",
                cover: "/abstract-mine-concept.png",
                url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
                duration: 204,
                source: "qq" as const,
              },
              {
                id: "song3",
                title: "Angels",
                artist: "Tinashe&Kaash Paige",
                cover: "/ethereal-guardian.png",
                url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
                duration: 195,
                source: "qq" as const,
              },
              {
                id: "song4",
                title: "What If",
                artist: "Amber Mark",
                cover: "/abstract-geometric-shapes.png",
                url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
                duration: 212,
                source: "qq" as const,
              },
              {
                id: "song5",
                title: "What It Is",
                artist: "Doechii",
                cover: "/protective-covering.png",
                url: "http://music.163.com/song/media/outer/url?id=447925558.mp3",
                duration: 178,
                source: "qq" as const,
              },
            ],
          }

          setPlaylist(mockPlaylist)
        }
      } catch (error) {
        console.error("获取歌单详情失败:", error)
      } 
    }

    fetchPlaylist()
  }, [id])

  const handlePlaySong = (song: Song) => {
    playSong(song)
  }

  const handlePlayAll = () => {
    if (playlist && playlist.songs.length > 0) {
      playSong(playlist.songs[0])
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
  }

 

  if (!playlist) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-lg text-gray-400">歌单不存在或已被删除</p>
        <Button onClick={onBack} variant="link" className="mt-4">
          返回
        </Button>
      </div>
    )
  }

  // 确保只在客户端渲染完整内容
  if (!isMounted) {
    return <div className="h-screen bg-black"></div>
  }

  return (
    <div 
      className="pb-24 pt-14 overflow-y-auto h-full"
    >
      {/* 使用共用的PageHeader组件 */}
      <PageHeader 
        title={playlist.title} 
        onBack={onBack} 
      />

      {/* 歌单信息 */}
      <div className="px-4 pb-6">
        <div className="flex">
          <div className="w-[120px] h-[120px] rounded-md overflow-hidden">
            <img
              src={playlist.cover || "/placeholder.svg"}
              alt={playlist.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 flex flex-col items-end justify-between">
            <div
              className={cn("w-14 h-14 rounded-full flex items-center justify-center", "bg-black/30 backdrop-blur-sm")}
              onClick={toggleFavorite}
            >
              <Heart className={cn("h-6 w-6", isFavorite ? "fill-white text-white" : "text-white")} />
              <span className="text-xs text-white mt-1 block text-center">收藏</span>
            </div>

            <div
              className={cn("w-14 h-14 rounded-full flex items-center justify-center", "bg-black/30 backdrop-blur-sm")}
            >
              <Share2 className="h-6 w-6 text-white" />
              <span className="text-xs text-white mt-1 block text-center">分享</span>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mt-4">{playlist.title}</h1>

        <div className="flex items-center mt-3">
          <div className="w-6 h-6 rounded-full overflow-hidden">
            <img
              src={playlist.creator.avatar || "/placeholder.svg"}
              alt={playlist.creator.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-sm text-gray-300 ml-2">{playlist.creator.name}</span>
        </div>
      </div>

      {/* 播放全部按钮 */}
      <div className="px-4 mb-4">
        <Button
          onClick={handlePlayAll}
          className="bg-[#3e3e3e] hover:bg-[#4a4a4a] text-white rounded-full w-auto h-10 px-6"
        >
          <Play className="h-4 w-4 mr-2 fill-white" />
          播放全部·{playlist.songCount}首
        </Button>
      </div>

      {/* 歌曲列表 */}
      <div className="px-4">
        {playlist.songs.map((song, index) => (
          <div
            key={song.id}
            className="flex items-center py-3 border-b border-gray-800"
            onClick={() => handlePlaySong(song)}
          >
            <div className="w-12 h-12 rounded overflow-hidden">
              <img src={song.cover || "/placeholder.svg"} alt={song.title} className="w-full h-full object-cover" />
            </div>

            <div className="ml-3 flex-1">
              <h3 className="text-white text-base font-medium">{song.title}</h3>
              <p className="text-gray-400 text-sm">{song.artist}</p>
            </div>

            <div className="flex items-center">
              <Button variant="ghost" size="icon" className="text-gray-400">
                <Download className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
