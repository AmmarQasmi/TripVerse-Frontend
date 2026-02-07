'use client'

import { useParams } from 'next/navigation'
import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useHotelById } from '@/features/hotels/useHotelSearch'
import { HotelImageCarousel } from '@/components/hotels/HotelImageCarousel'
import { HotelDetails } from '@/components/hotels/HotelDetails'
import { HotelAmenities } from '@/components/hotels/HotelAmenities'
import { HotelReviews } from '@/components/hotels/HotelReviews'
import { ReviewFormModal } from '@/components/hotels/ReviewFormModal'
import { HotelMap } from '@/components/hotels/HotelMap'
import { BookingModal } from '@/components/hotels/BookingModal'
import { BookingSuccessModal } from '@/components/hotels/BookingSuccessModal'
import { PageLoader } from '@/components/shared/PageLoader'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useFavoriteHotels } from '@/hooks/useFavoriteHotels'
import { useToast } from '@/components/ui/Toast'
import { useHotelReviews } from '@/features/hotels/useHotelSearch'
import { BookingResponse } from '@/lib/api/bookings.api'

export default function HotelDetailPage() {
  const params = useParams()
  const hotelId = params.id as string
  
  const { data: hotel, isLoading, error } = useHotelById(hotelId)
  const { requireAuth } = useRequireAuth()
  const { showToast } = useToast()
  const { isFavorite, toggleFavorite } = useFavoriteHotels()
  
  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'reviews' | 'location'>('overview')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [successBooking, setSuccessBooking] = useState<BookingResponse | null>(null)

  // Fetch real review data for count display
  const { data: reviewsData } = useHotelReviews(hotelId, 1, 1)

  const handleSave = useCallback(() => {
    const nowSaved = toggleFavorite(hotelId)
    showToast(nowSaved ? 'Hotel saved to favorites' : 'Hotel removed from favorites', nowSaved ? 'success' : 'info')
  }, [hotelId, toggleFavorite, showToast])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    const title = hotel?.name || 'Check out this hotel'
    const text = `${title} — ${hotel?.location || ''}`

    // Use native Web Share API if available (mobile)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return
      } catch {
        // User cancelled or not supported, fall through to clipboard
      }
    }

    // Fallback: copy URL to clipboard
    try {
      await navigator.clipboard.writeText(url)
      showToast('Link copied to clipboard!', 'success')
    } catch {
      showToast('Could not copy link', 'error')
    }
  }, [hotel, showToast])

  const handleBookNow = () => {
    if (!requireAuth()) {
      showToast('Please login to continue with your booking', 'warning')
      return
    }
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
    return <PageLoader message="Loading hotel details..." variant="skeleton" />
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
          </svg>
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
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-400 mb-4">
          <Link href="/client/hotels" className="hover:text-white transition-colors">Hotels</Link>
          <span>›</span>
          <span className="text-gray-300 truncate">{hotel.name}</span>
        </nav>

        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-5"
        >
          <HotelImageCarousel images={hotel?.images || []} />
        </motion.div>

        {/* Hotel Header — compact inline */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl lg:text-3xl font-bold text-white truncate">{hotel.name}</h1>
              <div className="flex items-center gap-1 flex-shrink-0">
                {renderStars(hotel.rating || 0)}
                <span className="text-gray-300 text-sm ml-1">{hotel.rating?.toFixed(1) || 'N/A'}</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                {hotel.location}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" /></svg>
                {hotel.roomTypes?.length || 0} room types
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" /></svg>
                {reviewsData?.total || 0} review{(reviewsData?.total || 0) !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg text-sm transition-colors border flex items-center gap-1.5 ${
                isFavorite(hotelId)
                  ? 'bg-pink-600/20 border-pink-500/50 text-pink-400 hover:bg-pink-600/30'
                  : 'bg-gray-800/60 hover:bg-gray-700/60 text-white border-gray-700/50'
              }`}
            >
              <svg className="w-4 h-4" fill={isFavorite(hotelId) ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>
              {isFavorite(hotelId) ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={handleShare}
              className="bg-gray-800/60 hover:bg-gray-700/60 text-white px-4 py-2 rounded-lg text-sm transition-colors border border-gray-700/50 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" /></svg>
              Share
            </button>
          </div>
        </motion.div>

        {/* Main Content — 3 column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — Tabs + Content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tab Navigation */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-1.5 border border-gray-700/50">
              <div className="flex space-x-1">
                {[
                  { id: 'overview', label: 'Overview', svg: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" /></svg> },
                  { id: 'rooms', label: 'Rooms', svg: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
                  { id: 'reviews', label: 'Reviews', svg: <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg> },
                  { id: 'location', label: 'Location', svg: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg> }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 px-3 rounded-lg text-sm transition-all duration-75 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {tab.svg}
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'overview' && (
                <div className="space-y-5">
                  <HotelDetails hotel={hotel} />
                  <HotelAmenities amenities={hotel.amenities || []} />
                </div>
              )}

              {activeTab === 'rooms' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">Available Rooms</h3>
                  {hotel.roomTypes?.map((room: any, index: number) => (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 transition-all duration-200 hover:border-cyan-500/50 p-5">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="text-base font-semibold text-white">{room.name}</h4>
                            {room.description && (
                              <p className="text-sm text-gray-400 mt-0.5">{room.description}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-xl font-bold text-white">PKR {room.pricePerNight?.toLocaleString() || '0'}</p>
                            <p className="text-xs text-gray-400">per night</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Max Occupancy:</span>
                            <span className="ml-1.5 font-medium text-white">{room.capacity} guests</span>
                          </div>
                          {room.total_rooms !== undefined && (
                            <div>
                              <span className="text-gray-400">Total Rooms:</span>
                              <span className="ml-1.5 font-medium text-white">{room.total_rooms}</span>
                            </div>
                          )}
                        </div>

                        {room.amenities && room.amenities.length > 0 && (
                          <div className="mb-3 pt-3 border-t border-gray-700/50">
                            <div className="flex flex-wrap gap-1.5">
                              {room.amenities.slice(0, 5).map((amenity: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-gray-700/50 text-gray-300 text-xs rounded-full capitalize">
                                  {amenity.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={handleBookNow}
                          className="w-full bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white font-medium py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                          Book Now
                        </Button>
                      </div>
                    </motion.div>
                  )) || (
                    <div className="text-center py-10">
                      <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                      <p className="text-gray-400 text-sm">No rooms available</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <HotelReviews hotelId={hotelId} onWriteReview={() => setShowReviewModal(true)} />
              )}

              {activeTab === 'location' && (
                <div className="space-y-5">
                  <HotelMap 
                    location={hotel.location} 
                    address={hotel.address}
                  />
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                    <h3 className="text-lg font-bold text-white mb-3">Hotel Policies</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-1">Check-in & Check-out</h4>
                        <p className="text-gray-300 text-sm">Check-in: 3:00 PM</p>
                        <p className="text-gray-300 text-sm">Check-out: 11:00 AM</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white text-sm mb-1">Cancellation Policy</h4>
                        <p className="text-gray-300 text-sm">Free cancellation up to 24 hours before check-in</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Right Column — Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-6">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
                <div className="flex items-baseline justify-between mb-4">
                  <div>
                    <span className="text-2xl font-bold text-white">
                      PKR {(hotel.pricePerNight || 0).toLocaleString()}
                    </span>
                    <span className="text-gray-400 text-sm ml-1.5">/ night</span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm mb-4">
                  Select dates, room type and complete your booking
                </p>
                
                <Button
                  className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e40af] hover:to-[#0f766e] text-white font-medium py-2.5 rounded-lg text-sm"
                  onClick={handleBookNow}
                >
                  Book Now
                </Button>

                <div className="mt-4 pt-4 border-t border-gray-700/50 space-y-2">
                  {['Free cancellation', 'Best price guarantee', 'Instant confirmation'].map((text) => (
                    <p key={text} className="flex items-center gap-2 text-sm text-gray-400">
                      <svg className="w-3.5 h-3.5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" /></svg>
                      {text}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal — same 3-step flow as listing page */}
      {showBookingModal && (
        <BookingModal
          hotel={hotel}
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          onSuccess={(response) => {
            setShowBookingModal(false)
            setSuccessBooking(response)
          }}
        />
      )}

      {/* Booking Success Modal */}
      <BookingSuccessModal
        isOpen={!!successBooking}
        onClose={() => setSuccessBooking(null)}
        booking={successBooking}
      />

      {/* Review Form Modal */}
      <ReviewFormModal
        hotelId={hotelId}
        hotelName={hotel.name}
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  )
}
