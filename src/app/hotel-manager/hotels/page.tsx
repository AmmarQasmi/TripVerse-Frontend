'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { useAuth } from '@/features/auth/useAuth'
import { hotelsApi } from '@/lib/api/hotels.api'
import { DoughnutChart } from '@/components/client/DoughnutChart'

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
  const [togglingId, setTogglingId] = useState<string | null>(null)

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

  const handleToggleListing = async (hotelId: string, currentStatus: boolean) => {
    try {
      setTogglingId(hotelId)
      await hotelsApi.updateHotelAvailability(hotelId, { is_listed: !currentStatus })
      setHotels(prev => prev.map(h => h.id === hotelId ? { ...h, is_listed: !currentStatus } : h))
    } catch (err: any) {
      console.error('Error toggling listing:', err)
    } finally {
      setTogglingId(null)
    }
  }

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
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="My Hotels"
          subtitle="Manage your hotel listings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <PageLoader message="Loading hotels..." variant="skeleton" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader 
          title="My Hotels"
          subtitle="Manage your hotel listings"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-200">
            <CardContent className="p-6">
              <p className="text-red-600">{error}</p>
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
    <div className="min-h-screen bg-gray-50">
      <PageHeader 
        title="My Hotels"
        subtitle="Manage your properties and track performance"
        backUrl="/hotel-manager/dashboard"
        backLabel="Back to Dashboard"
        action={
          <Link href="/hotel-manager/hotels/new">
            <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90 font-semibold px-6 py-3 rounded-xl">
              Add New Hotel
            </Button>
          </Link>
        }
      />
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <DoughnutChart
            label="Total Hotels"
            value={totalHotels}
            gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
            delay={0.1}
            maxValue={Math.max(totalHotels, 10)}
          />
          <DoughnutChart
            label="Active Hotels"
            value={activeHotels}
            gradient="bg-gradient-to-br from-green-500 to-emerald-500"
            delay={0.2}
            maxValue={Math.max(totalHotels, 1)}
          />
          <DoughnutChart
            label="Total Bookings"
            value={totalBookings}
            gradient="bg-gradient-to-br from-purple-500 to-pink-500"
            delay={0.3}
            maxValue={Math.max(totalBookings, 10)}
          />
          <DoughnutChart
            label="Total Earnings"
            value={`PKR ${totalEarnings.toLocaleString()}`}
            gradient="bg-gradient-to-br from-orange-500 to-red-500"
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
                <Card className="shadow-lg hover:shadow-xl transition-all duration-75 overflow-hidden">
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
                    <CardTitle className="text-xl font-bold">
                      {hotel.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{hotel.location}</p>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <p className="text-lg font-bold">
                          {hotel.room_types_count}
                        </p>
                        <p className="text-xs text-gray-600">Room Types</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <p className="text-lg font-bold">{hotel.total_bookings}</p>
                        <p className="text-xs text-gray-600">Bookings</p>
                      </div>
                      <div className="bg-gray-100 p-2 rounded-lg">
                        <p className="text-lg font-bold">
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
                      <Button
                        variant="outline"
                        className={`px-3 ${
                          hotel.is_listed ? 'text-yellow-600' : 'text-green-600'
                        }`}
                        onClick={() => handleToggleListing(hotel.id, hotel.is_listed)}
                        disabled={togglingId === hotel.id}
                      >
                        {togglingId === hotel.id ? '...' : hotel.is_listed ? '🔒 Unlist' : '📋 List'}
                      </Button>
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
            <h3 className="text-2xl font-semibold mb-2">
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

