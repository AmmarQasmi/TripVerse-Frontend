'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { DashboardHeader } from '@/components/client/DashboardHeader'
import { OverviewStatsCard } from '@/components/client/OverviewStatsCard'
import { TripCard, NewTripCard } from '@/components/client/TripCard'
import { QuickToolCard } from '@/components/client/QuickToolCard'
import { BookingListItem } from '@/components/client/BookingListItem'
import { WeatherWidget } from '@/components/client/WeatherWidget'
import { SupportCard } from '@/components/client/SupportCard'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useUserHotelBookings } from '@/features/bookings/useHotelBooking'
import { useUserCarBookings } from '@/features/bookings/useCarBooking'

export default function ClientDashboard() {
  const { user } = useAuth()
  const { data: hotelBookings, isLoading: hotelLoading } = useUserHotelBookings()
  const { data: carBookings, isLoading: carLoading } = useUserCarBookings()

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
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* SECTION 2: Overview Cards - Quick Stats */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Your Travel Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <OverviewStatsCard
              icon="✈️"
              label="Total Trips"
              value={totalBookings}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0}
            />
            <OverviewStatsCard
              icon="🏨"
              label="Hotel Bookings"
              value={hotelBookings?.length || 0}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0.1}
            />
            <OverviewStatsCard
              icon="☁️"
              label="Saved Destinations"
              value={savedDestinations}
              gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
              delay={0.2}
            />
            <OverviewStatsCard
              icon="💳"
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <span className="mr-3">🗺️</span>
              Active Trips
            </h2>
            <Link href="/client/bookings">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                View All
              </Button>
            </Link>
          </div>

          {activeTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {activeTrips.map((trip: any, index: number) => (
                <TripCard
                  key={trip.id}
                  id={trip.id}
                  destination={trip.hotel?.name || `${trip.car?.brand} ${trip.car?.model}`}
                  imageUrl={trip.hotel?.images?.[0] || trip.car?.images?.[0] || ''}
                  startDate={trip.checkInDate || trip.startDate}
                  endDate={trip.checkOutDate || trip.endDate}
                  type={trip.hotel ? 'hotel' : 'car'}
                  status={trip.status === 'confirmed' ? 'upcoming' : 'active'}
                />
              ))}
              <NewTripCard />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <NewTripCard />
              <div className="rounded-2xl border-2 border-dashed border-gray-300 h-80 flex items-center justify-center bg-white shadow-sm">
                <div className="text-center p-6">
                  <p className="text-gray-500 mb-4">No active trips yet</p>
                  <Link href="/client/hotels">
                    <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700">
                      Browse Hotels
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </motion.section>

        {/* SECTION 4: Quick Tools & Smart Insights */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">🧭</span>
            Quick Tools & Insights
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

        {/* SECTION 5 & 6: Bookings and Weather - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* SECTION 5: Upcoming / Recent Bookings */}
          <div className="lg:col-span-2 space-y-8">
            {/* Upcoming Bookings */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📅</span>
                  Upcoming Bookings
                </h3>
                <Link href="/client/bookings" className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                  View All →
                </Link>
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
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 mb-4">📋 No upcoming bookings</p>
                    <Link href="/client/hotels">
                      <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700">
                        Book Your Next Trip
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.section>

            {/* Recent Bookings */}
            <motion.section
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <span className="mr-2">📖</span>
                  Recent History
                </h3>
                <Link href="/client/bookings" className="text-blue-600 text-sm hover:text-blue-700 font-medium">
                  View All →
                </Link>
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
                  <div className="text-center py-8 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <p className="text-gray-500 text-sm">No recent bookings</p>
                  </div>
                )}
              </div>
            </motion.section>
          </div>

          {/* SECTION 6: Weather Widget */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8 }}
          >
            <WeatherWidget
              location={(user as any)?.region || 'Your Location'}
              temperature={24}
              condition="Sunny"
            />
          </motion.div>
        </div>

        {/* SECTION 7: Feedback & Support */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <span className="mr-3">💬</span>
            Support & Feedback
          </h2>
          <SupportCard />
        </motion.section>
      </div>
    </div>
  )
}
