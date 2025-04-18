import type { User } from "@/context/auth-context"
import { generateId } from "@/lib/utils"
import { setWithExpiry, getWithExpiry } from "@/lib/local-storage"

// Cache keys
const CACHE_KEYS = {
  USER_PROFILE: (userId: string) => `user_profile_${userId}`,
  USER_PLAYLISTS: (userId: string) => `user_playlists_${userId}`,
  MESSAGE_CATEGORIES: (userId: string) => `message_categories_${userId}`,
  MESSAGES: (userId: string, categoryId: string) => `messages_${userId}_${categoryId}`,
}

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  USER_PROFILE: 15 * 60 * 1000, // 15 minutes
  USER_PLAYLISTS: 10 * 60 * 1000, // 10 minutes
  MESSAGE_CATEGORIES: 5 * 60 * 1000, // 5 minutes
  MESSAGES: 5 * 60 * 1000, // 5 minutes
}

// Common API response interface
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  statusCode: number
}

// Mock network delay function
const mockDelay = async (minMs = 500, maxMs = 1500): Promise<void> => {
  const delay = Math.random() * (maxMs - minMs) + minMs
  return new Promise((resolve) => setTimeout(resolve, delay))
}

// Simulate API request with potential network failure
const simulateNetworkCondition = async (failRate = 0.05): Promise<boolean> => {
  await mockDelay()
  return Math.random() > failRate
}

// Mock users database
const mockUsers: User[] = [
  {
    id: "user1",
    username: "demo",
    nickname: "小灰灰",
    avatar: "/profile-avatar.png",
  },
  {
    id: "user2",
    username: "admin",
    nickname: "管理员",
    avatar: "/digital-administrator.png",
  },
]

