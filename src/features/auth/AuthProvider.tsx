'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, LoginCredentials } from '@/types'
import { authApi } from '@/lib/api/auth.api'

interface AuthContextType {
  user: User | null
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    checkSession()
  }, [])

  const checkSession = async () => {
    try {
      console.log('🔍 Checking session...')
      
      // Silently check for existing session
      // This doesn't redirect or show errors - just checks if user is logged in
      const userData = await authApi.getProfile()
      
      console.log('✅ Session valid! Authenticated as:', userData.email)
      setUser(userData)
    } catch (error: any) {
      // No session - this is NORMAL for public browsing
      const statusCode = error.response?.status
      
      if (statusCode === 401) {
        console.log('ℹ️ No active session (not logged in)')
      } else {
        console.error('❌ Session check error:', error.message)
      }
      
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('🔐 Attempting login...')
      
      // Call the backend login API
      // Backend sets httpOnly cookie automatically
      const response = await authApi.login(credentials)
      
      console.log('✅ Login successful! User:', response.user.email)
      console.log('🍪 Cookie should now be set by backend')
      
      // Set user state from response
      setUser(response.user)
    } catch (error: any) {
      console.error('❌ Login failed:', error)
      // Extract error message from the API response
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please check your credentials.'
      throw new Error(errorMessage)
    }
  }

  const logout = async () => {
    try {
      // Call backend logout endpoint
      // Backend clears the httpOnly cookie
      await authApi.logout()
    } catch (error) {
      console.error('Logout API call failed:', error)
    } finally {
      // Clear user state
      setUser(null)
      // Cookie is already cleared by backend
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
