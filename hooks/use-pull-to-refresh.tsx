"use client"

import type React from "react"

import { useState, useCallback } from "react"

interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  isRefreshing: boolean
  pullDistance?: number
  maxPullDistance?: number
}

export function usePullToRefresh({
  onRefresh,
  isRefreshing,
  pullDistance = 80,
  maxPullDistance = 120,
}: PullToRefreshOptions) {
  const [startY, setStartY] = useState<number | null>(null)
  const [currentY, setCurrentY] = useState<number | null>(null)
  const [isPulling, setIsPulling] = useState(false)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    // 只有在页面顶部才能下拉刷新
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
      setIsPulling(true)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!startY || isRefreshing) return

      const currentY = e.touches[0].clientY
      setCurrentY(currentY)

      // 下拉距离超过阈值时阻止默认滚动
      if (currentY - startY > 10) {
        e.preventDefault()
      }
    },
    [startY, isRefreshing],
  )

  const handleTouchEnd = useCallback(async () => {
    if (!startY || !currentY || isRefreshing) {
      setIsPulling(false)
      return
    }

    const pullLength = currentY - startY

    if (pullLength >= pullDistance) {
      await onRefresh()
    }

    setStartY(null)
    setCurrentY(null)
    setIsPulling(false)
  }, [startY, currentY, pullDistance, onRefresh, isRefreshing])

  const pullToRefreshProps = {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }

  return {
    pullToRefreshProps,
    isPulling,
    pullProgress: startY && currentY ? Math.min((currentY - startY) / pullDistance, 1) : 0,
  }
}
