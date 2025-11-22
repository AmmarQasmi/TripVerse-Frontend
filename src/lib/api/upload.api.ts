import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'

export interface UploadResult {
  url: string
  public_id: string
}

export interface MultipleUploadResult {
  message: string
  images: Array<{
    url: string
    public_id: string
  }>
}

export const uploadApi = {
  /**
   * Upload single image
   */
  uploadImage: async (file: File, folder: string): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('image', file)

    const response = await httpClient.post<UploadResult>(
      `/upload/images/${folder}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response
  },

  /**
   * Upload multiple images
   */
  uploadMultipleImages: async (
    files: File[],
    folder: string
  ): Promise<MultipleUploadResult> => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    const response = await httpClient.post<MultipleUploadResult>(
      `/upload/images/${folder}/multiple`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )

    return response
  },

  /**
   * Delete image by public ID
   */
  deleteImage: async (publicId: string): Promise<{ message: string }> => {
    return httpClient.delete(`/upload/images/${publicId}`)
  },

  /**
   * Get optimized URL for an image
   */
  getOptimizedUrl: (publicId: string, options?: {
    width?: number
    height?: number
    quality?: string
    format?: string
    crop?: string
  }): string => {
    // This would typically call a backend endpoint, but for now
    // we'll generate it on the frontend using Cloudinary URL format
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'}/image/upload`
    const transformations = []
    
    if (options?.width) transformations.push(`w_${options.width}`)
    if (options?.height) transformations.push(`h_${options.height}`)
    if (options?.crop) transformations.push(`c_${options.crop}`)
    if (options?.quality) transformations.push(`q_${options.quality}`)
    if (options?.format) transformations.push(`f_${options.format}`)
    
    const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : ''
    return `${baseUrl}/${transformString}${publicId}`
  },
}

