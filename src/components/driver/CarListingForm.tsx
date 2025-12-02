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

    if (formData.base_price_per_day <= 0) {
      newErrors.base_price_per_day = 'Price per day must be greater than 0'
    }

    if (formData.distance_rate_per_km < 0) {
      newErrors.distance_rate_per_km = 'Distance rate cannot be negative'
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
    <div className="space-y-6 [&_label]:text-gray-700 [&_label]:font-medium [&_p.text-sm]:text-red-500">
      {/* Basic Information */}
      <Card className="shadow-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
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

      {/* Pricing */}
      <Card className="shadow-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Pricing
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
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="shadow-lg bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-gray-900">
            Car Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors bg-gray-50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <p className="text-gray-700 mb-2">Click to upload car images</p>
                <p className="text-sm text-gray-500">Upload at least 3 high-quality images</p>
              </label>
            </div>
            {formData.images && formData.images.length > 0 && (
              <div className="text-sm text-gray-700">
                {formData.images.length} image{formData.images.length !== 1 ? 's' : ''} selected
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
