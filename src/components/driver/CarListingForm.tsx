'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Car } from '@/types'

interface CarListingFormProps {
  car?: Car
  onSubmit: (carData: CarFormData) => void
  isLoading?: boolean
}

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

export function CarListingForm({ car, onSubmit, isLoading = false }: CarListingFormProps) {
  const [formData, setFormData] = useState<CarFormData>({
    brand: car?.brand || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    color: car?.color || '',
    type: car?.type || 'SEDAN',
    seats: car?.seats || 4,
    transmission: car?.transmission || 'AUTOMATIC',
    fuelType: car?.fuelType || 'PETROL',
    pricePerDay: car?.pricePerDay || 0,
    location: car?.location || '',
    description: '',
    features: car?.features || [],
    images: [],
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(
    new Set(car?.features || [])
  )

  const availableFeatures = [
    { key: 'AC', label: 'Air Conditioning', icon: '❄️' },
    { key: 'GPS', label: 'GPS Navigation', icon: '🧭' },
    { key: 'BLUETOOTH', label: 'Bluetooth', icon: '📱' },
    { key: 'BACKUP_CAMERA', label: 'Backup Camera', icon: '📹' },
    { key: 'LEATHER_SEATS', label: 'Leather Seats', icon: '🪑' },
    { key: 'SUNROOF', label: 'Sunroof', icon: '☀️' },
    { key: 'HEATED_SEATS', label: 'Heated Seats', icon: '🔥' },
    { key: 'PARKING_SENSORS', label: 'Parking Sensors', icon: '🅿️' },
  ]

  const carTypes = ['SEDAN', 'SUV', 'HATCHBACK', 'CONVERTIBLE', 'VAN', 'TRUCK']
  const transmissionTypes = ['AUTOMATIC', 'MANUAL']
  const fuelTypes = ['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID']

  const handleInputChange = (field: keyof CarFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleFeatureToggle = (featureKey: string) => {
    setSelectedFeatures(prev => {
      const newSet = new Set(prev)
      if (newSet.has(featureKey)) {
        newSet.delete(featureKey)
      } else {
        newSet.add(featureKey)
      }
      return newSet
    })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setFormData(prev => ({ ...prev, images: Array.from(files) }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.brand.trim()) newErrors.brand = 'Brand is required'
    if (!formData.model.trim()) newErrors.model = 'Model is required'
    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Invalid year'
    }
    if (!formData.color.trim()) newErrors.color = 'Color is required'
    if (formData.seats < 1 || formData.seats > 50) newErrors.seats = 'Invalid number of seats'
    if (formData.pricePerDay <= 0) newErrors.pricePerDay = 'Price must be greater than 0'
    if (!formData.location.trim()) newErrors.location = 'Location is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit({
        ...formData,
        features: Array.from(selectedFeatures),
      })
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">🚗</span>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Brand *"
                  placeholder="e.g., Toyota"
                  value={formData.brand}
                  onChange={(e) => handleInputChange('brand', e.target.value)}
                  error={errors.brand}
                />
              </div>
              <div>
                <Input
                  label="Model *"
                  placeholder="e.g., Camry"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  error={errors.model}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Year *"
                  type="number"
                  placeholder="2024"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  error={errors.year}
                />
              </div>
              <div>
                <Input
                  label="Color *"
                  placeholder="e.g., White"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  error={errors.color}
                />
              </div>
              <div>
                <Input
                  label="Seats *"
                  type="number"
                  placeholder="4"
                  value={formData.seats}
                  onChange={(e) => handleInputChange('seats', parseInt(e.target.value))}
                  error={errors.seats}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Car Type *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {carTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmission *
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => handleInputChange('transmission', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {transmissionTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type *
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => handleInputChange('fuelType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {fuelTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Location */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">💰</span>
              Pricing & Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Price per Day (PKR) *"
                  type="number"
                  placeholder="5000"
                  value={formData.pricePerDay}
                  onChange={(e) => handleInputChange('pricePerDay', parseFloat(e.target.value))}
                  error={errors.pricePerDay}
                />
                <p className="text-sm text-gray-500 mt-1">
                  You'll receive 95% (PKR {(formData.pricePerDay * 0.95).toLocaleString()}) after 5% platform fee
                </p>
              </div>
              <div>
                <Input
                  label="Location *"
                  placeholder="e.g., Lahore, Pakistan"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  error={errors.location}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">⭐</span>
              Features & Amenities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {availableFeatures.map(feature => (
                <label
                  key={feature.key}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedFeatures.has(feature.key)
                      ? 'bg-blue-50 border-2 border-blue-500'
                      : 'bg-gray-50 border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedFeatures.has(feature.key)}
                    onChange={() => handleFeatureToggle(feature.key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xl">{feature.icon}</span>
                  <span className="font-medium text-gray-900">{feature.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📷</span>
              Car Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <div className="text-4xl mb-2">📸</div>
                  <p className="text-gray-600 mb-2">Click to upload car images</p>
                  <p className="text-sm text-gray-500">Upload at least 3 high-quality images</p>
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="text-sm text-gray-600">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <span className="mr-2">📝</span>
              Additional Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Add any additional details about your car..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex items-center justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:to-[#0d9488]/90 text-white font-semibold px-8 py-3 rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </span>
            ) : (
              <span>{car ? 'Update Car' : 'List Car'}</span>
            )}
          </Button>
        </div>
      </div>
    </form>
  )
}
