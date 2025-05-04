"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import type { Song } from "@/types/song";
import {
  addLikedSong,
  removeLikedSong,
  isSongLiked,
  addRecentSong,
} from "@/lib/user-music-storage";

interface MusicContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  queue: Song[];
  showPlayerUI: boolean;
  contentType: "music" | "audiobook";
  isLiked: boolean;
  playSong: (song: Song) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  nextSong: () => void;
  previousSong: () => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setShowPlayerUI: (show: boolean) => void;
  toggleLike: () => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

// 创建一个全局audio元素
let globalAudio: HTMLAudioElement | null = null;

// 网易云音乐测试URL
const NETEASE_TEST_URL =
  "http://music.163.com/song/media/outer/url?id=447925558.mp3";

export function MusicProvider({ children }: { children: ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [showPlayerUI, setShowPlayerUI] = useState(false);
  const [songHistory, setSongHistory] = useState<Song[]>([]);
  const [contentType, setContentType] = useState<"music" | "audiobook">(
    "music"
  );
  const [isLiked, setIsLiked] = useState(false);

  // 初始化全局audio元素
  useEffect(() => {
    globalAudio = new Audio();

    // 添加全局错误处理
    globalAudio.addEventListener("error", (e) => {
      console.error("全局音频错误:", e);
      setIsPlaying(false);
    });
    return () => {
      // 不在组件卸载时销毁全局audio元素
      globalAudio = null;
    };
  }, []);

  // 当当前歌曲改变时，检查是否已被喜欢
  useEffect(() => {
    if (currentSong) {
      setIsLiked(isSongLiked(currentSong.id));
    } else {
      setIsLiked(false);
    }
  }, [currentSong]);

  // Play a song
  const playSong = useCallback((song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    setShowPlayerUI(true); // 自动显示播放器UI

    // 添加到最近播放列表
    addRecentSong(song);

    // Set content type based on song source
    if (song.source === "audiobook") {
      setContentType("audiobook");
    } else {
      setContentType("music");
    }
  }, []);

  // Pause the current song
  const pauseSong = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Resume the current song
  const resumeSong = useCallback(() => {
    if (currentSong) {
      setIsPlaying(true);
    }
  }, [currentSong]);

  // Play the next song in the queue
  const nextSong = useCallback(() => {
    if (queue.length > 0) {
      // 将当前歌曲添加到历史记录
      if (currentSong) {
        setSongHistory((prev) => [...prev, currentSong]);
      }

      const nextSong = queue[0];
      setCurrentSong(nextSong);
      setQueue((prevQueue) => prevQueue.slice(1));
      setIsPlaying(true);

      // 添加到最近播放列表
      addRecentSong(nextSong);
    } else {
      // 如果队列为空，可以模拟一个新歌曲
      const mockNextSong = {
        id: 1,
        title: "下一首模拟歌曲",
        artist: "模拟歌手",
        album: "模拟专辑",
        cover: `/placeholder.svg?height=400&width=400&query=album+cover+next`,
        url: NETEASE_TEST_URL, // 使用网易云音乐测试URL
        duration: 180 + Math.floor(1 * 120),
      };

      if (currentSong) {
        setSongHistory((prev) => [...prev, currentSong]);
      }

      setCurrentSong(mockNextSong);
      setIsPlaying(true);

      // 添加到最近播放列表
      addRecentSong(mockNextSong);
    }
  }, [queue, currentSong]);

  // Play the previous song
  const previousSong = useCallback(() => {
    if (songHistory.length > 0) {
      // 获取最近的历史歌曲
      const prevSong = songHistory[songHistory.length - 1];

      // 将当前歌曲添加到队列前面
      if (currentSong) {
        setQueue((prev) => [currentSong, ...prev]);
      }

      // 设置前一首歌曲为当前歌曲
      setCurrentSong(prevSong);

      // 从历史记录中移除该歌曲
      setSongHistory((prev) => prev.slice(0, -1));

      setIsPlaying(true);
    } else {
      // 如果没有历史记录，可以模拟一个前一首歌曲
      const mockPrevSong = {
        id: Math.random().toString(),
        title: "上一首模拟歌曲",
        artist: "模拟歌手",
        album: "模拟专辑",
        cover: `/placeholder.svg?height=400&width=400&query=album+cover+previous`,
        url: NETEASE_TEST_URL, // 使用网易云音乐测试URL
        duration: 180 + Math.floor(Math.random() * 120),
      };

      if (currentSong) {
        setQueue((prev) => [currentSong, ...prev]);
      }

      setCurrentSong(mockPrevSong);
      setIsPlaying(true);

      // 添加到最近播放列表
      addRecentSong(mockPrevSong);
    }
  }, [songHistory, currentSong]);

  // Add a song to the queue
  const addToQueue = useCallback((song: Song) => {
    setQueue((prevQueue) => [...prevQueue, song]);
  }, []);

  // Remove a song from the queue
  const removeFromQueue = useCallback((id: string) => {
    setQueue((prevQueue) => prevQueue.filter((song) => song.id !== id));
  }, []);

  // Clear the queue
  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  // Toggle like status for current song
  const toggleLike = useCallback(() => {
    if (!currentSong) return;

    const newLikedStatus = !isLiked;
    setIsLiked(newLikedStatus);

    if (newLikedStatus) {
      addLikedSong(currentSong);
    } else {
      removeLikedSong(currentSong.id);
    }
  }, [currentSong, isLiked]);

  return (
    <MusicContext.Provider
      value={{
        currentSong,
        isPlaying,
        queue,
        showPlayerUI,
        contentType,
        isLiked,
        playSong,
        pauseSong,
        resumeSong,
        nextSong,
        previousSong,
        addToQueue,
        removeFromQueue,
        clearQueue,
        setShowPlayerUI,
        toggleLike,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  const context = useContext(MusicContext);
  if (context === undefined) {
    throw new Error("useMusic must be used within a MusicProvider");
  }
  return context;
}
