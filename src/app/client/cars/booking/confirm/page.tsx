'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useCarById } from '@/features/cars/useCarSearch'

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const carId = searchParams.get('carId')
  
  const { data: car } = useCarById(carId || '')
  const [countdown, setCountdown] = useState(5)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/client/bookings')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  if (!car) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚗</div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 10,
              delay: 0.2
            }}
            className="text-center mb-8"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Your ride is confirmed! 🎉
            </h1>
            <p className="text-xl text-gray-300">
              Trip details and driver contact info have been sent to your email.
            </p>
          </motion.div>

          {/* Booking Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Car Details */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">🚗</span>
                    Your Vehicle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-300 rounded-lg overflow-hidden">
                      {car.images?.[0] && (
                        <img
                          src={car.images[0]}
                          alt={`${car.car.make} ${car.car.model}`}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {car.car.make} {car.car.model}
                      </h3>
                      <p className="text-gray-300">{car.car.year} • {car.car.color}</p>
                      <p className="text-gray-300">{car.car.transmission} • {car.car.seats} seats</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Driver Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <span className="mr-2">👨‍💼</span>
                    Your Driver
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                      AK
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">Ahmed Khan</h3>
                      <p className="text-gray-300">Verified Driver</p>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-white">4.8 (45 trips)</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                      💬 Contact Driver
                    </Button>
                    <Button variant="outline" className="flex-1 border-white/30 text-white hover:bg-white/10">
                      📞 Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-lg bg-white/10 backdrop-blur-md border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <span className="mr-2">📋</span>
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Trip Dates</h4>
                    <p className="text-gray-300">Jan 15, 2024 - Jan 18, 2024</p>
                    <p className="text-gray-300">3 days rental</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Pickup Location</h4>
                    <p className="text-gray-300">{car.driver.city}</p>
                    <p className="text-gray-300">Contact driver for exact location</p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white">Total Amount</h4>
                    <p className="text-2xl font-bold text-white">
                      PKR {(car.pricing.base_price_per_day || 0) * 3 + 2300}
                    </p>
                    <p className="text-sm text-gray-300">Includes all fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <Button
              onClick={() => router.push('/client/bookings')}
              className="flex-1 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-4 rounded-xl transition-all duration-300"
            >
              📱 View My Bookings
            </Button>
            <Button
              onClick={() => router.push('/client/cars')}
              variant="outline"
              className="flex-1 border-white/30 text-white hover:bg-white/10 py-4 rounded-xl"
            >
              🚗 Plan Another Trip
            </Button>
          </motion.div>

          {/* Auto-redirect Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center mt-8"
          >
            <p className="text-gray-400">
              Redirecting to your bookings in {countdown} seconds...
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
