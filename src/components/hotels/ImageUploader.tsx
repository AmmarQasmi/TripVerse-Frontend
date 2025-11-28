'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'

interface ImageUploaderProps {
  onImagesSelected: (files: File[]) => void
  maxImages?: number
  existingImages?: string[]
}

export function ImageUploader({ onImagesSelected, maxImages = 10, existingImages = [] }: ImageUploaderProps) {
  const [previewUrls, setPreviewUrls] = useState<string[]>(existingImages)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = maxImages - previewUrls.length
    
    if (files.length > remainingSlots) {
      alert(`You can only upload ${remainingSlots} more image(s)`)
      return
    }

    const newFiles = files.slice(0, remainingSlots)
    setSelectedFiles(prev => [...prev, ...newFiles])

    // Create preview URLs
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(prev => [...prev, ...newPreviewUrls])

    onImagesSelected([...selectedFiles, ...newFiles])
  }

  const removeImage = (index: number) => {
    const isExisting = index < existingImages.length
    if (isExisting) {
      // Remove from existing images
      const newExisting = existingImages.filter((_, i) => i !== index)
      setPreviewUrls(newExisting)
    } else {
      // Remove from newly selected files
      const adjustedIndex = index - existingImages.length
      const newFiles = selectedFiles.filter((_, i) => i !== adjustedIndex)
      const newPreviews = previewUrls.filter((_, i) => i !== index)
      setSelectedFiles(newFiles)
      setPreviewUrls(newPreviews)
      onImagesSelected(newFiles)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Images ({previewUrls.length} / {maxImages})
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={previewUrls.length >= maxImages}
        >
          Add Images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <Card key={index} className="relative group">
              <CardContent className="p-0">
                <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    aria-label="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {previewUrls.length === 0 && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">No images selected</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
          >
            Select Images
          </Button>
        </div>
      )}
    </div>
  )
}

