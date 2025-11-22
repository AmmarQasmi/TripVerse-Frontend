import { useState, useCallback } from 'react'
import { uploadApi, UploadResult, MultipleUploadResult } from '@/lib/api/upload.api'
import { validateImageFile, compressImage } from '@/lib/utils/image-optimization'

interface UseImageUploadOptions {
  folder?: string
  compress?: boolean
  maxSize?: number
  onSuccess?: (result: UploadResult | MultipleUploadResult) => void
  onError?: (error: Error) => void
}

export function useImageUpload(options: UseImageUploadOptions = {}) {
  const { folder = 'uploads', compress = false, maxSize, onSuccess, onError } = options

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const uploadImage = useCallback(
    async (file: File): Promise<UploadResult> => {
      setUploading(true)
      setError(null)
      setProgress(0)

      try {
        // Validate file
        const validation = validateImageFile(file)
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid file')
        }

        // Compress if needed
        let fileToUpload = file
        if (compress) {
          fileToUpload = await compressImage(file, maxSize)
        }

        // Upload
        setProgress(50)
        const result = await uploadApi.uploadImage(fileToUpload, folder)
        setProgress(100)

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed')
        setError(error.message)
        if (onError) {
          onError(error)
        }
        throw error
      } finally {
        setUploading(false)
        setTimeout(() => setProgress(0), 1000)
      }
    },
    [folder, compress, maxSize, onSuccess, onError]
  )

  const uploadMultiple = useCallback(
    async (files: File[]): Promise<MultipleUploadResult> => {
      setUploading(true)
      setError(null)
      setProgress(0)

      try {
        // Validate all files
        for (const file of files) {
          const validation = validateImageFile(file)
          if (!validation.valid) {
            throw new Error(validation.error || `Invalid file: ${file.name}`)
          }
        }

        // Compress if needed
        let filesToUpload = files
        if (compress) {
          setProgress(10)
          filesToUpload = await Promise.all(
            files.map((file) => compressImage(file, maxSize))
          )
          setProgress(30)
        }

        // Upload
        const result = await uploadApi.uploadMultipleImages(filesToUpload, folder)
        setProgress(100)

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Upload failed')
        setError(error.message)
        if (onError) {
          onError(error)
        }
        throw error
      } finally {
        setUploading(false)
        setTimeout(() => setProgress(0), 1000)
      }
    },
    [folder, compress, maxSize, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setError(null)
    setProgress(0)
  }, [])

  return {
    uploadImage,
    uploadMultiple,
    uploading,
    error,
    progress,
    reset,
  }
}

