'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { HotelCard } from '@/components/hotels/HotelCard'
import { HotelSearchForm } from '@/components/hotels/HotelSearchForm'
import { PopularDestinationsCarousel } from '@/components/hotels/PopularDestinationsCarousel'
import { useHotelSearch } from '@/features/hotels/useHotelSearch'
import { useAuth } from '@/features/auth/useAuth'
import { TransparentHeader } from '@/components/shared/TransparentHeader'

// Helper functions for image fallbacks
const hdCityImages = [
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
]

const hdMountainImages = [
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1529257414772-1960b0e0871e?auto=format&fit=crop&w=1600&q=80',
]

const hdLakeResortImages = [
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
]

const stringHash = (input: string): number => {
  let hash = 0
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) - hash) + input.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const getPoolFor = (location: string, name: string) => {
  const l = `${location} ${name}`.toLowerCase()
  if (/(hunza|skardu|naran|kaghan|shogran|gilgit|fairy meadows|chitral|kalash|duikar)/.test(l)) {
    return hdMountainImages
  }
  if (/(lake|resort|shangrila|shigar|bahria|bhurban)/.test(l)) {
    return hdLakeResortImages
  }
  if (/(karachi|lahore|islamabad|rawalpindi|quetta|gwadar|hyderabad)/.test(l)) {
    return hdCityImages
  }
  return hdMountainImages
}

const pickHDImage = (location: string, name: string) => {
  const pool = getPoolFor(location, name)
  const index = stringHash(`${location}:${name}`) % pool.length
  return pool[index]
}

