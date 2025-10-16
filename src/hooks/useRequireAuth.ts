'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'

/**
 * useRequireAuth Hook
 * 
 * Use this hook at the component level to require authentication.
 * If user is not logged in, shows a modal/redirect to login.
 * 
 * Usage:
 * const { user, requireAuth } = useRequireAuth()
 * 
 * const handleBooking = async () => {
 *   if (!requireAuth()) return // This will redirect to login if not authenticated
 *   
 *   // User is authenticated, proceed with booking
 *   await createBooking()
 * }
 */
export function useRequireAuth() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  /**
   * Check if user is authenticated and redirect if not
   * Returns true if authenticated, false otherwise
   */
  const requireAuth = (redirectUrl?: string): boolean => {
    if (!user) {
      // Save current URL to redirect back after login
      const currentPath = window.location.pathname + window.location.search
      const loginUrl = redirectUrl || `/auth/login?redirect=${encodeURIComponent(currentPath)}`
      
      console.log('🔒 Authentication required, redirecting to login')
      router.push(loginUrl)
      return false
    }
    return true
  }

  /**
   * Check if user is authenticated without redirecting
   * Returns true if authenticated, false otherwise
   */
  const isAuthenticated = (): boolean => {
    return !!user && !isLoading
  }

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: 'client' | 'driver' | 'admin'): boolean => {
    return user?.role === role
  }

  return {
    user,
    isLoading,
    requireAuth,
    isAuthenticated,
    hasRole,
  }
}

