'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { useDriverCarBookings } from '@/features/drivers/useDriverBookings'
import { carsApi } from '@/lib/api/cars.api'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { ChatInterface } from '@/components/cars/ChatInterface'
import { getSocket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

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
  const [highlightBookingId, setHighlightBookingId] = useState<number | null>(null)
  const [sharingLocationBookingId, setSharingLocationBookingId] = useState<number | null>(null)
  const [latestSharedCoords, setLatestSharedCoords] = useState<{ latitude: number; longitude: number } | null>(null)
  const [sharingError, setSharingError] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)
  const geolocationWatchRef = useRef<number | null>(null)
  
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

  // Support deep links from dashboard cards/modals.
  useEffect(() => {
    const status = searchParams.get('status')
    const bookingType = searchParams.get('type')
    const bookingId = searchParams.get('bookingId')

    const allowedStatuses = new Set([
      'PENDING_DRIVER_ACCEPTANCE',
      'ACCEPTED',
      'CONFIRMED',
      'IN_PROGRESS',
      'COMPLETED',
      'CANCELLED',
      'REJECTED',
      'all',
    ])

    if (status && allowedStatuses.has(status)) {
      setStatusFilter(status as any)
    }

    if (bookingType === 'rental' || bookingType === 'ride_hailing' || bookingType === 'all') {
      setBookingTypeFilter(bookingType)
    }

    if (bookingId) {
      const parsedId = Number(bookingId)
      if (!Number.isNaN(parsedId)) {
        setHighlightBookingId(parsedId)
      }
    } else {
      setHighlightBookingId(null)
    }
  }, [searchParams])

  // When a specific booking is requested, auto-adjust filters to ensure it is visible.
  useEffect(() => {
    const allBookings = Array.isArray(bookings) ? bookings : []
    if (!highlightBookingId || allBookings.length === 0) return
    const focusedBooking = allBookings.find((booking: any) => booking.id === highlightBookingId)
    if (!focusedBooking) return

    const normalizedStatus = String(focusedBooking.status ?? '').toUpperCase()
    const mappedStatus: 'all' | 'PENDING_DRIVER_ACCEPTANCE' | 'ACCEPTED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'REJECTED' =
      normalizedStatus === 'PENDING'
        ? 'PENDING_DRIVER_ACCEPTANCE'
        : normalizedStatus === 'PENDING_DRIVER_ACCEPTANCE' ||
            normalizedStatus === 'ACCEPTED' ||
            normalizedStatus === 'CONFIRMED' ||
            normalizedStatus === 'IN_PROGRESS' ||
            normalizedStatus === 'COMPLETED' ||
            normalizedStatus === 'CANCELLED' ||
            normalizedStatus === 'REJECTED'
          ? normalizedStatus
          : 'all'

    setStatusFilter(mappedStatus)
    setBookingTypeFilter((focusedBooking.booking_type || 'rental') as any)
  }, [highlightBookingId, bookings])

  const canChat = (status: string) => {
    return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  }

  const canShareLiveLocation = (booking: any) => {
    const isRideHailing = booking.booking_type === 'ride_hailing'
    const isWithinCity = !booking.is_intercity
    const isTrackable = ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(booking.status)
    return isRideHailing && isWithinCity && isTrackable
  }

  useEffect(() => {
    if (!sharingLocationBookingId) {
      return
    }

    if (!navigator.geolocation) {
      setSharingError('Geolocation is not supported in this browser.')
      return
    }

    const socket = getSocket(undefined, 'chat')
    socketRef.current = socket
    setSharingError(null)

    if (!socket.connected) {
      socket.connect()
    }

    const joinRoom = () => {
      socket.emit('join_booking', sharingLocationBookingId)
    }

    socket.on('connect', joinRoom)
    if (socket.connected) {
      joinRoom()
    }

    geolocationWatchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const payload = {
          bookingId: sharingLocationBookingId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          heading: position.coords.heading ?? undefined,
          speed: position.coords.speed ?? undefined,
          accuracy: position.coords.accuracy ?? undefined,
          timestamp: Date.now(),
        }

        setLatestSharedCoords({
          latitude: payload.latitude,
          longitude: payload.longitude,
        })

        socket.emit('driver_location_update', payload)
      },
      (error) => {
        setSharingError(error.message || 'Unable to access your location.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000,
      },
    )

    return () => {
      socket.emit('leave_booking', sharingLocationBookingId)
      socket.off('connect', joinRoom)

      if (geolocationWatchRef.current !== null) {
        navigator.geolocation.clearWatch(geolocationWatchRef.current)
        geolocationWatchRef.current = null
      }
    }
  }, [sharingLocationBookingId])

  const bookingsArray: any[] = Array.isArray(bookings) ? bookings : []
  const autoTrackedBooking = bookingsArray.find((booking: any) => canShareLiveLocation(booking)) || null
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

  useEffect(() => {
    const nextBookingId = autoTrackedBooking?.id ?? null
    if (nextBookingId !== sharingLocationBookingId) {
      setSharingLocationBookingId(nextBookingId)
      if (!nextBookingId) {
        setLatestSharedCoords(null)
        setSharingError(null)
      }
    }
  }, [autoTrackedBooking?.id, sharingLocationBookingId])

  useEffect(() => {
    if (!sharingLocationBookingId) return

    const activeBooking = bookingsArray.find((booking: any) => booking.id === sharingLocationBookingId)
    if (!activeBooking || !canShareLiveLocation(activeBooking)) {
      setSharingLocationBookingId(null)
      setLatestSharedCoords(null)
      setSharingError(null)
    }
  }, [sharingLocationBookingId, bookingsArray])

  const handleAcceptBooking = async (bookingId: number) => {
    setAcceptingId(bookingId)
    try {
      await carsApi.respondToBooking(bookingId, 'accept')
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'driver'] })
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
      
      // Auto-start live tracking for ride-hailing bookings
      const booking = bookings?.find((b: any) => b.id === bookingId)
      if (String(booking?.booking_type ?? '').toLowerCase() === 'ride_hailing' && !(booking as any)?.is_intercity) {
        setSharingLocationBookingId(bookingId)
      }
      
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
        return 'bg-green-500/15 text-green-400 border border-green-500/30'
      case 'PENDING_DRIVER_ACCEPTANCE':
        return 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
      case 'IN_PROGRESS':
        return 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
      case 'COMPLETED':
        return 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
      case 'CANCELLED':
      case 'REJECTED':
        return 'bg-red-500/15 text-red-400 border border-red-500/30'
      default:
        return 'bg-gray-800 text-gray-400 border border-gray-700'
    }
  }

  const getStatusActions = (booking: any) => {
    const isRideHailing = booking.booking_type === 'ride_hailing'
    const isAccepting = acceptingId === booking.id
    const isExpired = booking.expires_at ? new Date(booking.expires_at) < new Date() : false
    
    switch (booking.status) {
      case 'PENDING_DRIVER_ACCEPTANCE':
        if (isExpired) {
          return (
            <div className="flex flex-col space-y-2">
              <div className="px-3 py-2 bg-red-50 border border-red-200 rounded text-sm text-red-700 font-medium text-center">
                ⏰ Request Expired
              </div>
            </div>
          )
        }
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
          <div className="flex flex-col space-y-2">
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
      default:
        return null
    }
  }

  return (
    <>
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#214f8c] via-[#1f5678] to-[#0f6667]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[#17385e]/92" />
      </div>
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/80 via-[#0f4c75]/70 to-[#0d9488]/80" />
          <div className="relative z-10 p-6 md:p-8">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-200 transition-colors hover:text-white mb-4">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm">Back to Dashboard</span>
            </button>
            <h1 className="text-3xl font-bold text-white md:text-4xl">My Car Bookings</h1>
            <p className="text-gray-200 text-sm mt-2 md:text-base">Manage bookings for your cars and track your earnings</p>
          </div>
        </motion.div>

      {sharingLocationBookingId && (
        <div className="mb-4 rounded-2xl border border-cyan-400/70 bg-gray-800/50 p-4 text-sm text-teal-300 backdrop-blur-sm">
          <p className="font-semibold">Live location sharing is active automatically for booking #{sharingLocationBookingId}.</p>
          {latestSharedCoords && (
            <p className="text-xs mt-1">
              Last sent: {latestSharedCoords.latitude.toFixed(5)}, {latestSharedCoords.longitude.toFixed(5)}
            </p>
          )}
          {sharingError && <p className="text-xs mt-1 text-red-400">{sharingError}</p>}
        </div>
      )}

      {/* Status Filter */}
      <div className="mb-6 space-y-4">
        {/* Booking Type Filter */}
        <div className="rounded-2xl border border-cyan-400/70 bg-gray-800/50 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { value: 'all' as const, label: 'All Bookings', icon: '📋' },
            { value: 'ride_hailing' as const, label: '🚗 Rides', color: 'teal' },
            { value: 'rental' as const, label: '📅 Rentals', color: 'blue' },
          ].map((filter) => (
            <button
              key={filter.value}
              onClick={() => setBookingTypeFilter(filter.value)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                bookingTypeFilter === filter.value
                  ? filter.value === 'ride_hailing'
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : filter.value === 'rental'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-lg shadow-teal-500/20'
                  : 'border border-white/10 bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        </div>

        {/* Status Filter */}
        <div className="rounded-2xl border border-cyan-400/70 bg-gray-800/50 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap gap-2 justify-center">
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
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                statusFilter === filter.value
                  ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-lg shadow-teal-500/20'
                  : 'border border-white/10 bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 shadow-[0_10px_30px_rgba(2,132,199,0.15)] backdrop-blur-lg lg:p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bookings List */}
        <div className="lg:col-span-2 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border border-cyan-500/60 bg-slate-900/30 p-6 backdrop-blur-md">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          ))
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking: any, index: number) => {
            const isRideHailing = booking.booking_type === 'ride_hailing'
            const isPending = booking.status === 'PENDING_DRIVER_ACCEPTANCE'
            
            return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={booking.id} 
              className={`group relative overflow-hidden rounded-2xl border-2 bg-slate-900/30 backdrop-blur-md transition-all ${
                isRideHailing && isPending ? 'border-teal-400/70 ring-1 ring-teal-500/20' : 'border-cyan-500/60 hover:border-cyan-300/80'
              } ${
                highlightBookingId === booking.id ? 'ring-2 ring-cyan-500 border-cyan-300/80' : ''
              }`}
            >
              <div className="p-6 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full">
                    <div className="flex items-center space-x-3 mb-3">
                      {/* Booking Type Badge */}
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        isRideHailing 
                          ? 'bg-teal-500/90 text-white' 
                          : 'bg-blue-500/90 text-white'
                      }`}>
                        {isRideHailing ? '🚗 RIDE' : '📅 RENTAL'}
                      </span>
                      <h3 className="text-lg font-bold text-white">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-300 mb-4">
                      <div>
                        <span className="font-medium text-gray-400">Customer:</span> <span className="text-white">{booking.customer?.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{isRideHailing ? 'Pickup Time:' : 'Pick-up:'}</span> <span className="text-white">{booking.start_date ? (isRideHailing ? formatRideTime(booking.start_date) : formatDate(booking.start_date)) : 'N/A'}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">{isRideHailing ? 'Est. Distance:' : 'Return:'}</span> <span className="text-white">{isRideHailing ? `${booking.estimated_distance || 0} km` : (booking.end_date ? formatDate(booking.end_date) : 'N/A')}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400">Earnings:</span> <span className={isRideHailing ? 'text-teal-300 font-bold' : 'text-green-300 font-bold'}>PKR {(booking.driver_earnings || 0).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm rounded-xl border border-white/10 bg-gray-900/60 p-3">
                      <div>
                        <span className="font-medium text-gray-400 block text-xs">Booking ID</span> 
                        <span className="text-gray-200">#{booking.id}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400 block text-xs">Total Amount</span> 
                        <span className="text-gray-200">PKR {(booking.total_amount || 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-400 block text-xs">Pickup</span> 
                        <span className="text-gray-200 break-words">{booking.pickup_location || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-0 md:ml-6 flex flex-col space-y-2 w-full md:w-auto mt-4 md:mt-0">
                    {getStatusActions(booking)}
                  </div>
                </div>
              </div>
            </motion.div>
          )})
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/40 border border-white/5 rounded-xl p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12l2 5h-2v2a1 1 0 01-1 1h-1a2 2 0 11-4 0H10a2 2 0 11-4 0H5a1 1 0 01-1-1v-2H2l2-5h2V5a1 1 0 011-1h2a1 1 0 011 1v2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">No bookings found</h3>
            <p className="text-gray-400 text-sm mb-5">
              {statusFilter === 'all' 
                ? "You don't have any bookings yet."
                : `No bookings with status "${statusFilter.replace(/_/g, ' ').toLowerCase()}".`
              }
            </p>
          </motion.div>
        )}
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-1">
          {selectedBooking ? (() => {
            const booking = bookingsArray.find((b: any) => b.id === selectedBooking)
            return (
              <div className="sticky top-6">
                <ChatInterface
                  key={selectedBooking}
                  bookingId={selectedBooking}
                  driverName="You"
                  customerName={booking?.customer?.name || 'Customer'}
                  onClose={() => setSelectedBooking(null)}
                />
              </div>
            )
          })() : (
            <div className="sticky top-6 rounded-2xl border border-white/10 bg-gray-900/60 p-8 text-center shadow-[0_10px_30px_rgba(2,132,199,0.15)] backdrop-blur-lg">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Select a Booking
              </h3>
              <p className="text-gray-400 text-sm">
                Choose a booking from the list to start chatting with the customer
              </p>
            </div>
          )}
        </div>
      </div>
      </div>

        {/* Summary Stats */}
        {Array.isArray(bookings) && bookings.length > 0 && (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-gray-900/60 shadow-[0_10px_30px_rgba(2,132,199,0.15)] backdrop-blur-lg">
            <div className="px-6 py-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">Booking Summary</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-900/50 border border-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-blue-400">
                    {bookings.length}
                  </div>
                  <div className="text-sm text-gray-300">Total Bookings</div>
                </div>
                
                <div className="text-center p-4 bg-gray-900/50 border border-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-green-400">
                    {bookings.filter((b: any) => b.status === 'COMPLETED').length}
                  </div>
                  <div className="text-sm text-gray-300">Completed</div>
                </div>
                
                <div className="text-center p-4 bg-gray-900/50 border border-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-yellow-400">
                    {bookings.filter((b: any) => ['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status)).length}
                  </div>
                  <div className="text-sm text-gray-300">Active</div>
                </div>
                
                <div className="text-center p-4 bg-gray-900/50 border border-white/10 rounded-xl">
                  <div className="text-2xl font-bold text-teal-400">
                    PKR {bookings
                      .filter((b: any) => ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'].includes(b.status))
                      .reduce((sum: number, b: any) => sum + (b.driver_earnings || 0), 0)
                      .toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-300">Total Earnings</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>

    {/* Cash Collection Modal */}
    {cashCollectionBooking && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all">
        <div className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Collect Cash Payment</h2>
            <p className="text-sm text-gray-400 mt-1">Trip #{cashCollectionBooking.id} has been completed</p>
          </div>

          {/* Amount to collect */}
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center mb-5">
            <p className="text-sm text-green-400 font-medium mb-1">Collect from customer</p>
            <p className="text-3xl font-bold text-green-300">
              PKR {parseFloat(cashCollectionBooking.total_amount || 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-500 mt-1">
              Your net earnings: PKR {parseFloat(cashCollectionBooking.driver_earnings || 0).toLocaleString()} (after 5% platform fee)
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm mb-5 border border-white/5">
            <div className="flex justify-between">
              <span className="text-gray-400">Total fare</span>
              <span className="font-medium text-white">PKR {parseFloat(cashCollectionBooking.total_amount || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform commission (5%)</span>
              <span className="font-medium text-red-400">− PKR {parseFloat(cashCollectionBooking.platform_fee || 0).toLocaleString()}</span>
            </div>
            <hr className="border-gray-700" />
            <div className="flex justify-between font-semibold">
              <span className="text-white">Your earnings</span>
              <span className="text-green-400">PKR {parseFloat(cashCollectionBooking.driver_earnings || 0).toLocaleString()}</span>
            </div>
          </div>

          {/* Confirmation checkbox */}
          <label className="flex items-start gap-3 cursor-pointer mb-6">
            <input
              type="checkbox"
              checked={cashConfirmed}
              onChange={(e) => setCashConfirmed(e.target.checked)}
              className="mt-1 w-4 h-4 text-green-500 rounded border-gray-600 bg-gray-800 focus:ring-green-500/20 focus:ring-2"
            />
            <span className="text-sm text-gray-300">
              I confirm I have collected <span className="font-semibold text-white">PKR {parseFloat(cashCollectionBooking.total_amount || 0).toLocaleString()}</span> in cash from the customer.
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => { setCashCollectionBooking(null); setCashConfirmed(false) }}
              className="flex-1 py-2.5 rounded-xl border border-gray-600 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCollectCash}
              disabled={!cashConfirmed || isCashSubmitting}
              className="flex-1 py-2.5 rounded-xl bg-green-500/20 hover:bg-green-500/30 text-green-400 text-sm font-semibold border border-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
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
