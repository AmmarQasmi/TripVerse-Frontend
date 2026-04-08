'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CarCard } from '@/components/cars/CarCard'
import { CarSearchForm, CarSearchParams as CarSearchFormData } from '@/components/cars/CarSearchForm'
import { CarFilters, CarFilterState } from '@/components/cars/CarFilters'
import { CityExplorer } from '@/components/cars/CityExplorer'
import { useCarSearch } from '@/features/cars/useCarSearch'
import { useAuth } from '@/features/auth/useAuth'
import { BookingType } from '@/types'

type SearchBookingMode = 'all' | 'RENTAL' | 'RIDE_HAILING'

export default function CarsPage() {
  const router = useRouter()
  const urlSearchParams = useSearchParams()
  const { user, isLoading: authLoading } = useAuth()

  // Read URL params synchronously via useSearchParams (correct for Next.js App Router)
  const urlPickupLocation = urlSearchParams.get('pickupLocation')
  const urlPickupDate = urlSearchParams.get('pickupDate')
  const urlPickupTime = urlSearchParams.get('pickupTime')
  const urlPassengers = urlSearchParams.get('passengers')
  const urlCarType = urlSearchParams.get('carType')
  const hasURLParams = !!(urlPickupLocation || urlPickupDate)

  // Initialize state directly from URL params (Priority 1)
  const [searchParams, setSearchParams] = useState<CarSearchFormData>({
    pickupLocation: urlPickupLocation || '',
    pickupDate: urlPickupDate || '',
    pickupTime: urlPickupTime || '10:00',
    passengers: urlPassengers ? parseInt(urlPassengers) : 0,
    carType: urlCarType || '',
  })
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)
  // hasInitialized: true if URL params already provided a location
  const [hasInitialized, setHasInitialized] = useState(hasURLParams)

  // Priority 2: Cached search data (only if no URL params)
  useEffect(() => {
    if (hasURLParams) return
    const cachedData = localStorage.getItem('cached_car_search')
    if (cachedData) {
      try {
        const cached = JSON.parse(cachedData)
        if (cached.pickupLocation || cached.pickupDate) {
          setSearchParams(prev => ({
            ...prev,
            pickupLocation: cached.pickupLocation ?? prev.pickupLocation,
            pickupDate: cached.pickupDate ?? prev.pickupDate,
            pickupTime: cached.pickupTime ?? prev.pickupTime,
            passengers: cached.passengers ?? prev.passengers,
            carType: cached.carType ?? prev.carType,
          }))
          setHasInitialized(true)
        }
      } catch (error) {
        console.error('Error parsing cached car search data:', error)
      }
    }
  }, [hasURLParams])

  // Priority 3: Fallback to user's region only if URL/cache didn't provide a location
  useEffect(() => {
    if (authLoading || !user || hasInitialized) return

    if (user?.city?.region) {
      setSearchParams(prev => ({
        ...prev,
        pickupLocation: user.city.region,
      }))
    }
    setHasInitialized(true)
  }, [user, authLoading, hasInitialized])

  // Check authentication and redirect if needed
  useEffect(() => {
    if (authLoading) return
    
    if (!user) {
      const currentUrl = window.location.pathname + window.location.search
      router.push(`/auth/login?redirect=${encodeURIComponent(currentUrl)}`)
      return
    }
  }, [user, authLoading, router])
  
  const [filters, setFilters] = useState<CarFilterState>({
    transmission: '',
    fuelType: '',
    minSeats: 1,
    maxPrice: 10000,
    sortBy: 'newest',
  })
  
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAllCars, setShowAllCars] = useState(false)
  const [searchBookingMode, setSearchBookingMode] = useState<SearchBookingMode>('all')
  const [showAvailableNow, setShowAvailableNow] = useState(false)
  
  // Check if any filters are active
  const hasActiveFilters = 
    filters.transmission !== '' ||
    filters.fuelType !== '' ||
    filters.minSeats > 1 ||
    filters.maxPrice < 10000 ||
    filters.sortBy !== 'newest'
  
  const { data: cars, isLoading } = useCarSearch({
    query: searchParams.pickupLocation || undefined,
    city_id: searchParams.pickupLocation
      ? undefined  // Don't send city_id when we have a text query from search
      : showAllCars 
        ? undefined 
        : user?.city?.id?.toString(),
    start_date: searchParams.pickupDate,
    seats: searchParams.passengers > 0 
      ? searchParams.passengers 
      : filters.minSeats > 1 
        ? filters.minSeats 
        : undefined,
    transmission: searchParams.carType 
      ? searchParams.carType 
      : filters.transmission 
        ? filters.transmission 
        : undefined,
    fuel_type: filters.fuelType || undefined,
    max_price: filters.maxPrice < 10000 ? filters.maxPrice : undefined,
    booking_type: searchBookingMode === 'all' ? undefined : searchBookingMode as BookingType,
  })

  // Auto-load all cars on first visit if no user location
  useEffect(() => {
    if (isInitialLoad) {
      if (user?.city?.region) {
        // Only set region as pickup location if URL params / cache didn't already provide one
        if (!hasInitialized) {
          setSearchParams(prev => ({ ...prev, pickupLocation: user.city.region || '' }))
        }
        setShowAllCars(false)
      } else {
        setShowAllCars(true) // Show all cars if no user location
      }
      setIsInitialLoad(false)
    }
  }, [user?.city?.region, isInitialLoad, hasInitialized])

  const handleSearch = (newParams: CarSearchFormData) => {
    setSearchParams(newParams)
    // Persist latest explicit user search so details/booking modal use this first.
    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_car_search', JSON.stringify(newParams))
    }
    // When user searches with a pickup location, disable showAllCars so it filters properly
    if (newParams.pickupLocation) {
      setShowAllCars(false)
    }
    // Scroll to car listings section
    setTimeout(() => {
      document.getElementById('car-listings')?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }

  const handleFiltersChange = (newFilters: Partial<CarFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    setFilters({
      transmission: '',
      fuelType: '',
      minSeats: 1,
      maxPrice: 10000,
      sortBy: 'newest',
    })
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-0">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1920&q=80"
            alt="Car rental"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1e3a8a]/80 via-[#0f4c75]/70 to-[#0d9488]/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Find the Right Ride for Your Trip
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed">
              Rent verified cars from local drivers fast, secure, and flexible.
            </p>
            
            {/* Search Form */}
            <CarSearchForm 
              onSearch={handleSearch}
              initialParams={searchParams}
            />
            
            <p className="text-gray-300 mt-4 text-sm">
              Verified drivers • Secure Stripe payments • Real time availability
            </p>
          </motion.div>
        </div>

        {/* Scroll Indicator removed per design request */}
      </section>

      {/* Explore Cities */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-white text-center mb-3">
              Explore Cities
            </h2>
            <p className="text-gray-400 text-center mb-10 max-w-2xl mx-auto">
              Discover weather, top attractions, and restaurants in cities with available drivers
            </p>
            <CityExplorer />
          </motion.div>
        </div>
      </section>

      {/* Car Listings Section */}
      <section id="car-listings" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* View Mode Toggle and Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex items-center justify-between flex-wrap gap-4"
          >
            <div className="flex-1">
              {showAllCars ? (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    All Available Cars
                  </h3>
                  <p className="text-gray-300">
                    Showing all active and listed cars from verified drivers
                  </p>
                </div>
              ) : user?.city?.region ? (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Cars available in {user.city.region}
                  </h3>
                  <p className="text-gray-300">
                    Personalized recommendations based on your location
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Available Cars
                  </h3>
                  <p className="text-gray-300">
                    Browse all available cars from verified drivers
                  </p>
                </div>
              )}
            </div>
            
            {/* Toggle Button */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowAllCars(!showAllCars)}
                className={`
                  px-6 py-3 rounded-xl font-semibold transition-all duration-75
                  ${showAllCars 
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white' 
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                  }
                `}
              >
                {showAllCars ? 'Filter by Location' : 'Show All Cars'}
              </button>
            </div>
          </motion.div>

          {/* Booking Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative mb-8 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10 overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
              style={{ backgroundImage: 'url(/images/cities/lahore/lahore-03.png)' }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/65 to-slate-900/70 pointer-events-none" />

            <div className="relative z-10">
            <p className="text-sm text-gray-400 mb-3">I need a car for:</p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSearchBookingMode('all')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  searchBookingMode === 'all'
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                All Options
              </button>
              <button
                onClick={() => setSearchBookingMode('RIDE_HAILING')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  searchBookingMode === 'RIDE_HAILING'
                    ? 'bg-teal-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Within City Rides
              </button>
              <button
                onClick={() => setSearchBookingMode('RENTAL')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
                  searchBookingMode === 'RENTAL'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                City to City Rentals
              </button>
            </div>
            
            {/* Conditional filters based on mode */}
            {searchBookingMode === 'RIDE_HAILING' && (
              <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAvailableNow}
                    onChange={(e) => setShowAvailableNow(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500"
                  />
                  <span className="text-sm text-gray-300">Available Now</span>
                </label>
                <span className="text-xs text-gray-500">Drivers currently accepting rides</span>
              </div>
            )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <CarFilters 
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
                {hasActiveFilters && (
                  <div className="mt-4 p-3 bg-cyan-500/20 border border-cyan-500/30 rounded-lg">
                    <p className="text-xs text-cyan-300 font-medium">
                      Filters active: {[
                        filters.transmission && `${filters.transmission}`,
                        filters.fuelType && `${filters.fuelType}`,
                        filters.minSeats > 1 && `${filters.minSeats}+ seats`,
                        filters.maxPrice < 10000 && `Max PKR ${filters.maxPrice.toLocaleString()}`
                      ].filter(Boolean).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Car Cards Grid */}
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
              ) : cars && cars.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cars.map((car, index) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/client/cars/${car.id}`}>
                        <CarCard car={{
                          id: car.id,
                          brand: car.car.make,
                          model: car.car.model,
                          year: car.car.year,
                          color: car.car.color || '',
                          type: car.car.transmission || 'automatic',
                          seats: car.car.seats,
                          pricePerDay: car.pricing.base_price_per_day,
                          location: car.driver.city,
                          images: car.images || [],
                          description: `${car.car.make} ${car.car.model} - ${car.car.year}`,
                          features: [`${car.car.seats} seats`, car.car.transmission, car.car.fuel_type],
                          driverId: car.driver.id,
                          rating: (car.driver as any)?.rating ?? undefined,
                          isAvailable: true,
                          createdAt: car.createdAt,
                          updatedAt: car.createdAt,
                          transmission: car.car.transmission,
                          fuelType: car.car.fuel_type,
                          driver: {
                            id: Number(car.driver.id),
                            full_name: car.driver.name,
                            city: car.driver.city as any,
                            isVerified: car.driver.isVerified,
                            rating: (car.driver as any)?.rating,
                            totalTrips: (car.driver as any)?.totalTrips,
                          },
                          // Dual-mode availability
                          availableForRental: car.availability?.available_for_rental ?? true,
                          availableForRideHailing: car.availability?.available_for_ride_hailing ?? false,
                          // Ride-hailing pricing
                          baseFare: car.pricing.base_fare,
                          perKmRate: car.pricing.per_km_rate,
                          perMinuteRate: car.pricing.per_minute_rate,
                          minimumFare: car.pricing.minimum_fare,
                          distanceRatePerKm: car.pricing.distance_rate_per_km,
                        }} isAvailable={true} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 mx-auto mb-6 bg-gray-700/50 rounded-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {showAllCars ? 'No cars available' : 'No cars found in this area'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {showAllCars 
                      ? 'There are currently no active and listed cars available. Check back later!'
                      : 'Try adjusting your search criteria, switching to "Show All Cars", or explore other destinations'
                    }
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    {!showAllCars && (
                      <button 
                        onClick={() => setShowAllCars(true)}
                        className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-75"
                      >
                        Show All Cars
                      </button>
                    )}
                    <button 
                      onClick={handleClearFilters}
                      className="bg-gray-700/50 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all duration-75 border border-white/20"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Region Selection Modal removed per design request */}
    </div>
  )
}
