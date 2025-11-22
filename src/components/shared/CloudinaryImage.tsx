'use client'

import Image from 'next/image'
import { optimizeImageUrl, getResponsiveUrls } from '@/lib/utils/cloudinary'

interface CloudinaryImageProps {
  publicId?: string | null
  src: string
  alt: string
  width?: number
  height?: number
  responsive?: boolean
  className?: string
  priority?: boolean
  fill?: boolean
  sizes?: string
}

export function CloudinaryImage({
  publicId,
  src,
  alt,
  width,
  height,
  responsive = false,
  className = '',
  priority = false,
  fill = false,
  sizes,
}: CloudinaryImageProps) {
  // If public_id exists and responsive is enabled, use responsive URLs
  if (publicId && responsive) {
    const responsiveUrls = getResponsiveUrls(publicId)
    
    return (
      <picture className={className}>
        <source media="(max-width: 640px)" srcSet={responsiveUrls.thumbnail} />
        <source media="(max-width: 1024px)" srcSet={responsiveUrls.medium} />
        <source media="(min-width: 1025px)" srcSet={responsiveUrls.large} />
        <Image
          src={responsiveUrls.original}
          alt={alt}
          width={width}
          height={height}
          className={className}
          priority={priority}
          fill={fill}
          sizes={sizes || '(max-width: 640px) 300px, (max-width: 1024px) 800px, 1200px'}
        />
      </picture>
    )
  }

  // If public_id exists, use optimized URL
  if (publicId) {
    const optimizedUrl = optimizeImageUrl(src, publicId, {
      width,
      height,
      quality: 'auto',
      format: 'auto',
    })

    if (fill) {
      return (
        <Image
          src={optimizedUrl}
          alt={alt}
          fill
          className={className}
          priority={priority}
          sizes={sizes}
        />
      )
    }

    return (
      <Image
        src={optimizedUrl}
        alt={alt}
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    )
  }

  // Fallback to original URL
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes}
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  )
}

