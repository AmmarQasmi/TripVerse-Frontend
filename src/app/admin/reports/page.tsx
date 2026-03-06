'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { SimpleChart } from '@/components/shared/SimpleChart'
import { adminApi } from '@/lib/api/admin.api'

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<'bookings' | 'revenue' | 'drivers'>('bookings')
  const [dateRange, setDateRange] = useState({
    from: '',
    to: '',
  })
  const [bookingsData, setBookingsData] = useState<any>(null)
  const [revenueData, setRevenueData] = useState<any>(null)
  const [driversData, setDriversData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [activeTab, dateRange])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const dateParams = dateRange.from && dateRange.to 
        ? { from: dateRange.from, to: dateRange.to }
        : undefined

      switch (activeTab) {
        case 'bookings':
          const bookings = await adminApi.getBookingStats(dateParams)
          setBookingsData(bookings)
          break
        case 'revenue':
          const revenue = await adminApi.getRevenueReport(dateParams)
          setRevenueData(revenue)
          break
        case 'drivers':
          const drivers = await adminApi.getDriverPerformanceStats()
          setDriversData(drivers)
          break
      }
    } catch (error) {
      console.error('Error fetching report data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `PKR ${amount.toLocaleString()}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader 
          title="Reports & Analytics"
          subtitle="View detailed platform statistics and performance metrics"
          backUrl="/admin/dashboard"
          backLabel="Back to Dashboard"
        />
        <PageLoader message="Loading reports..." variant="skeleton" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Reports & Analytics"
        subtitle="View detailed platform statistics and performance metrics"
        backUrl="/admin/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        {/* Date Range Filter */}
        <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg mb-6">
          <Card className="bg-white rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">From Date</label>
                    <Input
                      type="date"
                      value={dateRange.from}
                      onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">To Date</label>
                    <Input
                      type="date"
                      value={dateRange.to}
                      onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={fetchData} variant="outline">
                  Apply Filter
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex space-x-2 border-b border-gray-300">
          {[
            { id: 'bookings', label: 'Booking Statistics' },
            { id: 'revenue', label: 'Revenue Report' },
            { id: 'drivers', label: 'Driver Performance' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Report */}
        {activeTab === 'bookings' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoading ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-900">Loading bookings statistics...</div>
                </CardContent>
              </Card>
            ) : bookingsData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {bookingsData.total_bookings || 0}
                        </div>
                        <div className="text-sm text-emerald-100/90">Total Bookings</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {bookingsData.completed_bookings || 0}
                        </div>
                        <div className="text-sm text-emerald-100/90">Completed</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {bookingsData.cancelled_bookings || 0}
                        </div>
                        <div className="text-sm text-emerald-100/90">Cancelled</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {bookingsData.active_bookings || 0}
                        </div>
                        <div className="text-sm text-emerald-100/90">Active</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {bookingsData.bookings_by_type && (
                  <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                    <Card className="bg-white rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-gray-900">Bookings by Type</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SimpleChart
                          type="bar"
                          data={[
                            { label: 'Hotel', value: bookingsData.bookings_by_type.hotel || 0 },
                            { label: 'Car', value: bookingsData.bookings_by_type.car || 0 },
                          ]}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Car Booking Type Breakdown */}
                {bookingsData.car_bookings_by_type && (
                  <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                    <Card className="bg-white rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-gray-900">
                          <span className="flex items-center gap-2">
                            <span>🚗</span> Car Bookings Breakdown
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                          {/* Rentals */}
                          <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-2xl">📅</span>
                              <div>
                                <h4 className="font-semibold text-lg">Car Rentals</h4>
                                <p className="text-sm text-blue-200">Multi-day bookings</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{bookingsData.car_bookings_by_type.rental?.total || 0}</p>
                                <p className="text-xs text-blue-200">Total</p>
                              </div>
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{bookingsData.car_bookings_by_type.rental?.completed || 0}</p>
                                <p className="text-xs text-blue-200">Completed</p>
                              </div>
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{(bookingsData.car_bookings_by_type.rental?.pending || 0) + (bookingsData.car_bookings_by_type.rental?.confirmed || 0) + (bookingsData.car_bookings_by_type.rental?.in_progress || 0)}</p>
                                <p className="text-xs text-blue-200">Active</p>
                              </div>
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{bookingsData.car_bookings_by_type.rental?.cancelled || 0}</p>
                                <p className="text-xs text-blue-200">Cancelled</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Ride-Hailing */}
                          <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white">
                            <div className="flex items-center gap-3 mb-4">
                              <span className="text-2xl">🚕</span>
                              <div>
                                <h4 className="font-semibold text-lg">Ride-Hailing</h4>
                                <p className="text-sm text-teal-200">On-demand rides</p>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{bookingsData.car_bookings_by_type.ride_hailing?.total || 0}</p>
                                <p className="text-xs text-teal-200">Total</p>
                              </div>
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{bookingsData.car_bookings_by_type.ride_hailing?.completed || 0}</p>
                                <p className="text-xs text-teal-200">Completed</p>
                              </div>
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{(bookingsData.car_bookings_by_type.ride_hailing?.pending || 0) + (bookingsData.car_bookings_by_type.ride_hailing?.confirmed || 0) + (bookingsData.car_bookings_by_type.ride_hailing?.in_progress || 0)}</p>
                                <p className="text-xs text-teal-200">Active</p>
                              </div>
                              <div className="text-center p-2 bg-white/10 rounded-lg">
                                <p className="text-xl font-bold">{bookingsData.car_bookings_by_type.ride_hailing?.cancelled || 0}</p>
                                <p className="text-xs text-teal-200">Cancelled</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Comparison Chart */}
                        <SimpleChart
                          type="bar"
                          data={[
                            { label: 'Rentals', value: bookingsData.car_bookings_by_type.rental?.total || 0, color: 'rgba(59, 130, 246, 0.8)' },
                            { label: 'Ride-Hailing', value: bookingsData.car_bookings_by_type.ride_hailing?.total || 0, color: 'rgba(20, 184, 166, 0.8)' },
                          ]}
                          height={150}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Revenue Report */}
        {activeTab === 'revenue' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoading ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-900">Loading revenue report...</div>
                </CardContent>
              </Card>
            ) : revenueData ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {formatCurrency(revenueData.total_revenue || 0)}
                        </div>
                        <div className="text-sm text-emerald-100/90">Total Revenue</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {formatCurrency(revenueData.platform_commission || 0)}
                        </div>
                        <div className="text-sm text-emerald-100/90">Platform Commission</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                      <CardContent className="p-0">
                        <div className="text-3xl font-bold text-white mb-2">
                          {formatCurrency(revenueData.driver_payouts || 0)}
                        </div>
                        <div className="text-sm text-emerald-100/90">Driver Payouts</div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {revenueData.revenue_by_period && (
                  <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                    <Card className="bg-white rounded-2xl">
                      <CardHeader>
                        <CardTitle className="text-gray-900">Revenue Trend</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <SimpleChart
                          type="line"
                          data={revenueData.revenue_by_period.map((p: any) => ({
                            label: p.period,
                            value: p.revenue,
                          }))}
                        />
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}

        {/* Driver Performance Report */}
        {activeTab === 'drivers' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {isLoading ? (
              <Card className="bg-white">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-900">Loading driver performance...</div>
                </CardContent>
              </Card>
            ) : driversData ? (
              <div className="space-y-6">
                <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                  <Card className="bg-white rounded-2xl">
                    <CardHeader>
                      <CardTitle className="text-gray-900">Top 10 Drivers by Earnings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {driversData.top_drivers?.map((driver: any, index: number) => (
                          <div
                            key={driver.driver_id}
                            className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500"
                          >
                            <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{driver.driver_name}</div>
                                  <div className="text-sm text-gray-600">
                                    {driver.total_bookings} bookings
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {formatCurrency(driver.total_earnings)}
                                </div>
                                <div className="text-sm text-gray-600">Total Earnings</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </div>
  )
}

