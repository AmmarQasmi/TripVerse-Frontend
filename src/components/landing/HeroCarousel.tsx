'use client'

import { useState, useEffect } from 'react'

const carouselImages = [
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80&fit=crop&crop=entropy&auto=format&ixlib=rb-4.0.3',
    alt: 'Mountain landscape with blue and teal tones'
  },
  {
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80&fit=crop&crop=entropy&auto=format&ixlib=rb-4.0.3',
    alt: 'Tropical beach with cyan and blue ocean waters'
  },
  {
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1920&q=80&fit=crop&crop=entropy&auto=format&ixlib=rb-4.0.3',
    alt: 'Forest landscape with deep blue and teal hues'
  },
  {
    url: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1920&q=80&fit=crop&crop=entropy&auto=format&ixlib=rb-4.0.3',
    alt: 'Desert landscape with cool blue and cyan tones'
  },
  {
    url: 'https://images.unsplash.com/photo-1519904981063-b0cf448d479e?w=1920&q=80&fit=crop&crop=entropy&auto=format&ixlib=rb-4.0.3',
    alt: 'Canyon landscape with blue and teal rock formations'
  }
]

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {carouselImages.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img
            src={image.url}
            alt={image.alt}
            className="w-full h-full object-cover"
            data-carousel-image={index === currentIndex}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/30 via-cyan-800/20 to-teal-900/40"></div>
        </div>
      ))}

      {/* Carousel Indicators */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
        {carouselImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-gradient-to-r from-cyan-400 to-teal-400 w-8'
                : 'bg-white bg-opacity-50 hover:bg-opacity-75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

