import type { Song } from "@/types/song"
import { generateId } from "@/lib/utils"

// 网易云音乐测试URL
const NETEASE_TEST_URL = "http://music.163.com/song/media/outer/url?id=447925558.mp3"

// 模拟收藏歌曲
export const mockFavorites: Song[] = [
  {
    id: generateId(),
    title: "我喜欢的歌曲 1",
    artist: "最爱歌手",
    album: "精选集",
    cover: "/musical-expressions.png",
    url: NETEASE_TEST_URL,
    duration: 245,
    source: "qq",
  },
  {
    id: generateId(),
    title: "我喜欢的歌曲 2",
    artist: "流行歌手",
    album: "热门专辑",
    cover: "/musical-expressions.png",
    url: NETEASE_TEST_URL,
    duration: 198,
    source: "netease",
  },
  {
    id: generateId(),
    title: "我喜欢的歌曲 3",
    artist: "独立音乐人",
    album: "新专辑",
    cover: "/musical-instruments-collage.png",
    url: NETEASE_TEST_URL,
    duration: 312,
    source: "qq",
  },
]

// 模拟播放历史
export const mockHistory: Song[] = [
  {
    id: generateId(),
    title: "最近播放 1",
    artist: "热门歌手",
    album: "流行专辑",
    cover: "/abstract-soundscape.png",
    url: NETEASE_TEST_URL,
    duration: 267,
    source: "netease",
  },
  {
    id: generateId(),
    title: "最近播放 2",
    artist: "经典歌手",
    album: "老歌集",
    cover: "/vibrant-music-scene.png",
    url: NETEASE_TEST_URL,
    duration: 224,
    source: "qq",
  },
  {
    id: generateId(),
    title: "最近播放 3",
    artist: "新锐歌手",
    album: "首张专辑",
    cover: "/abstract-soundscape.png",
    url: NETEASE_TEST_URL,
    duration: 189,
    source: "netease",
  },
  {
    id: generateId(),
    title: "最近播放 4",
    artist: "国际歌手",
    album: "全球热门",
    cover: "/abstract-soundscape.png",
    url: NETEASE_TEST_URL,
    duration: 301,
    source: "qq",
  },
]

// 模拟本地音乐
export const mockLocalMusic: Song[] = [
  {
    id: generateId(),
    title: "本地音乐 1",
    artist: "已下载",
    album: "我的收藏",
    cover: "/vibrant-local-music-scene.png",
    url: NETEASE_TEST_URL,
    duration: 278,
    source: "qq",
  },
  {
    id: generateId(),
    title: "本地音乐 2",
    artist: "已下载",
    album: "我的��藏",
    cover: "/vibrant-local-stage.png",
    url: NETEASE_TEST_URL,
    duration: 235,
    source: "netease",
  },
]
