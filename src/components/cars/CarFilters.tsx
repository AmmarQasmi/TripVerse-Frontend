'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CarFiltersProps {
  filters: CarFilterState
  onFiltersChange: (filters: Partial<CarFilterState>) => void
  onClearFilters: () => void
}

export interface CarFilterState {
  priceRange: [number, number]
  carType: string[]
  transmission: string[]
  fuelType: string[]
  passengerCapacity: number
  amenities: string[]
  verifiedDriversOnly: boolean
  sortBy: string
}

const carTypes = [
  { value: 'ECONOMY', label: 'Economy', icon: '🚗' },
  { value: 'COMPACT', label: 'Compact', icon: '🚙' },
  { value: 'SEDAN', label: 'Sedan', icon: '🚘' },
  { value: 'SUV', label: 'SUV', icon: '🚙' },
  { value: 'LUXURY', label: 'Luxury', icon: '🏎️' },
  { value: 'VAN', label: 'Van', icon: '🚐' },
  { value: 'CONVERTIBLE', label: 'Convertible', icon: '🚗' },
]

const transmissions = [
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
]

const fuelTypes = [
  { value: 'GASOLINE', label: 'Gasoline' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
]

const amenities = [
  { value: 'AC', label: 'Air Conditioning', icon: '❄️' },
  { value: 'GPS', label: 'GPS Navigation', icon: '🧭' },
  { value: 'BLUETOOTH', label: 'Bluetooth', icon: '📱' },
  { value: 'BACKUP_CAMERA', label: 'Backup Camera', icon: '📹' },
  { value: 'LEATHER_SEATS', label: 'Leather Seats', icon: '🪑' },
  { value: 'SUNROOF', label: 'Sunroof', icon: '☀️' },
  { value: 'HEATED_SEATS', label: 'Heated Seats', icon: '🔥' },
  { value: 'PARKING_SENSORS', label: 'Parking Sensors', icon: '🅿️' },
]

const sortOptions = [
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating: High to Low' },
  { value: 'best_value', label: 'Best Value' },
  { value: 'newest', label: 'Newest First' },
]

export function CarFilters({ filters, onFiltersChange, onClearFilters }: CarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = (key: keyof CarFilterState, value: any) => {
    onFiltersChange({ [key]: value })
  }

  const toggleArrayFilter = (key: 'carType' | 'transmission' | 'fuelType' | 'amenities', value: string) => {
    const currentArray = filters[key] as string[]
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value]
    updateFilter(key, newArray)
  }

  const handlePriceRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange]
    newRange[index] = value
    updateFilter('priceRange', newRange)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Price Range (PKR per day)
            </label>
            <div className="space-y-3">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value) || 10000)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Range: PKR {filters.priceRange[0]} - {filters.priceRange[1]}
              </div>
            </div>
          </div>

          {/* Car Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Car Type
            </label>
            <div className="space-y-2">
              {carTypes.map((type) => (
                <label key={type.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.carType.includes(type.value)}
                    onChange={() => toggleArrayFilter('carType', type.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center">
                    <span className="mr-2">{type.icon}</span>
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Transmission
            </label>
            <div className="space-y-2">
              {transmissions.map((transmission) => (
                <label key={transmission.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.transmission.includes(transmission.value)}
                    onChange={() => toggleArrayFilter('transmission', transmission.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{transmission.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Fuel Type
            </label>
            <div className="space-y-2">
              {fuelTypes.map((fuel) => (
                <label key={fuel.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.fuelType.includes(fuel.value)}
                    onChange={() => toggleArrayFilter('fuelType', fuel.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{fuel.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Passenger Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Passenger Capacity
            </label>
            <select
              value={filters.passengerCapacity}
              onChange={(e) => updateFilter('passengerCapacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>Any</option>
              <option value={2}>2 passengers</option>
              <option value={4}>4 passengers</option>
              <option value={5}>5 passengers</option>
              <option value={7}>7 passengers</option>
              <option value={8}>8+ passengers</option>
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {amenities.map((amenity) => (
                <label key={amenity.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.value)}
                    onChange={() => toggleArrayFilter('amenities', amenity.value)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex items-center">
                    <span className="mr-2">{amenity.icon}</span>
                    {amenity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Verified Drivers Only */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verifiedDriversOnly}
                onChange={(e) => updateFilter('verifiedDriversOnly', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 flex items-center">
                <span className="mr-2">✅</span>
                Verified Drivers Only
              </span>
            </label>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="pt-4 border-t border-gray-200">
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
