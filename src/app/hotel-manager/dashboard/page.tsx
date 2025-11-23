'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/shared/StatsCard'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/useAuth'
import { hotelManagersApi } from '@/lib/api/hotel-managers.api'
import type { HotelManagerDashboard } from '@/lib/api/hotel-managers.api'

export default function HotelManagerDashboard() {
  const { user } = useAuth()
  const router = useRouter()
  const [dashboard, setDashboard] = useState<HotelManagerDashboard | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DashboardHeader 
        title={`Welcome back, ${user?.full_name || 'Hotel Manager'}!`}
        subtitle="Manage your hotels and bookings"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Verification Status Badge */}
          <div className="mb-8">
            <div className="flex justify-end mb-4">
              {verification_status.is_verified ? (
                <div className="bg-green-500/20 border-2 border-green-500 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">✅</span>
                    <div>
                      <p className="font-semibold text-white">Verified Hotel Manager</p>
                      <p className="text-xs text-gray-300">All documents approved</p>
                    </div>
                  </div>
                </div>
              ) : verification_status.has_rejected_documents ? (
                <div className="bg-red-500/20 border-2 border-red-500 rounded-xl px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">❌</span>
                    <div>
                      <p className="font-semibold text-white">Verification Rejected</p>
                      <p className="text-xs text-gray-300">Please review and re-upload documents</p>
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
            {!verification_status.is_verified && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mb-6 rounded-lg p-4 ${
                  verification_status.has_rejected_documents
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <p className={`text-sm ${
                  verification_status.has_rejected_documents ? 'text-red-200' : 'text-yellow-200'
                }`}>
                  <strong>Note:</strong> {
                    verification_status.has_rejected_documents
                      ? 'Your verification has been rejected. Please review the rejection reasons and re-upload your documents.'
                      : 'Your verification is pending admin approval. You can view your dashboard but cannot create hotels or manage bookings until you are verified.'
                  }
                </p>
                <Link href="/hotel-manager/verification">
                  <Button variant="outline" className="mt-3">
                    {verification_status.has_rejected_documents ? 'Review Rejected Documents' : 'Complete Verification'}
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Earnings"
              value={`PKR ${stats.total_earnings.toLocaleString()}`}
              subtitle="All time"
              icon="💰"
              delay={0.1}
            />
            <StatsCard
              title="Total Hotels"
              value={stats.total_hotels}
              subtitle={`${stats.active_hotels} active`}
              icon="🏨"
              delay={0.2}
            />
            <StatsCard
              title="Total Bookings"
              value={stats.total_bookings}
              subtitle={`${stats.confirmed_bookings} confirmed`}
              icon="📋"
              delay={0.3}
            />
            <StatsCard
              title="Rooms Available"
              value={stats.rooms_available}
              subtitle={`${stats.rooms_booked} booked`}
              icon="🛏️"
              delay={0.4}
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {verification_status.is_verified ? (
                <Link href="/hotel-manager/hotels/new">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">➕</div>
                      <h3 className="font-semibold text-white text-lg">Add New Hotel</h3>
                      <p className="text-sm text-gray-300">List a new hotel</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-blue-500/30" title="Please verify your account to add hotels">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">➕</div>
                    <h3 className="font-semibold text-white text-lg">Add New Hotel</h3>
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
              {verification_status.is_verified ? (
                <Link href="/hotel-manager/hotels">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">🏨</div>
                      <h3 className="font-semibold text-white text-lg">My Hotels</h3>
                      <p className="text-sm text-gray-300">{stats.active_hotels} of {stats.total_hotels} active</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-white/10 backdrop-blur-md border-white/20" title="Please verify your account to manage hotels">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">🏨</div>
                    <h3 className="font-semibold text-white text-lg">My Hotels</h3>
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
              {verification_status.is_verified ? (
                <Link href="/hotel-manager/bookings">
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
              {verification_status.is_verified ? (
                <Link href="/hotel-manager/earnings">
                  <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20">
                    <CardContent className="p-6 text-center">
                      <div className="text-5xl mb-3">💳</div>
                      <h3 className="font-semibold text-white text-lg">Earnings</h3>
                      <p className="text-sm text-gray-300">Track earnings</p>
                    </CardContent>
                  </Card>
                </Link>
              ) : (
                <Card className="opacity-50 cursor-not-allowed bg-white/10 backdrop-blur-md border-white/20" title="Please verify your account to view earnings">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">💳</div>
                    <h3 className="font-semibold text-white text-lg">Earnings</h3>
                    <p className="text-sm text-gray-300">Verify to enable</p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

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
                    <div key={booking.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {booking.hotel.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {booking.customer.name} • {booking.room_type} • {formatDate(booking.check_in)} - {formatDate(booking.check_out)}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="mt-3">
                        <p className="text-gray-600 text-sm">Total Amount</p>
                        <p className="font-bold text-green-600 text-lg">PKR {booking.total_amount.toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <p>{verification_status.is_verified ? 'No bookings yet. Start by adding a hotel!' : 'No bookings available. Complete verification to start receiving bookings.'}</p>
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

