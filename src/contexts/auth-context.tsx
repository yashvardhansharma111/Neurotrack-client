"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type User = {
  id: string
  username: string
}

type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Simple in-memory "database" for demo purposes
// In production, this would be an API call
const DEMO_USERS = [
  { id: "1", username: "admin", password: "admin123" },
  { id: "2", username: "user", password: "user123" },
  { id: "3", username: "demo", password: "demo123" },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored session on mount
    const stored = localStorage.getItem("neurotrack_user")
    if (stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem("neurotrack_user")
      }
    }
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    const foundUser = DEMO_USERS.find((u) => u.username === username && u.password === password)
    if (foundUser) {
      const userData = { id: foundUser.id, username: foundUser.username }
      setUser(userData)
      localStorage.setItem("neurotrack_user", JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("neurotrack_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
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

