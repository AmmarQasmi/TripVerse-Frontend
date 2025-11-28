'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface ImageGalleryProps {
  images: Array<{
    id?: number | string
    url: string
    public_id?: string
  }>
  onDelete?: (imageId: number | string) => void
  onReorder?: (imageIds: (number | string)[]) => void
  isDeleting?: boolean
}

export function ImageGallery({ images, onDelete, onReorder, isDeleting = false }: ImageGalleryProps) {
  const [deletingId, setDeletingId] = useState<number | string | null>(null)

  const handleDelete = async (imageId: number | string) => {
    if (!onDelete) return
    
    if (window.confirm('Are you sure you want to delete this image?')) {
      setDeletingId(imageId)
      try {
        await onDelete(imageId)
      } finally {
        setDeletingId(null)
      }
    }
  }

  if (images.length === 0) {
    return (
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500">No images uploaded</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <Card key={image.id || index} className="relative group">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              <img
                src={image.url}
                alt={`Hotel image ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {onDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(image.id || index)}
                  disabled={isDeleting || deletingId === (image.id || index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  aria-label="Delete image"
                >
                  {deletingId === (image.id || index) ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </button>
              )}
              {index === 0 && (
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  Main
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

