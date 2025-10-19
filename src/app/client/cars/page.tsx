'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { CarCard } from '@/components/cars/CarCard'
import { CarSearchForm } from '@/components/cars/CarSearchForm'
import { CarFilters, CarFilterState } from '@/components/cars/CarFilters'
import { CarDestinationsCarousel } from '@/components/cars/CarDestinationsCarousel'
import { useCarSearch } from '@/features/cars/useCarSearch'
import { useAuth } from '@/features/auth/useAuth'
import { TransparentHeader } from '@/components/shared/TransparentHeader'
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
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useState<CarSearchFormData>({
    pickupLocation: user?.city?.region || '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    carType: '',
  })
  
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
  
  const [showRegionModal, setShowRegionModal] = useState(false)
  const [isInitialLoad, setIsInitialLoad] = useState(true)
  
  const { data: cars, isLoading } = useCarSearch({
    query: searchParams.pickupLocation,
    city_id: user?.city?.id?.toString(),
    start_date: searchParams.pickupDate,
    end_date: searchParams.dropoffDate,
    seats: filters.passengerCapacity || undefined,
    transmission: filters.transmission[0] || undefined,
    fuel_type: filters.fuelType[0] || undefined,
    min_price: filters.priceRange[0] || undefined,
    max_price: filters.priceRange[1] || undefined,
  })

  // Auto-load user's region cars on first visit
  useEffect(() => {
    if (user?.city?.region && isInitialLoad) {
      setSearchParams(prev => ({ ...prev, pickupLocation: user.city.region || '' }))
      setIsInitialLoad(false)
    } else if (!user?.city?.region && isInitialLoad) {
      setShowRegionModal(true)
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

  const handleRegionSelect = (region: string) => {
    setSearchParams(prev => ({ ...prev, pickupLocation: region }))
    setShowRegionModal(false)
  }

  // Mock data with driver info
  const mockCars = cars?.map(car => ({
    ...car,
    driver: {
      id: 1,
      email: 'ahmed.khan@example.com',
      full_name: 'Ahmed Khan',
      role: 'driver' as const,
      status: 'active',
      city: {
        id: 1,
        name: 'Karachi',
        region: 'Sindh'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: true,
      rating: 4.8,
      totalTrips: 45,
    }
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Transparent Header */}
      <TransparentHeader />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden pt-16">
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
          {/* Auto-Region Message */}
          {user?.city?.region && searchParams.pickupLocation === user.city.region ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h3 className="text-2xl font-semibold text-white mb-2">
                Recommended for you — Cars available in {user.city.region}
              </h3>
              <p className="text-gray-300">
                Personalized recommendations based on your location
              </p>
            </motion.div>
          ) : !user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-2">
                    🚗 Discover Cars in Your City
                  </h3>
                  <p className="text-blue-700">
                    Login to see personalized car recommendations in your area
                  </p>
                </div>
                <Link 
                  href="/auth/login" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200"
                >
                  Login
                </Link>
              </div>
            </motion.div>
          )}

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
                          color: car.car.color,
                          type: 'sedan', // Default type
                          seats: car.car.seats,
                          pricePerDay: car.pricing.base_price_per_day,
                          location: car.driver.city,
                          images: car.images,
                          description: `${car.car.make} ${car.car.model} - ${car.car.year}`,
                          features: [`${car.car.seats} seats`, car.car.transmission, car.car.fuel_type],
                          driverId: car.driver.id,
                          rating: 4.8, // Default rating for now
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
                    No cars found in this area
                  </h3>
                  <p className="text-gray-400 mb-6">
                    Try adjusting your search criteria or explore other destinations
                  </p>
                  <button 
                    onClick={handleClearFilters}
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
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
