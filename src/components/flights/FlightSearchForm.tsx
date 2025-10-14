'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { MapPin, Calendar, Users, Plane, RotateCcw } from 'lucide-react'

interface FlightSearchFormProps {
  onSearch: (params: any) => void
}

export function FlightSearchForm({ onSearch }: FlightSearchFormProps) {
  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP' | 'MULTI_CITY'>('ONE_WAY')
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'ECONOMY'
  })
  const [multiLegs, setMultiLegs] = useState<Array<{ origin: string; destination: string; date: string }>>([
    { origin: '', destination: '', date: '' },
  ])
  const [flexibleDates, setFlexibleDates] = useState(false)
  const [showPassengerDropdown, setShowPassengerDropdown] = useState(false)

  // Mock airports for autocomplete
  const airports = [
    { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' }
  ]

  const handleSwapLocations = () => {
    setSearchParams(prev => ({
      ...prev,
      origin: prev.destination,
      destination: prev.origin
    }))
  }

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', delta: number) => {
    setSearchParams(prev => ({
      ...prev,
      passengers: {
        ...prev.passengers,
        [type]: Math.max(type === 'adults' ? 1 : 0, prev.passengers[type] + delta)
      }
    }))
  }

  const handleSearch = () => {
    if (tripType === 'MULTI_CITY') {
      onSearch({ tripType, flexibleDates, legs: multiLegs, passengers: searchParams.passengers, cabinClass: searchParams.cabinClass })
    } else {
      onSearch({
        ...searchParams,
        tripType,
        flexibleDates
      })
    }
  }

  const getTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getNextWeek = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek.toISOString().split('T')[0]
  }

  return (
    <div className="bg-gray-900/60 backdrop-blur-md rounded-2xl p-6 md:p-8 border border-cyan-600/30 shadow-2xl">
      {/* Trip Type Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex rounded-full p-1 bg-gray-800/60 border border-gray-700/60">
          {[
            { key: 'ONE_WAY', label: 'One Way' },
            { key: 'ROUND_TRIP', label: 'Round Trip' },
            { key: 'MULTI_CITY', label: 'Multi City' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTripType(key as any)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all ${
                tripType === key
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="hidden md:block text-sm text-gray-300">
          Express Booking · Quicker, Easier
        </div>
      </div>

      {/* Search Form */}
      <div className="space-y-6">
        {/* Main Search Row */}
        {tripType !== 'MULTI_CITY' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
          {/* Combined From/To pill */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Route</label>
            <div className="relative flex items-stretch bg-gray-800/80 border border-gray-600 rounded-full">
              {/* From */}
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.origin}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, origin: e.target.value }))}
                  placeholder="City or airport"
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                />
              </div>
              {/* Divider with swap button */}
              <div className="relative flex items-center">
                <div className="h-6 w-px bg-gray-600" />
                <button
                  type="button"
                  onClick={handleSwapLocations}
                  className="mx-2 p-2 rounded-full bg-gray-800/70 border border-gray-600 text-gray-300 hover:text-white hover:border-cyan-500 hover:bg-gray-700 transition-all"
                  aria-label="Swap"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <div className="h-6 w-px bg-gray-600" />
              </div>
              {/* To */}
              <div className="relative flex-1">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchParams.destination}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, destination: e.target.value }))}
                  placeholder="City or airport"
                  className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Departure Date */}
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Departure</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={searchParams.departureDate || getTomorrow()}
                onChange={(e) => setSearchParams(prev => ({ ...prev, departureDate: e.target.value }))}
                min={getTomorrow()}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-full text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

        </div>
        )}

        {tripType === 'MULTI_CITY' && (
          <div className="space-y-4">
            {multiLegs.map((leg, idx) => (
              <div key={idx} className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
                <div className="lg:col-span-3">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Leg {idx + 1}</label>
                  <div className="relative flex items-stretch bg-gray-800/80 border border-gray-600 rounded-full">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={leg.origin}
                        onChange={(e) => setMultiLegs((legs) => legs.map((l, i) => i===idx ? { ...l, origin: e.target.value } : l))}
                        placeholder="City or airport"
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                    <div className="relative flex items-center">
                      <div className="h-6 w-px bg-gray-600" />
                    </div>
                    <div className="relative flex-1">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={leg.destination}
                        onChange={(e) => setMultiLegs((legs) => legs.map((l, i) => i===idx ? { ...l, destination: e.target.value } : l))}
                        placeholder="City or airport"
                        className="w-full pl-12 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Departure</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={leg.date || getTomorrow()}
                      onChange={(e) => setMultiLegs((legs) => legs.map((l, i) => i===idx ? { ...l, date: e.target.value } : l))}
                      min={getTomorrow()}
                      className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-full text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
                <div className="md:col-span-1 flex items-end">
                  <button
                    type="button"
                    onClick={() => setMultiLegs((legs) => legs.filter((_, i) => i !== idx))}
                    className="h-[52px] px-4 rounded-full bg-gray-800/70 border border-gray-600 text-gray-300 hover:text-white hover:border-red-400 hover:bg-gray-700 transition-all"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div>
              <button
                type="button"
                onClick={() => setMultiLegs((legs) => legs.length < 6 ? [...legs, { origin: '', destination: '', date: '' }] : legs)}
                className="px-4 py-2 rounded-full bg-gray-800/70 border border-gray-600 text-gray-200 hover:border-cyan-500 hover:text-white"
              >
                + Add another leg
              </button>
            </div>
          </div>
        )}

        {/* Return Date Row for Round Trip */}
        {tripType === 'ROUND_TRIP' && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-end">
            <div className="lg:col-span-2"></div>
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Return</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={searchParams.returnDate || getNextWeek()}
                  onChange={(e) => setSearchParams(prev => ({ ...prev, returnDate: e.target.value }))}
                  min={searchParams.departureDate || getTomorrow()}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-full text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors [color-scheme:dark]"
                />
              </div>
            </div>
            <div className="md:col-span-1"></div>
          </div>
        )}

        {/* Bottom Row - Passengers & Search Button */}
        <div className="flex flex-col lg:flex-row gap-4 items-end justify-between">
          {/* Passengers & Class */}
          <div className="w-full lg:w-80 relative">
            <label className="block text-sm font-medium text-gray-300 mb-2">Passengers & Class</label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <button
                onClick={() => setShowPassengerDropdown(!showPassengerDropdown)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800/80 border border-gray-600 rounded-full text-white text-left hover:border-cyan-500 transition-colors"
              >
                {searchParams.passengers.adults + searchParams.passengers.children + searchParams.passengers.infants} Traveller, {searchParams.cabinClass}
              </button>
            </div>

            {/* Passenger Dropdown */}
            {showPassengerDropdown && (
              <div className="absolute top-full left-0 mt-2 w-full bg-gray-800/95 backdrop-blur-md rounded-xl p-6 border border-gray-600 shadow-2xl z-50">
                <div className="space-y-4">
                  {/* Adults */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Adults (12+)</div>
                      <div className="text-sm text-gray-400">Ages 12 and above</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handlePassengerChange('adults', -1)}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{searchParams.passengers.adults}</span>
                      <button
                        onClick={() => handlePassengerChange('adults', 1)}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Children */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Children (2-11)</div>
                      <div className="text-sm text-gray-400">Ages 2 to 11</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handlePassengerChange('children', -1)}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{searchParams.passengers.children}</span>
                      <button
                        onClick={() => handlePassengerChange('children', 1)}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Infants */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">Infants (Under 2)</div>
                      <div className="text-sm text-gray-400">Under 2 years</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handlePassengerChange('infants', -1)}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{searchParams.passengers.infants}</span>
                      <button
                        onClick={() => handlePassengerChange('infants', 1)}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Cabin Class */}
                  <div className="border-t border-gray-600 pt-4">
                    <div className="font-medium text-white mb-3">Cabin Class</div>
                    <div className="grid grid-cols-2 gap-2">
                      {['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'].map((cls) => (
                        <button
                          key={cls}
                          onClick={() => setSearchParams(prev => ({ ...prev, cabinClass: cls }))}
                          className={`p-2 rounded-lg text-sm transition-colors ${
                            searchParams.cabinClass === cls
                              ? 'bg-cyan-600 text-white'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {cls.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <div className="w-full lg:w-auto">
            <Button
              onClick={handleSearch}
              className="w-full lg:w-auto bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-8 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all h-[52px] flex items-center justify-center"
            >
              <Plane className="w-5 h-5 mr-2" />
              Search Flights
            </Button>
          </div>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="mt-6 pt-6 border-t border-gray-600">
        <div className="text-sm text-gray-400 mb-3">Recent Searches</div>
        <div className="flex flex-wrap gap-2">
          {[
            'Karachi → Dubai',
            'Lahore → Jeddah',
            'Islamabad → Istanbul'
          ].map((search, index) => (
            <button
              key={index}
              className="px-3 py-1 bg-gray-800/50 border border-gray-600 rounded-lg text-gray-300 text-sm hover:bg-gray-700/50 hover:border-cyan-500 hover:text-white transition-colors"
            >
              {search}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}