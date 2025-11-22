'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { validateImageFile, formatFileSize } from '@/lib/utils/image-optimization'

interface ImageUploaderProps {
  onUpload: (files: File[]) => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
  folder?: string
  disabled?: boolean
  className?: string
}

export function ImageUploader({
  onUpload,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  folder = 'uploads',
  disabled = false,
  className = '',
}: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return

      const fileArray = Array.from(files)
      const newFiles: File[] = []
      const newPreviews: string[] = []
      const newErrors: string[] = []

      fileArray.forEach((file) => {
        // Check max files
        if (selectedFiles.length + newFiles.length >= maxFiles) {
          newErrors.push(`Maximum ${maxFiles} files allowed`)
          return
        }

        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
          newErrors.push(`${file.name}: ${validation.error}`)
          return
        }

        // Check file size
        if (file.size > maxSize) {
          newErrors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)}`)
          return
        }

        newFiles.push(file)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          if (e.target?.result) {
            newPreviews.push(e.target.result as string)
            setPreviews((prev) => [...prev, ...newPreviews])
          }
        }
        reader.readAsDataURL(file)
      })

      setSelectedFiles((prev) => [...prev, ...newFiles])
      setErrors((prev) => [...prev, ...newErrors])
    },
    [selectedFiles, maxFiles, maxSize]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleFileSelect(e.dataTransfer.files)
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
    setPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpload = () => {
    if (selectedFiles.length === 0) return
    onUpload(selectedFiles)
    setSelectedFiles([])
    setPreviews([])
    setErrors([])
  }

  const clearAll = () => {
    setSelectedFiles([])
    setPreviews([])
    setErrors([])
  }

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          disabled
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
            : 'border-gray-300 hover:border-blue-500 bg-white cursor-pointer'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={acceptedTypes.join(',')}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
        />

        {selectedFiles.length === 0 ? (
          <div onClick={() => !disabled && fileInputRef.current?.click()}>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {acceptedTypes.map((t) => t.split('/')[1].toUpperCase()).join(', ')} up to{' '}
              {formatFileSize(maxSize)}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {selectedFiles[index]?.name}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpload} disabled={disabled || selectedFiles.length === 0}>
                Upload {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''}
              </Button>
              <Button onClick={clearAll} variant="outline" disabled={disabled}>
                Clear
              </Button>
            </div>
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-1">Errors:</p>
          <ul className="text-xs text-red-600 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

