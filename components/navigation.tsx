"use client"

import { Music, Headphones, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useMusic } from "@/context/music-context"

// Update the NavigationProps interface to include a hideNavigation prop
interface NavigationProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  inPlayerUI?: boolean
  hideNavigation?: boolean
}

// Update the Navigation function to check for the hideNavigation prop
export function Navigation({ activeTab, setActiveTab, inPlayerUI = false, hideNavigation = false }: NavigationProps) {
  const { isPlaying, showPlayerUI, setShowPlayerUI, contentType } = useMusic()
  const [isTabSwitching, setIsTabSwitching] = useState(false)

  // Monitoring URL changes, update the currently active tab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "")
      if (hash && ["music", "audiobooks", "profile"].includes(hash)) {
        setActiveTab(hash)
      }
    }

    handleHashChange()
    window.addEventListener("hashchange", handleHashChange)
    return () => window.removeEventListener("hashchange", handleHashChange)
  }, [setActiveTab])

  const handleTabChange = (value: string) => {
    // First check if there is content of the corresponding type being played
    if (isPlaying) {
      // If the music button is clicked and music is currently playing, open the player UI
      if (value === "music" && contentType === "music") {
        setShowPlayerUI(true)
        return
      }

      // If the audiobook button is clicked and an audiobook is currently playing, open the player UI
      if (value === "audiobooks" && contentType === "audiobook") {
        setShowPlayerUI(true)
        return
      }
    }

    // If it's already the current tab and no corresponding content is playing, do nothing
    if (value === activeTab) {
      return
    }

    // If in the player UI, close it
    if (showPlayerUI) {
      setShowPlayerUI(false)
    }

    // Switch to the new tab
    setActiveTab(value)
    window.location.hash = value
  }

  // If in the player UI or hideNavigation is true, don't display the navigation bar
  if (inPlayerUI || hideNavigation) {
    return null
  }

  // Determine which button should rotate
  const shouldMusicRotate = isPlaying && contentType === "music" && !showPlayerUI
  const shouldAudiobooksRotate = isPlaying && contentType === "audiobook" && !showPlayerUI

  return (
    <div className={`${showPlayerUI ? "" : "fixed bottom-0 left-0 right-0 z-10 safe-area-bottom"}`}>
      <div className="mx-auto max-w-md px-4 pb-2">
        <div className="flex items-center justify-around bg-black/80 backdrop-blur-md rounded-full p-3 shadow-lg">
          <button
            onClick={() => handleTabChange("music")}
            className={`p-3 rounded-full transition-colors duration-300 ${activeTab === "music" ? "bg-amber-500 text-black" : "text-amber-500"} ${
              shouldMusicRotate ? "nav-button-rotating" : ""
            }`}
          >
            <Music className={`h-6 w-6 ${shouldMusicRotate ? "animate-spin-slow" : ""}`} />
          </button>
          <button
            onClick={() => handleTabChange("audiobooks")}
            className={`p-3 rounded-full transition-colors duration-300 ${activeTab === "audiobooks" ? "bg-amber-500 text-black" : "text-amber-500"} ${
              shouldAudiobooksRotate ? "nav-button-rotating" : ""
            }`}
          >
            <Headphones className={`h-6 w-6 ${shouldAudiobooksRotate ? "animate-spin-slow" : ""}`} />
          </button>
          <div className="relative">
            <button
              onClick={() => handleTabChange("profile")}
              className={`p-3 rounded-full transition-colors duration-300 ${activeTab === "profile" ? "bg-amber-500 text-black" : "text-amber-500"}`}
            >
              <User className="h-6 w-6" />
            </button>
            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
              2
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
