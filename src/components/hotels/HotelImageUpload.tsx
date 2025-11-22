'use client'

import { useState } from 'react'
import { ImageUploader } from '@/components/shared/ImageUploader'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Button } from '@/components/ui/Button'

interface HotelImageUploadProps {
  hotelId: string
  onUploadComplete?: () => void
}

export function HotelImageUpload({ hotelId, onUploadComplete }: HotelImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleUpload = async (files: File[]) => {
    setUploading(true)
    setError(null)
    setSuccess(false)

    try {
      await hotelsApi.uploadImages(hotelId, files)
      setSuccess(true)
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload images')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <ImageUploader
        onUpload={handleUpload}
        maxFiles={10}
        folder="hotels"
        disabled={uploading}
      />

      {uploading && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">Uploading images...</p>
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">Images uploaded successfully!</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
    </div>
  )
}

