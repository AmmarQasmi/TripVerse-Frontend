'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { carsApi } from '@/lib/api/cars.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { PaymentModal } from '@/components/cars/PaymentModal'

export default function BookingConfirmationPage() {
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

  const fetchBooking = useCallback(async () => {
    if (!bookingId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      // Fetch user bookings and find the one with matching ID
      const bookings = await carsApi.getUserBookings()
      const foundBooking = bookings.find((b: any) => b.id === parseInt(bookingId))
      
      if (foundBooking) {
        setBooking(foundBooking)
      } else {
        showToast('Booking not found', 'error')
        router.push('/client/cars/bookings')
      }
    } catch (error: any) {
      console.error('Failed to fetch booking:', error)
      showToast('Failed to load booking details', 'error')
      router.push('/client/cars/bookings')
    } finally {
      setIsLoading(false)
    }
  }, [bookingId, router, showToast])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  // Refresh booking when page becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && bookingId && !isLoading) {
        // Refresh booking data when user returns to the page
        fetchBooking()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [bookingId, isLoading, fetchBooking])

  const handlePaymentSuccess = async () => {
    if (!bookingId) return

    setIsConfirming(true)
    try {
      // Refresh booking data before confirming to ensure we have latest status
      const bookings = await carsApi.getUserBookings()
      const latestBooking = bookings.find((b: any) => b.id === parseInt(bookingId))
      
      if (!latestBooking) {
        showToast('Booking not found', 'error')
        setIsConfirming(false)
        return
      }
      
      // Double-check status before proceeding
      if (latestBooking.status !== 'ACCEPTED') {
        showToast('Booking must be accepted by driver before payment. Please refresh the page.', 'error')
        // Update the booking state with latest data
        setBooking(latestBooking)
        setIsConfirming(false)
        return
      }
      
      // Proceed with confirmation
      await carsApi.confirmBooking(parseInt(bookingId))
      
      // Invalidate queries to refresh data (both query key formats)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['car-bookings', 'user'] })
      
      showToast(
        booking?.payment_method === 'cash'
          ? 'Booking confirmed! You will pay PKR ' + (booking?.total_amount?.toLocaleString() || '') + ' in cash to the driver at trip end.'
        : booking?.payment_method === 'wallet'
        ? 'Booking confirmed. Wallet funds are held and will be released to the driver only after trip completion and your approval.'
        : 'Payment successful! Booking confirmed. Admin and you have been notified.',
        'success',
      )
      
      // Start countdown to redirect
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            router.push('/client/cars/bookings')
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
      
      // Refresh booking data on error to get latest status
      try {
        const bookings = await carsApi.getUserBookings()
        const latestBooking = bookings.find((b: any) => b.id === parseInt(bookingId))
        if (latestBooking) {
          setBooking(latestBooking)
        }
      } catch (refreshError) {
        console.error('Failed to refresh booking:', refreshError)
      }
    } finally {
      setIsConfirming(false)
    }
  }

  const handleConfirmBooking = () => {
    if (booking?.payment_method === 'cash' || booking?.payment_method === 'wallet') {
    // Cash and wallet bookings: confirm directly (wallet is already held)
      handlePaymentSuccess()
    } else {
      setShowPaymentModal(true)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
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
          <Button onClick={() => router.push('/client/cars/bookings')}>
            Go to Bookings
          </Button>
        </div>
      </div>
    )
  }

  // Check if booking is already confirmed
  if (booking.status === 'CONFIRMED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-white mb-4">Booking Already Confirmed</h1>
          <p className="text-gray-300 mb-6">This booking has already been confirmed.</p>
          <Button onClick={() => router.push('/client/cars/bookings')}>
            View Bookings
          </Button>
        </div>
      </div>
    )
  }

  // Check if booking is not accepted yet
  if (booking.status !== 'ACCEPTED') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-white mb-4">Waiting for Driver</h1>
          <p className="text-gray-300 mb-6">
            The driver hasn't accepted your booking request yet. You'll be notified when they respond.
          </p>
          <Button onClick={() => router.push('/client/cars/bookings')}>
            View Bookings
          </Button>
        </div>
      </div>
    )
  }

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
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Confirm Your Booking
            </h1>
            <p className="text-xl text-gray-300">
              {booking.payment_method === 'cash'
                ? 'Driver has accepted your request. Please confirm to finalise your booking. You will pay the driver in cash at the end of the trip.'
              : booking.payment_method === 'wallet'
                ? 'Driver has accepted your request. Your wallet amount is already held. Confirm to finalize the booking.'
                : 'Driver has accepted your request. Please confirm and complete payment to finalize your booking.'}
            </p>
          </motion.div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Car Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">🚗</span>
                    Your Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-lg overflow-hidden flex items-center justify-center">
                      <span className="text-4xl">🚗</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {booking.car?.make} {booking.car?.model}
                      </h3>
                      <p className="text-gray-300">{booking.car?.year}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Driver Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">👨‍💼</span>
                    Your Driver
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      AK
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{booking.driver?.name || 'Driver'}</h3>
                      <p className="text-gray-300">Verified Driver</p>
                    </div>
                  </div>
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
                    <h4 className="font-semibold text-white">Trip Dates</h4>
                    <p className="text-gray-300">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-300">
                      {Math.ceil((new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) / (1000 * 60 * 60 * 24))} days rental
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Pickup Location</h4>
                    <p className="text-gray-300">{booking.pickup_location}</p>
                    <p className="text-gray-300">Contact driver for exact location</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Total Amount</h4>
                    <p className="text-2xl font-bold text-white">
                      PKR {booking.total_amount?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-300">
                      {booking.payment_method === 'cash'
                      ? '💵 Pay in cash to driver'
                      : booking.payment_method === 'wallet'
                        ? '👛 Held in wallet (released on your approval)'
                        : 'Includes all fees'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

                {booking.payment_method === 'wallet' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.65 }}
                  className="mt-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3"
                >
                  <span className="text-2xl flex-shrink-0">👛</span>
                  <div>
                  <p className="text-emerald-300 font-semibold text-sm mb-1">Wallet Hold Active</p>
                  <p className="text-emerald-200/80 text-sm">
                    PKR {booking.total_amount?.toLocaleString()} is already held in your wallet. It will be released to the driver only after trip completion and your approval.
                  </p>
                  </div>
                </motion.div>
                )}

          {/* Cash Payment Notice */}
          {booking.payment_method === 'cash' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="mt-6 bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start gap-3"
            >
              <span className="text-2xl flex-shrink-0">💵</span>
              <div>
                <p className="text-yellow-300 font-semibold text-sm mb-1">Cash Payment Selected</p>
                <p className="text-yellow-200/80 text-sm">
                  No payment is required right now. The total of <span className="font-bold text-white">PKR {booking.total_amount?.toLocaleString()}</span> will be collected by the driver in cash once your trip is complete.
                </p>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              onClick={handleConfirmBooking}
              disabled={isConfirming}
              className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-4 rounded-xl transition-all duration-75 disabled:opacity-50"
            >
              {isConfirming
              ? 'Confirming...'
              : booking.payment_method === 'cash'
              ? '✅ Confirm Booking'
              : booking.payment_method === 'wallet'
              ? '✅ Confirm Booking (Wallet Held)'
              : '✅ Confirm Booking & Pay'}
            </Button>
            <Button
              onClick={() => router.push('/client/cars/bookings')}
              variant="outline"
              className="flex-1 border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white py-4 rounded-xl"
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

      {/* Payment Modal — only for online card bookings */}
      {booking && booking.payment_method === 'online' && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          amount={booking.total_amount || 0}
          bookingId={parseInt(bookingId || '0')}
        />
      )}
    </div>
  )
}