// Auth API
export const authApi = {
  // Login function that simulates a real API request
  login: async (username: string, password: string): Promise<ApiResponse<User>> => {
    try {
      // Simulate network delay and potential failure
      const networkSuccess = await simulateNetworkCondition()

      if (!networkSuccess) {
        throw new Error("网络请求失败")
      }

      // Simple validation
      if (!username || !password) {
        return {
          success: false,
          error: "用户名和密码不能为空",
          statusCode: 400,
        }
      }

      // Check for existing user
      const existingUser = mockUsers.find((user) => user.username.toLowerCase() === username.toLowerCase())

      // If it's an existing user, validate password (for demo purposes, any password works)
      if (existingUser && password.length >= 6) {
        // In real backend we'd check password hash, but here we just check length
        return {
          success: true,
          data: existingUser,
          statusCode: 200,
        }
      }

      // For demo purposes, create a new user if password is valid
      if (password.length >= 6) {
        const newUser: User = {
          id: generateId(),
          username,
          nickname: `用户${username.substring(0, 3)}`,
          avatar: `/placeholder.svg?height=200&width=200&query=avatar+${username}`,
        }

        // In a real implementation, we'd save the user to the database
        mockUsers.push(newUser)

        return {
          success: true,
          data: newUser,
          statusCode: 201,
        }
      }

      // Invalid password
      return {
        success: false,
        error: "密码长度不足6位",
        statusCode: 400,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "登录失败",
        statusCode: 500,
      }
    }
  },

  // Check if user is already logged in
  checkAuth: async (): Promise<ApiResponse<User>> => {
    try {
      // Simulate network delay (shorter than login)
      await mockDelay(300, 800)

      // Try to get user from localStorage
      const savedUserJson = localStorage.getItem("user")
      if (!savedUserJson) {
        return {
          success: false,
          error: "未登录",
          statusCode: 401,
        }
      }

      try {
        const savedUser: User = JSON.parse(savedUserJson)

        // Validate saved user data has required fields
        if (!savedUser.id || !savedUser.username) {
          throw new Error("无效的用户数据")
        }

        return {
          success: true,
          data: savedUser,
          statusCode: 200,
        }
      } catch (e) {
        // Invalid stored user data
        localStorage.removeItem("user")
        return {
          success: false,
          error: "无效的用户数据",
          statusCode: 400,
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "验证登录状态失败",
        statusCode: 500,
      }
    }
  },

  // Logout function
  logout: async (): Promise<ApiResponse<null>> => {
    // Simulate network delay
    await mockDelay(200, 500)

    // Remove user from localStorage
    localStorage.removeItem("user")

    // Clear all user-related caches
    try {
      const savedUserJson = localStorage.getItem("user")
      if (savedUserJson) {
        const savedUser: User = JSON.parse(savedUserJson)
        if (savedUser.id) {
          // Clear user profile cache
          localStorage.removeItem(CACHE_KEYS.USER_PROFILE(savedUser.id))
          // Clear user playlists cache
          localStorage.removeItem(CACHE_KEYS.USER_PLAYLISTS(savedUser.id))
          // Clear message categories cache
          localStorage.removeItem(CACHE_KEYS.MESSAGE_CATEGORIES(savedUser.id))
        }
      }
    } catch (e) {
      console.error("Failed to clear user caches:", e)
    }

    return {
      success: true,
      statusCode: 200,
    }
  },
}

// User profile API
export const userApi = {
  // Get user profile data
  getProfile: async (userId: string, forceRefresh = false): Promise<ApiResponse<User & { stats: UserStats }>> => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getWithExpiry<ApiResponse<User & { stats: UserStats }>>(CACHE_KEYS.USER_PROFILE(userId))
        if (cachedData) {
          console.log(`Using cached profile data for user ${userId}`)
          return cachedData
        }
      }

      // Simulate network delay
      const networkSuccess = await simulateNetworkCondition()

      if (!networkSuccess) {
        throw new Error("网络请求失败")
      }

      // Find user in mock database
      const user = mockUsers.find((u) => u.id === userId)

      if (!user) {
        return {
          success: false,
          error: "用户不存在",
          statusCode: 404,
        }
      }

      // Generate mock stats
      const stats: UserStats = {
        followersCount: Math.floor(Math.random() * 1000),
        followingCount: Math.floor(Math.random() * 200),
        favoritesCount: Math.floor(Math.random() * 500),
        playlistsCount: Math.floor(Math.random() * 30),
        totalPlayTime: Math.floor(Math.random() * 10000),
      }

      const response = {
        success: true,
        data: { ...user, stats },
        statusCode: 200,
      }

      // Cache the response
      setWithExpiry(CACHE_KEYS.USER_PROFILE(userId), response, CACHE_TTL.USER_PROFILE)

      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取用户资料失败",
        statusCode: 500,
      }
    }
  },

  // Update user profile data
  updateProfile: async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      // Simulate network delay and potential failure
      const networkSuccess = await simulateNetworkCondition()

      if (!networkSuccess) {
        throw new Error("网络请求失败")
      }

      // Find user in mock database
      const userIndex = mockUsers.findIndex((u) => u.id === userId)

      if (userIndex === -1) {
        return {
          success: false,
          error: "用户不存在",
          statusCode: 404,
        }
      }

      // Update user (in a real app, we would validate data more carefully)
      const updatedUser = {
        ...mockUsers[userIndex],
        ...data,
        // Ensure ID cannot be changed
        id: mockUsers[userIndex].id,
      }

      // Update mock database
      mockUsers[userIndex] = updatedUser

      // Update localStorage if this is the current user
      const savedUserJson = localStorage.getItem("user")
      if (savedUserJson) {
        try {
          const savedUser: User = JSON.parse(savedUserJson)
          if (savedUser.id === userId) {
            localStorage.setItem("user", JSON.stringify(updatedUser))
          }
        } catch (e) {
          // Ignore localStorage errors
        }
      }

      // Invalidate user profile cache
      localStorage.removeItem(CACHE_KEYS.USER_PROFILE(userId))

      return {
        success: true,
        data: updatedUser,
        statusCode: 200,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "更新用户资料失败",
        statusCode: 500,
      }
    }
  },
}

// User statistics interface
export interface UserStats {
  followersCount: number
  followingCount: number
  favoritesCount: number
  playlistsCount: number
  totalPlayTime: number
}

