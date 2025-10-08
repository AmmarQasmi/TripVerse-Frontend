'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'

interface MonumentUploadModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MonumentUploadModal({ isOpen, onClose }: MonumentUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleUpload = () => {
    // This will be implemented when the feature is ready
    alert('Monument recognition feature coming soon! 🏛️')
    onClose()
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleClose = () => {
    onClose()
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              🏛️ Monument Recognition
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
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
            
            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-primary border-opacity-50 rounded-xl p-8 text-center cursor-pointer hover:border-primary transition-colors"
              >
                <svg className="mx-auto h-12 w-12 text-primary mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500">
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

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              <span className="font-semibold">Coming Soon! 🚀</span><br />
              Our AI-powered monument recognition feature is under development. 
              Upload your image to try it out!
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              Upload & Identify
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

