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
import { useCarById, useCarPriceCalculation } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { carsApi } from '@/lib/api/cars.api'
import { CarApiResponse } from '@/types'

interface BookingData {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  estimatedDistance?: number
  customerNotes?: string
}

interface CarAvailability {
  id: string
  carId: string
  date: string
  isAvailable: boolean
}

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  
  const { data: car, isLoading, error } = useCarById(carId)
  const { user, requireAuth, isAuthenticated } = useRequireAuth()
  const [isBooking, setIsBooking] = useState(false)
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [priceCalculation, setPriceCalculation] = useState<any>(null)
  const [showBookingForm, setShowBookingForm] = useState(false)
  
  // Mock availability data
  const mockAvailability: CarAvailability[] = [
    { id: '1', carId, date: '2024-01-15', isAvailable: false },
    { id: '2', carId, date: '2024-01-16', isAvailable: false },
    { id: '3', carId, date: '2024-01-20', isAvailable: false },
    { id: '4', carId, date: '2024-01-25', isAvailable: false },
  ]

  const handleBookingSubmit = async (data: BookingData) => {
    // 🔒 REQUIRE LOGIN before booking
    if (!requireAuth()) {
      console.log('🔐 Login required for car booking')
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
      
      setBookingData(data)
      setShowBookingForm(false)
      
      // Show success message
      alert('Booking request sent to driver! You will be notified when they respond.')
      
    } catch (error: any) {
      console.error('Booking request failed:', error)
      alert('Failed to send booking request. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  const handleCalculatePrice = async (data: BookingData) => {
    try {
      const response = await carsApi.calculatePrice(
        carId,
        data.pickupLocation,
        data.dropoffLocation,
        data.pickupDate,
        data.dropoffDate,
        data.estimatedDistance
      )
      setPriceCalculation(response)
      setBookingData(data)
      setShowBookingForm(true)
    } catch (error: any) {
      console.error('Price calculation failed:', error)
      alert('Failed to calculate price. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            
            {/* Image skeleton */}
            <div className="h-96 bg-gray-700 rounded-2xl"></div>
            
            {/* Content skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-3 space-y-6">
                <div className="h-64 bg-gray-700 rounded-2xl"></div>
                <div className="h-48 bg-gray-700 rounded-2xl"></div>
                <div className="h-48 bg-gray-700 rounded-2xl"></div>
              </div>
              <div className="space-y-6">
                <div className="h-96 bg-gray-700 rounded-2xl"></div>
                <div className="h-64 bg-gray-700 rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-3xl font-bold text-white mb-4">
            Car not found
          </h1>
          <p className="text-gray-300 mb-8">
            The car you're looking for doesn't exist or has been removed.
          </p>
          <button
            onClick={() => router.push('/client/cars')}
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
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
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-semibold">{driver.isVerified ? 'Verified' : 'New'}</span>
            </div>
            <div className="text-white font-semibold">
              PKR {pricing.base_price_per_day?.toLocaleString()}/day
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <span>🧭</span>
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

            {/* Availability Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <AvailabilityCalendar 
                availability={mockAvailability}
                selectedStartDate=""
                selectedEndDate=""
              />
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
                className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-600 text-2xl">🔒</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-1">Login Required to Book</h3>
                    <p className="text-yellow-700">Please login to continue with your booking and get personalized recommendations</p>
                  </div>
                  <Link 
                    href="/auth/login" 
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-200"
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
                isLoading={isBooking}
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
                  className="w-full mt-4 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50"
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
