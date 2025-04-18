/**
 * localStorage 工具函数，支持数据过期机制
 */

// 存储项的接口定义
interface StorageItem<T> {
  value: T
  expiry: number // 过期时间戳
}

/**
 * 将数据存储到 localStorage，并设置过期时间
 * @param key 存储键名
 * @param value 要存储的数据
 * @param ttl 过期时间（毫秒），默认24小时
 */
export function setWithExpiry<T>(key: string, value: T, ttl: number = 24 * 60 * 60 * 1000): void {
  const item: StorageItem<T> = {
    value: value,
    expiry: Date.now() + ttl,
  }

  try {
    localStorage.setItem(key, JSON.stringify(item))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
    // 如果 localStorage 已满或其他错误，尝试清理过期项
    clearExpiredItems()
    try {
      localStorage.setItem(key, JSON.stringify(item))
    } catch (retryError) {
      console.error("Failed to save to localStorage after cleanup:", retryError)
    }
  }
}

/**
 * 从 localStorage 获取数据，如果已过期则返回 null
 * @param key 存储键名
 * @returns 存储的数据，如果已过期或不存在则返回 null
 */
export function getWithExpiry<T>(key: string): T | null {
  const itemStr = localStorage.getItem(key)

  // 如果项不存在，返回 null
  if (!itemStr) {
    return null
  }

  try {
    const item: StorageItem<T> = JSON.parse(itemStr)

    // 检查是否已过期
    if (Date.now() > item.expiry) {
      // 如果已过期，删除项并返回 null
      localStorage.removeItem(key)
      return null
    }

    return item.value
  } catch (error) {
    console.error("Error parsing localStorage item:", error)
    localStorage.removeItem(key)
    return null
  }
}

/**
 * 清理所有过期的 localStorage 项
 */
export function clearExpiredItems(): void {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const itemStr = localStorage.getItem(key)
      if (itemStr) {
        try {
          const item = JSON.parse(itemStr)
          if (item.expiry && Date.now() > item.expiry) {
            localStorage.removeItem(key)
            // 调整索引，因为删除了一项
            i--
          }
        } catch (error) {
          // 如果项不是有效的 JSON 或没有 expiry 字段，跳过
          continue
        }
      }
    }
  }
}

/**
 * 检查 localStorage 是否可用
 * @returns localStorage 是否可用
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = "__test__"
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    return true
  } catch (e) {
    return false
  }
}