// Mock playlists API
export const playlistApi = {
  // Get user playlists
  getUserPlaylists: async (userId: string, forceRefresh = false): Promise<ApiResponse<UserPlaylist[]>> => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getWithExpiry<ApiResponse<UserPlaylist[]>>(CACHE_KEYS.USER_PLAYLISTS(userId))
        if (cachedData) {
          console.log(`Using cached playlists data for user ${userId}`)
          return cachedData
        }
      }

      // Simulate network delay
      const networkSuccess = await simulateNetworkCondition()

      if (!networkSuccess) {
        throw new Error("网络请求失败")
      }

      // Generate 3-8 playlists for this user
      const playlistCount = Math.floor(Math.random() * 5) + 3
      const playlists: UserPlaylist[] = []

      for (let i = 0; i < playlistCount; i++) {
        playlists.push({
          id: `playlist-${userId}-${i}`,
          title: `我的歌单 ${i + 1}`,
          cover: `/placeholder.svg?height=300&width=300&query=playlist+${i}`,
          songCount: Math.floor(Math.random() * 100) + 10,
          createdBy: userId,
          isPrivate: Math.random() > 0.7,
        })
      }

      const response = {
        success: true,
        data: playlists,
        statusCode: 200,
      }

      // Cache the response
      setWithExpiry(CACHE_KEYS.USER_PLAYLISTS(userId), response, CACHE_TTL.USER_PLAYLISTS)

      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取歌单失败",
        statusCode: 500,
      }
    }
  },
}

export interface UserPlaylist {
  id: string
  title: string
  cover: string
  songCount: number
  createdBy: string
  isPrivate: boolean
}

// Message center types
export interface MessageItem {
  id: string
  type: MessageType
  title: string
  description: string
  content: string[]
  date?: string
  unread: boolean
  sender?: {
    id: string
    name: string
    avatar?: string
  }
}

export type MessageType =
  | "system"
  | "collection"
  | "fans"
  | "likes"
  | "close-friends"
  | "comments"
  | "topics"
  | "interactive"
  | "private"

export interface MessageCategory {
  id: string
  name: string
  unreadCount: number
  messages: MessageItem[]
}

