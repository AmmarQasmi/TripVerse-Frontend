'use client'

import Link from 'next/link'

export default function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Blurred background to match existing auth pages */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(8px)',
          transform: 'scale(1.1)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 z-0 opacity-90" />

      {/* Centered auth card skeleton */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 backdrop-blur-sm animate-pulse">
          {/* Logo / title skeleton */}
          <div className="text-center mb-8 space-y-3">
            <div className="mx-auto h-7 w-32 rounded-full bg-gray-200" />
            <div className="mx-auto h-5 w-40 rounded-full bg-gray-200" />
            <div className="mx-auto h-4 w-56 rounded-full bg-gray-100" />
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-5">
            <div className="space-y-2">
              <div className="h-4 w-20 rounded-full bg-gray-200" />
              <div className="h-11 w-full rounded-xl bg-gray-100" />
            </div>

            <div className="space-y-2">
              <div className="h-4 w-24 rounded-full bg-gray-200" />
              <div className="h-11 w-full rounded-xl bg-gray-100" />
            </div>

            <div className="h-4 w-32 rounded-full bg-gray-100" />

            {/* Submit button skeleton */}
            <div className="h-11 w-full rounded-xl bg-gray-200" />
          </div>

          {/* Footer link skeleton */}
          <div className="mt-6 flex justify-center gap-2">
            <div className="h-4 w-32 rounded-full bg-gray-100" />
            <div className="h-4 w-20 rounded-full bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  )
}


