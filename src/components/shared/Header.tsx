'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'

export function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary-600">
              TripVerse
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/client/hotels" className="text-gray-600 hover:text-gray-900">
              Hotels
            </Link>
            <Link href="/client/cars" className="text-gray-600 hover:text-gray-900">
              Cars
            </Link>
            <Link href="/client/monuments" className="text-gray-600 hover:text-gray-900">
              Monuments
            </Link>
            <Link href="/client/weather" className="text-gray-600 hover:text-gray-900">
              Weather
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {user.name}
                </span>
                {user.role === 'DRIVER' && (
                  <Link href="/driver/dashboard">
                    <Button variant="outline" size="sm">
                      Driver Dashboard
                    </Button>
                  </Link>
                )}
                {user.role === 'ADMIN' && (
                  <Link href="/admin/dashboard">
                    <Button variant="outline" size="sm">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={logout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
