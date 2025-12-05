'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { useAuth } from '@/features/auth/useAuth'
import { hotelsApi } from '@/lib/api/hotels.api'
import { CircularStatsCard } from '@/components/driver/CircularStatsCard'

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
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="My Hotels"
          subtitle="Manage your hotel listings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-gray-900 text-xl">Loading hotels...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="My Hotels"
          subtitle="Manage your hotel listings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-500">
            <CardContent className="p-6">
              <p className="text-red-900">{error}</p>
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
    <div className="min-h-screen bg-white">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                My Hotels
              </h1>
              <p className="text-lg text-gray-600">
                Manage your properties and track performance
              </p>
            </div>
            <Link href="/hotel-manager/hotels/new">
              <Button className="mt-4 md:mt-0 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold px-6 py-3 rounded-xl">
                Add New Hotel
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <CircularStatsCard
            label="Total Hotels"
            value={totalHotels}
            delay={0.1}
            maxValue={Math.max(totalHotels, 10)}
          />
          <CircularStatsCard
            label="Active Hotels"
            value={activeHotels}
            delay={0.2}
            maxValue={Math.max(totalHotels, 1)}
          />
          <CircularStatsCard
            label="Total Bookings"
            value={totalBookings}
            delay={0.3}
            maxValue={Math.max(totalBookings, 10)}
          />
          <CircularStatsCard
            label="Total Earnings"
            value={`PKR ${totalEarnings.toLocaleString()}`}
            delay={0.4}
            maxValue={Math.max(totalEarnings, 100000)}
          />
        </div>

        {/* Hotels List */}
        {hotels.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {hotels.map((hotel, index) => (
              <motion.div
                key={hotel.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-75 bg-white overflow-hidden border border-gray-200">
                  {/* Hotel Image */}
                  <div className="relative h-48 bg-gray-200">
                    {hotel.images && hotel.images.length > 0 ? (
                      <img
                        src={hotel.images[0]}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(hotel.is_listed, hotel.is_active)}`}>
                      {getStatusText(hotel.is_listed, hotel.is_active)}
                    </div>
                  </div>

                  <CardHeader>
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {hotel.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{hotel.location}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {hotel.room_types_count}
                        </p>
                        <p className="text-xs text-gray-600">Room Types</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">{hotel.total_bookings}</p>
                        <p className="text-xs text-gray-600">Bookings</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-lg font-bold text-gray-900">
                          {hotel.total_earnings > 0 ? `${(hotel.total_earnings / 1000).toFixed(0)}k` : '0'}
                        </p>
                        <p className="text-xs text-gray-600">Earned</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2">
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
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No hotels listed yet
            </h3>
            <p className="text-gray-600 mb-8">
              Start earning by listing your first hotel
            </p>
            <Link href="/hotel-manager/hotels/new">
              <Button className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold px-8 py-3 rounded-xl">
                Add Your First Hotel
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}

