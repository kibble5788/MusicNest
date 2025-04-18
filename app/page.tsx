"use client"

import { Suspense, lazy, useState, useEffect } from "react"
import { MusicPlayer } from "@/components/music-player"
import { Navigation } from "@/components/navigation"
import { SkeletonProfilePage } from "@/components/skeletons/skeleton-profile-page"
import { DisableInteractions } from "@/components/disable-interactions"

// Lazy load module components
const Music = lazy(() => import("@/components/music"))
const Audiobooks = lazy(() => import("@/components/audiobooks"))
const MyProfile = lazy(() => import("@/components/my-profile"))

export default function Home() {
  const [activeTab, setActiveTab] = useState("music")
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [hideNavigation, setHideNavigation] = useState(false)

  // Preload all components to avoid delay when switching
  useEffect(() => {
    // Mark initial load as complete
    setIsInitialLoad(false)

    // Preload other components
    const preloadComponents = async () => {
      const importPromises = [
        import("@/components/music"),
        import("@/components/audiobooks"),
        import("@/components/my-profile"),
      ]

      await Promise.all(importPromises)
    }

    preloadComponents()

    // Check URL hash value, set initial tab
    const hash = window.location.hash.replace("#", "")
    if (hash && ["music", "audiobooks", "profile"].includes(hash)) {
      setActiveTab(hash)
    } else {
      // If there is no valid hash value, default to music and update URL
      window.location.hash = "music"
    }

    // 监听自定义导航事件
    const handleNavigationChange = (event: CustomEvent) => {
      if (event.detail && event.detail.tab) {
        setActiveTab(event.detail.tab)
      }
    }

    window.addEventListener("navigationChange", handleNavigationChange as EventListener)

    return () => {
      window.removeEventListener("navigationChange", handleNavigationChange as EventListener)
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col">
      <DisableInteractions />
      <div className="flex-1 overflow-hidden pb-24">
        {/* Music page */}
        {activeTab === "music" && (
          <div className="p-4">
            <Music setHideNavigation={setHideNavigation} />
          </div>
        )}

        {/* Audiobooks page */}
        {activeTab === "audiobooks" && (
          <div className="p-4">
            <Audiobooks setHideNavigation={setHideNavigation} />
          </div>
        )}

        {/* Profile page */}
        {activeTab === "profile" && (
          <div className="p-4">
            <Suspense fallback={<SkeletonProfilePage />}>
              <MyProfile setHideNavigation={setHideNavigation} />
            </Suspense>
          </div>
        )}
      </div>
      <MusicPlayer />
      {!hideNavigation && <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />}
    </main>
  )
}
