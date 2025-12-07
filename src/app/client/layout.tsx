'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'

const roleDashboards: Record<string, string> = {
  admin: '/admin/dashboard',
  driver: '/driver/dashboard',
  hotel_manager: '/hotel-manager/dashboard',
  client: '/client/dashboard',
}

export default function ClientLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Wait for auth to load
    if (isLoading) return

    // If user is not a client and trying to access client routes
    if (user && user.role !== 'client') {
      const dashboard = roleDashboards[user.role] || '/auth/login'
      router.replace(dashboard)
    }
  }, [user, isLoading, router, pathname])
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}


