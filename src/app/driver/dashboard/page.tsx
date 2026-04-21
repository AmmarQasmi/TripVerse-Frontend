'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { SuspensionStatusCard } from '@/components/driver/SuspensionStatusCard'
import { DisputeWarningBadge } from '@/components/shared/DisputeWarningBadge'
import { DriverBookingsModal } from '@/components/driver/DriverBookingsModal'
import { StatsModal } from '@/components/client/StatsModal'
import { PageLoader } from '@/components/shared/PageLoader'
import { CarListingForm } from '@/components/driver/CarListingForm'
import { ChatInterface } from '@/components/cars/ChatInterface'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { driversApi } from '@/lib/api/drivers.api'
import type { DriverDashboard, DriverSuspensionStatus } from '@/lib/api/drivers.api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCar, faClipboardList, faCreditCard } from '@fortawesome/free-solid-svg-icons'
import { carsApi } from '@/lib/api/cars.api'

export default function DriverDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null)
  const [suspensionStatus, setSuspensionStatus] = useState<DriverSuspensionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showBookingsModal, setShowBookingsModal] = useState(false)
  const [bookingsModalTitle, setBookingsModalTitle] = useState('My Car Bookings')
  const [bookingsModalData, setBookingsModalData] = useState<any[]>([])
  const [modalType, setModalType] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any[]>([])
  const [showAddCarModal, setShowAddCarModal] = useState(false)
  const [isSubmittingCar, setIsSubmittingCar] = useState(false)
  const [chatBooking, setChatBooking] = useState<any>(null)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [dashboardData, suspensionData] = await Promise.all([
          driversApi.getDashboard(),
          driversApi.getSuspensionStatus().catch(() => null), // Don't fail if endpoint doesn't exist yet
        ])
        setDashboard(dashboardData)
        setSuspensionStatus(suspensionData)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard')
        console.error('Error fetching driver dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'driver') {
      fetchDashboard()
    }
  }, [user])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const handleAcceptBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId)
      await carsApi.respondToBooking(bookingId, 'accept')
      const dashboardData = await driversApi.getDashboard()
      setDashboard(dashboardData)
    } catch (err: any) {
      console.error('Failed to accept booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleRejectBooking = async (bookingId: number) => {
    try {
      setActionLoading(bookingId)
      await carsApi.respondToBooking(bookingId, 'reject')
      const dashboardData = await driversApi.getDashboard()
      setDashboard(dashboardData)
    } catch (err: any) {
      console.error('Failed to reject booking:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddCar = async (formData: any) => {
    try {
      setIsSubmittingCar(true)
      const response = await carsApi.create({
        make: formData.make,
        model: formData.model,
        year: formData.year,
        color: formData.color,
        seats: formData.seats,
        transmission: formData.transmission,
        fuel_type: formData.fuel_type,
        base_price_per_day: formData.base_price_per_day,
        distance_rate_per_km: formData.distance_rate_per_km,
        license_plate: formData.license_plate,
        // Dual-mode availability
        available_for_rental: formData.available_for_rental,
        available_for_ride_hailing: formData.available_for_ride_hailing,
        // Ride-hailing pricing
        base_fare: formData.base_fare,
        per_km_rate: formData.per_km_rate,
        per_minute_rate: formData.per_minute_rate,
        minimum_fare: formData.minimum_fare,
      })

      if (formData.images && formData.images.length > 0) {
        await carsApi.uploadCarImages(response.id, formData.images)
      }

      setShowAddCarModal(false)
      router.push('/driver/cars')
    } catch (err: any) {
      console.error('Error adding car:', err)
    } finally {
      setIsSubmittingCar(false)
    }
  }

  const canChat = (status: string) => {
    return ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(status)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800'
      case 'PENDING_DRIVER_ACCEPTANCE':
      case 'ACCEPTED':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800'
      case 'REJECTED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <PageLoader variant="skeleton" />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="mt-4"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  const { verification_status, stats, recent_bookings } = dashboard

  // Timer component for countdown display
  const TimerBadge = ({ expiresAt }: { expiresAt: string }) => {
    const [timeLeft, setTimeLeft] = useState<string>('...')

    useEffect(() => {
      const updateTimer = () => {
        const expiresDate = new Date(expiresAt).getTime()
        const now = new Date().getTime()
        const difference = expiresDate - now

        if (difference <= 0) {
          setTimeLeft('EXPIRED')
        } else {
          const minutes = Math.floor(difference / 60000)
          const seconds = Math.floor((difference % 60000) / 1000)
          setTimeLeft(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
        }
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }, [expiresAt])

    const isExpired = timeLeft === 'EXPIRED'
    const isLowTime = !isExpired && parseInt(timeLeft.split(':')[0]) === 0

    if (isExpired) {
      return (
        <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-700">
          EXPIRED
        </span>
      )
    }

    return (
      <motion.span
        animate={isLowTime ? { scale: [1, 1.05, 1] } : {}}
        transition={isLowTime ? { repeat: Infinity, duration: 1 } : {}}
        className={`px-2 py-1 rounded text-xs font-bold ${
          isLowTime
            ? 'bg-red-100 text-red-700'
            : 'bg-orange-100 text-orange-700'
        }`}
      >
        ⏱️ {timeLeft}
      </motion.span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container relative mx-auto overflow-hidden rounded-2xl px-4 py-8">
        <div
          className="pointer-events-none absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
          style={{ backgroundImage: "url('/images/cities/world%20map.png')" }}
        />
        <div className="pointer-events-none absolute inset-0 bg-white/80" />
        <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Suspension/Warning Status */}
          {suspensionStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <SuspensionStatusCard status={suspensionStatus} />
            </motion.div>
          )}

          {/* Dispute Warning Badge */}
          {suspensionStatus && suspensionStatus.warning_sent && !suspensionStatus.is_suspended && !suspensionStatus.is_banned && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <DisputeWarningBadge 
                disputeCount={suspensionStatus.dispute_count} 
                warningSent={suspensionStatus.warning_sent} 
              />
            </motion.div>
          )}

          {/* Stats Overview Section */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="animated-gradient-text">
                Dashboard Overview
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <DoughnutChart
                label="Total Earnings"
                value={`PKR ${stats.total_earnings.toLocaleString()}`}
                gradient="bg-gradient-to-br from-green-500 to-emerald-500"
                delay={0.1}
                subtitle="All time"
                onClick={() => {
                  if (!dashboard) return
                  // Earnings should only include completed bookings.
                  const earningsData = (dashboard.recent_bookings || [])
                    .filter((b: any) => b.status === 'COMPLETED' && b.driver_earnings > 0)
                    .map((b: any) => ({
                      id: b.id,
                      type: 'car' as const,
                      name: `${b.car?.make || ''} ${b.car?.model || ''}`.trim() || 'Car Booking',
                      date: b.created_at || new Date().toISOString(),
                      status: b.status,
                      amount: b.driver_earnings || 0,
                      startDate: b.start_date,
                      endDate: b.end_date,
                    }))
                  setModalData(earningsData)
                  setModalType('Total Earnings')
                }}
              />
              <DoughnutChart
                label="Incoming Requests"
                value={stats.incoming_requests}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                delay={0.2}
                subtitle="Awaiting your response"
                onClick={() => {
                  if (!dashboard) return
                  // Show pending bookings
                  const pendingData = (dashboard.recent_bookings || [])
                    .filter((b: any) => b.status === 'PENDING_DRIVER_ACCEPTANCE')
                    .map((b: any) => ({
                      id: b.id,
                      type: 'car' as const,
                      name: `${b.car?.make || ''} ${b.car?.model || ''}`.trim() || 'Car Booking',
                      date: b.created_at || new Date().toISOString(),
                      status: b.status,
                      amount: b.total_amount || 0,
                      startDate: b.start_date,
                      endDate: b.end_date,
                      booking_type: b.booking_type,
                      is_intercity: b.is_intercity,
                      expires_at: b.expires_at,
                    }))
                  setModalData(pendingData)
                  setModalType('Incoming Requests')
                }}
              />
              <DoughnutChart
                label="Confirmed Bookings"
                value={stats.confirmed_bookings}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                delay={0.3}
                subtitle="Active bookings"
                onClick={() => {
                  if (!dashboard) return
                  const confirmedData = (dashboard.recent_bookings || []).filter((b: any) =>
                    ['ACCEPTED', 'CONFIRMED', 'IN_PROGRESS'].includes(b.status),
                  )
                  setBookingsModalTitle('Confirmed Bookings')
                  setBookingsModalData(confirmedData)
                  setShowBookingsModal(true)
                }}
              />
              <DoughnutChart
                label="Car Listings"
                value={stats.active_cars_count}
                gradient="bg-gradient-to-br from-orange-500 to-red-500"
                delay={0.4}
                subtitle={`${stats.car_listings_count} total`}
                onClick={() => {
                  router.push('/driver/cars')
                }}
              />
            </div>
          </motion.section>

          {/* Quick Actions - Plan Trips Style */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                <motion.span
                  className="animated-gradient-text"
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: '100% 50%' }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Quick Actions
                </motion.span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              {/* Add New Car Card - Gradient Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  whileHover={{ 
                    scale: 1.05,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group"
                >
                  {verification_status.is_verified ? (
                    <div onClick={() => setShowAddCarModal(true)} className="cursor-pointer">
                      <div 
                        className="relative w-full max-w-[200px] mx-auto aspect-square rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-75 group flex flex-col items-center justify-center"
                        style={{
                          border: '2px solid transparent',
                          backgroundImage: `
                            linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
                            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                          `,
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box'
                        }}
                      >
                        {/* Animated Neon Border */}
                        <motion.div
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            opacity: 0.9,
                            filter: 'blur(1px)',
                            zIndex: -1,
                            border: '2px solid transparent',
                            backgroundClip: 'border-box'
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Outer Glow Effect */}
                        <motion.div 
                          className="absolute inset-0 rounded-2xl"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            filter: 'blur(3px)',
                            opacity: 0.4,
                            zIndex: -2
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Corner Highlights */}
                        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
                        <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>

                        {/* Background Image Layer */}
                        <div
                          className="absolute inset-0 bg-cover bg-center opacity-20"
                          style={{ backgroundImage: 'url(/images/cities/lahore/lahore-02.jpg)' }}
                        />

                        {/* Readability Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-black/30"></div>
                        
                        {/* Inner Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-75 rounded-2xl"></div>
                        
                        {/* Floating Plus Icon */}
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-center relative z-10"
                        >
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-blue-500/50 transition-all">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-white font-semibold text-sm mb-0.5">Add New Car</p>
                          <p className="text-cyan-300 text-xs px-2">List a new vehicle</p>
                        </motion.div>
                      </div>
                    </div>
                  ) : (
                    <div 
                      className="relative w-full max-w-[200px] mx-auto aspect-square rounded-2xl overflow-hidden opacity-50 cursor-not-allowed backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 shadow-2xl transition-all duration-75 flex flex-col items-center justify-center"
                      style={{
                        border: '2px solid transparent',
                        backgroundImage: `
                          linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
                          linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                        `,
                        backgroundOrigin: 'border-box',
                        backgroundClip: 'padding-box, border-box'
                      }}
                      title="Please verify your account to add cars"
                    >
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-20"
                        style={{ backgroundImage: 'url(/images/cities/lahore/lahore-02.jpg)' }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-black/20 to-black/30"></div>

                      <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-2 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="relative z-10 text-white font-semibold text-sm mb-0.5">Add New Car</p>
                      <p className="relative z-10 text-cyan-300 text-xs px-2">Verify to enable</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Three Circular Icon Buttons */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* My Cars Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6, duration: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group"
                >
                  {verification_status.is_verified ? (
                    <Link href="/driver/cars">
                      <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden"
                        style={{
                          border: '4px solid transparent',
                          backgroundImage: `
                            linear-gradient(white, white),
                            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                          `,
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box'
                        }}
                      >
                        {/* Animated Border Glow */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            opacity: 0.9,
                            filter: 'blur(2px)',
                            zIndex: -1
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Outer Glow */}
                        <motion.div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            filter: 'blur(4px)',
                            opacity: 0.4,
                            zIndex: -2
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Icon */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <FontAwesomeIcon 
                            icon={faCar} 
                            className="w-12 h-12 md:w-16 md:h-16 mb-2"
                            style={{ color: '#0891b2' }}
                          />
                          <p className="text-xs font-semibold text-gray-600">{stats.active_cars_count} of {stats.car_listings_count} active</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-gray-200 shadow-2xl flex items-center justify-center overflow-hidden opacity-50 cursor-not-allowed"
                      title="Please verify your account to manage cars"
                    >
                      <FontAwesomeIcon 
                        icon={faCar} 
                        className="w-12 h-12 md:w-16 md:h-16"
                        style={{ color: '#6b7280' }}
                      />
                    </div>
                  )}
                </motion.div>

                {/* Bookings Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7, duration: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group"
                >
                  {verification_status.is_verified ? (
                    <Link href="/driver/bookings">
                      <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden"
                        style={{
                          border: '4px solid transparent',
                          backgroundImage: `
                            linear-gradient(white, white),
                            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                          `,
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box'
                        }}
                      >
                        {/* Animated Border Glow */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            opacity: 0.9,
                            filter: 'blur(2px)',
                            zIndex: -1
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Outer Glow */}
                        <motion.div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            filter: 'blur(4px)',
                            opacity: 0.4,
                            zIndex: -2
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Icon */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <FontAwesomeIcon 
                            icon={faClipboardList} 
                            className="w-12 h-12 md:w-16 md:h-16 mb-2"
                            style={{ color: '#0891b2' }}
                          />
                          <p className="text-xs font-semibold text-gray-600">View all bookings</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-gray-200 shadow-2xl flex items-center justify-center overflow-hidden opacity-50 cursor-not-allowed"
                      title="Please verify your account to view bookings"
                    >
                      <FontAwesomeIcon 
                        icon={faClipboardList} 
                        className="w-12 h-12 md:w-16 md:h-16"
                        style={{ color: '#6b7280' }}
                      />
                    </div>
                  )}
                </motion.div>

                {/* Earnings Button */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8, duration: 0.5, type: "spring", stiffness: 200 }}
                  whileHover={{ 
                    scale: 1.1,
                    transition: { type: "spring", stiffness: 300, damping: 20 }
                  }}
                  className="group"
                >
                  {verification_status.is_verified ? (
                    <Link href="/driver/payouts">
                      <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden"
                        style={{
                          border: '4px solid transparent',
                          backgroundImage: `
                            linear-gradient(white, white),
                            linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                          `,
                          backgroundOrigin: 'border-box',
                          backgroundClip: 'padding-box, border-box'
                        }}
                      >
                        {/* Animated Border Glow */}
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            opacity: 0.9,
                            filter: 'blur(2px)',
                            zIndex: -1
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Outer Glow */}
                        <motion.div 
                          className="absolute inset-0 rounded-full"
                          style={{
                            background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                            backgroundSize: '200% 100%',
                            filter: 'blur(4px)',
                            opacity: 0.4,
                            zIndex: -2
                          }}
                          animate={{ 
                            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                          }}
                          transition={{ 
                            duration: 3, 
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                        
                        {/* Icon */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <FontAwesomeIcon 
                            icon={faCreditCard} 
                            className="w-12 h-12 md:w-16 md:h-16 mb-2"
                            style={{ color: '#0891b2' }}
                          />
                          <p className="text-xs font-semibold text-gray-600">Track earnings</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-gray-200 shadow-2xl flex items-center justify-center overflow-hidden opacity-50 cursor-not-allowed"
                      title="Please verify your account to view earnings"
                    >
                      <FontAwesomeIcon 
                        icon={faCreditCard} 
                        className="w-12 h-12 md:w-16 md:h-16"
                        style={{ color: '#6b7280' }}
                      />
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.section>

            {/* Recent Bookings */}
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Bookings</CardTitle>
                {verification_status.is_verified && (
                      <Link href="/driver/bookings">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                {recent_bookings.length > 0 ? (
                  recent_bookings.map((booking) => {
                    const isRideHailing = booking.booking_type === 'ride_hailing'
                    const isPending = booking.status === 'PENDING_DRIVER_ACCEPTANCE'
                    return (
                          <div
                            key={booking.id}
                            className="group rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden"
                            style={{
                              border: '2px solid transparent',
                              backgroundImage: `
                                linear-gradient(to right, rgb(240, 249, 255), rgb(240, 253, 250)),
                                linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                              `,
                              backgroundOrigin: 'border-box',
                              backgroundClip: 'padding-box, border-box'
                            }}
                          >
                            <div className="bg-gradient-to-r from-blue-700 via-cyan-600 to-emerald-600 border-b border-cyan-400/50 px-4 py-3">
                              <div className="flex justify-between items-start gap-3">
                                <div className="min-w-0">
                                  <div className="font-bold text-white leading-tight truncate">
                                    {booking.car.make} {booking.car.model}
                                  </div>
                                  <div className="text-xs text-white/90 mt-0.5 truncate">
                                    {booking.customer.name} • {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                                    {booking.status.replace(/_/g, ' ')}
                                  </span>
                                  {isRideHailing && isPending && booking.expires_at && (
                                    <TimerBadge expiresAt={booking.expires_at} />
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="p-4">
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className="text-gray-600 text-sm">Your Earning</p>
                                  <p className="font-bold text-cyan-700 text-xl">PKR {booking.driver_earnings.toLocaleString()}</p>
                                </div>

                                <div className="flex items-center gap-2">
                                  {booking.status === 'PENDING_DRIVER_ACCEPTANCE' && (
                                    <>
                                      <Button
                                        size="sm"
                                        onClick={() => handleAcceptBooking(booking.id)}
                                        disabled={actionLoading === booking.id}
                                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-3"
                                      >
                                        {actionLoading === booking.id ? '...' : 'Accept'}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRejectBooking(booking.id)}
                                        disabled={actionLoading === booking.id}
                                        className="border-red-500/50 text-red-500 hover:bg-red-50 text-xs px-3"
                                      >
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  {canChat(booking.status) && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setChatBooking(booking)}
                                      className="text-xs px-3 border-cyan-500/50 text-cyan-600 hover:bg-cyan-50"
                                    >
                                      💬 Chat
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                    })
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                    <p>{verification_status.is_verified ? 'No bookings yet. Start by adding a car!' : 'No bookings available. Complete verification to start receiving bookings.'}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
        </motion.div>
              </div>
      </div>

      {/* Driver Bookings Modal */}
      <DriverBookingsModal
        isOpen={showBookingsModal}
        onClose={() => setShowBookingsModal(false)}
        bookings={bookingsModalData}
        title={bookingsModalTitle}
      />

      {/* Stats Modal for other charts */}
      <StatsModal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null)
          setModalData([])
        }}
        title={modalType || ''}
        data={modalData}
        totalAmount={modalType === 'Total Earnings' ? stats.total_earnings : undefined}
        getItemHref={(item) => `/driver/bookings?bookingId=${item.id}`}
      />

      {/* Add Car Modal */}
      <AnimatePresence>
        {showAddCarModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => !isSubmittingCar && setShowAddCarModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl z-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">List a New Car</h2>
                    <p className="text-gray-600 text-sm mt-1">Fill in the details to add your car</p>
                  </div>
                  <button
                    onClick={() => !isSubmittingCar && setShowAddCarModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-6">
                <CarListingForm
                  onSubmit={handleAddCar}
                  isLoading={isSubmittingCar}
                  onCancel={() => setShowAddCarModal(false)}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Interface */}
      {chatBooking && (
        <ChatInterface
          bookingId={chatBooking.id}
          driverName={user?.full_name || 'Driver'}
          customerName={chatBooking.customer?.name || 'Customer'}
          onClose={() => setChatBooking(null)}
        />
      )}
    </div>
  )
}
