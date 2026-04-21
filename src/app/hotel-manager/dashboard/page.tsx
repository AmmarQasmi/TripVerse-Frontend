'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { StatsModal } from '@/components/client/StatsModal'
import { PageLoader } from '@/components/shared/PageLoader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { hotelManagersApi } from '@/lib/api/hotel-managers.api'
import type { HotelManagerDashboard } from '@/lib/api/hotel-managers.api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faClipboardList, faCreditCard } from '@fortawesome/free-solid-svg-icons'

export default function HotelManagerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<HotelManagerDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalType, setModalType] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any[]>([])

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const dashboardData = await hotelManagersApi.getDashboard()
        setDashboard(dashboardData)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard')
        console.error('Error fetching hotel manager dashboard:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'hotel_manager') {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
      case 'CHECKED_IN':
      case 'CHECKED_OUT':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." variant="skeleton" />
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
                  // Prepare earnings data from recent bookings
                  const earningsData = (dashboard.recent_bookings || [])
                    .filter((b: any) => b.total_amount > 0)
                    .map((b: any) => ({
                      id: b.id,
                      type: 'hotel' as const,
                      name: b.hotel?.name || 'Hotel Booking',
                      date: b.created_at || new Date().toISOString(),
                      status: b.status,
                      amount: b.total_amount || 0,
                      checkInDate: b.dates?.check_in,
                      checkOutDate: b.dates?.check_out,
                    }))
                  setModalData(earningsData)
                  setModalType('Total Earnings')
                }}
              />
              <DoughnutChart
                label="Total Hotels"
                value={stats.total_hotels}
                gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                delay={0.2}
                subtitle={`${stats.active_hotels} active`}
                onClick={() => {
                  router.push('/hotel-manager/hotels')
                }}
              />
              <DoughnutChart
                label="Total Bookings"
                value={stats.total_bookings}
                gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                delay={0.3}
                subtitle={`${stats.confirmed_bookings} confirmed`}
                onClick={() => {
                  if (!dashboard) return
                  // Prepare bookings data
                  const bookingsData = (dashboard.recent_bookings || []).map((b: any) => ({
                    id: b.id,
                    type: 'hotel' as const,
                    name: b.hotel?.name || 'Hotel Booking',
                    date: b.created_at || new Date().toISOString(),
                    status: b.status,
                    amount: b.total_amount || 0,
                    checkInDate: b.dates?.check_in,
                    checkOutDate: b.dates?.check_out,
                  }))
                  setModalData(bookingsData)
                  setModalType('Total Bookings')
                }}
              />
              <DoughnutChart
                label="Rooms Available"
                value={stats.rooms_available}
                gradient="bg-gradient-to-br from-orange-500 to-red-500"
                delay={0.4}
                subtitle={`${stats.rooms_booked} booked`}
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
              {/* Add New Hotel Card - Gradient Card */}
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
                    <Link href="/hotel-manager/hotels/new">
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
                        
                        {/* Static label block (no text movement) */}
                        <div className="text-center relative z-10">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-blue-500/50 transition-all">
                            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-white font-semibold text-sm mb-0.5">Add New Hotel</p>
                          <p className="text-cyan-300 text-xs px-2">List a new hotel</p>
                        </div>
                      </div>
                    </Link>
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
                      title="Please verify your account to add hotels"
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
                      <p className="relative z-10 text-white font-semibold text-sm mb-0.5">Add New Hotel</p>
                      <p className="relative z-10 text-cyan-300 text-xs px-2">Verify to enable</p>
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Three Circular Icon Buttons */}
              <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* My Hotels Button */}
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
                    <Link href="/hotel-manager/hotels">
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
                            icon={faBuilding} 
                            className="w-12 h-12 md:w-16 md:h-16 mb-2"
                            style={{ color: '#0891b2' }}
                          />
                          <p className="text-xs font-semibold text-gray-600">{stats.active_hotels} of {stats.total_hotels} active</p>
                        </div>
                      </div>
                    </Link>
                  ) : (
                    <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-gray-200 shadow-2xl flex items-center justify-center overflow-hidden opacity-50 cursor-not-allowed"
                      title="Please verify your account to manage hotels"
                    >
                      <FontAwesomeIcon 
                        icon={faBuilding} 
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
                    <Link href="/hotel-manager/bookings">
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
                    <Link href="/hotel-manager/earnings">
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
                  <Link href="/hotel-manager/bookings">
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
                  recent_bookings.map((booking) => (
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
                              {booking.hotel.name}
                            </div>
                            <div className="text-xs text-white/90 mt-0.5 truncate">
                              {booking.customer.name} • {booking.room_type} • {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                      </div>

                      <div className="p-4">
                        <p className="text-gray-600 text-sm">Total Amount</p>
                        <p className="font-bold text-cyan-700 text-xl">PKR {booking.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-600">
                    <p>{verification_status.is_verified ? 'No bookings yet. Start by adding a hotel!' : 'No bookings available. Complete verification to start receiving bookings.'}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        </div>
      </div>

      {/* Stats Modal */}
      <StatsModal
        isOpen={modalType !== null}
        onClose={() => {
          setModalType(null)
          setModalData([])
        }}
        title={modalType || ''}
        data={modalData}
        totalAmount={modalType === 'Total Earnings' ? stats.total_earnings : undefined}
      />
    </div>
  )
}

