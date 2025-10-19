'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Car, CarApiResponse } from '@/types'

interface CarBookingFormProps {
  car: Car | CarApiResponse
  onBookingSubmit: (bookingData: BookingData) => void
  isLoading?: boolean
  isAuthenticated?: boolean
}

interface BookingData {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  estimatedDistance?: number
  customerNotes?: string
}

export function CarBookingForm({ car, onBookingSubmit, isLoading = false, isAuthenticated = true }: CarBookingFormProps) {
  const [formData, setFormData] = useState<BookingData>({
    pickupLocation: '',
    dropoffLocation: '',
    pickupDate: '',
    dropoffDate: '',
    estimatedDistance: undefined,
    customerNotes: ''
  })

  // Helper function to get price from either Car or CarApiResponse
  const getCarPrice = () => {
    if ('pricePerDay' in car) {
      return car.pricePerDay
    } else if ('pricing' in car) {
      return car.pricing.base_price_per_day
    }
    return 0
  }

  const [errors, setErrors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.pickupLocation) {
      newErrors.pickupLocation = 'Pickup location is required'
    }

    if (!formData.dropoffLocation) {
      newErrors.dropoffLocation = 'Dropoff location is required'
    }

    if (!formData.pickupDate) {
      newErrors.pickupDate = 'Pickup date is required'
    }

    if (!formData.dropoffDate) {
      newErrors.dropoffDate = 'Drop-off date is required'
    }

    if (formData.pickupDate && formData.dropoffDate) {
      const pickup = new Date(formData.pickupDate)
      const dropoff = new Date(formData.dropoffDate)
      
      if (dropoff <= pickup) {
        newErrors.dropoffDate = 'Drop-off date must be after pickup date'
      }
    }

    if (formData.estimatedDistance && formData.estimatedDistance <= 0) {
      newErrors.estimatedDistance = 'Distance must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onBookingSubmit(formData)
    }
  }

  const calculateDays = () => {
    if (!formData.pickupDate || !formData.dropoffDate) return 0
    const pickup = new Date(formData.pickupDate)
    const dropoff = new Date(formData.dropoffDate)
    const diffTime = Math.abs(dropoff.getTime() - pickup.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const days = calculateDays()

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">📝</span>
          Book This Car
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Location Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Location *
              </label>
              <input
                type="text"
                value={formData.pickupLocation}
                onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
                placeholder="e.g., Karachi Airport"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pickupLocation ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pickupLocation && (
                <p className="text-red-500 text-sm mt-1">{errors.pickupLocation}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dropoff Location *
              </label>
              <input
                type="text"
                value={formData.dropoffLocation}
                onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
                placeholder="e.g., Lahore City Center"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dropoffLocation ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dropoffLocation && (
                <p className="text-red-500 text-sm mt-1">{errors.dropoffLocation}</p>
              )}
            </div>
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Date *
              </label>
              <input
                type="date"
                value={formData.pickupDate}
                onChange={(e) => handleInputChange('pickupDate', e.target.value)}
                min={today}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.pickupDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.pickupDate && (
                <p className="text-red-500 text-sm mt-1">{errors.pickupDate}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                🚗 Pickup time will be arranged with the driver
              </p>
            </div>

            {/* Arrow Button */}
            <div className="flex justify-center items-center pb-2">
              <div className="bg-blue-100 hover:bg-blue-200 rounded-full p-2 transition-colors duration-200">
                <svg 
                  className="w-5 h-5 text-blue-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M13 7l5 5m0 0l-5 5m5-5H6" 
                  />
                </svg>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop-off Date *
              </label>
              <input
                type="date"
                value={formData.dropoffDate}
                onChange={(e) => handleInputChange('dropoffDate', e.target.value)}
                min={formData.pickupDate || today}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.dropoffDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dropoffDate && (
                <p className="text-red-500 text-sm mt-1">{errors.dropoffDate}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                💡 For multi-day rentals, you'll return the car on this date (any time before 11 PM)
              </p>
            </div>
          </div>

          {/* Distance Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Distance (km)
            </label>
            <input
              type="number"
              value={formData.estimatedDistance || ''}
              onChange={(e) => handleInputChange('estimatedDistance', e.target.value ? parseFloat(e.target.value) : 0)}
              placeholder="e.g., 1200"
              min="0"
              step="0.1"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.estimatedDistance ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.estimatedDistance && (
              <p className="text-red-500 text-sm mt-1">{errors.estimatedDistance}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Please provide the estimated distance for accurate pricing. This will be replaced by automatic calculation in the future.
            </p>
          </div>

          {/* Customer Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Special Instructions (Optional)
            </label>
            <textarea
              value={formData.customerNotes || ''}
              onChange={(e) => handleInputChange('customerNotes', e.target.value)}
              placeholder="Any special requests or instructions for the driver..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Trip Summary */}
          {days > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Trip Duration:</span>
                <span className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price per Day:</span>
                <span className="font-medium">PKR {getCarPrice().toLocaleString()}</span>
              </div>
              {formData.estimatedDistance && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Distance:</span>
                  <span className="font-medium">{formData.estimatedDistance} km</span>
                </div>
              )}
              <div className="text-sm text-gray-500">
                * Final pricing will be calculated after you submit the booking request
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || days === 0}
            className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold py-3 rounded-xl transition-all duration-300"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Calculating Price...
              </span>
            ) : !isAuthenticated ? (
              <span>🔒 Login to Calculate Price</span>
            ) : (
              <span>Calculate Price & Send Request</span>
            )}
          </Button>

          {/* Info Note */}
          <div className="text-center text-sm text-gray-500">
            {!isAuthenticated ? (
              <>
                <span className="mr-2">🔒</span>
                Please login to continue with your booking
              </>
            ) : (
              <>
                <span className="mr-2">ℹ️</span>
                You'll see the final price breakdown before confirming your booking
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
