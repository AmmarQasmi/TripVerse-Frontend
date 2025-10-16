'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'client' | 'driver' | 'admin'
  redirectTo?: string
}

/**
 * ProtectedRoute Component
 * 
 * Wrap any page/component that requires authentication with this.
 * If user is not logged in, they'll be redirected to login page.
 * 
 * Usage:
 * <ProtectedRoute>
 *   <BookingPage />
 * </ProtectedRoute>
 * 
 * With role check:
 * <ProtectedRoute requiredRole="driver">
 *   <DriverDashboard />
 * </ProtectedRoute>
 */
export function ProtectedRoute({ 
  children, 
  requiredRole,
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Check if user is authenticated
      if (!user) {
        console.log('🔒 Protected route: User not authenticated, redirecting to login')
        // Save the current URL to redirect back after login
        const currentPath = window.location.pathname + window.location.search
        router.push(`${redirectTo}?redirect=${encodeURIComponent(currentPath)}`)
        return
      }

      // Check role if specified
      if (requiredRole && user.role !== requiredRole) {
        console.log(`🔒 Protected route: User role '${user.role}' does not match required role '${requiredRole}'`)
        
        // Redirect to appropriate dashboard based on their actual role
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (user.role === 'driver') {
          router.push('/driver/dashboard')
        } else {
          router.push('/client/dashboard')
        }
      }
    }
  }, [user, isLoading, requiredRole, router, redirectTo])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or wrong role
  if (!user || (requiredRole && user.role !== requiredRole)) {
    return null
  }

  // User is authenticated and has correct role
  return <>{children}</>
}

