'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { driversApi } from '@/lib/api/drivers.api'
import { carsApi } from '@/lib/api/cars.api'
import { Driver, DriverBooking } from '@/types/api'

export default function DriverDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [bookings, setBookings] = useState<DriverBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingBookings, setIsLoadingBookings] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        setIsLoading(true)
        const profile = await driversApi.getProfile()
        setDriver(profile)
        
        // Fetch bookings only if verified
        if (profile.is_verified) {
          await fetchBookings()
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load driver profile')
        console.error('Error fetching driver profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'driver') {
      fetchDriverProfile()
    }
  }, [user])

  const fetchBookings = async () => {
    try {
      setIsLoadingBookings(true)
      const driverBookings = await carsApi.getDriverBookings()
      setBookings(driverBookings)
    } catch (err: any) {
      console.error('Error fetching bookings:', err)
      // Don't set error state for bookings, just log it
    } finally {
      setIsLoadingBookings(false)
    }
  }

  // Calculate stats from real data
  const completedBookings = bookings.filter(b => b.status === 'COMPLETED')
  const activeBookingsList = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS')
  
  // Calculate total earnings from completed bookings
  const totalEarnings = completedBookings.reduce((sum, b) => sum + b.driver_earnings, 0)
  
  // Calculate this month's earnings
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthEarnings = completedBookings
    .filter(b => {
      const bookingDate = new Date(b.created_at)
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear
    })
    .reduce((sum, b) => sum + b.driver_earnings, 0)

  // Calculate rating only if verified
  const calculatedRating = driver?.is_verified && driver?.ratings?.length
    ? Number((driver.ratings.reduce((sum, r) => sum + Number(r.rating), 0) / driver.ratings.length).toFixed(1))
    : null

  const stats = {
    totalEarnings,
    thisMonth: thisMonthEarnings,
    completedTrips: completedBookings.length,
    activeBookings: activeBookingsList.length,
    totalCars: driver?.cars?.length || 0,
    activeCars: driver?.cars?.filter((car: any) => car.is_active !== false).length || 0,
    rating: calculatedRating,
    isVerified: driver?.is_verified || false,
    verificationStatus: driver?.is_verified ? 'VERIFIED' : 'PENDING',
  }

  // Get recent bookings (last 5)
  const recentBookings = bookings.slice(0, 5)

  // Top performing cars (based on booking count - simplified for now)
  const topPerformingCars = driver?.cars?.slice(0, 3) || []

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
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-blue-100 text-blue-800'
      case 'UPCOMING':
        return 'bg-purple-100 text-purple-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-white">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!driver) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Driver Dashboard
                </h1>
                <p className="text-lg text-gray-300">
                  Welcome back, {user?.full_name || 'Driver'}! Manage your car rentals and earnings.
                </p>
              </div>
              {driver.is_verified ? (
                <div className="bg-green-500/20 border-2 border-green-500 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-white">Verified Driver</p>
                      <p className="text-xs text-gray-300">All documents approved</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-500/20 border-2 border-yellow-500 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <p className="font-semibold text-white">Pending Verification</p>
                      <p className="text-xs text-gray-300">Awaiting admin approval</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Verification Notice Banner */}
            {!driver.is_verified && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4"
              >
                <p className="text-yellow-200 text-sm">
                  <strong>Note:</strong> Your verification is pending admin approval. You can view your dashboard but cannot perform actions (add cars, manage bookings, etc.) until you are verified.
                </p>
              </motion.div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Total Earnings</p>
                      <p className="text-3xl font-bold text-white">
                        PKR {stats.totalEarnings.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">All time</p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">This Month</p>
                      <p className="text-3xl font-bold text-white">
                        PKR {stats.thisMonth.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Current month earnings</p>
                    </div>
                    <div className="text-4xl">📈</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Active Bookings</p>
                      <p className="text-3xl font-bold text-white">{stats.activeBookings}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats.completedTrips} completed</p>
                    </div>
                    <div className="text-4xl">🚗</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Rating</p>
                      {stats.isVerified && stats.rating !== null ? (
                        <>
                          <p className="text-3xl font-bold text-white">{stats.rating} ⭐</p>
                          <p className="text-xs text-gray-400 mt-1">{stats.completedTrips} trips</p>
                        </>
                      ) : (
                        <>
                          <p className="text-xl font-semibold text-yellow-400">Waiting for Approval</p>
                          <p className="text-xs text-gray-400 mt-1">Verification pending</p>
                        </>
                      )}
                    </div>
                    <div className="text-4xl">{stats.isVerified ? '⭐' : '⏳'}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {driver.is_verified ? (
                <Link href="/driver/cars/new">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">➕</div>
                      <h3 className="font-semibold text-white text-lg">Add New Car</h3>
                      <p className="text-sm text-gray-300">List a new vehicle</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30" title="Please verify your account to add cars">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">➕</div>
                    <h3 className="font-semibold text-white text-lg">Add New Car</h3>
                    <p className="text-sm text-gray-300">Verify to enable</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              {driver.is_verified ? (
                <Link href="/driver/cars">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">🚗</div>
                      <h3 className="font-semibold text-white text-lg">My Cars</h3>
                      <p className="text-sm text-gray-300">{stats.activeCars} of {stats.totalCars} active</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-white/10 backdrop-blur-md border-white/20" title="Please verify your account to manage cars">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">🚗</div>
                    <h3 className="font-semibold text-white text-lg">My Cars</h3>
                    <p className="text-sm text-gray-300">Verify to enable</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              {driver.is_verified ? (
                <Link href="/driver/bookings">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">📋</div>
                      <h3 className="font-semibold text-white text-lg">Bookings</h3>
                      <p className="text-sm text-gray-300">View all bookings</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-white/10 backdrop-blur-md border-white/20" title="Please verify your account to view bookings">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">📋</div>
                    <h3 className="font-semibold text-white text-lg">Bookings</h3>
                    <p className="text-sm text-gray-300">Verify to enable</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              {driver.is_verified ? (
                <Link href="/driver/payouts">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">💳</div>
                      <h3 className="font-semibold text-white text-lg">Payouts</h3>
                      <p className="text-sm text-gray-300">Track earnings</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-white/10 backdrop-blur-md border-white/20" title="Please verify your account to view payouts">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">💳</div>
                    <h3 className="font-semibold text-white text-lg">Payouts</h3>
                    <p className="text-sm text-gray-300">Verify to enable</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Bookings</CardTitle>
                    {driver.is_verified && (
                      <Link href="/driver/bookings">
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingBookings ? (
                    <div className="p-8 text-center text-gray-500">
                      <p>Loading bookings...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recentBookings.length > 0 ? (
                        recentBookings.map((booking) => (
                          <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <div className="font-semibold text-gray-900">
                                  {booking.car.make} {booking.car.model} {booking.car.year}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {booking.customer.name} • {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {booking.pickup_location} → {booking.dropoff_location}
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
                          <p>{driver.is_verified ? 'No bookings yet. Start by adding a car!' : 'No bookings available. Complete verification to start receiving bookings.'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Cars */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Top Performing Cars</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {driver.cars && driver.cars.length > 0 ? (
                      <>
                        {driver.cars.slice(0, 3).map((car: any, index: number) => (
                          <div key={car.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {car.carModel?.make} {car.carModel?.model} {car.year}
                                </h4>
                                <div className="flex items-center space-x-2 text-sm text-gray-600">
                                  <span>🚗 {car.license_plate || 'N/A'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        {driver.is_verified ? (
                          <Link href="/driver/cars">
                            <Button variant="outline" className="w-full">
                              View All Cars
                            </Button>
                          </Link>
                        ) : (
                          <Button variant="outline" className="w-full" disabled>
                            Verify to View Cars
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No cars listed yet.</p>
                        {driver.is_verified ? (
                          <Link href="/driver/cars/new">
                            <Button className="mt-4">Add Your First Car</Button>
                          </Link>
                        ) : (
                          <p className="text-sm mt-2 text-gray-400">Complete verification to add cars</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
