"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { messageApi } from "@/lib/mock-api"
import { useAuth } from "@/context/auth-context"
import toast from "react-hot-toast"
import { PageHeader } from "@/components/page-header"

interface MessageDetailProps {
  message: {
    id: string
    title: string
    date?: string
    content: any[]
    type: string
    sender?: {
      id: string
      name: string
      avatar?: string
    }
  }
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function MessageDetail({ message, onBack, ...props }: MessageDetailProps) {
  const { user } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (props.setHideNavigation) {
      props.setHideNavigation(true)
    }

    return () => {
      if (props.setHideNavigation) {
        props.setHideNavigation(false)
      }
    }
  }, [props.setHideNavigation])

  const handleDeleteMessage = async () => {
    if (!user?.id) return

    if (!confirm("确定要删除这条消息吗？")) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await messageApi.deleteMessage(user.id, message.id)
      if (response.success) {
        toast.success("消息已删除")
        onBack() // Return to message list
      } else {
        toast.error(response.error || "删除消息失败")
      }
    } catch (error) {
      console.error("删除消息失败:", error)
      toast.error("删除消息失败，请重试")
    } finally {
      setIsDeleting(false)
    }
  }

  // 右侧内容
  const headerRightContent = (
    <button onClick={handleDeleteMessage} disabled={isDeleting} className="text-sm text-red-400">
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "删除"}
    </button>
  )

  return (
    <div className="min-h-screen text-white flex flex-col pt-14" >
      {/* 使用共用的PageHeader组件 */}
      <PageHeader title={message.type} onBack={onBack} rightContent={headerRightContent} />

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto pb-20">
        {/* 暂时没有更多了 */}
        <div className="text-center text-gray-500 text-sm py-4">暂时没有更多了</div>

        {/* 消息内容 */}
        <div className="px-4">
          <div className="bg-[#1a1a1a] rounded-lg p-4">
            {/* 发送者信息 */}
            {message.sender && (
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
                  <img
                    src={message.sender.avatar || "/placeholder.svg?height=100&width=100&query=user+avatar"}
                    alt={message.sender.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium">{message.sender.name}</h3>
                </div>
              </div>
            )}

            <div className="mb-4">
              <h2 className="text-xl font-medium">{message.title}</h2>
              {message.date && <p className="text-gray-500 text-sm mt-1">{message.date}</p>}
            </div>

            <div className="space-y-4">
              {message.content.map((paragraph, index) => (
                <p key={index} className="text-gray-300">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