export default function HotelsPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: user?.city?.region || '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
  })

  // Read query parameters from URL on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const location = urlParams.get('location')
      const checkIn = urlParams.get('checkIn')
      const checkOut = urlParams.get('checkOut')
      const guests = urlParams.get('guests')

      if (location || checkIn || checkOut) {
        const newParams = {
          query: '',
          location: location || searchParams.location,
          checkIn: checkIn || searchParams.checkIn,
          checkOut: checkOut || searchParams.checkOut,
          guests: guests ? parseInt(guests, 10) : searchParams.guests,
          rooms: 1,
        }
        setSearchParams(newParams)
        setShowAllHotels(false) // Filter by location when URL params are present
      }
    }
  }, [])
  const [filters, setFilters] = useState({
    priceRange: [5000, 25000] as [number, number],
    starRating: [] as number[],
    amenities: [] as string[],
    propertyType: [] as string[],
  })
  const [showAllHotels, setShowAllHotels] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const { data: hotels, isLoading } = useHotelSearch({
    location: showAllHotels ? undefined : searchParams.location,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    starRating: filters.starRating,
    amenities: filters.amenities,
  })

  // Use backend hotels data only - filter by price and star rating on frontend
  const displayedHotels = (hotels || [])
    .filter((h: any) => (filters.starRating[0] ? (h.rating || 0) >= filters.starRating[0] : true))
    .filter((h: any) => (h.pricePerNight ? h.pricePerNight >= filters.priceRange[0] && h.pricePerNight <= filters.priceRange[1] : true))

  // Use hotel images from backend, fallback to placeholder if none
  const displayedHotelsWithImages = (displayedHotels as any[]).map((h: any) => {
    // Use backend images if available, otherwise use placeholder
    const hasImages = h.images && h.images.length > 0
    const images = hasImages 
      ? h.images 
      : [pickHDImage(h.location || h.address || '', h.name || '')]
    return {
      ...h,
      images,
    }
  })

  // Auto-load user's region hotels on first visit
  useEffect(() => {
    if (isInitialLoad) {
      if (user?.city?.region) {
        setSearchParams(prev => ({ ...prev, location: user.city.region || '' }))
        setShowAllHotels(false)
      } else {
        setShowAllHotels(true) // Show all hotels if no user location
      }
      setIsInitialLoad(false)
    }
  }, [user?.city?.region, isInitialLoad])

  const handleSearch = (newParams: typeof searchParams) => {
    setSearchParams(newParams)
    setShowAllHotels(false) // When searching, filter by location
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: [5000, 25000] as [number, number],
      starRating: [],
      amenities: [],
      propertyType: [],
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Transparent Header */}
      <TransparentHeader />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80"
            alt="Luxury hotel"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/80 via-[#0f4c75]/70 to-[#0d9488]/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find the perfect place to stay
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Search hotels, compare prices, and book with confidence.
            </p>
            
            {/* Search Form */}
            <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50">
              <HotelSearchForm 
                onSearch={handleSearch}
                initialParams={searchParams}
              />
            </div>
            
            <p className="text-gray-300 mt-4 text-sm">
              Compare hundreds of hotels — powered by TripVerse.
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator removed per design request */}
      </section>

      {/* Popular Destinations */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Popular destinations
            </h2>
            <PopularDestinationsCarousel />
          </motion.div>
        </div>
      </section>

      {/* Hotel Listing Section */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Inline style for custom range theme (scoped) */}
          <style jsx>{`
            .tv-range input[type='range']::-webkit-slider-thumb {
              -webkit-appearance: none;
              height: 22px;
              width: 22px;
              background: #0ea5e9; /* cyan-500 */
              border: 3px solid #ffffff;
              border-radius: 9999px;
              box-shadow: 0 0 0 3px rgba(14,165,233,0.25);
              cursor: pointer;
              position: relative;
              margin-top: -10px; /* center over 8px track */
            }
            .tv-range input[type='range']::-moz-range-thumb {
              height: 22px;
              width: 22px;
              background: #0ea5e9;
              border: 3px solid #ffffff;
              border-radius: 9999px;
              box-shadow: 0 0 0 3px rgba(14,165,233,0.25);
              cursor: pointer;
            }
            .tv-range input[type='range']::-webkit-slider-runnable-track {
              height: 8px;
              background: transparent;
            }
            .tv-range input[type='range']::-moz-range-track {
              height: 8px;
              background: transparent;
            }
          `}</style>
          {/* View Mode Toggle and Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex-1">
              {showAllHotels ? (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    All Available Hotels
                  </h3>
                  <p className="text-gray-300">
                    Showing all active and listed hotels from verified managers
                  </p>
                </div>
              ) : user?.city?.region ? (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Hotels available in {user.city.region}
                  </h3>
                  <p className="text-gray-300">
                    Personalized recommendations based on your location
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Available Hotels
                  </h3>
                  <p className="text-gray-300">
                    Browse all available hotels from verified managers
                  </p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAllHotels(!showAllHotels)}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-75
                  ${showAllHotels 
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                `}
              >
                {showAllHotels ? '📍 Filter by Location' : '🌐 Show All Hotels'}
              </button>
            </div>
          </motion.div>

          {/* Filters Section */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Compact filters card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-gray-900/60 backdrop-blur-md border border-cyan-600/40 p-6 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-xl">Filters</h3>
                  <button
                    onClick={() => setFilters({ priceRange: [5000,25000] as [number,number], starRating: [], amenities: [], propertyType: [] })}
                    className="text-cyan-300 text-sm hover:text-cyan-200"
                  >
                    Clear All
                  </button>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">Price Range</span>
                      <span className="text-gray-400 text-xs">▲</span>
                    </div>
                    {/* current selected max on the right */}
                    <span className="text-cyan-300 font-semibold">PKR {filters.priceRange[1].toLocaleString()}</span>
                  </div>
                  {/* current selected min on the left */}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-blue-400">PKR {filters.priceRange[0].toLocaleString()}</span>
                    <span className="opacity-0">.</span>
                  </div>
                  {/* gradient bar with overlayed inputs */}
                  <div className="relative pb-1 tv-range">
                    <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                    <div className="absolute inset-0 flex items-center gap-4">
                      <input
                        type="range"
                        min={5000}
                        max={50000}
                        step={500}
                        value={filters.priceRange[0]}
                        onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Number(e.target.value), Math.max(f.priceRange[1], Number(e.target.value))] }))}
                        className="w-full appearance-none bg-transparent"
                      />
                      <input
                        type="range"
                        min={5000}
                        max={50000}
                        step={500}
                        value={filters.priceRange[1]}
                        onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Math.min(f.priceRange[0], Number(e.target.value)), Number(e.target.value)] }))}
                        className="w-full appearance-none bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-gray-400 text-sm mt-2">
                    <span>PKR 5,000</span>
                    <span>PKR 50,000</span>
                  </div>
                </div>

                {/* Stars */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-300 text-sm">Star Rating</span>
                    <span className="text-gray-400 text-xs">& up</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[5,4,3,2].map((s)=> (
                      <button key={s} onClick={()=> setFilters(f=>({ ...f, starRating: f.starRating[0] === s ? [] : [s] }))} className={`px-3 py-1 rounded-lg text-sm transition-all ${filters.starRating[0] === s ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}>
                        {Array.from({length:s}).map(()=> '★').join('')}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end mt-auto pt-4">
                  <button onClick={()=> setSearchParams(prev=> ({ ...prev }))} className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/20 transition-all">Apply Filters</button>
                </div>
              </div>
            </div>

            {/* Hotel Cards Grid */}
            <div className="lg:col-span-4">
          {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 animate-pulse">
                      <div className="h-48 bg-gray-700 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                        <div className="h-8 bg-gray-700 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
          ) : displayedHotels && displayedHotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {displayedHotelsWithImages.map((hotel: any, index: number) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/client/hotels/${hotel.id}`}>
                        <HotelCard hotel={hotel} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🏨</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    No hotels found in this area
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search criteria or explore other destinations
                  </p>
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-75"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Region Selection Modal */}
      {/* Region Selection Modal removed per design request */}
    </div>
  )
}
