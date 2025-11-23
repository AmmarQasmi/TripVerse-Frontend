'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/features/auth/useAuth'
import { NotificationBell } from '@/components/shared/NotificationBell'

interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  showProfile?: boolean
}

export function DashboardHeader({ title, subtitle, showProfile = true }: DashboardHeaderProps) {
  const { user, logout } = useAuth()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

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

  const getRolePath = () => {
    if (user?.role === 'admin') return '/admin'
    if (user?.role === 'driver') return '/driver'
    return '/client'
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 border-b border-white/20 shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Title */}
          {title && (
            <div className="flex flex-col">
              <h1 className="text-lg md:text-xl font-semibold text-white">{title}</h1>
              {subtitle && (
                <p className="text-xs md:text-sm text-gray-200 hidden sm:block">{subtitle}</p>
              )}
            </div>
          )}

          {/* Right: Notifications & Profile Dropdown */}
          <div className="flex items-center space-x-4">
            <NotificationBell />
            
            {showProfile && (
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
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-gray-200">
                        <p className="text-sm font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-600">{user?.email || ''}</p>
                      </div>
                      
                      <div className="py-2">
                        <Link
                          href={`${getRolePath()}/dashboard`}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="text-sm text-gray-700">Dashboard</span>
                        </Link>
                        
                        <Link
                          href={`/${user?.role || 'client'}/profile`}
                          className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="text-sm text-gray-700">My Profile</span>
                        </Link>

                        <Link
                          href={`/${user?.role || 'client'}/settings`}
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
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

