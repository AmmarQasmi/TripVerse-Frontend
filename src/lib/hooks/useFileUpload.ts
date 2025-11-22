import { useState, useCallback } from 'react'
import { httpClient } from '@/lib/api/http'

interface UseFileUploadOptions {
  endpoint: string
  fieldName?: string
  resourceType?: 'image' | 'raw' | 'auto'
  onSuccess?: (result: any) => void
  onError?: (error: Error) => void
}

export function useFileUpload(options: UseFileUploadOptions) {
  const {
    endpoint,
    fieldName = 'file',
    resourceType = 'auto',
    onSuccess,
    onError,
  } = options

  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const uploadFile = useCallback(
    async (file: File, additionalData?: Record<string, string>): Promise<any> => {
      setUploading(true)
      setError(null)
      setProgress(0)

      try {
        const formData = new FormData()
        formData.append(fieldName, file)

        // Add additional data if provided
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value)
          })
        }

        setProgress(30)
        const result = await httpClient.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
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
    [endpoint, fieldName, onSuccess, onError]
  )

  const uploadMultiple = useCallback(
    async (files: File[], additionalData?: Record<string, string>): Promise<any> => {
      setUploading(true)
      setError(null)
      setProgress(0)

      try {
        const formData = new FormData()

        files.forEach((file) => {
          formData.append(fieldName, file)
        })

        // Add additional data if provided
        if (additionalData) {
          Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value)
          })
        }

        setProgress(30)
        const result = await httpClient.post(endpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
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
    [endpoint, fieldName, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setError(null)
    setProgress(0)
  }, [])

  return {
    uploadFile,
    uploadMultiple,
    uploading,
    error,
    progress,
    reset,
  }
}

