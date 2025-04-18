"use client"

import type React from "react"
import { MusicProvider } from "@/context/music-context"
import { AuthProvider } from "@/context/auth-context"
 import { useEffect } from "react"
import { Toaster } from "react-hot-toast"

// 全局音频元素
const GlobalAudio = () => {
  return <audio id="global-audio" style={{ display: "none" }} />
}

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // 在客户端组件中处理触摸事件
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault() // 阻止多指触控（如捏合缩放）
      }
    }

    document.addEventListener("touchstart", handleTouchStart, { passive: false })

    return () => {
      document.removeEventListener("touchstart", handleTouchStart)
    }
  }, [])

  return (
    <>
      <AuthProvider>
        <MusicProvider>
          {children}
          <GlobalAudio />
         </MusicProvider>
      </AuthProvider>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: "8px",
          },
          success: {
            iconTheme: {
              primary: "#4ADE80",
              secondary: "#000",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#000",
            },
          },
        }}
      />
    </>
  )
}
