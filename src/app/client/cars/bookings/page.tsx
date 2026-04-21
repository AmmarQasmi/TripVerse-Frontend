'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserBookings } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { ChatInterface } from '@/components/cars/ChatInterface'
import { ComplaintModal } from '@/components/client/ComplaintModal'
import { DriverReviewModal } from '@/components/cars/DriverReviewModal'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { PageLoader } from '@/components/shared/PageLoader'
import { carsApi } from '@/lib/api/cars.api'
import { adminApi } from '@/lib/api/admin.api'
import { getSocket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

export default function CarBookingsPage() {
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [selectedBookingData, setSelectedBookingData] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [bookingTypeFilter, setBookingTypeFilter] = useState<'all' | 'rental' | 'ride_hailing'>('all')
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  const [trackingBookingId, setTrackingBookingId] = useState<number | null>(null)
  const [complaintModalOpen, setComplaintModalOpen] = useState(false)
  const [complaintBookingId, setComplaintBookingId] = useState<number | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [reviewBookingId, setReviewBookingId] = useState<number | null>(null)
  const [reviewDriverName, setReviewDriverName] = useState<string>('')
  const [driverLocation, setDriverLocation] = useState<{
    latitude: number
    longitude: number
    heading?: number
    speed?: number
    accuracy?: number
    timestamp: number
  } | null>(null)
  const [isTrackingConnected, setIsTrackingConnected] = useState(false)
  const [dismissedTrackingBookingIds, setDismissedTrackingBookingIds] = useState<number[]>([])
  const [myDisputedBookingIds, setMyDisputedBookingIds] = useState<Set<number>>(new Set())
  const socketRef = useRef<Socket | null>(null)
  
  const { data: bookings, isLoading, error } = useUserBookings(statusFilter)

  useEffect(() => {
    const loadMyDisputes = async () => {
      try {
        const response = await adminApi.getMyDisputes({ booking_type: 'car', limit: 500 })
        const ids = new Set<number>()
        ;(response?.data || []).forEach((dispute: any) => {
          const bookingId = Number(dispute?.booking?.id ?? dispute?.booking_car_id)
          if (!Number.isNaN(bookingId) && bookingId > 0) {
            ids.add(bookingId)
          }
        })
        setMyDisputedBookingIds(ids)
      } catch {
        setMyDisputedBookingIds(new Set())
      }
    }

    if (user?.id) {
      loadMyDisputes()
    }
  }, [user?.id])

  const canChat = (status: string) => ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  const canCancel = (status: string) => ['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED'].includes(status)
  const normalizeStatus = (status: string) => String(status || '').trim().toUpperCase()
  const canTrackDriver = (booking: any) => {
    const isRideHailing = (booking.booking_type || 'rental') === 'ride_hailing'
    const isWithinCity = !booking.is_intercity
    const normalizedStatus = normalizeStatus(booking.status)
    const isTrackableStage = ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(normalizedStatus)
    // Pending requests should never be trackable; require a response/progress timestamp.
    const hasTrackingStartSignal = Boolean(booking.accepted_at || booking.confirmed_at || booking.started_at)
    return isRideHailing && isWithinCity && isTrackableStage && hasTrackingStartSignal
  }

  // Auto-open chat from notification
  useEffect(() => {
    const openChatId = searchParams.get('openChat')
    if (openChatId && bookings && bookings.length > 0) {
      const bookingId = parseInt(openChatId, 10)
      const booking = bookings.find((b: any) => b.id === bookingId)
      if (booking && canChat(booking.status)) {
        setSelectedBooking(bookingId)
        setSelectedBookingData(booking)
        router.replace('/client/cars/bookings', { scroll: false })
      }
    }
  }, [searchParams, bookings, router])

  useEffect(() => {
    if (!user?.id || !trackingBookingId) {
      setIsTrackingConnected(false)
      return
    }

    const trackingBooking = bookings?.find((booking: any) => booking.id === trackingBookingId)
    if (!trackingBooking || !canTrackDriver(trackingBooking)) {
      setIsTrackingConnected(false)
      return
    }

    const socket = getSocket(undefined, 'chat')
    socketRef.current = socket

    if (!socket.connected) {
      socket.connect()
    }

    const handleConnect = () => {
      setIsTrackingConnected(true)
      socket.emit('join_booking', trackingBookingId)
      socket.emit('request_driver_location', trackingBookingId)
    }

    const handleDisconnect = () => {
      setIsTrackingConnected(false)
    }

    const handleLocationUpdate = (payload: any) => {
      if (Number(payload?.bookingId) !== trackingBookingId) return
      const latitude = Number(payload?.latitude)
      const longitude = Number(payload?.longitude)
      if (Number.isNaN(latitude) || Number.isNaN(longitude)) return

      setDriverLocation({
        latitude,
        longitude,
        heading: payload?.heading,
        speed: payload?.speed,
        accuracy: payload?.accuracy,
        timestamp: Number(payload?.timestamp) || Date.now(),
      })
    }

    socket.on('connect', handleConnect)
    socket.on('disconnect', handleDisconnect)
    socket.on('driver_location_updated', handleLocationUpdate)

    if (socket.connected) {
      handleConnect()
    }

    return () => {
      socket.emit('leave_booking', trackingBookingId)
      socket.off('connect', handleConnect)
      socket.off('disconnect', handleDisconnect)
      socket.off('driver_location_updated', handleLocationUpdate)
      setIsTrackingConnected(false)
    }
  }, [trackingBookingId, user?.id, bookings])

  useEffect(() => {
    if (!trackingBookingId || !bookings) return

    const trackedBooking = bookings.find((booking: any) => booking.id === trackingBookingId)
    if (!trackedBooking || !canTrackDriver(trackedBooking)) {
      setTrackingBookingId(null)
      setDriverLocation(null)
      setIsTrackingConnected(false)
      setDismissedTrackingBookingIds((prev) => (prev.includes(trackingBookingId) ? prev : [...prev, trackingBookingId]))
    }
  }, [trackingBookingId, bookings])

  useEffect(() => {
    if (!bookings || !trackingBookingId) return

    const trackableIds = bookings
      .filter((booking: any) => canTrackDriver(booking))
      .map((booking: any) => booking.id)

    if (!trackableIds.includes(trackingBookingId)) {
      setTrackingBookingId(null)
      setDriverLocation(null)
      setIsTrackingConnected(false)
    }
  }, [bookings, trackingBookingId])

  useEffect(() => {
    if (!bookings || trackingBookingId) return

    // Auto-track only the newest booking to avoid showing tracking from older rides
    // when the latest ride is still pending driver acceptance.
    const newestBooking = bookings[0]
    if (
      newestBooking &&
      canTrackDriver(newestBooking) &&
      !dismissedTrackingBookingIds.includes(newestBooking.id)
    ) {
      setTrackingBookingId(newestBooking.id)
    }
  }, [bookings, trackingBookingId, dismissedTrackingBookingIds])

  useEffect(() => {
    if (!bookings || dismissedTrackingBookingIds.length === 0) return

    // Allow auto-open again for dismissed bookings once they are no longer trackable (trip completed/cancelled/etc.).
    const dismissedStillTrackable = dismissedTrackingBookingIds.filter((bookingId) => {
      const booking = bookings.find((b: any) => b.id === bookingId)
      return booking ? canTrackDriver(booking) : false
    })

    if (dismissedStillTrackable.length !== dismissedTrackingBookingIds.length) {
      setDismissedTrackingBookingIds(dismissedStillTrackable)
    }
  }, [bookings, dismissedTrackingBookingIds])

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <div className="w-16 h-16 rounded-full bg-yellow-500/15 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Login Required</h1>
          <p className="text-gray-400 mb-6">Please login to view your car bookings.</p>
          <Link href="/auth/login" className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all">
            Login
          </Link>
        </motion.div>
      </div>
    )
  }

  const statusConfig: Record<string, { badgeClass: string, icon: JSX.Element, label: string }> = {
    PENDING_DRIVER_ACCEPTANCE: {
      badgeClass: 'bg-yellow-500 border-yellow-300 text-gray-900',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Pending',
    },
    ACCEPTED: {
      badgeClass: 'bg-blue-500 border-blue-300 text-white',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Accepted',
    },
    CONFIRMED: {
      badgeClass: 'bg-green-500 border-green-300 text-white',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
      label: 'Confirmed',
    },
    IN_PROGRESS: {
      badgeClass: 'bg-cyan-500 border-cyan-300 text-gray-900',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      label: 'Active',
    },
    COMPLETED: {
      badgeClass: 'bg-yellow-500 border-yellow-300 text-gray-900',
      icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" /></svg>,
      label: 'Completed',
    },
    CANCELLED: {
      badgeClass: 'bg-red-500 border-red-300 text-white',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
      label: 'Cancelled',
    },
    REJECTED: {
      badgeClass: 'bg-red-500 border-red-300 text-white',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
      label: 'Cancelled',
    },
  }

  const getStatus = (status: string) => statusConfig[status] || statusConfig.CANCELLED

  const handleCancelBooking = async (bookingId: number) => {
    setCancellingId(bookingId)
    try {
      await carsApi.cancelBooking(bookingId)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['car-bookings', 'user'] })
      showToast('Booking cancelled successfully', 'success')
    } catch (error: any) {
      showToast(error?.response?.data?.message || 'Failed to cancel booking', 'error')
    } finally {
      setCancellingId(null)
    }
  }

  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const formatTime = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' at ' + new Date(date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })

  // Format date/time based on booking type
  const formatBookingDateTime = (booking: any) => {
    const bookingType = booking.booking_type || 'rental'
    const startDate = new Date(booking.start_date)
    const endDate = new Date(booking.end_date)
    const now = new Date()
    
    if (bookingType === 'ride_hailing') {
      // For rides: "Today at 3:30 PM" or "Tomorrow at 9:00 AM"
      const isToday = startDate.toDateString() === now.toDateString()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      const isTomorrow = startDate.toDateString() === tomorrow.toDateString()
      
      const timeStr = startDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      
      if (isToday) return `Today at ${timeStr}`
      if (isTomorrow) return `Tomorrow at ${timeStr}`
      return `${startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`
    } else {
      // For rentals: "Jun 15 - Jun 18 (3 days)"
      const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      const startStr = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      const endStr = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      return `${startStr} - ${endStr} (${days} day${days > 1 ? 's' : ''})`
    }
  }

  const formatLocationShort = (location?: string, explicitCity?: string | null) => {
    const value = String(location || '').trim()
    if (!value) return ''

    const parts = value.split(',').map((part) => part.trim()).filter(Boolean)
    const firstPart = parts[0] || value
    const cityRegex = /\b(karachi|lahore|islamabad|rawalpindi|faisalabad|multan|peshawar|quetta|hyderabad|sialkot|gujranwala)\b/i
    const parsedCityPart = [...parts].reverse().find((part) => cityRegex.test(part)) || parts[parts.length - 1]
    const cityPart = String(explicitCity || parsedCityPart || '').trim()

    if (!cityPart || firstPart.toLowerCase() === cityPart.toLowerCase()) {
      return firstPart
    }

    if (cityRegex.test(firstPart)) {
      return firstPart
    }

    return `${firstPart}, ${cityPart}`
  }

  // Filter bookings by type
  const filteredBookings = bookings?.filter((booking: any) => {
    if (bookingTypeFilter === 'all') return true
    return (booking.booking_type || 'rental') === bookingTypeFilter
  }) || []

  // Timeline steps for a booking
  const getTimeline = (booking: any) => {
    const steps = [
      { label: 'Requested', time: booking.requested_at || booking.created_at, done: true },
      { label: 'Driver Responded', time: booking.accepted_at, done: !!booking.accepted_at },
      { label: 'Confirmed', time: booking.confirmed_at, done: !!booking.confirmed_at },
      { label: 'Trip Started', time: booking.started_at, done: !!booking.started_at },
      { label: 'Completed', time: booking.completed_at, done: !!booking.completed_at },
    ]
    if (booking.status === 'CANCELLED' || booking.status === 'REJECTED') {
      return steps.filter(s => s.done)
    }
    return steps
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#214f8c] via-[#1f5678] to-[#0f6667]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-x-0 top-0 h-[560px] bg-[#17385e]/92" />
        </div>
        <div className="relative z-10">
          <PageLoader message="Loading bookings..." variant="skeleton" />
        </div>
      </div>
    )
  }

  const filterTabs = [
    { key: '', label: 'All', count: null },
    { key: 'PENDING_DRIVER_ACCEPTANCE', label: 'Pending' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'IN_PROGRESS', label: 'Active' },
    { key: 'COMPLETED', label: 'Completed' },
    { key: 'CANCELLED', label: 'Cancelled' },
  ]

  const bookingTypeTabs = [
    { key: 'all' as const, label: 'All Bookings', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg> },
    { key: 'ride_hailing' as const, label: 'Rides', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { key: 'rental' as const, label: 'Rentals', icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
  ]

  const carCardBackgrounds = [
    '/images/cars/car2.jpg',
    '/images/cars/car%203.jpg',
    '/images/cars/car%204.jpg',
    '/images/cars/car%205.jpg',
    '/images/cars/car%206.jpg',
    '/images/cars/car%207.jpg',
    '/images/cars/car%208.jpg',
  ]

  const activeTrackingBooking = trackingBookingId
    ? bookings?.find((booking: any) => booking.id === trackingBookingId)
    : null
  const shouldShowTrackingPanel = !!activeTrackingBooking && canTrackDriver(activeTrackingBooking)

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-r from-[#214f8c] via-[#1f5678] to-[#0f6667]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[560px] bg-[#17385e]/92" />
      </div>
      <div className="relative z-10 container mx-auto max-w-6xl px-4 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative mb-6 overflow-hidden rounded-2xl border border-white/10">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80')" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/80 via-[#0f4c75]/70 to-[#0d9488]/80" />
          <div className="relative z-10 p-6 md:p-8">
            <div className="mb-5 flex items-center justify-between gap-3">
              <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-200 transition-colors hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm">Back</span>
              </button>
              <Link
                href="/client/disputes"
                className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/20 px-3 py-1.5 text-sm font-medium text-orange-200 transition-colors hover:bg-orange-500/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Complaints
              </Link>
            </div>

            <h1 className="text-center text-3xl font-bold text-white md:text-4xl">My Bookings</h1>
            <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-200 md:text-base">
              Track and manage your car rental bookings
            </p>
          </div>
        </motion.div>

        {/* Booking Type Filter */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 }} className="mb-4 rounded-2xl border border-cyan-400/70 bg-gray-800/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap justify-center gap-2">
            {bookingTypeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setBookingTypeFilter(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  bookingTypeFilter === tab.key
                    ? tab.key === 'ride_hailing' 
                      ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                      : tab.key === 'rental'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        : 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-lg shadow-teal-500/20'
                    : 'border border-white/10 bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Status Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 rounded-2xl border border-cyan-400/70 bg-gray-800/50 p-4 backdrop-blur-sm">
          <div className="flex flex-wrap justify-center gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-lg shadow-teal-500/20'
                    : 'border border-white/10 bg-gray-700/50 text-gray-300 hover:bg-gray-700/70 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-4 shadow-[0_10px_30px_rgba(2,132,199,0.15)] backdrop-blur-lg lg:p-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-12 xl:gap-6">
              {/* Bookings List */}
              <div className="w-full space-y-4 xl:col-span-8 xl:order-2">
            {filteredBookings && filteredBookings.length > 0 ? (
              filteredBookings.map((booking: any, index: number) => {
                const status = getStatus(booking.status)
                const isExpanded = expandedBooking === booking.id
                const timeline = getTimeline(booking)
                const bookingType = booking.booking_type || 'rental'
                const isRideHailing = bookingType === 'ride_hailing'
                const showTrackDriver = canTrackDriver(booking)
                const complaintAlreadyFiled = myDisputedBookingIds.has(booking.id)
                const cardBackgroundImage =
                  carCardBackgrounds[Math.abs(Number(booking.id) || index) % carCardBackgrounds.length]
                const hasUnreadChat =
                  Number(
                    booking.unread_chat_count ??
                      booking.unread_count ??
                      booking.unread_messages ??
                      booking.unreadMessages ??
                      0,
                  ) > 0 || Boolean(booking.has_unread_messages ?? booking.hasUnreadMessages)

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group relative overflow-hidden rounded-2xl border-2 bg-slate-900/30 backdrop-blur-md transition-all ${
                      selectedBooking === booking.id ? 'border-cyan-300/80 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]' : 'border-cyan-500/60 hover:border-cyan-300/80'
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0">
                      <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${cardBackgroundImage}')` }}
                      />
                      <div className="absolute inset-0 bg-black/65" />
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-slate-900/20 to-slate-950/45" />
                    </div>
                    <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-600/5 to-blue-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
                    {/* Card Header */}
                    <div className="relative z-10 p-4">
                      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-center">
                        {/* Left: Car + Driver */}
                        <div className="lg:col-span-8">
                          <div className="flex items-start gap-4">
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gray-700">
                              {booking.car?.image ? (
                                <img src={booking.car.image} alt={`${booking.car.make} ${booking.car.model}`} className="h-full w-full object-cover" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-500">
                                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12l2 5h-2v2a1 1 0 01-1 1h-1a2 2 0 11-4 0H10a2 2 0 11-4 0H5a1 1 0 01-1-1v-2H2l2-5h2V5a1 1 0 011-1h2a1 1 0 011 1v2z" />
                                  </svg>
                                </div>
                              )}
                              <div className={`absolute left-1 top-1 rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                isRideHailing ? 'bg-teal-500/90 text-white' : 'bg-blue-500/90 text-white'
                              }`}>
                                {isRideHailing ? 'RIDE' : 'RENTAL'}
                              </div>
                            </div>

                            <div className="min-w-0">
                              <h3 className="text-xl font-semibold leading-tight text-white whitespace-nowrap">
                                {booking.car.make} {booking.car.model} <span className="text-gray-400">({booking.car.year})</span>
                              </h3>
                              <div className="mt-1.5 space-y-1 text-sm text-gray-400">
                                <p className="flex items-center gap-1.5 text-teal-300">
                                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {formatBookingDateTime(booking)}
                                </p>
                                {booking.estimated_distance && (
                                  <p className="flex items-center gap-1.5">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                    </svg>
                                    {booking.estimated_distance} km
                                  </p>
                                )}
                                {isRideHailing && booking.is_intercity && (
                                  <p className="flex items-center gap-1 text-purple-400">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Intercity
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right: Status + Price */}
                        <div className="lg:col-span-4">
                          <div className="flex items-start justify-between gap-3 lg:flex-col lg:items-end lg:text-right">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${status.badgeClass} ${booking.status === 'COMPLETED' ? 'flex-col items-center gap-0.5 leading-tight' : 'items-center gap-1.5'}`}
                            >
                              {status.icon}
                              <span>{status.label}</span>
                            </span>
                            <div>
                              <p className="text-4xl font-bold text-white">
                                PKR {booking.total_amount?.toLocaleString()}
                              </p>
                              <p className="text-xs font-semibold tracking-wide text-teal-300">
                                {isRideHailing ? 'RIDE HAILING' : 'RENTAL'}
                              </p>
                              <p className="text-xs text-gray-400">booking total</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] px-3 py-2">
                        <div className="flex items-center justify-center text-xs text-white">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-white/95">{formatLocationShort(booking.pickup_location, booking.pickup_city_name || booking.pickup_city?.name)}</span>
                            <span className="text-white/70">→</span>
                            <span className="truncate text-white/95">{formatLocationShort(booking.dropoff_location, booking.dropoff_city_name || booking.dropoff_city?.name)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 border-t border-white/5 pt-3">
                        {booking.status === 'ACCEPTED' && !showTrackDriver && (
                          <Link href={`/client/cars/booking/confirm?bookingId=${booking.id}`} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-400 text-white rounded-lg text-sm font-semibold transition-colors border border-green-300">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm & Pay
                          </Link>
                        )}
                        {showTrackDriver && (
                          <button
                            onClick={() => {
                              setTrackingBookingId(booking.id)
                              setSelectedBooking(booking.id)
                              setSelectedBookingData(booking)
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500 hover:bg-green-400 text-white rounded-lg text-sm font-semibold transition-colors border border-green-300"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                            </svg>
                            Track Driver
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              setReviewBookingId(booking.id)
                              setReviewDriverName(booking.driver?.name || 'Driver')
                              setReviewModalOpen(true)
                            }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg text-sm font-semibold transition-colors border border-yellow-300"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            Rate Driver
                          </button>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <button
                            onClick={() => {
                              if (complaintAlreadyFiled) return
                              setComplaintBookingId(booking.id)
                              setComplaintModalOpen(true)
                            }}
                            disabled={complaintAlreadyFiled}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                              complaintAlreadyFiled
                                ? 'bg-red-700 text-white border-red-600 cursor-not-allowed opacity-80'
                                : 'bg-red-500 hover:bg-red-400 text-white border-red-300'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {complaintAlreadyFiled ? 'Complaint Filed' : 'File Complaint'}
                          </button>
                        )}
                        {canChat(booking.status) && (
                          <button
                            onClick={() => { setSelectedBooking(booking.id); setSelectedBookingData(booking) }}
                            className="relative flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-slate-700/30 text-slate-300 transition-colors hover:bg-slate-700/45"
                            aria-label="Open chat"
                            title="Open chat"
                          >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 10h.01M12 10h.01M16 10h.01M7 16h10a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v5a3 3 0 003 3zm0 0l-3 3" />
                            </svg>
                            {hasUnreadChat && <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />}
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors border border-blue-500"
                        >
                          <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                          {isExpanded ? 'Less' : 'Details'}
                        </button>
                        {canCancel(booking.status) && (
                          <button
                            onClick={() => handleCancelBooking(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition-colors border border-red-300 disabled:opacity-50"
                          >
                            {cancellingId === booking.id ? (
                              <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            )}
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">
                            {/* Timeline */}
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-3">Booking Timeline</h4>
                              <div className="space-y-0">
                                {timeline.map((step, i) => (
                                  <div key={step.label} className="flex items-start gap-3">
                                    <div className="flex flex-col items-center">
                                      <div className={`w-3 h-3 rounded-full flex-shrink-0 ${step.done ? 'bg-teal-400' : 'bg-gray-600'}`} />
                                      {i < timeline.length - 1 && (
                                        <div className={`w-0.5 h-6 ${step.done && timeline[i + 1]?.done ? 'bg-teal-400' : 'bg-gray-700'}`} />
                                      )}
                                    </div>
                                    <div className="pb-2 -mt-0.5">
                                      <p className={`text-sm font-medium ${step.done ? 'text-white' : 'text-gray-600'}`}>{step.label}</p>
                                      {step.time && step.done && (
                                        <p className="text-xs text-gray-500">{formatTime(step.time)}</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="rounded-lg p-3 bg-gray-900/50 border border-white/5">
                              <h4 className="text-sm font-semibold text-white mb-3">Booking Summary</h4>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Car</span>
                                  <span className="text-gray-200 text-right">{booking.car?.make} {booking.car?.model} ({booking.car?.year})</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Driver</span>
                                  <span className="text-gray-200 text-right">{booking.driver?.name || 'Driver'}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Pickup</span>
                                  <span className="text-gray-200 text-right break-words">{booking.pickup_location}</span>
                                </div>
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Drop-off</span>
                                  <span className="text-gray-200 text-right break-words">{booking.dropoff_location}</span>
                                </div>
                                {booking.estimated_distance && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-400">Distance</span>
                                    <span className="text-gray-200 text-right">{booking.estimated_distance} km</span>
                                  </div>
                                )}
                                <div className="flex justify-between gap-4">
                                  <span className="text-gray-400">Total Price</span>
                                  <span className="text-teal-300 text-right font-semibold">PKR {booking.total_amount?.toLocaleString()}</span>
                                </div>
                                {booking.confirmed_at && (
                                  <div className="flex justify-between gap-4">
                                    <span className="text-gray-400">Confirmed On</span>
                                    <span className="text-gray-200 text-right">{formatTime(booking.confirmed_at)}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-white/10 bg-gray-800/50 p-12 text-center backdrop-blur-sm">
                <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12l2 5h-2v2a1 1 0 01-1 1h-1a2 2 0 11-4 0H10a2 2 0 11-4 0H5a1 1 0 01-1-1v-2H2l2-5h2V5a1 1 0 011-1h2a1 1 0 011 1v2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">No bookings found</h3>
                <p className="text-gray-400 text-sm mb-5">
                  {statusFilter ? `No bookings with status "${getStatus(statusFilter).label}"` : "You haven't made any car bookings yet"}
                </p>
                <Link href="/client/cars" className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg shadow-teal-500/20 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse Cars
                </Link>
              </motion.div>
            )}
              </div>

              {/* Right Column: Tracking + Chat */}
              <div className="w-full xl:col-span-4 xl:order-1">
            {shouldShowTrackingPanel ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-6 mb-4 rounded-2xl border border-cyan-400/35 bg-gradient-to-br from-slate-900/70 via-slate-800/55 to-cyan-950/45 p-4 shadow-[0_10px_30px_rgba(8,145,178,0.18)] backdrop-blur-md">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold tracking-wide">Track Driver</h3>
                  <button
                    onClick={() => {
                      if (trackingBookingId) {
                        setDismissedTrackingBookingIds((prev) =>
                          prev.includes(trackingBookingId) ? prev : [...prev, trackingBookingId],
                        )
                      }
                      setTrackingBookingId(null)
                      setDriverLocation(null)
                      setIsTrackingConnected(false)
                    }}
                    className="text-gray-400 hover:text-cyan-200 text-xs transition-colors"
                  >
                    Close
                  </button>
                </div>

                <div className="text-xs text-cyan-100/75 mb-3">
                  {isTrackingConnected ? 'Live tracking connected' : 'Connecting to live tracking...'}
                </div>

                {driverLocation ? (
                  <>
                    <div className="rounded-xl overflow-hidden border border-cyan-400/20 h-56 bg-slate-950/70">
                      <iframe
                        title="Driver live location"
                        className="w-full h-full"
                        loading="lazy"
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${driverLocation.longitude - 0.01}%2C${driverLocation.latitude - 0.01}%2C${driverLocation.longitude + 0.01}%2C${driverLocation.latitude + 0.01}&layer=mapnik&marker=${driverLocation.latitude}%2C${driverLocation.longitude}`}
                      />
                    </div>
                    <div className="mt-3 text-xs text-gray-200/85 space-y-1">
                      <div>
                        Driver coordinates: {driverLocation.latitude.toFixed(5)}, {driverLocation.longitude.toFixed(5)}
                      </div>
                      <div>
                        Last update: {new Date(driverLocation.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl border border-dashed border-cyan-400/25 bg-slate-900/35 p-4 text-xs text-gray-300/70">
                    Waiting for live driver location to appear.
                  </div>
                )}
              </motion.div>
            ) : null}

            {selectedBooking && selectedBookingData ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={trackingBookingId ? '' : 'sticky top-6'}>
                <ChatInterface
                  bookingId={selectedBooking}
                  driverName={selectedBookingData.driver?.name || 'Driver'}
                  customerName={user?.full_name || 'Customer'}
                  onClose={() => { setSelectedBooking(null); setSelectedBookingData(null) }}
                />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-6 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-slate-900/70 via-slate-800/55 to-cyan-950/45 p-6 text-center shadow-[0_10px_30px_rgba(8,145,178,0.16)] backdrop-blur-md">
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-300/15 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-cyan-200/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-2">Chat with Driver</h3>
                <p className="text-gray-300/70 text-sm leading-relaxed">Select an accepted booking to start chatting with your driver</p>
              </motion.div>
            )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={complaintModalOpen}
        onClose={() => {
          setComplaintModalOpen(false)
          setComplaintBookingId(null)
        }}
        bookingType="car"
        bookingId={complaintBookingId}
      />

      {/* Driver Review Modal */}
      {reviewBookingId && (
        <DriverReviewModal
          bookingId={String(reviewBookingId)}
          driverName={reviewDriverName}
          isOpen={reviewModalOpen}
          onClose={() => {
            setReviewModalOpen(false)
            setReviewBookingId(null)
            setReviewDriverName('')
          }}
        />
      )}
    </div>
  )
}
