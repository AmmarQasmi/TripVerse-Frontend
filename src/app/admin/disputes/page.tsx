'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { useDisputesAdmin } from '@/features/admin/useDisputesAdmin'

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  const [fineAmount, setFineAmount] = useState<string>('')

  const { disputes, isLoading, resolveDispute } = useDisputesAdmin()

  const filteredDisputes =
    disputes?.filter((dispute: any) => {
      const id = String(dispute.id)
      const bookingId = String(dispute.booking_car_id || dispute.booking_hotel_id || '')
      const matchesSearch =
        id.includes(searchQuery) ||
        bookingId.includes(searchQuery) ||
        (dispute.description &&
          dispute.description.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter
      const matchesCategory = categoryFilter === 'all' ||
        dispute.category === categoryFilter ||
        dispute.extra_categories?.includes(categoryFilter) ||
        dispute.score_breakdown?.extra_categories?.includes(categoryFilter)
      const matchesFlagged = !flaggedOnly || dispute.flagged_for_manual_review
      return matchesSearch && matchesStatus && matchesCategory && matchesFlagged
    }) || []

  const handleResolveDispute = async (disputeId: string) => {
    if (!resolution.trim()) {
      alert('Please provide a resolution.')
      return
    }
    try {
      await resolveDispute({
        disputeId,
        resolution,
        fine_amount: fineAmount ? parseFloat(fineAmount) : undefined,
      })
      setSelectedDispute(null)
      setResolution('')
      setFineAmount('')
    } catch (error) {
      console.error('Failed to resolve dispute:', error)
    }
  }

  const openDispute = (dispute: any) => {
    setSelectedDispute(dispute)
    const suggestedFine = dispute?.score_breakdown?.suggested_fine
    setFineAmount(suggestedFine !== undefined && suggestedFine > 0 ? String(suggestedFine) : '')
  }

  const getSeverityColor = (score: number) => {
    if (score <= 0) return 'bg-gray-100 text-gray-600'
    if (score <= 5) return 'bg-yellow-100 text-yellow-700'
    if (score <= 9) return 'bg-orange-100 text-orange-700'
    return 'bg-red-100 text-red-700'
  }

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, string> = {
      service: '⭐',
      pricing: '💰',
      cleanliness: '🧹',
      safety: '🚨',
      fraud: '🔒',
      harassment: '😤',
      rash_driving: '💨',
      verbal_abuse: '🗣️',
    }
    return icons[cat] || '📋'
  }

  const getFineTierLabel = (score: number) => {
    if (score <= 3)  return { label: 'Tier 1 — Warning Only',             color: 'bg-gray-100 text-gray-600' }
    if (score <= 6)  return { label: 'Tier 2 — Minor (PKR 500)',          color: 'bg-yellow-100 text-yellow-700' }
    if (score <= 9)  return { label: 'Tier 3 — Moderate (PKR 1,000)',    color: 'bg-orange-100 text-orange-700' }
    if (score <= 12) return { label: 'Tier 4 — Serious (PKR 2,500)',     color: 'bg-red-100 text-red-700' }
    return { label: 'Tier 5 — Severe (PKR 5,000)', color: 'bg-red-200 text-red-900' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <PageHeader
          title="Dispute Management"
          subtitle="Review and resolve customer disputes"
          backUrl="/admin/dashboard"
          backLabel="Back to Dashboard"
        />
        <PageLoader message="Loading disputes..." variant="skeleton" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        title="Dispute Management"
        subtitle="Review and resolve customer disputes"
        backUrl="/admin/dashboard"
        backLabel="Back to Dashboard"
      />

      <div className="container mx-auto px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <Input
              label="Search Disputes"
              placeholder="Search by ID, booking ID, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="md:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div className="md:w-40">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="service">⭐ Service</option>
              <option value="pricing">💰 Pricing</option>
              <option value="cleanliness">🧹 Cleanliness</option>
              <option value="safety">🚨 Safety</option>
              <option value="fraud">🔒 Fraud</option>
              <option value="harassment">😤 Harassment</option>
              <option value="rash_driving">💨 Rash Driving</option>
              <option value="verbal_abuse">🗣️ Verbal Abuse</option>
            </select>
          </div>
          <div className="md:w-44 flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-gray-700 font-medium">🚩 Flagged only</span>
            </label>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Disputes', value: disputes?.length || 0, icon: '⚠️', delay: 0.1 },
            { label: 'Pending Review', value: disputes?.filter((d: any) => d.status === 'pending').length || 0, icon: '🔴', delay: 0.2 },
            { label: 'Flagged', value: disputes?.filter((d: any) => d.flagged_for_manual_review).length || 0, icon: '🚩', delay: 0.3 },
            { label: 'Resolved', value: disputes?.filter((d: any) => d.status === 'resolved').length || 0, icon: '✅', delay: 0.4 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
            >
              <Card className="relative p-6 rounded-2xl shadow-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-700 text-white overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-emerald-100/90">{stat.label}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className="text-4xl">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Disputes List */}
        <div className="space-y-4">
          {filteredDisputes.length > 0 ? (
            filteredDisputes.map((dispute: any) => (
              <div
                key={dispute.id}
                className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500"
              >
                <Card className="hover:shadow-md transition-shadow bg-white rounded-xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Badges row */}
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className="font-semibold text-lg">#{dispute.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}
                          >
                            {dispute.status?.toUpperCase()}
                          </span>
                          {/* Primary category */}
                          {dispute.category && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              {getCategoryIcon(dispute.category)} {dispute.category}
                            </span>
                          )}
                          {/* Extra categories */}
                          {(dispute.extra_categories || dispute.score_breakdown?.extra_categories)?.map((cat: string) => (
                            <span key={cat} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              {getCategoryIcon(cat)} {cat}
                            </span>
                          ))}
                          {dispute.severity_score !== undefined && (
                            <span
                              className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getSeverityColor(dispute.severity_score)}`}
                            >
                              Score: {dispute.severity_score}
                            </span>
                          )}
                          {dispute.flagged_for_manual_review && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold animate-pulse">
                              🚩 Needs Review
                            </span>
                          )}
                          {dispute.automated_action && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Auto: {dispute.automated_action.replace(/_/g, ' ')}
                            </span>
                          )}
                          {dispute.automated_action_applied && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              ✅ Applied
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{dispute.description}</p>

                        {/* Meta */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Booking:</span>{' '}
                            #{dispute.booking_car_id || dispute.booking_hotel_id}{' '}
                            ({dispute.booking_car_id ? '🚗 Car' : '🏨 Hotel'})
                          </div>
                          <div>
                            <span className="font-medium">Filed:</span>{' '}
                            {formatDate(dispute.created_at)}
                          </div>
                          {dispute.incident_at && (
                            <div>
                              <span className="font-medium">Incident:</span>{' '}
                              {formatDate(dispute.incident_at)}
                            </div>
                          )}
                        </div>

                        {dispute.resolution && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg">
                            <h5 className="font-medium text-green-900 mb-1">Resolution:</h5>
                            <p className="text-sm text-green-800">{dispute.resolution}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="ml-6 flex flex-col gap-2 shrink-0">
                        {dispute.status === 'pending' && (
                          <Button size="sm" onClick={() => openDispute(dispute)}>
                            Resolve
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDispute(dispute)}
                        >
                          Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))
          ) : (
            <div className="rounded-xl p-[1px] bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500">
              <Card className="bg-white rounded-xl">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-500 text-lg mb-4">⚠️ No disputes found</div>
                  <p className="text-gray-600">
                    {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || flaggedOnly
                      ? 'No disputes match your search criteria.'
                      : 'No disputes have been reported yet.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Resolution / Detail Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Dispute #{selectedDispute.id}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedDispute(null)}>
                    ✕
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ──── Customer's Submission ──── */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800">📋 Customer's Complaint</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDispute.category && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        {getCategoryIcon(selectedDispute.category)} {selectedDispute.category}
                      </span>
                    )}
                    {(selectedDispute.extra_categories || selectedDispute.score_breakdown?.extra_categories)?.map((cat: string) => (
                      <span key={cat} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                        {getCategoryIcon(cat)} {cat}
                      </span>
                    ))}
                  </div>
                  {selectedDispute.incident_at && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">⏰ Incident at:</span>{' '}{formatDate(selectedDispute.incident_at)}
                    </p>
                  )}
                  <div className="bg-white rounded p-3 border border-blue-100">
                    <p className="text-xs text-blue-500 font-medium mb-1">Customer's statement:</p>
                    <p className="text-sm text-gray-800">{selectedDispute.description}</p>
                  </div>
                  {selectedDispute.attachments?.length > 0 && (
                    <div>
                      <p className="text-xs text-blue-600 font-medium mb-1">
                        Evidence ({selectedDispute.attachments.length} file{selectedDispute.attachments.length !== 1 ? 's' : ''}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDispute.attachments.map((att: any, idx: number) => (
                          <a key={idx} href={att.file_url} target="_blank" rel="noopener noreferrer">
                            {att.file_type?.startsWith('image/') ? (
                              <img src={att.file_url} alt={`Evidence ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border border-blue-200 hover:opacity-80 transition" />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-500 text-center">
                                🎥<br/>Video
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-400">
                    Booking: #{selectedDispute.booking_car_id || selectedDispute.booking_hotel_id}{' '}
                    ({selectedDispute.booking_car_id ? '🚗 Car' : '🏨 Hotel'}) • Filed {formatDate(selectedDispute.created_at)}
                  </p>
                </div>

                {/* ──── Scoring Summary ──── */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Primary + extra categories */}
                    {selectedDispute.category && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        {getCategoryIcon(selectedDispute.category)} {selectedDispute.category}
                      </span>
                    )}
                    {(selectedDispute.extra_categories || selectedDispute.score_breakdown?.extra_categories)?.map((cat: string) => (
                      <span key={cat} className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        {getCategoryIcon(cat)} {cat}
                      </span>
                    ))}
                    {selectedDispute.severity_score !== undefined && (
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full font-semibold ${getSeverityColor(selectedDispute.severity_score)}`}
                      >
                        Score: {selectedDispute.severity_score}
                      </span>
                    )}
                    {selectedDispute.flagged_for_manual_review && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        🚩 Needs Manual Review
                      </span>
                    )}
                    {selectedDispute.automated_action && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                        Recommendation: {selectedDispute.automated_action.replace(/_/g, ' ')}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Description:</span> {selectedDispute.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Booking:</span> #
                    {selectedDispute.booking_car_id || selectedDispute.booking_hotel_id}{' '}
                    ({selectedDispute.booking_car_id ? '🚗 Car' : '🏨 Hotel'})
                  </p>
                  {selectedDispute.incident_at && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Incident at:</span>{' '}
                      {formatDate(selectedDispute.incident_at)}
                    </p>
                  )}

                  {/* Score breakdown if available */}
                  {selectedDispute.score_breakdown?.reasons?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1 mt-2">Scoring Reasons:</p>
                      <ul className="text-xs text-gray-600 space-y-0.5">
                        {selectedDispute.score_breakdown.reasons.map((r: string, i: number) => (
                          <li key={i} className="flex gap-1">
                            <span>•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedDispute.score_breakdown?.flags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedDispute.score_breakdown.flags.map((f: string) => (
                        <span key={f} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          {f.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resolve form */}
                {selectedDispute.status === 'pending' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Resolution <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Describe the action taken and reason for any penalty..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fine Amount (PKR)
                      </label>
                      {selectedDispute.score_breakdown?.suggested_fine !== undefined && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-700 flex flex-wrap items-center gap-2">
                          <span>🤖 System suggests <strong>PKR {Number(selectedDispute.score_breakdown.suggested_fine).toLocaleString()}</strong> (score: {selectedDispute.severity_score})</span>
                          {selectedDispute.severity_score !== undefined && (
                            <span className={`px-2 py-0.5 rounded-full font-medium ${getFineTierLabel(selectedDispute.severity_score).color}`}>
                              {getFineTierLabel(selectedDispute.severity_score).label}
                            </span>
                          )}
                        </div>
                      )}
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={fineAmount}
                        onChange={(e) => setFineAmount(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {fineAmount && Number(fineAmount) > 0 && (
                        <p className="text-xs text-amber-600 mt-1">
                          PKR {Number(fineAmount).toLocaleString()} will be deducted from provider's wallet and credited to admin.
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button
                        onClick={() => handleResolveDispute(String(selectedDispute.id))}
                        className="flex-1"
                        disabled={!resolution.trim()}
                      >
                        Resolve Dispute
                      </Button>
                      <Button variant="outline" onClick={() => { setSelectedDispute(null); setFineAmount('') }} className="flex-1">
                        Close
                      </Button>
                    </div>
                  </>
                )}

                {selectedDispute.status !== 'pending' && (
                  <Button variant="outline" onClick={() => { setSelectedDispute(null); setFineAmount('') }} className="w-full">
                    Close
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
