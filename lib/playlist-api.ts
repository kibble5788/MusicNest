import { mockPlaylists, mockMusicData } from "@/lib/mock-data";
import { setWithExpiry, getWithExpiry } from "@/lib/local-storage";

// 定义缓存键名
const CACHE_KEYS = {
  PLAYLISTS: "cached_playlists",
  MUSIC_DATA: "cached_music_data",
};

// 定义缓存过期时间（毫秒）
const CACHE_TTL = {
  PLAYLISTS: 30 * 60 * 1000, // 30分钟
  MUSIC_DATA: 15 * 60 * 1000, // 15分钟
};

// 定义返回的数据类型
export interface PlaylistsResponse {
  playlists: Array<{
    id: string;
    title: string;
    cover: string;
    songCount: number;
    listenCount?: number; // 添加收听人数字段
  }>;
}

export interface MusicDataResponse {
  recommended: any[];
  newReleases: any[];
  topCharts: any[];
  playlists: any[];
  trending: any[];
}

/**
 * 获取歌单列表
 * @param forceRefresh 是否强制刷新缓存
 * @returns 歌单列表数据
 */
export async function getPlaylists(
  forceRefresh = false
): Promise<PlaylistsResponse> {
  // 如果不是强制刷新，尝试从缓存获取
  if (!forceRefresh) {
    const cachedData = getWithExpiry<PlaylistsResponse>(CACHE_KEYS.PLAYLISTS);
    if (cachedData) {
      console.log("Using cached playlists data");
      return cachedData;
    }
  }

  try {
    // 在实际应用中，这里会是真实的 API 调用
    // const response = await axios.get('/api/playlists');
    // const data = response.data;

    // 使用 mock 数据
    const mockData = await mockPlaylists();

    // 为每个歌单添加随机的收听人数
    const playlists = mockData.map((playlist) => ({
      ...playlist,
      listenCount: Math.floor(1 * 90000) + 10000, // 1万到10万之间的随机数
    }));

    const data: PlaylistsResponse = { playlists };

    // 缓存数据
    setWithExpiry(CACHE_KEYS.PLAYLISTS, data, CACHE_TTL.PLAYLISTS);

    return data;
  } catch (error) {
    console.error("Failed to fetch playlists:", error);

    // 如果请求失败，尝试使用可能过期的缓存
    const expiredCache = getWithExpiry<PlaylistsResponse>(CACHE_KEYS.PLAYLISTS);
    if (expiredCache) {
      console.log("Using expired playlists cache due to fetch error");
      return expiredCache;
    }

    // 如果没有缓存，则使用 mock 数据
    const mockData = await mockPlaylists();
    const playlists = mockData.map((playlist) => ({
      ...playlist,
      listenCount: Math.floor(Math.random() * 90000) + 10000,
    }));

    return { playlists };
  }
}

/**
 * 获取音乐数据
 * @param forceRefresh 是否强制刷新缓存
 * @returns 音乐数据
 */
export async function getMusicData(
  forceRefresh = false
): Promise<MusicDataResponse> {
  // 如果不是强制刷新，尝试从缓存获取
  if (!forceRefresh) {
    const cachedData = getWithExpiry<MusicDataResponse>(CACHE_KEYS.MUSIC_DATA);
    if (cachedData) {
      console.log("Using cached music data");
      return cachedData;
    }
  }

  try {
    // 在实际应用中，这里会是真实的 API 调用
    // const response = await axios.get('/api/music-data');
    // const data = response.data;

    // 使用 mock 数据
    const data = await mockMusicData();

    // 缓存数据
    setWithExpiry(CACHE_KEYS.MUSIC_DATA, data, CACHE_TTL.MUSIC_DATA);

    return data;
  } catch (error) {
    console.error("Failed to fetch music data:", error);

    // 如果请求失败，尝试使用可能过期的缓存
    const expiredCache = getWithExpiry<MusicDataResponse>(
      CACHE_KEYS.MUSIC_DATA
    );
    if (expiredCache) {
      console.log("Using expired music data cache due to fetch error");
      return expiredCache;
    }

    // 如果没有缓存，则使用 mock 数据
    return await mockMusicData();
  }
}

/**
 * 格式化数字为易读形式
 * @param num 要格式化的数字
 * @returns 格式化后的字符串，如 "1.2万"
 */
export function formatListenCount(count: number): string {
  if (count >= 10000) {
    return `${(count / 10000).toFixed(1)}万`;
  }
  return count.toString();
}
