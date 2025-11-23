'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/shared/StatsCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { hotelManagersApi, HotelManagerEarnings, HotelManagerEarningsBreakdown } from '@/lib/api/hotel-managers.api'
import { useAuth } from '@/features/auth/useAuth'

export default function HotelManagerEarningsPage() {
  const { user } = useAuth()
  const [earnings, setEarnings] = useState<HotelManagerEarnings | null>(null)
  const [breakdown, setBreakdown] = useState<HotelManagerEarningsBreakdown | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateFilter, setDateFilter] = useState<'all' | 'month' | '3months'>('all')

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        let dateFrom: string | undefined
        let dateTo: string | undefined
        
        if (dateFilter === 'month') {
          const now = new Date()
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        } else if (dateFilter === '3months') {
          const now = new Date()
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString().split('T')[0]
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
        }
        
        const [earningsData, breakdownData] = await Promise.all([
          hotelManagersApi.getEarnings(dateFrom, dateTo),
          hotelManagersApi.getEarningsBreakdown(),
        ])
        setEarnings(earningsData)
        setBreakdown(breakdownData)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load earnings')
        console.error('Error fetching earnings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'hotel_manager') {
      fetchEarnings()
    }
  }, [user, dateFilter])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading earnings...</div>
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

  if (!earnings || !breakdown) {
    return null
  }

  const platformFee = earnings.total_earnings * 0.05
  const netEarnings = earnings.total_earnings * 0.95

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="Earnings & Analytics"
        subtitle="View your earnings and performance analytics"
        backUrl="/hotel-manager/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Date Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['all', 'month', '3months'] as const).map((filter) => (
              <Button
                key={filter}
                variant={dateFilter === filter ? 'default' : 'outline'}
                onClick={() => setDateFilter(filter)}
                className={dateFilter === filter ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
              >
                {filter === 'all' ? 'All Time' : filter === 'month' ? 'This Month' : 'Last 3 Months'}
              </Button>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Earnings"
              value={`PKR ${earnings.total_earnings.toLocaleString()}`}
              subtitle="All time"
              icon="💰"
              delay={0.1}
            />
            <StatsCard
              title="Net Earnings"
              value={`PKR ${netEarnings.toLocaleString()}`}
              subtitle="After platform fee (5%)"
              icon="💵"
              delay={0.2}
            />
            <StatsCard
              title="Total Bookings"
              value={earnings.total_bookings}
              subtitle="Completed bookings"
              icon="📋"
              delay={0.3}
            />
            <StatsCard
              title="Platform Fee"
              value={`PKR ${platformFee.toLocaleString()}`}
              subtitle="5% commission"
              icon="💳"
              delay={0.4}
            />
          </div>

          {/* Earnings Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* By Month */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Earnings by Month</CardTitle>
              </CardHeader>
              <CardContent>
                {breakdown.by_month.length > 0 ? (
                  <div className="space-y-3">
                    {breakdown.by_month.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">{item.month}</span>
                        <span className="text-white font-semibold">PKR {item.earnings.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No earnings data available</p>
                )}
              </CardContent>
            </Card>

            {/* By Hotel */}
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Earnings by Hotel</CardTitle>
              </CardHeader>
              <CardContent>
                {breakdown.by_hotel.length > 0 ? (
                  <div className="space-y-3">
                    {breakdown.by_hotel.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300 truncate flex-1 mr-4">{item.hotel}</span>
                        <span className="text-white font-semibold">PKR {item.earnings.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No earnings data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Bookings */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Recent Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {earnings.bookings.length > 0 ? (
                <div className="space-y-4">
                  {earnings.bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="p-4 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-white">{booking.hotel}</div>
                          <div className="text-sm text-gray-300">
                            {booking.customer_name} • {booking.room_type}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {formatDate(booking.created_at)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex justify-between items-center">
                        <div>
                          <p className="text-gray-300 text-sm">Total Amount</p>
                          <p className="text-lg font-semibold text-white">PKR {booking.total_amount.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-300 text-sm">Your Earnings</p>
                          <p className="text-lg font-semibold text-green-400">PKR {booking.manager_earnings.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">💳</div>
                  <h3 className="text-xl font-semibold text-white mb-2">No Earnings Yet</h3>
                  <p className="text-gray-300">Start receiving bookings to see your earnings here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

