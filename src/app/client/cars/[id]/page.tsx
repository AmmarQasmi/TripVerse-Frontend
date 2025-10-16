'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CarImageCarousel } from '@/components/cars/CarImageCarousel'
import { CarDetails } from '@/components/cars/CarDetails'
import { DriverProfileCard } from '@/components/cars/DriverProfileCard'
import { AvailabilityCalendar } from '@/components/cars/AvailabilityCalendar'
import { CarBookingForm } from '@/components/cars/CarBookingForm'
import { CommissionBreakdown } from '@/components/cars/CommissionBreakdown'
import { useCarById } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'

interface BookingData {
  pickupDate: string
  dropoffDate: string
  pickupTime: string
  dropoffTime: string
  extras: {
    gps: boolean
    insurance: boolean
    childSeat: boolean
  }
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
  
  // Mock availability data
  const mockAvailability: CarAvailability[] = [
    { id: '1', carId, date: '2024-01-15', isAvailable: false },
    { id: '2', carId, date: '2024-01-16', isAvailable: false },
    { id: '3', carId, date: '2024-01-20', isAvailable: false },
    { id: '4', carId, date: '2024-01-25', isAvailable: false },
  ]

  const handleBookingSubmit = async (bookingData: BookingData) => {
    // 🔒 REQUIRE LOGIN before booking
    if (!requireAuth()) {
      console.log('🔐 Login required for car booking')
      return // User will be redirected to login
    }
    
    setIsBooking(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Navigate to booking confirmation or payment page
    router.push(`/client/cars/booking/confirm?carId=${carId}`)
    setIsBooking(false)
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

  // Mock driver data
  const mockDriver = {
    id: 1,
    full_name: 'Ahmed Khan',
    email: 'ahmed.khan@example.com',
    role: 'driver' as const,
    status: 'active',
    city: {
      id: 1,
      name: 'Karachi',
      region: 'Sindh'
    },
    createdAt: '2023-06-15T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    isVerified: true,
    rating: 4.8,
    totalTrips: 45,
    joinedDate: '2023-06-15',
    responseTime: 'within an hour',
    languages: ['English', 'Urdu'],
  }

  // Mock car images
  const carImages = car.images || [
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
              {car.brand} {car.model}
            </h1>
          </div>
          <p className="text-xl text-gray-300 mb-4">{car.year} • {car.color}</p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="text-yellow-400">⭐</span>
              <span className="text-white font-semibold">{car.rating?.toFixed(1) || 'New'}</span>
            </div>
            <div className="text-white font-semibold">
              PKR {car.pricePerDay?.toLocaleString()}/day
            </div>
            <div className="flex items-center space-x-2 text-gray-300">
              <span>🧭</span>
              <span>{car.location}</span>
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
              <CarImageCarousel images={carImages} alt={`${car.brand} ${car.model}`} />
            </motion.div>

            {/* Car Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CarDetails car={car} />
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
                driver={mockDriver} 
                carCount={1}
              />
            </motion.div>

            {/* Booking Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CarBookingForm 
                car={car}
                onBookingSubmit={handleBookingSubmit}
                isLoading={isBooking}
              />
            </motion.div>

            {/* Commission Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CommissionBreakdown
                basePrice={car.pricePerDay || 0}
                days={3}
                extras={{
                  gps: 500,
                  insurance: 1500,
                  childSeat: 300,
                }}
                taxes={0}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
