'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { PageHeader } from '@/components/shared/PageHeader'
import { adminApi } from '@/lib/api/admin.api'
import { DocumentViewer } from '@/components/shared/DocumentViewer'

interface HotelManagerDetail {
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
    created_at: string
  }
  is_verified: boolean
  verified_at: string | null
  verification_notes: string | null
  stripe_account_id: string | null
  hotels: Array<{
    id: number
    name: string
    city: {
      id: number
      name: string
    }
    is_active: boolean
    is_listed: boolean
    room_types_count: number
    total_bookings: number
    total_earnings: number
    image: string | null
  }>
  documents: Array<{
    id: number
    document_type: string
    document_url: string
    status: string
    rejection_reason: string | null
    uploaded_at: string
    reviewed_at: string | null
    reviewer: {
      id: number
      full_name: string
      email: string
    } | null
  }>
  created_at: string
  updated_at: string
}

export default function AdminHotelManagerReviewPage() {
  const params = useParams()
  const router = useRouter()
  const managerId = Number(params.id)

  const [manager, setManager] = useState<HotelManagerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<HotelManagerDetail['documents'][0] | null>(null)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activatingHotelId, setActivatingHotelId] = useState<number | null>(null)

  useEffect(() => {
    const fetchManager = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const managerData: any = await adminApi.getHotelManagerDetails(managerId)
        setManager(managerData as HotelManagerDetail)
        if (managerData?.documents && managerData.documents.length > 0) {
          setSelectedDocument(managerData.documents[0])
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load hotel manager data')
        console.error('Error fetching hotel manager:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (managerId) {
      fetchManager()
    }
  }, [managerId])

  const getDocumentName = (type: string) => {
    switch (type) {
      case 'hotel_registration':
        return 'Hotel Registration Certificate'
      case 'business_license':
        return 'Business License'
      case 'tax_certificate':
        return 'Tax Certificate'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-500/20 text-green-400 border border-green-500/30'
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
      case 'rejected':
        return 'bg-red-500/20 text-red-400 border border-red-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return '✅'
      case 'pending':
        return '⏳'
      case 'rejected':
        return '❌'
      default:
        return '📄'
    }
  }

  const handleVerifyManager = async (isVerified: boolean) => {
    if (!isVerified && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    if (!confirm(isVerified 
      ? 'Are you sure you want to approve and verify this hotel manager?'
      : 'Are you sure you want to reject this hotel manager application?'
    )) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await adminApi.verifyHotelManager(managerId, isVerified, rejectionReason || undefined)
      alert(isVerified 
        ? 'Hotel manager verified successfully!'
        : 'Hotel manager application rejected.'
      )
      router.push('/admin/hotel-managers')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update hotel manager verification')
      console.error('Error verifying hotel manager:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleToggleHotelActive = async (hotelId: number, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const action = newStatus ? 'activate' : 'deactivate'
    
    if (!confirm(`Are you sure you want to ${action} this hotel? ${newStatus ? 'It will become visible to customers.' : 'It will be hidden from customers.'}`)) {
      return
    }

    setActivatingHotelId(hotelId)
    setError(null)

    try {
      await adminApi.updateHotel(hotelId, { is_active: newStatus })
      // Refresh manager data to show updated hotel status
      const managerData: any = await adminApi.getHotelManagerDetails(managerId)
      setManager(managerData as HotelManagerDetail)
      alert(`Hotel ${action}d successfully!`)
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} hotel`)
      console.error(`Error ${action}ing hotel:`, err)
    } finally {
      setActivatingHotelId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading hotel manager data...</div>
      </div>
    )
  }

  if (error && !manager) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-white">{error}</p>
            <Button onClick={() => router.push('/admin/hotel-managers')} className="mt-4">
              Back to Hotel Managers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!manager) {
    return null
  }

  const pendingDocuments = manager.documents.filter(d => d.status === 'pending')
  const approvedDocuments = manager.documents.filter(d => d.status === 'approved')
  const rejectedDocuments = manager.documents.filter(d => d.status === 'rejected')
  const requiredDocuments = manager.documents.filter(d => ['hotel_registration', 'business_license'].includes(d.document_type))
  const allRequiredApproved = requiredDocuments.every(d => d.status === 'approved')
  const hasRejectedRequired = requiredDocuments.some(d => d.status === 'rejected')
  // Allow verification if all required docs are either approved or pending (not rejected)
  const canVerify = requiredDocuments.length > 0 && !hasRejectedRequired

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title={`Hotel Manager Review: ${manager.user.full_name}`}
        subtitle="Review hotel manager documents and verification status"
        backUrl="/admin/hotel-managers"
        backLabel="Back to Hotel Managers"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Manager Info */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Manager Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-300 text-sm mb-1">Full Name</p>
                  <p className="text-white font-semibold">{manager.user.full_name}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-1">Email</p>
                  <p className="text-white font-semibold">{manager.user.email}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-1">City</p>
                  <p className="text-white font-semibold">{manager.user.city.name}, {manager.user.city.region}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(manager.is_verified ? 'approved' : 'pending')}`}>
                    {getStatusIcon(manager.is_verified ? 'approved' : 'pending')} {manager.is_verified ? 'VERIFIED' : 'PENDING'}
                  </span>
                </div>
                {manager.verified_at && (
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Verified At</p>
                    <p className="text-white font-semibold">{new Date(manager.verified_at).toLocaleString()}</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-300 text-sm mb-1">Hotels</p>
                  <p className="text-white font-semibold">{manager.hotels.length} hotel(s)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Documents</CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                {pendingDocuments.length} pending, {approvedDocuments.length} approved, {rejectedDocuments.length} rejected
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {manager.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedDocument?.id === doc.id
                        ? 'border-cyan-500 bg-cyan-500/10'
                        : 'border-white/20 bg-white/5 hover:bg-white/10'
                    }`}
                    onClick={() => setSelectedDocument(doc)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-white font-semibold">{getDocumentName(doc.document_type)}</h4>
                        <p className="text-gray-400 text-sm mt-1">
                          Uploaded: {new Date(doc.uploaded_at).toLocaleString()}
                        </p>
                        {doc.reviewed_at && (
                          <p className="text-gray-400 text-sm">
                            Reviewed: {new Date(doc.reviewed_at).toLocaleString()}
                            {doc.reviewer && ` by ${doc.reviewer.full_name}`}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)} {doc.status.toUpperCase()}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            setViewingDocument({ url: doc.document_url, name: getDocumentName(doc.document_type) })
                          }}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                    {doc.rejection_reason && (
                      <div className="mt-3 p-3 bg-red-500/20 border border-red-500/50 rounded">
                        <p className="text-red-200 text-sm">
                          <strong>Rejection Reason:</strong> {doc.rejection_reason}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Hotels */}
          {manager.hotels.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-md border-white/20 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Hotels</CardTitle>
                <p className="text-gray-400 text-sm mt-2">
                  Manage hotel activation status. Only active hotels are visible to customers.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {manager.hotels.map((hotel) => (
                    <div key={hotel.id} className="p-4 border border-white/20 rounded-lg bg-white/5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-semibold">{hotel.name}</h4>
                        <Button
                          onClick={() => handleToggleHotelActive(hotel.id, hotel.is_active)}
                          disabled={activatingHotelId === hotel.id}
                          size="sm"
                          className={
                            hotel.is_active
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }
                        >
                          {activatingHotelId === hotel.id
                            ? 'Updating...'
                            : hotel.is_active
                            ? 'Deactivate'
                            : 'Activate'}
                        </Button>
                      </div>
                      <div className="text-sm text-gray-300 space-y-1">
                        <p>City: {hotel.city.name}</p>
                        <p>Room Types: {hotel.room_types_count}</p>
                        <p>Bookings: {hotel.total_bookings}</p>
                        <p>Earnings: PKR {hotel.total_earnings.toLocaleString()}</p>
                        <div className="flex space-x-2 mt-2">
                          <span className={`px-2 py-1 rounded text-xs ${hotel.is_active ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                            {hotel.is_active ? 'Active' : 'Inactive'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs ${hotel.is_listed ? 'bg-blue-500/20 text-blue-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                            {hotel.is_listed ? 'Listed' : 'Unlisted'}
                          </span>
                        </div>
                        {!hotel.is_active && (
                          <p className="text-yellow-300 text-xs mt-2">
                            ⚠️ This hotel is inactive and not visible to customers. Click "Activate" to make it visible.
                          </p>
                        )}
                        {hotel.is_active && !hotel.is_listed && (
                          <p className="text-yellow-300 text-xs mt-2">
                            ⚠️ This hotel is active but unlisted. Hotel manager needs to list it.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Verification Actions */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Verification Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!manager.is_verified && (
                  <div>
                    <p className="text-sm font-medium text-gray-300 mb-1">Rejection Reason (if rejecting)</p>
                    <Input
                      type="text"
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="mb-4 bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                    />
                  </div>
                )}
                <div className="flex space-x-4">
                  {!manager.is_verified && (
                    <>
                      <Button
                        onClick={() => handleVerifyManager(true)}
                        disabled={isProcessing || !canVerify}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isProcessing ? 'Processing...' : 'Approve & Verify'}
                      </Button>
                      <Button
                        onClick={() => handleVerifyManager(false)}
                        disabled={isProcessing}
                        variant="destructive"
                      >
                        {isProcessing ? 'Processing...' : 'Reject'}
                      </Button>
                    </>
                  )}
                  {manager.is_verified && (
                    <div className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
                      <p className="text-green-200">
                        ✅ This hotel manager has been verified on {new Date(manager.verified_at!).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
                {!canVerify && !manager.is_verified && (
                  <p className="text-yellow-300 text-sm">
                    ⚠️ {hasRejectedRequired 
                      ? 'All required documents must be approved (no rejected documents) before verification'
                      : 'Please ensure all required documents are uploaded before verification'}
                  </p>
                )}
                {canVerify && !allRequiredApproved && !manager.is_verified && (
                  <p className="text-blue-300 text-sm">
                    ℹ️ Pending documents will be automatically approved when you verify this manager
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Document Viewer */}
      {viewingDocument && (
        <DocumentViewer
          isOpen={!!viewingDocument}
          documentUrl={viewingDocument.url}
          documentName={viewingDocument.name}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  )
}

