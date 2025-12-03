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
    <div className="min-h-screen bg-white">
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
            <div className="mb-6 p-4 bg-red-50 border border-red-500 rounded-lg">
              <p className="text-red-900">{error}</p>
            </div>
          )}

          {/* Form */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-lg">
            <CarListingForm
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </div>
        </motion.div>
      </div>
    </div>
  )
}
