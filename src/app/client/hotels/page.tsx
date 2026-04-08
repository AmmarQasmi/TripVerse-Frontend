'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { HotelCard } from '@/components/hotels/HotelCard'
import { HotelSearchForm } from '@/components/hotels/HotelSearchForm'
import { BookingModal } from '@/components/hotels/BookingModal'
import { BookingSuccessModal } from '@/components/hotels/BookingSuccessModal'
import { PopularDestinationsCarousel } from '@/components/hotels/PopularDestinationsCarousel'
import { HotelLocationFilters } from '@/components/hotels/HotelLocationFilters'
import { useHotelSearch } from '@/features/hotels/useHotelSearch'
import { useAuth } from '@/features/auth/useAuth'
import { ExternalHotelsSection } from '@/components/hotels/ExternalHotelsSection'
import { Hotel } from '@/types'
import { BookingResponse } from '@/lib/api/bookings.api'

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
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const resultsRef = useRef<HTMLDivElement>(null)
  const [searchParams, setSearchParams] = useState({
    query: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
  })
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Booking modal state
  const [bookingHotel, setBookingHotel] = useState<Hotel | null>(null)
  const [successBooking, setSuccessBooking] = useState<BookingResponse | null>(null)

  // Read URL params immediately on mount (before auth check)
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
          location: location || '',
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          guests: guests ? parseInt(guests, 10) : 1,
          rooms: 1,
        }
        setSearchParams(newParams)
        setShowAllHotels(false) // Filter by location when URL params are present
      }
    }
  }, []) // Run immediately on mount

  // Check authentication and restore cached data on mount
  useEffect(() => {
    if (authLoading) return // Wait for auth to load
    
    if (!user) {
      // User not authenticated - redirect to login with current URL as redirect
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }

    // User is authenticated - proceed with restoring cached data
    if (typeof window !== 'undefined' && !hasCheckedAuth) {
      setHasCheckedAuth(true)
      
      // First, try to get data from URL params
      const urlParams = new URLSearchParams(window.location.search)
      const location = urlParams.get('location')
      const checkIn = urlParams.get('checkIn')
      const checkOut = urlParams.get('checkOut')
      const guests = urlParams.get('guests')

      if (location || checkIn || checkOut) {
        // Use URL params if available
        const newParams = {
          query: '',
          location: location || '',
          checkIn: checkIn || '',
          checkOut: checkOut || '',
          guests: guests ? parseInt(guests, 10) : 1,
          rooms: 1,
        }
        setSearchParams(newParams)
        setShowAllHotels(false) // Filter by location when URL params are present
      } else {
        // Try to restore from cache
        const cachedData = localStorage.getItem('cached_hotel_search')
        if (cachedData) {
          try {
            const cached = JSON.parse(cachedData)
            if (cached.location || cached.checkIn || cached.checkOut) {
              const newParams = {
                query: '',
                location: cached.location || '',
                checkIn: cached.checkIn || '',
                checkOut: cached.checkOut || '',
                guests: cached.guests ? parseInt(cached.guests, 10) : 1,
                rooms: 1,
              }
              setSearchParams(newParams)
              setShowAllHotels(false)
              
              // Update URL to reflect cached data
              const newUrlParams = new URLSearchParams()
              if (cached.location) newUrlParams.set('location', cached.location)
              if (cached.checkIn) newUrlParams.set('checkIn', cached.checkIn)
              if (cached.checkOut) newUrlParams.set('checkOut', cached.checkOut)
              if (cached.guests) newUrlParams.set('guests', cached.guests)
              window.history.replaceState({}, '', `${window.location.pathname}?${newUrlParams.toString()}`)
            }
          } catch (error) {
            console.error('Error parsing cached hotel search data:', error)
          }
        }
      }
    }
  }, [user, authLoading, router, hasCheckedAuth])
  const [filters, setFilters] = useState({
    priceRange: [0, 25000] as [number, number],
    starRating: [] as number[],
    amenities: [] as string[],
    propertyType: [] as string[],
  })
  const [showAllHotels, setShowAllHotels] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [internalPage, setInternalPage] = useState(1)
  const [locationFilter, setLocationFilter] = useState<{ city?: string; region?: string }>({})
  
  const { data: hotels, isLoading } = useHotelSearch({
    location: showAllHotels ? undefined : searchParams.location,
    checkIn: searchParams.checkIn || undefined,
    checkOut: searchParams.checkOut || undefined,
    guests: searchParams.guests,
    rooms: searchParams.rooms,
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

  const HOTELS_PER_PAGE = 6
  const internalTotalPages = Math.ceil(displayedHotelsWithImages.length / HOTELS_PER_PAGE)
  const paginatedInternalHotels = displayedHotelsWithImages.slice(
    (internalPage - 1) * HOTELS_PER_PAGE,
    internalPage * HOTELS_PER_PAGE
  )

  // Reset to page 1 when the search context changes
  useEffect(() => {
    setInternalPage(1)
  }, [searchParams.location, showAllHotels])

  // Mark initial load as complete after auth check
  useEffect(() => {
    if (hasCheckedAuth) {
      setIsInitialLoad(false)
    }
  }, [hasCheckedAuth])

  const handleSearch = (newParams: typeof searchParams) => {
    setSearchParams(newParams)
    setShowAllHotels(false) // When searching, filter by location
    // Smooth scroll to results after a short delay for data to load
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 300)
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, 25000] as [number, number],
      starRating: [],
      amenities: [],
      propertyType: [],
    })
    setLocationFilter({})
  }

  const handleLocationFilterChange = (lf: { city?: string; region?: string }) => {
    setLocationFilter(lf)
    // When city filter is set, update the search location too
    if (lf.city) {
      setSearchParams(prev => ({ ...prev, location: lf.city || '' }))
      setShowAllHotels(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-0">
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
              Compare hundreds of hotels powered by TripVerse.
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator removed per design request */}
      </section>

      {/* Where We Operate */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-2">
              Book hotels in these cities
            </h2>
            <p className="text-gray-400 text-center text-sm mb-12">
              Cities where TripVerse has verified hotel listings
            </p>
            <PopularDestinationsCarousel
                onCitySelect={(city) => {
                  setSearchParams((prev) => ({ ...prev, location: city }))
                  setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
                }}
              />
          </motion.div>
        </div>
      </section>

      {/* Hotel Listing Section */}
      <section ref={resultsRef} className="py-16 px-4">
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
              {searchParams.location ? (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Hotels in {searchParams.location}
                  </h3>
                  <p className="text-gray-300">
                    {searchParams.checkIn && searchParams.checkOut 
                      ? `${searchParams.checkIn} → ${searchParams.checkOut} · ${searchParams.guests} guest${searchParams.guests > 1 ? 's' : ''} · ${searchParams.rooms} room${searchParams.rooms > 1 ? 's' : ''}`
                      : 'Select dates to check real-time availability'
                    }
                    {displayedHotels.length > 0 && ` · ${displayedHotels.length} result${displayedHotels.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
              ) : showAllHotels ? (
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
                {showAllHotels ? (
                  <>
                    <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                    Filter by Location
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 inline mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" /></svg>
                    Show All Hotels
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Location Filters */}
          <div className="mb-6">
            <HotelLocationFilters
              onFilterChange={handleLocationFilterChange}
              initialCity={searchParams.location || ''}
            />
          </div>

          {/* Filters Section */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Compact filters card */}
            <div className="lg:col-span-1">
              <div className="relative overflow-hidden rounded-2xl bg-gray-900/60 backdrop-blur-md border border-cyan-600/40 p-6 h-full flex flex-col">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
                  style={{ backgroundImage: 'url(/images/cities/karachi/karachi-03.png)' }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900/75 via-gray-900/65 to-slate-900/70 pointer-events-none" />

                <div className="relative z-10 h-full flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-white font-semibold text-xl">Filters</h3>
                  <button
                    onClick={() => setFilters({ priceRange: [0,25000] as [number,number], starRating: [], amenities: [], propertyType: [] })}
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
                        min={0}
                        max={50000}
                        step={500}
                        value={filters.priceRange[0]}
                        onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Number(e.target.value), Math.max(f.priceRange[1], Number(e.target.value))] }))}
                        className="w-full appearance-none bg-transparent"
                      />
                      <input
                        type="range"
                        min={0}
                        max={50000}
                        step={500}
                        value={filters.priceRange[1]}
                        onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Math.min(f.priceRange[0], Number(e.target.value)), Number(e.target.value)] }))}
                        className="w-full appearance-none bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-gray-400 text-sm mt-2">
                    <span>PKR 0</span>
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
            </div>

            {/* Hotel Cards Grid */}
            <div className="lg:col-span-3">
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
              {paginatedInternalHotels.map((hotel: any, index: number) => (
                    <motion.div
                      key={hotel.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                        <HotelCard
                          hotel={hotel}
                          onBook={(h) => setBookingHotel(h)}
                          searchDates={{
                            checkIn: searchParams.checkIn,
                            checkOut: searchParams.checkOut,
                            guests: searchParams.guests,
                            rooms: searchParams.rooms,
                          }}
                        />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {searchParams.location 
                      ? `No hotels found in "${searchParams.location}"`
                      : 'No hotels found'
                    }
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {searchParams.checkIn && searchParams.checkOut 
                      ? 'No rooms available for your selected dates. Try different dates or explore other destinations.'
                      : 'Try adjusting your search criteria or explore other destinations.'
                    }
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <button 
                      onClick={handleClearFilters}
                      className="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-75"
                    >
                      Clear Filters
                    </button>
                    <button 
                      onClick={() => {
                        setShowAllHotels(true)
                        setSearchParams(prev => ({ ...prev, location: '' }))
                      }}
                      className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-75"
                    >
                      Show All Hotels
                    </button>
                  </div>
                </div>
              )}
              {!isLoading && displayedHotels && displayedHotels.length > 0 && internalTotalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => setInternalPage(p => Math.max(1, p - 1))}
                    disabled={internalPage === 1}
                    className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-gray-700/50"
                  >
                    ← Prev
                  </button>
                  {Array.from({ length: internalTotalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setInternalPage(page)}
                      className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all border ${
                        page === internalPage
                          ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-cyan-600/50'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-700/50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setInternalPage(p => Math.min(internalTotalPages, p + 1))}
                    disabled={internalPage === internalTotalPages}
                    className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-gray-700/50"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* External Hotels Section */}
      <section className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <ExternalHotelsSection city={searchParams.location} />
        </div>
      </section>

      {/* Region Selection Modal */}
      {/* Region Selection Modal removed per design request */}

      {/* Booking Modal */}
      {bookingHotel && (
        <BookingModal
          hotel={bookingHotel}
          isOpen={!!bookingHotel}
          onClose={() => setBookingHotel(null)}
          onSuccess={(response) => {
            setBookingHotel(null)
            setSuccessBooking(response)
          }}
          searchDates={{
            checkIn: searchParams.checkIn,
            checkOut: searchParams.checkOut,
            guests: searchParams.guests,
            rooms: searchParams.rooms,
          }}
        />
      )}

      {/* Booking Success Modal */}
      <BookingSuccessModal
        isOpen={!!successBooking}
        onClose={() => setSuccessBooking(null)}
        booking={successBooking}
      />
    </div>
  )
}
