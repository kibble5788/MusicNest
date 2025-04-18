import axiosInstance from "./axios-instance"
import type {
  Audiobook,
  AudiobookListResponse,
  AudiobookDetailResponse,
  AudiobookPlayProgress,
} from "@/types/audiobook"
import { generateId } from "@/lib/utils"
import { setWithExpiry, getWithExpiry } from "@/lib/local-storage"

// Cache keys
const CACHE_KEYS = {
  AUDIOBOOKS_LIST: "audiobooks_list",
  AUDIOBOOK_DETAIL: (id: string) => `audiobook_detail_${id}`,
}

// Cache TTL (Time To Live) in milliseconds
const CACHE_TTL = {
  AUDIOBOOKS_LIST: 30 * 60 * 1000, // 30 minutes
  AUDIOBOOK_DETAIL: 60 * 60 * 1000, // 1 hour
}

// 模拟网络延迟
const mockDelay = (min = 300, max = 1200) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min
  return new Promise((resolve) => setTimeout(resolve, delay))
}

// 模拟网络错误（约 10% 的概率）
const simulateNetworkError = () => {
  return Math.random() > 0.9
}

// 生成有声书封面的占位图 URL
const generateCoverUrl = (id: string, title: string) => {
  return `/placeholder.svg?height=400&width=400&query=audiobook+${encodeURIComponent(title)}`
}

// 生成有声书章节
const generateChapters = (bookId: string, count: number) => {
  return Array(count)
    .fill(null)
    .map((_, index) => ({
      id: `${bookId}-chapter-${index + 1}`,
      title: `第${index + 1}章 ${["引言", "初遇", "转折", "危机", "决战", "尾声"][index % 6] || "未知章节"}`,
      duration: Math.floor(Math.random() * 1800) + 600, // 10-40分钟
      url: "http://music.163.com/song/media/outer/url?id=447925558.mp3", // 示例音频URL
      order: index + 1,
      isLocked: index > 2 && Math.random() > 0.7, // 部分章节锁定
    }))
}

// 生成模拟有声书数据
const generateMockAudiobooks = (count: number): Audiobook[] => {
  const categories = [
    { id: "fiction", name: "小说" },
    { id: "history", name: "历史" },
    { id: "business", name: "商业" },
    { id: "science", name: "科学" },
    { id: "self-help", name: "自助" },
    { id: "biography", name: "传记" },
  ]

  const authors = [
    { id: "author1", name: "莫言", avatar: "/placeholder.svg?key=0kegu" },
    { id: "author2", name: "余华", avatar: "/placeholder.svg?key=z2669" },
    { id: "author3", name: "刘慈欣", avatar: "/placeholder.svg?key=pz0eu" },
    { id: "author4", name: "南派三叔", avatar: "/placeholder.svg?key=cixme" },
    { id: "author5", name: "东野圭吾", avatar: "/placeholder.svg?key=7vr5m" },
  ]

  const bookTitles = [
    "三体",
    "盗墓笔记",
    "活着",
    "白夜行",
    "解忧杂货店",
    "围城",
    "平凡的世界",
    "红楼梦",
    "百年孤独",
    "追风筝的人",
    "人类简史",
    "明朝那些事",
    "时间简史",
    "万历十五年",
    "未来简史",
  ]

  return Array(count)
    .fill(null)
    .map((_, index) => {
      const id = generateId()
      const title = bookTitles[index % bookTitles.length]
      const totalChapters = Math.floor(Math.random() * 30) + 10
      const author = authors[Math.floor(Math.random() * authors.length)]
      const bookCategories = [
        categories[Math.floor(Math.random() * categories.length)],
        categories[Math.floor(Math.random() * categories.length)],
      ].filter((cat, i, arr) => i === arr.findIndex((c) => c.id === cat.id)) // 去重

      return {
        id,
        title: `${title} ${Math.floor(Math.random() * 3) + 1}`,
        cover: generateCoverUrl(id, title),
        description: `这是《${title}》的有声书版本，由专业播音员朗读。${Math.random() > 0.5 ? "这部作品讲述了一个关于人性、命运和选择的故事。" : "这是一部引人入胜的作品，将带您进入一个奇妙的世界。"}`,
        author,
        narrator: ["张震", "林兆铭", "刘琳", "李野墨", "周建龙"][Math.floor(Math.random() * 5)],
        duration: totalChapters * (Math.floor(Math.random() * 1800) + 600),
        totalChapters,
        rating: Math.random() * 2 + 3, // 3-5分
        ratingCount: Math.floor(Math.random() * 10000) + 100,
        categories: bookCategories,
        isFree: Math.random() > 0.7,
        isVIP: Math.random() > 0.6,
        isNew: Math.random() > 0.8,
        isHot: Math.random() > 0.7,
        isRecommended: Math.random() > 0.8,
        publishDate: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toISOString().split("T")[0], // 过去一年内
        chapters: index < 5 ? generateChapters(id, totalChapters) : undefined, // 只为前5本书生成章节
      }
    })
}

