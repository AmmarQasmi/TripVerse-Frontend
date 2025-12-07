'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HotelBookingsRedirect() {
  const router = useRouter()
  
  useEffect(() => {
    router.replace('/client/bookings')
  }, [router])
  
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-gray-900">Redirecting...</div>
    </div>
  )
}
