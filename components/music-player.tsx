"use client"

import { useState, useEffect, useRef } from "react"
import { useMusic } from "@/context/music-context"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import {
  Heart,
  MessageSquare,
  RefreshCw,
  ListMusic,
  MoreVertical,
  ChevronLeft,
  AlertCircle,
  Pause,
  Play,
  ChevronRight,
} from "lucide-react"
import { formatTime } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { PlaylistDrawer } from "@/components/playlist-drawer"
import type { Song } from "@/types"
import React from "react"

// 创建一个全局audio元素，确保它不会被重新创建
let globalAudio: HTMLAudioElement | null = null

// 网易云音乐测试URL
const NETEASE_TEST_URL = "http://music.163.com/song/media/outer/url?id=447925558.mp3"

// 简单的动画函数，用于替代anime.js
const simpleAnimate = (
  element: HTMLElement | null,
  properties: Record<string, any>,
  duration = 300,
  easing = "ease",
  complete?: () => void,
) => {
  if (!element) return

  // 保存原始样式
  const originalTransition = element.style.transition

  // 设置过渡
  element.style.transition = `all ${duration}ms ${easing}`

  // 应用属性
  Object.entries(properties).forEach(([key, value]) => {
    if (key === "translateY") {
      element.style.transform = `translateY(${value})`
    } else if (key === "opacity") {
      element.style.opacity = value
    } else if (key === "scale") {
      const currentTransform = element.style.transform || ""
      if (currentTransform.includes("translateY")) {
        element.style.transform = `translateY(${currentTransform.match(/translateY$$([^)]+)$$/)?.[1] || "0"}) scale(${value})`
      } else {
        element.style.transform = `scale(${value})`
      }
    } else {
      ;(element.style as any)[key] = value
    }
  })

  // 动画完成后的回调
  setTimeout(() => {
    element.style.transition = originalTransition
    if (complete) complete()
  }, duration)
}

