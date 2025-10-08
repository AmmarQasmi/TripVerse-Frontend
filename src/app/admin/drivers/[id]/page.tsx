'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Image from 'next/image'

interface Document {
  id: string
  type: 'ID_CARD' | 'DRIVERS_LICENSE' | 'VEHICLE_REGISTRATION' | 'INSURANCE'
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  uploadedAt: string
  reviewedAt?: string
  reviewedBy?: string
  rejectionReason?: string
  imageUrl: string
}

export default function AdminDriverReviewPage() {
  const params = useParams()
  const router = useRouter()
  const driverId = params.id as string

  // Mock driver data
  const driver = {
    id: driverId,
    name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    phone: '+92 300 1234567',
    joinedDate: '2024-01-10',
    verificationStatus: 'PENDING',
    totalCars: 2,
    totalTrips: 0,
    totalEarnings: 0,
    rating: 0,
  }

  const [documents] = useState<Document[]>([
    {
      id: '1',
      type: 'ID_CARD',
      status: 'PENDING',
      uploadedAt: '2024-01-10T10:00:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&q=80',
    },
    {
      id: '2',
      type: 'DRIVERS_LICENSE',
      status: 'PENDING',
      uploadedAt: '2024-01-10T10:05:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1579621970795-87facc2f976d?w=800&q=80',
    },
    {
      id: '3',
      type: 'VEHICLE_REGISTRATION',
      status: 'PENDING',
      uploadedAt: '2024-01-10T10:10:00Z',
      imageUrl: 'https://images.unsplash.com/photo-1554224311-4af2eff1ea6c?w=800&q=80',
    },
  ])

  const [selectedDocument, setSelectedDocument] = useState<Document | null>(documents[0] || null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

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
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleApprove = async (docId: string) => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Approved document:', docId)
    setIsProcessing(false)
  }

  const handleReject = async (docId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Rejected document:', docId, 'Reason:', rejectionReason)
    setRejectionReason('')
    setIsProcessing(false)
  }

  const handleApproveAll = async () => {
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Approved all documents')
    router.push('/admin/drivers')
    setIsProcessing(false)
  }

  const handleRejectDriver = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection')
      return
    }
    setIsProcessing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Rejected driver:', driverId, 'Reason:', rejectionReason)
    router.push('/admin/drivers')
    setIsProcessing(false)
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

          {/* Driver Info Card */}
          <Card className="shadow-lg mb-8 bg-white/10 backdrop-blur-md border-white/20">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {driver.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{driver.name}</h2>
                    <div className="text-sm text-gray-300 space-y-1">
                      <p>📧 {driver.email}</p>
                      <p>📱 {driver.phone}</p>
                      <p>📅 Joined {new Date(driver.joinedDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-4 py-2 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    ⏳ Pending Review
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Document List */}
            <div>
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Documents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {documents.map((doc) => (
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
                            {getDocumentName(doc.type)}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                            {doc.status}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600">
                          Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                        </p>
                      </button>
                    ))}
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
                      <CardTitle>{getDocumentName(selectedDocument.type)}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedDocument.status)}`}>
                        {selectedDocument.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Document Image */}
                    <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={selectedDocument.imageUrl}
                        alt={getDocumentName(selectedDocument.type)}
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Document Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900 mb-2">Document Information</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Type:</p>
                          <p className="font-medium">{getDocumentName(selectedDocument.type)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Uploaded:</p>
                          <p className="font-medium">{new Date(selectedDocument.uploadedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Status:</p>
                          <p className="font-medium">{selectedDocument.status}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Driver:</p>
                          <p className="font-medium">{driver.name}</p>
                        </div>
                      </div>
                    </div>

                    {/* Review Actions */}
                    {selectedDocument.status === 'PENDING' && (
                      <div className="space-y-4">
                        <div className="flex space-x-3">
                          <Button
                            onClick={() => handleApprove(selectedDocument.id)}
                            disabled={isProcessing}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                          >
                            ✅ Approve Document
                          </Button>
                          <Button
                            onClick={() => handleReject(selectedDocument.id)}
                            disabled={isProcessing || !rejectionReason.trim()}
                            variant="outline"
                            className="flex-1 border-red-500 text-red-600 hover:bg-red-50"
                          >
                            ❌ Reject Document
                          </Button>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Rejection Reason (if rejecting)
                          </label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            placeholder="Provide a clear reason for rejection..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    )}

                    {selectedDocument.status === 'APPROVED' && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <p className="text-green-800 font-medium">
                          ✅ This document has been approved
                        </p>
                        {selectedDocument.reviewedAt && (
                          <p className="text-sm text-green-600 mt-1">
                            Reviewed on {new Date(selectedDocument.reviewedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    )}

                    {selectedDocument.status === 'REJECTED' && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <p className="text-red-800 font-medium mb-2">
                          ❌ This document was rejected
                        </p>
                        {selectedDocument.rejectionReason && (
                          <p className="text-sm text-red-600">
                            Reason: {selectedDocument.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}
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

          {/* Final Actions */}
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
                  onClick={handleApproveAll}
                  disabled={isProcessing}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
                >
                  {isProcessing ? 'Processing...' : 'Approve & Verify Driver'}
                </Button>
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
                <Button
                  onClick={handleRejectDriver}
                  disabled={isProcessing || !rejectionReason.trim()}
                  variant="outline"
                  className="w-full border-red-600 text-red-600 hover:bg-red-100 font-semibold py-3"
                >
                  {isProcessing ? 'Processing...' : 'Reject Application'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
