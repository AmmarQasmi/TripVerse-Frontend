'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { MonumentUploadModal } from './MonumentUploadModal'
import { useAuth } from '@/features/auth/useAuth'
import { motion, AnimatePresence } from 'framer-motion'
import { NotificationBell } from '@/components/shared/NotificationBell'

export function LandingHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const { user, logout } = useAuth()
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/auth/login')
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isClientLoggedIn = user && user.role === 'client'

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
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 border z-50">
                    <Link 
                      href="/client/dashboard" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🏠 Dashboard
                    </Link>
                    <Link 
                      href="/client/hotels" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🏨 Hotels
                    </Link>
                    <Link 
                      href="/client/cars" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🚗 Car Rentals
                    </Link>
                    <Link 
                      href="/client/flights" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ✈️ Flights
                    </Link>
                    <Link 
                      href="/client/monuments" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🏛️ Monuments
                    </Link>
                    <Link 
                      href="/client/weather" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      🌤️ Weather
                    </Link>
                    <Link 
                      href="/client/bookings" 
                      className="block px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-primary transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      📋 My Bookings
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

            {/* Right: Message, Chatbot, Camera Icon, Login/Sign Up or Profile Dropdown */}
            <div className="flex items-center space-x-4 ml-auto pr-4">
              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group relative"
                aria-label="Messages"
              >
                <svg className="w-6 h-6 text-white group-hover:text-cyan-300 transition-colors" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>

              <button
                className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 group relative"
                aria-label="Chatbot"
              >
                <svg className="w-6 h-6 text-white group-hover:text-cyan-300 transition-colors" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="8.5" cy="9.5" r="1" fill="currentColor" className="opacity-80"/>
                  <circle cx="15.5" cy="9.5" r="1" fill="currentColor" className="opacity-80"/>
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 2v2M12 20v2M22 12h-2M4 12H2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-40"/>
                </svg>
              </button>

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

              {isClientLoggedIn ? (
                <>
                  <NotificationBell />
                  
                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-white">{user?.full_name || 'User'}</span>
                        <span className="text-xs text-gray-200">{user?.email || ''}</span>
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-teal-600 flex items-center justify-center text-white font-semibold shadow-lg">
                        <span>{user?.full_name ? getInitials(user.full_name) : 'U'}</span>
                      </div>
                      <svg 
                        className={`w-4 h-4 text-white transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
                        >
                          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                            <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                            <p className="text-xs text-gray-600">{user?.email || ''}</p>
                          </div>
                          
                          <div className="py-2">
                            <Link
                              href="/client/dashboard"
                              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                              </svg>
                              <span className="text-sm text-gray-700">Dashboard</span>
                            </Link>

                            <Link
                              href="/client/bookings"
                              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                              <span className="text-sm text-gray-700">My Bookings</span>
                            </Link>
                            
                            <Link
                              href="/client/profile"
                              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="text-sm text-gray-700">My Profile</span>
                            </Link>
                            
                            <Link
                              href="/client/settings"
                              className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                              onClick={() => setIsDropdownOpen(false)}
                            >
                              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="text-sm text-gray-700">Settings</span>
                            </Link>
                          </div>

                          <div className="border-t border-gray-200">
                            <button
                              onClick={handleLogout}
                              className="flex items-center space-x-3 px-4 py-3 w-full hover:bg-red-50 transition-colors text-left"
                            >
                              <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                              </svg>
                              <span className="text-sm font-medium text-red-600">Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
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

