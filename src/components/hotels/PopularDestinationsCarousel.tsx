'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

// City → 3-image galleries. If local images exist in /public/images/cities/{city}/{city}-0X.jpg they'll be used.
const cityData = [
  { key: 'karachi',  name: 'Karachi, Pakistan',  price: 'PKR 12,000', description: 'Coastal metropolis' },
  { key: 'lahore',   name: 'Lahore, Pakistan',   price: 'PKR 14,000', description: 'Historic city of culture' },
  { key: 'islamabad',name: 'Islamabad, Pakistan',price: 'PKR 18,000', description: 'Green capital' },
  { key: 'peshawar', name: 'Peshawar, Pakistan', price: 'PKR 10,000', description: 'Gateway to the North' },
  { key: 'multan',   name: 'Multan, Pakistan',   price: 'PKR 9,500',  description: 'City of saints' },
  { key: 'faisalabad',name:'Faisalabad, Pakistan',price: 'PKR 9,000', description: 'Industrial hub' },
] as const

const fallback = {
  karachi: [
    'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  ],
  lahore: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
  ],
  islamabad: [
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1529257414772-1960b0e0871e?auto=format&fit=crop&w=1600&q=80',
  ],
  peshawar: [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1529257414772-1960b0e0871e?auto=format&fit=crop&w=1600&q=80',
  ],
  multan: [
    'https://images.unsplash.com/photo-1529257414772-1960b0e0871e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
  ],
  faisalabad: [
    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1600&q=80',
  ],
} as const

const buildCandidates = (key: keyof typeof fallback, i: number) => {
  const base = `/images/cities/${key}/${key}-${String(i+1).padStart(2,'0')}`
  return [
    `${base}.jpg`,
    `${base}.jpeg`,
    `${base}.webp`,
    `${base}.png`,
  ]
}

const getCityImages = (key: keyof typeof fallback) => {
  // Return arrays of candidates for each of the 3 images, followed by remote fallbacks
  return [0,1,2].map((i) => buildCandidates(key, i).concat([fallback[key][i]]))
}

function FallbackImage({ sources, alt }: { sources: string[]; alt: string }) {
  const [idx, setIdx] = useState(0)
  const src = sources[idx]
  return (
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      priority
      onError={() => setIdx((p) => Math.min(p + 1, sources.length - 1))}
    />
  )
}

export function PopularDestinationsCarousel() {
  const [cityIndex, setCityIndex] = useState(2) // default Islamabad
  const [imgIndex, setImgIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setImgIndex((prev) => (prev + 1) % 3)
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const nextCity = () => { setCityIndex((c) => (c + 1) % cityData.length); setImgIndex(0); setIsAutoPlaying(false) }
  const prevCity = () => { setCityIndex((c) => (c === 0 ? cityData.length - 1 : c - 1)); setImgIndex(0); setIsAutoPlaying(false) }
  const goToCity = (i: number) => { setCityIndex(i); setImgIndex(0); setIsAutoPlaying(false) }
  const goToImage = (i: number) => { setImgIndex(i); setIsAutoPlaying(false) }

  return (
    <div className="relative">
      {/* Main Carousel */}
      <div className="relative h-[28rem] overflow-hidden rounded-2xl bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${cityIndex}-${imgIndex}`}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <FallbackImage
              sources={getCityImages(cityData[cityIndex].key as any)[imgIndex]}
              alt={`${cityData[cityIndex].name} ${imgIndex+1}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3 className="text-2xl font-bold text-white mb-2">
                  {cityData[cityIndex].name}
                </h3>
                <p className="text-gray-200 mb-3 text-sm">
                  {cityData[cityIndex].description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-white">
                    Hotels from {cityData[cityIndex].price} / night
                  </span>
                  <Link
                    href={`/client/hotels?location=${cityData[cityIndex].name.split(',')[0]}`}
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
          onClick={prevCity}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextCity}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm"
          onMouseEnter={() => setIsAutoPlaying(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* City Tabs */}
      <div className="flex justify-center flex-wrap gap-2 mt-6">
        {cityData.map((c, i) => (
          <motion.button
            key={c.key}
            onClick={() => goToCity(i)}
            className={`px-3 py-1 rounded-full text-sm border transition-all duration-300 ${i===cityIndex ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-transparent' : 'bg-gray-800/50 text-gray-200 border-gray-700 hover:bg-gray-700/50'}`}
            animate={i === cityIndex ? {
              boxShadow: [
                '0 0 10px rgba(21, 94, 117, 0.4)',
                '0 0 20px rgba(21, 94, 117, 0.8)',
                '0 0 10px rgba(21, 94, 117, 0.4)'
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={i === cityIndex ? {
              border: '2px solid rgba(21, 94, 117, 0.6)'
            } : {}}
          >
            {c.name.split(',')[0]}
          </motion.button>
        ))}
      </div>

      {/* Inner image dots */}
      <div className="flex justify-center space-x-2 mt-3">
        {[0,1,2].map((i) => (
          <button
            key={i}
            onClick={() => goToImage(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${i===imgIndex ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] scale-125' : 'bg-gray-600 hover:bg-gray-400'}`}
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
