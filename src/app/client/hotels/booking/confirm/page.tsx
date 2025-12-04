'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { hotelBookingsApi } from '@/lib/api/hotelBookings.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { PaymentModal } from '@/components/cars/PaymentModal'

export default function HotelBookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get('bookingId')
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  
  const [booking, setBooking] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConfirming, setIsConfirming] = useState(false)
  const [countdown, setCountdown] = useState(5)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        // Fetch user bookings and find the one with matching ID
        const bookings = await hotelBookingsApi.getUserBookings()
        const foundBooking = bookings.find((b: any) => b.id === parseInt(bookingId))
        
        if (foundBooking) {
          setBooking(foundBooking)
        } else {
          showToast('Booking not found', 'error')
          router.push('/client/hotelbookings')
        }
      } catch (error: any) {
        console.error('Failed to fetch booking:', error)
        showToast('Failed to load booking details', 'error')
        router.push('/client/hotelbookings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBooking()
  }, [bookingId, router, showToast])

  const handlePaymentSuccess = async () => {
    if (!bookingId) return

    setIsConfirming(true)
    try {
      await hotelBookingsApi.confirm(bookingId)
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['hotelBookings'] })
      
      showToast('Payment successful! Booking confirmed. Admin and you have been notified.', 'success')
      
      // Start countdown to redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/client/hotelbookings')
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    } catch (error: any) {
      console.error('Failed to confirm booking:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to confirm booking. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setIsConfirming(false)
    }
  }

  const handleConfirmBooking = () => {
    setShowPaymentModal(true)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🏨</div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading booking details...</h1>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-white mb-4">Booking not found</h1>
          <Button onClick={() => router.push('/client/hotelbookings')}>
            Go to Bookings
          </Button>
        </div>
      </div>
    )
  }

  // Check if booking is already confirmed
  if (booking.status === 'CONFIRMED' || booking.status === 'CHECKED_IN' || booking.status === 'CHECKED_OUT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-4">Booking Already Confirmed</h1>
          <p className="text-gray-300 mb-6">This booking has already been confirmed.</p>
          <Button onClick={() => router.push('/client/hotelbookings')}>
            View Bookings
          </Button>
        </div>
      </div>
    )
  }

  // Check if booking is not in pending payment status
  if (booking.status !== 'PENDING_PAYMENT') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-4">Invalid Booking Status</h1>
          <p className="text-gray-300 mb-6">
            This booking cannot be confirmed at this time. Current status: {booking.status}
          </p>
          <Button onClick={() => router.push('/client/hotelbookings')}>
            View Bookings
          </Button>
        </div>
      </div>
    )
  }

  // Extract booking details
  const hotel = booking.hotel || booking.booking_details?.hotel
  const roomType = booking.room_type || booking.roomType || booking.booking_details?.room_type
  const dates = booking.dates || booking.booking_details?.dates
  const pricing = booking.pricing || booking.booking_details?.pricing
  const checkIn = dates?.check_in || booking.check_in || booking.checkInDate
  const checkOut = dates?.check_out || booking.check_out || booking.checkOutDate
  const nights = dates?.nights || (checkIn && checkOut ? Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)) : 0)
  const totalAmount = pricing?.total_amount || booking.total_amount || booking.totalAmount || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.2
            }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">🏨</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Confirm Your Booking
            </h1>
            <p className="text-xl text-gray-300">
              Please complete payment to finalize your hotel booking.
            </p>
          </motion.div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Hotel Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">🏨</span>
                    Hotel Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {hotel?.name || 'Hotel'}
                    </h3>
                    <p className="text-gray-300 text-sm">{hotel?.address || ''}</p>
                    <p className="text-gray-300 text-sm">{hotel?.city || ''}</p>
                  </div>
                  {hotel?.email && (
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-sm text-gray-300 mb-1">Contact Email:</p>
                      <a href={`mailto:${hotel.email}`} className="text-blue-400 hover:text-blue-300">
                        {hotel.email}
                      </a>
                    </div>
                  )}
                  {hotel?.phone && (
                    <div>
                      <p className="text-sm text-gray-300 mb-1">Contact Phone:</p>
                      <a href={`tel:${hotel.phone}`} className="text-blue-400 hover:text-blue-300">
                        {hotel.phone}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Room Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">🛏️</span>
                    Room Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">
                      {roomType?.name || 'Room'}
                    </h3>
                    <p className="text-gray-300">
                      {booking.quantity || 1} {booking.quantity === 1 ? 'room' : 'rooms'}
                    </p>
                    {roomType?.max_occupancy && (
                      <p className="text-gray-300 text-sm">
                        Max occupancy: {roomType.max_occupancy} guests
                      </p>
                    )}
                  </div>
                  {pricing?.base_price_per_night && (
                    <div className="pt-4 border-t border-white/20">
                      <p className="text-gray-300 text-sm">
                        PKR {pricing.base_price_per_night.toLocaleString()} per night
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <span className="mr-2">📋</span>
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Check-in & Check-out</h4>
                    <p className="text-gray-300">
                      {checkIn ? new Date(checkIn).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-gray-300">
                      {checkOut ? new Date(checkOut).toLocaleDateString() : 'N/A'}
                    </p>
                    <p className="text-gray-300 text-sm">
                      {nights} {nights === 1 ? 'night' : 'nights'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Booking Details</h4>
                    <p className="text-gray-300">
                      {booking.quantity || 1} {booking.quantity === 1 ? 'room' : 'rooms'}
                    </p>
                    <p className="text-gray-300 text-sm">
                      Status: <span className="text-yellow-400">Pending Payment</span>
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Total Amount</h4>
                    <p className="text-2xl font-bold text-white">
                      PKR {typeof totalAmount === 'number' ? totalAmount.toLocaleString() : parseFloat(totalAmount.toString()).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-300">Includes all fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Hotel Contact Information */}
          {(hotel?.email || hotel?.phone) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mt-8"
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">📞</span>
                    Contact Hotel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {hotel.email && (
                      <div>
                        <p className="text-sm text-gray-300 mb-1">Email:</p>
                        <a 
                          href={`mailto:${hotel.email}`} 
                          className="text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <span className="mr-2">✉️</span>
                          {hotel.email}
                        </a>
                      </div>
                    )}
                    {hotel.phone && (
                      <div>
                        <p className="text-sm text-gray-300 mb-1">Phone:</p>
                        <a 
                          href={`tel:${hotel.phone}`} 
                          className="text-blue-400 hover:text-blue-300 flex items-center"
                        >
                          <span className="mr-2">📱</span>
                          {hotel.phone}
                        </a>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-4">
                    For any queries or special requests, please contact the hotel directly using the information above.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              onClick={handleConfirmBooking}
              disabled={isConfirming}
              className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              {isConfirming ? 'Confirming...' : '✅ Confirm Booking & Pay'}
            </Button>
            <Button
              onClick={() => router.push('/client/hotelbookings')}
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10 py-4 rounded-xl"
            >
              Cancel
            </Button>
          </motion.div>

          {/* Auto-redirect Notice (only show after confirmation) */}
          {countdown > 0 && countdown < 5 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-8"
            >
              <p className="text-gray-400">
                Redirecting to your bookings in {countdown} seconds...
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Payment Modal */}
      {booking && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          amount={typeof totalAmount === 'number' ? totalAmount : parseFloat(totalAmount.toString())}
          bookingId={parseInt(bookingId || '0')}
        />
      )}
    </div>
  )
}

