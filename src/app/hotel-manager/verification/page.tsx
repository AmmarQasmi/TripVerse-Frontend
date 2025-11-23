'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useRouter } from 'next/navigation'
import { hotelManagersApi, HotelManagerDocumentType } from '@/lib/api/hotel-managers.api'
import { HotelManagerProfile } from '@/lib/api/hotel-managers.api'
import { SingleFileUpload } from '@/components/shared/SingleFileUpload'
import { DocumentViewer } from '@/components/shared/DocumentViewer'
import { PageHeader } from '@/components/shared/PageHeader'

// Required document types
const REQUIRED_DOCUMENTS: HotelManagerDocumentType[] = ['hotel_registration', 'business_license']
const OPTIONAL_DOCUMENTS: HotelManagerDocumentType[] = ['tax_certificate']

export default function HotelManagerVerificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<HotelManagerProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState<HotelManagerDocumentType | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null)
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await hotelManagersApi.getProfile()
        setProfile(data)
        
        // If already verified, redirect to dashboard
        if (data.is_verified) {
          router.push('/hotel-manager/dashboard')
          return
        }

        // Check verification status
        const hasPendingDocuments = data.documents.some(d => d.status === 'pending')
        const hasRejectedDocuments = data.documents.some(d => d.status === 'rejected')
        const hasApprovedDocuments = data.documents.some(d => d.status === 'approved')
        
        // Check if all required documents are pending (could be re-uploaded after rejection)
        const requiredDocs = REQUIRED_DOCUMENTS.map(type => 
          data.documents.find(d => d.document_type === type)
        )
        const allRequiredPending = requiredDocs.length === REQUIRED_DOCUMENTS.length && 
          requiredDocs.every(doc => doc?.status === 'pending')
        const hasAnyRejectedRequired = requiredDocs.some(doc => doc?.status === 'rejected')
        
        // If manager was previously rejected (has verification_notes) and all required docs are now pending again,
        // this means they re-uploaded after rejection - allow re-submission
        const wasRejected = data.verification_notes && !data.is_verified
        
        // Set verificationSubmitted:
        // - If was rejected and all required are now pending (re-uploaded), allow re-submission (false)
        // - If has pending docs but wasn't rejected OR has approved docs, show as submitted (true)
        // - If has rejected docs but not all are pending, show rejection status (true)
        if (wasRejected && allRequiredPending && !hasApprovedDocuments) {
          // Re-uploaded after rejection - allow re-submission
          setVerificationSubmitted(false)
        } else if (hasPendingDocuments) {
          // Has pending documents - show as submitted
          setVerificationSubmitted(true)
        } else if (hasRejectedDocuments && hasAnyRejectedRequired) {
          // Has rejected documents - show rejection status
          setVerificationSubmitted(true)
        } else {
          // No pending or rejected - allow submission
          setVerificationSubmitted(false)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load hotel manager profile')
        console.error('Error fetching hotel manager profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'hotel_manager') {
      fetchProfile()
    }
  }, [user, router])

  const getDocumentName = (type: HotelManagerDocumentType) => {
    switch (type) {
      case 'hotel_registration':
        return 'Hotel Registration Certificate'
      case 'business_license':
        return 'Business License'
      case 'tax_certificate':
        return 'Tax Certificate (Optional)'
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

  const handleDocumentUpload = async (documentType: HotelManagerDocumentType, file: File) => {
    setUploadingDoc(documentType)
    setError(null)

    try {
      console.log(`Uploading ${documentType} document:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })
      
      // Upload document via API (backend handles Cloudinary upload)
      const response = await hotelManagersApi.uploadDocument(file, documentType)
      console.log(`Upload successful for ${documentType}:`, response)
      
      // Refresh profile
      const data = await hotelManagersApi.getProfile()
      setProfile(data)
      console.log('Hotel manager profile refreshed:', data.documents)
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to upload document'
      console.error(`Error uploading ${documentType}:`, {
        error: err,
        response: err.response?.data,
        status: err.response?.status,
      })
      setError(`${documentType.toUpperCase()}: ${errorMessage}`)
    } finally {
      setUploadingDoc(null)
    }
  }

  const handleDocumentDelete = async (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      await hotelManagersApi.deleteDocument(documentId)
      
      // Refresh profile
      const data = await hotelManagersApi.getProfile()
      setProfile(data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document')
      console.error('Error deleting document:', err)
    }
  }

  const handleSubmitVerification = async () => {
    if (!profile) return

    // Validate we have all required documents
    const requiredDocs = REQUIRED_DOCUMENTS.map(type => {
      const doc = profile.documents.find(d => d.document_type === type)
      return { type, doc }
    })

    const missingDocs = requiredDocs.filter(({ doc }) => !doc)
    if (missingDocs.length > 0) {
      setError(`Please upload all required documents: ${missingDocs.map(({ type }) => getDocumentName(type)).join(', ')}`)
      return
    }

    // Check if any required document is rejected
    const rejectedDocs = requiredDocs.filter(({ doc }) => doc?.status === 'rejected')
    if (rejectedDocs.length > 0) {
      setError('Please re-upload rejected documents before submitting')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Submit verification with all documents
      await hotelManagersApi.submitVerification({
        documents: profile.documents.map(doc => ({
          document_type: doc.document_type,
          document_url: doc.document_url,
        })),
      })

      // Refresh profile
      const data = await hotelManagersApi.getProfile()
      setProfile(data)
      setVerificationSubmitted(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit verification')
      console.error('Error submitting verification:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Get documents by type
  const getDocumentByType = (type: HotelManagerDocumentType) => {
    return profile?.documents.find(doc => doc.document_type === type)
  }

  // Calculate progress
  const approvedCount = profile?.documents.filter(d => d.status === 'approved').length || 0
  const pendingCount = profile?.documents.filter(d => d.status === 'pending').length || 0
  const rejectedCount = profile?.documents.filter(d => d.status === 'rejected').length || 0
  const totalRequired = REQUIRED_DOCUMENTS.length
  const uploadedRequired = REQUIRED_DOCUMENTS.filter(type => getDocumentByType(type)).length
  const progress = (uploadedRequired / totalRequired) * 100

  // Check if any required documents are rejected (should block submission)
  const hasRejectedRequired = REQUIRED_DOCUMENTS.some(type => {
    const doc = getDocumentByType(type)
    return doc?.status === 'rejected'
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <PageHeader 
          title="Hotel Manager Verification"
          subtitle="Submit documents to verify your hotel manager account"
          backUrl="/hotel-manager/dashboard"
          backLabel="Back to Dashboard"
        />
        <div className="container mx-auto px-4 py-8">
          <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <p className="text-white">Failed to load profile. Please try again.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="Hotel Manager Verification"
        subtitle="Submit documents to verify your hotel manager account"
        backUrl="/hotel-manager/dashboard"
        backLabel="Back to Dashboard"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Hotel Manager Verification
            </h1>
            <p className="text-lg text-gray-300">
              Complete your verification to start listing hotels
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/20 border border-red-500 rounded-lg p-4">
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Verification Status Card */}
          <Card className="shadow-lg mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Verification Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Progress</span>
                  <span className="text-white font-semibold">{uploadedRequired}/{totalRequired} Required Documents</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-cyan-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                  <span>✅ Approved: {approvedCount}</span>
                  <span>⏳ Pending: {pendingCount}</span>
                  <span>❌ Rejected: {rejectedCount}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Required Documents */}
          <Card className="shadow-lg mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Required Documents</CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Upload all required documents to complete verification
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {REQUIRED_DOCUMENTS.map((docType) => {
                const doc = getDocumentByType(docType)
                return (
                  <div key={docType} className="border border-white/20 rounded-lg p-4 bg-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{getDocumentName(docType)}</h3>
                        {doc && (
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)} {doc.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {doc ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-2 mb-2">
                          <button
                            onClick={() => setViewingDocument({ url: doc.document_url, name: getDocumentName(docType) })}
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            View Document
                          </button>
                          {doc.status === 'rejected' && (
                            <>
                              <span className="text-gray-500">|</span>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this rejected document? You can then upload a new one.')) {
                                    handleDocumentDelete(doc.id)
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Delete & Re-upload
                              </button>
                            </>
                          )}
                        </div>
                        {doc.rejection_reason && (
                          <p className="text-red-300 text-sm mb-2">Rejection reason: {doc.rejection_reason}</p>
                        )}
                        {doc.status === 'pending' && verificationSubmitted && (
                          <p className="text-yellow-300 text-sm mb-2">⏳ Document is under review. You cannot update it until it's reviewed.</p>
                        )}
                        {doc.status === 'approved' && (
                          <p className="text-green-300 text-sm mb-2">✅ Document approved. You cannot update it.</p>
                        )}
                        {/* Show replace option if not submitted and not approved */}
                        {!verificationSubmitted && doc.status !== 'approved' && (
                          <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-gray-300 text-sm mb-2">💡 Replace this document:</p>
                            <SingleFileUpload
                              onUpload={(file) => handleDocumentUpload(docType, file)}
                              isLoading={uploadingDoc === docType}
                              accept="image/*,.pdf"
                              label={`Replace ${getDocumentName(docType)}`}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <SingleFileUpload
                        onUpload={(file) => handleDocumentUpload(docType, file)}
                        isLoading={uploadingDoc === docType}
                        accept="image/*,.pdf"
                        label={`Upload ${getDocumentName(docType)}`}
                      />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Optional Documents */}
          <Card className="shadow-lg mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Optional Documents</CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                These documents are optional but may help with verification
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {OPTIONAL_DOCUMENTS.map((docType) => {
                const doc = getDocumentByType(docType)
                return (
                  <div key={docType} className="border border-white/20 rounded-lg p-4 bg-white/5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold">{getDocumentName(docType)}</h3>
                        {doc && (
                          <span className={`text-xs px-2 py-1 rounded ${getStatusColor(doc.status)}`}>
                            {getStatusIcon(doc.status)} {doc.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    {doc ? (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 flex-wrap gap-2 mb-2">
                          <button
                            onClick={() => setViewingDocument({ url: doc.document_url, name: getDocumentName(docType) })}
                            className="text-cyan-400 hover:text-cyan-300 text-sm"
                          >
                            View Document
                          </button>
                          {doc.status === 'rejected' && (
                            <>
                              <span className="text-gray-500">|</span>
                              <button
                                onClick={() => {
                                  if (confirm('Delete this rejected document? You can then upload a new one.')) {
                                    handleDocumentDelete(doc.id)
                                  }
                                }}
                                className="text-red-400 hover:text-red-300 text-sm font-medium"
                              >
                                Delete & Re-upload
                              </button>
                            </>
                          )}
                        </div>
                        {doc.rejection_reason && (
                          <p className="text-red-300 text-sm mb-2">Rejection reason: {doc.rejection_reason}</p>
                        )}
                        {/* Show replace option if not submitted and not approved */}
                        {!verificationSubmitted && doc.status !== 'approved' && (
                          <div className="mt-2 p-3 bg-white/5 rounded-lg border border-white/10">
                            <p className="text-gray-300 text-sm mb-2">💡 Replace this document:</p>
                            <SingleFileUpload
                              onUpload={(file) => handleDocumentUpload(docType, file)}
                              isLoading={uploadingDoc === docType}
                              accept="image/*,.pdf"
                              label={`Replace ${getDocumentName(docType)}`}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <SingleFileUpload
                        onUpload={(file) => handleDocumentUpload(docType, file)}
                        isLoading={uploadingDoc === docType}
                        accept="image/*,.pdf"
                        label={`Upload ${getDocumentName(docType)}`}
                      />
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {/* Submit Button */}
          {!verificationSubmitted && uploadedRequired === totalRequired && (
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitVerification}
                disabled={submitting || hasRejectedRequired}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3"
              >
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          )}

          {/* Verification Submitted Message */}
          {verificationSubmitted && (
            <Card className="shadow-lg bg-yellow-500/20 border-yellow-500/50">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">⏳</span>
                  <div>
                    <h3 className="text-white font-semibold text-lg">Verification Submitted</h3>
                    <p className="text-gray-300 mt-1">
                      Your documents have been submitted and are under review. You will be notified once the verification is complete.
                    </p>
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
          documentUrl={viewingDocument.url}
          documentName={viewingDocument.name}
          onClose={() => setViewingDocument(null)}
        />
      )}
    </div>
  )
}

