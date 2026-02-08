'use client'

import { useState } from 'react'

interface CarFiltersProps {
  filters: CarFilterState
  onFiltersChange: (filters: Partial<CarFilterState>) => void
  onClearFilters: () => void
}

export interface CarFilterState {
  transmission: string
  fuelType: string
  minSeats: number
  maxPrice: number
  sortBy: string
}

export function CarFilters({ filters, onFiltersChange, onClearFilters }: CarFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const updateFilter = (key: keyof CarFilterState, value: any) => {
    onFiltersChange({ [key]: value })
  }

  const hasActiveFilters =
    filters.transmission !== '' ||
    filters.fuelType !== '' ||
    filters.minSeats > 1 ||
    filters.maxPrice < 10000 ||
    filters.sortBy !== 'newest'

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-lg border border-white/20 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-300 hover:text-white transition-colors text-xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10"
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Transmission</label>
            <select
              value={filters.transmission}
              onChange={(e) => updateFilter('transmission', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              <option value="" className="bg-gray-800">All</option>
              <option value="automatic" className="bg-gray-800">Automatic</option>
              <option value="manual" className="bg-gray-800">Manual</option>
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Fuel Type</label>
            <select
              value={filters.fuelType}
              onChange={(e) => updateFilter('fuelType', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              <option value="" className="bg-gray-800">All</option>
              <option value="petrol" className="bg-gray-800">Petrol</option>
              <option value="diesel" className="bg-gray-800">Diesel</option>
              <option value="electric" className="bg-gray-800">Electric</option>
              <option value="hybrid" className="bg-gray-800">Hybrid</option>
            </select>
          </div>

          {/* Minimum Seats */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Minimum Seats: <span className="text-cyan-400 font-semibold">{filters.minSeats === 1 ? 'Any' : filters.minSeats}</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              value={filters.minSeats}
              onChange={(e) => updateFilter('minSeats', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
              <span>Any</span>
              <span>4</span>
              <span>8</span>
            </div>
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Max Price: <span className="text-cyan-400 font-semibold">{filters.maxPrice >= 10000 ? 'No limit' : `Rs. ${filters.maxPrice.toLocaleString()}`}</span>
            </label>
            <input
              type="range"
              min="500"
              max="10000"
              step="500"
              value={filters.maxPrice}
              onChange={(e) => updateFilter('maxPrice', Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1 px-0.5">
              <span>Rs. 500</span>
              <span>Rs. 5k</span>
              <span>No limit</span>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => updateFilter('sortBy', e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
            >
              <option value="newest" className="bg-gray-800">Newest First</option>
              <option value="price_low" className="bg-gray-800">Price: Low to High</option>
              <option value="price_high" className="bg-gray-800">Price: High to Low</option>
            </select>
          </div>

          {/* Clear Filters Button */}
          <div className="pt-3 border-t border-white/10">
            <button
              onClick={onClearFilters}
              disabled={!hasActiveFilters}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                hasActiveFilters
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  : 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed'
              }`}
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
