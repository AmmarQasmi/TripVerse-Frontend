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
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'COMPACT', label: 'Compact' },
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'VAN', label: 'Van' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
]

const transmissions = [
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
]

const fuelTypes = [
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
]

const amenities = [
  { value: 'AC', label: 'Air Conditioning' },
  { value: 'GPS', label: 'GPS Navigation' },
  { value: 'BLUETOOTH', label: 'Bluetooth' },
  { value: 'BACKUP_CAMERA', label: 'Backup Camera' },
  { value: 'LEATHER_SEATS', label: 'Leather Seats' },
  { value: 'SUNROOF', label: 'Sunroof' },
  { value: 'HEATED_SEATS', label: 'Heated Seats' },
  { value: 'PARKING_SENSORS', label: 'Parking Sensors' },
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
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-300 hover:text-white transition-colors text-xl font-bold w-6 h-6 flex items-center justify-center"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Price Range */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Price Range (PKR per day)
            </label>
            <div className="space-y-3">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.priceRange[0] || ''}
                    onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
                <div className="flex-1">
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.priceRange[1] || ''}
                    onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value) || 10000)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                  />
                </div>
              </div>
              <div className="text-xs text-gray-300">
                Range: PKR {filters.priceRange[0].toLocaleString()} - {filters.priceRange[1].toLocaleString()}
              </div>
            </div>
          </div>

          {/* Car Type */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Car Type
            </label>
            <div className="space-y-2">
              {carTypes.map((type) => (
                <label key={type.value} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.carType.includes(type.value)}
                    onChange={() => toggleArrayFilter('carType', type.value)}
                    className="rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-200">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Transmission
            </label>
            <div className="space-y-2">
              {transmissions.map((transmission) => (
                <label key={transmission.value} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.transmission.includes(transmission.value)}
                    onChange={() => toggleArrayFilter('transmission', transmission.value)}
                    className="rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-200">{transmission.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Fuel Type
            </label>
            <div className="space-y-2">
              {fuelTypes.map((fuel) => (
                <label key={fuel.value} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.fuelType.includes(fuel.value)}
                    onChange={() => toggleArrayFilter('fuelType', fuel.value)}
                    className="rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-200">{fuel.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Passenger Capacity */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Passenger Capacity
            </label>
            <select
              value={filters.passengerCapacity}
              onChange={(e) => updateFilter('passengerCapacity', parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value={0} className="bg-gray-800">Any</option>
              <option value={2} className="bg-gray-800">2 passengers</option>
              <option value={4} className="bg-gray-800">4 passengers</option>
              <option value={5} className="bg-gray-800">5 passengers</option>
              <option value={7} className="bg-gray-800">7 passengers</option>
              <option value={8} className="bg-gray-800">8+ passengers</option>
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Amenities
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {amenities.map((amenity) => (
                <label key={amenity.value} className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.value)}
                    onChange={() => toggleArrayFilter('amenities', amenity.value)}
                    className="rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-200">
                    {amenity.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Verified Drivers Only */}
          <div>
            <label className="flex items-center space-x-3 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
              <input
                type="checkbox"
                checked={filters.verifiedDriversOnly}
                onChange={(e) => updateFilter('verifiedDriversOnly', e.target.checked)}
                className="rounded border-white/30 bg-white/10 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span className="text-sm font-medium text-gray-200">
                Verified Drivers Only
              </span>
            </label>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value} className="bg-gray-800">
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="pt-4 border-t border-white/20">
            <Button
              onClick={onClearFilters}
              variant="outline"
              className="w-full border-white/30 text-white hover:bg-white/10 bg-white/5"
            >
              Clear All Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
