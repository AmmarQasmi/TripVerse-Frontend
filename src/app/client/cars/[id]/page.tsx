'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CarImageCarousel } from '@/components/cars/CarImageCarousel'
import { CarDetails } from '@/components/cars/CarDetails'
import { DriverProfileCard } from '@/components/cars/DriverProfileCard'
import { AvailabilityCalendar } from '@/components/cars/AvailabilityCalendar'
import { CarBookingForm } from '@/components/cars/CarBookingForm'
import { CommissionBreakdown } from '@/components/cars/CommissionBreakdown'
import { PageLoader } from '@/components/shared/PageLoader'
import { useCarById, useCarPriceCalculation } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { carsApi } from '@/lib/api/cars.api'
import { CarApiResponse } from '@/types'
import { useToast } from '@/components/ui/Toast'
import { useQueryClient } from '@tanstack/react-query'

interface BookingData {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  customerNotes?: string
}

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  const { showToast } = useToast()
  const queryClient = useQueryClient()
  
  const { data: car, isLoading, error } = useCarById(carId)
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  const [isBooking, setIsBooking] = useState(false)
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [priceCalculation, setPriceCalculation] = useState<any>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)

  const handleBookingSubmit = async (data: BookingData) => {
    // REQUIRE LOGIN before booking
    if (!requireAuth()) {
      showToast('Please login to continue with your booking', 'warning')
      return // User will be redirected to login
    }
    
    setIsBooking(true)
    try {
      // Create booking request
      const response = await carsApi.createBookingRequest({
        car_id: parseInt(carId),
        pickup_location: data.pickupLocation,
        dropoff_location: data.dropoffLocation,
        start_date: data.pickupDate,
        end_date: data.dropoffDate,
        customer_notes: data.customerNotes,
      })
      
      // Invalidate bookings queries to refresh data (both query key formats)
      queryClient.invalidateQueries({ queryKey: ['cars', 'bookings', 'user'] })
      queryClient.invalidateQueries({ queryKey: ['car-bookings', 'user'] })
      
      setBookingData(null)
      setPriceCalculation(null)
      setShowBookingForm(false)
      
      // Show success message
      showToast('Booking request sent to driver! You will be notified when they respond.', 'success')
      
      // Navigate to bookings page after a short delay
      setTimeout(() => {
        router.push('/client/cars/bookings')
      }, 1500)
      
    } catch (error: any) {
      console.error('Booking request failed:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to send booking request. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setIsBooking(false)
    }
  }

  const handleCalculatePrice = async (data: BookingData) => {
    if (!requireAuth()) {
      showToast('Please login to calculate price', 'warning')
      return
    }
    
    setIsCalculatingPrice(true)
    try {
      // Don't send estimatedDistance - let backend calculate it automatically
      const response = await carsApi.calculatePrice(
        carId,
        data.pickupLocation,
        data.dropoffLocation,
        data.pickupDate,
        data.dropoffDate
      )
      setPriceCalculation(response)
      setBookingData(data)
      setShowBookingForm(true)
    } catch (error: any) {
      console.error('Price calculation failed:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to calculate price. Please try again.'
      showToast(errorMessage, 'error')
    } finally {
      setIsCalculatingPrice(false)
    }
  }

  if (isLoading) {
    return <PageLoader message="Loading car details..." variant="skeleton" />
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-3xl font-bold text-white mb-4">
            Car not found
          </h1>
          <p className="text-gray-300 mb-8">
            The car you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/client/cars')}
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-75"
          >
            Browse All Cars
          </button>
        </motion.div>
      </div>
    )
  }

  // Extract driver and car data from API response
  const driver = car?.driver || {
    id: '1',
    name: 'Ahmed Khan',
    city: 'Karachi',
    isVerified: true,
  }

  const carDetails = car?.car || {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    seats: 5,
    transmission: 'automatic',
    fuel_type: 'petrol',
    color: 'White',
    license_plate: 'ABC-123',
  }

  const pricing = car?.pricing || {
    base_price_per_day: 5000,
    distance_rate_per_km: 50,
  }

  // Car images from API or fallback
  const carImages = car?.images || [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
    'https://images.unsplash.com/photo-1549317336-206569e8475c?w=800&q=80',
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-4xl font-bold text-white">
              {carDetails.make} {carDetails.model}
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">{carDetails.year} • {carDetails.color}</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-white font-semibold">{driver.isVerified ? 'Verified' : 'New'}</span>
            </div>
            <div className="text-white font-semibold">
              PKR {pricing.base_price_per_day?.toLocaleString()}/day
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{driver.city}</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Car Info */}
          <div className="lg:col-span-3 space-y-8">
            {/* Image Carousel */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <CarImageCarousel images={carImages} alt={`${carDetails.make} ${carDetails.model}`} />
            </motion.div>

            {/* Car Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CarDetails car={{
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
                rating: 4.8,
                isAvailable: true,
                createdAt: car.createdAt,
                updatedAt: car.createdAt,
                transmission: car.car.transmission,
                fuelType: car.car.fuel_type,
              }} />
            </motion.div>

            {/* Availability Note */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6"
            >
              <div className="flex items-start space-x-3">
                <svg className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">Availability Check</h3>
                  <p className="text-gray-300">
                    Car availability will be checked when you submit your booking request. Only active and listed cars are shown in search results.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Booking & Driver */}
          <div className="space-y-6">
            {/* Driver Profile */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <DriverProfileCard 
                driver={{
                  id: parseInt(driver.id),
                  full_name: driver.name,
                  email: 'driver@example.com',
                  role: 'driver' as const,
                  status: 'active',
                  city: {
                    id: 1,
                    name: driver.city,
                    region: driver.city
                  },
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                  isVerified: driver.isVerified,
                  rating: 4.8,
                  totalTrips: 45,
                }} 
                carCount={1}
              />
            </motion.div>

            {/* Login Prompt for Anonymous Users */}
            {!isAuthenticated() && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/10 backdrop-blur-md border border-yellow-500/30 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">Login Required to Book</h3>
                    <p className="text-gray-300">Please login to continue with your booking and get personalized recommendations</p>
                  </div>
                  <Link 
                    href="/auth/login" 
                    className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-75"
                  >
                    Login
                  </Link>
                </div>
              </motion.div>
            )}

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CarBookingForm 
                car={car}
                onBookingSubmit={handleCalculatePrice}
                isLoading={isCalculatingPrice}
                isAuthenticated={isAuthenticated()}
              />
            </motion.div>

            {/* Price Calculation Results */}
            {priceCalculation && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6"
              >
                <h3 className="text-xl font-semibold text-white mb-4">Price Breakdown</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-300">
                    <span>Base Price ({priceCalculation.trip_duration_days} days)</span>
                    <span>PKR {priceCalculation.pricing_breakdown.base_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Distance ({priceCalculation.estimated_distance} km)</span>
                    <span>PKR {priceCalculation.pricing_breakdown.distance_price.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Platform Fee (5%)</span>
                    <span>PKR {priceCalculation.pricing_breakdown.platform_fee.toLocaleString()}</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between text-white font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>PKR {priceCalculation.pricing_breakdown.total_amount.toLocaleString()}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleBookingSubmit(bookingData!)}
                  disabled={isBooking}
                  className="w-full mt-4 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-75 disabled:opacity-50"
                >
                  {isBooking ? 'Sending Request...' : 'Send Booking Request'}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
