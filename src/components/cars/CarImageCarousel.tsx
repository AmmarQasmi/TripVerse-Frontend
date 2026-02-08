'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface CarImageCarouselProps {
  images: string[]
  alt: string
}

export function CarImageCarousel({ images, alt }: CarImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Keyboard shortcuts for fullscreen
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isFullscreen) return
    if (e.key === 'Escape') setIsFullscreen(false)
    if (e.key === 'ArrowRight') setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1)
    if (e.key === 'ArrowLeft') setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1)
  }, [isFullscreen, images.length])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Lock body scroll when fullscreen is open
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isFullscreen])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    )
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    ))
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  if (!images || images.length === 0) {
    return (
      <div className="relative h-96 bg-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-gray-500 text-center">
          <div className="text-4xl mb-2">🚗</div>
          <p>No images available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Main Image */}
      <div className="relative h-96 md:h-[500px] overflow-hidden rounded-2xl shadow-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <Image
              src={images[currentIndex]}
              alt={`${alt} - Image ${currentIndex + 1}`}
              fill
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-75 backdrop-blur-sm z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-75 backdrop-blur-sm z-10"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-75 backdrop-blur-sm z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>
      </div>

      {/* Thumbnail Navigation */}
      {images.length > 1 && (
        <div className="flex space-x-2 mt-4 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all duration-75 ${
                index === currentIndex 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Image Gallery Grid (Desktop) */}
      {images.length > 4 && (
        <div className="hidden md:grid md:grid-cols-4 gap-2 mt-4">
          {images.slice(0, 4).map((image, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all duration-75 ${
                index === currentIndex 
                  ? 'border-blue-500 scale-105' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <Image
                src={image}
                alt={`${alt} grid ${index + 1}`}
                fill
                className="object-cover"
              />
              {index === currentIndex && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
              {index === 3 && images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white font-semibold">+{images.length - 4}</span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
            onClick={() => setIsFullscreen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition-all z-20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image Counter */}
            <div className="absolute top-6 left-6 bg-white/10 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm z-20">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Main Fullscreen Image */}
            <motion.div
              key={`fs-${currentIndex}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative w-[90vw] h-[85vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={images[currentIndex]}
                alt={`${alt} - Fullscreen ${currentIndex + 1}`}
                fill
                className="object-contain"
                priority
                sizes="90vw"
              />
            </motion.div>

            {/* Navigation Arrows in Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevSlide() }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-20"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextSlide() }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-4 rounded-full transition-all z-20"
                >
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Thumbnail strip in Fullscreen */}
            {images.length > 1 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20" onClick={(e) => e.stopPropagation()}>
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentIndex
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-white/30 hover:border-white/60 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
