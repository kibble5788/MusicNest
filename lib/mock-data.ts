import type { Song } from "@/types/song"

// Helper to generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 9)

// Helper to generate a random duration between 2-5 minutes
const generateDuration = () => Math.floor(Math.random() * (300 - 120 + 1) + 120)

// 网易云音乐测试URL
const NETEASE_TEST_URL = "http://music.163.com/song/media/outer/url?id=447925558.mp3"

// Mock search function
export async function mockSearch(query: string): Promise<{
  all: Song[]
  qq: Song[]
  netease: Song[]
  audiobooks: Song[]
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const qqResults = Array(10)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `QQ音乐 - ${query} 搜索结果 ${i + 1}`,
      artist: `歌手 ${String.fromCharCode(65 + i)}`,
      album: `专辑 ${i + 1}`,
      cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "qq" as const,
    }))

  const neteaseResults = Array(8)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `网易云 - ${query} 搜索结果 ${i + 1}`,
      artist: `艺术家 ${String.fromCharCode(75 + i)}`,
      album: `专辑 ${i + 1}`,
      cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i + 10}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "netease" as const,
    }))

  const audiobookResults = Array(5)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `有声书 - ${query} 搜索结果 ${i + 1}`,
      artist: `作者 ${String.fromCharCode(85 + i)}`,
      cover: `/placeholder.svg?height=300&width=300&query=audiobook+cover+${i}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "audiobook" as const,
    }))

  const allResults = [...qqResults, ...neteaseResults, ...audiobookResults]

  return {
    all: allResults,
    qq: qqResults,
    netease: neteaseResults,
    audiobooks: audiobookResults,
  }
}

// 合并的音乐数据
export async function mockMusicData(): Promise<{
  recommended: Song[]
  newReleases: Song[]
  topCharts: Song[]
  playlists: Song[]
  trending: Song[]
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  // QQ音乐数据
  const recommended = Array(8)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `推荐歌曲 ${i + 1}`,
      artist: `歌手 ${String.fromCharCode(65 + i)}`,
      album: `专辑 ${i + 1}`,
      cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i + 20}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "qq" as const,
    }))

  const newReleases = [
    {
      id: "new-release-1",
      title: "爱的就是你",
      artist: "七喜",
      album: "无论我走多远",
      cover: "/song-cover-2.png",
      url: NETEASE_TEST_URL,
      duration: 245,
      source: "qq" as const,
    },
    ...Array(9)
      .fill(null)
      .map((_, i) => ({
        id: generateId(),
        title: `新歌 ${i + 1}`,
        artist: `歌手 ${String.fromCharCode(75 + i)}`,
        album: `专辑 ${i + 1}`,
        cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i + 30}`,
        url: NETEASE_TEST_URL,
        duration: generateDuration(),
        source: "qq" as const,
      })),
  ]

  const topCharts = Array(20)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `热门歌曲 ${i + 1}`,
      artist: `歌手 ${String.fromCharCode(65 + (i % 26))}`,
      album: `专辑 ${i + 1}`,
      cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i + 40}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "qq" as const,
    }))

  // 网易云数据
  const neteaseRecommended = Array(8)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `网易推荐 ${i + 1}`,
      artist: `艺术家 ${String.fromCharCode(65 + i)}`,
      album: `专辑 ${i + 1}`,
      cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i + 60}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "netease" as const,
    }))

  const playlists = Array(8)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `歌单 ${i + 1}`,
      artist: `创建者 ${String.fromCharCode(75 + i)}`,
      cover: `/placeholder.svg?height=300&width=300&query=music+playlist+cover+${i}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "netease" as const,
    }))

  const trending = [
    {
      id: "trending-1",
      title: "青花",
      artist: "周传雄",
      album: "青花瓷",
      cover: "/song-cover-1.png",
      url: NETEASE_TEST_URL,
      duration: 267,
      source: "qq" as const,
    },
    ...Array(9)
      .fill(null)
      .map((_, i) => ({
        id: generateId(),
        title: `热门歌曲 ${i + 1}`,
        artist: `艺术家 ${String.fromCharCode(65 + (i % 26))}`,
        album: `专辑 ${i + 1}`,
        cover: `/placeholder.svg?height=300&width=300&query=music+album+cover+${i + 70}`,
        url: NETEASE_TEST_URL,
        duration: generateDuration(),
        source: "netease" as const,
      })),
  ]

  // 合并推荐歌曲
  const allRecommended = [...recommended, ...neteaseRecommended]

  return {
    recommended: allRecommended,
    newReleases,
    topCharts,
    playlists,
    trending,
  }
}

// Mock Audiobooks data
export async function mockAudiobooksData(): Promise<{
  featured: Song[]
  popular: Song[]
  categories: {
    name: string
    books: Song[]
  }[]
}> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  const featured = Array(8)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `精选有声书 ${i + 1}`,
      artist: `作者 ${String.fromCharCode(65 + i)}`,
      cover: `/placeholder.svg?height=300&width=300&query=audiobook+cover+${i + 10}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "audiobook" as const,
    }))

  const popular = Array(10)
    .fill(null)
    .map((_, i) => ({
      id: generateId(),
      title: `热门有声书 ${i + 1}`,
      artist: `作者 ${String.fromCharCode(75 + i)}`,
      cover: `/placeholder.svg?height=300&width=300&query=audiobook+cover+${i + 20}`,
      url: NETEASE_TEST_URL,
      duration: generateDuration(),
      source: "audiobook" as const,
    }))

  const categories = [
    {
      name: "文学",
      books: Array(4)
        .fill(null)
        .map((_, i) => ({
          id: generateId(),
          title: `文学有声书 ${i + 1}`,
          artist: `作者 ${String.fromCharCode(65 + i)}`,
          cover: `/placeholder.svg?height=300&width=300&query=literature+audiobook+cover+${i}`,
          url: NETEASE_TEST_URL,
          duration: generateDuration(),
          source: "audiobook" as const,
        })),
    },
    {
      name: "历史",
      books: Array(4)
        .fill(null)
        .map((_, i) => ({
          id: generateId(),
          title: `历史有声书 ${i + 1}`,
          artist: `作者 ${String.fromCharCode(70 + i)}`,
          cover: `/placeholder.svg?height=300&width=300&query=history+audiobook+cover+${i}`,
          url: NETEASE_TEST_URL,
          duration: generateDuration(),
          source: "audiobook" as const,
        })),
    },
  ]

  return {
    featured,
    popular,
    categories,
  }
}

