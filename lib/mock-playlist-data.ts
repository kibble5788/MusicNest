import type { Song } from "@/types/song"

// 网易云音乐测试URL
const NETEASE_TEST_URL = "http://music.163.com/song/media/outer/url?id=447925558.mp3"

// Mock playlist data
export async function mockPlaylistData(): Promise<Song[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))

  return [
    {
      id: "song1",
      title: "别让爱凋落 (DJLHN版)",
      artist: "卢润泽",
      cover: "/abstract-soundscape.png",
      url: NETEASE_TEST_URL,
      duration: 245,
      source: "qq" as const,
    },
    {
      id: "song2",
      title: "别让爱凋落 (DJ小桐版)",
      artist: "卢润泽",
      cover: "/abstract-soundscape.png",
      url: NETEASE_TEST_URL,
      duration: 238,
      source: "qq" as const,
    },
    {
      id: "song3",
      title: "别让爱凋落 (破碎版)",
      artist: "张百万&何文字",
      cover: "/abstract-soundscape.png",
      url: NETEASE_TEST_URL,
      duration: 256,
      source: "qq" as const,
    },
    {
      id: "song4",
      title: "别让爱凋落 (DJ版)",
      artist: "牙籤妹",
      cover: "/abstract-soundscape.png",
      url: NETEASE_TEST_URL,
      duration: 224,
      source: "qq" as const,
    },
    {
      id: "song5",
      title: "别让爱凋落 (纯音版)",
      artist: "等一会就睡",
      cover: "/abstract-geometric-album.png",
      url: NETEASE_TEST_URL,
      duration: 219,
      source: "qq" as const,
    },
    {
      id: "song6",
      title: "别让爱凋落 (卡点节奏版)",
      artist: "任秋",
      cover: "/placeholder.svg?height=300&width=300&query=album+cover+6",
      url: NETEASE_TEST_URL,
      duration: 232,
      source: "qq" as const,
    },
    {
      id: "song7",
      title: "别让爱凋落",
      artist: "好听吗&Tz安竹",
      cover: "/placeholder.svg?height=300&width=300&query=album+cover+7",
      url: NETEASE_TEST_URL,
      duration: 241,
      source: "qq" as const,
    },
    {
      id: "song8",
      title: "别让爱凋落 (烟嗓版)",
      artist: "任秋",
      cover: "/placeholder.svg?height=300&width=300&query=album+cover+8",
      url: NETEASE_TEST_URL,
      duration: 228,
      source: "qq" as const,
    },
    {
      id: "song9",
      title: "别让爱凋落 (Mylove 别叫醒我的梦)",
      artist: "好听吗&Tz安竹",
      cover: "/placeholder.svg?height=300&width=300&query=album+cover+9",
      url: NETEASE_TEST_URL,
      duration: 235,
      source: "qq" as const,
    },
    {
      id: "song10",
      title: "别让爱凋落 (伤感版)",
      artist: "小田音乐厅",
      cover: "/placeholder.svg?height=300&width=300&query=album+cover+10",
      url: NETEASE_TEST_URL,
      duration: 247,
      source: "qq" as const,
    },
  ]
}
