'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MonumentUploadModal } from '@/components/landing/MonumentUploadModal'
import { Home, Camera } from 'lucide-react'

export function TransparentHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-800/80 via-cyan-900/70 to-teal-900/80 backdrop-blur-md shadow-lg z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Home Icon + Logo */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Go to home page"
              >
                <Home className="w-6 h-6 text-white" />
              </Link>

              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">
                  TripVerse
                </h1>
              </Link>
            </div>

            {/* Right: Monument Recognition Icon + Auth Buttons */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Upload monument photo"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>

              <Link href="/auth/login">
                <Button variant="ghost" className="text-white hover:text-gray-200 hover:bg-white/10">
                  Login
                </Button>
              </Link>

              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Monument Upload Modal */}
      <MonumentUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}
