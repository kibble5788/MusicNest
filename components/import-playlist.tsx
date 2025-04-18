"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft, ImageIcon, ClipboardList } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import toast from "react-hot-toast"
import ImportHistory from "./import-history"

interface ImportPlaylistProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function ImportPlaylist({ onBack, setHideNavigation }: ImportPlaylistProps) {
  const [importText, setImportText] = useState("")
  const [activeTab, setActiveTab] = useState("link")
  const [isImporting, setIsImporting] = useState(false)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showImportHistory, setShowImportHistory] = useState(false)

  // Hide navigation when this component mounts
  useEffect(() => {
    if (setHideNavigation) {
      setHideNavigation(true)
    }

    // Show navigation again when component unmounts
    return () => {
      if (setHideNavigation) {
        setHideNavigation(false)
      }
    }
  }, [setHideNavigation])

  const handleImport = async () => {
    if ((!importText && activeTab === "link") || (!selectedImage && activeTab === "image")) {
      toast.error(activeTab === "link" ? "请输入歌单链接或文字" : "请选择图片")
      return
    }

    setIsImporting(true)

    try {
      // 模拟导入过程
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast.success("歌单导入成功")
      onBack()
    } catch (error) {
      console.error("导入失败:", error)
      toast.error("导入失败，请重试")
    } finally {
      setIsImporting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedImage(file)

    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // If showing import history, render that component
  if (showImportHistory) {
    return <ImportHistory onBack={() => setShowImportHistory(false)} setHideNavigation={setHideNavigation} />
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 bg-black border-b border-gray-800">
        <div className="flex items-center justify-center p-4 relative">
          <button onClick={onBack} className="absolute left-4">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-medium">歌单导入</h1>
          <button className="absolute right-4" onClick={() => setShowImportHistory(true)}>
            <ClipboardList className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        {/* 输入区域 */}
        <div className="border border-emerald-500/30 rounded-lg p-4 mb-6">
          {activeTab === "link" ? (
            <textarea
              className="w-full bg-transparent border-none outline-none resize-none h-24"
              placeholder="粘贴包含歌曲信息的文字、歌单/网页链接（支持多个链接）"
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-24">
              {previewUrl ? (
                <div className="relative">
                  <img src={previewUrl || "/placeholder.svg"} alt="Selected image" className="h-24 object-contain" />
                  <button
                    className="absolute top-0 right-0 bg-black/70 rounded-full p-1"
                    onClick={() => {
                      setSelectedImage(null)
                      setPreviewUrl(null)
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18"></line>
                      <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="h-12 w-12 text-gray-500 mb-2" />
                  <label className="cursor-pointer text-emerald-500">
                    选择图片
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 导入按钮 */}
        <Button
          onClick={handleImport}
          disabled={isImporting}
          className="w-full py-6 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-full mb-8"
        >
          {isImporting ? (
            <div className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              导入中...
            </div>
          ) : (
            "一键导入"
          )}
        </Button>

        {/* 教程标签页 */}
        <div className="mt-auto">
          <h2 className="text-center text-lg mb-4">歌单导入教程</h2>

          <Tabs defaultValue="link" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="link" className="data-[state=active]:text-emerald-500">
                链接/文字导入
              </TabsTrigger>
              <TabsTrigger value="image" className="data-[state=active]:text-emerald-500">
                图片导入
              </TabsTrigger>
            </TabsList>

            <TabsContent value="link" className="mt-2">
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">1. 复制歌单链接或歌曲信息文字</p>
                <p className="text-gray-400 text-sm">2. 粘贴到上方输入框</p>
                <p className="text-gray-400 text-sm">3. 点击"一键导入"按钮</p>
                <p className="text-gray-400 text-sm">支持网易云音乐、QQ音乐、酷狗音乐等平台的歌单链接</p>
              </div>
            </TabsContent>

            <TabsContent value="image" className="mt-2">
              <div className="space-y-4">
                <p className="text-gray-400 text-sm">1. 截图保存歌单页面</p>
                <p className="text-gray-400 text-sm">2. 点击上方"选择图片"上传截图</p>
                <p className="text-gray-400 text-sm">3. 点击"一键导入"按钮</p>
                <p className="text-gray-400 text-sm">支持识别图片中的歌曲信息，准确率受图片质量影响</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
