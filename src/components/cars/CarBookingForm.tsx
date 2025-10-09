'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Car } from '@/types'

interface CarBookingFormProps {
  car: Car
  onBookingSubmit: (bookingData: BookingData) => void
  isLoading?: boolean
}

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

export function CarBookingForm({ car, onBookingSubmit, isLoading = false }: CarBookingFormProps) {
  const [formData, setFormData] = useState<BookingData>({
    pickupDate: '',
    dropoffDate: '',
    pickupTime: '10:00',
    dropoffTime: '10:00',
    extras: {
      gps: false,
      insurance: false,
      childSeat: false,
    }
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const today = new Date().toISOString().split('T')[0]

  const handleInputChange = (field: string, value: string | boolean) => {
    if (field.startsWith('extras.')) {
      const extraKey = field.split('.')[1] as keyof BookingData['extras']
      setFormData(prev => ({
        ...prev,
        extras: {
          ...prev.extras,
          [extraKey]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
    
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

  const calculateExtrasTotal = () => {
    const extras = {
      gps: formData.extras.gps ? 500 : 0,
      insurance: formData.extras.insurance ? 1500 : 0,
      childSeat: formData.extras.childSeat ? 300 : 0,
    }
    return Object.values(extras).reduce((sum, price) => sum + price, 0)
  }

  const days = calculateDays()
  const baseTotal = (car.pricePerDay || 0) * days
  const extrasTotal = calculateExtrasTotal()
  const platformCommission = (baseTotal + extrasTotal) * 0.05
  const total = baseTotal + extrasTotal + platformCommission

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
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pickup Time
              </label>
              <input
                type="time"
                value={formData.pickupTime}
                onChange={(e) => handleInputChange('pickupTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drop-off Time
              </label>
              <input
                type="time"
                value={formData.dropoffTime}
                onChange={(e) => handleInputChange('dropoffTime', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Extras */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Optional Extras
            </label>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.extras.gps}
                  onChange={(e) => handleInputChange('extras.gps', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">GPS Navigation</span>
                    <span className="text-gray-600">PKR 500</span>
                  </div>
                  <p className="text-sm text-gray-500">Turn-by-turn navigation system</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.extras.insurance}
                  onChange={(e) => handleInputChange('extras.insurance', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Comprehensive Insurance</span>
                    <span className="text-gray-600">PKR 1,500</span>
                  </div>
                  <p className="text-sm text-gray-500">Enhanced insurance coverage</p>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.extras.childSeat}
                  onChange={(e) => handleInputChange('extras.childSeat', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">Child Safety Seat</span>
                    <span className="text-gray-600">PKR 300</span>
                  </div>
                  <p className="text-sm text-gray-500">Child safety seat rental</p>
                </div>
              </label>
            </div>
          </div>

          {/* Price Summary */}
          {days > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Rental Duration:</span>
                <span className="font-medium">{days} {days === 1 ? 'day' : 'days'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium">PKR {baseTotal.toLocaleString()}</span>
              </div>
              {extrasTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Extras:</span>
                  <span className="font-medium">PKR {extrasTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (5%):</span>
                <span className="font-medium">PKR {platformCommission.toLocaleString()}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total:</span>
                <span>PKR {total.toLocaleString()}</span>
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
                Processing...
              </span>
            ) : (
              <span>Proceed to Payment</span>
            )}
          </Button>

          {/* Security Note */}
          <div className="text-center text-sm text-gray-500">
            <span className="mr-2">🔒</span>
            Secure payment powered by Stripe
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