// 生成并缓存模拟数据
const mockAudiobooks = generateMockAudiobooks(50)

// 模拟 API 调用
export const audiobookApi = {
  // 获取有声书列表
  getAudiobooks: async (params: {
    page?: number
    pageSize?: number
    category?: string
    sort?: "popular" | "newest" | "rating"
    search?: string
  }): Promise<AudiobookListResponse> => {
    // 生成缓存键，包含查询参数
    const cacheKey = `${CACHE_KEYS.AUDIOBOOKS_LIST}_${JSON.stringify(params)}`
    
    // 尝试从缓存获取数据
    const cachedData = getWithExpiry<AudiobookListResponse>(cacheKey)
    if (cachedData) {
      console.log("Using cached audiobooks list data")
      return cachedData
    }
    
    // 没有缓存或缓存已过期，从API获取数据
    await mockDelay()

    if (simulateNetworkError()) {
      throw new Error("网络错误，请稍后重试")
    }

    const { page = 1, pageSize = 10, category, sort, search } = params

    // 过滤和排序
    let filteredBooks = [...mockAudiobooks]

    if (category) {
      filteredBooks = filteredBooks.filter((book) => book.categories.some((cat) => cat.id === category))
    }

    if (search) {
      const searchLower = search.toLowerCase()
      filteredBooks = filteredBooks.filter(
        (book) =>
          book.title.toLowerCase().includes(searchLower) || book.author.name.toLowerCase().includes(searchLower),
      )
    }

    if (sort) {
      if (sort === "popular") {
        filteredBooks.sort((a, b) => b.ratingCount - a.ratingCount)
      } else if (sort === "newest") {
        filteredBooks.sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
      } else if (sort === "rating") {
        filteredBooks.sort((a, b) => b.rating - a.rating)
      }
    }

    // 分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const paginatedBooks = filteredBooks.slice(start, end)

    const response = {
      books: paginatedBooks,
      total: filteredBooks.length,
      page,
      pageSize,
      hasMore: end < filteredBooks.length,
    }
    
    // 缓存结果
    setWithExpiry(cacheKey, response, CACHE_TTL.AUDIOBOOKS_LIST)
    
    return response
  },

  // 获取有声书详情
  getAudiobookDetail: async (id: string): Promise<AudiobookDetailResponse> => {
    // 尝试从缓存获取数据
    const cacheKey = CACHE_KEYS.AUDIOBOOK_DETAIL(id)
    const cachedData = getWithExpiry<AudiobookDetailResponse>(cacheKey)
    
    if (cachedData) {
      console.log(`Using cached detail for audiobook ${id}`)
      return cachedData
    }
    
    await mockDelay()

    if (simulateNetworkError()) {
      throw new Error("网络错误，请稍后重试")
    }

    const book = mockAudiobooks.find((book) => book.id === id)

    if (!book) {
      throw new Error("有声书不存在")
    }

    // 如果没有章节信息，生成章节
    const bookWithChapters = {
      ...book,
      chapters: book.chapters || generateChapters(id, book.totalChapters),
    }

    // 获取相关有声书（同一作者或同一分类）
    const relatedBooks = mockAudiobooks
      .filter(
        (b) =>
          b.id !== id &&
          (b.author.id === book.author.id || b.categories.some((cat) => book.categories.some((c) => c.id === cat.id))),
      )
      .slice(0, 5)

    const response = {
      book: bookWithChapters,
      relatedBooks,
    }
    
    // 缓存结果
    setWithExpiry(cacheKey, response, CACHE_TTL.AUDIOBOOK_DETAIL)
    
    return response
  },

  // 获取章节详情
  getChapterDetail: async (bookId: string, chapterId: string) => {
    // 章节详情不缓存，因为可能包含播放进度等动态信息
    await mockDelay()

    if (simulateNetworkError()) {
      throw new Error("网络错误，请稍后重试")
    }

    const book = mockAudiobooks.find((book) => book.id === bookId)

    if (!book) {
      throw new Error("有声书不存在")
    }

    const chapters = book.chapters || generateChapters(bookId, book.totalChapters)
    const chapter = chapters.find((chapter) => chapter.id === chapterId)

    if (!chapter) {
      throw new Error("章节不存在")
    }

    if (chapter.isLocked) {
      throw new Error("此章节需要购买后才能收听")
    }

    return {
      chapter,
      nextChapter: chapters.find((c) => c.order === chapter.order + 1) || null,
    }
  },

  // 保存播放进度
  savePlayProgress: async (progress: AudiobookPlayProgress): Promise<void> => {
    await mockDelay(100, 300) // 更快的响应时间

    if (simulateNetworkError()) {
      throw new Error("保存进度失败，请稍后重试")
    }

    // 在实际应用中，这里会将进度保存到服务器
    // 这里我们只是模拟成功
    console.log("保存播放进度:", progress)

    // 将进度保存到本地存储
    try {
      const savedProgress = JSON.parse(localStorage.getItem("audiobook_progress") || "{}")
      savedProgress[progress.bookId] = progress
      localStorage.setItem("audiobook_progress", JSON.stringify(savedProgress))
    } catch (error) {
      console.error("保存进度到本地存储失败:", error)
    }
  },

  // 获取播放进度
  getPlayProgress: async (bookId: string): Promise<AudiobookPlayProgress | null> => {
    await mockDelay(100, 300)

    // 从本地存储获取进度
    try {
      const savedProgress = JSON.parse(localStorage.getItem("audiobook_progress") || "{}")
      return savedProgress[bookId] || null
    } catch (error) {
      console.error("从本地存储获取进度失败:", error)
      return null
    }
  },
}

