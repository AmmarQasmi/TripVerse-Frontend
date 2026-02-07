'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { usePopularDestinations } from '@/features/hotels/useHotelSearch'

// City image map — curated Unsplash images for Pakistan cities
const cityImages: Record<string, string> = {
  karachi:    'https://images.unsplash.com/photo-1567530877351-f8be0e893491?auto=format&fit=crop&w=800&q=80',
  lahore:     'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=800&q=80',
  islamabad:  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  peshawar:   'https://images.unsplash.com/photo-1529257414772-1960b0e0871e?auto=format&fit=crop&w=800&q=80',
  multan:     'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
  faisalabad: 'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=800&q=80',
  quetta:     'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80',
  rawalpindi: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80',
  murree:     'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=800&q=80',
  swat:       'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
  hunza:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
  skardu:     'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
  naran:      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
  gilgit:     'https://images.unsplash.com/photo-1505682634904-d7c8d95cdc50?auto=format&fit=crop&w=800&q=80',
  gwadar:     'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
  hyderabad:  'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=80',
}

const defaultImage = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80'

function getCityImage(cityName: string): string {
  const key = cityName.toLowerCase().replace(/\s+/g, '')
  return cityImages[key] || defaultImage
}

interface PopularDestinationsCarouselProps {
  onCitySelect?: (city: string) => void
}

export function PopularDestinationsCarousel({ onCitySelect }: PopularDestinationsCarouselProps) {
  const { data: destinations, isLoading } = usePopularDestinations()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="relative h-64 rounded-2xl overflow-hidden bg-gray-800/50 animate-pulse">
            <div className="absolute inset-0 bg-gray-700/40" />
            <div className="absolute bottom-0 left-0 right-0 p-5 space-y-2">
              <div className="h-5 bg-gray-600 rounded w-2/3" />
              <div className="h-4 bg-gray-600 rounded w-1/2" />
              <div className="h-3 bg-gray-600 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!destinations || destinations.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
        <p className="text-gray-400">No destinations available yet</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {destinations.map((dest, index) => (
        <motion.div
          key={dest.city}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.06 }}
          viewport={{ once: true }}
          onClick={() => onCitySelect?.(dest.city)}
          className="group relative h-64 rounded-2xl overflow-hidden cursor-pointer"
        >
          {/* Background Image */}
          <Image
            src={getCityImage(dest.city)}
            alt={dest.city}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent group-hover:from-black/90 transition-all duration-300" />

          {/* Booking Badge */}
          {dest.total_bookings > 0 && (
            <div className="absolute top-3 right-3 bg-cyan-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
              </svg>
              {dest.total_bookings} booked
            </div>
          )}

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
              {dest.city}
            </h3>
            <p className="text-gray-300 text-sm mb-2">{dest.region}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-300 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                  {dest.hotel_count} hotel{dest.hotel_count !== 1 ? 's' : ''}
                </span>
              </div>
              {dest.starting_price > 0 && (
                <span className="text-cyan-400 font-semibold text-sm">
                  From PKR {dest.starting_price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Hover CTA */}
            <div className="mt-3 overflow-hidden max-h-0 group-hover:max-h-12 transition-all duration-300">
              <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white text-center py-2 rounded-lg text-sm font-semibold">
                View Hotels
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
