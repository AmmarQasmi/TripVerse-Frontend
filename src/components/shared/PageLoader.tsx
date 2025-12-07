'use client'

import { motion } from 'framer-motion'

interface PageLoaderProps {
  message?: string
  variant?: 'default' | 'skeleton' | 'spinner'
  showMessage?: boolean
}

export function PageLoader({ 
  message = 'Loading...', 
  variant = 'default',
  showMessage = true 
}: PageLoaderProps) {
  if (variant === 'spinner') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="absolute inset-0 border-4 border-transparent rounded-full"
              style={{
                borderTopColor: '#2563eb',
                borderRightColor: '#0891b2',
                borderBottomColor: '#14b8a6',
                borderLeftColor: 'transparent',
              }}
            />
          </div>
          {showMessage && (
            <p className="text-gray-600 font-medium">{message}</p>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'skeleton') {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            
            {/* Cards skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 animate-pulse">
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Default variant - spinner with message
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 border-4 border-transparent border-t-blue-600 border-r-cyan-600 border-b-teal-600 rounded-full"
            style={{
              borderTopColor: '#2563eb',
              borderRightColor: '#0891b2',
              borderBottomColor: '#14b8a6',
            }}
          />
        </div>
        {showMessage && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-600 font-medium"
          >
            {message}
          </motion.p>
        )}
      </div>
    </div>
  )
}