// Top section component with React.memo to prevent unnecessary re-renders
const TopSection = React.memo(
  ({
    closePlayerUI,
    title,
    currentSong,
    isPlaying,
  }: {
    closePlayerUI: () => void
    title: string
    currentSong: Song
    isPlaying: boolean
  }) => {
    return (
      <div className="bg-amber-500 h-[45%] p-6 relative overflow-hidden">
        <div className="flex items-center animate-fade-in">
          <Button
            variant="ghost"
            size="icon"
            onClick={closePlayerUI}
            className="text-black p-1 hover:bg-black/10 rounded-full"
          >
            <ChevronLeft className="h-16 w-16" />
          </Button>
          <h1 className="text-xl font-medium text-black ml-2">{title}</h1>
        </div>

        {/* 专辑封面 */}
        <div
          className={cn(
            "mt-8 mx-auto w-[80%] aspect-square rounded-lg overflow-hidden bg-amber-50 shadow-lg",
            "transition-all duration-500 ease-in-out animate-fade-in",
            isPlaying ? "shadow-amber-300/30 shadow-xl" : "",
            isPlaying ? "animate-spin-slow" : "",
          )}
        >
          <img
            src={currentSong.cover || `//y.qq.com/music/photo_new/T002R300x300M0000005aj2s2ffczl_1.jpg?max_age=2592000`}
            alt={currentSong.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    )
  },
)
TopSection.displayName = "TopSection"

export function MusicPlayer() {
  const {
    currentSong,
    isPlaying,
    queue,
    showPlayerUI,
    contentType, // 添加这一行
    pauseSong,
    resumeSong,
    nextSong,
    previousSong,
    setShowPlayerUI,
    toggleLike: toggleLikeContext,
  } = useMusic()

  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [animationState, setAnimationState] = useState<"entering" | "entered" | "exiting" | "exited">("entered")
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setContentType = () => {}

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const timeUpdateDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // 初始化全局audio元素
  useEffect(() => {
    if (!globalAudio) {
      globalAudio = new Audio()
      audioRef.current = globalAudio
    } else {
      audioRef.current = globalAudio
    }

    return () => {
      // 组件卸载时不销毁全局audio元素
    }
  }, [])

  // 处理音频元素事件
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => {
      if (!isDragging) {
        if (timeUpdateDebounceRef.current) {
          clearTimeout(timeUpdateDebounceRef.current)
        }

        timeUpdateDebounceRef.current = setTimeout(() => {
          setCurrentTime(audio.currentTime)
          timeUpdateDebounceRef.current = null
        }, 250) // 250ms防抖
      }
    }

    const updateDuration = () => setDuration(audio.duration)

    const handleEnded = () => nextSong()

    const handleError = (e: ErrorEvent) => {
      console.error("音频加载失败:", e)
      setAudioError(true)
      pauseSong()
      console.error("播放失败: 无法加载音频文件，可能是网络问题或音频资源不可用")
      // 简化的toast实现
      toast({
        title: "播放失败",
        description: "无法加载音频文件，可能是网络问题或音频资源不可用",
        variant: "destructive",
      })
    }

    audio.addEventListener("timeupdate", updateTime)
    audio.addEventListener("durationchange", updateDuration)
    audio.addEventListener("ended", handleEnded)
    audio.addEventListener("error", handleError as EventListener)

    return () => {
      audio.removeEventListener("timeupdate", updateTime)
      audio.removeEventListener("durationchange", updateDuration)
      audio.removeEventListener("ended", handleEnded)
      audio.removeEventListener("error", handleError as EventListener)
    }
  }, [nextSong, isDragging, pauseSong, currentTime])

  // 处理当前歌曲变化
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    // 重置错误状态
    setAudioError(false)

    try {
      // 使用网易云音乐URL或歌曲自身的URL
      audio.src = currentSong.url || NETEASE_TEST_URL

      // 确保在设置src后不立即调用play()，而是在下一个事件循环中调用
      if (isPlaying) {
        setTimeout(() => {
          if (audio && audio === audioRef.current) {
            const playPromise = audio.play()
            if (playPromise !== undefined) {
              playPromise.catch((err) => {
                console.error("播放失败:", err)
                setAudioError(true)
                pauseSong()
              })
            }
          }
        }, 100) // 给予更多时间加载
      }

      // 重置喜欢状态
      setIsLiked(false)
    } catch (err) {
      console.error("设置音频源失败:", err)
      setAudioError(true)
      pauseSong()
    }
  }, [currentSong, isPlaying, pauseSong])

  // 监听播放状态变化
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      try {
        const playPromise = audio.play()
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.error("播放失败:", err)
            setAudioError(true)
            pauseSong()
          })
        }
      } catch (err) {
        console.error("播放操作失败:", err)
        setAudioError(true)
        pauseSong()
      }
    } else {
      try {
        audio.pause()
      } catch (err) {
        console.error("暂停操作失败:", err)
      }
    }
  }, [isPlaying, pauseSong])

  // 处理播放器UI显示状态变化
  useEffect(() => {
    if (showPlayerUI) {
      // 打开播放器UI时的动画
      setAnimationState("entering")

      // 使用简单动画函数实现入场动画
      simpleAnimate(playerRef.current, { translateY: "0%", opacity: "1", scale: "1" }, 400, "ease-out", () =>
        setAnimationState("entered"),
      )
    } else {
      // 关闭播放器UI时的动画
      setAnimationState("exiting")

      simpleAnimate(playerRef.current, { translateY: "5%", opacity: "0", scale: "0.95" }, 300, "ease-in-out", () =>
        setAnimationState("exited"),
      )
    }
  }, [showPlayerUI])

  // 播放/暂停切换
  const handlePlayPause = () => {
    if (audioError) {
      console.error("无法播放: 音频资源可能不可用，请尝试其他歌曲")
      // 简化的toast实现
      toast({
        title: "无法播放",
        description: "音频资源可能不可用，请尝试其他歌曲",
        variant: "destructive",
      })
      return
    }

    if (isPlaying) {
      pauseSong()
    } else {
      resumeSong()
    }
  }

  // 时间进度条变化
  const handleTimeChange = (value: number[]) => {
    if (audioError) return

    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  // 开始拖动进度条
  const handleTimeChangeStart = () => {
    if (audioError) return
    setIsDragging(true)
  }

  // 结束拖动进度条
  const handleTimeChangeEnd = (value: number[]) => {
    if (audioError) return

    const audio = audioRef.current
    if (audio) {
      audio.currentTime = value[0]
    }
    setIsDragging(false)
  }

  // 关闭播放器UI
  const closePlayerUI = () => {
    // 根据内容类型确定目标页面
    const targetHash = contentType === "audiobook" ? "#audiobooks" : "#music"

    // 如果当前页面与目标页面不同，立即更新 hash
    if (window.location.hash !== targetHash) {
      window.location.hash = targetHash
    }

    // 然后开始关闭动画
    setAnimationState("exiting")

    simpleAnimate(playerRef.current, { translateY: "5%", opacity: "0", scale: "0.95" }, 300, "ease-in-out", () => {
      setShowPlayerUI(false)
      setAnimationState("exited")
    })
  }

  // 处理进度条点击
  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (audioError) return

    const audio = audioRef.current
    const progressBar = e.currentTarget
    if (!audio || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const offsetX = e.clientX - rect.left
    const newTime = (offsetX / rect.width) * duration

    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  // 切换喜欢状态
  const handleLikeToggle = () => {
    // 使用上下文中的 toggleLike 函数
    toggleLikeContext()
  }

  const handlePlaylistClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowPlaylistDrawer(true)
  }

  if (!currentSong) {
    return null
  }

  // 如果不显示播放器UI，不渲染UI部分，但保留audio元素的引用
  if (!showPlayerUI || animationState === "exited") {
    return null
  }

  // 计算进度百分比
  const progressPercentage = ((currentTime / (duration || 1)) * 100).toFixed(2)

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      ref={playerRef}
      style={{
        transform: "translateY(0%)",
        opacity: "1",
        transition: "all 400ms ease-out",
      }}
    >
      {/* 顶部区域 - 动态背景 */}
      <TopSection closePlayerUI={closePlayerUI} title="私人推荐" currentSong={currentSong} isPlaying={isPlaying} />

      {/* 底部区域 - 黑色背景 */}
      <div className="bg-black text-amber-500 p-6 h-[55%] flex flex-col">
        {/* 错误提示 */}
        {audioError && (
          <div className="mb-4 p-2 bg-red-900/30 rounded-md flex items-center animate-fade-in">
            <AlertCircle className="h-5 w-5 mr-2 text-red-500" />
            <span className="text-sm text-red-400">音频加载失败，可能是网络问题或资源不可用</span>
          </div>
        )}

        {/* 歌曲信息 */}
        <div className="mb-auto animate-fade-in delay-100">
          <h2 className="text-2xl font-bold mb-4">{currentSong.title}</h2>
          <h3 className="text-lg text-amber-500/80 mb-1">{currentSong.album || "星星照亮回家的路"}</h3>
          <p className="text-amber-500/70">{currentSong.artist}</p>
        </div>

        {/* 互动按钮 */}
        <div className="flex justify-around mb-8 animate-fade-in delay-200">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLikeToggle}
            className={`text-amber-500 ${isLiked ? "text-amber-400" : "text-amber-500/70"}`}
          >
            <Heart className={`h-10 w-10 ${isLiked ? "fill-amber-400" : ""}`} />
            <span className="ml-1 text-sm">1.5w</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-amber-500/70">
            <MessageSquare className="h-6 w-6" />
            <span className="ml-1 text-sm">38</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-amber-500/70">
            <RefreshCw className="h-6 w-6" />
            <span className="ml-1 text-sm">36</span>
          </Button>

          <Button variant="ghost" size="icon" className="text-amber-500/70" onClick={handlePlaylistClick}>
            <ListMusic className="h-6 w-6" />
          </Button>

          <Button variant="ghost" size="icon" className="text-amber-500/70">
            <MoreVertical className="h-6 w-6" />
          </Button>
        </div>

        {/* 进度条 */}
        <div className="mb-8 animate-fade-in delay-300">
          <div
            className="relative w-full h-1 bg-amber-500/30 rounded-full cursor-pointer"
            onClick={handleProgressBarClick}
          >
            <div
              className="absolute top-0 left-0 h-full bg-amber-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              onValueChange={handleTimeChange}
              onValueCommit={handleTimeChangeEnd}
              onPointerDown={handleTimeChangeStart}
              className="absolute top-0 left-0 w-full opacity-0"
            />
          </div>
          <div className="flex justify-between text-xs text-amber-500/70 mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* 播放控制按钮 */}
        <div className="mx-auto max-w-md px-4 pb-2 mb-4 animate-fade-in delay-500">
          <div className="flex items-center justify-center bg-black/90 backdrop-blur-md rounded-full p-3 shadow-lg">
            <button
              onClick={previousSong}
              className="p-3 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors mx-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <button
              onClick={handlePlayPause}
              className="p-3 rounded-full bg-amber-500 text-black hover:bg-amber-400 transition-colors"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
            </button>

            <button
              onClick={nextSong}
              className="p-3 rounded-full text-amber-500 hover:bg-amber-500/10 transition-colors mx-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Drawer */}
      <PlaylistDrawer isOpen={showPlaylistDrawer} onClose={() => setShowPlaylistDrawer(false)} />
    </div>
  )
}
