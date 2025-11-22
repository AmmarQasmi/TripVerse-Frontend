'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminApi } from '@/lib/api/admin.api'
import { Driver } from '@/types/api'

export default function AdminDriversPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [pendingDrivers, setPendingDrivers] = useState<Driver[]>([])
  const [verifiedDrivers, setVerifiedDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const [pending, verified] = await Promise.all([
          adminApi.getPendingDrivers(),
          adminApi.getVerifiedDrivers(),
        ])
        setPendingDrivers(pending)
        setVerifiedDrivers(verified)
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load drivers')
        console.error('Error fetching drivers:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDrivers()
  }, [])

  // Combine all drivers for filtering
  const allDrivers = [...pendingDrivers, ...verifiedDrivers]
  
  // Transform to display format
  const drivers = allDrivers.map(driver => {
    const hasPendingDocs = driver.documents.some(d => d.status === 'pending')
    const hasUnverifiedRatings = driver.ratings.some(r => !r.verified_at)
    
    return {
      ...driver, // Keep original driver data for detail page
      id: driver.id.toString(),
      full_name: driver.user.full_name,
      email: driver.user.email,
      phone: '', // Not available in backend response
      joinedDate: driver.created_at,
      verificationStatus: driver.is_verified 
        ? 'VERIFIED' as const
        : hasPendingDocs || hasUnverifiedRatings
          ? 'PENDING' as const
          : 'INCOMPLETE' as const,
      totalCars: driver.cars?.length || 0,
      totalTrips: 0, // TODO: Calculate from bookings when available
      totalEarnings: 0, // TODO: Calculate from bookings when available
      rating: driver.is_verified && driver.ratings.length > 0
        ? Number((driver.ratings.reduce((sum, r) => sum + Number(r.rating), 0) / driver.ratings.length).toFixed(1))
        : 0,
      documentsSubmitted: driver.documents.length,
      documentsTotal: 4, // Required documents: license, cnic, vehicle_registration, insurance
    }
  })

  const filteredDrivers = drivers.filter(driver => {
    if (filter === 'all') return true
    if (filter === 'pending') return driver.verificationStatus === 'PENDING' || driver.verificationStatus === 'INCOMPLETE'
    if (filter === 'verified') return driver.verificationStatus === 'VERIFIED'
    // Rejected filter - drivers with verification_notes but not verified are considered rejected
    if (filter === 'rejected') {
      const driverData = allDrivers.find(d => d.id.toString() === driver.id)
      return driverData ? !driverData.is_verified && !!driverData.verification_notes : false
    }
    return true
  })

  const stats = {
    total: drivers.length,
    pending: drivers.filter(d => d.verificationStatus === 'PENDING' || d.verificationStatus === 'INCOMPLETE').length,
    verified: drivers.filter(d => d.verificationStatus === 'VERIFIED').length,
    rejected: allDrivers.filter(d => !d.is_verified && !!d.verification_notes).length,
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
        return '✅'
      case 'PENDING':
        return '⏳'
      case 'REJECTED':
        return '❌'
      case 'INCOMPLETE':
        return '📄'
      default:
        return '📄'
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2">
                  Driver Management
                </h1>
                <p className="text-lg text-gray-300">
                  Review and manage driver verifications
                </p>
              </div>
              <Button
                onClick={() => {
                  setIsLoading(true)
                  adminApi.getPendingDrivers().then(setPendingDrivers).catch(console.error)
                  adminApi.getVerifiedDrivers().then(setVerifiedDrivers).catch(console.error).finally(() => setIsLoading(false))
                }}
                variant="outline"
                disabled={isLoading}
              >
                🔄 Refresh
              </Button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="mt-2"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'all' 
                    ? 'bg-blue-500/20 border-2 border-blue-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('all')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Total Drivers</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
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
              <Card 
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'pending' 
                    ? 'bg-yellow-500/20 border-2 border-yellow-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('pending')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Pending Review</p>
                      <p className="text-3xl font-bold text-white">{stats.pending}</p>
                    </div>
                    <div className="text-4xl">⏳</div>
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
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'verified' 
                    ? 'bg-green-500/20 border-2 border-green-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('verified')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Verified</p>
                      <p className="text-3xl font-bold text-white">{stats.verified}</p>
                    </div>
                    <div className="text-4xl">✅</div>
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
                className={`shadow-lg cursor-pointer transition-all duration-300 ${
                  filter === 'rejected' 
                    ? 'bg-red-500/20 border-2 border-red-500' 
                    : 'bg-white/10 backdrop-blur-md border-white/20'
                }`}
                onClick={() => setFilter('rejected')}
              >
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-300">Rejected</p>
                      <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                    </div>
                    <div className="text-4xl">❌</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Drivers List */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {filter === 'all' && 'All Drivers'}
                  {filter === 'pending' && 'Pending Verifications'}
                  {filter === 'verified' && 'Verified Drivers'}
                  {filter === 'rejected' && 'Rejected Applications'}
                </CardTitle>
                <span className="text-sm text-gray-500">
                  {filteredDrivers.length} driver{filteredDrivers.length !== 1 ? 's' : ''}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4 animate-spin">⏳</div>
                  <p className="text-gray-600">Loading drivers...</p>
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
                    <div className="p-6 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                            {driver.full_name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{driver.full_name}</h3>
                            <div className="text-sm text-gray-600 space-y-1">
                              <p>📧 {driver.email}</p>
                              <p>📍 {driver.user?.city?.name || 'N/A'}, {driver.user?.city?.region || ''}</p>
                              <p>📅 Joined {new Date(driver.joinedDate).toLocaleDateString()}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(driver.verificationStatus)}`}>
                            {getStatusIcon(driver.verificationStatus)} {driver.verificationStatus}
                          </span>
                          <span className="text-xs text-gray-600">
                            Documents: {driver.documentsSubmitted}/{driver.documentsTotal}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Cars</p>
                          <p className="text-lg font-bold text-gray-900">{driver.totalCars}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Trips</p>
                          <p className="text-lg font-bold text-gray-900">{driver.totalTrips}</p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Earnings</p>
                          <p className="text-lg font-bold text-gray-900">
                            {driver.totalEarnings > 0 ? `${(driver.totalEarnings / 1000).toFixed(0)}k` : '0'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600">Rating</p>
                          <p className="text-lg font-bold text-gray-900">
                            {driver.rating > 0 ? `⭐ ${driver.rating}` : 'New'}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex space-x-2">
                        <Link href={`/admin/drivers/${driver.id}`} className="flex-1">
                          <Button className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white">
                            {driver.verificationStatus === 'PENDING' || driver.verificationStatus === 'INCOMPLETE' 
                              ? '📄 Review Documents'
                              : '👁️ View Profile'
                            }
                          </Button>
                        </Link>
                        <Button variant="outline" className="px-6">
                          💬 Contact
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                  {filteredDrivers.length === 0 && (
                    <div className="text-center py-12">
                      <div className="text-6xl mb-4">🚗</div>
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