'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane, faCar } from '@fortawesome/free-solid-svg-icons'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { StatsModal } from '@/components/client/StatsModal'
import { TripCard, NewTripCard } from '@/components/client/TripCard'
import { SupportCard } from '@/components/client/SupportCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'
import { useUserBookings as useUserCarBookings } from '@/features/cars/useCarSearch'

export default function ClientDashboard() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [modalType, setModalType] = useState<string | null>(null)
  
  // Add redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?redirect=/client/dashboard')
    }
  }, [user, isLoading, router])
  
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
  const completedTrips = allBookings.filter((b: any) => b.status === 'completed' || b.status === 'COMPLETED').length
  
  // Total Spent: Only count confirmed expenditures (exclude cancelled, rejected, pending)
  const confirmedStatuses = ['CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED', 'confirmed', 'checked_in', 'in_progress', 'completed']
  const totalSpent = allBookings
    .filter((b: any) => confirmedStatuses.includes(b.status))
    .reduce((sum: number, b: any) => sum + (b.totalAmount || b.total_amount || 0), 0)
  const flightBookings = 0 // TODO: Add flight bookings when flight feature is implemented

  const isOverviewLoading = isClient && (hotelLoading || carLoading)


  // Prepare data for modals
  const prepareModalData = (type: string): Array<{
    id: number
    type: 'hotel' | 'car' | 'flight'
    name: string
    date: string
    status: string
    amount: number
    checkInDate?: string
    checkOutDate?: string
    startDate?: string
    endDate?: string
  }> => {
    switch (type) {
      case 'Total Trips':
        return allBookings.map((b: any) => ({
          id: b.id,
          type: (b.hotel ? 'hotel' : 'car') as 'hotel' | 'car',
          name: b.hotel?.name || `${b.car?.make || ''} ${b.car?.model || ''}`.trim() || 'Car Booking',
          date: b.created_at || new Date().toISOString(),
          status: b.status,
          amount: b.total_amount || 0,
          checkInDate: b.dates?.check_in || b.start_date,
          checkOutDate: b.dates?.check_out || b.end_date,
          startDate: b.start_date,
          endDate: b.end_date,
        }))
      case 'Hotel Bookings':
        return (hotelBookings || []).map((b: any) => ({
          id: b.id,
          type: 'hotel' as const,
          name: b.hotel?.name || 'Hotel Booking',
          date: b.created_at || new Date().toISOString(),
          status: b.status,
          amount: b.total_amount || 0,
          checkInDate: b.dates?.check_in,
          checkOutDate: b.dates?.check_out,
        }))
      case 'Flight Booking':
        return [] // TODO: Add flight bookings when implemented
      case 'Car Booking':
        return (carBookings || []).map((b: any) => ({
          id: b.id,
          type: 'car' as const,
          name: `${b.car?.make || ''} ${b.car?.model || ''}`.trim() || 'Car Booking',
          date: b.created_at || new Date().toISOString(),
          status: b.status,
          amount: b.total_amount || 0,
          startDate: b.start_date,
          endDate: b.end_date,
        }))
      case 'Total Spent':
        // Only show confirmed expenditures in Total Spent modal
        return allBookings
          .filter((b: any) => confirmedStatuses.includes(b.status))
          .map((b: any) => ({
            id: b.id,
            type: (b.hotel ? 'hotel' : 'car') as 'hotel' | 'car',
            name: b.hotel?.name || `${b.car?.make || ''} ${b.car?.model || ''}`.trim() || 'Booking',
            date: b.created_at || new Date().toISOString(),
            status: b.status,
            amount: b.total_amount || 0,
            checkInDate: b.dates?.check_in || b.start_date,
            checkOutDate: b.dates?.check_out || b.end_date,
            startDate: b.start_date,
            endDate: b.end_date,
          }))
      default:
        return []
    }
  }

  const handleChartClick = (type: string) => {
    setModalType(type)
  }

  const closeModal = () => {
    setModalType(null)
  }

  const modalData = modalType ? prepareModalData(modalType) : []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {isOverviewLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="relative w-full max-w-[200px] mx-auto aspect-square rounded-full bg-gray-200/60 dark:bg-gray-800/60 animate-pulse" />
                  <div className="h-4 w-24 rounded-full bg-gray-200/60 dark:bg-gray-800/60 animate-pulse" />
                </div>
              ))
            ) : (
              <>
                <DoughnutChart
                  label="Total Trips"
                  value={totalBookings}
                  gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
                  delay={0}
                  onClick={() => handleChartClick('Total Trips')}
                />
                <DoughnutChart
                  label="Hotel Bookings"
                  value={hotelBookings?.length || 0}
                  gradient="bg-gradient-to-br from-purple-500 to-pink-500"
                  delay={0.1}
                  onClick={() => handleChartClick('Hotel Bookings')}
                />
                <DoughnutChart
                  label="Flight Booking"
                  value={flightBookings}
                  gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
                  delay={0.2}
                  onClick={() => handleChartClick('Flight Booking')}
                />
                <DoughnutChart
                  label="Car Booking"
                  value={carBookings?.length || 0}
                  gradient="bg-gradient-to-br from-orange-500 to-red-500"
                  delay={0.3}
                  onClick={() => handleChartClick('Car Booking')}
                />
                <DoughnutChart
                  label="Total Spent"
                  value={totalSpent}
                  gradient="bg-gradient-to-br from-green-500 to-emerald-500"
                  delay={0.4}
                  onClick={() => handleChartClick('Total Spent')}
                />
              </>
            )}
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
              Plan Trips
              </motion.span>
            </h2>
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

      {/* Stats Modal */}
      {modalType && (
        <StatsModal
          isOpen={!!modalType}
          onClose={closeModal}
          title={modalType}
          data={modalData}
          totalAmount={modalType === 'Total Spent' ? totalSpent : undefined}
        />
      )}
    </div>
  )
}
