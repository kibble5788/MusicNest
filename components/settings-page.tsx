"use client"

import { useState, useEffect, useRef } from "react"
import { Moon, Volume2, Shield, Lock, HelpCircle, Info, LogOut, Bell, Database, User, ChevronRight } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { useAuth } from "@/context/auth-context"
import toast from "react-hot-toast"
import { PageHeader } from "@/components/page-header"

interface SettingsPageProps {
  onBack: () => void
  setHideNavigation?: (hide: boolean) => void
}

export default function SettingsPage({ onBack, setHideNavigation }: SettingsPageProps) {
  const { user, logout } = useAuth()
  const [darkMode, setDarkMode] = useState(true)
  const [notifications, setNotifications] = useState(true)
  const [autoPlay, setAutoPlay] = useState(true)
  const [highQuality, setHighQuality] = useState(false)
  const [dataUsage, setDataUsage] = useState(false)

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

  const handleLogout = () => {
    logout()
    toast.success("已退出登录")
    onBack()
  }

  return (
    <div className="min-h-screen pb-16 pt-14 overflow-auto" >
      {/* 使用共用的PageHeader组件 */}
      <PageHeader title="设置" onBack={onBack} />

      {/* 设置列表 */}
      <div className="px-4 py-2">
        {/* 外观设置 */}
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm mb-2">外观</h2>
          <div className="bg-[#2c2c3a] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <Moon className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">深色模式</span>
              </div>
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
            </div>
          </div>
        </div>

        {/* 播放设置 */}
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm mb-2">播放</h2>
          <div className="bg-[#2c2c3a] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <Volume2 className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">自动播放</span>
              </div>
              <Switch checked={autoPlay} onCheckedChange={setAutoPlay} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">高音质</span>
              </div>
              <Switch checked={highQuality} onCheckedChange={setHighQuality} />
            </div>
          </div>
        </div>

        {/* 通知设置 */}
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm mb-2">通��</h2>
          <div className="bg-[#2c2c3a] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">推送通知</span>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Database className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">数据使用</span>
              </div>
              <Switch checked={dataUsage} onCheckedChange={setDataUsage} />
            </div>
          </div>
        </div>

        {/* 账户设置 */}
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm mb-2">账户</h2>
          <div className="bg-[#2c2c3a] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">个人资料</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">隐私设置</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <LogOut className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">退出登录</span>
              </div>
              <button onClick={handleLogout}>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* 关于 */}
        <div className="mb-6">
          <h2 className="text-gray-400 text-sm mb-2">关于</h2>
          <div className="bg-[#2c2c3a] rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center">
                <HelpCircle className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">帮助中心</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-gray-300 mr-3" />
                <span className="text-white">关于我们</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 text-xs py-4">
          <p>版本 1.0.0</p>
          <p className="mt-1">© 2023 NestMP3 All Rights Reserved</p>
        </div>
      </div>
    </div>
  )
}
