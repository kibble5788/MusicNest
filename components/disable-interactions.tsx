"use client"

import { useEffect } from "react"

export function DisableInteractions() {
  useEffect(() => {
    // 简单的禁止右键菜单
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // 添加事件监听器
    document.addEventListener("contextmenu", handleContextMenu)

    // 清理函数
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu)
    }
  }, [])

  return null
}
