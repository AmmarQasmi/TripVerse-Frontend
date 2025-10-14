'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useAuth } from '@/features/auth/useAuth'

export default function DriverDashboard() {
  const { user } = useAuth()

  // Mock data - replace with actual API calls
  const stats = {
    totalEarnings: 285000,
    thisMonth: 45000,
    completedTrips: 67,
    activeBookings: 5,
    totalCars: 3,
    activeCars: 2,
    rating: 4.8,
    verificationStatus: 'VERIFIED',
  }

  const recentBookings = [
    {
      id: '1',
      car: 'Toyota Camry 2022',
      customer: 'John Doe',
      startDate: '2024-01-15',
      endDate: '2024-01-17',
      amount: 15000,
      platformFee: 750,
      netAmount: 14250,
      status: 'CONFIRMED',
    },
    {
      id: '2',
      car: 'Honda Civic 2021',
      customer: 'Jane Smith',
      startDate: '2024-01-12',
      endDate: '2024-01-14',
      amount: 9000,
      platformFee: 450,
      netAmount: 8550,
      status: 'COMPLETED',
    },
    {
      id: '3',
      car: 'Toyota Fortuner 2023',
      customer: 'Mike Johnson',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      amount: 40000,
      platformFee: 2000,
      netAmount: 38000,
      status: 'UPCOMING',
    },
  ]

  const topPerformingCars = [
    {
      id: '1',
      name: 'Toyota Camry 2022',
      bookings: 23,
      earnings: 115000,
      rating: 4.9,
    },
    {
      id: '2',
      name: 'Honda Civic 2021',
      bookings: 18,
      earnings: 81000,
      rating: 4.7,
    },
  ]

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
              {stats.verificationStatus === 'VERIFIED' && (
                <div className="bg-green-500/20 border-2 border-green-500 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-white">Verified Driver</p>
                      <p className="text-xs text-gray-300">All documents approved</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
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
                      <p className="text-xs text-green-400 mt-1">+15% from last month</p>
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
                      <p className="text-3xl font-bold text-white">{stats.rating} ⭐</p>
                      <p className="text-xs text-gray-400 mt-1">{stats.completedTrips} trips</p>
                    </div>
                    <div className="text-4xl">⭐</div>
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
              <Link href="/driver/cars/new">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">➕</div>
                    <h3 className="font-semibold text-white text-lg">Add New Car</h3>
                    <p className="text-sm text-gray-300">List a new vehicle</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/driver/cars">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">🚗</div>
                    <h3 className="font-semibold text-white text-lg">My Cars</h3>
                    <p className="text-sm text-gray-300">{stats.activeCars} of {stats.totalCars} active</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link href="/driver/bookings">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">📋</div>
                    <h3 className="font-semibold text-white text-lg">Bookings</h3>
                    <p className="text-sm text-gray-300">View all bookings</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link href="/driver/payouts">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">💳</div>
                    <h3 className="font-semibold text-white text-lg">Payouts</h3>
                    <p className="text-sm text-gray-300">Track earnings</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Bookings */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Recent Bookings</CardTitle>
                    <Link href="/driver/bookings">
                      <Button variant="outline" size="sm">
                        View All
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{booking.car}</div>
                            <div className="text-sm text-gray-600">
                              {booking.customer} • {formatDate(booking.startDate)} - {formatDate(booking.endDate)}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-sm mt-3">
                          <div>
                            <p className="text-gray-600">Gross</p>
                            <p className="font-semibold">PKR {booking.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fee (5%)</p>
                            <p className="text-red-600 font-semibold">- PKR {booking.platformFee.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Your Earning</p>
                            <p className="font-bold text-green-600">PKR {booking.netAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                    {topPerformingCars.map((car, index) => (
                      <div key={car.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{car.name}</h4>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <span>⭐ {car.rating}</span>
                              <span>•</span>
                              <span>{car.bookings} bookings</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            PKR {car.earnings.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Total earned</p>
                        </div>
                      </div>
                    ))}
                    <Link href="/driver/cars">
                      <Button variant="outline" className="w-full">
                        View All Cars
                      </Button>
                    </Link>
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
