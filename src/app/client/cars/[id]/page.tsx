'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { CarImageCarousel } from '@/components/cars/CarImageCarousel'
import CarBookingModal from '@/components/cars/CarBookingModal'
import { PageLoader } from '@/components/shared/PageLoader'
import { useCarById } from '@/features/cars/useCarSearch'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { CarApiResponse } from '@/types'
import { useToast } from '@/components/ui/Toast'

export default function CarDetailPage() {
  const params = useParams()
  const router = useRouter()
  const carId = params.id as string
  const { showToast } = useToast()
  
  const { data: car, isLoading, error } = useCarById(carId)
  const { requireAuth, isAuthenticated } = useRequireAuth()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const handleBookNow = () => {
    if (!requireAuth()) {
      showToast('Please login to book this car', 'warning')
      return
    }
    setShowBookingModal(true)
  }

  if (isLoading) {
    return <PageLoader message="Loading car details..." variant="skeleton" />
  }

  if (error || !car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h1 className="text-2xl font-bold text-white mb-2">Car not found</h1>
          <p className="text-gray-400 mb-6">This car doesn't exist or has been removed.</p>
          <button onClick={() => router.push('/client/cars')} className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all">
            Browse Cars
          </button>
        </motion.div>
      </div>
    )
  }

  const driver = car.driver
  const carDetails = car.car
  const pricing = car.pricing
  const carImages = car.images?.length ? car.images : [
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&q=80',
  ]

  const specItems = [
    { icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), label: 'Seats', value: carDetails.seats },
    { icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ), label: 'Transmission', value: carDetails.transmission?.charAt(0).toUpperCase() + carDetails.transmission?.slice(1) },
    { icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ), label: 'Fuel', value: carDetails.fuel_type?.charAt(0).toUpperCase() + carDetails.fuel_type?.slice(1) },
    { icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ), label: 'Color', value: carDetails.color },
    { icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ), label: 'Year', value: carDetails.year },
    { icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
      </svg>
    ), label: 'Plate', value: carDetails.license_plate },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.back()}
          className="mb-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to search</span>
        </motion.button>

        {/* Hero Section: Image + Overlay Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-6"
        >
          <CarImageCarousel images={carImages} alt={`${carDetails.make} ${carDetails.model}`} />
          
          {/* Floating Badges */}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            {driver.isVerified && (
              <span className="bg-green-500/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Verified Driver
              </span>
            )}
          </div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Car Info */}
          <div className="lg:col-span-2 space-y-5">
            {/* Title + Price Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
            >
              <div>
                <h1 className="text-3xl font-bold text-white">{carDetails.make} {carDetails.model}</h1>
                <p className="text-gray-400 mt-1">{carDetails.year} &bull; {carDetails.color} &bull; {carDetails.license_plate}</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400">
                  PKR {pricing.base_price_per_day?.toLocaleString()}
                </p>
                <p className="text-sm text-gray-400">per day + distance</p>
              </div>
            </motion.div>

            {/* Specs Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="grid grid-cols-3 sm:grid-cols-6 gap-3"
            >
              {specItems.map((spec) => (
                <div key={spec.label} className="bg-gray-800/60 border border-white/5 rounded-xl p-3 text-center">
                  <div className="text-teal-400 flex justify-center mb-1.5">{spec.icon}</div>
                  <p className="text-white font-semibold text-sm">{spec.value}</p>
                  <p className="text-gray-500 text-xs">{spec.label}</p>
                </div>
              ))}
            </motion.div>

            {/* Pricing Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/40 border border-white/5 rounded-xl p-5"
            >
              <h2 className="text-lg font-semibold text-white mb-3">Pricing Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Base Rate</p>
                  <p className="text-lg font-bold text-white">PKR {pricing.base_price_per_day?.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/day</span></p>
                </div>
                <div className="bg-gray-800/60 rounded-lg p-3">
                  <p className="text-xs text-gray-400">Distance Rate</p>
                  <p className="text-lg font-bold text-white">PKR {pricing.distance_rate_per_km?.toLocaleString()}<span className="text-sm text-gray-400 font-normal">/km</span></p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">* 5% platform fee applies. Final price calculated based on trip duration and distance.</p>
            </motion.div>

            {/* Rental Policies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gray-800/40 border border-white/5 rounded-xl p-5"
            >
              <h2 className="text-lg font-semibold text-white mb-3">Booking Process</h2>
              <div className="space-y-3">
                {[
                  { step: '1', title: 'Send Request', desc: 'Fill out your trip details and send a booking request to the driver' },
                  { step: '2', title: 'Driver Reviews', desc: 'The driver reviews your request and accepts or declines within 24 hours' },
                  { step: '3', title: 'Confirm & Pay', desc: 'Once accepted, confirm your booking and proceed with payment' },
                  { step: '4', title: 'Enjoy Your Trip', desc: 'Meet the driver, start your trip, and explore your destination' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white text-xs font-bold">{item.step}</span>
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{item.title}</p>
                      <p className="text-gray-400 text-xs">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Driver + Book Now */}
          <div className="space-y-5">
            {/* Driver Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gray-800/60 border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] flex items-center justify-center text-white text-xl font-bold">
                  {driver.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold">{driver.name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-400">{driver.city}</span>
                  </div>
                </div>
                {driver.isVerified && (
                  <div className="bg-green-500/15 p-1.5 rounded-full">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="bg-gray-900/50 rounded-lg p-3">
                <p className="text-xs text-gray-400">This driver will review and respond to your booking request. You can chat with them once they accept.</p>
              </div>
            </motion.div>

            {/* Book Now Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-white/10 rounded-xl p-5 sticky top-6"
            >
              <div className="text-center mb-4">
                <p className="text-sm text-gray-400">Starting from</p>
                <p className="text-3xl font-bold text-white mt-1">PKR {pricing.base_price_per_day?.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">per day + PKR {pricing.distance_rate_per_km}/km</p>
              </div>

              {/* Quick Features */}
              <div className="space-y-2 mb-5">
                {[
                  { label: 'Free cancellation before driver accepts', icon: '✓' },
                  { label: 'Real-time chat with driver', icon: '✓' },
                  { label: 'Secure payment processing', icon: '✓' },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-2">
                    <span className="text-teal-400 text-sm font-bold">{f.icon}</span>
                    <span className="text-gray-400 text-xs">{f.label}</span>
                  </div>
                ))}
              </div>

              {!isAuthenticated() ? (
                <Link
                  href="/auth/login"
                  className="block w-full text-center bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/20 transition-all"
                >
                  Login to Book
                </Link>
              ) : (
                <button
                  onClick={handleBookNow}
                  className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Book Now
                </button>
              )}
              
              <p className="text-center text-xs text-gray-500 mt-3">
                You won't be charged until the driver accepts
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {car && (
        <CarBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          car={car}
        />
      )}
    </div>
  )
}
