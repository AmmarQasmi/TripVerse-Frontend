'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DoughnutChart } from '@/components/client/DoughnutChart'
import { SimpleChart } from '@/components/shared/SimpleChart'
import { StatsModal } from '@/components/client/StatsModal'
import { PageLoader } from '@/components/shared/PageLoader'
import { AlertCard } from '@/components/admin/AlertCard'
import { QuickActionCard } from '@/components/admin/QuickActionCard'
import Link from 'next/link'
import { StatCardsSkeletonGrid, ListRowsSkeletonGrid } from '@/components/admin/SkeletonLoaders'
import {
  useDashboardStats,
  prefetchDashboardData,
} from '@/features/admin/useAdminQueries'
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api'
import {
  UserGroupIcon,
  BuildingIcon,
  AlertIcon,
  PricingIcon,
  ServiceIcon,
  RashDrivingIcon,
  CheckCircleIcon,
  FlagIcon,
} from '@/components/admin/AdminIcons'

export default function AdminDashboard() {
  const queryClient = useQueryClient()
  const { data: stats, isLoading, error } = useDashboardStats()
  const [modalType, setModalType] = useState<string | null>(null)
  const [modalData, setModalData] = useState<any[]>([])

  // Prefetch related data on mount for instant navigation
  useEffect(() => {
    prefetchDashboardData(queryClient)
  }, [queryClient])

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
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-8">
          <StatCardsSkeletonGrid />
          <ListRowsSkeletonGrid count={3} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-gray-900">{error instanceof Error ? error.message : 'Failed to load dashboard stats'}</p>
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
      <div className="container relative mx-auto px-4 py-8">
        <div className="relative z-10">
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
            <h1 className="text-4xl font-bold mb-8 text-center text-gray-900">
              Dashboard Overview
            </h1>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Driver Verifications */}
            <AlertCard
              icon={<UserGroupIcon />}
              title="Driver Verifications"
              value={stats.drivers.pending}
              description="Pending review"
              actionLabel="Review"
              actionHref="/admin/drivers"
              bgColor="bg-gradient-to-br from-blue-600 to-blue-700"
            />

            {/* Hotel Manager Requests */}
            <AlertCard
              icon={<BuildingIcon />}
              title="Hotel Manager Requests"
              value={stats.hotel_managers?.pending || 0}
              description="Pending review"
              actionLabel="Review"
              actionHref="/admin/hotel-managers"
              bgColor="bg-gradient-to-br from-purple-600 to-purple-700"
            />

            {/* Bookings Today */}
            <AlertCard
              icon={<ServiceIcon />}
              title="Bookings Today"
              value={stats.bookings.today}
              description="New bookings today"
              actionLabel="View"
              actionHref="/admin/payments"
              bgColor="bg-gradient-to-br from-amber-600 to-amber-700"
            />

            {/* Active Disputes */}
            <AlertCard
              icon={<AlertIcon />}
              title="Active Disputes"
              value={stats.disputes.pending}
              description="Require attention"
              actionLabel="Resolve"
              actionHref="/admin/disputes"
              bgColor="bg-gradient-to-br from-red-600 to-red-700"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Card className="border-2 border-blue-200 h-full">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-lg">Bookings Trend</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">(Last 7 Days)</p>
                </CardHeader>
                <CardContent className="flex-1">
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
              <Card className="border-2 border-blue-200 h-full">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-lg">Driver Status</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Verification breakdown</p>
                </CardHeader>
                <CardContent className="flex-1">
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
              <Card className="border-2 border-purple-200 h-full">
                <CardHeader>
                  <CardTitle className="text-gray-900 text-lg">Hotel Manager Status</CardTitle>
                  <p className="text-xs text-gray-500 mt-1">Verification breakdown</p>
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
            className="mb-12"
          >
            <Card className="border-2 border-green-200">
              <CardHeader>
                <CardTitle className="text-gray-900 text-xl">Revenue Breakdown</CardTitle>
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
                   
                   {/* Revenue by Booking Type */}
                   {stats.revenue.by_type && (
                     <div className="mb-6">
                       <h4 className="text-sm font-semibold text-gray-600 mb-3">Revenue by Booking Type</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 flex justify-between items-center">
                           <div>
                             <p className="text-sm text-blue-600 font-medium flex items-center gap-2">
                               <span className="w-5 h-5"><ServiceIcon /></span> Rentals
                             </p>
                             <p className="text-xl font-bold text-blue-800">{formatCurrency(stats.revenue.by_type.rental.total)}</p>
                             <p className="text-xs text-blue-500">Platform Fees: {formatCurrency(stats.revenue.by_type.rental.platform_fees)}</p>
                           </div>
                           <div className="w-8 h-8 text-blue-700"><RashDrivingIcon /></div>
                         </div>
                         <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 flex justify-between items-center">
                           <div>
                             <p className="text-sm text-teal-600 font-medium flex items-center gap-2">
                               <span className="w-5 h-5"><RashDrivingIcon /></span> Ride-Hailing
                             </p>
                             <p className="text-xl font-bold text-teal-800">{formatCurrency(stats.revenue.by_type.ride_hailing.total)}</p>
                             <p className="text-xs text-teal-500">Platform Fees: {formatCurrency(stats.revenue.by_type.ride_hailing.platform_fees)}</p>
                           </div>
                           <div className="w-8 h-8 text-teal-700"><FlagIcon /></div>
                         </div>
                       </div>
                     </div>
                   )}
                   
                   <SimpleChart
                     data={stats.revenue.by_type ? [
                       { label: 'Rentals', value: stats.revenue.by_type.rental.total, color: 'rgba(59, 130, 246, 0.8)' },
                       { label: 'Ride-Hailing', value: stats.revenue.by_type.ride_hailing.total, color: 'rgba(20, 184, 166, 0.8)' },
                       { label: 'Commission', value: stats.revenue.commission, color: 'rgba(139, 92, 246, 0.8)' },
                     ] : [
                       { label: 'Revenue', value: stats.revenue.total, color: 'rgba(16, 185, 129, 0.8)' },
                       { label: 'Commission', value: stats.revenue.commission, color: 'rgba(59, 130, 246, 0.8)' },
                     ]}
                     type="bar"
                     height={200}
                   />
                </CardContent>
              </Card>
            </motion.div>
           
           {/* Booking Type Analytics */}
           {stats.bookings.by_type && (
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 1.1 }}
               className="mb-12"
             >
               <Card className="border-2 border-cyan-200">
                 <CardHeader>
                   <CardTitle className="text-gray-900 text-xl">Booking Type Analytics</CardTitle>
                 </CardHeader>
                 <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       {/* Rentals Card */}
                       <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg">
                         <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                               <span className="w-6 h-6"><ServiceIcon /></span>
                             </div>
                             <div>
                               <h4 className="font-semibold text-lg">Car Rentals</h4>
                               <p className="text-sm text-blue-200">Multi-day bookings</p>
                             </div>
                           </div>
                         </div>
                         <div className="grid grid-cols-3 gap-4 text-center">
                           <div>
                             <p className="text-2xl font-bold">{stats.bookings.by_type.rental.today}</p>
                             <p className="text-xs text-blue-200">Today</p>
                           </div>
                           <div>
                             <p className="text-2xl font-bold">{stats.bookings.by_type.rental.this_month}</p>
                             <p className="text-xs text-blue-200">This Month</p>
                           </div>
                           <div>
                             <p className="text-2xl font-bold">{stats.bookings.by_type.rental.total}</p>
                             <p className="text-xs text-blue-200">Total</p>
                           </div>
                         </div>
                       </div>
                       
                       {/* Ride-Hailing Card */}
                       <div className="p-6 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-lg">
                         <div className="flex items-center justify-between mb-4">
                           <div className="flex items-center gap-3">
                             <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                               <span className="w-6 h-6"><RashDrivingIcon /></span>
                             </div>
                             <div>
                               <h4 className="font-semibold text-lg">Ride-Hailing</h4>
                               <p className="text-sm text-teal-200">On-demand rides</p>
                             </div>
                           </div>
                         </div>
                         <div className="grid grid-cols-3 gap-4 text-center">
                           <div>
                             <p className="text-2xl font-bold">{stats.bookings.by_type.ride_hailing.today}</p>
                             <p className="text-xs text-teal-200">Today</p>
                           </div>
                           <div>
                             <p className="text-2xl font-bold">{stats.bookings.by_type.ride_hailing.this_month}</p>
                             <p className="text-xs text-teal-200">This Month</p>
                           </div>
                           <div>
                             <p className="text-2xl font-bold">{stats.bookings.by_type.ride_hailing.total}</p>
                             <p className="text-xs text-teal-200">Total</p>
                           </div>
                         </div>
                       </div>
                     </div>
                     
                     {/* Comparison Chart */}
                     <div className="mt-6">
                       <h4 className="text-sm font-semibold text-gray-600 mb-3">Booking Distribution</h4>
                       <SimpleChart
                         data={[
                           { label: 'Rentals', value: stats.bookings.by_type.rental.total, color: 'rgba(59, 130, 246, 0.8)' },
                           { label: 'Ride-Hailing', value: stats.bookings.by_type.ride_hailing.total, color: 'rgba(20, 184, 166, 0.8)' },
                         ]}
                         type="bar"
                         height={150}
                       />
                     </div>
                   </CardContent>
                 </Card>
               </motion.div>
             )}
          </motion.section>

         {/* Quick Actions */}
          <motion.section 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-3xl font-bold mb-8 text-center text-gray-900">
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8 items-stretch">
            <QuickActionCard
              icon={<UserGroupIcon />}
              title="Manage Drivers"
              description="Verify and manage accounts"
              href="/admin/drivers"
              delay={0.8}
            />

            <QuickActionCard
              icon={<BuildingIcon />}
              title="Hotel Managers"
              description="Verify and manage accounts"
              href="/admin/hotel-managers"
              delay={0.85}
            />

            <QuickActionCard
              icon={<PricingIcon />}
              title="Payments"
              description="Monitor transactions"
              href="/admin/payments"
              delay={0.9}
            />

            <QuickActionCard
              icon={<AlertIcon />}
              title="Disputes"
              description="Resolve customer issues"
              href="/admin/disputes"
              delay={1.0}
            />

            <QuickActionCard
              icon={<CheckCircleIcon />}
              title="Analytics"
              description="View detailed reports"
              href="/admin/reports"
              delay={1.1}
            />
          </div>
          </motion.section>

          {/* Recent Pending Drivers */}
          {stats.recent_pending_drivers && stats.recent_pending_drivers.length > 0 && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <CardTitle className="text-gray-900 text-xl">Recent Pending Driver Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.recent_pending_drivers.map((driver) => (
                    <div
                      key={driver.id}
                      className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                      role="article"
                      aria-label={`Driver ${driver.user.full_name} pending verification`}
                    >
                      <div className="w-6 h-6" aria-hidden="true"><UserGroupIcon /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {driver.user.full_name}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          {driver.user.email}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Joined {new Date(driver.user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/admin/drivers/${driver.id}`} className="flex-shrink-0">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
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
