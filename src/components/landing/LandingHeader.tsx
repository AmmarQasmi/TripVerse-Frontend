'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { MonumentUploadModal } from './MonumentUploadModal'

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 shadow-lg z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left: Hamburger Menu + Logo */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Menu"
                >
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isMenuOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border">
                    <Link 
                      href="/client/flights" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ✈️ Flight
                    </Link>
                    <Link 
                      href="/client/cars" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🚗 Rental
                    </Link>
                    <Link 
                      href="/client/hotels" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🏨 Hotel
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-300 via-teal-200 to-blue-300 bg-clip-text text-transparent">
                  TripVerse
                </h1>
              </Link>
            </div>

            {/* Right: Camera Icon, Login, Sign Up */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Upload monument photo"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
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

        {/* Mobile overlay to close menu */}
        {isMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 -z-10"
            onClick={() => setIsMenuOpen(false)}
          />
        )}
      </header>

      <MonumentUploadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </>
  )
}