// Mock playlists data
export async function mockPlaylists() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  return [
    {
      id: "nightclub",
      title: "夜店",
      cover: "/vibrant-nightclub-scene.png",
      songCount: 14,
    },
    {
      id: "atmosphere-rnb",
      title: "氛围R&B | 氤氲水汽, 谁能拒绝耳畔的温",
      cover: "/vibrant-nightclub-scene.png",
      songCount: 70,
    },
    {
      id: "euro-pop",
      title: "独享欧美Pop：耳机青年的深度陶醉",
      cover: "/vibrant-sunset-cityscape.png",
      songCount: 161,
    },
    {
      id: "trending-weekly",
      title: "潮流周榜",
      cover: "/song-cover-3.png",
      songCount: 50,
    },
    {
      id: "my-music",
      title: "我的",
      cover: "/classic-folder-icon.png",
      songCount: 0,
    },
    {
      id: "weekend",
      title: "周末放松",
      cover: "/cozy-weekend-vibes.png",
      songCount: 25,
    },
    {
      id: "workout",
      title: "运动健身",
      cover: "/placeholder.svg?height=200&width=200&query=workout+music",
      songCount: 42,
    },
    {
      id: "favorite",
      title: "收藏的歌单",
      cover: "/placeholder.svg?height=200&width=200&query=favorite+playlist",
      songCount: 88,
    },
  ]
}
