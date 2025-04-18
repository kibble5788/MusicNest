"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"

interface VirtualListProps<T> {
  data: T[]
  height: number
  itemHeight: number
  renderItem: ({ index, data }: { index: number; data: T[] }) => React.ReactNode
  containerRef?: React.RefObject<HTMLDivElement>
  overscan?: number
}

export function VirtualList<T>({
  data,
  height,
  itemHeight,
  renderItem,
  containerRef,
  overscan = 3,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0)
  const innerRef = useRef<HTMLDivElement>(null)

  const totalHeight = data.length * itemHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(data.length - 1, Math.floor((scrollTop + height) / itemHeight) + overscan)

  const visibleItems = []
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: `${itemHeight}px`,
          transform: `translateY(${i * itemHeight}px)`,
        }}
      >
        {renderItem({ index: i, data })}
      </div>,
    )
  }

  const handleScroll = useCallback(() => {
    if (!containerRef?.current) return
    setScrollTop(containerRef.current.scrollTop)
  }, [containerRef])

  useEffect(() => {
    const container = containerRef?.current
    if (!container) return

    container.addEventListener("scroll", handleScroll)
    return () => {
      container.removeEventListener("scroll", handleScroll)
    }
  }, [containerRef, handleScroll])

  return (
    <div
      ref={innerRef}
      style={{
        position: "relative",
        height: `${totalHeight}px`,
        width: "100%",
      }}
    >
      {visibleItems}
    </div>
  )
}
