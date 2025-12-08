'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login, user } = useAuth()
  const router = useRouter()

  // Get redirect URL from query params
  const getRedirectUrl = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      return params.get('redirect') || null
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      // Login - cookie is set by backend automatically
      const loggedInUser = await login({ email, password })
      
      // Check if there's a redirect URL (user was trying to access protected page)
      const redirectUrl = getRedirectUrl()
      
      if (redirectUrl) {
        console.log('Redirecting back to:', redirectUrl)
        router.push(redirectUrl)
      } else {
        // Redirect based on user role
        if (loggedInUser.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (loggedInUser.role === 'driver') {
          router.push('/driver/dashboard')
        } else if (loggedInUser.role === 'hotel_manager') {
          router.push('/hotel-manager/dashboard')
        } else {
          router.push('/client/dashboard')
        }
      }
    } catch (error: any) {
      console.error('Login failed:', error)
      setError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }
  
  // Redirect already logged-in users
  useEffect(() => {
    if (user) {
      // Check if there's a redirect URL
      const redirectUrl = getRedirectUrl()
      
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        // User is already logged in, redirect to appropriate dashboard
        if (user.role === 'admin') {
          router.push('/admin/dashboard')
        } else if (user.role === 'driver') {
          router.push('/driver/dashboard')
        } else if (user.role === 'hotel_manager') {
          router.push('/hotel-manager/dashboard')
        } else {
          router.push('/client/dashboard')
        }
      }
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Image with Blur Overlay */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.1)'
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 z-0"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 bg-clip-text text-transparent mb-2">
                TripVerse
              </h1>
            </Link>
            <h2 className="text-2xl font-semibold text-gray-800">
              Welcome back to TripVerse
            </h2>
            <p className="text-gray-600 mt-2">Sign in to continue your journey</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email / Username"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-cyan-900 border-gray-300 rounded focus:ring-cyan-900"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-cyan-900 hover:text-teal-900 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 hover:from-blue-900 hover:via-cyan-950 hover:to-teal-950 text-white py-3 rounded-xl font-semibold text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link 
                href="/auth/signup" 
                className="text-cyan-900 font-semibold hover:text-teal-900 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        {/* Decorative Element */}
        <div className="absolute -right-10 -bottom-10 w-32 h-32 opacity-20">
          <svg viewBox="0 0 200 200" className="text-teal-900">
            <path fill="currentColor" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.6,90,-16.3,88.5,-0.9C87,14.6,81.4,29.2,73.1,42.3C64.7,55.4,53.6,67,40.1,73.9C26.6,80.8,11.7,83,-3.1,88.1C-17.9,93.2,-32.7,101.2,-45.2,94.6C-57.7,88,-67.9,66.8,-74.5,47.1C-81.1,27.4,-84.1,9.2,-83.6,-9.4C-83.1,-28,-79.1,-47,-69.8,-61.4C-60.5,-75.8,-46,-85.6,-30.7,-92.1C-15.4,-98.6,0.7,-101.8,15.4,-98.7C30.1,-95.6,44.7,-86.2,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>
      </div>
    </div>
  )
}
