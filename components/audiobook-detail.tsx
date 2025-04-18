"use client"

import { useState, useEffect } from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Play, Pause, BookOpen, Star, Share2, Download } from "lucide-react"
import toast from "react-hot-toast"

interface AudiobookDetailProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
  audiobookId: string
}

export default function AudiobookDetail({ onBack, setHideNavigation, audiobookId }: AudiobookDetailProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [audiobook, setAudiobook] = useState<{
    id: string
    title: string
    author: string
    narrator: string
    cover: string
    description: string
    duration: number
    progress: number
    rating: number
    chapters: { id: string; title: string; duration: number }[]
  } | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

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

  // 加载有声书详情
  useEffect(() => {
    const fetchAudiobookDetail = async () => {
      setIsLoading(true)
      try {
        // 模拟API请求
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // 模拟有声书详情数据
        const mockAudiobook = {
          id: audiobookId,
          title: audiobookId === "audiobook-1" ? "三体" : audiobookId === "audiobook-2" ? "活着" : "解忧杂货店",
          author: audiobookId === "audiobook-1" ? "刘慈欣" : audiobookId === "audiobook-2" ? "余华" : "东野圭吾",
          narrator: "专业播音员",
          cover: `/placeholder.svg?height=300&width=300&query=audiobook+${audiobookId}`,
          description: "这是一部非常精彩的有声书，由专业播音员朗读，音质清晰，表现力丰富。",
          duration: 36000,
          progress: 0.45,
          rating: 4.8,
          chapters: [
            { id: "ch1", title: "第一章 开始", duration: 1800 },
            { id: "ch2", title: "第二章 发展", duration: 2100 },
            { id: "ch3", title: "第三章 高潮", duration: 1950 },
            { id: "ch4", title: "第四章 结局", duration: 2250 },
          ],
        }

        setAudiobook(mockAudiobook)
      } catch (error) {
        console.error("获取有声书详情失败:", error)
        toast.error("获取有声书详情失败")
      } finally {
        setIsLoading(false)
      }
    }

    fetchAudiobookDetail()
  }, [audiobookId])

  // 播放/暂停
  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    toast.success(isPlaying ? "已暂停播放" : "开始播放")
  }

  // 格式化时间
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}小时${minutes}分钟`
    }
    return `${minutes}分钟`
  }

  // 右侧内容
  const headerRightContent = (
    <>
      <Share2 className="h-5 w-5 text-white" />
    </>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner className="h-12 w-12" />
      </div>
    )
  }

  if (!audiobook) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="text-lg text-gray-400">有声书不存在或已被删除</p>
        <Button onClick={onBack} variant="link" className="mt-4">
          返回
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20 pt-14">
      {/* 使用共用的PageHeader组件 */}
      <PageHeader title="有声书详情" onBack={onBack} rightContent={headerRightContent} />

      {/* 有声书信息 */}
      <div className="px-4 py-4">
        <div className="flex items-start">
          <div className="w-32 h-32 rounded-lg overflow-hidden">
            <img
              src={audiobook.cover || "/placeholder.svg"}
              alt={audiobook.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-4 flex-1">
            <h1 className="text-xl font-bold">{audiobook.title}</h1>
            <p className="text-gray-400 text-sm mt-1">
              {audiobook.author} · {audiobook.narrator}
            </p>

            <div className="flex items-center mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.round(audiobook.rating) ? "text-amber-500 fill-amber-500" : "text-gray-400"}`}
                  />
                ))}
              </div>
              <span className="text-amber-500 ml-1">{audiobook.rating}</span>
            </div>

            <div className="flex items-center mt-4">
              <Button onClick={togglePlay} className="bg-emerald-500 hover:bg-emerald-600 text-black rounded-full">
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" /> 暂停
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" /> 播放
                  </>
                )}
              </Button>

              <Button variant="outline" className="ml-2 rounded-full">
                <Download className="h-4 w-4 mr-1" /> 下载
              </Button>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-400 mb-1">
            <span>已完成 {Math.round(audiobook.progress * 100)}%</span>
            <span>总时长 {formatDuration(audiobook.duration)}</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500" style={{ width: `${audiobook.progress * 100}%` }}></div>
          </div>
        </div>

        {/* 简介 */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">简介</h2>
          <p className="text-gray-300 text-sm">{audiobook.description}</p>
        </div>

        {/* 章节列表 */}
        <div className="mt-6">
          <h2 className="text-lg font-medium mb-2">章节列表</h2>
          <div className="space-y-3">
            {audiobook.chapters.map((chapter, index) => (
              <div
                key={chapter.id}
                className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                onClick={() => toast.success(`播放章节: ${chapter.title}`)}
              >
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-emerald-500 mr-2" />
                  <div>
                    <h3 className="text-sm font-medium">{chapter.title}</h3>
                    <p className="text-xs text-gray-400">{formatDuration(chapter.duration)}</p>
                  </div>
                </div>
                <Play className="h-4 w-4 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
