'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { adminApi } from '@/lib/api/admin.api'
import { CheckCircleIcon, ClockIcon, XCircleIcon, UserGroupIcon, BuildingIcon } from '@/components/admin/AdminIcons'

interface HotelManager {
  id: number
  user: {
    id: number
    email: string
    full_name: string
    status: string
    city: {
      id: number
      name: string
      region: string
    }
  }
  is_verified: boolean
  verified_at: string | null
  verification_notes: string | null
  hotels_count: number
  active_hotels_count: number
  has_pending_documents: boolean
  documents: Array<{
    id: number
    document_type: string
    status: string
    uploaded_at: string
    reviewed_at: string | null
  }>
  created_at: string
}

export default function AdminHotelManagersPage() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')
  const [hotelManagers, setHotelManagers] = useState<HotelManager[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHotelManagers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response: any = await adminApi.getAllHotelManagers()
        setHotelManagers((response?.data || []) as HotelManager[])
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load hotel managers')
        console.error('Error fetching hotel managers:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHotelManagers()
  }, [])

  const filteredManagers = hotelManagers.filter(manager => {
    if (filter === 'all') return true
    if (filter === 'verified') return manager.is_verified
    // Rejected: has verification_notes but no pending documents (truly rejected, not re-submitted)
    if (filter === 'rejected') return !manager.is_verified && manager.verification_notes && !manager.has_pending_documents
    // Pending: has pending documents OR no verification_notes (new submission or re-submission)
    if (filter === 'pending') return !manager.is_verified && (manager.has_pending_documents || !manager.verification_notes)
    return true
  })

  const stats = {
    total: hotelManagers.length,
    pending: hotelManagers.filter(m => !m.is_verified && (m.has_pending_documents || !m.verification_notes)).length,
    verified: hotelManagers.filter(m => m.is_verified).length,
    rejected: hotelManagers.filter(m => !m.is_verified && m.verification_notes && !m.has_pending_documents).length,
  }

  const getStatusColor = (isVerified: boolean, hasNotes: boolean, hasPendingDocs: boolean) => {
    if (isVerified) return 'bg-green-100 text-green-800 border-green-300'
    if (hasPendingDocs) return 'bg-yellow-100 text-yellow-800 border-yellow-300' // Pending takes priority
    if (hasNotes) return 'bg-red-100 text-red-800 border-red-300'
    return 'bg-yellow-100 text-yellow-800 border-yellow-300'
  }

  const getStatusText = (isVerified: boolean, hasNotes: boolean, hasPendingDocs: boolean) => {
    if (isVerified) return 'VERIFIED'
    if (hasPendingDocs) return 'PENDING' // Pending takes priority over rejected
    if (hasNotes) return 'REJECTED'
    return 'PENDING'
  }

  const getStatusIconComponent = (isVerified: boolean, hasNotes: boolean, hasPendingDocs: boolean) => {
    if (isVerified) return <CheckCircleIcon />
    if (hasPendingDocs) return <ClockIcon />
    if (hasNotes) return <XCircleIcon />
    return <ClockIcon />
  }

  if (isLoading) {
    return <PageLoader message="Loading hotel managers..." />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageHeader 
          title="Hotel Manager Management"
          subtitle="Review and manage hotel manager verifications"
          backUrl="/admin/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="bg-red-50 border-red-300">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="Hotel Manager Management"
        subtitle="Review and manage hotel manager verifications"
        backUrl="/admin/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card 
                className={`p-6 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  filter === 'all' 
                    ? 'ring-2 ring-offset-2 ring-blue-300' 
                    : ''
                } border-0`}
                onClick={() => setFilter('all')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">Total Managers</p>
                      <p className="text-3xl font-bold text-white">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-white"><UserGroupIcon /></div>
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
                className={`p-6 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 text-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  filter === 'pending' 
                    ? 'ring-2 ring-offset-2 ring-amber-300' 
                    : ''
                } border-0`}
                onClick={() => setFilter('pending')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">Pending</p>
                      <p className="text-3xl font-bold text-white">{stats.pending}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-amber-100"><ClockIcon /></div>
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
                className={`p-6 rounded-xl bg-gradient-to-br from-green-600 to-green-700 text-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  filter === 'verified' 
                    ? 'ring-2 ring-offset-2 ring-green-300' 
                    : ''
                } border-0`}
                onClick={() => setFilter('verified')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">Verified</p>
                      <p className="text-3xl font-bold text-white">{stats.verified}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-emerald-100"><CheckCircleIcon /></div>
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
                className={`p-6 rounded-xl bg-gradient-to-br from-red-600 to-red-700 text-white overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  filter === 'rejected' 
                    ? 'ring-2 ring-offset-2 ring-red-300' 
                    : ''
                } border-0`}
                onClick={() => setFilter('rejected')}
              >
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white/80">Rejected</p>
                      <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-white/20 flex items-center justify-center text-pink-100"><XCircleIcon /></div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6 flex flex-wrap gap-2">
            {(['all', 'pending', 'verified', 'rejected'] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                onClick={() => setFilter(f)}
                className={filter === f ? 'bg-cyan-600 hover:bg-cyan-700' : ''}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>

          {/* Hotel Managers List */}
          <Card className="border-2 border-white/20 shadow-md rounded-xl bg-white/5">
              <CardHeader>
                <CardTitle className="text-white">Hotel Managers</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredManagers.length === 0 ? (
                  <div className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                    <h3 className="text-xl font-semibold text-white mb-2">No Hotel Managers Found</h3>
                    <p className="text-gray-300">
                      {filter === 'all' 
                        ? 'No hotel managers registered yet.' 
                        : `No hotel managers with status "${filter}"`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredManagers.map((manager) => (
                      <motion.div
                        key={manager.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                      <div className="p-6 bg-white/5 border-2 border-white/10 rounded-lg hover:border-white/20 transition-colors text-white">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-white">{manager.user.full_name}</h3>
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(manager.is_verified, !!manager.verification_notes, manager.has_pending_documents)}`}>
                                <span className="w-4 h-4">{getStatusIconComponent(manager.is_verified, !!manager.verification_notes, manager.has_pending_documents)}</span> {getStatusText(manager.is_verified, !!manager.verification_notes, manager.has_pending_documents)}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-300 mb-4">
                                  <div>
                                    <span className="font-semibold">Email:</span> {manager.user.email}
                                  </div>
                                  <div>
                                    <span className="font-semibold">City:</span> {manager.user.city.name}, {manager.user.city.region}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Hotels:</span> {manager.active_hotels_count} active / {manager.hotels_count} total
                                  </div>
                                  <div>
                                    <span className="font-semibold">Documents:</span> {manager.documents.length} submitted
                                  </div>
                                  {manager.verified_at && (
                                    <div>
                                      <span className="font-semibold">Verified:</span> {new Date(manager.verified_at).toLocaleDateString()}
                                    </div>
                                  )}
                                  {manager.verification_notes && (
                                    <div className="col-span-2">
                                      <span className="font-semibold">Notes:</span> {manager.verification_notes}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="ml-4">
                                <Link href={`/admin/hotel-managers/${manager.id}`}>
                                  <Button variant="outline">
                                    View Details
                                  </Button>
                                </Link>
                              </div>
                            </div>
                      </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

