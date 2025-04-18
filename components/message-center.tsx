"use client"

import { useState, useEffect, useRef } from "react"
import { Search, MoreVertical, ChevronRight, Mail } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import MessageDetail from "@/components/message-detail"
import { MessageCenterFooter } from "@/components/message-center-footer"
import { messageApi, type Message } from "@/lib/mock-api"
import toast from "react-hot-toast"
import { PageHeader } from "@/components/page-header"
import { useAuth } from "@/context/auth-context"

interface MessageCenterProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function MessageCenter({ onBack, setHideNavigation }: MessageCenterProps) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [activeTab, setActiveTab] = useState("all")

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

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async (forceRefresh = false) => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      // Use the forceRefresh parameter to decide whether to use cache
      const response = await messageApi.getMessages(user.id, "official", forceRefresh)
      if (response.success && response.data) {
        setMessages(response.data)
      } else {
        toast.error(response.error || "获取消息失败")
      }
    } catch (error) {
      console.error("获取消息失败:", error)
      toast.error("获取消息失败")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing || !user?.id) return

    setIsRefreshing(true)
    try {
      // Force refresh to bypass cache
      await fetchMessages(true)
      toast.success("刷新成功")
    } catch (error) {
      console.error("刷新失败:", error)
      toast.error("刷新失败")
    } finally {
      setIsRefreshing(false)
    }
  }

  const { pullToRefreshProps } = usePullToRefresh({
    onRefresh: handleRefresh,
    isRefreshing,
  })

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message)
  }

  const handleBackFromDetail = () => {
    setSelectedMessage(null)
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
  }

  const filteredMessages = messages.filter((message) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !message.isRead
    if (activeTab === "system") return message.type === "system"
    if (activeTab === "personal") return message.type === "personal"
    return true
  })

  if (selectedMessage) {
    return <MessageDetail message={selectedMessage} onBack={handleBackFromDetail} />
  }

  // 右侧内容
  const headerRightContent = (
    <>
      <Search className="h-5 w-5 text-white" />
      <MoreVertical className="h-5 w-5 text-white" />
    </>
  )

  return (
    <div className="min-h-screen pb-16 pt-14" {...pullToRefreshProps} >
      {/* 使用共用的PageHeader组件 */}
      <PageHeader title="消息中心" onBack={onBack} rightContent={headerRightContent} />

      {/* 标签栏 */}
      <div className="flex px-4 py-2 border-b border-gray-800">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === "all" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-400"}`}
          onClick={() => handleTabChange("all")}
        >
          全部
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === "unread" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-400"}`}
          onClick={() => handleTabChange("unread")}
        >
          未读
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === "system" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-400"}`}
          onClick={() => handleTabChange("system")}
        >
          系统
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === "personal" ? "text-amber-500 border-b-2 border-amber-500" : "text-gray-400"}`}
          onClick={() => handleTabChange("personal")}
        >
          私信
        </button>
      </div>

      {/* 消息列表 */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner className="h-8 w-8" />
        </div>
      ) : filteredMessages.length > 0 ? (
        <div className="px-4 py-2 space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className="flex items-center py-3 border-b border-gray-800"
              onClick={() => handleMessageClick(message)}
            >
              <div className="relative">
                {message.type === "system" ? (
                  <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    <img
                      src={message.sender?.avatar || "/placeholder.svg"}
                      alt={message.sender?.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!message.isRead && <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full"></div>}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex justify-between">
                  <h3 className="text-white text-sm font-medium">
                    {message.type === "system" ? "系统通知" : message.sender?.name}
                  </h3>
                  <span className="text-gray-400 text-xs">{message.time}</span>
                </div>
                <p className="text-gray-400 text-xs mt-1 line-clamp-1">{message.content}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400 ml-2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-400">
            暂无
            {activeTab === "unread" ? "未读" : activeTab === "system" ? "系统" : activeTab === "personal" ? "私信" : ""}
            消息
          </p>
        </div>
      )}

      <MessageCenterFooter />
    </div>
  )
}
