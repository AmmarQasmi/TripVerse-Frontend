'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CarListingForm } from '@/components/driver/CarListingForm'

interface CarFormData {
  brand: string
  model: string
  year: number
  color: string
  type: string
  seats: number
  transmission: string
  fuelType: string
  pricePerDay: number
  location: string
  description: string
  features: string[]
  images: File[]
}

export default function NewCarPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (carData: CarFormData) => {
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('New car data:', carData)
    
    // Navigate back to cars list
    router.push('/driver/cars')
    setIsSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors mb-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Cars</span>
            </button>
            
            <h1 className="text-4xl font-bold text-white mb-2">
              List Your Car
            </h1>
            <p className="text-lg text-gray-300">
              Fill in the details below to start earning from your vehicle
            </p>
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <CarListingForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Earn More
              </h3>
              <p className="text-gray-300 text-sm">
                Set competitive prices and earn 95% of every booking after our 5% platform fee
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Verified Drivers
              </h3>
              <p className="text-gray-300 text-sm">
                Your profile is verified. Customers trust verified drivers more
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6"
            >
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                Secure Payments
              </h3>
              <p className="text-gray-300 text-sm">
                Receive payments securely through Stripe. Money is released after trip completion
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
