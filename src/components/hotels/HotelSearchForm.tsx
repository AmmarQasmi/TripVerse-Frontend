'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface SearchParams {
  query: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
}

interface HotelSearchFormProps {
  onSearch: (params: SearchParams) => void
  initialParams?: SearchParams
}

export function HotelSearchForm({ onSearch, initialParams }: HotelSearchFormProps) {
  const [params, setParams] = useState<SearchParams>(initialParams || {
    query: '',
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    rooms: 1,
  })

  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(params)
  }

  const updateParam = (key: keyof SearchParams, value: string | number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const popularDestinations = [
    'New York', 'London', 'Paris', 'Dubai', 'Tokyo', 'Sydney', 
    'Singapore', 'Bangkok', 'Amsterdam', 'Rome', 'Barcelona', 'Berlin'
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Where to?
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="City, country"
              value={params.location}
              onChange={(e) => updateParam('location', e.target.value)}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-300"
              list="destinations"
            />
            <datalist id="destinations">
              {popularDestinations.map((dest) => (
                <option key={dest} value={dest} />
              ))}
            </datalist>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🧭
            </div>
          </div>
        </div>

        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Check-in
          </label>
          <input
            type="date"
            value={params.checkIn}
            onChange={(e) => updateParam('checkIn', e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Check-out Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Check-out
          </label>
          <input
            type="date"
            value={params.checkOut}
            onChange={(e) => updateParam('checkOut', e.target.value)}
            min={params.checkIn || new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-300"
          />
        </div>

        {/* Guests & Rooms */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Guests & Rooms
          </label>
          <button
            type="button"
            onClick={() => setShowGuestsDropdown(!showGuestsDropdown)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-left focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-300 flex items-center justify-between"
          >
            <span>
              {params.guests} guest{params.guests > 1 ? 's' : ''}, {params.rooms} room{params.rooms > 1 ? 's' : ''}
            </span>
            <span className="text-gray-400">👥</span>
          </button>

          {/* Guests Dropdown */}
          {showGuestsDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600/50 rounded-xl p-4 z-10 shadow-2xl"
            >
              <div className="space-y-4">
                {/* Guests */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Guests</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => updateParam('guests', Math.max(1, params.guests - 1))}
                      className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-white w-8 text-center">{params.guests}</span>
                    <button
                      type="button"
                      onClick={() => updateParam('guests', Math.min(20, params.guests + 1))}
                      className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Rooms */}
                <div className="flex items-center justify-between">
                  <span className="text-white font-medium">Rooms</span>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => updateParam('rooms', Math.max(1, params.rooms - 1))}
                      className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="text-white w-8 text-center">{params.rooms}</span>
                    <button
                      type="button"
                      onClick={() => updateParam('rooms', Math.min(10, params.rooms + 1))}
                      className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGuestsDropdown(false)}
                  className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-300"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center pt-4">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 flex items-center space-x-3"
        >
          <span>🔍</span>
          <span>Search Hotels</span>
        </motion.button>
      </div>
    </form>
  )
}
