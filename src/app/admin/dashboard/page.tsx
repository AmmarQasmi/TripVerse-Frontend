'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { SimpleChart } from '@/components/shared/SimpleChart'
import { StatsModal } from '@/components/client/StatsModal'
import { PageLoader } from '@/components/shared/PageLoader'
import Link from 'next/link'
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api'

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingSuspensions, setPendingSuspensions] = useState<any>(null)
  const [modalType, setModalType] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any[]>([])

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
    return `PKR ${amount.toLocaleString()}`
  }

  const handleChartClick = async (type: string) => {
    setModalType(type)
    try {
      let data: any[] = []
      switch (type) {
        case 'Total Drivers':
          const driversResponse = await adminApi.getAllDrivers({ limit: 100 }) as any
          data = (driversResponse?.data || []).map((driver: any) => ({
            id: driver.id,
            type: 'car' as const,
            name: driver.user?.full_name || `Driver #${driver.id}`,
            date: driver.user?.created_at || new Date().toISOString(),
            status: driver.is_verified ? 'verified' : 'pending',
            amount: 0,
          }))
          break
        case 'Hotel Managers':
          // Note: This endpoint may need to be added to adminApi
          const managersResponse = await adminApi.getAllUsers({ role: 'hotel_manager', limit: 100 }) as any
          data = (managersResponse?.data || []).map((manager: any) => ({
            id: manager.id,
            type: 'hotel' as const,
            name: manager.full_name || `Hotel Manager #${manager.id}`,
            date: manager.created_at || new Date().toISOString(),
            status: 'active',
            amount: 0,
          }))
          break
        case 'Total Bookings':
          // Note: This endpoint may need to be added
          const bookingsResponse = await adminApi.getAllPayments({ limit: 100 }) as any
          data = (bookingsResponse?.data || []).map((payment: any) => ({
            id: payment.id,
            type: payment.booking_type || 'car' as const,
            name: payment.description || `Booking #${payment.id}`,
            date: payment.created_at || new Date().toISOString(),
            status: payment.status || 'completed',
            amount: payment.amount || 0,
          }))
          break
        case 'Pending Disputes':
          const disputesResponse = await adminApi.getAllDisputes({ status: 'pending', limit: 100 }) as any
          data = (disputesResponse?.data || []).map((dispute: any) => ({
            id: dispute.id,
            type: dispute.booking_type || 'car' as const,
            name: dispute.description || `Dispute #${dispute.id}`,
            date: dispute.created_at || new Date().toISOString(),
            status: dispute.status || 'pending',
            amount: dispute.refund_amount || 0,
          }))
          break
        default:
          data = []
      }
      setModalData(data)
    } catch (err) {
      console.error('Error fetching modal data:', err)
      setModalData([])
    }
  }

  const closeModal = () => {
    setModalType(null)
    setModalData([])
  }

  if (isLoading) {
    return <PageLoader message="Loading dashboard..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-gray-900">{error}</p>
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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Overview Section */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-center">
              <span className="animated-gradient-text">
                Dashboard Overview
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <DoughnutChart
              label="Total Drivers"
              value={stats.drivers.total}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-500"
              delay={0.1}
              onClick={() => handleChartClick('Total Drivers')}
            />
            <DoughnutChart
              label="Hotel Managers"
              value={stats.hotel_managers?.total || 0}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              delay={0.15}
              onClick={() => handleChartClick('Hotel Managers')}
            />
            <DoughnutChart
              label="Total Bookings"
              value={stats.bookings.total}
              gradient="bg-gradient-to-br from-cyan-500 to-blue-500"
              delay={0.2}
              onClick={() => handleChartClick('Total Bookings')}
            />
            <DoughnutChart
              label="Total Revenue"
              value={Math.round(stats.revenue.total)}
              gradient="bg-gradient-to-br from-green-500 to-emerald-500"
              delay={0.3}
            />
            <DoughnutChart
              label="Pending Disputes"
              value={stats.disputes.pending}
              gradient="bg-gradient-to-br from-teal-500 to-emerald-500"
              delay={0.4}
              onClick={() => handleChartClick('Pending Disputes')}
            />
          </div>

          {/* Alert Cards - Styled similar to homepage feature cards (no animations, unified gradient) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Driver Verifications */}
            <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl text-white">
                        {/* Car SVG icon */} 
                        <svg
                          className="w-8 h-8"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 13h18l-1.2-3.6a2 2 0 0 0-1.9-1.4H6.1a2 2 0 0 0-1.9 1.4L3 13z" />
                          <path d="M5 13v4a1.5 1.5 0 0 0 1.5 1.5H7" />
                          <path d="M19 13v4a1.5 1.5 0 0 1-1.5 1.5H17" />
                          <circle cx="7.5" cy="17.5" r="1.4" fill="currentColor" />
                          <circle cx="16.5" cy="17.5" r="1.4" fill="currentColor" />
                          <path d="M7 9.5l1-3h8l1 3" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-lg">Driver Verifications</h3>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.drivers.pending}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-100/90">
                      Pending review
                    </p>
                    <Link href="/admin/drivers">
                      <Button size="sm" className="bg-white/90 text-emerald-700 hover:bg-white">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Hotel Manager Requests */}
            <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl text-white">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="4" y="3" width="16" height="18" rx="2" />
                          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2" />
                          <path d="M10 21v-3h4v3" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-lg">Hotel Manager Requests</h3>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.hotel_managers?.pending || 0}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-100/90">
                      Pending review
                    </p>
                    <Link href="/admin/hotel-managers">
                      <Button size="sm" className="bg-white/90 text-emerald-700 hover:bg-white">
                        Review
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookings Today */}
            <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl text-white">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M4 19V5" />
                          <rect x="6" y="10" width="3" height="9" rx="0.5" />
                          <rect x="11" y="7" width="3" height="12" rx="0.5" />
                          <rect x="16" y="4" width="3" height="15" rx="0.5" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-lg">Bookings Today</h3>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.bookings.today}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-100/90">
                      New bookings today
                    </p>
                    <Link href="/admin/payments">
                      <Button size="sm" className="bg-white/90 text-emerald-700 hover:bg-white">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Disputes */}
            <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-3xl text-white">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path d="M12 3L2 21h20L12 3z" />
                          <path d="M12 9v5" />
                          <circle cx="12" cy="17" r="1" fill="currentColor" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-white text-lg">Active Disputes</h3>
                    </div>
                    <div className="text-3xl font-bold text-white">
                      {stats.disputes.pending}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-emerald-100/90">
                      Require attention
                    </p>
                    <Link href="/admin/disputes">
                      <Button size="sm" className="bg-white/90 text-emerald-700 hover:bg-white">
                        Resolve
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="h-full flex flex-col"
            >
              <div className="h-full flex flex-col rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                <Card className="rounded-2xl bg-white h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 text-base leading-tight">
                      <motion.span
                        className="animated-gradient-text inline-block"
                        initial={{ backgroundPosition: '0% 50%' }}
                        animate={{ backgroundPosition: '100% 50%' }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Bookings Trend (Last 7 Days)
                      </motion.span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
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
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="h-full flex flex-col"
            >
              <div className="h-full flex flex-col rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                <Card className="rounded-2xl bg-white h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 text-base leading-tight">
                      <motion.span
                        className="animated-gradient-text inline-block"
                        initial={{ backgroundPosition: '0% 50%' }}
                        animate={{ backgroundPosition: '100% 50%' }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Driver Status Distribution
                      </motion.span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
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
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="h-full flex flex-col"
            >
              <div className="h-full flex flex-col rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
                <Card className="rounded-2xl bg-white h-full flex flex-col">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-gray-900 text-base leading-tight">
                      <motion.span
                        className="animated-gradient-text inline-block"
                        initial={{ backgroundPosition: '0% 50%' }}
                        animate={{ backgroundPosition: '100% 50%' }}
                        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        Hotel Manager Status Distribution
                      </motion.span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 pb-6">
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
              </div>
            </motion.div>
          </div>

          {/* Revenue Breakdown */}
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.0 }}
             className="mb-8"
           >
             <div className="rounded-2xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 shadow-lg">
               <Card className="rounded-2xl bg-white">
                 <CardHeader>
                   <CardTitle className="text-gray-900">
                     <motion.span
                       className="animated-gradient-text inline-block"
                       initial={{ backgroundPosition: '0% 50%' }}
                       animate={{ backgroundPosition: '100% 50%' }}
                       transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                     >
                       Revenue Breakdown
                     </motion.span>
                   </CardTitle>
                 </CardHeader>
                 <CardContent>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                     <div className="p-4 rounded-xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white shadow-md flex flex-col space-y-1">
                       <p className="text-sm text-emerald-100/90">Total Revenue</p>
                       <p className="text-2xl font-bold">
                         {formatCurrency(stats.revenue.total)}
                       </p>
                     </div>
                     <div className="p-4 rounded-xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white shadow-md flex flex-col space-y-1">
                       <p className="text-sm text-emerald-100/90">Platform Fee (5%)</p>
                       <p className="text-2xl font-bold">
                         {formatCurrency(stats.revenue.commission)}
                       </p>
                     </div>
                     <div className="p-4 rounded-xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white shadow-md flex flex-col space-y-1">
                       <p className="text-sm text-emerald-100/90">Net Revenue</p>
                       <p className="text-2xl font-bold">
                         {formatCurrency(stats.revenue.total - stats.revenue.commission)}
                       </p>
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
             </div>
           </motion.div>
          </motion.section>

         {/* Quick Actions */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="mb-6">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
                <motion.span
                  className="animated-gradient-text"
                  initial={{ backgroundPosition: '0% 50%' }}
                  animate={{ backgroundPosition: '100% 50%' }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                    backgroundSize: '200% auto',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Quick Actions
                </motion.span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="h-full"
            >
              <Link href="/admin/drivers">
                <div className="h-full rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:shadow-xl transition-all duration-75">
                  <Card className="h-full bg-white rounded-xl hover:shadow-lg transition-all duration-75 cursor-pointer flex flex-col">
                    <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                      <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Manage Drivers</h3>
                      <p className="text-sm text-gray-600">Verify and manage driver accounts</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="h-full"
            >
              <Link href="/admin/hotel-managers">
                <div className="h-full rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:shadow-xl transition-all duration-75">
                  <Card className="h-full bg-white rounded-xl hover:shadow-lg transition-all duration-75 cursor-pointer flex flex-col">
                    <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                      <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Hotel Managers</h3>
                      <p className="text-sm text-gray-600">Verify and manage hotel managers</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="h-full"
            >
              <Link href="/admin/payments">
                <div className="h-full rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:shadow-xl transition-all duration-75">
                  <Card className="h-full bg-white rounded-xl hover:shadow-lg transition-all duration-75 cursor-pointer flex flex-col">
                    <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                      <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Payments</h3>
                      <p className="text-sm text-gray-600">Monitor transactions</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="h-full"
            >
              <Link href="/admin/disputes">
                <div className="h-full rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:shadow-xl transition-all duration-75">
                  <Card className="h-full bg-white rounded-xl hover:shadow-lg transition-all duration-75 cursor-pointer flex flex-col">
                    <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                      <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Disputes</h3>
                      <p className="text-sm text-gray-600">Resolve customer disputes</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="h-full"
            >
              <Link href="/admin/reports">
                <div className="h-full rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 hover:shadow-xl transition-all duration-75">
                  <Card className="h-full bg-white rounded-xl hover:shadow-lg transition-all duration-75 cursor-pointer flex flex-col">
                    <CardContent className="p-6 text-center flex flex-col justify-between h-full">
                      <div className="flex justify-center mb-3">
                        <svg className="w-12 h-12 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-lg">Analytics</h3>
                      <p className="text-sm text-gray-600">View detailed reports</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            </motion.div>
          </div>
          </motion.section>

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

      {/* Stats Modal */}
      <StatsModal
        isOpen={modalType !== null}
        onClose={closeModal}
        title={modalType || ''}
        data={modalData}
      />
    </div>
  )
}
