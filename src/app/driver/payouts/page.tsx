'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/shared/StatsCard'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { driversApi, DriverEarnings } from '@/lib/api/drivers.api'
import { useAuth } from '@/features/auth/useAuth'

export default function DriverPayoutsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings'>('overview')
  const [earnings, setEarnings] = useState<DriverEarnings | null>(null)
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
          dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        } else if (dateFilter === '3months') {
          const now = new Date()
          dateFrom = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString()
          dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()
        }
        
        const data = await driversApi.getEarnings(dateFrom, dateTo)
        setEarnings(data)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load earnings')
        console.error('Error fetching earnings:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'driver') {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading earnings..." />
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

  if (!earnings) {
    return null
  }

  const platformFee = earnings.total_earnings * 0.05
  const netEarnings = earnings.total_earnings * 0.95

  // Calculate this month's earnings
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const thisMonthEarnings = earnings.bookings
    .filter(b => {
      if (!b.completed_at) return false
      const date = new Date(b.completed_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, b) => sum + b.driver_earnings, 0)

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Earnings & Payouts"
        subtitle="Track your income and payout history"
        backUrl="/driver/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

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
              title="This Month"
              value={`PKR ${thisMonthEarnings.toLocaleString()}`}
              subtitle="Current month"
              icon="📈"
              delay={0.2}
            />
            <StatsCard
              title="Completed Bookings"
              value={earnings.total_completed_bookings}
              subtitle="Total trips"
              icon="🚗"
              delay={0.3}
            />
            <StatsCard
              title="Net Earnings"
              value={`PKR ${netEarnings.toLocaleString()}`}
              subtitle="After 5% platform fee"
              icon="💳"
              delay={0.4}
            />
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-2 bg-gray-100 border border-gray-200 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'earnings'
                    ? 'bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                Earnings Detail
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div>
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Earnings Breakdown */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Earnings Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Gross Earnings</span>
                      <span className="font-bold text-gray-900">PKR {earnings.total_earnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Platform Fee (5%)</span>
                      <span className="font-bold text-red-600">- PKR {platformFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-500">
                      <span className="text-gray-900 font-semibold">Net Earnings (95%)</span>
                      <span className="font-bold text-green-600">PKR {netEarnings.toLocaleString()}</span>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-blue-900 mb-2">Commission Model</h4>
                      <p className="text-sm text-blue-800">
                        TripVerse charges a 5% platform fee on each booking. You receive 95% of the rental amount directly to your account.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Payout Method */}
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Payout Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border-2 border-blue-500">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">💳</div>
                          <div>
                            <p className="font-semibold">Stripe Connect</p>
                            <p className="text-sm text-gray-600">Connected</p>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Payouts are processed automatically after trip completion
                      </p>
                    </div>

                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <h4 className="font-semibold text-green-900 mb-2 flex items-center">
                        <span className="mr-2">🔒</span>
                        Secure Payments
                      </h4>
                      <p className="text-sm text-green-800">
                        All payments are securely processed through Stripe. Your funds are protected and delivered on time.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'earnings' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Earnings Detail</CardTitle>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value as any)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="all">All Time</option>
                      <option value="month">This Month</option>
                      <option value="3months">Last 3 Months</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earnings.bookings.length > 0 ? (
                      earnings.bookings.map((earning) => (
                        <div key={earning.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">{earning.car}</h4>
                              <p className="text-sm text-gray-600">{earning.customer_name}</p>
                              {earning.completed_at && (
                                <p className="text-xs text-gray-500">
                                  Completed on {formatDate(earning.completed_at)}
                                </p>
                              )}
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor('COMPLETED')}`}>
                              COMPLETED
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-gray-600 text-sm">Your Earnings</p>
                            <p className="font-bold text-green-600 text-lg">
                              PKR {earning.driver_earnings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        <p>No earnings yet. Complete bookings to start earning!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
