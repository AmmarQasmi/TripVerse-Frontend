'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@/types'

interface AuthContextType {
  user: User | null
  login: (credentials: { email: string; password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('auth_token')
          if (token) {
            // Validate token and get user data
            // This would typically make an API call to verify the token
            // For now, we'll just clear it if it exists
            localStorage.removeItem('auth_token')
          }
        }
      } catch (error) {
        console.error('Session check failed:', error)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token')
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = async (credentials: { email: string; password: string }) => {
    try {
      // This would make an API call to authenticate
      // For now, we'll simulate a successful login
      const mockUser: User = {
        id: 1,
        email: credentials.email,
        full_name: 'John Doe',
        role: 'client',
        status: 'active',
        city: {
          id: 1,
          name: 'Karachi',
          region: 'Sindh'
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      setUser(mockUser)
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', 'mock_token')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
