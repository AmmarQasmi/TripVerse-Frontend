'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface Filters {
  priceRange: [number, number]
  starRating: number[]
  amenities: string[]
  propertyType: string[]
}

interface HotelFiltersProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

const amenities = [
  { id: 'wifi', label: 'Free WiFi', icon: '📶' },
  { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
  { id: 'parking', label: 'Free Parking', icon: '🅿️' },
  { id: 'breakfast', label: 'Free Breakfast', icon: '🍳' },
  { id: 'gym', label: 'Fitness Center', icon: '💪' },
  { id: 'spa', label: 'Spa & Wellness', icon: '🧘' },
  { id: 'restaurant', label: 'Restaurant', icon: '🍽️' },
  { id: 'bar', label: 'Bar/Lounge', icon: '🍸' },
  { id: 'airport-shuttle', label: 'Airport Shuttle', icon: '🚌' },
  { id: 'pet-friendly', label: 'Pet Friendly', icon: '🐕' },
  { id: 'business-center', label: 'Business Center', icon: '💼' },
  { id: 'room-service', label: 'Room Service', icon: '🏠' }
]

const propertyTypes = [
  { id: 'hotel', label: 'Hotel', icon: '🏨' },
  { id: 'resort', label: 'Resort', icon: '🏖️' },
  { id: 'apartment', label: 'Apartment', icon: '🏠' },
  { id: 'hostel', label: 'Hostel', icon: '🛏️' },
  { id: 'villa', label: 'Villa', icon: '🏡' },
  { id: 'guesthouse', label: 'Guesthouse', icon: '🏘️' }
]

export function HotelFilters({ filters, onFiltersChange }: HotelFiltersProps) {
  const [isExpanded, setIsExpanded] = useState({
    price: true,
    rating: true,
    amenities: true,
    property: true
  })

  const toggleFilter = (section: keyof typeof isExpanded) => {
    setIsExpanded(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const updatePriceRange = (index: number, value: number) => {
    const newRange: [number, number] = [...filters.priceRange]
    newRange[index] = value
    if (newRange[0] > newRange[1]) {
      newRange[1] = newRange[0]
    }
    onFiltersChange({ ...filters, priceRange: newRange })
  }

  const toggleStarRating = (rating: number) => {
    const newRatings = filters.starRating.includes(rating)
      ? filters.starRating.filter(r => r !== rating)
      : [...filters.starRating, rating]
    onFiltersChange({ ...filters, starRating: newRatings })
  }

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    onFiltersChange({ ...filters, amenities: newAmenities })
  }

  const togglePropertyType = (type: string) => {
    const newTypes = filters.propertyType.includes(type)
      ? filters.propertyType.filter(t => t !== type)
      : [...filters.propertyType, type]
    onFiltersChange({ ...filters, propertyType: newTypes })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      priceRange: [0, 1000],
      starRating: [],
      amenities: [],
      propertyType: []
    })
  }

  const hasActiveFilters = filters.starRating.length > 0 || 
                          filters.amenities.length > 0 || 
                          filters.propertyType.length > 0 ||
                          filters.priceRange[0] > 0 || 
                          filters.priceRange[1] < 1000

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-[#38bdf8] hover:text-[#34d399] text-sm font-medium transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleFilter('price')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-white">Price Range</h4>
            <span className={`text-gray-400 transition-transform ${isExpanded.price ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {isExpanded.price && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-4"
            >
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-300">
                  <span>PKR {filters.priceRange[0].toLocaleString()}</span>
                  <span>PKR {filters.priceRange[1].toLocaleString()}</span>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[0]}
                    onChange={(e) => updatePriceRange(0, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={filters.priceRange[1]}
                    onChange={(e) => updatePriceRange(1, parseInt(e.target.value))}
                    className="absolute top-0 w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Star Rating */}
        <div>
          <button
            onClick={() => toggleFilter('rating')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-white">Star Rating</h4>
            <span className={`text-gray-400 transition-transform ${isExpanded.rating ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {isExpanded.rating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {[5, 4, 3, 2, 1].map((rating) => (
                <label key={rating} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.starRating.includes(rating)}
                    onChange={() => toggleStarRating(rating)}
                    className="w-4 h-4 text-[#38bdf8] bg-gray-700 border-gray-600 rounded focus:ring-[#38bdf8] focus:ring-2"
                  />
                  <span className="text-white">
                    {'★'.repeat(rating)}
                    <span className="text-gray-400 ml-1">& up</span>
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </div>

        {/* Property Type */}
        <div>
          <button
            onClick={() => toggleFilter('property')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-white">Property Type</h4>
            <span className={`text-gray-400 transition-transform ${isExpanded.property ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {isExpanded.property && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2"
            >
              {propertyTypes.map((type) => (
                <label key={type.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.propertyType.includes(type.id)}
                    onChange={() => togglePropertyType(type.id)}
                    className="w-4 h-4 text-[#38bdf8] bg-gray-700 border-gray-600 rounded focus:ring-[#38bdf8] focus:ring-2"
                  />
                  <span className="text-white flex items-center space-x-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </div>

        {/* Amenities */}
        <div>
          <button
            onClick={() => toggleFilter('amenities')}
            className="flex items-center justify-between w-full text-left"
          >
            <h4 className="font-semibold text-white">Amenities</h4>
            <span className={`text-gray-400 transition-transform ${isExpanded.amenities ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {isExpanded.amenities && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 space-y-2 max-h-64 overflow-y-auto"
            >
              {amenities.map((amenity) => (
                <label key={amenity.id} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.amenities.includes(amenity.id)}
                    onChange={() => toggleAmenity(amenity.id)}
                    className="w-4 h-4 text-[#38bdf8] bg-gray-700 border-gray-600 rounded focus:ring-[#38bdf8] focus:ring-2"
                  />
                  <span className="text-white flex items-center space-x-2">
                    <span>{amenity.icon}</span>
                    <span>{amenity.label}</span>
                  </span>
                </label>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-300 mb-2">Active filters:</p>
          <div className="flex flex-wrap gap-2">
            {filters.starRating.map((rating) => (
              <span key={rating} className="bg-[#38bdf8]/20 text-[#38bdf8] px-2 py-1 rounded text-xs">
                {rating}★
              </span>
            ))}
            {filters.amenities.slice(0, 2).map((amenity) => (
              <span key={amenity} className="bg-[#34d399]/20 text-[#34d399] px-2 py-1 rounded text-xs">
                {amenities.find(a => a.id === amenity)?.icon} {amenities.find(a => a.id === amenity)?.label}
              </span>
            ))}
            {filters.amenities.length > 2 && (
              <span className="bg-gray-600 text-gray-300 px-2 py-1 rounded text-xs">
                +{filters.amenities.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
