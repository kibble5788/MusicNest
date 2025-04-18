import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { MusicProvider } from "@/context/music-context"
import { AuthProvider } from "@/context/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NestMP3 - 音乐播放器",
  description: "一个聚合音乐搜索和播放的应用",
  viewport: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
    generator: 'v0.dev'
}

// 全局音频元素
const GlobalAudio = () => {
  return <audio id="global-audio" style={{ display: "none" }} />
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          <MusicProvider>
            {children}
            <GlobalAudio />
          </MusicProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
