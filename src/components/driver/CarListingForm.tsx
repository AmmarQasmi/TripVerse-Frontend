'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'

interface CarListingFormProps {
  car?: any
  onSubmit: (carData: CarFormData) => void
  isLoading?: boolean
  onCancel?: () => void
}

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
  // Dual-mode availability
  available_for_rental: boolean
  available_for_ride_hailing: boolean
  // Ride-hailing pricing
  base_fare?: number
  per_km_rate?: number
  per_minute_rate?: number
  minimum_fare?: number
}

// Car companies and their models
const CAR_COMPANIES: Record<string, string[]> = {
  'Toyota': ['Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander', 'Land Cruiser', 'Hilux', 'Fortuner'],
  'Suzuki': ['Alto', 'Mehran', 'Cultus', 'Swift', 'Wagon R', 'Vitara', 'Jimny', 'Baleno'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'GLE', 'GLC', 'A-Class', 'B-Class', 'CLA'],
  'Honda': ['Civic', 'Accord', 'City', 'CR-V', 'Pilot', 'HR-V', 'Fit'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7'],
  'Audi': ['A3', 'A4', 'A6', 'Q3', 'Q5', 'Q7', 'A8'],
  'Nissan': ['Altima', 'Sentra', 'Rogue', 'Pathfinder', 'Murano', 'X-Trail'],
  'Hyundai': ['Elantra', 'Sonata', 'Tucson', 'Santa Fe', 'Accent', 'Kona', 'Palisade'],
  'Kia': ['Rio', 'Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride'],
  'Ford': ['Fiesta', 'Focus', 'Fusion', 'Escape', 'Explorer', 'F-150', 'Mustang'],
  'Chevrolet': ['Cruze', 'Malibu', 'Equinox', 'Tahoe', 'Silverado', 'Camaro'],
  'Volkswagen': ['Jetta', 'Passat', 'Tiguan', 'Atlas', 'Golf', 'Polo'],
}

const COMPANY_OPTIONS = Object.keys(CAR_COMPANIES).sort()

export function CarListingForm({ car, onSubmit, isLoading = false, onCancel }: CarListingFormProps) {
  const [formData, setFormData] = useState<CarFormData>({
    make: car?.make || '',
    model: car?.model || '',
    year: car?.year || new Date().getFullYear(),
    color: car?.color || '',
    seats: car?.seats || 4,
    transmission: car?.transmission || 'automatic',
    fuel_type: car?.fuel_type || 'petrol',
    base_price_per_day: car?.base_price_per_day || 0,
    distance_rate_per_km: car?.distance_rate_per_km || 0,
    license_plate: car?.license_plate || '',
    images: [],
    // Dual-mode availability
    available_for_rental: car?.available_for_rental ?? true,
    available_for_ride_hailing: car?.available_for_ride_hailing ?? false,
    // Ride-hailing pricing
    base_fare: car?.base_fare || 150,
    per_km_rate: car?.per_km_rate || 25,
    per_minute_rate: car?.per_minute_rate || 5,
    minimum_fare: car?.minimum_fare || 200,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableModels, setAvailableModels] = useState<string[]>([])

  useEffect(() => {
    if (formData.make && CAR_COMPANIES[formData.make]) {
      setAvailableModels(CAR_COMPANIES[formData.make])
      // Reset model if company changes
      if (!CAR_COMPANIES[formData.make].includes(formData.model)) {
        setFormData(prev => ({ ...prev, model: '' }))
      }
    } else {
      setAvailableModels([])
    }
  }, [formData.make])

  useEffect(() => {
    if (car) {
      setFormData({
        make: car.make || '',
        model: car.model || '',
        year: car.year || new Date().getFullYear(),
        color: car.color || '',
        seats: car.seats || 4,
        transmission: car.transmission || 'automatic',
        fuel_type: car.fuel_type || 'petrol',
        base_price_per_day: car.base_price_per_day || 0,
        distance_rate_per_km: car.distance_rate_per_km || 0,
        license_plate: car.license_plate || '',
        images: [],
        // Dual-mode availability
        available_for_rental: car.available_for_rental ?? true,
        available_for_ride_hailing: car.available_for_ride_hailing ?? false,
        // Ride-hailing pricing
        base_fare: car.base_fare || 150,
        per_km_rate: car.per_km_rate || 25,
        per_minute_rate: car.per_minute_rate || 5,
        minimum_fare: car.minimum_fare || 200,
      })
      if (car.make && CAR_COMPANIES[car.make]) {
        setAvailableModels(CAR_COMPANIES[car.make])
      }
    }
  }, [car])

  const handleInputChange = (field: keyof CarFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setFormData(prev => ({ ...prev, images: Array.from(files) }))
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, index) => index !== indexToRemove),
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.make || !formData.make.trim()) {
      newErrors.make = 'Car company is required'
    }

    if (!formData.model || !formData.model.trim()) {
      newErrors.model = 'Car model is required'
    }

    if (formData.year < 2000 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = `Year must be between 2000 and ${new Date().getFullYear() + 1}`
    }

    if (formData.seats < 2 || formData.seats > 8) {
      newErrors.seats = 'Seats must be between 2 and 8'
    }

    // At least one availability mode must be enabled
    if (!formData.available_for_rental && !formData.available_for_ride_hailing) {
      newErrors.availability = 'At least one availability mode must be enabled'
    }

    // Validate rental pricing if rental mode is enabled
    if (formData.available_for_rental) {
      if (formData.base_price_per_day <= 0) {
        newErrors.base_price_per_day = 'Price per day must be greater than 0'
      }
      if (formData.distance_rate_per_km < 0) {
        newErrors.distance_rate_per_km = 'Distance rate cannot be negative'
      }
    }

    // Validate ride-hailing pricing if ride-hailing mode is enabled
    if (formData.available_for_ride_hailing) {
      if (!formData.base_fare || formData.base_fare <= 0) {
        newErrors.base_fare = 'Base fare must be greater than 0'
      }
      if (!formData.per_km_rate || formData.per_km_rate <= 0) {
        newErrors.per_km_rate = 'Per KM rate must be greater than 0'
      }
      if (!formData.per_minute_rate || formData.per_minute_rate < 0) {
        newErrors.per_minute_rate = 'Per minute rate cannot be negative'
      }
      if (!formData.minimum_fare || formData.minimum_fare <= 0) {
        newErrors.minimum_fare = 'Minimum fare must be greater than 0'
      }
    }

    // Require at least one image for new car listings
    if (!car && (!formData.images || formData.images.length === 0)) {
      newErrors.images = 'At least one car image is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!validateForm()) return

    await onSubmit(formData)
    
    // Reset form after successful submission if no initialData (for new cars)
    if (!car) {
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        color: '',
        seats: 4,
        transmission: 'automatic',
        fuel_type: 'petrol',
        base_price_per_day: 0,
        distance_rate_per_km: 0,
        license_plate: '',
        images: [],
        available_for_rental: true,
        available_for_ride_hailing: false,
        base_fare: 150,
        per_km_rate: 25,
        per_minute_rate: 5,
        minimum_fare: 200,
      })
      setAvailableModels([])
      setErrors({})
    }
  }

  const transmissionTypes = [
    { value: 'manual', label: 'Manual' },
    { value: 'automatic', label: 'Automatic' },
  ]

  const fuelTypes = [
    { value: 'petrol', label: 'Petrol' },
    { value: 'diesel', label: 'Diesel' },
    { value: 'electric', label: 'Electric' },
    { value: 'hybrid', label: 'Hybrid' },
  ]

  return (
    <div className="space-y-6 [&_label]:font-medium [&_p.text-sm]:text-red-400">
      {/* Basic Information */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select
                label="Car Company *"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                error={errors.make}
                required
                options={[
                  { value: '', label: 'Select company' },
                  ...COMPANY_OPTIONS.map(company => ({
                    value: company,
                    label: company,
                  })),
                ]}
              />
            </div>

            <div>
              <Select
                label="Car Model *"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                error={errors.model}
                required
                disabled={!formData.make || availableModels.length === 0}
                options={
                  !formData.make
                    ? [{ value: '', label: 'Select company first' }]
                    : [
                        { value: '', label: 'Select model' },
                        ...availableModels.map(model => ({
                          value: model,
                          label: model,
                        })),
                      ]
                }
              />
            </div>

            <div>
              <Input
                label="Year *"
                type="number"
                placeholder="2024"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                error={errors.year}
                min={2000}
                max={new Date().getFullYear() + 1}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                label="Color"
                placeholder="e.g., White"
                value={formData.color || ''}
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
                min={2}
                max={8}
                required
              />
            </div>
            <div>
              <Input
                label="License Plate"
                placeholder="e.g., ABC-1234"
                value={formData.license_plate || ''}
                onChange={(e) => handleInputChange('license_plate', e.target.value)}
                error={errors.license_plate}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Select
                label="Transmission *"
                value={formData.transmission}
                onChange={(e) => handleInputChange('transmission', e.target.value)}
                error={errors.transmission}
                required
                options={[
                  { value: '', label: 'Select transmission' },
                  ...transmissionTypes
                ]}
              />
            </div>
            <div>
              <Select
                label="Fuel Type *"
                value={formData.fuel_type}
                onChange={(e) => handleInputChange('fuel_type', e.target.value)}
                error={errors.fuel_type}
                required
                options={[
                  { value: '', label: 'Select fuel type' },
                  ...fuelTypes
                ]}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Modes */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            Availability Modes *
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Choose how your car can be booked. You can enable both modes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Rental Mode */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.available_for_rental
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={formData.available_for_rental}
                onChange={(e) => handleInputChange('available_for_rental', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div>
                <p className={`font-medium ${formData.available_for_rental ? 'text-blue-700' : 'text-gray-700'}`}>
                  Available for Rentals
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Multi-day city-to-city bookings. Customers send requests, you approve.
                </p>
              </div>
            </label>

            {/* Ride-Hailing Mode */}
            <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
              formData.available_for_ride_hailing
                ? 'border-teal-500 bg-teal-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}>
              <input
                type="checkbox"
                checked={formData.available_for_ride_hailing}
                onChange={(e) => handleInputChange('available_for_ride_hailing', e.target.checked)}
                className="w-5 h-5 mt-0.5 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <p className={`font-medium ${formData.available_for_ride_hailing ? 'text-teal-700' : 'text-gray-700'}`}>
                  Available for Rides
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Within-city rides. Quick bookings when you&apos;re online.
                </p>
              </div>
            </label>
          </div>

          {errors.availability && (
            <p className="text-sm text-red-500">{errors.availability}</p>
          )}
        </CardContent>
      </Card>

      {/* Rental Pricing - Only show if rental mode is enabled */}
      {formData.available_for_rental && (
        <Card className="shadow-lg border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-blue-600">📅</span>
              Rental Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Base Price per Day (PKR) *"
                  type="number"
                  placeholder="5000"
                  value={formData.base_price_per_day}
                  onChange={(e) => handleInputChange('base_price_per_day', parseFloat(e.target.value))}
                  error={errors.base_price_per_day}
                  min={0}
                  step="0.01"
                  required
                />
              </div>
              <div>
                <Input
                  label="Distance Rate per KM (PKR) *"
                  type="number"
                  placeholder="50"
                  value={formData.distance_rate_per_km}
                  onChange={(e) => handleInputChange('distance_rate_per_km', parseFloat(e.target.value))}
                  error={errors.distance_rate_per_km}
                  min={0}
                  step="0.01"
                  required
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Total rental price = (Days × Base Price) + (Estimated KM × Distance Rate) + 5% platform fee
            </p>
          </CardContent>
        </Card>
      )}

      {/* Ride-Hailing Pricing - Only show if ride-hailing mode is enabled */}
      {formData.available_for_ride_hailing && (
        <Card className="shadow-lg border-l-4 border-l-teal-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-teal-600">⚡</span>
              Ride-Hailing Pricing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Base Fare (PKR) *"
                  type="number"
                  placeholder="150"
                  value={formData.base_fare ?? 150}
                  onChange={(e) => handleInputChange('base_fare', parseFloat(e.target.value))}
                  error={errors.base_fare}
                  min={0}
                  step="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Fixed starting fare</p>
              </div>
              <div>
                <Input
                  label="Per KM Rate (PKR) *"
                  type="number"
                  placeholder="25"
                  value={formData.per_km_rate ?? 25}
                  onChange={(e) => handleInputChange('per_km_rate', parseFloat(e.target.value))}
                  error={errors.per_km_rate}
                  min={0}
                  step="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Charged per kilometer</p>
              </div>
              <div>
                <Input
                  label="Per Minute Rate (PKR) *"
                  type="number"
                  placeholder="5"
                  value={formData.per_minute_rate ?? 5}
                  onChange={(e) => handleInputChange('per_minute_rate', parseFloat(e.target.value))}
                  error={errors.per_minute_rate}
                  min={0}
                  step="0.5"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Charged per minute of travel</p>
              </div>
              <div>
                <Input
                  label="Minimum Fare (PKR) *"
                  type="number"
                  placeholder="200"
                  value={formData.minimum_fare ?? 200}
                  onChange={(e) => handleInputChange('minimum_fare', parseFloat(e.target.value))}
                  error={errors.minimum_fare}
                  min={0}
                  step="1"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimum charge per ride</p>
              </div>
            </div>
            <div className="bg-teal-50 p-3 rounded-lg">
              <p className="text-xs text-teal-700">
                <strong>Example:</strong> A 10km, 20-minute ride would cost: 
                PKR {(formData.base_fare ?? 150) + (formData.per_km_rate ?? 25) * 10 + (formData.per_minute_rate ?? 5) * 20} 
                (Base + Distance + Time). 15% platform fee applies.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Images */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>
            Car Images {!car && <span className="text-red-400 text-sm">*</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className={`border-2 border-dashed ${errors.images ? 'border-red-500' : 'border-gray-300'} rounded-lg p-6 text-center hover:border-gray-400 transition-colors bg-gray-50`}>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <p className="text-gray-600 mb-2">Click to upload car images</p>
              </label>
            </div>
            {errors.images && (
              <p className="text-sm text-red-400">{errors.images}</p>
            )}
            {formData.images && formData.images.length > 0 && (
              <div className="space-y-3">
                <div className="text-sm text-gray-600">
                  {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {formData.images.map((image, index) => {
                    const previewUrl = URL.createObjectURL(image)
                    return (
                      <div key={`${image.name}-${index}`} className="relative rounded-lg overflow-hidden border border-gray-200 bg-white">
                        <img
                          src={previewUrl}
                          alt={`Car preview ${index + 1}`}
                          className="w-full h-24 object-cover"
                          onLoad={() => URL.revokeObjectURL(previewUrl)}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded hover:bg-black"
                          aria-label={`Remove image ${index + 1}`}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex items-center justify-end space-x-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button
          type="button"
          disabled={isLoading}
          onClick={() => handleSubmit()}
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
  )
}
