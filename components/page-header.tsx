"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { ChevronLeft } from "lucide-react"

interface PageHeaderProps {
  title: string
  onBack: () => void
  rightContent?: React.ReactNode
  showGradient?: boolean
  scrollRef?: React.RefObject<HTMLDivElement>
}

export function PageHeader({ title, onBack, rightContent, showGradient = false, scrollRef }: PageHeaderProps) {
  const [headerOpacity, setHeaderOpacity] = useState(0)

  // 监听滚动事件，用于渐变效果
  useEffect(() => {
    if (!showGradient || !scrollRef?.current) return

    const handleScroll = () => {
      const scrollY = scrollRef.current?.scrollTop || 0
      const newOpacity = Math.min(scrollY / 20, 1)
      setHeaderOpacity(newOpacity)
    }

    const currentScrollRef = scrollRef.current
    if (currentScrollRef) {
      currentScrollRef.addEventListener("scroll", handleScroll)
      return () => {
        currentScrollRef.removeEventListener("scroll", handleScroll)
      }
    }
  }, [showGradient, scrollRef])

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-20 px-4 py-3 flex items-center justify-between transition-colors duration-300`}
      style={{
        backgroundColor: showGradient ? `rgba(0, 0, 0, ${headerOpacity * 0.8})` : "transparent",
        backdropFilter: headerOpacity > 0 ? "blur(8px)" : "none",
      }}
    >
      <button onClick={onBack} className="p-1">
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>

      <h1 className="text-lg font-medium text-white">{title}</h1>

      <div className="flex items-center space-x-4">{rightContent || <div className="w-6"></div>}</div>
    </div>
  )
}
