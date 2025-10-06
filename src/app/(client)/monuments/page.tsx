'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useRecognition } from '@/features/monuments/useRecognition'

export default function MonumentsPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const { recognizeMonument, data: recognitionResult, isLoading } = useRecognition()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleRecognize = async () => {
    if (!selectedFile) return
    
    setIsProcessing(true)
    try {
      await recognizeMonument(selectedFile)
    } catch (error) {
      console.error('Recognition failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const resetUpload = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Monument Recognition
        </h1>
        <p className="text-lg text-gray-600">
          Upload a photo of a historical monument to learn about its history and significance.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Monument Photo</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedFile ? (
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Drop your photo here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports JPG, PNG, and WebP formats up to 10MB
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <img
                      src={previewUrl!}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <button
                      onClick={resetUpload}
                      className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleRecognize}
                      disabled={isProcessing || isLoading}
                      className="flex-1"
                    >
                      {isProcessing || isLoading ? 'Recognizing...' : 'Recognize Monument'}
                    </Button>
                    <Button variant="outline" onClick={resetUpload}>
                      Choose Different Photo
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Tips for Better Recognition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-600">
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Take photos in good lighting conditions</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Ensure the monument is clearly visible and not obstructed</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Include distinctive architectural features</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span>Avoid extreme angles or distant shots</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {recognitionResult ? (
            <Card>
              <CardHeader>
                <CardTitle>Recognition Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-500">Confidence:</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${recognitionResult.confidence * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">
                      {Math.round(recognitionResult.confidence * 100)}%
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {recognitionResult.monument.name}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {recognitionResult.monument.description}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">Location:</span>
                        <p className="text-gray-900">{recognitionResult.monument.location}</p>
                      </div>
                      {recognitionResult.monument.historicalPeriod && (
                        <div>
                          <span className="font-medium text-gray-500">Period:</span>
                          <p className="text-gray-900">{recognitionResult.monument.historicalPeriod}</p>
                        </div>
                      )}
                      {recognitionResult.monument.architecturalStyle && (
                        <div>
                          <span className="font-medium text-gray-500">Style:</span>
                          <p className="text-gray-900">{recognitionResult.monument.architecturalStyle}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <Button className="w-full">
                      Export Information
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-500 text-lg mb-4">
                  🏛️ Upload a photo to get started
                </div>
                <p className="text-gray-400">
                  Our AI will analyze your image and provide information about the monument.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Recent Recognitions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Recognitions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500 py-8">
                <p>No recent recognitions</p>
                <p className="text-sm">Your recognition history will appear here</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