// Message center API
export const messageApi = {
  // Get message categories with counts
  getMessageCategories: async (userId: string, forceRefresh = false): Promise<ApiResponse<MessageCategory[]>> => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getWithExpiry<ApiResponse<MessageCategory[]>>(CACHE_KEYS.MESSAGE_CATEGORIES(userId))
        if (cachedData) {
          console.log(`Using cached message categories for user ${userId}`)
          return cachedData
        }
      }

      // Simulate network delay
      const networkSuccess = await simulateNetworkCondition()

      if (!networkSuccess) {
        throw new Error("网络请求失败")
      }

      // Generate mock message categories
      const categories: MessageCategory[] = [
        {
          id: "official",
          name: "官方",
          unreadCount: 2,
          messages: [],
        },
        {
          id: "private",
          name: "私信",
          unreadCount: 0,
          messages: [],
        },
        {
          id: "moments",
          name: "密友时刻",
          unreadCount: 0,
          messages: [],
        },
      ]

      const response = {
        success: true,
        data: categories,
        statusCode: 200,
      }

      // Cache the response
      setWithExpiry(CACHE_KEYS.MESSAGE_CATEGORIES(userId), response, CACHE_TTL.MESSAGE_CATEGORIES)

      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取消息分类失败",
        statusCode: 500,
      }
    }
  },

  // Get messages for a specific category
  getMessages: async (
    userId: string,
    categoryId: string,
    forceRefresh = false,
  ): Promise<ApiResponse<MessageItem[]>> => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cachedData = getWithExpiry<ApiResponse<MessageItem[]>>(CACHE_KEYS.MESSAGES(userId, categoryId))
        if (cachedData) {
          console.log(`Using cached messages for user ${userId}, category ${categoryId}`)
          return cachedData
        }
      }

      // Simulate network delay
      const networkSuccess = await simulateNetworkCondition()

      if (!networkSuccess) {
        throw new Error("网络请求失败")
      }

      // Generate mock messages based on category
      let messages: MessageItem[] = []

      if (categoryId === "official") {
        messages = [
          {
            id: "system-1",
            type: "system",
            title: "系统公告",
            description: "恭喜你！已获得VIP领取资格",
            date: "01-20",
            unread: true,
            content: [
              "恭喜你！已获得VIP领取资格",
              "亲爱的小音波，感谢你一直对波点音乐的支持！",
              "现在波点音乐PC版已上线，成功登录PC版即可得VIP！",
              "快用电脑下载(*^▽^*)获得VIP吧~",
              "官网下载地址：https://bodian.kuwo.cn/",
              "温馨提示：VIP请在2025年2月28日前领取哦~",
            ],
          },
          {
            id: "collection-1",
            type: "collection",
            title: "收藏",
            description: "小音波4DD20U3 收藏了你的歌单",
            date: "2024-08-31",
            unread: true,
            content: ["小音波4DD20U3 收藏了你的歌单", "你的歌单《夏日清凉》被收藏了！", "看来你的音乐品味很受欢迎呢~"],
            sender: {
              id: "user-random-1",
              name: "小音波4DD20U3",
              avatar: "/images/avatar-1.png",
            },
          },
          {
            id: "fans-1",
            type: "fans",
            title: "粉丝",
            description: "芷若无尘 关注了你",
            date: "2023-08-10",
            unread: false,
            content: ["芷若无尘 关注了你", "你有了新粉丝！", "快去看看对方的主页吧~"],
            sender: {
              id: "user-random-2",
              name: "芷若无尘",
              avatar: "/images/avatar-2.png",
            },
          },
          {
            id: "likes-1",
            type: "likes",
            title: "赞",
            description: "芷若无尘 赞了你的评论",
            date: "2023-08-10",
            unread: false,
            content: [
              "芷若无尘 赞了你的评论",
              "你在《星星照亮回家的路》下的评论获得了赞：",
              "这首歌真的太治愈了，每次听都能让我平静下来。",
              "看来有人和你有同样的感受呢~",
            ],
            sender: {
              id: "user-random-2",
              name: "芷若无尘",
              avatar: "/images/avatar-2.png",
            },
          },
          {
            id: "close-friends-1",
            type: "close-friends",
            title: "密友",
            description: "看看谁要霸占你的桌面",
            date: "2023-08-05",
            unread: false,
            content: ["看看谁要霸占你的桌面", "你的密友们最近很活跃哦！", "快去看看他们分享了什么新鲜事~"],
          },
          {
            id: "comments-1",
            type: "comments",
            title: "评论",
            description: "TA对你的作品/评论说了点儿什么",
            date: "2023-08-01",
            unread: false,
            content: [
              "TA对你的作品/评论说了点儿什么",
              "有人回复了你在《青花》下的评论：",
              '"我也超喜欢周传雄的歌！你有推荐的其他歌曲吗？"',
              "快去回复吧~",
            ],
            sender: {
              id: "user-random-3",
              name: "音乐爱好者",
              avatar: "/images/avatar-3.png",
            },
          },
          {
            id: "topics-1",
            type: "topics",
            title: "话题",
            description: "看看谁赞/关注/回答了你的音乐话题",
            date: "2023-07-25",
            unread: false,
            content: [
              "看看谁赞/关注/回答了你的音乐话题",
              '你发起的话题 "最近有什么好听的新歌推荐？" 获得了5个回答',
              "快去看看大家都推荐了什么好歌吧~",
            ],
          },
          {
            id: "interactive-1",
            type: "interactive",
            title: "波点/小镇互动消息",
            description: "快看看吧,谁在和你互动呢",
            date: "2023-07-20",
            unread: false,
            content: [
              "快看看吧,谁在和你互动呢",
              "有3位用户在小镇上向你打招呼",
              "还有2位用户邀请你一起听歌",
              "快去看看吧~",
            ],
          },
          {
            id: "system-2",
            type: "system",
            title: "系统公告",
            description: "新版本更新通知",
            date: "01-15",
            unread: false,
            content: [
              "新版本更新通知",
              "波点音乐v2.5.0已发布",
              "新增功能：\n- 歌词同步显示\n- 音质优化\n- 界面美化",
              "快来体验吧！",
            ],
          },
        ]
      } else if (categoryId === "private") {
        messages = [
          {
            id: "private-1",
            type: "private",
            title: "私信",
            description: "你好，我是小明，我们可以一起听歌吗？",
            date: "2024-09-01",
            unread: false,
            content: ["你好，我是小明，我们可以一起听歌吗？", "我最近发现了一些很棒的歌曲，想和你分享。"],
            sender: {
              id: "user-private-1",
              name: "小明",
              avatar: "/private-profile-icon.png",
            },
          },
          {
            id: "private-2",
            type: "private",
            title: "私信",
            description: "嗨，我看到你喜欢周传雄的歌！",
            date: "2024-08-28",
            unread: false,
            content: ["嗨，我看到你喜欢周传雄的歌！", "我也是他的粉丝，你最喜欢他的哪首歌？"],
            sender: {
              id: "user-private-2",
              name: "音乐达人",
              avatar: "/private-profile-icon.png",
            },
          },
        ]
      } else if (categoryId === "moments") {
        messages = [
          {
            id: "moments-1",
            type: "close-friends",
            title: "密友时刻",
            description: "小红分享了一首新歌",
            date: "2024-09-02",
            unread: false,
            content: ["小红分享了一首新歌", "《夏天的风》 - 温岚", "这首歌真的很适合现在的季节，推荐给大家！"],
            sender: {
              id: "user-moments-1",
              name: "小红",
              avatar: "/digital-self-discovery.png",
            },
          },
          {
            id: "moments-2",
            type: "close-friends",
            title: "密友时刻",
            description: "音乐小子更新了歌单",
            date: "2024-08-30",
            unread: false,
            content: ["音乐小子更新了歌单", "《夜晚的安眠曲》", "收录了10首助眠的轻音乐，失眠的朋友可以听听看~"],
            sender: {
              id: "user-moments-2",
              name: "音乐小子",
              avatar: "/digital-self-reflection.png",
            },
          },
        ]
      }

      const response = {
        success: true,
        data: messages,
        statusCode: 200,
      }

      // Cache the response
      setWithExpiry(CACHE_KEYS.MESSAGES(userId, categoryId), response, CACHE_TTL.MESSAGES)

      return response
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "获取消息失败",
        statusCode: 500,
      }
    }
  },

  // Mark message as read
  markAsRead: async (userId: string, messageId: string): Promise<ApiResponse<null>> => {
    try {
      // Simulate network delay (shorter than other operations)
      await mockDelay(200, 500)

      // Invalidate message caches since the read status has changed
      // In a real app, we would only invalidate the specific message category
      // Here we'll just invalidate all message caches for simplicity
      localStorage.removeItem(CACHE_KEYS.MESSAGE_CATEGORIES(userId))

      // We don't know which category this message belongs to, so we can't invalidate specific message cache
      // In a real app, we would track this information

      return {
        success: true,
        statusCode: 200,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "标记消息已读失败",
        statusCode: 500,
      }
    }
  },

  // Mark all messages in a category as read
  markAllAsRead: async (userId: string, categoryId: string): Promise<ApiResponse<null>> => {
    try {
      // Simulate network delay
      await mockDelay(300, 800)

      // Invalidate relevant caches
      localStorage.removeItem(CACHE_KEYS.MESSAGE_CATEGORIES(userId))
      localStorage.removeItem(CACHE_KEYS.MESSAGES(userId, categoryId))

      return {
        success: true,
        statusCode: 200,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "标记全部已读失败",
        statusCode: 500,
      }
    }
  },

  // Delete a message
  deleteMessage: async (userId: string, messageId: string): Promise<ApiResponse<null>> => {
    try {
      // Simulate network delay
      await mockDelay(300, 800)

      // Invalidate message caches since a message has been deleted
      localStorage.removeItem(CACHE_KEYS.MESSAGE_CATEGORIES(userId))

      // We don't know which category this message belongs to, so we can't invalidate specific message cache
      // In a real app, we would track this information

      return {
        success: true,
        statusCode: 200,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "删除消息失败",
        statusCode: 500,
      }
    }
  },
}

export interface Message {
  id: string
  type: MessageType
  title: string
  description: string
  content: string[]
  date?: string
  unread: boolean
  sender?: {
    id: string
    name: string
    avatar?: string
  }
  time?: string
}
