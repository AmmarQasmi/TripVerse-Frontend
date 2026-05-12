'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { ListRowsSkeletonGrid, StatCardsSkeletonGrid } from '@/components/admin/SkeletonLoaders'
import { Driver } from '@/types/api'
import { CheckCircleIcon, ClockIcon, XCircleIcon, ExclamationIcon, UserGroupIcon, DocumentIcon } from '@/components/admin/AdminIcons'
import {
  useAdminDrivers,
  useVerifyDriver,
  useSuspendDriver,
  useBanDriver,
} from '@/features/admin/useAdminQueries'

export default function AdminDriversPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const { data: driversResponse, isLoading, error, refetch } = useAdminDrivers()
  const verifyDriver = useVerifyDriver()
  const suspendDriver = useSuspendDriver()
  const banDriver = useBanDriver()

  // Extract driver data from response
  const allDrivers = driversResponse?.data || []

  // Helper function to get suspension status badge
  const getSuspensionBadge = (driver: any) => {
    if (driver.is_banned) {
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 border border-red-300">BANNED</span>
    }
    if (driver.is_suspended) {
      if (driver.suspension_paused) {
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">SUSPENDED (PAUSED)</span>
      }
      return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 border border-orange-300">SUSPENDED</span>
    }
    if (driver.dispute_count >= 3) {
      return <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300"><ExclamationIcon /> {driver.dispute_count} Disputes</span>
    }
    if (driver.dispute_count > 0) {
      return <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-300">{driver.dispute_count} Dispute{driver.dispute_count !== 1 ? 's' : ''}</span>
    }
    return null
  }
  
  // Transform to display format
  const drivers = allDrivers.map(driver => {
    const documents = (driver as any).documents || []
    const ratings = (driver as any).ratings || []
    const hasPendingDocs = documents.some((d: any) => d.status === 'pending')
    const hasUnverifiedRatings = ratings.some((r: any) => !r.verified_at)
    
    return {
      ...driver,
      id: driver.id.toString(),
      full_name: driver.user?.full_name || '',
      email: driver.user?.email || '',
      phone: '',
      joinedDate: driver.created_at,
      verificationStatus: driver.is_verified 
        ? 'VERIFIED' as const
        : hasPendingDocs || hasUnverifiedRatings
          ? 'PENDING' as const
          : 'INCOMPLETE' as const,
      has_pending_documents: hasPendingDocs,
      verification_notes: (driver as any).verification_notes,
      totalCars: (driver as any).cars_count || 0,
      totalTrips: 0,
      totalEarnings: 0,
      rating: driver.is_verified && ratings.length > 0
        ? Number((ratings.reduce((sum: number, r: any) => sum + Number(r.rating), 0) / ratings.length).toFixed(1))
        : 0,
      documentsSubmitted: documents.length,
      documentsTotal: 4,
    }
  })

  const filteredDrivers = drivers.filter(driver => {
    if (filter === 'all') return true
    if (filter === 'verified') return driver.verificationStatus === 'VERIFIED'
    
    const driverData = allDrivers.find(d => d.id.toString() === driver.id)
    const hasRejectionNotes = driverData ? !driverData.is_verified && !!driverData.verification_notes : false
    const hasPendingDocs = driverData ? (driverData as any).has_pending_documents : false
    
    // Rejected filter - has verification_notes but no pending documents (truly rejected, not re-submitted)
    if (filter === 'rejected') {
      return hasRejectionNotes && !hasPendingDocs
    }
    // Pending filter - has pending documents OR no verification_notes (new submission or re-submission)
    if (filter === 'pending') {
      return !driver.is_verified && (hasPendingDocs || !hasRejectionNotes) && 
        (driver.verificationStatus === 'PENDING' || driver.verificationStatus === 'INCOMPLETE')
    }
    return true
  })

  const stats = {
    total: drivers.length,
    pending: drivers.filter(d => {
      const driverData = allDrivers.find(dd => dd.id.toString() === d.id)
      const hasRejectionNotes = driverData ? !driverData.is_verified && !!driverData.verification_notes : false
      const hasPendingDocs = driverData ? (driverData as any).has_pending_documents : false
      return !d.is_verified && (hasPendingDocs || !hasRejectionNotes) && 
        (d.verificationStatus === 'PENDING' || d.verificationStatus === 'INCOMPLETE')
    }).length,
    verified: drivers.filter(d => d.verificationStatus === 'VERIFIED').length,
    rejected: allDrivers.filter(d => {
      const hasRejectionNotes = !d.is_verified && !!d.verification_notes
      const hasPendingDocs = (d as any).has_pending_documents
      return hasRejectionNotes && !hasPendingDocs
    }).length,
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'INCOMPLETE':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <CheckCircleIcon />
      case 'PENDING':
        return <ClockIcon />
      case 'REJECTED':
        return <XCircleIcon />
      case 'INCOMPLETE':
        return <DocumentIcon />
      default:
        return <DocumentIcon />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader 
        title="Driver Management"
        subtitle="Review and manage driver verifications"
        backUrl="/admin/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Drivers</h1>
            <Button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card
                className={`p-6 rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-sm cursor-pointer transition-all duration-150 ${filter === 'all' ? 'ring-2 ring-offset-2 ring-teal-200' : ''}`}
                onClick={() => setFilter('all')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Drivers</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white"><UserGroupIcon /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card
                className={`p-6 rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-sm cursor-pointer transition-all duration-150 ${filter === 'pending' ? 'ring-2 ring-offset-2 ring-teal-200' : ''}`}
                onClick={() => setFilter('pending')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Pending Review</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white"><ClockIcon /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card
                className={`p-6 rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-sm cursor-pointer transition-all duration-150 ${filter === 'verified' ? 'ring-2 ring-offset-2 ring-teal-200' : ''}`}
                onClick={() => setFilter('verified')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Verified</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.verified}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircleIcon /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card
                className={`p-6 rounded-2xl bg-white text-gray-900 border border-gray-200 shadow-sm cursor-pointer transition-all duration-150 ${filter === 'rejected' ? 'ring-2 ring-offset-2 ring-teal-200' : ''}`}
                onClick={() => setFilter('rejected')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Rejected</p>
                      <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white"><XCircleIcon /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Drivers List */}
          <Card className="border border-gray-200 shadow-sm rounded-xl bg-white text-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900">
                    {filter === 'all' && 'All Drivers'}
                    {filter === 'pending' && 'Pending Verifications'}
                    {filter === 'verified' && 'Verified Drivers'}
                    {filter === 'rejected' && 'Rejected Applications'}
                  </CardTitle>
                  <span className="text-sm text-gray-700">
                    {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                <div className="w-12 h-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-700">Loading drivers...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredDrivers.map((driver, index) => (
                  <motion.div
                    key={driver.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                  <div className="p-6 bg-white border-b border-gray-200 transition-colors text-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {driver.full_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{driver.full_name}</h3>
                            <div className="text-sm text-gray-700 space-y-1">
                            <p className="text-gray-700">{driver.email}</p>
                            <p className="text-gray-700">{driver.user?.city?.name || 'N/A'}, {driver.user?.city?.region || ''}</p>
                            <p className="text-gray-700">Joined {new Date(driver.joinedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.verificationStatus)}`}>
                          <span className="w-4 h-4">{getStatusIcon(driver.verificationStatus)}</span> {driver.verificationStatus}
                          </span>
                          {getSuspensionBadge(driver)}
                          <span className="text-xs text-gray-600">
                            Documents: {driver.documentsSubmitted}/{driver.documentsTotal}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700">Cars</p>
                          <p className="text-lg font-bold text-gray-900">{driver.totalCars}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700">Trips</p>
                          <p className="text-lg font-bold text-gray-900">{driver.totalTrips}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700">Earnings</p>
                          <p className="text-lg font-bold text-gray-900">
                            {driver.totalEarnings > 0 ? `${(driver.totalEarnings / 1000).toFixed(0)}k` : '0'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700">Rating</p>
                          <p className="text-lg font-bold text-gray-900">
                          {driver.rating > 0 ? `${driver.rating}` : 'New'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link href={`/admin/drivers/${driver.id}`} className="flex-1">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                            {driver.verificationStatus === 'PENDING' || driver.verificationStatus === 'INCOMPLETE' 
                            ? 'Review Documents'
                            : 'View Profile'
                            }
                          </Button>
                        </Link>
                        <Button variant="outline" className="px-6">
                        Contact
                        </Button>
                      </div>
                  </div>
                  </motion.div>
                ))}

                  {filteredDrivers.length === 0 && (
                    <div className="text-center py-12">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 4c0-1.657 1.343-3 3-3h2v6h-2c-1.657 0-3-1.343-3-3zm-8 0c0-1.657 1.343-3 3-3h2v6H11c-1.657 0-3-1.343-3-3zm-4 6v10h16V10H4zm3 6h2v-2H7v2zm8 0h2v-2h-2v2z" />
                    </svg>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No drivers found
                      </h3>
                      <p className="text-gray-600">
                        {isLoading ? 'Loading...' : 'No drivers match the selected filter'}
                      </p>
                    </div>
                  )}
                </div>
              )}
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}