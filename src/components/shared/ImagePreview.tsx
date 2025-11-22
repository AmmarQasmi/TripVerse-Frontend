'use client'

import { useState } from 'react'
import { CloudinaryImage } from './CloudinaryImage'
import { getResponsiveUrls } from '@/lib/utils/cloudinary'

interface ImagePreviewProps {
  src: string
  publicId?: string | null
  alt?: string
  className?: string
  showResponsive?: boolean
}

export function ImagePreview({
  src,
  publicId,
  alt = 'Preview',
  className = '',
  showResponsive = false,
}: ImagePreviewProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const responsiveUrls = publicId ? getResponsiveUrls(publicId) : null

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {error ? (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
          <p className="text-gray-500">Failed to load image</p>
        </div>
      ) : (
        <>
          <div className="relative w-full h-64">
            <CloudinaryImage
              src={src}
              publicId={publicId}
              alt={alt}
              fill
              className={`rounded-lg object-cover ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
            />
          </div>

          {showResponsive && responsiveUrls && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-2">Responsive URLs:</p>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="font-medium">Thumbnail:</span>{' '}
                  <a href={responsiveUrls.thumbnail} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {responsiveUrls.thumbnail}
                  </a>
                </div>
                <div>
                  <span className="font-medium">Medium:</span>{' '}
                  <a href={responsiveUrls.medium} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {responsiveUrls.medium}
                  </a>
                </div>
                <div>
                  <span className="font-medium">Large:</span>{' '}
                  <a href={responsiveUrls.large} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {responsiveUrls.large}
                  </a>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

