'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function AdminDashboard() {
  // Mock data - replace with actual API calls
  const stats = {
    totalUsers: 1247,
    totalDrivers: 89,
    totalCars: 145,
    totalBookings: 3421,
    carBookings: 892,
    hotelBookings: 2529,
    totalRevenue: 4568000,
    platformCommission: 228400,
    pendingVerifications: 12,
    pendingCarApprovals: 8,
    activeDisputes: 5,
  }

  const recentActivity = [
    {
      id: '1',
      type: 'driver_verification',
      message: 'New driver verification request from John Smith',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'pending',
    },
    {
      id: '2',
      type: 'dispute',
      message: 'Dispute reported for booking #BK-1234',
      timestamp: '2024-01-15T09:15:00Z',
      status: 'open',
    },
    {
      id: '3',
      type: 'booking',
      message: 'New hotel booking worth $450',
      timestamp: '2024-01-15T08:45:00Z',
      status: 'completed',
    },
  ]

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'driver_verification':
        return '👤'
      case 'dispute':
        return '⚠️'
      case 'booking':
        return '📋'
      default:
        return '📄'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'open':
        return 'bg-red-100 text-red-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
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
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-lg text-gray-300">
              Manage your platform and monitor system performance.
            </p>
          </div>

          {/* Primary Stats Cards */}
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
                      <p className="text-sm font-medium text-gray-300">Total Users</p>
                      <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                      <p className="text-xs text-gray-400 mt-1">Platform users</p>
                    </div>
                    <div className="text-4xl">👥</div>
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
                      <p className="text-sm font-medium text-gray-300">Total Drivers</p>
                      <p className="text-3xl font-bold text-white">{stats.totalDrivers}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats.totalCars} cars listed</p>
                    </div>
                    <div className="text-4xl">🚗</div>
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
                      <p className="text-sm font-medium text-gray-300">Total Bookings</p>
                      <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                      <p className="text-xs text-gray-400 mt-1">{stats.carBookings} cars, {stats.hotelBookings} hotels</p>
                    </div>
                    <div className="text-4xl">📋</div>
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
                      <p className="text-sm font-medium text-gray-300">Platform Revenue</p>
                      <p className="text-3xl font-bold text-white">PKR {(stats.platformCommission / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-400 mt-1">5% commission</p>
                    </div>
                    <div className="text-4xl">💰</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Alert Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                        <p className="text-gray-200">{stats.pendingVerifications} pending review</p>
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
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 border-blue-500 bg-blue-500/20 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">🚗</div>
                      <div>
                        <h3 className="font-semibold text-white">Car Approvals</h3>
                        <p className="text-gray-200">{stats.pendingCarApprovals} listings to review</p>
                      </div>
                    </div>
                    <Link href="/admin/cars">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
              transition={{ delay: 0.7 }}
            >
              <Card className="border-2 border-red-500 bg-red-500/20 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl">⚠️</div>
                      <div>
                        <h3 className="font-semibold text-white">Active Disputes</h3>
                        <p className="text-gray-200">{stats.activeDisputes} require attention</p>
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

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              transition={{ delay: 0.9 }}
            >
              <Link href="/admin/cars">
                <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-3">🚗</div>
                    <h3 className="font-semibold text-white text-lg">Car Listings</h3>
                    <p className="text-sm text-gray-300">Review and approve car listings</p>
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
              <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer bg-white/10 backdrop-blur-md border-white/20 hover:border-white/40">
                <CardContent className="p-6 text-center">
                  <div className="text-5xl mb-3">📊</div>
                  <h3 className="font-semibold text-white text-lg">Analytics</h3>
                  <p className="text-sm text-gray-300">View detailed reports</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="text-xl">{getActivityIcon(activity.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{formatDate(activity.timestamp)}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                            {activity.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* System Health */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>System Health</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">API Status</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Healthy</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Database</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Connected</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Payment Gateway</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Active</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Monument API</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Online</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900">Weather API</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Online</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
