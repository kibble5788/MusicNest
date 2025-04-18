"use client"

import type React from "react"

import { useRef, useEffect, useCallback } from "react"

interface SwipeableOptions {
  onSwipedUp?: () => void
  onSwipedDown?: () => void
  onSwipedLeft?: () => void
  onSwipedRight?: () => void
  preventDefaultTouchmoveEvent?: boolean
  trackMouse?: boolean
  swipeThreshold?: number
}

interface SwipeableHandlers {
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onMouseDown?: (e: React.MouseEvent) => void
  onMouseMove?: (e: React.MouseEvent) => void
  onMouseUp?: (e: React.MouseEvent) => void
}

export function useSwipeable({
  onSwipedUp,
  onSwipedDown,
  onSwipedLeft,
  onSwipedRight,
  preventDefaultTouchmoveEvent = false,
  trackMouse = false,
  swipeThreshold = 50,
}: SwipeableOptions): SwipeableHandlers {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const mouseDownRef = useRef(false)

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }, [])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault()
      }
    },
    [preventDefaultTouchmoveEvent],
  )

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return

      const touch = e.changedTouches[0]
      const deltaX = touch.clientX - touchStartRef.current.x
      const deltaY = touch.clientY - touchStartRef.current.y

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > absY && absX > swipeThreshold) {
        // 水平滑动
        if (deltaX > 0) {
          onSwipedRight?.()
        } else {
          onSwipedLeft?.()
        }
      } else if (absY > absX && absY > swipeThreshold) {
        // 垂直滑动
        if (deltaY > 0) {
          onSwipedDown?.()
        } else {
          onSwipedUp?.()
        }
      }

      touchStartRef.current = null
    },
    [onSwipedDown, onSwipedLeft, onSwipedRight, onSwipedUp, swipeThreshold],
  )

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!trackMouse) return

      mouseDownRef.current = true
      touchStartRef.current = { x: e.clientX, y: e.clientY }
    },
    [trackMouse],
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!trackMouse || !mouseDownRef.current) return

      if (preventDefaultTouchmoveEvent) {
        e.preventDefault()
      }
    },
    [preventDefaultTouchmoveEvent, trackMouse],
  )

  const onMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!trackMouse || !mouseDownRef.current || !touchStartRef.current) return

      mouseDownRef.current = false

      const deltaX = e.clientX - touchStartRef.current.x
      const deltaY = e.clientY - touchStartRef.current.y

      const absX = Math.abs(deltaX)
      const absY = Math.abs(deltaY)

      if (absX > absY && absX > swipeThreshold) {
        // 水平滑动
        if (deltaX > 0) {
          onSwipedRight?.()
        } else {
          onSwipedLeft?.()
        }
      } else if (absY > absX && absY > swipeThreshold) {
        // 垂直滑动
        if (deltaY > 0) {
          onSwipedDown?.()
        } else {
          onSwipedUp?.()
        }
      }

      touchStartRef.current = null
    },
    [onSwipedDown, onSwipedLeft, onSwipedRight, onSwipedUp, swipeThreshold, trackMouse],
  )

  useEffect(() => {
    if (!trackMouse) return

    const handleMouseUp = () => {
      mouseDownRef.current = false
    }

    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [trackMouse])

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    ...(trackMouse ? { onMouseDown, onMouseMove, onMouseUp } : {}),
  }
}
