'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDriverCarBookings } from '@/features/drivers/useDriverBookings'
import { carsApi } from '@/lib/api/cars.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { ChatInterface } from '@/components/cars/ChatInterface'

// Countdown timer hook for ride-hailing requests
function useCountdown(targetDate: Date | null, onExpire?: () => void) {
  const [timeLeft, setTimeLeft] = useState<number>(0)

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(0)
      return
    }

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const target = targetDate.getTime()
      const diff = Math.max(0, target - now)
      return Math.floor(diff / 1000)
    }

    setTimeLeft(calculateTimeLeft())

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)
      if (remaining <= 0 && onExpire) {
        onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [targetDate, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  return { timeLeft, minutes, seconds, isExpired: timeLeft <= 0 }
}

export default function DriverBookingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<'all' | 'PENDING_DRIVER_ACCEPTANCE' | 'ACCEPTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED'>('all')
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'all' | 'rental' | 'ride_hailing'>('all')
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [cashCollectionBooking, setCashCollectionBooking] = useState<any>(null)
  const [cashConfirmed, setCashConfirmed] = useState(false)
  const [isCashSubmitting, setIsCashSubmitting] = useState(false)
  const [acceptingId, setAcceptingId] = useState<number | null>(null)
  
  const { bookings, isLoading } = useDriverCarBookings()

  // Auto-open chat from notification
  useEffect(() => {
    const openChatId = searchParams.get('openChat')
    if (openChatId && bookings && Array.isArray(bookings) && bookings.length > 0) {
      const bookingId = parseInt(openChatId, 10)
      const booking = bookings.find((b: any) => b.id === bookingId)
      if (booking && canChat(booking.status)) {
        setSelectedBooking(bookingId)
        // Remove query parameter from URL
        router.replace('/driver/bookings', { scroll: false })
      }
    }
  }, [searchParams, bookings, router])

  const canChat = (status: string) => {
    return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  }

  const bookingsArray: any[] = Array.isArray(bookings) ? bookings : []
  const filteredBookings: any[] = bookingsArray.filter((booking: any) => {
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter
    const bookingType = booking.booking_type || 'rental'
    const matchesType = bookingTypeFilter === 'all' || bookingType === bookingTypeFilter
    return matchesStatus && matchesType
  })

  // Get pending ride requests for priority display
  const pendingRideRequests = bookingsArray.filter((booking: any) => 
    booking.status === 'PENDING_DRIVER_ACCEPTANCE' && 
    (booking.booking_type === 'ride_hailing')
  )

  const handleAcceptBooking = async (bookingId: number) => {
    setAcceptingId(bookingId)
    try {
      await carsApi.respondToBooking(bookingId, 'accept')
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Booking accepted! Customer has been notified.', 'success')
    } catch (error: any) {
      console.error('Failed to accept booking:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to accept booking'
      showToast(errorMessage, 'error')
    } finally {
      setAcceptingId(null)
    }
  }

  const handleRejectBooking = async (bookingId: number) => {
    try {
      await carsApi.respondToBooking(bookingId, 'reject')
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Booking rejected. Customer has been notified.', 'info')
    } catch (error: any) {
      console.error('Failed to reject booking:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to reject booking'
      showToast(errorMessage, 'error')
    }
  }

  const handleStartTrip = async (bookingId: number) => {
    try {
      await carsApi.startTrip(bookingId)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Trip started successfully!', 'success')
    } catch (error: any) {
      console.error('Failed to start trip:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to start trip'
      showToast(errorMessage, 'error')
    }
  }

  const handleCompleteTrip = async (booking: any) => {
    try {
      await carsApi.completeTrip(booking.id)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast('Trip completed successfully!', 'success')
      // For cash bookings: open the cash collection modal
      if (booking.payment_method === 'cash') {
        setCashConfirmed(false)
        setCashCollectionBooking(booking)
      }
    } catch (error: any) {
      console.error('Failed to complete trip:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to complete trip'
      showToast(errorMessage, 'error')
    }
  }

  const handleCollectCash = async () => {
    if (!cashCollectionBooking || !cashConfirmed) return
    setIsCashSubmitting(true)
    try {
      const result = await carsApi.collectCash(
        cashCollectionBooking.id,
        parseFloat(cashCollectionBooking.total_amount),
      )
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      showToast(
        `Cash collected! PKR ${result.your_earnings.toLocaleString()} earned (after PKR ${result.platform_fee_deducted.toLocaleString()} platform fee).`,
        'success',
      )
      setCashCollectionBooking(null)
    } catch (error: any) {
      console.error('Failed to collect cash:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to record cash collection'
      showToast(errorMessage, 'error')
    } finally {
      setIsCashSubmitting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatRideTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const isTomorrow = date.toDateString() === tomorrow.toDateString()
    
    const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    
    if (isToday) return `Today ${timeStr}`
    if (isTomorrow) return `Tomorrow ${timeStr}`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' + timeStr
  }

  // Countdown timer component for ride-hailing requests
  const RideCountdownTimer = ({ expiresAt, bookingId }: { expiresAt: string, bookingId: number }) => {
    const expireDate = new Date(expiresAt)
    const { minutes, seconds, isExpired } = useCountdown(expireDate, () => {
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
    })
    
    if (isExpired) {
      return (
        <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold animate-pulse">
          ⏰ EXPIRED
        </span>
      )
    }
    
    const isUrgent = minutes < 1
    
    return (
      <span className={`px-2 py-1 rounded text-xs font-bold ${
        isUrgent 
          ? 'bg-red-100 text-red-700 animate-pulse' 
          : 'bg-orange-100 text-orange-700'
      }`}>
        ⏱️ {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800'
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      case 'COMPLETED':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusActions = (booking: any) => {
    const isRideHailing = booking.booking_type === 'ride_hailing'
    const isAccepting = acceptingId === booking.id
    
    switch (booking.status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        return (
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => handleAcceptBooking(booking.id)}
                disabled={isAccepting}
                className={isRideHailing ? 'bg-teal-600 hover:bg-teal-700' : ''}
              >
                {isAccepting ? (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Accepting...
                  </span>
                ) : isRideHailing ? '⚡ Quick Accept' : 'Accept'}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleRejectBooking(booking.id)}
                disabled={isAccepting}
              >
                Reject
              </Button>
            </div>
          </div>
        )
      case 'CONFIRMED':
        return (
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStartTrip(booking.id)}
            >
              Start Trip
            </Button>
            {canChat(booking.status) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedBooking(booking.id)}
              >
                💬 Chat
              </Button>
            )}
          </div>
        )
      case 'IN_PROGRESS':
        return (
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleCompleteTrip(booking)}
            >
              Complete Trip
            </Button>
            {canChat(booking.status) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedBooking(booking.id)}
              >
                💬 Chat
              </Button>
            )}
          </div>
        )
      case 'ACCEPTED':
        return (
          canChat(booking.status) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setSelectedBooking(booking.id)}
            >
              💬 Chat
            </Button>
          )
        )
      default:
        return null
    }
  }

  return (
    <>
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="My Car Bookings"
        subtitle="Manage bookings for your cars and track your earnings"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">

      {/* Status Filter */}
      <div className="mb-6 space-y-4">
        {/* Booking Type Filter */}
        <div className="flex gap-2">
          {[
            { value: 'all' as const, label: 'All Bookings', icon: '📋' },
            { value: 'ride_hailing' as const, label: '🚗 Rides', color: 'teal' },
            { value: 'rental' as const, label: '📅 Rentals', color: 'blue' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setBookingTypeFilter(filter.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                bookingTypeFilter === filter.value
                  ? filter.value === 'ride_hailing'
                    ? 'bg-teal-100 text-teal-800 border-2 border-teal-300'
                    : filter.value === 'rental'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap gap-2">
          {[
            { value: 'all', label: 'All' },
            { value: 'PENDING_DRIVER_ACCEPTANCE', label: 'Pending' },
            { value: 'ACCEPTED', label: 'Accepted' },
            { value: 'CONFIRMED', label: 'Confirmed' },
            { value: 'IN_PROGRESS', label: 'In Progress' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value as any)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === filter.value
                  ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking: any) => {
            const isRideHailing = booking.booking_type === 'ride_hailing'
            const isPending = booking.status === 'PENDING_DRIVER_ACCEPTANCE'
            
            return (
            <Card 
              key={booking.id} 
              className={`hover:shadow-md transition-shadow ${
                isRideHailing && isPending ? 'border-2 border-teal-400 ring-1 ring-teal-400/20' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Booking Type Badge */}
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        isRideHailing 
                          ? 'bg-teal-100 text-teal-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isRideHailing ? '🚗 RIDE' : '📅 RENTAL'}
                      </span>
                      <h3 className="text-lg font-semibold">
                        {booking.car?.make || 'Car'} {booking.car?.model || ''}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {booking.status.replace(/_/g, ' ')}
                      </span>
                      {/* Countdown timer for pending ride requests */}
                      {isRideHailing && isPending && booking.expires_at && (
                        <RideCountdownTimer expiresAt={booking.expires_at} bookingId={booking.id} />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div>
                        <span className="font-medium">Customer:</span> {booking.customer?.name || 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">{isRideHailing ? 'Pickup Time:' : 'Pick-up:'}</span> {booking.start_date ? (isRideHailing ? formatRideTime(booking.start_date) : formatDate(booking.start_date)) : 'N/A'}
                      </div>
                      <div>
                        <span className="font-medium">{isRideHailing ? 'Est. Distance:' : 'Return:'}</span> {isRideHailing ? `${booking.estimated_distance || 0} km` : (booking.end_date ? formatDate(booking.end_date) : 'N/A')}
                      </div>
                      <div>
                        <span className="font-medium">Earnings:</span> <span className={isRideHailing ? 'text-teal-700 font-semibold' : ''}>PKR {(booking.driver_earnings || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Booking ID:</span> <span className="text-gray-600">{booking.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Total Amount:</span> <span className="text-gray-600">PKR {(booking.total_amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Pickup:</span> <span className="text-gray-600">{booking.pickup_location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    {getStatusActions(booking)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )})
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-500 text-lg mb-4">
                No bookings found
              </div>
              <p className="text-gray-500">
                {statusFilter === 'all' 
                  ? "You don't have any bookings yet."
                  : `No bookings with status "${statusFilter.replace(/_/g, ' ').toLowerCase()}".`
                }
              </p>
            </CardContent>
          </Card>
        )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-1">
          {selectedBooking ? (() => {
            const booking = bookingsArray.find((b: any) => b.id === selectedBooking)
            return (
              <ChatInterface
                key={selectedBooking}
                bookingId={selectedBooking}
                driverName="You"
                customerName={booking?.customer?.name || 'Customer'}
                onClose={() => setSelectedBooking(null)}
              />
            )
          })() : (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">💬</div>
                <h3 className="text-lg font-semibold mb-2">
                  Select a Booking
                </h3>
                <p className="text-gray-500 text-sm">
                  Choose a booking from the list to start chatting with the customer
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

        {/* Summary Stats */}
        {Array.isArray(bookings) && bookings.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-800">
                    {bookings.length}
                  </div>
                  <div className="text-sm text-blue-600">Total Bookings</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-800">
                    {bookings.filter((b: any) => b.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-800">
                    {bookings.filter((b: any) => ['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length}
                  </div>
                  <div className="text-sm text-yellow-600">Active</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-800">
                    PKR {bookings
                      .filter((b: any) => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status))
                      .reduce((sum: number, b: any) => sum + (b.driver_earnings || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-600">Total Earnings</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>

    {/* Cash Collection Modal */}
    {cashCollectionBooking && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Collect Cash Payment</h2>
            <p className="text-sm text-gray-500 mt-1">Trip #{cashCollectionBooking.id} has been completed</p>
          </div>

          {/* Amount to collect */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-5">
            <p className="text-sm text-green-700 font-medium mb-1">Collect from customer</p>
            <p className="text-3xl font-bold text-green-800">
              PKR {parseFloat(cashCollectionBooking.total_amount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Your net earnings: PKR {parseFloat(cashCollectionBooking.driver_earnings || 0).toLocaleString()} (after 5% platform fee)
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm mb-5">
            <div className="flex justify-between">
              <span className="text-gray-600">Total fare</span>
              <span className="font-medium text-gray-900">PKR {parseFloat(cashCollectionBooking.total_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Platform commission (5%)</span>
              <span className="font-medium text-red-600">− PKR {parseFloat(cashCollectionBooking.platform_fee || 0).toLocaleString()}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between font-semibold">
              <span className="text-gray-900">Your earnings</span>
              <span className="text-green-700">PKR {parseFloat(cashCollectionBooking.driver_earnings || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={cashConfirmed}
              onChange={(e) => setCashConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-green-600 rounded border-gray-300 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              I confirm I have collected <span className="font-semibold text-gray-900">PKR {parseFloat(cashCollectionBooking.total_amount || 0).toLocaleString()}</span> in cash from the customer.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setCashCollectionBooking(null); setCashConfirmed(false) }}
              className="flex-1 py-2.5 rounded-xl border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCollectCash}
              disabled={!cashConfirmed || isCashSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isCashSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Processing...
                </>
              ) : (
                'Confirm Collection'
              )}
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}