// 导出一个包装了 axios 的 API 客户端
// 在实际项目中，我们会使用这个客户端调用真实的 API
export const audiobookApiClient = {
  getAudiobooks: (params: any) => {
    return axiosInstance.get("/audiobooks", { params }).then((response) => response.data)
  },

  getAudiobookDetail: (id: string) => {
    return axiosInstance.get(`/audiobooks/${id}`).then((response) => response.data)
  },

  getChapterDetail: (bookId: string, chapterId: string) => {
    return axiosInstance.get(`/audiobooks/${bookId}/chapters/${chapterId}`).then((response) => response.data)
  },

  savePlayProgress: (progress: AudiobookPlayProgress) => {
    return axiosInstance.post("/audiobooks/progress", progress).then((response) => response.data)
  },

  getPlayProgress: (bookId: string) => {
    return axiosInstance.get(`/audiobooks/${bookId}/progress`).then((response) => response.data)
  },
}

// 创建一个拦截器，将 axios 请求重定向到我们的模拟 API
// 这样我们可以在不修改组件代码的情况下切换真实 API 和模拟 API
axiosInstance.interceptors.request.use(
  async (config) => {
    // 拦截请求并使用模拟数据
    if (config.url?.startsWith("/audiobooks")) {
      try {
        let response

        if (config.url === "/audiobooks" && config.method === "get") {
          response = await audiobookApi.getAudiobooks(config.params)
        } else if (config.url.match(/\/audiobooks\/[^/]+$/) && config.method === "get") {
          const id = config.url.split("/").pop() || ""
          response = await audiobookApi.getAudiobookDetail(id)
        } else if (config.url.match(/\/audiobooks\/[^/]+\/chapters\/[^/]+$/) && config.method === "get") {
          const parts = config.url.split("/")
          const bookId = parts[parts.length - 3]
          const chapterId = parts[parts.length - 1]
          response = await audiobookApi.getChapterDetail(bookId, chapterId)
        } else if (config.url === "/audiobooks/progress" && config.method === "post") {
          await audiobookApi.savePlayProgress(config.data)
          response = { success: true }
        } else if (config.url.match(/\/audiobooks\/[^/]+\/progress$/) && config.method === "get") {
          const bookId = config.url.split("/")[2]
          response = await audiobookApi.getPlayProgress(bookId)
        }

        // 创建一个模拟的 axios 响应
        throw {
          config,
          response: {
            status: 200,
            statusText: "OK",
            headers: {},
            data: response,
            config,
          },
        }
      } catch (error:any) {
        if (error.response) {
          throw error
        }
        throw new Error("模拟 API 错误")
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)
