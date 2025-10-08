'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const destinations = [
  {
    id: 1,
    name: 'Lahore',
    country: 'Pakistan',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 3,500',
    description: 'Cultural capital',
    carCount: '150+ cars available'
  },
  {
    id: 2,
    name: 'Karachi',
    country: 'Pakistan',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 4,200',
    description: 'Business hub',
    carCount: '200+ cars available'
  },
  {
    id: 3,
    name: 'Islamabad',
    country: 'Pakistan',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 3,800',
    description: 'Capital city',
    carCount: '120+ cars available'
  },
  {
    id: 4,
    name: 'Dubai',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 8,500',
    description: 'Luxury destination',
    carCount: '300+ cars available'
  },
  {
    id: 5,
    name: 'Abu Dhabi',
    country: 'UAE',
    image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 7,200',
    description: 'Modern metropolis',
    carCount: '180+ cars available'
  },
  {
    id: 6,
    name: 'Riyadh',
    country: 'Saudi Arabia',
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 6,800',
    description: 'Business center',
    carCount: '220+ cars available'
  },
  {
    id: 7,
    name: 'Doha',
    country: 'Qatar',
    image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 7,500',
    description: 'Futuristic city',
    carCount: '160+ cars available'
  },
  {
    id: 8,
    name: 'Kuwait City',
    country: 'Kuwait',
    image: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80&auto=format&fit=crop',
    averageRate: 'PKR 6,200',
    description: 'Coastal beauty',
    carCount: '140+ cars available'
  }
]

export function CarDestinationsCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === destinations.length - 1 ? 0 : prevIndex + 1
      )
    }, 5000)

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
      <div className="relative h-80 overflow-hidden rounded-2xl shadow-2xl">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            
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
                <p className="text-gray-200 mb-3 text-lg">
                  {destinations[currentIndex].description} • {destinations[currentIndex].country}
                </p>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-lg font-semibold text-white block">
                      From {destinations[currentIndex].averageRate} / day
                    </span>
                    <span className="text-sm text-gray-300">
                      {destinations[currentIndex].carCount}
                    </span>
                  </div>
                  <Link
                    href={`/client/cars?location=${destinations[currentIndex].name}`}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  >
                    View Cars
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm z-10"
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

      {/* City Grid for Desktop */}
      <div className="hidden lg:grid lg:grid-cols-4 gap-4 mt-8">
        {destinations.slice(0, 4).map((destination, index) => (
          <Link
            key={destination.id}
            href={`/client/cars?location=${destination.name}`}
            className="group relative h-32 overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-3 left-3 right-3">
              <h4 className="text-white font-semibold text-sm">
                {destination.name}
              </h4>
              <p className="text-gray-300 text-xs">
                From {destination.averageRate}/day
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
