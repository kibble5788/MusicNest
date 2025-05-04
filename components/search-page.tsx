"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  Search,
  Mic,
  X,
  User,
  Music,
  Hash,
  Scan,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SongCard } from "@/components/song-card";
import { mockSearch } from "@/lib/mock-data";
import type { Song } from "@/types/song";
import { SkeletonSearchResults } from "@/components/skeletons/skeleton-search-results";
import { SkeletonSearchPage } from "@/components/skeletons/skeleton-search-page";

// Define the types
interface SearchHistory {
  id: string;
  text: string;
}

interface PopularSearch {
  id: string;
  text: string;
  icon?: string;
  hot?: boolean;
}

interface Discovery {
  id: string;
  title: string;
  description: string;
  image?: string;
  tag?: string;
}

// Update the SearchPageProps interface to include setHideNavigation
interface SearchPageProps {
  type: "music" | "audiobook";
  onBack: () => void;
  setHideNavigation?: (hide: boolean) => void;
}

export default function SearchPage({
  type,
  onBack,
  setHideNavigation,
}: SearchPageProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [popularSearches, setPopularSearches] = useState<PopularSearch[]>([]);
  const [discoveries, setDiscoveries] = useState<Discovery[]>([]);
  const [showClearButton, setShowClearButton] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Hide navigation when this component mounts
  useEffect(() => {
    if (setHideNavigation) {
      setHideNavigation(true);
    }

    // Show navigation again when component unmounts
    return () => {
      if (setHideNavigation) {
        setHideNavigation(false);
      }
    };
  }, [setHideNavigation]);

  // Load search history from localStorage
  useEffect(() => {
    const loadData = async () => {
      try {
        const storedHistory = localStorage.getItem(`${type}-search-history`);
        if (storedHistory) {
          setSearchHistory(JSON.parse(storedHistory));
        }

        // Set mock data based on type
        if (type === "music") {
          setPopularSearches([
            { id: "1", text: "跳楼机", icon: "🔥" },
            { id: "2", text: "别让爱凋落", icon: "🎵", hot: true },
            { id: "3", text: "李灿烁签名专辑", icon: "🔥" },
            { id: "4", text: "陶喆", hot: false },
            { id: "5", text: "KEY 宝丽来", hot: false },
            { id: "6", text: "时代少年团", hot: false },
            { id: "7", text: "许嵩 巡演歌单", hot: false },
            { id: "8", text: "大山", hot: false },
          ]);

          setDiscoveries([
            {
              id: "1",
              title: "新一轮抽奖又来喽：李灿烁签专！",
              description: "快来试试手气吧！",
              image: "/music-search-promo-1.png",
              tag: "抽奖",
            },
            {
              id: "2",
              title: "春日无限好会员折扣活动~",
              description: "会员低至0.22元每天，立即抢购>>",
              image: "/music-search-promo-2.png",
              tag: "活动",
            },
            {
              id: "3",
              title: "KEY的宝丽来签名照幸运抽奖",
              description: "要的立刻！",
              image: "/music-search-promo-3.png",
              tag: "活动",
            },
            {
              id: "4",
              title: "终于等到了！ 陶喆的第八张专辑！",
              description: "听就是了，立即支持>>",
              image: "/music-search-promo-4.png",
              tag: "抽奖",
            },
            {
              id: "5",
              title: "许嵩2025「呼吸之野」巡演歌单上线",
              description: "立即聆听>>",
              image: "/music-search-promo-5.png",
            },
          ]);
        } else {
          // Audiobook specific popular searches
          setPopularSearches([
            { id: "1", text: "盗墓笔记", icon: "🔥" },
            { id: "2", text: "鬼吹灯", icon: "🎧", hot: true },
            { id: "3", text: "明朝那些事", icon: "🔥" },
            { id: "4", text: "三体", hot: false },
            { id: "5", text: "余罪", hot: false },
            { id: "6", text: "天官赐福", hot: false },
            { id: "7", text: "斗破苍穹", hot: false },
            { id: "8", text: "哈利波特", hot: false },
          ]);

          // Audiobook specific discoveries
          setDiscoveries([
            {
              id: "1",
              title: "新上线：《盗墓笔记》完整版",
              description: "南派三叔经典作品，专业剧组出演",
              image: "/audiobook-search-promo-1.png",
              tag: "新书",
            },
            {
              id: "2",
              title: "有声书会员特惠，一年仅需99元",
              description: "海量有声书畅听无限制>>",
              image: "/audiobook-search-promo-2.png",
              tag: "活动",
            },
            {
              id: "3",
              title: "《三体》宇宙全集，科幻经典",
              description: "豆瓣9.3高分推���",
              image: "/audiobook-search-promo-3.png",
              tag: "热门",
            },
          ]);
        }
      } catch (error) {
        console.error("Failed to load search data:", error);
      } finally {
        // Add a small delay to simulate loading
        setTimeout(() => {
          setIsInitialLoading(false);
        }, 500);
      }
    };

    loadData();
  }, [type]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchTerm.trim()) return;

    setIsSearching(true);
    setSearchResults([]); // Clear previous results while searching

    try {
      // 模拟API请求
      const results = await mockSearch(searchTerm);

      // 根据类型选择不同的搜索结果
      if (type === "music") {
        setSearchResults([...results.qq, ...results.netease]);
      } else {
        setSearchResults(results.audiobooks);
      }

      // 添加到搜索历史
      const newHistory = { id: "", text: searchTerm };
      const updatedHistory = [
        newHistory,
        ...searchHistory.filter((item) => item.text !== searchTerm).slice(0, 9),
      ];
      setSearchHistory(updatedHistory);

      try {
        localStorage.setItem(
          `${type}-search-history`,
          JSON.stringify(updatedHistory)
        );
      } catch (error) {
        console.error("Failed to save search history:", error);
      }
    } catch (error) {
      console.error("搜索失败:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHistoryItemClick = (text: string) => {
    setSearchTerm(text);
    // Immediately perform search with the selected text
    setTimeout(() => {
      // Using setTimeout to ensure the searchTerm is updated before searching
      const performSearch = async () => {
        setIsSearching(true);
        setSearchResults([]); // Clear previous results while searching

        try {
          // 模拟API请求
          const results = await mockSearch(text);

          // 根据类型选择不同的搜索结果
          if (type === "music") {
            setSearchResults([...results.qq, ...results.netease]);
          } else {
            setSearchResults(results.audiobooks);
          }

          // Add to search history if not already at the top
          if (
            !searchHistory.some((item) => item.text === text) ||
            searchHistory[0].text !== text
          ) {
            const newHistory = { id: "", text: text };
            const updatedHistory = [
              newHistory,
              ...searchHistory.filter((item) => item.text !== text).slice(0, 9),
            ];
            setSearchHistory(updatedHistory);

            try {
              localStorage.setItem(
                `${type}-search-history`,
                JSON.stringify(updatedHistory)
              );
            } catch (error) {
              console.error("Failed to save search history:", error);
            }
          }
        } catch (error) {
          console.error("搜索失败:", error);
        } finally {
          setIsSearching(false);
        }
      };

      performSearch();
    }, 0);
  };

  const handlePopularSearchClick = (text: string) => {
    setSearchTerm(text);
    // Immediately perform search with the selected text
    setTimeout(() => {
      // Using setTimeout to ensure the searchTerm is updated before searching
      const performSearch = async () => {
        setIsSearching(true);
        setSearchResults([]); // Clear previous results while searching

        try {
          // 模拟API请求
          const results = await mockSearch(text);

          // 根据类型选择不同的搜索结果
          if (type === "music") {
            setSearchResults([...results.qq, ...results.netease]);
          } else {
            setSearchResults(results.audiobooks);
          }

          // Add to search history
          const newHistory = { id: "", text: text };
          const updatedHistory = [
            newHistory,
            ...searchHistory.filter((item) => item.text !== text).slice(0, 9),
          ];
          setSearchHistory(updatedHistory);

          try {
            localStorage.setItem(
              `${type}-search-history`,
              JSON.stringify(updatedHistory)
            );
          } catch (error) {
            console.error("Failed to save search history:", error);
          }
        } catch (error) {
          console.error("搜索失败:", error);
        } finally {
          setIsSearching(false);
        }
      };

      performSearch();
    }, 0);
  };

  const clearSearchTerm = () => {
    setSearchTerm("");
    setSearchResults([]);
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(`${type}-search-history`);
    } catch (error) {
      console.error("Failed to clear search history:", error);
    }
  };

  if (isInitialLoading) {
    return <SkeletonSearchPage />;
  }

  return (
    <div className="min-h-screen pb-20">
      {/* 搜索栏 */}
      <div className="p-4 pr-0 sticky top-0 z-10">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-gray-400"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </Button>

          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="text"
              placeholder={
                type === "music" ? "别让爱凋落" : "搜索有声书、作者或分类"
              }
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowClearButton(!!e.target.value);
              }}
              onFocus={() => setInputFocused(true)}
              className="pl-10 pr-10 py-2 bg-gray-800 border-none rounded-full text-white focus:outline-none focus:ring-0 focus:border-0"
              autoFocus
            />
            {showClearButton && (
              <button
                type="button"
                onClick={clearSearchTerm}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          <Button
            type="button"
            onClick={onBack}
            variant="ghost"
            className="text-gray-400"
          >
            取消
          </Button>
        </form>
      </div>

      {/* 分类过滤器 - 只在没有搜索结果且不在搜索中时显示 */}
      {!searchResults.length && !isSearching && (
        <div className="flex justify-around px-4 py-3">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex items-center justify-center">
              <User className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xs mt-1">
              {type === "music" ? "歌手" : "作者"}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex items-center justify-center">
              <Music className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xs mt-1">
              {type === "music" ? "曲风" : "分类"}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex items-center justify-center">
              <Hash className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xs mt-1">
              {type === "music" ? "识曲" : "榜单"}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#1e1e1e] flex items-center justify-center">
              <Scan className="h-6 w-6 text-emerald-400" />
            </div>
            <span className="text-xs mt-1">扫一扫</span>
          </div>
        </div>
      )}

      {/* 搜索中显示骨架屏 */}
      {isSearching ? (
        <SkeletonSearchResults />
      ) : searchResults.length > 0 ? (
        // 搜索结果
        <div className="px-4 space-y-2">
          <h2 className="text-lg font-medium mb-2">搜索结果</h2>
          {searchResults.map((song) => (
            <SongCard key={song.id} song={song} layout="list" />
          ))}
        </div>
      ) : (
        // 未搜索或无结果时显示历史记录和推荐
        <>
          {/* 历史记录 */}
          {searchHistory.length > 0 && (
            <div className="px-4 mt-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg text-gray-300">历史记录</h2>
                <button onClick={clearSearchHistory} className="text-gray-500">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-[#2a2a2a] rounded-full px-4 py-2 text-sm"
                    onClick={() => handleHistoryItemClick(item.text)}
                  >
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 大家都在搜 */}
          <div className="px-4 mt-6">
            <h2 className="text-lg text-gray-300 mb-2">大家都在搜</h2>
            <div className="grid grid-cols-2 gap-2">
              {popularSearches.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "bg-[#2a2a2a] rounded-full px-4 py-2 text-sm flex items-center",
                    item.hot && "bg-opacity-70"
                  )}
                  onClick={() => handlePopularSearchClick(item.text)}
                >
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 搜索发现 */}
          <div className="px-4 mt-6">
            <h2 className="text-lg text-gray-300 mb-2">搜索发现</h2>
            <div className="space-y-4">
              {discoveries.map((item) => (
                <div key={item.id} className="flex items-center">
                  <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-800 mr-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="text-sm font-medium">{item.title}</h3>
                      {item.tag && (
                        <span className="ml-2 text-xs px-1.5 py-0.5 bg-emerald-400 text-black rounded">
                          {item.tag}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
