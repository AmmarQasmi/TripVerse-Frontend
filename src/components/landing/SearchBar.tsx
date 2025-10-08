'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'

type SearchType = 'flight' | 'hotel' | 'rental'

export function SearchBar() {
  const [searchType, setSearchType] = useState<SearchType>('flight')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnCarDate, setReturnCarDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Searching for:', searchType)
  }

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0]

  // Unified input classes for consistent dark theme styling - matching the reference image
  const inputClasses = "flex h-10 w-full rounded-md border border-gray-300 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
  const dateInputClasses = "flex h-10 w-full rounded-md border border-gray-300 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark]"

  return (
    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-4 z-20">
      <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-6">
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b">
          {[
            { key: 'flight', label: '✈️ Flight', icon: '✈️' },
            { key: 'hotel', label: '🏨 Hotel', icon: '🏨' },
            { key: 'rental', label: '🚗 Rental', icon: '🚗' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key as SearchType)}
              className={`px-6 py-3 font-medium transition-colors relative ${
                searchType === tab.key
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.label}
              {searchType === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-teal-600"></div>
              )}
            </button>
          ))}
        </div>

        {/* Search Forms */}
        <form onSubmit={handleSearch}>
          {searchType === 'flight' && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">From</label>
                <input
                  type="text"
                  placeholder="Departure city"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">To</label>
                <input
                  type="text"
                  placeholder="Destination city"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Departure</label>
                <input
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  min={today}
                  className={dateInputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Return</label>
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  min={departureDate || today}
                  className={dateInputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Travelers</label>
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          {searchType === 'hotel' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Destination</label>
                <input
                  type="text"
                  placeholder="City or hotel name"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Check-in</label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={today}
                  className={dateInputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Check-out</label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || today}
                  className={dateInputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Guests</label>
                <input
                  type="number"
                  min="1"
                  defaultValue="2"
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          {searchType === 'rental' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Pickup Location</label>
                <input
                  type="text"
                  placeholder="City or address"
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Pickup Date</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  min={today}
                  className={dateInputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Return Date</label>
                <input
                  type="date"
                  value={returnCarDate}
                  onChange={(e) => setReturnCarDate(e.target.value)}
                  min={pickupDate || today}
                  className={dateInputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">Vehicle Type</label>
                <select className={inputClasses}>
                  <option className="bg-gray-800 text-white">Any</option>
                  <option className="bg-gray-800 text-white">Sedan</option>
                  <option className="bg-gray-800 text-white">SUV</option>
                  <option className="bg-gray-800 text-white">Van</option>
                  <option className="bg-gray-800 text-white">Luxury</option>
                </select>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white px-12 py-3 text-lg rounded-full transition-all duration-300 shadow-lg"
            >
              Search Now
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

