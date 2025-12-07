'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CarCard } from '@/components/cars/CarCard'
import { CarSearchForm } from '@/components/cars/CarSearchForm'
import { CarFilters, CarFilterState } from '@/components/cars/CarFilters'
import { CarDestinationsCarousel } from '@/components/cars/CarDestinationsCarousel'
import { useCarSearch } from '@/features/cars/useCarSearch'
import { useAuth } from '@/features/auth/useAuth'
import { CarSearchParams } from '@/types'

interface CarSearchFormData {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  pickupTime: string
  dropoffTime: string
  carType: string
}

export default function CarsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [searchParams, setSearchParams] = useState<CarSearchFormData>({
    pickupLocation: user?.city?.region || '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    carType: '',
  })
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  // Read URL params immediately on mount (before auth check)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const pickupLocation = urlParams.get('pickupLocation')
      const dropoffLocation = urlParams.get('dropoffLocation')
      const pickupDate = urlParams.get('pickupDate')
      const returnDate = urlParams.get('returnDate')
      const pickupTime = urlParams.get('pickupTime')
      const dropoffTime = urlParams.get('dropoffTime')
      const vehicleType = urlParams.get('vehicleType')

      if (pickupLocation || pickupDate || returnDate) {
        setSearchParams(prev => ({
          ...prev,
          pickupLocation: pickupLocation || prev.pickupLocation,
          dropoffLocation: dropoffLocation || prev.dropoffLocation,
          pickupDate: pickupDate || prev.pickupDate,
          dropoffDate: returnDate || prev.dropoffDate,
          pickupTime: pickupTime || prev.pickupTime,
          dropoffTime: dropoffTime || prev.dropoffTime,
          carType: vehicleType || prev.carType,
        }))
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
      const pickupLocation = urlParams.get('pickupLocation')
      const dropoffLocation = urlParams.get('dropoffLocation')
      const pickupDate = urlParams.get('pickupDate')
      const returnDate = urlParams.get('returnDate')
      const pickupTime = urlParams.get('pickupTime')
      const dropoffTime = urlParams.get('dropoffTime')
      const vehicleType = urlParams.get('vehicleType')

      if (pickupLocation || pickupDate || returnDate) {
        // Use URL params if available
        setSearchParams(prev => ({
          ...prev,
          pickupLocation: pickupLocation || prev.pickupLocation,
          dropoffLocation: dropoffLocation || prev.dropoffLocation,
          pickupDate: pickupDate || prev.pickupDate,
          dropoffDate: returnDate || prev.dropoffDate,
          pickupTime: pickupTime || prev.pickupTime,
          dropoffTime: dropoffTime || prev.dropoffTime,
          carType: vehicleType || prev.carType,
        }))
      } else {
        // Try to restore from cache
        const cachedData = localStorage.getItem('cached_rental_search')
        if (cachedData) {
          try {
            const cached = JSON.parse(cachedData)
            if (cached.pickupLocation || cached.pickupDate) {
              setSearchParams(prev => ({
                ...prev,
                pickupLocation: cached.pickupLocation || prev.pickupLocation,
                dropoffLocation: cached.dropoffLocation || prev.dropoffLocation,
                pickupDate: cached.pickupDate || prev.pickupDate,
                dropoffDate: cached.returnDate || prev.dropoffDate,
                pickupTime: cached.pickupTime || prev.pickupTime,
                dropoffTime: cached.dropoffTime || prev.dropoffTime,
                carType: cached.vehicleType || prev.carType,
              }))
              
              // Update URL to reflect cached data
              const newUrlParams = new URLSearchParams()
              if (cached.pickupLocation) newUrlParams.set('pickupLocation', cached.pickupLocation)
              if (cached.dropoffLocation) newUrlParams.set('dropoffLocation', cached.dropoffLocation)
              if (cached.pickupDate) newUrlParams.set('pickupDate', cached.pickupDate)
              if (cached.returnDate) newUrlParams.set('returnDate', cached.returnDate)
              if (cached.pickupTime) newUrlParams.set('pickupTime', cached.pickupTime)
              if (cached.dropoffTime) newUrlParams.set('dropoffTime', cached.dropoffTime)
              if (cached.vehicleType) newUrlParams.set('vehicleType', cached.vehicleType)
              window.history.replaceState({}, '', `${window.location.pathname}?${newUrlParams.toString()}`)
            }
          } catch (error) {
            console.error('Error parsing cached rental search data:', error)
          }
        }
      }
    }
  }, [user, authLoading, router, hasCheckedAuth])
  
  const [filters, setFilters] = useState<CarFilterState>({
    priceRange: [0, 10000],
    carType: [],
    transmission: [],
    fuelType: [],
    passengerCapacity: 0,
    amenities: [],
    verifiedDriversOnly: true,
    sortBy: 'best_value',
  })
  
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  const [showAllCars, setShowAllCars] = useState(false)
  
  const { data: cars, isLoading } = useCarSearch({
    query: searchParams.pickupLocation,
    city_id: showAllCars ? undefined : user?.city?.id?.toString(),
    start_date: searchParams.pickupDate,
    end_date: searchParams.dropoffDate,
    seats: filters.passengerCapacity || undefined,
    transmission: filters.transmission[0] || undefined,
    fuel_type: filters.fuelType[0] || undefined,
    min_price: filters.priceRange[0] || undefined,
    max_price: filters.priceRange[1] || undefined,
  })

  // Auto-load all cars on first visit if no user location
  useEffect(() => {
    if (isInitialLoad) {
      if (user?.city?.region) {
        setSearchParams(prev => ({ ...prev, pickupLocation: user.city.region || '' }))
        setShowAllCars(false)
      } else {
        setShowAllCars(true) // Show all cars if no user location
      }
      setIsInitialLoad(false)
    }
  }, [user?.city?.region, isInitialLoad])

  const handleSearch = (newParams: CarSearchFormData) => {
    setSearchParams(newParams)
  }

  const handleFiltersChange = (newFilters: Partial<CarFilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: [0, 10000],
      carType: [],
      transmission: [],
      fuelType: [],
      passengerCapacity: 0,
      amenities: [],
      verifiedDriversOnly: true,
      sortBy: 'best_value',
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
              Rent verified cars from local drivers — fast, secure, and flexible.
            </p>
            
            {/* Search Form */}
            <CarSearchForm 
              onSearch={handleSearch}
              initialParams={searchParams}
            />
            
            <p className="text-gray-300 mt-4 text-sm">
              Verified drivers • Secure Stripe payments • Real-time availability
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
              Popular pickup cities
            </h2>
            <CarDestinationsCarousel />
          </motion.div>
        </div>
      </section>

      {/* Car Listings Section */}
      <section className="py-16 px-4">
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
                {showAllCars ? '📍 Filter by Location' : '🌐 Show All Cars'}
              </button>
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
                          rating: 0,
                          isAvailable: true,
                          createdAt: car.createdAt,
                          updatedAt: car.createdAt,
                          transmission: car.car.transmission,
                          fuelType: car.car.fuel_type,
                        }} isAvailable={true} />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🚗</div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {showAllCars ? 'No cars available' : 'No cars found in this area'}
                  </h3>
                  <p className="text-gray-400 mb-6">
                    {showAllCars 
                      ? 'There are currently no active and listed cars available. Check back later!'
                      : 'Try adjusting your search criteria, switching to "Show All Cars", or explore other destinations'
                    }
                  </p>
                  {!showAllCars && (
                    <button 
                      onClick={() => setShowAllCars(true)}
                      className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-75 mr-3"
                    >
                      Show All Cars
                    </button>
                  )}
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-75"
                  >
                    Clear All Filters
                  </button>
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
