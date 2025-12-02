'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CircularStatsCard } from '@/components/driver/CircularStatsCard'
import { SuspensionStatusCard } from '@/components/driver/SuspensionStatusCard'
import { DisputeWarningBadge } from '@/components/shared/DisputeWarningBadge'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { driversApi } from '@/lib/api/drivers.api'
import type { DriverDashboard, DriverSuspensionStatus } from '@/lib/api/drivers.api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCar, faClipboardList, faCreditCard } from '@fortawesome/free-solid-svg-icons'

export default function DriverDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<DriverDashboard | null>(null)
  const [suspensionStatus, setSuspensionStatus] = useState<DriverSuspensionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="bg-red-50 border-red-500">
          <CardContent className="p-6">
            <p className="text-red-900">{error}</p>
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
    <div className="min-h-screen bg-white">
      <DashboardHeader 
        title={`Welcome back, ${user?.full_name || 'Driver'}!`}
        subtitle="Manage your car rentals and earnings"
      />
      <div className="container mx-auto px-4 py-8">
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

          {/* Stats Cards - Circular Gauge Style */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <CircularStatsCard
              label="Total Earnings"
              value={`PKR ${stats.total_earnings.toLocaleString()}`}
              subtitle="All time"
              delay={0.1}
              maxValue={Math.max(stats.total_earnings, 100000)}
            />
            <CircularStatsCard
              label="Incoming Requests"
              value={stats.incoming_requests}
              subtitle="Awaiting your response"
              delay={0.2}
              maxValue={Math.max(stats.incoming_requests, 10)}
            />
            <CircularStatsCard
              label="Confirmed Bookings"
              value={stats.confirmed_bookings}
              subtitle="Active bookings"
              delay={0.3}
              maxValue={Math.max(stats.confirmed_bookings, 10)}
            />
            <CircularStatsCard
              label="Car Listings"
              value={stats.car_listings_count}
              subtitle={`${stats.active_cars_count} active`}
              delay={0.4}
              maxValue={Math.max(stats.car_listings_count, 10)}
            />
          </div>

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
                    <Link href="/driver/cars/new">
                      <div 
                        className="relative w-full max-w-[200px] mx-auto aspect-square rounded-2xl overflow-hidden backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group flex flex-col items-center justify-center"
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
                        
                        {/* Inner Glow on Hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
                        
                        {/* Floating Plus Icon */}
                        <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className="text-center relative z-10"
                        >
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 shadow-lg group-hover:shadow-cyan-500/50 transition-all">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </div>
                          <p className="text-white font-semibold text-sm mb-0.5">Add New Car</p>
                          <p className="text-cyan-200 text-xs px-2">List a new vehicle</p>
                        </motion.div>
                      </div>
                    </Link>
                  ) : (
                    <div 
                      className="relative w-full max-w-[200px] mx-auto aspect-square rounded-2xl overflow-hidden opacity-50 cursor-not-allowed backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-50 shadow-2xl transition-all duration-300 flex flex-col items-center justify-center"
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
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold text-sm mb-0.5">Add New Car</p>
                      <p className="text-cyan-200 text-xs px-2">Verify to enable</p>
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
                          <p className="text-xs font-semibold text-gray-900">{stats.active_cars_count} of {stats.car_listings_count} active</p>
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
                          <p className="text-xs font-semibold text-gray-900">View all bookings</p>
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
                          <p className="text-xs font-semibold text-gray-900">Track earnings</p>
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
                  recent_bookings.map((booking) => (
                          <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">
                            {booking.car.make} {booking.car.model}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {booking.customer.name} • {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                                {booking.status}
                              </span>
                            </div>
                            <div className="mt-3">
                              <p className="text-gray-600 text-sm">Your Earning</p>
                              <p className="font-bold text-green-600 text-lg">PKR {booking.driver_earnings.toLocaleString()}</p>
                            </div>
                          </div>
                        ))
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
  )
}
