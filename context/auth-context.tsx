"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"
import { authApi, userApi } from "@/lib/mock-api"

export interface User {
  id: string
  username: string
  avatar?: string
  nickname?: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  loginError: string | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const response = await authApi.checkAuth()

        if (response.success && response.data) {
          setUser(response.data)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error("Failed to restore auth state:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true)
    setLoginError(null)

    try {
      const response = await authApi.login(username, password)

      if (response.success && response.data) {
        setUser(response.data)

        // Save user data to localStorage
        localStorage.setItem("user", JSON.stringify(response.data))
        return true
      } else {
        setLoginError(response.error || "登录失败")
        return false
      }
    } catch (error) {
      console.error("Login failed:", error)
      setLoginError(error instanceof Error ? error.message : "登录失败，请重试")
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Logout function
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true)

    try {
      await authApi.logout()
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Function to refresh user data
  const refreshUser = useCallback(async (): Promise<void> => {
    if (!user?.id) return

    setIsLoading(true)
    try {
      const response = await userApi.getProfile(user.id)

      if (response.success && response.data) {
        // Update user data excluding stats
        const { stats, ...userData } = response.data
        setUser(userData)

        // Update localStorage
        localStorage.setItem("user", JSON.stringify(userData))
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginError,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
