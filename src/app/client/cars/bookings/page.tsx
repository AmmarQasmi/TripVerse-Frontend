'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useUserBookings } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { ChatInterface } from '@/components/cars/ChatInterface'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'
import { PageLoader } from '@/components/shared/PageLoader'
import { carsApi } from '@/lib/api/cars.api'

export default function CarBookingsPage() {
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null)
  const [selectedBookingData, setSelectedBookingData] = useState<any>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [expandedBooking, setExpandedBooking] = useState<number | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)
  
  const { data: bookings, isLoading, error } = useUserBookings(statusFilter)

  const canChat = (status: string) => ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  const canCancel = (status: string) => ['PENDING_DRIVER_ACCEPTANCE', 'ACCEPTED'].includes(status)

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

  const statusConfig: Record<string, { color: string, bg: string, icon: JSX.Element, label: string }> = {
    PENDING_DRIVER_ACCEPTANCE: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/15 border-yellow-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Waiting for Driver',
    },
    ACCEPTED: {
      color: 'text-blue-400',
      bg: 'bg-blue-500/15 border-blue-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Driver Accepted',
    },
    CONFIRMED: {
      color: 'text-green-400',
      bg: 'bg-green-500/15 border-green-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
      label: 'Confirmed',
    },
    IN_PROGRESS: {
      color: 'text-purple-400',
      bg: 'bg-purple-500/15 border-purple-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
      label: 'Trip in Progress',
    },
    COMPLETED: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      label: 'Completed',
    },
    CANCELLED: {
      color: 'text-red-400',
      bg: 'bg-red-500/15 border-red-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
      label: 'Cancelled',
    },
    REJECTED: {
      color: 'text-red-400',
      bg: 'bg-red-500/15 border-red-500/30',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>,
      label: 'Rejected',
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageLoader message="Loading bookings..." variant="skeleton" />
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">My Bookings</h1>
          <p className="text-gray-400 text-sm mt-1">Track and manage your car rental bookings</p>
        </motion.div>

        {/* Status Filter Tabs */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  statusFilter === tab.key
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-lg shadow-teal-500/20'
                    : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60 border border-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bookings List */}
          <div className="lg:col-span-2 space-y-4">
            {bookings && bookings.length > 0 ? (
              bookings.map((booking: any, index: number) => {
                const status = getStatus(booking.status)
                const isExpanded = expandedBooking === booking.id
                const timeline = getTimeline(booking)

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gray-800/60 border rounded-xl overflow-hidden transition-all ${
                      selectedBooking === booking.id ? 'border-teal-500/50 ring-1 ring-teal-500/20' : 'border-white/5 hover:border-white/10'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Car Image */}
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-700 flex-shrink-0">
                          {booking.car?.image ? (
                            <img src={booking.car.image} alt={`${booking.car.make} ${booking.car.model}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-500">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7h12l2 5h-2v2a1 1 0 01-1 1h-1a2 2 0 11-4 0H10a2 2 0 11-4 0H5a1 1 0 01-1-1v-2H2l2-5h2V5a1 1 0 011-1h2a1 1 0 011 1v2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="text-white font-semibold text-lg leading-tight">
                                {booking.car.make} {booking.car.model}
                                <span className="text-gray-500 text-sm font-normal ml-1">({booking.car.year})</span>
                              </h3>
                              {/* Driver Info */}
                              <div className="flex items-center gap-2 mt-1.5">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                                  {booking.driver?.photo ? (
                                    <img src={booking.driver.photo} className="w-full h-full rounded-full object-cover" alt="" />
                                  ) : (
                                    booking.driver?.name?.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="text-sm text-gray-400">{booking.driver?.name}</span>
                                {booking.driver?.isVerified && (
                                  <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                  </svg>
                                )}
                                {booking.driver?.city && (
                                  <span className="text-xs text-gray-500">&bull; {booking.driver.city}</span>
                                )}
                              </div>
                            </div>
                            {/* Status Badge */}
                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${status.bg} ${status.color} flex-shrink-0`}>
                              {status.icon}
                              {status.label}
                            </span>
                          </div>

                          {/* Route */}
                          <div className="flex items-center gap-2 mt-3 text-sm">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
                              <span className="text-gray-300 truncate">{booking.pickup_location}</span>
                            </div>
                            <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                              <span className="text-gray-300 truncate">{booking.dropoff_location}</span>
                            </div>
                          </div>

                          {/* Date + Amount Row */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                              </span>
                              {booking.estimated_distance && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                  </svg>
                                  {booking.estimated_distance} km
                                </span>
                              )}
                            </div>
                            <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                              PKR {booking.total_amount?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5">
        {booking.status === 'ACCEPTED' && (
                          <Link href={`/client/cars/booking/confirm?bookingId=${booking.id}`} className="flex items-center gap-1.5 px-3.5 py-1.5 bg-green-500/15 hover:bg-green-500/25 text-green-400 rounded-lg text-sm font-medium transition-colors border border-green-500/20">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm & Pay
                          </Link>
                        )}
                        {booking.status === 'COMPLETED' && (
                          <Link
                            href={`/client/disputes/new?type=car&bookingId=${booking.id}`}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-orange-500/15 hover:bg-orange-500/25 text-orange-400 rounded-lg text-sm font-medium transition-colors border border-orange-500/20"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            File Complaint
                          </Link>
                        )}
                        {canChat(booking.status) && (
                          <button
                            onClick={() => { setSelectedBooking(booking.id); setSelectedBookingData(booking) }}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/20"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            Chat
                          </button>
                        )}
                        <button
                          onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gray-700/50 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
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
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-sm font-medium transition-colors border border-red-500/20 ml-auto disabled:opacity-50"
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

                            {/* Price Breakdown */}
                            {booking.driver_earnings != null && (
                              <div className="bg-gray-900/50 rounded-lg p-3">
                                <h4 className="text-sm font-semibold text-white mb-2">Price Breakdown</h4>
                                <div className="space-y-1.5 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Driver Earnings</span>
                                    <span className="text-gray-300">PKR {booking.driver_earnings?.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-400">Platform Fee</span>
                                    <span className="text-gray-300">PKR {booking.platform_fee?.toLocaleString()}</span>
                                  </div>
                                  <hr className="border-gray-700" />
                                  <div className="flex justify-between font-semibold">
                                    <span className="text-white">Total</span>
                                    <span className="text-teal-400">PKR {booking.total_amount?.toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Car Specs */}
                            {booking.car?.seats && (
                              <div className="flex flex-wrap gap-2">
                                {[
                                  booking.car.seats && `${booking.car.seats} seats`,
                                  booking.car.transmission,
                                  booking.car.fuel_type,
                                  booking.car.color,
                                  booking.car.license_plate,
                                ].filter(Boolean).map((spec: string) => (
                                  <span key={spec} className="px-2 py-1 bg-gray-900/50 text-gray-400 text-xs rounded-lg border border-white/5">{spec}</span>
                                ))}
                              </div>
                            )}

                            {/* Notes */}
                            {booking.customer_notes && (
                              <div className="bg-gray-900/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Your Notes</p>
                                <p className="text-sm text-gray-300">{booking.customer_notes}</p>
                              </div>
                            )}
                            {booking.driver_notes && (
                              <div className="bg-gray-900/50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 mb-1">Driver's Notes</p>
                                <p className="text-sm text-gray-300">{booking.driver_notes}</p>
                              </div>
                            )}

                            {/* Payment Status */}
                            {booking.payment && (
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-gray-400">Payment:</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  booking.payment.status === 'completed' ? 'bg-green-500/15 text-green-400' : 'bg-yellow-500/15 text-yellow-400'
                                }`}>
                                  {booking.payment.status === 'completed' ? 'Paid' : 'Pending'}
                                </span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            ) : (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gray-800/40 border border-white/5 rounded-xl p-12 text-center">
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

          {/* Right Column: Chat */}
          <div className="lg:col-span-1">
            {selectedBooking && selectedBookingData ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="sticky top-6">
                <ChatInterface
                  bookingId={selectedBooking}
                  driverName={selectedBookingData.driver?.name || 'Driver'}
                  customerName={user?.full_name || 'Customer'}
                  onClose={() => { setSelectedBooking(null); setSelectedBookingData(null) }}
                />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-gray-800/40 border border-white/5 rounded-xl p-6 text-center sticky top-6">
                <div className="w-12 h-12 rounded-full bg-gray-700/50 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold mb-1">Chat with Driver</h3>
                <p className="text-gray-500 text-sm">Select an accepted booking to start chatting with your driver</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
