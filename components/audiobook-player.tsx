"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
  Heart,
  Share2,
  List,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { audiobookApiClient } from "@/lib/mock-audiobook-api";
import type {
  Audiobook,
  Chapter,
  AudiobookPlayProgress,
} from "@/types/audiobook";
import { formatTime } from "@/lib/utils";
import { LoadingSpinner } from "@/components/loading-spinner";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

interface AudiobookPlayerProps {
  bookId: string;
  chapterId?: string;
  onBack: () => void;
  setHideNavigation?: (hide: boolean) => void;
}

export default function AudiobookPlayer({
  bookId,
  chapterId,
  onBack,
  setHideNavigation,
}: AudiobookPlayerProps) {
  // 状态
  const [audiobook, setAudiobook] = useState<Audiobook | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [nextChapter, setNextChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showChapterList, setShowChapterList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [sleepTimer, setSleepTimer] = useState<number | null>(null);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 隐藏底部导航
  useEffect(() => {
    if (setHideNavigation) {
      setHideNavigation(true);
    }

    return () => {
      if (setHideNavigation) {
        setHideNavigation(false);
      }
    };
  }, [setHideNavigation]);

  // 加载有声书详情
  useEffect(() => {
    const fetchAudiobookDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await audiobookApiClient.getAudiobookDetail(bookId);
        setAudiobook(response.book);

        // 获取播放进度
        const progress = await audiobookApiClient.getPlayProgress(bookId);

        // 确定要播放的章节
        let targetChapterId = chapterId;

        if (!targetChapterId && progress) {
          targetChapterId = progress.chapterId;
        }

        if (
          !targetChapterId &&
          response.book.chapters &&
          response.book.chapters.length > 0
        ) {
          targetChapterId = response.book.chapters[0].id;
        }

        if (targetChapterId) {
          await loadChapter(bookId, targetChapterId, progress?.progress || 0);
        }
      } catch (err) {
        console.error("加载有声书详情失败:", err);
        setError(err instanceof Error ? err.message : "加载有声书详情失败");
        toast.error("加载有声书详情失败，请稍后重试");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudiobookDetail();

    // 清理函数
    return () => {
      if (progressSaveTimerRef.current) {
        clearInterval(progressSaveTimerRef.current);
      }

      if (sleepTimerRef.current) {
        clearTimeout(sleepTimerRef.current);
      }
    };
  }, [bookId, chapterId]);

  // 加载章节
  const loadChapter = async (
    bookId: string,
    chapterId: string,
    initialProgress = 0
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await audiobookApiClient.getChapterDetail(
        bookId,
        chapterId
      );
      setCurrentChapter(response.chapter);
      setNextChapter(response.nextChapter);

      // 设置音频源
      if (audioRef.current) {
        audioRef.current.src = response.chapter.url;
        audioRef.current.currentTime = initialProgress;

        // 如果之前在播放，则继续播放
        if (isPlaying) {
          try {
            await audioRef.current.play();
          } catch (err) {
            console.error("自动播放失败:", err);
            setIsPlaying(false);
          }
        }
      }

      // 设置定时保存进度
      if (progressSaveTimerRef.current) {
        clearInterval(progressSaveTimerRef.current);
      }

      progressSaveTimerRef.current = setInterval(() => {
        savePlayProgress();
      }, 30000); // 每30秒保存一次进度
    } catch (err) {
      console.error("加载章节失败:", err);
      setError(err instanceof Error ? err.message : "加载章节失败");
      toast.error("加载章节失败，请稍后重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 保存播放进度
  const savePlayProgress = useCallback(() => {
    if (!audioRef.current || !currentChapter || !bookId) return;

    const progress: AudiobookPlayProgress = {
      bookId,
      chapterId: currentChapter.id,
      progress: audioRef.current.currentTime,
      timestamp: 1745643829517,
    };

    audiobookApiClient
      .savePlayProgress(progress)
      .catch((err) => console.error("保存播放进度失败:", err));
  }, [bookId, currentChapter]);

  // 处理播放/暂停
  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.error("播放失败:", err);
        toast.error("播放失败，请稍后重试");
      });
    }
  };

  // 处理静音
  const toggleMute = () => {
    if (!audioRef.current) return;

    const newMuteState = !isMuted;
    audioRef.current.muted = newMuteState;
    setIsMuted(newMuteState);
  };

  // 处理音量变化
  const handleVolumeChange = (value: number[]) => {
    if (!audioRef.current) return;

    const newVolume = value[0];
    audioRef.current.volume = newVolume;
    setVolume(newVolume);

    if (newVolume === 0) {
      setIsMuted(true);
      audioRef.current.muted = true;
    } else if (isMuted) {
      setIsMuted(false);
      audioRef.current.muted = false;
    }
  };

  // 处理进度条变化
  const handleProgressChange = (value: number[]) => {
    if (!audioRef.current) return;

    const newTime = value[0];
    setCurrentTime(newTime);

    if (!isDragging) {
      audioRef.current.currentTime = newTime;
    }
  };

  // 处理进度条拖动开始
  const handleProgressDragStart = () => {
    setIsDragging(true);
  };

  // 处理进度条拖动结束
  const handleProgressDragEnd = (value: number[]) => {
    if (!audioRef.current) return;

    const newTime = value[0];
    audioRef.current.currentTime = newTime;
    setIsDragging(false);
  };

  // 处理播放速率变化
  const handlePlaybackRateChange = (rate: number) => {
    if (!audioRef.current) return;

    audioRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
    toast.success(`播放速度: ${rate}x`);
  };

  // 处理上一章/下一章
  const handlePreviousChapter = () => {
    if (!audiobook || !currentChapter || !audiobook.chapters) return;

    const currentIndex = audiobook.chapters.findIndex(
      (c) => c.id === currentChapter.id
    );
    if (currentIndex > 0) {
      const prevChapter = audiobook.chapters[currentIndex - 1];
      loadChapter(bookId, prevChapter.id);
    } else {
      // 已经是第一章，重新播放当前章节
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
      }
    }
  };

  const handleNextChapter = () => {
    if (!nextChapter) {
      // toast.info("已经是最后一章了");
      return;
    }

    loadChapter(bookId, nextChapter.id);
  };

  // 处理收藏
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? "已取消收藏" : "已添加到收藏");
  };

  // 处理分享
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: audiobook?.title || "有声书分享",
          text: `我正在收听《${audiobook?.title}》，推荐给你！`,
          url: window.location.href,
        })
        .catch((err) => {
          console.error("分享失败:", err);
        });
    } else {
      // 复制链接到剪贴板
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => toast.success("链接已复制到剪贴板"))
        .catch((err) => {
          console.error("复制链接失败:", err);
          toast.error("复制链接失败");
        });
    }
  };

  // 设置睡眠定时器
  const setSleepTimerMinutes = (minutes: number) => {
    if (sleepTimerRef.current) {
      clearTimeout(sleepTimerRef.current);
    }

    if (minutes <= 0) {
      setSleepTimer(null);
      setRemainingTime(null);
      toast.success("已取消睡眠定时");
      return;
    }

    const milliseconds = minutes * 60 * 1000;
    setSleepTimer(minutes);
    setRemainingTime(milliseconds);

    // 更新剩余时间
    const startTime = 1745643829517;
    const updateRemainingTime = () => {
      const elapsed = 1745643829517 - startTime;
      const remaining = milliseconds - elapsed;

      if (remaining <= 0) {
        // 时间到，暂停播放
        if (audioRef.current) {
          audioRef.current.pause();
        }
        setSleepTimer(null);
        setRemainingTime(null);
        toast.success("睡眠定时已结束，已暂停播放");
        return;
      }

      setRemainingTime(remaining);
      sleepTimerRef.current = setTimeout(updateRemainingTime, 1000);
    };

    sleepTimerRef.current = setTimeout(updateRemainingTime, 1000);
    toast.success(`已设置${minutes}分钟后停止播放`);
    setShowSettings(false);
  };

  // 音频事件处理
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleDurationChange = () => {
      setDuration(audio.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);

      // 自动播放下一章
      if (nextChapter) {
        setTimeout(() => {
          loadChapter(bookId, nextChapter.id);
        }, 1500);
      }
    };

    const handleError = () => {
      setError("音频加载失败");
      setIsPlaying(false);
      toast.error("音频加载失败，请稍后重试");
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
    };
  }, [isDragging, nextChapter, bookId]);

  // 在组件卸载前保存进度
  useEffect(() => {
    return () => {
      savePlayProgress();
    };
  }, [savePlayProgress]);

  // 渲染章节列表
  const renderChapterList = () => {
    if (!audiobook || !audiobook.chapters) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-medium">章节列表</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowChapterList(false)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {audiobook.chapters.map((chapter) => (
            <div
              key={chapter.id}
              className={cn(
                "flex items-center justify-between p-4 border-b border-gray-800 cursor-pointer",
                currentChapter?.id === chapter.id && "bg-gray-800/50"
              )}
              onClick={() => {
                loadChapter(bookId, chapter.id);
                setShowChapterList(false);
              }}
            >
              <div className="flex items-center">
                {currentChapter?.id === chapter.id && (
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                )}
                <div>
                  <h3 className="text-sm font-medium">{chapter.title}</h3>
                  <p className="text-xs text-gray-400">
                    {formatTime(chapter.duration)}
                  </p>
                </div>
              </div>

              {chapter.isLocked && (
                <div className="text-xs bg-amber-500/20 text-amber-500 px-2 py-1 rounded">
                  VIP
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染设置面板
  const renderSettings = () => {
    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h2 className="text-xl font-medium">设置</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(false)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>

        <div className="flex-1 p-4 space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">播放速度</h3>
            <div className="grid grid-cols-5 gap-2">
              {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                <Button
                  key={rate}
                  variant={playbackRate === rate ? "default" : "outline"}
                  className={
                    playbackRate === rate ? "bg-emerald-500 text-black" : ""
                  }
                  onClick={() => handlePlaybackRateChange(rate)}
                >
                  {rate}x
                </Button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">睡眠定时</h3>
            <div className="grid grid-cols-4 gap-2">
              {[15, 30, 45, 60, 90, 120].map((minutes) => (
                <Button
                  key={minutes}
                  variant={sleepTimer === minutes ? "default" : "outline"}
                  className={
                    sleepTimer === minutes ? "bg-emerald-500 text-black" : ""
                  }
                  onClick={() => setSleepTimerMinutes(minutes)}
                >
                  {minutes}分钟
                </Button>
              ))}
              <Button
                variant={sleepTimer === null ? "default" : "outline"}
                className={sleepTimer === null ? "bg-red-500 text-white" : ""}
                onClick={() => setSleepTimerMinutes(0)}
              >
                关闭
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col">
      {/* 隐藏的音频元素 */}
      <audio ref={audioRef} preload="auto" />

      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-medium truncate flex-1 text-center">
            {audiobook?.title || "有声书播放器"}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col p-4">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <LoadingSpinner className="h-12 w-12" />
          </div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>重试</Button>
          </div>
        ) : (
          <>
            {/* 封面 */}
            <div className="flex-1 flex items-center justify-center py-8">
              <div
                className={cn(
                  "w-64 h-64 rounded-lg overflow-hidden shadow-lg",
                  isPlaying && "animate-pulse-scale"
                )}
              >
                <img
                  src={
                    audiobook?.cover ||
                    "/placeholder.svg?height=400&width=400&query=audiobook+cover"
                  }
                  alt={audiobook?.title || "有声书封面"}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* 信息 */}
            <div className="mb-8 text-center">
              <h2 className="text-xl font-bold mb-2">
                {currentChapter?.title || "未知章节"}
              </h2>
              <p className="text-gray-400">
                {audiobook?.author.name || "未知作者"} ·{" "}
                {audiobook?.narrator || "未知播音"}
              </p>
            </div>

            {/* 进度条 */}
            <div className="mb-6">
              <Slider
                value={[currentTime]}
                max={duration || 100}
                step={1}
                onValueChange={handleProgressChange}
                onValueCommit={handleProgressDragEnd}
                onPointerDown={handleProgressDragStart}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* 控制按钮 */}
            <div className="flex items-center justify-center space-x-8 mb-8">
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePreviousChapter}
                className="text-white"
              >
                <SkipBack className="h-6 w-6" />
              </Button>

              <Button
                variant="default"
                size="icon"
                onClick={togglePlayPause}
                className="h-16 w-16 rounded-full bg-emerald-500 text-black"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8" />
                ) : (
                  <Play className="h-8 w-8 ml-1" />
                )}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleNextChapter}
                disabled={!nextChapter}
                className={cn("text-white", !nextChapter && "opacity-50")}
              >
                <SkipForward className="h-6 w-6" />
              </Button>
            </div>

            {/* 额外控制 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="icon" onClick={toggleMute}>
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                <div className="w-24">
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={1}
                    step={0.01}
                    onValueChange={handleVolumeChange}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={toggleFavorite}>
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isFavorite && "fill-red-500 text-red-500"
                    )}
                  />
                </Button>

                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="h-5 w-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowChapterList(true)}
                >
                  <List className="h-5 w-5" />
                </Button>

                {sleepTimer && (
                  <Button variant="ghost" size="icon" className="relative">
                    <Clock className="h-5 w-5 text-emerald-500" />
                    <span className="absolute -top-1 -right-1 text-xs bg-emerald-500 text-black rounded-full w-4 h-4 flex items-center justify-center">
                      {Math.ceil((remainingTime || 0) / 60000)}
                    </span>
                  </Button>
                )}
              </div>
            </div>

            {/* 播放速率显示 */}
            {playbackRate !== 1 && (
              <div className="text-center text-sm text-emerald-500 mb-4">
                播放速度: {playbackRate}x
              </div>
            )}
          </>
        )}
      </div>

      {/* 章节列表弹窗 */}
      {showChapterList && renderChapterList()}

      {/* 设置面板 */}
      {showSettings && renderSettings()}
    </div>
  );
}
