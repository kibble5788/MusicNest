"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { X, Menu, Loader2 } from "lucide-react"
import { useMusic } from "@/context/music-context"
import type { Song } from "@/types/song"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils"
import { mockPlaylistData } from "@/lib/mock-playlist-data"

interface PlaylistDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export function PlaylistDrawer({ isOpen, onClose }: PlaylistDrawerProps) {
  const { queue, currentSong, playSong, removeFromQueue } = useMusic()
  const drawerRef = useRef<HTMLDivElement>(null)
  const [playlistSongs, setPlaylistSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Fetch mock playlist data
  useEffect(() => {
    if (isOpen) {
      const fetchPlaylist = async () => {
        setIsLoading(true)
        try {
          const data = await mockPlaylistData()
          setPlaylistSongs(data)
        } catch (error) {
          console.error("Failed to fetch playlist:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchPlaylist()
    }
  }, [isOpen])

  // Handle animation when opening/closing
  useEffect(() => {
    const drawer = drawerRef.current
    if (!drawer) return

    if (isOpen) {
      // Start from below the screen
      drawer.style.transform = "translateY(100%)"

      // Force a reflow to ensure the initial state is applied
      void drawer.offsetHeight

      // Animate up
      drawer.style.transform = "translateY(0)"
    } else {
      // Animate down
      drawer.style.transform = "translateY(100%)"
    }
  }, [isOpen])

  // Combine current song, queue and playlist songs for display
  const allSongs = [
    ...(currentSong ? [currentSong] : []),
    ...queue,
    ...playlistSongs.filter(
      (song) => !currentSong || (song.id !== currentSong.id && !queue.some((queueSong) => queueSong.id === song.id)),
    ),
  ]

  const handleSongClick = (song: Song) => {
    playSong(song)
  }

  const handleRemoveSong = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation()
    removeFromQueue(songId)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        ref={drawerRef}
        className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-xl min-h-[33vh] max-h-[90vh] overflow-hidden flex flex-col"
        style={{ transition: "transform 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#1a1a1a] z-10 p-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-xl font-bold">播放列表</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 pb-safe">
            {allSongs.length > 0 ? (
              allSongs.map((song, index) => (
                <div
                  key={`${song.id}-${index}`}
                  className={cn(
                    "flex items-center p-4 border-b border-gray-800",
                    currentSong?.id === song.id && "bg-gray-800/30",
                  )}
                  onClick={() => handleSongClick(song)}
                >
                  {currentSong?.id === song.id && (
                    <div className="w-5 flex justify-center mr-2">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded overflow-hidden mr-3">
                    <img
                      src={song.cover || "/placeholder.svg?height=100&width=100&query=song+cover"}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white text-sm font-medium truncate">{song.title}</h3>
                    <p className="text-gray-400 text-xs truncate">{song.artist}</p>
                  </div>
                  <div className="text-gray-400 text-xs mr-3">{formatTime(song.duration)}</div>
                  <div className="flex items-center">
                    {currentSong?.id !== song.id && (
                      <button className="p-2 text-gray-400" onClick={(e) => handleRemoveSong(e, song.id)}>
                        <X className="h-5 w-5" />
                      </button>
                    )}
                    <button className="p-2 text-gray-400">
                      <Menu className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-400">
                <p>播放列表为空</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
