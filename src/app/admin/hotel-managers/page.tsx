'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/shared/PageHeader'
import { adminApi } from '@/lib/api/admin.api'

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

  const getStatusIcon = (isVerified: boolean, hasNotes: boolean, hasPendingDocs: boolean) => {
    if (isVerified) return '✅'
    if (hasPendingDocs) return '⏳' // Pending takes priority over rejected
    if (hasNotes) return '❌'
    return '⏳'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading hotel managers...</div>
      </div>
    )
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
          <Card className="bg-red-500/20 border-red-500">
            <CardContent className="p-6">
              <p className="text-white">{error}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="text-gray-300 text-sm mt-1">Total Managers</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-yellow-400">{stats.pending}</div>
                <div className="text-gray-300 text-sm mt-1">Pending</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-green-400">{stats.verified}</div>
                <div className="text-gray-300 text-sm mt-1">Verified</div>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-6">
                <div className="text-3xl font-bold text-red-400">{stats.rejected}</div>
                <div className="text-gray-300 text-sm mt-1">Rejected</div>
              </CardContent>
            </Card>
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
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Hotel Managers</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredManagers.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="text-6xl mb-4">🏨</div>
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
                      className="p-6 border border-white/20 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold text-white">{manager.user.full_name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(manager.is_verified, !!manager.verification_notes, manager.has_pending_documents)}`}>
                              {getStatusIcon(manager.is_verified, !!manager.verification_notes, manager.has_pending_documents)} {getStatusText(manager.is_verified, !!manager.verification_notes, manager.has_pending_documents)}
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

