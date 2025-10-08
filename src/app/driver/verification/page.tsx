'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'

interface VerificationDocument {
  id: string
  type: 'ID_CARD' | 'DRIVERS_LICENSE' | 'VEHICLE_REGISTRATION' | 'INSURANCE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED'
  uploadedAt?: string
  reviewedAt?: string
  rejectionReason?: string
}

export default function DriverVerificationPage() {
  const { user } = useAuth()
  
  const [documents, setDocuments] = useState<VerificationDocument[]>([
    {
      id: '1',
      type: 'ID_CARD',
      status: 'APPROVED',
      uploadedAt: '2024-01-10',
      reviewedAt: '2024-01-11',
    },
    {
      id: '2',
      type: 'DRIVERS_LICENSE',
      status: 'APPROVED',
      uploadedAt: '2024-01-10',
      reviewedAt: '2024-01-11',
    },
    {
      id: '3',
      type: 'VEHICLE_REGISTRATION',
      status: 'PENDING',
      uploadedAt: '2024-01-15',
    },
    {
      id: '4',
      type: 'INSURANCE',
      status: 'NOT_SUBMITTED',
    },
  ])

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null)

  const getDocumentName = (type: string) => {
    switch (type) {
      case 'ID_CARD':
        return 'National ID Card / Passport'
      case 'DRIVERS_LICENSE':
        return "Driver's License"
      case 'VEHICLE_REGISTRATION':
        return 'Vehicle Registration'
      case 'INSURANCE':
        return 'Insurance Certificate'
      default:
        return type
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'REJECTED':
        return 'bg-red-100 text-red-800'
      case 'NOT_SUBMITTED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return '✅'
      case 'PENDING':
        return '⏳'
      case 'REJECTED':
        return '❌'
      case 'NOT_SUBMITTED':
        return '📄'
      default:
        return '📄'
    }
  }

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadingDoc(docType)
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setDocuments(docs =>
      docs.map(doc =>
        doc.type === docType
          ? { ...doc, status: 'PENDING' as const, uploadedAt: new Date().toISOString() }
          : doc
      )
    )
    
    setUploadingDoc(null)
  }

  const approvedCount = documents.filter(d => d.status === 'APPROVED').length
  const pendingCount = documents.filter(d => d.status === 'PENDING').length
  const totalRequired = documents.length
  const verificationProgress = (approvedCount / totalRequired) * 100

  const isFullyVerified = approvedCount === totalRequired

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
          <div className="space-y-4">
            {documents.map((doc, index) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="text-4xl">{getStatusIcon(doc.status)}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {getDocumentName(doc.type)}
                          </h3>
                          
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                              {doc.status.replace('_', ' ')}
                            </span>
                          </div>

                          {doc.uploadedAt && (
                            <p className="text-sm text-gray-600">
                              Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          )}
                          
                          {doc.reviewedAt && doc.status === 'APPROVED' && (
                            <p className="text-sm text-green-600">
                              Approved: {new Date(doc.reviewedAt).toLocaleDateString()}
                            </p>
                          )}
                          
                          {doc.rejectionReason && (
                            <p className="text-sm text-red-600 mt-2">
                              Reason: {doc.rejectionReason}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="ml-4">
                        {doc.status === 'NOT_SUBMITTED' || doc.status === 'REJECTED' ? (
                          <div>
                            <input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleFileUpload(doc.type, file)
                              }}
                              className="hidden"
                              id={`upload-${doc.type}`}
                            />
                            <label htmlFor={`upload-${doc.type}`}>
                              <Button
                                disabled={uploadingDoc === doc.type}
                                className="cursor-pointer"
                              >
                                {uploadingDoc === doc.type ? (
                                  <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Uploading...
                                  </span>
                                ) : (
                                  <span>📤 Upload</span>
                                )}
                              </Button>
                            </label>
                          </div>
                        ) : doc.status === 'PENDING' ? (
                          <div className="text-yellow-600 font-medium">
                            Under Review
                          </div>
                        ) : (
                          <div className="text-green-600 font-medium">
                            Verified ✓
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

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
    </div>
  )
}
