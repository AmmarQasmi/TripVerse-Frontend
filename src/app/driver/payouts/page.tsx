'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Payout {
  id: string
  amount: number
  platformFee: number
  netAmount: number
  period: string
  status: 'PENDING' | 'PAID' | 'PROCESSING'
  paidAt?: string
  bookingsCount: number
}

interface Earning {
  id: string
  carName: string
  customerName: string
  bookingDate: string
  days: number
  grossAmount: number
  platformFee: number
  netAmount: number
  status: 'COMPLETED' | 'UPCOMING'
}

export default function DriverPayoutsPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'earnings'>('overview')

  const stats = {
    totalEarnings: 285000,
    thisMonth: 45000,
    pending: 12000,
    paid: 273000,
    averageDaily: 3500,
    totalBookings: 67,
  }

  const payouts: Payout[] = [
    {
      id: '1',
      amount: 50000,
      platformFee: 2500,
      netAmount: 47500,
      period: 'January 1-15, 2024',
      status: 'PAID',
      paidAt: '2024-01-16',
      bookingsCount: 8,
    },
    {
      id: '2',
      amount: 45000,
      platformFee: 2250,
      netAmount: 42750,
      period: 'January 16-31, 2024',
      status: 'PROCESSING',
      bookingsCount: 7,
    },
    {
      id: '3',
      amount: 30000,
      platformFee: 1500,
      netAmount: 28500,
      period: 'February 1-15, 2024',
      status: 'PENDING',
      bookingsCount: 5,
    },
  ]

  const earnings: Earning[] = [
    {
      id: '1',
      carName: 'Toyota Camry 2022',
      customerName: 'John Doe',
      bookingDate: '2024-01-15',
      days: 3,
      grossAmount: 15000,
      platformFee: 750,
      netAmount: 14250,
      status: 'COMPLETED',
    },
    {
      id: '2',
      carName: 'Honda Civic 2021',
      customerName: 'Jane Smith',
      bookingDate: '2024-01-12',
      days: 2,
      grossAmount: 9000,
      platformFee: 450,
      netAmount: 8550,
      status: 'COMPLETED',
    },
    {
      id: '3',
      carName: 'Toyota Fortuner 2023',
      customerName: 'Mike Johnson',
      bookingDate: '2024-01-20',
      days: 5,
      grossAmount: 40000,
      platformFee: 2000,
      netAmount: 38000,
      status: 'UPCOMING',
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-800'
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800'
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
            <h1 className="text-4xl font-bold text-white mb-2">
              Earnings & Payouts
            </h1>
            <p className="text-lg text-gray-300">
              Track your income and payout history
            </p>
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
                      <p className="text-sm font-medium text-gray-300">Pending Payout</p>
                      <p className="text-3xl font-bold text-white">
                        PKR {stats.pending.toLocaleString()}
                      </p>
                      <p className="text-xs text-yellow-400 mt-1">Processing</p>
                    </div>
                    <div className="text-4xl">⏳</div>
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
                      <p className="text-sm font-medium text-gray-300">Total Bookings</p>
                      <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                      <p className="text-xs text-gray-400 mt-1">All time</p>
                    </div>
                    <div className="text-4xl">🚗</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('payouts')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'payouts'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Payouts
              </button>
              <button
                onClick={() => setActiveTab('earnings')}
                className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                  activeTab === 'earnings'
                    ? 'bg-white text-gray-900'
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Earnings
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
                      <span className="font-bold text-gray-900">PKR {stats.totalEarnings.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="text-gray-700">Platform Fee (5%)</span>
                      <span className="font-bold text-red-600">- PKR {(stats.totalEarnings * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border-2 border-green-500">
                      <span className="text-gray-900 font-semibold">Net Earnings (95%)</span>
                      <span className="font-bold text-green-600">PKR {(stats.totalEarnings * 0.95).toLocaleString()}</span>
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
                            <p className="text-sm text-gray-600">••••4242</p>
                          </div>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Payouts are processed bi-weekly on the 1st and 16th of each month
                      </p>
                    </div>

                    <Button className="w-full" variant="outline">
                      Update Payout Method
                    </Button>

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

            {activeTab === 'payouts' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Payout History</CardTitle>
                    <Button variant="outline" size="sm">
                      Download Report
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{payout.period}</h4>
                            <p className="text-sm text-gray-600">{payout.bookingsCount} bookings</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payout.status)}`}>
                            {payout.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Gross Amount</p>
                            <p className="font-semibold">PKR {payout.amount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Platform Fee</p>
                            <p className="font-semibold text-red-600">- PKR {payout.platformFee.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Net Payout</p>
                            <p className="font-bold text-green-600">PKR {payout.netAmount.toLocaleString()}</p>
                          </div>
                        </div>
                        {payout.paidAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Paid on {new Date(payout.paidAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === 'earnings' && (
              <Card className="shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Earnings Detail</CardTitle>
                    <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                      <option>All Time</option>
                      <option>This Month</option>
                      <option>Last Month</option>
                      <option>Last 3 Months</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earnings.map((earning) => (
                      <div key={earning.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">{earning.carName}</h4>
                            <p className="text-sm text-gray-600">{earning.customerName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(earning.bookingDate).toLocaleDateString()} • {earning.days} days
                            </p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(earning.status)}`}>
                            {earning.status}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm mt-3">
                          <div>
                            <p className="text-gray-600">Gross</p>
                            <p className="font-semibold">PKR {earning.grossAmount.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Fee (5%)</p>
                            <p className="font-semibold text-red-600">- PKR {earning.platformFee.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Your Earnings</p>
                            <p className="font-bold text-green-600">PKR {earning.netAmount.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
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