'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CarListingForm } from '@/components/driver/CarListingForm'
import { carsApi } from '@/lib/api/cars.api'
import { PageHeader } from '@/components/shared/PageHeader'

interface CarFormData {
  make: string
  model: string
  seats: number
  base_price_per_day: number
  distance_rate_per_km: number
  transmission: string
  fuel_type: string
  year: number
  color?: string
  license_plate?: string
  images?: File[]
}

export default function NewCarPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (carData: CarFormData) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare data for API (remove images - they'll be uploaded separately)
      const { images, ...carPayload } = carData
      
      // Create the car first
      const response = await carsApi.create(carPayload)
      const carId = response.id

      // Upload images if provided
      if (images && images.length > 0) {
        try {
          await carsApi.uploadCarImages(carId, images)
        } catch (imageError: any) {
          console.error('Error uploading images:', imageError)
          // Don't fail the entire operation if image upload fails
          // The car was created successfully
        }
      }

      // Navigate to car detail page or cars list
      router.push(`/driver/cars/${carId}`)
    } catch (err: any) {
      console.error('Error creating car:', err)
      setError(err.response?.data?.message || 'Failed to create car listing. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <PageHeader 
        title="List Your Car"
        subtitle="Fill in the details below to start earning from your vehicle"
        backUrl="/driver/cars"
        backLabel="Back to Cars"
      />
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
              <p className="text-red-200">{error}</p>
            </div>
          )}

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
                Admin Approval
              </h3>
              <p className="text-gray-300 text-sm">
                Your car listing will be reviewed by our admin team before it becomes active
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
