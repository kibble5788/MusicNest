"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"

// Define the ImportRecord interface
interface ImportRecord {
  id: string
  title: string
  cover: string
  songCount: number
  status: "completed" | "in-progress"
  source: string
  date: string
}

// Update the ImportHistoryProps interface to include setHideNavigation
interface ImportHistoryProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function ImportHistory({ onBack, setHideNavigation }: ImportHistoryProps) {
  const [activeTab, setActiveTab] = useState("completed")
  const [isClearing, setIsClearing] = useState(false)

  // Hide navigation when this component mounts
  useEffect(() => {
    if (setHideNavigation) {
      setHideNavigation(true)
    }
    // Remove the cleanup function since we're navigating back to ImportPlaylist
    // which also needs to hide the navigation
  }, [setHideNavigation])

  // Mock data for import records
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([
    {
      id: "1",
      title: "氛围R&B | 氤氲水汽, 谁能拒绝耳畔的温",
      cover: "/abstract-soundscape.png",
      songCount: 71,
      status: "completed",
      source: "网易云音乐",
      date: "2024-09-05",
    },
    {
      id: "2",
      title: "独享欧美Pop :耳机青年的深度陶醉",
      cover: "/vibrant-sunset-cityscape.png",
      songCount: 161,
      status: "completed",
      source: "QQ音乐",
      date: "2024-09-03",
    },
    {
      id: "3",
      title: "夜店",
      cover: "/vibrant-nightclub-scene.png",
      songCount: 45,
      status: "in-progress",
      source: "酷狗音乐",
      date: "2024-09-10",
    },
  ])

  const inProgressRecords = importRecords.filter((record) => record.status === "in-progress")
  const completedRecords = importRecords.filter((record) => record.status === "completed")

  const handleClearRecords = () => {
    if (!confirm("确定要清空所有导入记录吗？")) {
      return
    }

    setIsClearing(true)

    // Simulate API call
    setTimeout(() => {
      setImportRecords([])
      toast.success("导入记录已清空")
      setIsClearing(false)
    }, 800)
  }

  const handleRecordClick = (record: ImportRecord) => {
    // In a real app, this would navigate to the playlist detail
    toast.success(`查看歌单: ${record.title}`)
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex items-center justify-center p-4 relative">
          <button onClick={onBack} className="absolute left-4">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-medium">导入列表</h1>
        </div>
      </div>

      <div className="flex-1">
        {/* 标签页 */}
        <Tabs defaultValue="completed" onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center px-4 pt-4">
            <TabsList className="grid grid-cols-2 w-3/5">
              <TabsTrigger value="in-progress" className="data-[state=active]:text-white">
                进行中 {inProgressRecords.length}
              </TabsTrigger>
              <TabsTrigger value="completed" className="data-[state=active]:text-white">
                已完成 {completedRecords.length}
              </TabsTrigger>
            </TabsList>

            <button
              onClick={handleClearRecords}
              disabled={isClearing || importRecords.length === 0}
              className="flex items-center text-gray-400 disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              <span className="text-sm">清空记录</span>
            </button>
          </div>

          <TabsContent value="in-progress" className="mt-4">
            {inProgressRecords.length > 0 ? (
              <div className="space-y-4 px-4">
                {inProgressRecords.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center bg-gray-900/30 rounded-lg p-3"
                    onClick={() => handleRecordClick(record)}
                  >
                    <div className="w-16 h-16 rounded-md overflow-hidden">
                      <img
                        src={record.cover || "/placeholder.svg"}
                        alt={record.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-white text-sm font-medium line-clamp-2">{record.title}</h3>
                      <div className="flex items-center mt-1">
                        <div className="bg-emerald-500 h-1 rounded-full w-24 relative">
                          <div className="absolute top-0 left-0 h-full bg-emerald-300 rounded-full w-1/3 animate-pulse"></div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">导入中...</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 ml-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p>暂无进行中的导入任务</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-4">
            {completedRecords.length > 0 ? (
              <div className="space-y-4 px-4">
                {completedRecords.map((record) => (
                  <div key={record.id} className="flex items-center" onClick={() => handleRecordClick(record)}>
                    <div className="w-16 h-16 rounded-md overflow-hidden">
                      <img
                        src={record.cover || "/placeholder.svg"}
                        alt={record.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-white text-sm font-medium line-clamp-2">{record.title}</h3>
                      <p className="text-gray-400 text-xs">{record.songCount}首</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-500 ml-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p>暂无已完成的导入记录</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
