'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane, faCar } from '@fortawesome/free-solid-svg-icons'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { TripCard, NewTripCard } from '@/components/client/TripCard'
import { QuickToolCard } from '@/components/client/QuickToolCard'
import { BookingListItem } from '@/components/client/BookingListItem'
import { SupportCard } from '@/components/client/SupportCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'
import { useUserCarBookings } from '@/features/bookings/useCarBooking'

export default function ClientDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  
  // Redirect hotel managers to their dashboard
  useEffect(() => {
    if (user && user.role === 'hotel_manager') {
      router.push('/hotel-manager/dashboard')
    }
  }, [user, router])
  
  // Only fetch bookings if user is a client
  const isClient = user?.role === 'client'
  const { data: hotelBookings, isLoading: hotelLoading } = useUserHotelBookings()
  const { data: carBookings, isLoading: carLoading } = useUserCarBookings()
  
  // Don't render if user is not a client (will redirect)
  if (user && user.role !== 'client') {
    return null
  }

  // Combine and calculate stats
  const allBookings = [...(hotelBookings || []), ...(carBookings || [])]
  const totalBookings = allBookings.length
  const completedTrips = allBookings.filter((b: any) => b.status === 'completed').length
  const totalSpent = allBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0)
  const savedDestinations = 3 // Mock data for weather

  // Get active/upcoming trips
  const activeTrips = allBookings
    .filter((b: any) => b.status === 'confirmed' || b.status === 'in_progress')
    .slice(0, 3)

  // Get upcoming bookings
  const upcomingBookings = allBookings
    .filter((b: any) => b.status === 'confirmed')
    .slice(0, 3)

  // Get recent bookings
  const recentBookings = allBookings
    .filter((b: any) => b.status === 'completed')
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Official Website Header */}
      <LandingHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 pt-24">
        {/* SECTION 2: Overview Cards - Quick Stats */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
            <span className="animated-gradient-text">
              Travel Overview
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <DoughnutChart
              label="Total Trips"
              value={totalBookings}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0}
            />
            <DoughnutChart
              label="Hotel Bookings"
              value={hotelBookings?.length || 0}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0.1}
            />
            <DoughnutChart
              label="Saved Destinations"
              value={savedDestinations}
              gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
              delay={0.2}
            />
            <DoughnutChart
              label="Total Spent"
              value={totalSpent}
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              delay={0.3}
            />
          </div>
        </motion.section>

        {/* SECTION 3: Active Trips - Main Highlight */}
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
              Active Trips
              </motion.span>
            </h2>
            <div className="flex justify-center">
            <Link href="/client/bookings">
                <Button className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90">
                View All
              </Button>
            </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Plan New Trip Card - Left */}
            <div className="lg:col-span-1">
              <NewTripCard />
            </div>

            {/* Three Round Buttons - Right */}
            <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Flight Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group"
              >
                <Link href="/client/flights">
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
                    
                    {/* Icon - Airplane */}
                    <div className="relative z-10 flex items-center justify-center">
                      <FontAwesomeIcon 
                        icon={faPlane} 
                        className="w-16 h-16 md:w-20 md:h-20"
                        style={{
                          color: '#0891b2',
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>

              {/* Hotel Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group"
              >
                  <Link href="/client/hotels">
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
                    <div className="relative z-10">
                      <svg className="w-16 h-16 md:w-20 md:h-20 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                </div>
              </div>
                </Link>
              </motion.div>

              {/* Car Rental Button */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                whileHover={{ 
                  scale: 1.1,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                className="group"
              >
                <Link href="/client/cars">
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
                    
                    {/* Icon - Car */}
                    <div className="relative z-10 flex items-center justify-center">
                      <FontAwesomeIcon 
                        icon={faCar} 
                        className="w-16 h-16 md:w-20 md:h-20"
                        style={{
                          color: '#0891b2',
                        }}
                      />
                    </div>
                  </div>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* SECTION 4: Quick Tools & Smart Insights */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center leading-tight overflow-visible">
            <motion.span
              className="animated-gradient-text inline-block"
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.2',
                paddingBottom: '0.1em',
              }}
            >
            Quick Tools & Insights
            </motion.span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <QuickToolCard
              icon="🧠"
              title="Monument Recognition"
              description="Upload photo → Identify historical places instantly"
              href="/client/monuments"
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0}
            />
            <QuickToolCard
              icon="🌍"
              title="Route Safety"
              description="Check your route's safety index before you travel"
              href="/client/safety"
              gradient="bg-gradient-to-br from-orange-500 to-red-500"
              delay={0.1}
            />
            <QuickToolCard
              icon="☁️"
              title="Weather Forecast"
              description="Get current or future weather for any destination"
              href="/client/weather"
              gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
              delay={0.2}
            />
            <QuickToolCard
              icon="💳"
              title="Payments & Wallet"
              description="View or manage your payments and transactions"
              href="/client/payments"
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              delay={0.3}
            />
          </div>
        </motion.section>

          {/* SECTION 5: Upcoming / Recent Bookings */}
        <div className="space-y-8 mb-12">
            {/* Upcoming Bookings */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="mb-4">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center leading-tight overflow-visible">
                  <motion.span
                    className="animated-gradient-text inline-block"
                    initial={{ backgroundPosition: '0% 50%' }}
                    animate={{ backgroundPosition: '100% 50%' }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: '1.2',
                      paddingBottom: '0.1em',
                    }}
                  >
                  Upcoming Bookings
                  </motion.span>
                </h3>
                <div className="flex justify-center">
                <Link href="/client/bookings" className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                  View All →
                </Link>
                </div>
              </div>
              <div className="space-y-3">
                {upcomingBookings.length > 0 ? (
                  upcomingBookings.map((booking: any, index: number) => (
                    <BookingListItem
                      key={booking.id}
                      id={booking.id}
                      type={booking.hotel ? 'hotel' : 'car'}
                      name={booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`}
                      date={booking.checkInDate || booking.startDate}
                      status={booking.status}
                      amount={booking.totalAmount}
                      delay={index * 0.05}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    className="relative group"
                  >
                    <div 
                      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 text-center py-12 p-8"
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
                      {/* Animated Neon Border - TripVerse Theme */}
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
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <p className="text-white mb-4 text-lg">📋 No upcoming bookings</p>
                    <Link href="/client/hotels">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700">
                        Book Your Next Trip
                      </Button>
                    </Link>
                  </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.section>

            {/* Recent Bookings */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="mb-4">
                <h3 className="text-3xl md:text-4xl font-bold mb-4 text-center leading-tight overflow-visible">
                  <motion.span
                    className="animated-gradient-text inline-block"
                    initial={{ backgroundPosition: '0% 50%' }}
                    animate={{ backgroundPosition: '100% 50%' }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    style={{
                      background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: '1.2',
                      paddingBottom: '0.1em',
                    }}
                  >
                  Recent History
                  </motion.span>
                </h3>
                <div className="flex justify-center">
                <Link href="/client/bookings" className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                  View All →
                </Link>
                </div>
              </div>
              <div className="space-y-3">
                {recentBookings.length > 0 ? (
                  recentBookings.map((booking: any, index: number) => (
                    <BookingListItem
                      key={booking.id}
                      id={booking.id}
                      type={booking.hotel ? 'hotel' : 'car'}
                      name={booking.hotel?.name || `${booking.car?.brand} ${booking.car?.model}`}
                      date={booking.checkOutDate || booking.endDate}
                      status={booking.status}
                      amount={booking.totalAmount}
                      delay={index * 0.05}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.05,
                      transition: { type: "spring", stiffness: 300, damping: 20 }
                    }}
                    className="relative group"
                  >
                    <div 
                      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 opacity-95 shadow-2xl hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 text-center py-8 p-8"
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
                      {/* Animated Neon Border - TripVerse Theme */}
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
                      
                      {/* Content */}
                      <div className="relative z-10">
                        <p className="text-white text-sm">No recent bookings</p>
                      </div>
                  </div>
                  </motion.div>
                )}
              </div>
            </motion.section>
        </div>

        {/* SECTION 7: Feedback & Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center leading-tight overflow-visible">
            <motion.span
              className="animated-gradient-text inline-block"
              initial={{ backgroundPosition: '0% 50%' }}
              animate={{ backgroundPosition: '100% 50%' }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.2',
                paddingBottom: '0.1em',
              }}
            >
            Support & Feedback
            </motion.span>
          </h2>
          <SupportCard />
        </motion.section>
      </div>
    </div>
  )
}
