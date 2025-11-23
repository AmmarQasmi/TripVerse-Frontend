'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/features/auth/useAuth'
import { hotelsApi } from '@/lib/api/hotels.api'

interface ManagerHotel {
  id: string
  name: string
  description: string | null
  location: string
  address: string | null
  rating: number | null
  is_active: boolean
  is_listed: boolean
  images: string[]
  room_types_count: number
  total_bookings: number
  total_earnings: number
  created_at: string
  updated_at: string
}

export default function HotelManagerHotelsPage() {
  const { user } = useAuth()
  const [hotels, setHotels] = useState<ManagerHotel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await hotelsApi.getManagerHotels()
        setHotels(response)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load hotels')
        console.error('Error fetching hotels:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'hotel_manager') {
      fetchHotels()
    }
  }, [user])

  const getStatusColor = (isListed: boolean, isActive: boolean) => {
    if (!isActive) return 'bg-gray-100 text-gray-800'
    if (isListed) return 'bg-green-100 text-green-800'
    return 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (isListed: boolean, isActive: boolean) => {
    if (!isActive) return 'Inactive'
    if (isListed) return 'Listed'
    return 'Unlisted'
  }

  const totalHotels = hotels.length
  const activeHotels = hotels.filter(hotel => hotel.is_active && hotel.is_listed).length
  const totalBookings = hotels.reduce((sum, hotel) => sum + hotel.total_bookings, 0)
  const totalEarnings = hotels.reduce((sum, hotel) => sum + hotel.total_earnings, 0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageHeader 
          title="My Hotels"
          subtitle="Manage your hotel listings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-white text-xl">Loading hotels...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageHeader 
          title="My Hotels"
          subtitle="Manage your hotel listings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-500/20 border-red-500">
            <CardContent className="p-6">
              <p className="text-white">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="My Hotels"
        subtitle="Manage your hotel listings"
        backUrl="/hotel-manager/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Stats Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white">{totalHotels}</div>
                <div className="text-gray-300 text-sm mt-1">Total Hotels</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white">{activeHotels}</div>
                <div className="text-gray-300 text-sm mt-1">Active Hotels</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white">{totalBookings}</div>
                <div className="text-gray-300 text-sm mt-1">Total Bookings</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white">PKR {totalEarnings.toLocaleString()}</div>
                <div className="text-gray-300 text-sm mt-1">Total Earnings</div>
              </CardContent>
            </Card>
          </div>

          {/* Add Hotel Button */}
          <div className="mb-6">
            <Link href="/hotel-manager/hotels/new">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                + Add New Hotel
              </Button>
            </Link>
          </div>

          {/* Hotels List */}
          {hotels.length === 0 ? (
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-12 text-center">
                <div className="text-6xl mb-4">🏨</div>
                <h3 className="text-xl font-semibold text-white mb-2">No Hotels Yet</h3>
                <p className="text-gray-300 mb-6">Start by adding your first hotel listing</p>
                <Link href="/hotel-manager/hotels/new">
                  <Button className="bg-cyan-600 hover:bg-cyan-700 text-white">
                    Add Your First Hotel
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="bg-white/10 backdrop-blur-md border-white/20 hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    <div className="relative h-48 bg-gray-700 rounded-t-lg overflow-hidden">
                      {hotel.images && hotel.images.length > 0 ? (
                        <img
                          src={hotel.images[0]}
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl">
                          🏨
                        </div>
                      )}
                      <div className="absolute top-2 right-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.is_listed, hotel.is_active)}`}>
                          {getStatusText(hotel.is_listed, hotel.is_active)}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2">{hotel.name}</h3>
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {hotel.description || 'No description available'}
                        </p>
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-300">
                            <span className="mr-2">📍</span>
                            {hotel.location}
                          </div>
                          {hotel.rating && (
                            <div className="flex items-center text-sm text-gray-300">
                              <span className="mr-2">⭐</span>
                              {hotel.rating.toFixed(1)} Rating
                            </div>
                          )}
                          <div className="flex items-center text-sm text-gray-300">
                            <span className="mr-2">🛏️</span>
                            {hotel.room_types_count} Room Types
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-white/20 pt-4 mt-4">
                        <div className="flex justify-between items-center mb-3">
                          <span className="text-gray-300 text-sm">Bookings</span>
                          <span className="text-white font-semibold">{hotel.total_bookings}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">Earnings</span>
                          <span className="text-green-400 font-semibold">PKR {hotel.total_earnings.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <Link href={`/hotel-manager/hotels/${hotel.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

