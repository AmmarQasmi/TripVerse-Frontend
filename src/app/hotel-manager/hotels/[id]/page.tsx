'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Hotel } from '@/types'

interface HotelDetails extends Hotel {
  is_listed?: boolean
  is_active?: boolean
}

export default function HotelSubmissionPage() {
  const params = useParams()
  const hotelId = params.id as string

  const [hotel, setHotel] = useState<HotelDetails | null>(null)
  const [hotelImages, setHotelImages] = useState<{ id: number; url: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const [hotelData, optimizedImages] = await Promise.all([
          hotelsApi.getById(hotelId),
          hotelsApi.getOptimizedImages(hotelId).catch(() => []),
        ])

        setHotel(hotelData as HotelDetails)

        if (optimizedImages.length > 0) {
          setHotelImages(optimizedImages.map((img: any) => ({ id: img.id, url: img.original })))
        } else if (hotelData.images && hotelData.images.length > 0) {
          setHotelImages(hotelData.images.map((url: string, i: number) => ({ id: i, url })))
        }

        // Get is_active / is_listed from manager hotel list
        try {
          const managerHotels = await hotelsApi.getManagerHotels()
          const managerHotel = managerHotels.find((h: any) => String(h.id) === hotelId)
          if (managerHotel) {
            setHotel(prev => prev
              ? { ...prev, is_listed: managerHotel.is_listed, is_active: managerHotel.is_active }
              : null)
          }
        } catch {}
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load hotel details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotelData()
  }, [hotelId])





  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Loading..."
          subtitle="Fetching hotel details"
          backUrl="/hotel-manager/hotels"
          backLabel="Back to Hotels"
        />
        <div className="container mx-auto px-4 py-8 flex items-center justify-center">
          <p className="text-gray-500">Loading hotel details...</p>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Hotel Not Found"
          subtitle="Unable to load hotel details"
          backUrl="/hotel-manager/hotels"
          backLabel="Back to Hotels"
        />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600">{error || "Hotel not found or you don't have permission to access it."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const isActive = hotel.is_active

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={hotel.name}
        subtitle="Hotel Submission Summary"
        backUrl="/hotel-manager/hotels"
        backLabel="Back to Hotels"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 max-w-2xl mx-auto"
        >
          {/* Approval Banner */}
          {!isActive ? (
            <Card className="bg-amber-50 border-amber-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="text-3xl">â³</div>
                <div>
                  <h3 className="font-semibold text-amber-800 text-lg">Pending Admin Approval</h3>
                  <p className="text-amber-700 mt-1 text-sm">
                    Your hotel has been submitted and is awaiting review. You&apos;ll be notified once it has been approved and activated.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-green-50 border-green-300">
              <CardContent className="p-6 flex items-start gap-4">
                <div className="text-3xl">âœ…</div>
                <div>
                  <h3 className="font-semibold text-green-800 text-lg">Hotel is Live</h3>
                  <p className="text-green-700 mt-1 text-sm">
                    Your hotel is active{hotel.is_listed ? ' and visible to customers' : ' but currently unlisted'}.{' '}
                    To manage details, room types, and images, go to the{' '}
                    <a href="/hotel-manager/hotels" className="underline font-medium">My Hotels</a> page and click <strong>Manage</strong>.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hotel Details Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-gray-500">Name</span>
                <p className="font-medium mt-0.5">{hotel.name}</p>
              </div>
              {hotel.description && (
                <div>
                  <span className="text-gray-500">Description</span>
                  <p className="mt-0.5">{hotel.description}</p>
                </div>
              )}
              <div>
                <span className="text-gray-500">Address</span>
                <p className="mt-0.5">{hotel.address}</p>
              </div>
              <div>
                <span className="text-gray-500">Location</span>
                <p className="mt-0.5">{hotel.location}</p>
              </div>
              <div>
                <span className="text-gray-500">Star Rating</span>
                <p className="mt-0.5">{'\u2b50'.repeat(hotel.rating || 1)} ({hotel.rating} stars)</p>
              </div>
              {hotel.amenities && hotel.amenities.length > 0 && (
                <div>
                  <span className="text-gray-500">Amenities</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {hotel.amenities.map((amenity, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full capitalize">
                        {amenity.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Room Types Summary */}
          {hotel.roomTypes && hotel.roomTypes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Room Types ({hotel.roomTypes.length})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {hotel.roomTypes.map(roomType => (
                  <div key={roomType.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{roomType.name}</p>
                        {roomType.description && (
                          <p className="text-sm text-gray-500 mt-0.5">{roomType.description}</p>
                        )}
                      </div>
                      <p className="text-sm font-semibold text-cyan-700 whitespace-nowrap ml-4">
                        PKR {roomType.pricePerNight?.toLocaleString()} / night
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Max occupancy: {roomType.capacity}</p>
                    {roomType.amenities && roomType.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {roomType.amenities.map((a, i) => (
                          <span key={i} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 text-xs rounded-full capitalize">
                            {a.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Images Summary */}
          {hotelImages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Hotel Images ({hotelImages.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {hotelImages.map(img => (
                    <div key={img.id} className="aspect-video rounded-lg overflow-hidden bg-gray-100">
                      <img src={img.url} alt={hotel.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
