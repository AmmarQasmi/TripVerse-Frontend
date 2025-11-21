'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { adminApi } from '@/lib/api/admin.api'
import { Driver, DriverDocument, DriverRating, DocumentType } from '@/types/api'
import { DocumentViewer } from '@/components/shared/DocumentViewer'

export default function AdminDriverReviewPage() {
  const params = useParams()
  const router = useRouter()
  const driverId = Number(params.id)

  const [driver, setDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedDocument, setSelectedDocument] = useState<DriverDocument | null>(null)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const fetchDriver = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const driverData = await adminApi.getDriverById(driverId)
        setDriver(driverData)
        if (driverData.documents.length > 0) {
          setSelectedDocument(driverData.documents[0])
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load driver data')
        console.error('Error fetching driver:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (driverId) {
      fetchDriver()
    }
  }, [driverId])

  const getDocumentName = (type: DocumentType) => {
    switch (type) {
      case 'license':
        return "Driver's License"
      case 'cnic':
        return 'National ID Card / CNIC'
      case 'vehicle_registration':
        return 'Vehicle Registration'
      case 'insurance':
        return 'Insurance Certificate'
      case 'other':
        return 'Other Document'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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

  const handleVerifyDriver = async (isVerified: boolean) => {
    if (!isVerified && !rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }

    if (!confirm(isVerified 
      ? 'Are you sure you want to approve and verify this driver?'
      : 'Are you sure you want to reject this driver application?'
    )) {
      return
    }

    setIsProcessing(true)
    setError(null)

    try {
      await adminApi.verifyDriver(driverId, isVerified, rejectionReason || undefined)
      alert(isVerified 
        ? 'Driver verified successfully!'
        : 'Driver application rejected.'
      )
      router.push('/admin/drivers')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update driver verification')
      console.error('Error verifying driver:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading driver data...</div>
      </div>
    )
  }

  if (error && !driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-white">{error}</p>
            <Button onClick={() => router.push('/admin/drivers')} className="mt-4">
              Back to Drivers
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!driver) {
    return null
  }

  const pendingDocuments = driver.documents.filter(d => d.status === 'pending')
  const approvedDocuments = driver.documents.filter(d => d.status === 'approved')
  const rejectedDocuments = driver.documents.filter(d => d.status === 'rejected')
  const hasRatings = driver.ratings.length > 0
  const hasScreenshots = driver.ratings.some(r => r.screenshot_url)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Drivers</span>
            </button>
            
            <h1 className="text-4xl font-bold text-white mb-2">
              Driver Verification Review
            </h1>
            <p className="text-lg text-gray-300">
              Review and approve driver documents
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Driver Info Card */}
          <Card className="shadow-lg mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {driver.user.full_name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{driver.user.full_name}</h2>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>📧 {driver.user.email}</p>
                      <p>📍 {driver.user.city.name}, {driver.user.city.region}</p>
                      <p>📅 Joined {new Date(driver.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                    driver.is_verified 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  }`}>
                    {driver.is_verified ? '✅ Verified' : '⏳ Pending Review'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Documents</p>
                <p className="text-2xl font-bold text-white">
                  {driver.documents.length}/4
                </p>
                <p className="text-xs text-gray-400">
                  {pendingDocuments.length} pending
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Platform Ratings</p>
                <p className="text-2xl font-bold text-white">
                  {driver.ratings.length}
                </p>
                <p className="text-xs text-gray-400">
                  {hasScreenshots ? 'With screenshots' : 'No screenshots'}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Cars Listed</p>
                <p className="text-2xl font-bold text-white">
                  {driver.cars?.length || 0}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/10 backdrop-blur-md border-white/20">
              <CardContent className="p-4">
                <p className="text-sm text-gray-300">Status</p>
                <p className="text-2xl font-bold text-white">
                  {driver.is_verified ? '✅' : '⏳'}
                </p>
                <p className="text-xs text-gray-400">
                  {driver.is_verified ? 'Verified' : 'Pending'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Document List */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Documents ({driver.documents.length}/4)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {driver.documents.map((doc) => (
                      <button
                        key={doc.id}
                        onClick={() => setSelectedDocument(doc)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          selectedDocument?.id === doc.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {getDocumentName(doc.document_type)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)} {doc.status.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                        {doc.reviewed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            Reviewed {new Date(doc.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </button>
                    ))}
                    {driver.documents.length === 0 && (
                      <p className="text-center text-gray-500 py-4">No documents submitted</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Document Viewer */}
            <div className="lg:col-span-2">
              {selectedDocument ? (
                <Card className="shadow-lg">
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle>{getDocumentName(selectedDocument.document_type)}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                        {getStatusIcon(selectedDocument.status)} {selectedDocument.status.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Document Image/PDF */}
                    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setViewingDocument({
                          url: selectedDocument.document_url,
                          name: getDocumentName(selectedDocument.document_type)
                        })}
                        className="w-full h-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                      >
                        {selectedDocument.document_url.endsWith('.pdf') ? (
                          <div className="text-center">
                            <div className="text-6xl mb-2">📄</div>
                            <p className="text-gray-600">Click to view PDF</p>
                          </div>
                        ) : (
                          <img
                            src={selectedDocument.document_url}
                            alt={getDocumentName(selectedDocument.document_type)}
                            className="max-w-full max-h-full object-contain cursor-pointer"
                          />
                        )}
                      </button>
                    </div>

                    {/* Document Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Document Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Type:</p>
                          <p className="font-medium">{getDocumentName(selectedDocument.document_type)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Uploaded:</p>
                          <p className="font-medium">{new Date(selectedDocument.uploaded_at).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <p className="font-medium">{selectedDocument.status.toUpperCase()}</p>
                        </div>
                        {selectedDocument.reviewed_at && (
                          <div>
                            <p className="text-gray-600">Reviewed:</p>
                            <p className="font-medium">{new Date(selectedDocument.reviewed_at).toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                      {selectedDocument.rejection_reason && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-600 mt-1">{selectedDocument.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="shadow-lg">
                  <CardContent className="p-12 text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <p className="text-gray-600">Select a document to review</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Platform Ratings Section */}
          {driver.ratings.length > 0 && (
            <Card className="shadow-lg mt-8">
              <CardHeader>
                <CardTitle>Platform Ratings ({driver.ratings.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {driver.ratings.map((rating) => (
                    <div key={rating.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 capitalize">{rating.platform}</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-gray-900">⭐ {Number(rating.rating).toFixed(1)}</span>
                          {rating.verified_at && (
                            <span className="text-xs text-green-600">✅ Verified</span>
                          )}
                        </div>
                      </div>
                      {rating.screenshot_url ? (
                        <div>
                          <img
                            src={rating.screenshot_url}
                            alt={`${rating.platform} rating`}
                            className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity mb-2"
                            onClick={() => setViewingDocument({
                              url: rating.screenshot_url!,
                              name: `${rating.platform} Rating Screenshot`
                            })}
                          />
                          <p className="text-xs text-gray-500">
                            Created: {new Date(rating.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <div className="text-center py-4 bg-yellow-50 rounded">
                          <p className="text-sm text-yellow-800">No screenshot uploaded</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Final Actions */}
          {!driver.is_verified && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="shadow-lg bg-green-50 border-2 border-green-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-green-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">✅</span>
                    Approve Driver
                  </h3>
                  <p className="text-sm text-green-800 mb-4">
                    Approve all documents and verify this driver. They will be able to list cars and accept bookings.
                  </p>
                  <Button
                    onClick={() => handleVerifyDriver(true)}
                    disabled={isProcessing || pendingDocuments.length === 0 || !hasRatings || !hasScreenshots}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                  >
                    {isProcessing ? 'Processing...' : 'Approve & Verify Driver'}
                  </Button>
                  {(!hasRatings || !hasScreenshots) && (
                    <p className="text-xs text-red-600 mt-2">
                      Driver must have at least one rating with screenshot
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="shadow-lg bg-red-50 border-2 border-red-200">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-red-900 mb-4 flex items-center">
                    <span className="text-2xl mr-2">❌</span>
                    Reject Application
                  </h3>
                  <p className="text-sm text-red-800 mb-4">
                    Reject this driver's application. They will be notified with the reason.
                  </p>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason (Required)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Provide a clear reason for rejection..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <Button
                    onClick={() => handleVerifyDriver(false)}
                    disabled={isProcessing || !rejectionReason.trim()}
                    variant="outline"
                    className="w-full border-red-600 text-red-600 hover:bg-red-100 font-semibold py-3"
                  >
                    {isProcessing ? 'Processing...' : 'Reject Application'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {driver.is_verified && (
            <Card className="shadow-lg mt-8 bg-green-50 border-2 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-4xl">✅</span>
                  <div>
                    <h3 className="font-semibold text-green-900 text-lg">Driver Verified</h3>
                    <p className="text-sm text-green-800">
                      This driver has been verified on {driver.verified_at ? new Date(driver.verified_at).toLocaleDateString() : 'N/A'}
                    </p>
                    {driver.verification_notes && (
                      <p className="text-sm text-gray-700 mt-2">
                        <strong>Notes:</strong> {driver.verification_notes}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>

      {/* Document Viewer Modal */}
      {viewingDocument && (
        <DocumentViewer
          isOpen={!!viewingDocument}
          onClose={() => setViewingDocument(null)}
          documentUrl={viewingDocument.url}
          documentName={viewingDocument.name}
        />
      )}
    </div>
  )
}
