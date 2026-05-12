'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/shared/PageHeader'
import { PageLoader } from '@/components/shared/PageLoader'
import { ListRowsSkeletonGrid } from '@/components/admin/SkeletonLoaders'
import { useAdminDisputes, useResolveDispute } from '@/features/admin/useAdminQueries'
import { 
  ServiceIcon, PricingIcon, CleanlinessIcon, SafetyIcon, 
  FraudIcon, HarassmentIcon, RashDrivingIcon, VerbalAbuseIcon,
  AlertIcon, FlagIcon, CheckCircleIcon, ClockIcon, XCircleIcon
} from '@/components/admin/AdminIcons'

export default function AdminDisputesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [flaggedOnly, setFlaggedOnly] = useState(false)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolution, setResolution] = useState('')
  const [fineAmount, setFineAmount] = useState<string>('')

  const { data: disputes, isLoading } = useAdminDisputes()
  const resolveDisputeMutation = useResolveDispute()

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
      await resolveDisputeMutation.mutateAsync({
        disputeId: parseInt(disputeId),
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
    if (score <= 0) return 'bg-white/5 text-gray-300'
    if (score <= 5) return 'bg-yellow-600/10 text-yellow-300'
    if (score <= 9) return 'bg-orange-600/10 text-orange-300'
    return 'bg-red-600/10 text-red-300'
  }

  const getCategoryIcon = (cat: string) => {
    const icons: Record<string, any> = {
      service: <ServiceIcon />,
      pricing: <PricingIcon />,
      cleanliness: <CleanlinessIcon />,
      safety: <SafetyIcon />,
      fraud: <FraudIcon />,
      harassment: <HarassmentIcon />,
      rash_driving: <RashDrivingIcon />,
      verbal_abuse: <VerbalAbuseIcon />,
    }
    return icons[cat] || null
  }

  const getFineTierLabel = (score: number) => {
    if (score <= 3)  return { label: 'Tier 1 — Warning Only',             color: 'bg-white/5 text-gray-300' }
    if (score <= 6)  return { label: 'Tier 2 — Minor (PKR 500)',          color: 'bg-yellow-600/10 text-yellow-300' }
    if (score <= 9)  return { label: 'Tier 3 — Moderate (PKR 1,000)',    color: 'bg-orange-600/10 text-orange-300' }
    if (score <= 12) return { label: 'Tier 4 — Serious (PKR 2,500)',     color: 'bg-red-600/10 text-red-300' }
    return { label: 'Tier 5 — Severe (PKR 5,000)', color: 'bg-red-700/20 text-red-200' }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-600/10 text-yellow-300'
      case 'resolved': return 'bg-green-600/10 text-green-300'
      case 'rejected': return 'bg-red-600/10 text-red-300'
      default: return 'bg-white/5 text-gray-300'
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
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="service">Service</option>
              <option value="pricing">Pricing</option>
              <option value="cleanliness">Cleanliness</option>
              <option value="safety">Safety</option>
              <option value="fraud">Fraud</option>
              <option value="harassment">Harassment</option>
              <option value="rash_driving">Rash Driving</option>
              <option value="verbal_abuse">Verbal Abuse</option>
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
              <span className="flex items-center gap-1.5 text-gray-700 font-medium"><FlagIcon /> Flagged only</span>
            </label>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Disputes', value: disputes?.length || 0, Icon: AlertIcon, color: 'bg-white text-gray-900 border border-gray-200', iconBg: 'bg-red-500', delay: 0.1 },
            { label: 'Pending Review', value: disputes?.filter((d: any) => d.status === 'pending').length || 0, Icon: ClockIcon, color: 'bg-white text-gray-900 border border-gray-200', iconBg: 'bg-amber-500', delay: 0.2 },
            { label: 'Flagged', value: disputes?.filter((d: any) => d.flagged_for_manual_review).length || 0, Icon: FlagIcon, color: 'bg-white text-gray-900 border border-gray-200', iconBg: 'bg-purple-500', delay: 0.3 },
            { label: 'Resolved', value: disputes?.filter((d: any) => d.status === 'resolved').length || 0, Icon: CheckCircleIcon, color: 'bg-white text-gray-900 border border-gray-200', iconBg: 'bg-green-500', delay: 0.4 },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stat.delay }}
            >
              <Card className={`p-6 rounded-2xl ${stat.color} overflow-hidden cursor-pointer transition-all duration-150 shadow-sm`}>
                <CardContent className="p-0">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full ${stat.iconBg} flex items-center justify-center text-white`}><stat.Icon /></div>
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
                className="border border-gray-200 rounded-lg"
              >
                <Card className="border-0 bg-white transition-shadow text-gray-700">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {/* Badges row */}
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className="font-semibold text-lg text-gray-900">#{dispute.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(dispute.status)}`}
                          >
                            {dispute.status?.toUpperCase()}
                          </span>
                          {/* Primary category */}
                          {dispute.category && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                              <span className="w-4 h-4">{getCategoryIcon(dispute.category)}</span> {dispute.category}
                            </span>
                          )}
                          {/* Extra categories */}
                          {(dispute.extra_categories || dispute.score_breakdown?.extra_categories)?.map((cat: string) => (
                            <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                              <span className="w-4 h-4">{getCategoryIcon(cat)}</span> {cat}
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-semibold animate-pulse">
                              <FlagIcon /> Needs Review
                            </span>
                          )}
                          {dispute.automated_action && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded-full">
                              Auto: {dispute.automated_action.replace(/_/g, ' ')}
                            </span>
                          )}
                          {dispute.automated_action_applied && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                              <CheckCircleIcon /> Applied
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
                            ({dispute.booking_car_id ? 'Car' : 'Hotel'})
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
                          {dispute.booking?.financials?.driver_earnings !== undefined && (
                            <div>
                              <span className="font-medium">Driver earned:</span>{' '}
                              PKR {Number(dispute.booking.financials.driver_earnings).toLocaleString()}
                            </div>
                          )}
                        </div>

                        {dispute.resolution && (
                          <div className="mt-4 p-3 bg-green-50 border border-green-300 rounded-lg">
                            <h5 className="font-medium text-green-700 mb-1">Resolution:</h5>
                            <p className="text-sm text-green-600">{dispute.resolution}</p>
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
            <Card className="border border-gray-200 bg-white rounded-lg">
                <CardContent className="p-12 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 text-gray-400"><AlertIcon /></div>
                  <p className="text-gray-600">
                    {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' || flaggedOnly
                      ? 'No disputes match your search criteria.'
                      : 'No disputes have been reported yet.'}
                  </p>
                </CardContent>
              </Card>
          )}
        </div>

        {/* Resolution / Detail Modal */}
        {selectedDispute && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-gray-900">Dispute #{selectedDispute.id}</CardTitle>
                  <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600 text-xl">
                    ×
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* ──── Customer's Submission ──── */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                  <h4 className="text-sm font-semibold text-blue-800">Customer's Complaint</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDispute.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                        <span className="w-4 h-4">{getCategoryIcon(selectedDispute.category)}</span> {selectedDispute.category}
                      </span>
                    )}
                    {(selectedDispute.extra_categories || selectedDispute.score_breakdown?.extra_categories)?.map((cat: string) => (
                      <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full font-medium">
                        <span className="w-4 h-4">{getCategoryIcon(cat)}</span> {cat}
                      </span>
                    ))}
                  </div>
                  {selectedDispute.incident_at && (
                    <p className="text-xs text-gray-600">
                      <span className="font-medium">Incident at:</span>{' '}{formatDate(selectedDispute.incident_at)}
                    </p>
                  )}
                  <div className="bg-gray-50 rounded p-3 border border-gray-200">
                    <p className="text-xs text-blue-800 font-medium mb-1">Customer's statement:</p>
                    <p className="text-sm text-gray-700">{selectedDispute.description}</p>
                  </div>
                  {selectedDispute.attachments?.length > 0 && (
                    <div>
                      <p className="text-xs text-blue-800 font-medium mb-1">
                        Evidence ({selectedDispute.attachments.length} file{selectedDispute.attachments.length !== 1 ? 's' : ''}):
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedDispute.attachments.map((att: any, idx: number) => (
                          <a key={idx} href={att.file_url} target="_blank" rel="noopener noreferrer">
                            {att.file_type?.startsWith('image/') ? (
                              <img src={att.file_url} alt={`Evidence ${idx + 1}`}
                                className="w-16 h-16 object-cover rounded border border-gray-300 hover:opacity-80 transition" />
                            ) : (
                              <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded border text-xs text-gray-600 text-center">
                                Video
                              </div>
                            )}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-xs text-gray-600">
                    Booking: #{selectedDispute.booking_car_id || selectedDispute.booking_hotel_id}{' '}
                    ({selectedDispute.booking_car_id ? 'Car' : 'Hotel'}) • Filed {formatDate(selectedDispute.created_at)}
                  </p>
                </div>

                {/* ──── Scoring Summary ──── */}
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {/* Primary + extra categories */}
                    {selectedDispute.category && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                        <span className="w-4 h-4">{getCategoryIcon(selectedDispute.category)}</span> {selectedDispute.category}
                      </span>
                    )}
                    {(selectedDispute.extra_categories || selectedDispute.score_breakdown?.extra_categories)?.map((cat: string) => (
                      <span key={cat} className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs rounded-full">
                        <span className="w-4 h-4">{getCategoryIcon(cat)}</span> {cat}
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
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                        <FlagIcon /> Needs Manual Review
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
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">Booking:</span> #
                    {selectedDispute.booking_car_id || selectedDispute.booking_hotel_id}{' '}
                    ({selectedDispute.booking_car_id ? 'Car' : 'Hotel'})
                  </p>
                  {selectedDispute.booking?.financials && (
                    <p className="text-sm text-gray-300">
                      <span className="font-medium">Ride financials:</span>{' '}
                      Total PKR {Number(selectedDispute.booking.financials.total_amount || 0).toLocaleString()}
                      {selectedDispute.booking.financials.driver_earnings !== undefined
                        ? ` • Driver earned PKR ${Number(selectedDispute.booking.financials.driver_earnings).toLocaleString()}`
                        : ''}
                      {selectedDispute.booking.financials.platform_fee !== undefined
                        ? ` • Platform fee PKR ${Number(selectedDispute.booking.financials.platform_fee).toLocaleString()}`
                        : ''}
                    </p>
                  )}
                  {selectedDispute.incident_at && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Incident at:</span>{' '}
                      {formatDate(selectedDispute.incident_at)}
                    </p>
                  )}

                  {/* Score breakdown if available */}
                  {selectedDispute.score_breakdown?.reasons?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-1 mt-2">Scoring Reasons:</p>
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
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Resolution <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={resolution}
                        onChange={(e) => setResolution(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Describe the action taken and reason for any penalty..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Fine Amount (PKR)
                      </label>
                      {selectedDispute.score_breakdown?.suggested_fine !== undefined && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-800 flex flex-wrap items-center gap-2 border border-blue-200">
                          <span>System suggests <strong>PKR {Number(selectedDispute.score_breakdown.suggested_fine).toLocaleString()}</strong> (score: {selectedDispute.severity_score})</span>
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
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                      {fineAmount && Number(fineAmount) > 0 && (
                        <p className="text-xs text-amber-700 mt-1">
                          Customer is refunded immediately. Provider is charged from wallet, and any shortfall becomes debt.
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
