"use client"

import type React from "react"

import { useState } from "react"
import type { Song } from "@/types/song"
import { useMusic } from "@/context/music-context"
import { Button } from "@/components/ui/button"
import { Play, Plus, Heart } from "lucide-react"
import { formatTime } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { isSongLiked, addLikedSong, removeLikedSong } from "@/lib/user-music-storage"

interface SongCardProps {
  song: Song
  layout?: "grid" | "list"
  className?: string
}

export function SongCard({ song, layout = "grid", className = "" }: SongCardProps) {
  const { playSong, addToQueue, currentSong } = useMusic()
  const [imageLoaded, setImageLoaded] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isLiked, setIsLiked] = useState(() => isSongLiked(song.id))

  const isCurrentSong = currentSong?.id === song.id

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 添加点击动画效果
    const element = e.currentTarget as HTMLElement
    element.classList.add("scale-90")
    setTimeout(() => {
      element.classList.remove("scale-90")
      playSong(song) // 这会自动打开播放详情页
    }, 150)
  }

  const handleAddToQueueClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 添加点击动画效果
    const element = e.currentTarget as HTMLElement
    element.classList.add("scale-90")
    setTimeout(() => {
      element.classList.remove("scale-90")
      addToQueue(song)
    }, 150)
  }

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // 添加点击动画效果
    const element = e.currentTarget as HTMLElement
    element.classList.add("scale-90")
    setTimeout(() => {
      element.classList.remove("scale-90")

      // 切换喜欢状态
      const newLikedStatus = !isLiked
      setIsLiked(newLikedStatus)

      if (newLikedStatus) {
        addLikedSong(song)
      } else {
        removeLikedSong(song.id)
      }
    }, 150)
  }

  const handleTouchStart = () => {
    setIsPressed(true)
  }

  const handleTouchEnd = () => {
    setIsPressed(false)
  }

  const handleCardClick = () => {
    playSong(song)
  }

  if (layout === "list") {
    return (
      <div
        className={cn(
          "flex items-center p-3 rounded-lg transition-all duration-300",
          isCurrentSong ? "bg-muted" : "active:bg-muted/70",
          isPressed ? "bg-muted/70 scale-98" : "",
          "transform active:scale-[0.99]",
          className,
        )}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleCardClick}
      >
        <div className="w-12 h-12 rounded overflow-hidden bg-muted/50 relative">
          <img
            src={song.cover || "/placeholder.svg"}
            alt={song.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-300",
              imageLoaded ? "opacity-100" : "opacity-0",
              "scale-100",
            )}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
          />
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <h3 className="text-sm font-medium truncate">{song.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
        </div>
        <div className="text-xs text-muted-foreground mr-3">{formatTime(song.duration)}</div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-transform active:scale-95"
            onClick={handlePlayClick}
          >
            <Play className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-transform active:scale-95"
            onClick={handleLikeClick}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-transform active:scale-95"
            onClick={handleAddToQueueClick}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn("group relative transition-all duration-300", "active:scale-[0.98]")}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onClick={handleCardClick}
    >
      <div
        className={cn(
          "aspect-square overflow-hidden rounded-md bg-muted/50",
          isPressed ? "scale-95" : "",
          "transition-all duration-300",
        )}
      >
        <img
          src={song.cover || "/placeholder.svg"}
          alt={song.title}
          className={cn(
            "object-cover w-full h-full transition-all duration-500",
            "",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
        />
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 bg-black/50 backdrop-blur-sm rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleLikeClick}
          >
            <Heart className={cn("h-4 w-4", isLiked && "fill-red-500 text-red-500")} />
          </Button>
        </div>
      </div>
      <div className="mt-2">
        <h3 className="text-sm font-medium truncate">{song.title}</h3>
        <p className="text-xs text-muted-foreground truncate">{song.artist}</p>
      </div>
    </div>
  )
}
