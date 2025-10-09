'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const destinations = [
  {
    id: 1,
    name: 'Dubai, UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 8,500',
    description: 'Luxury desert city'
  },
  {
    id: 2,
    name: 'Paris, France',
    image: 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 12,000',
    description: 'City of lights'
  },
  {
    id: 3,
    name: 'Tokyo, Japan',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 15,000',
    description: 'Modern metropolis'
  },
  {
    id: 4,
    name: 'New York, USA',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 18,000',
    description: 'The big apple'
  },
  {
    id: 5,
    name: 'London, UK',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 14,000',
    description: 'Royal heritage'
  },
  {
    id: 6,
    name: 'Singapore',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 10,000',
    description: 'Garden city'
  },
  {
    id: 7,
    name: 'Sydney, Australia',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 13,000',
    description: 'Harbor city'
  },
  {
    id: 8,
    name: 'Bangkok, Thailand',
    image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&q=80&auto=format&fit=crop',
    price: 'PKR 6,500',
    description: 'Temple city'
  }
]

export function PopularDestinationsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === destinations.length - 1 ? 0 : prevIndex + 1
      )
    }, 4000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === destinations.length - 1 ? 0 : prevIndex + 1
    )
    setIsAutoPlaying(false)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex => 
      prevIndex === 0 ? destinations.length - 1 : prevIndex - 1
    ))
    setIsAutoPlaying(false)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
  }

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="relative h-80 overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={destinations[currentIndex].image}
              alt={destinations[currentIndex].name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-3xl font-bold text-white mb-2">
                  {destinations[currentIndex].name}
                </h3>
                <p className="text-gray-200 mb-3">
                  {destinations[currentIndex].description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-semibold text-white">
                    Hotels from {destinations[currentIndex].price} / night
                  </span>
                  <Link
                    href={`/client/hotels?location=${destinations[currentIndex].name.split(',')[0]}`}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    Explore
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Thumbnail Navigation */}
      <div className="flex justify-center space-x-2 mt-6">
        {destinations.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] scale-125' 
                : 'bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="bg-gray-800/50 hover:bg-gray-700/50 text-white px-4 py-2 rounded-lg transition-all duration-300 backdrop-blur-sm flex items-center space-x-2"
        >
          <span>{isAutoPlaying ? '⏸️' : '▶️'}</span>
          <span className="text-sm">
            {isAutoPlaying ? 'Pause' : 'Play'} slideshow
          </span>
        </button>
      </div>
    </div>
  )
}
