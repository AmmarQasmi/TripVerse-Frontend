'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatsCard } from '@/components/shared/StatsCard'
import { DashboardHeader } from '@/components/shared/DashboardHeader'
import { SimpleChart } from '@/components/shared/SimpleChart'
import Link from 'next/link'
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingSuspensions, setPendingSuspensions] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [data, suspensions] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getDriversWithPendingSuspensions().catch(() => ({ pending: [], paused: [] })),
        ])
        setStats(data)
        setPendingSuspensions(suspensions)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load dashboard stats')
        console.error('Error fetching dashboard stats:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: stats?.revenue.currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dashboard...</div>
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

  if (!stats) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <DashboardHeader 
        title="Admin Dashboard"
        subtitle="Manage your platform and monitor system performance"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >

          {/* Primary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Drivers"
              value={stats.drivers.total}
              subtitle={`${stats.drivers.verified} verified, ${stats.drivers.pending} pending`}
              icon="👥"
              delay={0.1}
            />
            <StatsCard
              title="Hotel Managers"
              value={stats.hotel_managers?.total || 0}
              subtitle={`${stats.hotel_managers?.verified || 0} verified, ${stats.hotel_managers?.pending || 0} pending`}
              icon="🏨"
              delay={0.15}
            />
            <StatsCard
              title="Total Bookings"
              value={stats.bookings.total}
              subtitle={`${stats.bookings.today} today, ${stats.bookings.this_week} this week`}
              icon="📋"
              delay={0.2}
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats.revenue.total)}
              subtitle={`${formatCurrency(stats.revenue.commission)} commission`}
              icon="💰"
              delay={0.3}
            />
          </div>

          {/* Secondary Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Pending Disputes"
              value={stats.disputes.pending}
              subtitle="Require attention"
              icon="⚠️"
              delay={0.4}
            />
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="border-2 border-yellow-500 bg-yellow-500/20 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">⏳</div>
                      <div>
                        <h3 className="font-semibold text-white">Driver Verifications</h3>
                        <p className="text-gray-200">{stats.drivers.pending} pending review</p>
                      </div>
                    </div>
                    <Link href="/admin/drivers">
                      <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                        Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Card className="border-2 border-cyan-500 bg-cyan-500/20 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🏨</div>
                      <div>
                        <h3 className="font-semibold text-white">Hotel Manager Requests</h3>
                        <p className="text-gray-200">{stats.hotel_managers?.pending || 0} pending review</p>
                      </div>
                    </div>
                    <Link href="/admin/hotel-managers">
                      <Button size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white">
                        Review
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 border-blue-500 bg-blue-500/20 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">📊</div>
                      <div>
                        <h3 className="font-semibold text-white">Bookings Today</h3>
                        <p className="text-gray-200">{stats.bookings.today} new bookings</p>
                      </div>
                    </div>
                    <Link href="/admin/payments">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                        View
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-2 border-red-500 bg-red-500/20 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">⚠️</div>
                      <div>
                        <h3 className="font-semibold text-white">Active Disputes</h3>
                        <p className="text-gray-200">{stats.disputes.pending} require attention</p>
                      </div>
                    </div>
                    <Link href="/admin/disputes">
                      <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white">
                        Resolve
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Bookings Trend (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={[
                      { label: 'Mon', value: Math.floor(stats.bookings.this_week * 0.15) },
                      { label: 'Tue', value: Math.floor(stats.bookings.this_week * 0.20) },
                      { label: 'Wed', value: Math.floor(stats.bookings.this_week * 0.18) },
                      { label: 'Thu', value: Math.floor(stats.bookings.this_week * 0.22) },
                      { label: 'Fri', value: Math.floor(stats.bookings.this_week * 0.15) },
                      { label: 'Sat', value: Math.floor(stats.bookings.this_week * 0.08) },
                      { label: 'Sun', value: Math.floor(stats.bookings.this_week * 0.02) },
                    ]}
                    type="area"
                    height={250}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Driver Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={[
                      { label: 'Verified', value: stats.drivers.verified, color: 'rgba(16, 185, 129, 0.8)' },
                      { label: 'Pending', value: stats.drivers.pending, color: 'rgba(245, 158, 11, 0.8)' },
                      { label: 'Suspended', value: stats.drivers.total - stats.drivers.verified - stats.drivers.pending, color: 'rgba(239, 68, 68, 0.8)' },
                    ]}
                    type="bar"
                    height={250}
                  />
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white">Hotel Manager Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleChart
                    data={[
                      { label: 'Verified', value: stats.hotel_managers.verified, color: 'rgba(16, 185, 129, 0.8)' },
                      { label: 'Pending', value: stats.hotel_managers.pending, color: 'rgba(245, 158, 11, 0.8)' },
                      { label: 'Rejected', value: stats.hotel_managers.total - stats.hotel_managers.verified - stats.hotel_managers.pending, color: 'rgba(239, 68, 68, 0.8)' },
                    ]}
                    type="bar"
                    height={250}
                  />
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Revenue Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-8"
          >
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-white">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-green-500/20 rounded-lg border border-green-500/30">
                    <p className="text-sm text-gray-300 mb-1">Total Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue.total)}</p>
                  </div>
                  <div className="p-4 bg-blue-500/20 rounded-lg border border-blue-500/30">
                    <p className="text-sm text-gray-300 mb-1">Commission</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue.commission)}</p>
                  </div>
                  <div className="p-4 bg-purple-500/20 rounded-lg border border-purple-500/30">
                    <p className="text-sm text-gray-300 mb-1">Net Revenue</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(stats.revenue.total - stats.revenue.commission)}</p>
                  </div>
                </div>
                <SimpleChart
                  data={[
                    { label: 'Revenue', value: stats.revenue.total, color: 'rgba(16, 185, 129, 0.8)' },
                    { label: 'Commission', value: stats.revenue.commission, color: 'rgba(59, 130, 246, 0.8)' },
                  ]}
                  type="bar"
                  height={200}
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link href="/admin/drivers">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">👤</div>
                    <h3 className="font-semibold text-white text-lg">Manage Drivers</h3>
                    <p className="text-sm text-gray-300">Verify and manage driver accounts</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
            >
              <Link href="/admin/hotel-managers">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">🏨</div>
                    <h3 className="font-semibold text-white text-lg">Hotel Managers</h3>
                    <p className="text-sm text-gray-300">Verify and manage hotel managers</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link href="/admin/payments">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">💳</div>
                    <h3 className="font-semibold text-white text-lg">Payments</h3>
                    <p className="text-sm text-gray-300">Monitor transactions</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <Link href="/admin/disputes">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">⚠️</div>
                    <h3 className="font-semibold text-white text-lg">Disputes</h3>
                    <p className="text-sm text-gray-300">Resolve customer disputes</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Link href="/admin/reports">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">📊</div>
                    <h3 className="font-semibold text-white text-lg">Analytics</h3>
                    <p className="text-sm text-gray-300">View detailed reports</p>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          </div>

          {/* Recent Pending Drivers */}
          {stats.recent_pending_drivers && stats.recent_pending_drivers.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Pending Driver Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recent_pending_drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="text-xl">👤</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {driver.user.full_name} ({driver.user.email})
                        </p>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(driver.user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/admin/drivers/${driver.id}`}>
                        <Button size="sm" variant="outline">
                          Review
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}
