'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAvailableCities, useRegionsByCity } from '@/features/hotels/useHotelSearch'

// SVG Icons
const MapPinIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const GlobeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

const XIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const FunnelIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
  </svg>
)

const ChevronDownIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
)

interface HotelLocationFiltersProps {
  onFilterChange: (filters: { city?: string; region?: string }) => void
  initialCity?: string
  initialRegion?: string
}

export function HotelLocationFilters({ onFilterChange, initialCity = '', initialRegion = '' }: HotelLocationFiltersProps) {
  const [selectedCity, setSelectedCity] = useState(initialCity)
  const [selectedRegion, setSelectedRegion] = useState(initialRegion)

  const { data: cities, isLoading: citiesLoading } = useAvailableCities()
  const { data: regions, isLoading: regionsLoading } = useRegionsByCity(selectedCity)

  // Sync with external prop changes
  useEffect(() => {
    setSelectedCity(initialCity)
  }, [initialCity])

  useEffect(() => {
    setSelectedRegion(initialRegion)
  }, [initialRegion])

  const handleCityChange = (city: string) => {
    setSelectedCity(city)
    setSelectedRegion('')
    onFilterChange({ city: city || undefined, region: undefined })
  }

  const handleRegionChange = (region: string) => {
    setSelectedRegion(region)
    onFilterChange({ city: selectedCity || undefined, region: region || undefined })
  }

  const clearAll = () => {
    setSelectedCity('')
    setSelectedRegion('')
    onFilterChange({})
  }

  const hasActiveFilters = !!selectedCity || !!selectedRegion

  return (
    <div className="mb-6">
      <div className="rounded-2xl bg-gray-900/60 backdrop-blur-md border border-gray-700/50 p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FunnelIcon className="w-5 h-5 text-cyan-400" />
            <h3 className="text-white font-semibold">Location Filters</h3>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* City Dropdown */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5">
              <MapPinIcon className="w-4 h-4" />
              City
            </label>
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all appearance-none cursor-pointer"
                disabled={citiesLoading}
              >
                <option value="">All Cities</option>
                {(cities as any[])?.map((c: any) => (
                  <option key={c.id} value={c.city}>
                    {c.city} ({c.hotel_count} hotel{c.hotel_count !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Region Dropdown */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-gray-400 mb-1.5">
              <GlobeIcon className="w-4 h-4" />
              Region
            </label>
            <div className="relative">
              <select
                value={selectedRegion}
                onChange={(e) => handleRegionChange(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:outline-none transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedCity || regionsLoading}
              >
                <option value="">
                  {selectedCity ? `All Regions in ${selectedCity}` : 'Select a city first'}
                </option>
                {(regions as any[])?.map((r: any) => (
                  <option key={r.region} value={r.region}>
                    {r.region} ({r.hotel_count} hotel{r.hotel_count !== 1 ? 's' : ''})
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Pills */}
        <AnimatePresence>
          {hasActiveFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-2 mt-4"
            >
              {selectedCity && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 rounded-full text-sm"
                >
                  <MapPinIcon className="w-3.5 h-3.5" />
                  {selectedCity}
                  <button
                    onClick={() => handleCityChange('')}
                    className="hover:text-white transition-colors ml-0.5"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              )}
              {selectedRegion && (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-500/20 border border-teal-500/30 text-teal-300 rounded-full text-sm"
                >
                  <GlobeIcon className="w-3.5 h-3.5" />
                  {selectedRegion}
                  <button
                    onClick={() => handleRegionChange('')}
                    className="hover:text-white transition-colors ml-0.5"
                  >
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
