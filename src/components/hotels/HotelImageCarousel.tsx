'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface HotelImageCarouselProps {
  images: string[]
}

export function HotelImageCarousel({ images }: HotelImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const openFullscreen = (index: number) => {
    setCurrentIndex(index)
    setIsFullscreen(true)
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  // Placeholder for no images
  if (!images || images.length === 0) {
    return (
      <div className="relative h-56 lg:h-64 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 text-gray-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
            <p className="text-gray-400 text-sm">No images available</p>
          </div>
        </div>
      </div>
    )
  }

  // Single image
  if (images.length === 1) {
    return (
      <>
        <div
          className="relative h-56 lg:h-72 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => openFullscreen(0)}
        >
          <Image src={images[0]} alt="Hotel" fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
        </div>
        <FullscreenModal
          images={images}
          currentIndex={currentIndex}
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    )
  }

  // Two images
  if (images.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-2 h-56 lg:h-72 rounded-xl overflow-hidden">
          {images.map((img, i) => (
            <div key={i} className="relative cursor-pointer group" onClick={() => openFullscreen(i)}>
              <Image src={img} alt={`Hotel ${i + 1}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority={i === 0} />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
          ))}
        </div>
        <FullscreenModal
          images={images}
          currentIndex={currentIndex}
          isOpen={isFullscreen}
          onClose={() => setIsFullscreen(false)}
          onNext={nextImage}
          onPrev={prevImage}
        />
      </>
    )
  }

  // 3+ images — gallery grid: 1 large left + 2 small stacked right + "Show all" overlay
  const displayImages = images.slice(0, 3)
  const remainingCount = images.length - 3

  return (
    <>
      <div className="grid grid-cols-3 gap-2 h-56 lg:h-72 rounded-xl overflow-hidden">
        {/* Main large image */}
        <div
          className="relative col-span-2 row-span-1 cursor-pointer group"
          onClick={() => openFullscreen(0)}
        >
          <Image src={displayImages[0]} alt="Hotel main" fill className="object-cover group-hover:scale-105 transition-transform duration-300" priority />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          {/* Image counter badge */}
          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-2.5 py-1 rounded-full text-xs backdrop-blur-sm flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" /></svg>
            {images.length}
          </div>
        </div>

        {/* Right column — 2 stacked small images */}
        <div className="grid grid-rows-2 gap-2">
          <div
            className="relative cursor-pointer group"
            onClick={() => openFullscreen(1)}
          >
            <Image src={displayImages[1]} alt="Hotel 2" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
          <div
            className="relative cursor-pointer group"
            onClick={() => openFullscreen(2)}
          >
            <Image src={displayImages[2]} alt="Hotel 3" fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            {remainingCount > 0 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                <span className="text-white font-semibold text-sm">+{remainingCount} more</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <FullscreenModal
        images={images}
        currentIndex={currentIndex}
        isOpen={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        onNext={nextImage}
        onPrev={prevImage}
      />
    </>
  )
}

/* ── Fullscreen lightbox modal ── */
function FullscreenModal({
  images,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: {
  images: string[]
  currentIndex: number
  isOpen: boolean
  onClose: () => void
  onNext: () => void
  onPrev: () => void
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="relative max-w-5xl w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <Image
                src={images[currentIndex]}
                alt={`Hotel image ${currentIndex + 1}`}
                width={1200}
                height={800}
                className="object-contain max-h-[85vh] w-full rounded-lg"
              />
            </motion.div>

            {/* Close */}
            <button onClick={onClose} className="absolute -top-2 -right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors backdrop-blur-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={onPrev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={onNext} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full transition-colors backdrop-blur-sm">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}