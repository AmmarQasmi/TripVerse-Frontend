'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface CarSearchFormProps {
  onSearch: (params: CarSearchParams) => void
  initialParams?: Partial<CarSearchParams>
}

interface CarSearchParams {
  pickupLocation: string
  dropoffLocation: string
  pickupDate: string
  dropoffDate: string
  pickupTime: string
  dropoffTime: string
  carType: string
}

export function CarSearchForm({ onSearch, initialParams }: CarSearchFormProps) {
  const [searchParams, setSearchParams] = useState<CarSearchParams>({
    pickupLocation: initialParams?.pickupLocation || '',
    dropoffLocation: initialParams?.dropoffLocation || '',
    pickupDate: initialParams?.pickupDate || '',
    dropoffDate: initialParams?.dropoffDate || '',
    pickupTime: initialParams?.pickupTime || '10:00',
    dropoffTime: initialParams?.dropoffTime || '10:00',
    carType: initialParams?.carType || '',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchParams)
  }

  const updateParam = (key: keyof CarSearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [key]: value }))
  }

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0]

  // Unified input classes for consistent dark theme styling
  const inputClasses = "flex h-12 w-full rounded-xl border border-gray-300 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm"
  const dateInputClasses = "flex h-12 w-full rounded-xl border border-gray-300 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark] backdrop-blur-sm"

  return (
    <div className="bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-2xl">
      <form onSubmit={handleSearch} className="space-y-6">
        {/* Main Search Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pickup Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">🧭</span>
              Pickup Location
            </label>
            <input
              type="text"
              placeholder="City or address"
              value={searchParams.pickupLocation}
              onChange={(e) => updateParam('pickupLocation', e.target.value)}
              className={inputClasses}
              required
            />
          </div>

          {/* Drop-off Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">🎯</span>
              Drop-off Location
            </label>
            <input
              type="text"
              placeholder="Same as pickup (optional)"
              value={searchParams.dropoffLocation}
              onChange={(e) => updateParam('dropoffLocation', e.target.value)}
              className={inputClasses}
            />
          </div>

          {/* Pickup Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">📅</span>
              Pickup Date
            </label>
            <input
              type="date"
              value={searchParams.pickupDate}
              onChange={(e) => updateParam('pickupDate', e.target.value)}
              min={today}
              className={dateInputClasses}
              required
            />
          </div>

          {/* Drop-off Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">📅</span>
              Drop-off Date
            </label>
            <input
              type="date"
              value={searchParams.dropoffDate}
              onChange={(e) => updateParam('dropoffDate', e.target.value)}
              min={searchParams.pickupDate || today}
              className={dateInputClasses}
              required
            />
          </div>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pickup Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">🕐</span>
              Pickup Time
            </label>
            <input
              type="time"
              value={searchParams.pickupTime}
              onChange={(e) => updateParam('pickupTime', e.target.value)}
              className={dateInputClasses}
            />
          </div>

          {/* Drop-off Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">🕐</span>
              Drop-off Time
            </label>
            <input
              type="time"
              value={searchParams.dropoffTime}
              onChange={(e) => updateParam('dropoffTime', e.target.value)}
              className={dateInputClasses}
            />
          </div>

          {/* Car Type */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <span className="mr-2">🚗</span>
              Car Type
            </label>
            <select
              value={searchParams.carType}
              onChange={(e) => updateParam('carType', e.target.value)}
              className={inputClasses}
            >
              <option value="">Any type</option>
              <option value="ECONOMY">Economy</option>
              <option value="COMPACT">Compact</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="LUXURY">Luxury</option>
              <option value="VAN">Van</option>
              <option value="CONVERTIBLE">Convertible</option>
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="flex justify-center pt-4">
          <Button 
            type="submit" 
            className="bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 text-white px-12 py-4 text-lg rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span className="mr-2">🔍</span>
            Search Cars
          </Button>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-300 pt-2">
          <div className="flex items-center">
            <span className="mr-1">✅</span>
            Verified Drivers
          </div>
          <div className="flex items-center">
            <span className="mr-1">🔒</span>
            Secure Stripe Payments
          </div>
          <div className="flex items-center">
            <span className="mr-1">⚡</span>
            Real-time Availability
          </div>
        </div>
      </form>
    </div>
  )
}
