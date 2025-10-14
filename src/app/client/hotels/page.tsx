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
  const [filters, setFilters] = useState({
    priceRange: [5000, 25000] as [number, number],
    starRating: [] as number[],
    amenities: [] as string[],
    propertyType: [] as string[],
  })
  const [activeProvince, setActiveProvince] = useState('')
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const { data: hotels, isLoading } = useHotelSearch({
    ...searchParams,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    starRating: filters.starRating,
    amenities: filters.amenities,
  })

  // Province → curated hotel dataset (based on your provided list)
  const provinceHotels: Record<string, Array<{ id: string; name: string; location: string; price: number; type: string; image: string }>> = {
    GB: [
      { id: 'gb-embassy-villa', name: 'Embassy Villa Suites Hunza', location: 'Hunza, GB', price: 26000, type: 'Luxury', image: '/images/hotels/gilgit-baltistan/embassy-villa-suites-hunza/main.jpg' },
      { id: 'gb-serena-gilgit', name: 'Gilgit Serena Hotel', location: 'Gilgit, GB', price: 30000, type: 'Luxury', image: '/images/hotels/gilgit-baltistan/gilgit-serena-hotel/main.jpg' },
      { id: 'gb-shangrila', name: 'Shangrila Resort Skardu', location: 'Skardu, GB', price: 38000, type: 'Luxury', image: '/images/hotels/gilgit-baltistan/shangrila-resort-skardu/main.jpg' },
      { id: 'gb-eagles-nest', name: "Eagle's Nest Hotel (Duikar)", location: 'Duikar, Hunza, GB', price: 21000, type: 'Luxury', image: '/images/hotels/gilgit-baltistan/eagles-nest-hotel-duikar/main.jpg' },
      { id: 'gb-baltit-inn', name: 'Baltit Heritage Inn', location: 'Karimabad, GB', price: 13000, type: 'Mid-range', image: '/images/hotels/gilgit-baltistan/baltit-heritage-inn/main.jpg' },
    ],
    KPK: [
      { id: 'kpk-pc-malam', name: 'Pearl Continental Malam Jabba', location: 'Malam Jabba, KPK', price: 42000, type: 'Luxury', image: '/images/hotels/kpk/pearl-continental-malam-jabba/main.jpg' },
      { id: 'kpk-swat-serena', name: 'Swat Serena Hotel', location: 'Mingora, Swat, KPK', price: 30000, type: 'Luxury', image: '/images/hotels/kpk/swat-serena-hotel/main.jpg' },
      { id: 'kpk-hotel-one-naran', name: 'Hotel One Naran', location: 'Naran, KPK', price: 22000, type: 'Luxury', image: '/images/hotels/kpk/hotel-one-naran/main.jpg' },
      { id: 'kpk-sarai-naran', name: 'The Sarai Naran', location: 'Naran, KPK', price: 20000, type: 'Mid-range', image: '/images/hotels/kpk/sarai-naran/main.jpg' },
    ],
    AJK: [
      { id: 'ajk-pc-muzaffarabad', name: 'Pearl Continental Muzaffarabad', location: 'Muzaffarabad, AJK', price: 30000, type: 'Luxury', image: '/images/hotels/ajk/pearl-continental-muzaffarabad/main.jpg' },
      { id: 'ajk-pir-chinasi', name: 'Pir Chinasi Resorts', location: 'Pir Chinasi, AJK', price: 12000, type: 'Mid-range', image: '/images/hotels/ajk/pir-chinasi-resorts/main.jpg' },
    ],
    Punjab: [
      { id: 'punjab-pc-lahore', name: 'Pearl Continental Lahore', location: 'Lahore, Punjab', price: 34000, type: 'Luxury', image: '/images/hotels/punjab/pearl-continental-lahore/main.jpg' },
      { id: 'punjab-avari-lahore', name: 'Avari Lahore', location: 'Lahore, Punjab', price: 32000, type: 'Luxury', image: '/images/hotels/punjab/avari-lahore/main.jpg' },
      { id: 'punjab-serena-isb', name: 'Serena Hotel Islamabad', location: 'Islamabad, Punjab', price: 40000, type: 'Luxury', image: '/images/hotels/punjab/serena-hotel-islamabad/main.jpg' },
      { id: 'punjab-pc-bhurban', name: 'PC Bhurban', location: 'Bhurban, Punjab', price: 34000, type: 'Luxury', image: '/images/hotels/punjab/pc-bhurban/main.jpg' },
    ],
    Sindh: [
      { id: 'sindh-pc-karachi', name: 'Pearl Continental Karachi', location: 'Karachi, Sindh', price: 36000, type: 'Luxury', image: '/images/hotels/sindh/pearl-continental-karachi/main.jpg' },
      { id: 'sindh-avari-towers', name: 'Avari Towers Karachi', location: 'Karachi, Sindh', price: 33000, type: 'Luxury', image: '/images/hotels/sindh/avari-towers-karachi/main.jpg' },
      { id: 'sindh-movenpick', name: 'Movenpick Karachi', location: 'Karachi, Sindh', price: 38000, type: 'Luxury', image: '/images/hotels/sindh/movenpick-karachi/main.jpg' },
      { id: 'sindh-indus-hotel', name: 'Indus Hotel Hyderabad', location: 'Hyderabad, Sindh', price: 13000, type: 'Mid-range', image: '/images/hotels/sindh/indus-hotel-hyderabad/main.jpg' },
    ],
    Balochistan: [
      { id: 'bal-pc-gwadar', name: 'Pearl Continental Gwadar', location: 'Gwadar, Balochistan', price: 34000, type: 'Luxury', image: '/images/hotels/balochistan/pearl-continental-gwadar/main.jpg' },
      { id: 'bal-serena-quetta', name: 'Serena Hotel Quetta', location: 'Quetta, Balochistan', price: 30000, type: 'Luxury', image: '/images/hotels/balochistan/serena-hotel-quetta/main.jpg' },
      { id: 'bal-sadaf', name: 'Sadaf Resort Gwadar', location: 'Gwadar, Balochistan', price: 16000, type: 'Mid-range', image: '/images/hotels/balochistan/sadaf-resort-gwadar/main.jpg' },
    ],
  }

  const provinceToKey: Record<string, string> = {
    GB: 'GB',
    KPK: 'KPK',
    AJK: 'AJK',
    Punjab: 'Punjab',
    Sindh: 'Sindh',
    Balochistan: 'Balochistan',
  }

  // Default hotels to show (Pearl Continental Lahore, Avari Lahore, Serena Lahore, all Sindh, all AJK)
  const defaultHotels = [
    // Lahore hotels
    { id: 'default-pc-lahore', name: 'Pearl Continental Lahore', location: 'Lahore, Punjab', price: 34000, type: 'Luxury', image: '/images/hotels/punjab/pearl-continental-lahore/main.jpg' },
    { id: 'default-avari-lahore', name: 'Avari Lahore', location: 'Lahore, Punjab', price: 32000, type: 'Luxury', image: '/images/hotels/punjab/avari-lahore/main.jpg' },
    { id: 'default-serena-lahore', name: 'Serena Lahore', location: 'Lahore, Punjab', price: 35000, type: 'Luxury', image: '/images/hotels/punjab/serena-hotel-islamabad/main.jpg' },
    // All Sindh hotels
    ...provinceHotels.Sindh,
    // All AJK hotels  
    ...provinceHotels.AJK,
  ]

  // Compose displayed hotels: province dataset overrides search when a province is selected
  const curatedHotels = activeProvince && provinceHotels[provinceToKey[activeProvince] || activeProvince]
    ? provinceHotels[provinceToKey[activeProvince] || activeProvince].map((h) => ({
        id: h.id,
        name: h.name,
        description: h.type,
        location: h.location,
        address: h.location,
        rating: 4.5,
        pricePerNight: h.price,
        images: [h.image],
        amenities: [],
        roomTypes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
    : defaultHotels.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.type,
        location: h.location,
        address: h.location,
        rating: 4.5,
        pricePerNight: h.price,
        images: [h.image],
        amenities: [],
        roomTypes: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))

  const displayedHotels = (activeProvince ? curatedHotels : (curatedHotels.length > 0 ? curatedHotels : (hotels || [])))
    .filter((h: any) => (filters.starRating[0] ? (h.rating || 0) >= filters.starRating[0] : true))
    .filter((h: any) => (h.pricePerNight ? h.pricePerNight >= filters.priceRange[0] && h.pricePerNight <= filters.priceRange[1] : true))

  // Ensure HD imagery for all cards (fallbacks if API lacks images)
  const hdCityImages = [
    // Modern hotel exteriors/interiors and skylines (verified IDs)
    'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1528909514045-2fa4ac7a08ba?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80',
  ]
  const hdMountainImages = [
    // Mountain resorts and alpine scenes (verified IDs)
    'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1529257414772-1960b0e0871e?auto=format&fit=crop&w=1600&q=80',
  ]
  const hdLakeResortImages = [
    // Lakeside resorts/pools (verified IDs)
    'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1600&q=80',
  ]

  function stringHash(input: string): number {
    let hash = 0
    for (let i = 0; i < input.length; i++) {
      hash = ((hash << 5) - hash) + input.charCodeAt(i)
      hash |= 0
    }
    return Math.abs(hash)
  }

  function getPoolFor(location: string, name: string) {
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

  function pickHDImage(location: string, name: string) {
    const pool = getPoolFor(location, name)
    const index = stringHash(`${location}:${name}`) % pool.length
    return pool[index]
  }

  function pickHDGallery(location: string, name: string, count = 3) {
    const pool = Array.from(new Set([
      ...getPoolFor(location, name),
      ...hdCityImages,
      ...hdMountainImages,
      ...hdLakeResortImages,
    ]))
    const base = stringHash(`${location}:${name}`)
    const gallery: string[] = []
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      const idx = (base + i * 7) % pool.length
      const chosen = pool[idx]
      if (!gallery.includes(chosen)) gallery.push(chosen)
    }
    return gallery
  }

  const displayedHotelsWithImages = (displayedHotels as any[]).map((h: any) => {
    const gallery = pickHDGallery(h.location || h.address || '', h.name || h.hotelName || '', 3)
    const version = stringHash(`${h.name}|${h.location}`) % 1000
    const withVersion = gallery.map((u) => `${u}${u.includes('?') ? '&' : '?'}v=${version}`)
    return {
      ...h,
      images: withVersion,
    }
  })

  // Auto-load user's region hotels on first visit
  useEffect(() => {
    if (user?.city?.region && isInitialLoad) {
      setSearchParams(prev => ({ ...prev, location: user.city.region || '' }))
      setIsInitialLoad(false)
    } else if (!user?.city?.region && isInitialLoad) {
      setShowRegionModal(true)
      setIsInitialLoad(false)
    }
  }, [user?.city?.region, isInitialLoad])

  const handleSearch = (newParams: typeof searchParams) => {
    setSearchParams(newParams)
  }

  const handleRegionSelect = (region: string) => {
    setActiveProvince(region)
    setSearchParams(prev => ({ ...prev, location: region }))
    setShowRegionModal(false)
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
          {/* Auto-Region Message */}
          {user?.city?.region && searchParams.location === user.city.region && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-2xl font-semibold text-white mb-2">
                Recommended for you — Top hotels in {user.city.region}
              </h3>
              <p className="text-gray-300">
                Personalized recommendations based on your location
              </p>
            </motion.div>
          )}

          {/* New Filters + Province row */}
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
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

            {/* Province selector */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl bg-gray-900/60 backdrop-blur-md border border-cyan-600/40 p-6 h-full">
                <div className="text-cyan-300 text-xs uppercase tracking-wider mb-3">Browse by Province</div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { name: 'Sindh', icon: '🏝️', grad: 'from-blue-800 via-cyan-900 to-teal-900' },
                    { name: 'Punjab', icon: '🕌', grad: 'from-teal-800 via-blue-800 to-cyan-800' },
                    { name: 'Balochistan', icon: '🏜️', grad: 'from-cyan-900 via-blue-900 to-teal-800' },
                    { name: 'KPK', icon: '🌲', grad: 'from-blue-900 via-cyan-900 to-teal-800' },
                    { name: 'GB', icon: '🏔️', grad: 'from-teal-900 via-cyan-900 to-blue-800' },
                    { name: 'AJK', icon: '🌄', grad: 'from-blue-800 via-teal-900 to-cyan-900' },
                  ].map((p) => (
                    <button key={p.name} onClick={()=> handleRegionSelect(p.name)} className={`relative overflow-hidden px-3 py-3 rounded-xl text-left text-white font-medium bg-gradient-to-r ${p.grad} transition-all hover:scale-[1.01] ${activeProvince === p.name ? 'ring-2 ring-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)]' : ''}`}>
                      <span className="mr-2">{p.icon}</span>
                      {p.name}
                      {activeProvince === p.name && (<span className="absolute inset-0 rounded-xl ring-1 ring-cyan-300/40 animate-pulse" />)}
                    </button>
                  ))}
                </div>
              </div>
              </div>
            </div>

            {/* Hotel Cards Grid */}
            <div className="lg:col-span-3">
          {isLoading && !activeProvince ? (
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
                    onClick={() => setFilters({
                      priceRange: [5000, 25000] as [number, number],
                      starRating: [],
                      amenities: [],
                      propertyType: [],
                    })}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
          </div>
        </div>
      </section>

      {/* Region Selection Modal */}
      {/* Region Selection Modal removed per design request */}
    </div>
  )
}
