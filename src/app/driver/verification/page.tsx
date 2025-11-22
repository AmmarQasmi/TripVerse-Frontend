'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/features/auth/useAuth'
import { useRouter } from 'next/navigation'
import { driversApi, DocumentType } from '@/lib/api/drivers.api'
import { Driver, DriverDocument, DriverRating } from '@/types/api'
import { SingleFileUpload } from '@/components/shared/SingleFileUpload'
import { DocumentViewer } from '@/components/shared/DocumentViewer'
import { uploadApi } from '@/lib/api/upload.api'

// Required document types
const REQUIRED_DOCUMENTS: DocumentType[] = ['license', 'cnic', 'vehicle_registration', 'insurance']

export default function DriverVerificationPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadingDoc, setUploadingDoc] = useState<DocumentType | null>(null)
  const [uploadingRating, setUploadingRating] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [viewingDocument, setViewingDocument] = useState<{ url: string; name: string } | null>(null)
  const [verificationSubmitted, setVerificationSubmitted] = useState(false)

  // Ratings form state
  const [ratings, setRatings] = useState<Array<{
    platform: string
    rating: number
    screenshot_url?: string
  }>>([])
  const [selectedPlatform, setSelectedPlatform] = useState<string>('')
  
  // Available platforms
  const availablePlatforms = ['uber', 'careem', 'indrive', 'bolt', 'inDrive', 'other']

  useEffect(() => {
    const fetchDriverProfile = async () => {
      try {
        setIsLoading(true)
        const profile = await driversApi.getProfile()
        setDriver(profile)
        
        // If already verified, redirect to dashboard
        if (profile.is_verified) {
          router.push('/driver/dashboard')
          return
        }

        // Check if verification has been submitted (has pending documents/ratings)
        const hasPendingDocuments = profile.documents.some(d => d.status === 'pending')
        const hasPendingRatings = profile.ratings.some(r => !r.verified_at)
        if (hasPendingDocuments || hasPendingRatings) {
          setVerificationSubmitted(true)
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load driver profile')
        console.error('Error fetching driver profile:', err)
      } finally {
        setIsLoading(false)
      }
    }

    if (user?.role === 'driver') {
      fetchDriverProfile()
    }
  }, [user, router])

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

  const handleDocumentUpload = async (documentType: DocumentType, file: File) => {
    setUploadingDoc(documentType)
    setError(null)

    try {
      console.log(`Uploading ${documentType} document:`, {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      })
      
      const response = await driversApi.uploadDocument(file, documentType)
      console.log(`Upload successful for ${documentType}:`, response)
      
      // Refresh driver profile
      const profile = await driversApi.getProfile()
      setDriver(profile)
      console.log('Driver profile refreshed:', profile.documents)
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
      await driversApi.deleteDocument(documentId)
      
      // Refresh driver profile
      const profile = await driversApi.getProfile()
      setDriver(profile)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete document')
      console.error('Error deleting document:', err)
    }
  }

  const handleRatingScreenshotUpload = async (platform: string, file: File) => {
    setUploadingRating(platform)
    setError(null)

    try {
      const result = await uploadApi.uploadImage(file, 'driver-ratings')
      
      // Update ratings state
      setRatings(prev => {
        const existing = prev.find(r => r.platform === platform)
        if (existing) {
          return prev.map(r => 
            r.platform === platform 
              ? { ...r, screenshot_url: result.url }
              : r
          )
        } else {
          return [...prev, { platform, rating: 4.0, screenshot_url: result.url }]
        }
      })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload screenshot')
      console.error('Error uploading screenshot:', err)
    } finally {
      setUploadingRating(null)
    }
  }

  const handleAddRating = () => {
    if (!selectedPlatform) {
      setError('Please select a platform')
      return
    }
    
    // Check if platform already added
    const exists = ratings.find(r => r.platform === selectedPlatform)
    if (exists) {
      setError('This platform has already been added')
      return
    }

    // Add new rating entry
    setRatings(prev => [...prev, { platform: selectedPlatform, rating: 4.0, screenshot_url: '' }])
    setSelectedPlatform('')
    setError(null)
  }

  const handleRemoveRating = (platform: string) => {
    setRatings(prev => prev.filter(r => r.platform !== platform))
  }

  const handleRatingChange = (platform: string, rating: number) => {
    setRatings(prev => {
      const existing = prev.find(r => r.platform === platform)
      if (existing) {
        return prev.map(r => 
          r.platform === platform 
            ? { ...r, rating }
            : r
        )
      } else {
        return [...prev, { platform, rating, screenshot_url: '' }]
      }
    })
  }

  const handleSubmitVerification = async () => {
    if (!driver) return

    // Validate we have documents
    if (driver.documents.length === 0) {
      setError('Please upload at least one document')
      return
    }

    // Validate we have ratings
    if (ratings.length === 0) {
      setError('Please add at least one platform rating')
      return
    }

    // Validate at least one rating has a screenshot (required)
    const ratingsWithScreenshots = ratings.filter(r => r.screenshot_url)
    if (ratingsWithScreenshots.length === 0) {
      setError('Please upload a screenshot for at least one rating')
      return
    }

    // Validate all ratings are 4.0 or higher
    const invalidRatings = ratings.filter(r => r.rating < 4.0)
    if (invalidRatings.length > 0) {
      setError('All ratings must be 4.0 or higher')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      // Pass existing documents (backend will create new records, but that's the API design)
      // and new ratings
      await driversApi.submitVerification({
        documents: driver.documents.map(doc => ({
          document_type: doc.document_type,
          document_url: doc.document_url,
        })),
        ratings: ratings.map(r => ({
          platform: r.platform,
          rating: r.rating,
          screenshot_url: r.screenshot_url || undefined, // Only include if present
        })),
      })

      // Refresh driver profile
      const profile = await driversApi.getProfile()
      setDriver(profile)
      setVerificationSubmitted(true) // Mark as submitted
      setRatings([]) // Clear ratings form
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit verification')
      console.error('Error submitting verification:', err)
    } finally {
      setSubmitting(false)
    }
  }

  // Get documents by type
  const getDocumentByType = (type: DocumentType): DriverDocument | undefined => {
    return driver?.documents.find(doc => doc.document_type === type)
  }

  // Calculate progress
  const approvedCount = driver?.documents.filter(d => d.status === 'approved').length || 0
  const pendingCount = driver?.documents.filter(d => d.status === 'pending').length || 0
  const totalRequired = REQUIRED_DOCUMENTS.length
  const verificationProgress = totalRequired > 0 ? (approvedCount / totalRequired) * 100 : 0
  const isFullyVerified = driver?.is_verified || false

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (error && !driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="bg-red-500/20 border-red-500">
          <CardContent className="p-6">
            <p className="text-white">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!driver) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Driver Verification
            </h1>
            <p className="text-lg text-gray-300">
              Complete your verification to start accepting bookings
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
            <CardContent className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    Overall Progress
                  </span>
                  <span className="text-sm font-medium text-white">
                    {approvedCount}/{totalRequired} Approved
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${verificationProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className={`h-3 rounded-full ${
                      isFullyVerified
                        ? 'bg-green-500'
                        : verificationProgress > 50
                        ? 'bg-blue-500'
                        : 'bg-yellow-500'
                    }`}
                  />
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-green-400">{approvedCount}</div>
                  <div className="text-sm text-gray-300">Approved</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-yellow-400">{pendingCount}</div>
                  <div className="text-sm text-gray-300">Pending Review</div>
                </div>
                <div className="bg-gray-500/20 border border-gray-500/30 rounded-lg p-4">
                  <div className="text-3xl font-bold text-gray-400">
                    {totalRequired - approvedCount - pendingCount}
                  </div>
                  <div className="text-sm text-gray-300">Not Submitted</div>
                </div>
              </div>

              {/* Verification Badge */}
              {isFullyVerified && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-500/20 border-2 border-green-500 rounded-xl p-6 text-center"
                >
                  <div className="text-5xl mb-2">✅</div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Fully Verified Driver
                  </h3>
                  <p className="text-gray-300">
                    You're all set! Start accepting bookings now.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Documents List */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Required Documents</h2>
            {REQUIRED_DOCUMENTS.map((docType, index) => {
              const document = getDocumentByType(docType)
              const status = document?.status || 'not_submitted'
              
              return (
              <motion.div
                  key={docType}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                          <div className="text-4xl">{getStatusIcon(status)}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {getDocumentName(docType)}
                          </h3>
                          
                          <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                                {status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>

                            {document?.uploaded_at && (
                            <p className="text-sm text-gray-600">
                                Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
                            </p>
                          )}
                          
                            {document?.reviewed_at && document.status === 'approved' && (
                            <p className="text-sm text-green-600">
                                Approved: {new Date(document.reviewed_at).toLocaleDateString()}
                            </p>
                          )}
                          
                            {document?.rejection_reason && (
                            <p className="text-sm text-red-600 mt-2">
                                Reason: {document.rejection_reason}
                            </p>
                          )}

                            {document?.document_url && (
                              <button
                                onClick={() => setViewingDocument({
                                  url: document.document_url,
                                  name: getDocumentName(docType)
                                })}
                                className="text-sm text-blue-600 hover:text-blue-700 hover:underline mt-2 inline-block"
                              >
                                View Document
                              </button>
                            )}
                        </div>
                      </div>

                        <div className="ml-4 flex flex-col gap-2">
                          {status === 'not_submitted' || status === 'rejected' ? (
                            <SingleFileUpload
                              onUpload={(file) => handleDocumentUpload(docType, file)}
                              accept="image/*,.pdf"
                              maxSize={10 * 1024 * 1024}
                              disabled={uploadingDoc === docType}
                              isLoading={uploadingDoc === docType}
                              label="Upload"
                            />
                          ) : status === 'pending' ? (
                          <div className="text-yellow-600 font-medium">
                            Under Review
                          </div>
                        ) : (
                            document && (
                              <div className="flex flex-col gap-2">
                          <div className="text-green-600 font-medium">
                            Verified ✓
                          </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDocumentDelete(document.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  Delete
                                </Button>
                              </div>
                            )
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              )
            })}
          </div>

           {/* Platform Ratings Section */}
           <div className="space-y-4 mb-8">
             <h2 className="text-2xl font-bold text-white mb-4">Platform Ratings</h2>
             <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
               <CardContent className="p-6">
                <p className="text-gray-300 mb-4">
                  Add your ratings from ride-sharing platforms. 
                  All ratings must be 4.0 or higher. 
                  <span className="font-semibold text-white"> At least one rating must include a screenshot</span> (others are optional).
                </p>
                 
                 {/* Add Platform Section */}
                 <div className="mb-6 p-4 bg-white/5 rounded-lg">
                   <div className="flex gap-4 items-end">
                     <div className="flex-1">
                       <label className="block text-sm font-medium text-gray-300 mb-2">
                         Select Platform
                       </label>
                       <select
                         value={selectedPlatform}
                         onChange={(e) => setSelectedPlatform(e.target.value)}
                         className="w-full h-11 px-3 py-2 bg-white/10 border border-white/20 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                       >
                         <option value="" className="text-gray-900">Choose a platform...</option>
                         {availablePlatforms
                           .filter(p => !ratings.find(r => r.platform === p))
                           .map((platform) => (
                             <option key={platform} value={platform} className="text-gray-900 capitalize">
                               {platform}
                             </option>
                           ))}
                       </select>
                     </div>
                     <Button
                       onClick={handleAddRating}
                       disabled={!selectedPlatform}
                       className="bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 hover:from-blue-900 hover:via-cyan-950 hover:to-teal-950 text-white"
                     >
                       Add Platform
                     </Button>
                   </div>
                 </div>

                 {/* Added Ratings */}
                 {ratings.length > 0 && (
                   <div className="space-y-4">
                     {ratings.map((rating) => {
                       const existingRating = driver.ratings.find(r => r.platform === rating.platform)
                       
                       return (
                         <div key={rating.platform} className="p-4 bg-white/5 rounded-lg border border-white/10">
                           <div className="flex items-center justify-between mb-4">
                             <h3 className="text-lg font-semibold text-white capitalize">
                               {rating.platform}
                             </h3>
                             <Button
                               variant="outline"
                               size="sm"
                               onClick={() => handleRemoveRating(rating.platform)}
                               className="text-red-600 hover:text-red-700 border-red-600"
                             >
                               Remove
                             </Button>
                           </div>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div>
                               <label className="block text-sm font-medium text-gray-300 mb-2">
                                 Rating (4.0 - 5.0)
                               </label>
                               <Input
                                 type="number"
                                 min="4.0"
                                 max="5.0"
                                 step="0.1"
                                 value={rating.rating || ''}
                                 onChange={(e) => handleRatingChange(rating.platform, parseFloat(e.target.value) || 0)}
                                 className="bg-white/10 border-white/20 text-white"
                                 placeholder="4.0"
                               />
                             </div>
                             
                             <div>
                               <label className="block text-sm font-medium text-gray-300 mb-2">
                                 Screenshot {ratings.indexOf(rating) === 0 && <span className="text-yellow-400">*</span>}
                                 {ratings.indexOf(rating) === 0 && <span className="text-xs text-gray-400 ml-1">(Required)</span>}
                               </label>
                               {rating.screenshot_url ? (
                                 <div className="space-y-2">
                                   <img
                                     src={rating.screenshot_url}
                                     alt={`${rating.platform} rating`}
                                     className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                     onClick={() => {
                                       if (rating.screenshot_url) {
                                         setViewingDocument({
                                           url: rating.screenshot_url,
                                           name: `${rating.platform} Rating Screenshot`
                                         })
                                       }
                                     }}
                                   />
                                   <SingleFileUpload
                                     onUpload={(file) => handleRatingScreenshotUpload(rating.platform, file)}
                                     accept="image/*"
                                     maxSize={5 * 1024 * 1024}
                                     disabled={uploadingRating === rating.platform}
                                     isLoading={uploadingRating === rating.platform}
                                     label="Replace Screenshot"
                                   />
                                 </div>
                               ) : (
                                 <SingleFileUpload
                                   onUpload={(file) => handleRatingScreenshotUpload(rating.platform, file)}
                                   accept="image/*"
                                   maxSize={5 * 1024 * 1024}
                                   disabled={uploadingRating === rating.platform}
                                   isLoading={uploadingRating === rating.platform}
                                   label="Upload Screenshot"
                                 />
                               )}
                             </div>
                           </div>
                         </div>
                       )
                     })}
                   </div>
                 )}

                 {ratings.length === 0 && (
                   <div className="text-center py-8 text-gray-400">
                     <p>No platforms added yet. Select a platform above to get started.</p>
                   </div>
                 )}
               </CardContent>
             </Card>
          </div>

          {/* Submit Button - Hidden if verification is submitted */}
          {!isFullyVerified && !verificationSubmitted && (
            <div className="mb-8">
              <Button
                onClick={handleSubmitVerification}
                disabled={submitting || driver.documents.length === 0 || ratings.length === 0 || ratings.filter(r => r.screenshot_url).length === 0 || ratings.some(r => r.rating < 4.0)}
                className="w-full bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 hover:from-blue-900 hover:via-cyan-950 hover:to-teal-950 text-white py-3.5 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit for Verification'}
              </Button>
            </div>
          )}

          {/* Success Message with Go to Dashboard Button - Shown after submission */}
          {verificationSubmitted && !isFullyVerified && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Card className="shadow-lg bg-green-500/20 backdrop-blur-md border-green-500/30">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      Verification Submitted Successfully!
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Your verification request has been submitted and is now pending admin review.
                      You will be notified once the review is complete.
                    </p>
                    <Button
                      onClick={() => router.push('/driver/dashboard')}
                      className="bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 hover:from-blue-900 hover:via-cyan-950 hover:to-teal-950 text-white py-3 px-8 rounded-xl font-semibold text-lg"
                    >
                      Go to Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Help Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-8"
          >
            <Card className="shadow-lg bg-blue-50">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="text-3xl">ℹ️</div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Verification Tips
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Ensure all documents are clear and readable</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Upload high-quality images or PDFs</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Documents must be valid and not expired</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>All platform ratings must be 4.0 or higher</span>
                      </li>
                      <li className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>Review typically takes 24-48 hours</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
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
