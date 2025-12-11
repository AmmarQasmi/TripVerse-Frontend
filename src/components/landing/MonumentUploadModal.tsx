'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { useRecognition } from '@/features/monuments/useRecognition'

interface MonumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MonumentUploadModal({ isOpen, onClose }: MonumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { recognizeMonument, isLoading, error } = useRecognition()

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    try {
      const result = await recognizeMonument(selectedFile)
      
      // Redirect to results page
      if (result?.id) {
        router.push(`/client/monuments/${result.id}`)
        onClose()
        setSelectedFile(null)
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        setPreviewUrl(null)
      }
    } catch (err: any) {
      console.error('Recognition failed:', err)
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to recognize monument. Please try again.'
      alert(errorMessage)
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                🏛️ Monument Recognition
              </h2>
              <Link
                href="/client/monuments"
                onClick={handleClose}
                className="text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all shadow-md hover:shadow-lg"
                title="View History"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </Link>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-all duration-75"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              Upload a picture to identify a monument and learn about its history!
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <p className="text-xs text-blue-800">
                <strong>💡 Tip:</strong> Google Vision only recognizes famous landmarks (e.g., Eiffel Tower, Taj Mahal, Statue of Liberty, Big Ben, Colosseum). Regular buildings or personal photos may not be detected.
              </p>
            </div>
            
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 transition-all duration-75 group"
                style={{
                  borderImage: 'linear-gradient(90deg, #3b82f6, #10b981) 1',
                  borderImageSlice: 1,
                }}
              >
                <svg className="mx-auto h-12 w-12 text-transparent bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text mb-4 group-hover:from-blue-700 group-hover:to-green-700 transition-colors" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-2 group-hover:text-blue-700 transition-colors">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 group-hover:text-green-600 transition-colors">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                  }}
                  className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">
                {error instanceof Error ? error.message : 'Failed to recognize monument. Please try again.'}
              </p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}
              className="flex-1 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Recognizing...' : 'Upload & Identify'}
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 bg-gray-800 border-gray-700 text-gray-200 font-medium"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

