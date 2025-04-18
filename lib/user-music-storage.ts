import { setWithExpiry, getWithExpiry } from "@/lib/local-storage"
import type { Song } from "@/types/song"

// 缓存键名
const CACHE_KEYS = {
  LIKED_SONGS: "liked_songs",
  RECENT_SONGS: "recent_songs",
}

// 缓存过期时间（毫秒）
const CACHE_TTL = {
  LIKED_SONGS: 30 * 24 * 60 * 60 * 1000, // 30天
  RECENT_SONGS: 7 * 24 * 60 * 60 * 1000, // 7天
}

// 最大存储数量
const MAX_LIKED_SONGS = 500
const MAX_RECENT_SONGS = 100

/**
 * 获取喜欢的歌曲列表
 */
export function getLikedSongs(): Song[] {
  try {
    const likedSongs = getWithExpiry<Song[]>(CACHE_KEYS.LIKED_SONGS)
    return likedSongs || []
  } catch (error) {
    console.error("获取喜欢的歌曲失败:", error)
    return []
  }
}

/**
 * 添加歌曲到喜欢列表
 */
export function addLikedSong(song: Song): void {
  try {
    const likedSongs = getLikedSongs()

    // 检查歌曲是否已经在喜欢列表中
    if (likedSongs.some((s) => s.id === song.id)) {
      return
    }

    // 添加到列表开头
    const updatedSongs = [song, ...likedSongs].slice(0, MAX_LIKED_SONGS)

    // 保存到缓存
    setWithExpiry(CACHE_KEYS.LIKED_SONGS, updatedSongs, CACHE_TTL.LIKED_SONGS)
  } catch (error) {
    console.error("添加喜欢的歌曲失败:", error)
  }
}

/**
 * 从喜欢列表中移除歌曲
 */
export function removeLikedSong(songId: string): void {
  try {
    const likedSongs = getLikedSongs()
    const updatedSongs = likedSongs.filter((song) => song.id !== songId)

    // 保存到缓存
    setWithExpiry(CACHE_KEYS.LIKED_SONGS, updatedSongs, CACHE_TTL.LIKED_SONGS)
  } catch (error) {
    console.error("移除喜欢的歌曲失败:", error)
  }
}

/**
 * 检查歌曲是否在喜欢列表中
 */
export function isSongLiked(songId: string): boolean {
  try {
    const likedSongs = getLikedSongs()
    return likedSongs.some((song) => song.id === songId)
  } catch (error) {
    console.error("检查喜欢的歌曲失败:", error)
    return false
  }
}

/**
 * 获取最近播放的歌曲列表
 */
export function getRecentSongs(): Song[] {
  try {
    const recentSongs = getWithExpiry<Song[]>(CACHE_KEYS.RECENT_SONGS)
    return recentSongs || []
  } catch (error) {
    console.error("获取最近播放失败:", error)
    return []
  }
}

/**
 * 添加歌曲到最近播放列表
 */
export function addRecentSong(song: Song): void {
  try {
    const recentSongs = getRecentSongs()

    // 移除已存在的相同歌曲
    const filteredSongs = recentSongs.filter((s) => s.id !== song.id)

    // 添加到列表开头
    const updatedSongs = [song, ...filteredSongs].slice(0, MAX_RECENT_SONGS)

    // 保存到缓存
    setWithExpiry(CACHE_KEYS.RECENT_SONGS, updatedSongs, CACHE_TTL.RECENT_SONGS)
  } catch (error) {
    console.error("添加最近播放失败:", error)
  }
}

/**
 * 清空最近播放列表
 */
export function clearRecentSongs(): void {
  try {
    setWithExpiry(CACHE_KEYS.RECENT_SONGS, [], CACHE_TTL.RECENT_SONGS)
  } catch (error) {
    console.error("清空最近播放失败:", error)
  }
}

/**
 * 获取喜欢的音乐数量
 */
export function getLikedMusicCount(): number {
  try {
    const likedSongs = getLikedSongs()
    return likedSongs.filter((song) => song.source !== "audiobook").length
  } catch (error) {
    console.error("获取喜欢的音乐数量失败:", error)
    return 0
  }
}

/**
 * 获取喜欢的有声书数量
 */
export function getLikedAudiobookCount(): number {
  try {
    const likedSongs = getLikedSongs()
    return likedSongs.filter((song) => song.source === "audiobook").length
  } catch (error) {
    console.error("获取喜欢的有声书数量失败:", error)
    return 0
  }
}

/**
 * 获取最近播放的音乐数量
 */
export function getRecentMusicCount(): number {
  try {
    const recentSongs = getRecentSongs()
    return recentSongs.filter((song) => song.source !== "audiobook").length
  } catch (error) {
    console.error("获取最近播放的音乐数量失败:", error)
    return 0
  }
}

/**
 * 获取最近播放的有声书数量
 */
export function getRecentAudiobookCount(): number {
  try {
    const recentSongs = getRecentSongs()
    return recentSongs.filter((song) => song.source === "audiobook").length
  } catch (error) {
    console.error("获取最近播放的有声书数量失败:", error)
    return 0
  }
}

/**
 * 获取喜欢的歌曲数量
 */
export function getLikedSongsCount(): number {
  try {
    const likedSongs = getLikedSongs()
    return likedSongs.length
  } catch (error) {
    console.error("获取喜欢的歌曲数量失败:", error)
    return 0
  }
}

/**
 * 获取最近播放的歌曲数量
 */
export function getRecentSongsCount(): number {
  try {
    const recentSongs = getRecentSongs()
    return recentSongs.length
  } catch (error) {
    console.error("获取最近播放的歌曲数量失败:", error)
    return 0
  }
}
