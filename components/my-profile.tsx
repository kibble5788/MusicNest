"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Mail, Settings, ChevronRight, Music, Plus, RefreshCw, Crown, Gift, Headphones } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePullToRefresh } from "@/hooks/use-pull-to-refresh"
import PlaylistDetail from "@/components/playlist-detail"
import MessageCenter from "@/components/message-center"
import SettingsPage from "@/components/settings-page"
import { playlistApi, userApi, type UserPlaylist, type UserStats } from "@/lib/mock-api"
import toast from "react-hot-toast"
import ImportPlaylist from "@/components/import-playlist"
import { PageHeader } from "@/components/page-header"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 导入函数
import {
  getLikedMusicCount,
  getLikedAudiobookCount,
  getRecentMusicCount,
  getRecentAudiobookCount,
} from "@/lib/user-music-storage"
import LikedSongs from "@/components/liked-songs"
import RecentSongs from "@/components/recent-songs"
import AudiobookDetail from "@/components/audiobook-detail"

// 添加听书类型
interface Audiobook {
  id: string
  title: string
  author: string
  cover: string
  progress: number
  duration: number
  lastListened?: string
}

// Update the component props to include setHideNavigation
interface MyProfileProps {
  setHideNavigation?: (hide: boolean) => void
}

export default function MyProfile({ setHideNavigation }: MyProfileProps) {
  const { user, isAuthenticated, isLoading, loginError, login, logout } = useAuth()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState("favorites")
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [showMessageCenter, setShowMessageCenter] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [userProfile, setUserProfile] = useState<{ user: typeof user; stats: UserStats } | null>(null)
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([])
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isLoadingPlaylists, setIsLoadingPlaylists] = useState(false)
  const [showImportPlaylist, setShowImportPlaylist] = useState(false)
  const [scrollRef, setScrollRef] = useState<React.RefObject<HTMLDivElement>>(useRef<HTMLDivElement>(null))

  // 在 MyProfile 组件中添加状态
  const [selectedAudiobook, setSelectedAudiobook] = useState<string | null>(null)

  // 添加歌单标签状态
  const [playlistTab, setPlaylistTab] = useState<"created" | "favorite" | "audiobooks">("created")

  // 添加听书数据
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([])
  const [isLoadingAudiobooks, setIsLoadingAudiobooks] = useState(false)

  // 状态
  const [likedMusicCount, setLikedMusicCount] = useState(0)
  const [likedAudiobookCount, setLikedAudiobookCount] = useState(0)
  const [recentMusicCount, setRecentMusicCount] = useState(0)
  const [recentAudiobookCount, setRecentAudiobookCount] = useState(0)

  // Load user profile and playlists when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch user profile
      const fetchUserProfile = async () => {
        setIsLoadingProfile(true)
        try {
          // Pass forceRefresh=false to use cached data if available
          const response = await userApi.getProfile(user.id, false)
          if (response.success && response.data) {
            const { stats, ...userData } = response.data
            setUserProfile({ user: userData, stats })
          } else {
            toast.error(response.error || "获取用户资料失败")
          }
        } catch (error) {
          console.error("获取用户资料失败:", error)
          toast.error("获取用户资料失败")
        } finally {
          setIsLoadingProfile(false)
        }
      }

      // Fetch user playlists
      const fetchUserPlaylists = async () => {
        setIsLoadingPlaylists(true)
        try {
          // Pass forceRefresh=false to use cached data if available
          const response = await playlistApi.getUserPlaylists(user.id, false)
          if (response.success && response.data) {
            setUserPlaylists(response.data)
          } else {
            toast.error(response.error || "获取歌单失败")
          }
        } catch (error) {
          console.error("获取歌单失败:", error)
          toast.error("获取歌单失败")
        } finally {
          setIsLoadingPlaylists(false)
        }
      }

      // 加载听书数据
      const fetchAudiobooks = async () => {
        setIsLoadingAudiobooks(true)
        try {
          // 模拟API请求
          await new Promise((resolve) => setTimeout(resolve, 800))

          // 模拟听书数据
          const mockAudiobooks: Audiobook[] = [
            {
              id: "audiobook-1",
              title: "三体",
              author: "刘慈欣",
              cover: "/nebula-reader.png",
              progress: 0.45,
              duration: 36000,
              lastListened: "昨天",
            },
            {
              id: "audiobook-2",
              title: "活着",
              author: "余华",
              cover: "/cozy-listening.png",
              progress: 0.8,
              duration: 28800,
              lastListened: "3天前",
            },
            {
              id: "audiobook-3",
              title: "解忧杂货店",
              author: "东野圭吾",
              cover: "/shadowy-secrets-audiobook.png",
              progress: 0.2,
              duration: 32400,
              lastListened: "上周",
            },
          ]

          setAudiobooks(mockAudiobooks)
        } catch (error) {
          console.error("获取听书数据失败:", error)
          toast.error("获取听书数据失败")
        } finally {
          setIsLoadingAudiobooks(false)
        }
      }

      fetchUserProfile()
      fetchUserPlaylists()
      fetchAudiobooks()
    }
  }, [isAuthenticated, user])

  // 在 useEffect 中加载数据
  useEffect(() => {
    setLikedMusicCount(getLikedMusicCount())
    setLikedAudiobookCount(getLikedAudiobookCount())
    setRecentMusicCount(getRecentMusicCount())
    setRecentAudiobookCount(getRecentAudiobookCount())
  }, [])

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    try {
      const success = await login(username, password)
      if (!success && !loginError) {
        toast.error("登录失败，请检查用户名和密码")
      }
    } catch (error) {
      toast.error("登录失败，请重试")
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRefresh = async () => {
    if (isRefreshing || !user?.id) return

    setIsRefreshing(true)

    try {
      // Force refresh both profile and playlists data
      const profileResponse = await userApi.getProfile(user.id, true)
      if (profileResponse.success && profileResponse.data) {
        const { stats, ...userData } = profileResponse.data
        setUserProfile({
          user: userData,
          stats,
        })
      }

      // Force refresh playlists data
      const playlistsResponse = await playlistApi.getUserPlaylists(user.id, true)
      if (playlistsResponse.success && playlistsResponse.data) {
        setUserPlaylists(playlistsResponse.data)
      }

      // 重新加载听书数据
      setIsLoadingAudiobooks(true)
      await new Promise((resolve) => setTimeout(resolve, 800))
      setIsLoadingAudiobooks(false)

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

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylist(playlistId)
  }

  // 更新 handleAudiobookClick 函数
  const handleAudiobookClick = (audiobookId: string) => {
    setSelectedAudiobook(audiobookId)
  }

  // 添加返回函数
  const handleBackFromAudiobook = () => {
    setSelectedAudiobook(null)
  }

  const handleBackFromPlaylist = () => {
    setSelectedPlaylist(null)
  }

  const handleOpenMessageCenter = () => {
    setShowMessageCenter(true)
  }

  const handleCloseMessageCenter = () => {
    setShowMessageCenter(false)
  }

  const handleSettingsClick = () => {
    setShowSettings(true)
  }

  const handleBackFromSettings = () => {
    setShowSettings(false)
  }

  // 修改 handleTabClick 函数
  const handleTabClick = (tab: string) => {
    setActiveTab(tab)

    // 设置选中的歌单
    switch (tab) {
      case "favorites":
        setSelectedPlaylist("favorites")
        break
      case "recent":
        setSelectedPlaylist("recent")
        break
      case "local":
        setSelectedPlaylist("local")
        break
      default:
        break
    }
  }

  const handleBack = () => {
    // 直接返回到网站首页
    window.location.hash = "music"

    // 强制触发导航行为
    if (setHideNavigation) {
      // 先显示导航栏
      setHideNavigation(false)
    }

    // 通知父组件切换到音乐页面
    window.dispatchEvent(
      new CustomEvent("navigationChange", {
        detail: {
          tab: "music",
        },
      }),
    )
  }

  // Show loading spinner when checking authentication
  if (isLoading && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  if (showMessageCenter) {
    return <MessageCenter onBack={handleCloseMessageCenter} setHideNavigation={setHideNavigation} />
  }

  if (showSettings) {
    return <SettingsPage onBack={handleBackFromSettings} setHideNavigation={setHideNavigation} />
  }

  if (showImportPlaylist) {
    return <ImportPlaylist onBack={() => setShowImportPlaylist(false)} setHideNavigation={setHideNavigation} />
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-10 px-4">
        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
          <Music className="h-12 w-12 text-muted-foreground" />
        </div>

        <h1 className="text-2xl font-bold mb-8">登录您的账号</h1>

        <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
          {loginError && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{loginError}</div>}

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              用户名
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
              required
              disabled={isLoggingIn}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              密码
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              required
              minLength={6}
              disabled={isLoggingIn}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoggingIn}>
            {isLoggingIn ? <LoadingSpinner className="mr-2 h-4 w-4" /> : null}
            {isLoggingIn ? "登录中..." : "登录"}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            提示：输入 demo/123456 可直接登录，或任意用户名和6位以上密码注册新账号
          </p>
        </form>
      </div>
    )
  }

  // 修改 selectedPlaylist 条件渲染部分
  if (selectedPlaylist) {
    if (selectedPlaylist === "favorites") {
      return <LikedSongs onBack={handleBackFromPlaylist} setHideNavigation={setHideNavigation} />
    } else if (selectedPlaylist === "recent") {
      return <RecentSongs onBack={handleBackFromPlaylist} setHideNavigation={setHideNavigation} />
    } else {
      return <PlaylistDetail id={selectedPlaylist} onBack={handleBackFromPlaylist} />
    }
  }

  // 在条件渲染部分添加有声书详情页面
  if (selectedAudiobook) {
    return (
      <AudiobookDetail
        audiobookId={selectedAudiobook}
        onBack={handleBackFromAudiobook}
        setHideNavigation={setHideNavigation}
      />
    )
  }

  // Loading profile data
  if (isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="mx-auto h-12 w-12 mb-4" />
          <p className="text-muted-foreground">加载用户资料中...</p>
        </div>
      </div>
    )
  }

  // 右侧内容
  const headerRightContent = (
    <>
      <div className="relative" onClick={handleOpenMessageCenter}>
        <Mail className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white">
          2{" "}
        </span>{" "}
      </div>{" "}
      <Settings className="h-6 w-6 text-white" onClick={handleSettingsClick} />{" "}
    </>
  )

  // 根据当前标签过滤歌单
  const filteredPlaylists = userPlaylists.filter((playlist) => {
    if (playlistTab === "created") return !playlist.isPrivate
    if (playlistTab === "favorite") return playlist.isPrivate
    return false
  })

  // 计算各类型歌单数量
  const createdPlaylistsCount = userPlaylists.filter((p) => !p.isPrivate).length
  const favoritePlaylistsCount = userPlaylists.filter((p) => p.isPrivate).length

  return (
    <div className="min-h-screen pb-20 pt-14 px-0 overflow-auto" {...pullToRefreshProps} ref={scrollRef}>
      {" "}
      {isRefreshing && (
        <div className="flex items-center justify-center py-4">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span className="ml-2 text-sm"> 刷新中... </span>{" "}
        </div>
      )}
      {/* 使用共用的PageHeader组件 */}{" "}
      <PageHeader
        title="个人中心"
        onBack={handleBack}
        rightContent={headerRightContent}
        showGradient={true}
        scrollRef={scrollRef}
      />
      {/* 用户信息 */}{" "}
      <div className="flex items-center px-4 py-4">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <img
            src={user?.avatar || "/profile-avatar.png"}
            alt={user?.nickname || user?.username}
            className="w-full h-full object-cover"
          />
        </div>{" "}
        <div className="ml-4">
          <h1 className="text-xl font-bold text-white"> {user?.nickname || user?.username} </h1>{" "}
          <div className="flex items-center mt-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-[#2c2c3a] border-none text-amber-500 flex items-center h-8 rounded-full px-3"
            >
              <Crown className="h-4 w-4 mr-1 text-amber-500" />
              ¥1开通VIP <ChevronRight className="h-4 w-4 ml-1" />
            </Button>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* 会员广告横幅 */}{" "}
      <div className="mx-2 mb-4 relative bg-blue-300 rounded-xl overflow-hidden">
        <div className="absolute top-2 right-2 bg-black/20 rounded-full p-1">
          <span className="text-xs text-white"> × </span>{" "}
        </div>{" "}
        <div className="p-4 flex items-center">
          <div>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-black"> 3.7折开会员 </span>{" "}
            </div>{" "}
            <p className="text-sm text-black/80 mt-1"> 音乐自由轻松get! </p>{" "}
          </div>{" "}
          <div className="ml-auto">
            <img src="/musical-critter.png" alt="会员促销" className="h-16 w-16" />
          </div>{" "}
        </div>{" "}
      </div>
      {/* 会员中心和活动中心 */}{" "}
      <div className="grid grid-cols-2 gap-4 mx-2 mb-4">
        <div className="bg-[#2c2c3a] rounded-xl p-4 flex justify-between items-center">
          <span className="text-white font-medium"> 会员中心 </span> <Crown className="h-5 w-5 text-amber-500" />
        </div>{" "}
        <div className="bg-[#2c2c3a] rounded-xl p-4 flex justify-between items-center">
          <span className="text-white font-medium"> 活动中心 </span> <Gift className="h-5 w-5 text-green-400" />
        </div>{" "}
      </div>
      {/* 音乐分类标签 */}{" "}
      <div className="grid grid-cols-3 gap-2 mx-2 mb-4">
        <div
          className={cn(
            "rounded-xl p-4 flex flex-col justify-between h-36",
            activeTab === "favorites" ? "bg-pink-400" : "bg-[#2c2c3a]",
          )}
          onClick={() => handleTabClick("favorites")}
        >
          <div className="flex justify-between">
            <span className="text-white font-medium"> 喜欢 </span>{" "}
            <span className="text-white/80">
              {" "}
              {likedMusicCount} / {likedAudiobookCount}{" "}
            </span>{" "}
          </div>{" "}
          <div className="mt-auto">
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <img src="/abstract-soundscape.png" alt="喜欢的音乐" className="w-full h-full object-cover" />
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div
          className={cn(
            "rounded-xl p-4 flex flex-col justify-between h-36",
            activeTab === "recent" ? "bg-green-400" : "bg-[#2c2c3a]",
          )}
          onClick={() => handleTabClick("recent")}
        >
          <div className="flex justify-between">
            <span className="text-white font-medium"> 最近 </span>{" "}
            <span className="text-white/80">
              {" "}
              {recentMusicCount} / {recentAudiobookCount}{" "}
            </span>{" "}
          </div>{" "}
          <div className="mt-auto">
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <img src="/abstract-soundscape.png" alt="最近播放" className="w-full h-full object-cover" />
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <div
          className={cn(
            "rounded-xl p-4 flex flex-col justify-between h-36",
            activeTab === "local" ? "bg-purple-400" : "bg-[#2c2c3a]",
          )}
          onClick={() => handleTabClick("local")}
        >
          <div className="flex justify-between">
            <span className="text-white font-medium"> 本地 </span> <span className="text-white/80"> </span>{" "}
          </div>{" "}
          <div className="mt-auto">
            <div className="w-16 h-16 rounded-md overflow-hidden">
              <img src="/vibrant-city-sounds.png" alt="本地音乐" className="w-full h-full object-cover" />
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* 歌单标签切换 */}{" "}
      <div className="px-2 mb-2">
        <Tabs value={playlistTab} onValueChange={(value) => setPlaylistTab(value)} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="created" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span> 自建歌单({createdPlaylistsCount}) </span>{" "}
            </TabsTrigger>{" "}
            <TabsTrigger value="favorite" className="flex items-center gap-1">
              <Music className="h-4 w-4" />
              <span> 收藏歌单({favoritePlaylistsCount}) </span>{" "}
            </TabsTrigger>{" "}
            <TabsTrigger value="audiobooks" className="flex items-center gap-1">
              <Headphones className="h-4 w-4" />
              <span> 听书({audiobooks.length}) </span>{" "}
            </TabsTrigger>{" "}
          </TabsList>{" "}
        </Tabs>{" "}
      </div>
      {/* 操作按钮 */}{" "}
      <div className="flex justify-end items-center px-2 py-2">
        <div className="flex space-x-4">
          <RefreshCw className="h-5 w-5 text-gray-400" onClick={handleRefresh} />{" "}
          <Plus className="h-5 w-5 text-gray-400" />{" "}
          {playlistTab !== "audiobooks" && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 cursor-pointer"
              onClick={() => setShowImportPlaylist(true)}
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}{" "}
          <div className="h-5 w-5 flex flex-col justify-between">
            <div className="h-[2px] w-full bg-gray-400"> </div> <div className="h-[2px] w-full bg-gray-400"> </div>{" "}
            <div className="h-[2px] w-full bg-gray-400"> </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>
      {/* 内容区域 - 根据标签显示不同内容 */}{" "}
      <div className="px-2 space-y-4">
        {" "}
        {/* 自建歌单和收藏歌单 */}{" "}
        {(playlistTab === "created" || playlistTab === "favorite") && (
          <>
            {" "}
            {isLoadingPlaylists ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : filteredPlaylists.length > 0 ? (
              filteredPlaylists.map((playlist) => (
                <div key={playlist.id} className="flex items-center" onClick={() => handlePlaylistClick(playlist.id)}>
                  <div className="w-12 h-12 rounded-md overflow-hidden">
                    <img
                      src={playlist.cover || `/placeholder.svg?height=100&width=100&query=playlist`}
                      alt={playlist.title}
                      className="w-full h-full object-cover"
                    />
                  </div>{" "}
                  <div className="ml-3 flex-1">
                    <h3 className="text-white text-sm font-medium"> {playlist.title} </h3>{" "}
                    <p className="text-gray-400 text-xs"> {playlist.songCount} 首 </p>{" "}
                  </div>{" "}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p> {playlistTab === "created" ? "暂无自建歌单" : "暂无收藏歌单"} </p>{" "}
                {playlistTab === "created" && (
                  <Button variant="outline" size="sm" className="mt-4 flex items-center">
                    <Plus className="h-4 w-4 mr-1" />
                    创建歌单{" "}
                  </Button>
                )}{" "}
              </div>
            )}{" "}
          </>
        )}
        {/* 听书内容 */}{" "}
        {playlistTab === "audiobooks" && (
          <>
            {" "}
            {isLoadingAudiobooks ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner className="h-8 w-8" />
              </div>
            ) : audiobooks.length > 0 ? (
              audiobooks.map((audiobook) => (
                <div
                  key={audiobook.id}
                  className="flex items-center"
                  onClick={() => handleAudiobookClick(audiobook.id)}
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden">
                    <img
                      src={audiobook.cover || `/placeholder.svg?height=100&width=100&query=audiobook`}
                      alt={audiobook.title}
                      className="w-full h-full object-cover"
                    />
                  </div>{" "}
                  <div className="ml-3 flex-1">
                    <h3 className="text-white text-sm font-medium"> {audiobook.title} </h3>{" "}
                    <p className="text-gray-400 text-xs">
                      {" "}
                      {audiobook.author} · {audiobook.lastListened}{" "}
                    </p>{" "}
                    {/* 进度条 */}{" "}
                    <div className="mt-1 w-full h-1 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500"
                        style={{
                          width: `${audiobook.progress * 100}%`,
                        }}
                      ></div>{" "}
                    </div>{" "}
                  </div>{" "}
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-gray-400">
                <p> 暂无听书内容 </p>{" "}
                <Button variant="outline" size="sm" className="mt-4 flex items-center">
                  <Plus className="h-4 w-4 mr-1" />
                  添加听书{" "}
                </Button>{" "}
              </div>
            )}{" "}
          </>
        )}{" "}
      </div>{" "}
    </div>
  )
}
