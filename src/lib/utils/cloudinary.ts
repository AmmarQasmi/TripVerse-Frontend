/**
 * Cloudinary utility functions for URL generation and manipulation
 */

export interface CloudinaryTransformOptions {
  width?: number
  height?: number
  quality?: string | number
  format?: string
  crop?: string
  gravity?: string
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicId(url: string): string | null {
  if (!url || typeof url !== 'string') {
    return null
  }

  try {
    // Pattern 1: Standard image URL with extension
    let matches = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp|pdf|docx?)$/i)
    if (matches) {
      return matches[1]
    }

    // Pattern 2: URL without extension (for transformed images)
    matches = url.match(/\/v\d+\/(.+)$/i)
    if (matches) {
      // Remove any transformation parameters
      const publicId = matches[1].split('/').pop()?.split('?')[0]
      if (publicId) {
        return publicId.includes('/') ? matches[1].split('?')[0] : publicId
      }
    }

    // Pattern 3: Direct public_id in URL path
    matches = url.match(/\/image\/upload\/(?:.+\/)?(.+?)(?:\?|$)/i)
    if (matches) {
      return matches[1]
    }

    return null
  } catch (error) {
    console.warn(`Failed to extract public_id from URL: ${url}`, error)
    return null
  }
}

/**
 * Generate Cloudinary URL with transformations
 */
export function getCloudinaryUrl(
  publicId: string,
  options: CloudinaryTransformOptions = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'your-cloud-name'
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`

  const transformations: string[] = []

  if (options.width) transformations.push(`w_${options.width}`)
  if (options.height) transformations.push(`h_${options.height}`)
  if (options.crop) transformations.push(`c_${options.crop}`)
  if (options.gravity) transformations.push(`g_${options.gravity}`)
  if (options.quality) transformations.push(`q_${options.quality}`)
  if (options.format) transformations.push(`f_${options.format}`)

  const transformString = transformations.length > 0 ? `${transformations.join(',')}/` : ''
  return `${baseUrl}/${transformString}${publicId}`
}

/**
 * Generate responsive image URLs for different screen sizes
 */
export function getResponsiveUrls(publicId: string) {
  return {
    thumbnail: getCloudinaryUrl(publicId, {
      width: 300,
      height: 200,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    }),
    medium: getCloudinaryUrl(publicId, {
      width: 800,
      height: 600,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    }),
    large: getCloudinaryUrl(publicId, {
      width: 1200,
      height: 800,
      crop: 'fill',
      quality: 'auto',
      format: 'auto',
    }),
    original: getCloudinaryUrl(publicId, {
      quality: 'auto',
      format: 'auto',
    }),
  }
}

/**
 * Optimize image URL by adding Cloudinary transformations
 * If public_id is available, uses Cloudinary URL
 * Otherwise, returns original URL
 */
export function optimizeImageUrl(
  url: string,
  publicId?: string | null,
  options: CloudinaryTransformOptions = {}
): string {
  if (publicId) {
    return getCloudinaryUrl(publicId, options)
  }

  // Try to extract public_id from URL
  const extractedPublicId = extractPublicId(url)
  if (extractedPublicId) {
    return getCloudinaryUrl(extractedPublicId, options)
  }

  // Fallback to original URL
  return url
}

