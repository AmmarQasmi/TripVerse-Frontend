'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useHotelById } from '@/features/hotels/useHotelSearch'
import { HotelImageCarousel } from '@/components/hotels/HotelImageCarousel'
import { HotelDetails } from '@/components/hotels/HotelDetails'
import { HotelAmenities } from '@/components/hotels/HotelAmenities'
import { RoomTypeCard } from '@/components/hotels/RoomTypeCard'
import { HotelReviews } from '@/components/hotels/HotelReviews'
import { HotelMap } from '@/components/hotels/HotelMap'
import { BookingSummary } from '@/components/hotels/BookingSummary'
import { useRequireAuth } from '@/hooks/useRequireAuth'

export default function HotelDetailPage() {
  const params = useParams()
  const router = useRouter()
  const hotelId = params.id as string
  
  const { data: hotel, isLoading, error } = useHotelById(hotelId)
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reviews' | 'location'>('overview')
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    roomTypeId: '',
  })

  const handleBooking = (roomTypeId: string) => {
    // 🔒 REQUIRE LOGIN before booking
    if (!requireAuth()) {
      console.log('🔐 Login required for hotel booking')
      return // User will be redirected to login
    }
    
    // User is authenticated, proceed with booking
    setSelectedRoom(roomTypeId)
    setBookingData(prev => ({ ...prev, roomTypeId }))
    setShowBookingModal(true)
  }

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-lg">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-lg">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-600 text-lg">☆</span>
        ))}
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-700 rounded mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-4 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
              <div className="h-64 bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Hotel not found
          </h1>
          <p className="text-gray-400 mb-6">
            The hotel you're looking for doesn't exist or has been removed.
          </p>
          <Link href="/client/hotels">
            <Button className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white">
              Back to Hotels
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header Section */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-gray-400 mb-4">
            <Link href="/client/hotels" className="hover:text-white transition-colors">
              Hotels
            </Link>
            <span>›</span>
            <span className="text-white">{hotel.name}</span>
          </nav>

          {/* Hotel Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <h1 className="text-4xl font-bold text-white">{hotel.name}</h1>
                <div className="flex items-center space-x-2">
                  {renderStars(hotel.rating || 0)}
                  <span className="text-gray-300 text-lg">
                    {hotel.rating?.toFixed(1) || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-gray-400 mb-4">
                <span className="flex items-center">
                  <span className="mr-1">🧭</span>
                  {hotel.location}
                </span>
                <span className="flex items-center">
                  <span className="mr-1">🏨</span>
                  {hotel.roomTypes?.length || 0} room types
                </span>
                <span className="flex items-center">
                  <span className="mr-1">👥</span>
                  {Math.floor(Math.random() * 500) + 50} reviews
                </span>
              </div>

              <p className="text-gray-300 text-lg max-w-3xl">
                {hotel.description}
              </p>
            </div>

            <div className="flex items-center space-x-4">
              <button className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50">
                <span className="mr-2">🤍</span>
                Save
              </button>
              <button className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-gray-700/50">
                <span className="mr-2">📤</span>
                Share
              </button>
            </div>
          </div>
        </motion.div>

        {/* Image Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <HotelImageCarousel images={hotel.images || []} />
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Hotel Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Navigation */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-2 border border-gray-700/50">
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', icon: '📋' },
                  { id: 'rooms', label: 'Rooms', icon: '🛏️' },
                  { id: 'reviews', label: 'Reviews', icon: '⭐' },
                  { id: 'location', label: 'Location', icon: '🧭' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <HotelDetails hotel={hotel} />
                  <HotelAmenities amenities={hotel.amenities || []} />
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-white mb-6">Available Rooms</h3>
                  {hotel.roomTypes?.map((room: any, index: number) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <RoomTypeCard
                        room={room}
                        onSelect={() => handleBooking(room.id)}
                        isSelected={selectedRoom === room.id}
                        isAuthenticated={isAuthenticated()}
                      />
                    </motion.div>
                  )) || (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🛏️</div>
                      <p className="text-gray-400">No rooms available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <HotelReviews hotelId={hotelId} />
              )}

              {activeTab === 'location' && (
                <div className="space-y-6">
                  <HotelMap 
                    location={hotel.location} 
                    address={hotel.address}
                  />
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Hotel Policies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-white mb-2">Check-in & Check-out</h4>
                        <p className="text-gray-300 text-sm">Check-in: 3:00 PM</p>
                        <p className="text-gray-300 text-sm">Check-out: 11:00 AM</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-2">Cancellation Policy</h4>
                        <p className="text-gray-300 text-sm">Free cancellation up to 24 hours before check-in</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <h3 className="text-2xl font-bold text-white mb-6">Book Your Stay</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-white">
                    <span className="text-3xl font-bold">
                      PKR {(hotel.pricePerNight || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-400">per night</span>
                  </div>
                  
                  <div className="text-center py-4">
                    <p className="text-gray-400 text-sm mb-4">
                      Select a room type to see availability and pricing
                    </p>
                    <Button
                      className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e40af] hover:to-[#0f766e] text-white"
                      disabled={!selectedRoom}
                      onClick={() => setShowBookingModal(true)}
                    >
                      {selectedRoom ? 'Book Selected Room' : 'Select a Room'}
                    </Button>
                  </div>

                  <div className="pt-4 border-t border-gray-700/50">
                    <div className="text-sm text-gray-400 space-y-2">
                      <p>✅ Free cancellation</p>
                      <p>✅ Best price guarantee</p>
                      <p>✅ Instant confirmation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && selectedRoom && (
        <BookingSummary
          hotel={hotel}
          roomType={hotel.roomTypes?.find((r: any) => r.id === selectedRoom)}
          onClose={() => setShowBookingModal(false)}
          onBooking={(data) => {
            console.log('Booking data:', data)
            setShowBookingModal(false)
          }}
        />
      )}
    </div>
  )
}
