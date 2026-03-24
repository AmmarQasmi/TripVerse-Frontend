'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { carsApi } from '@/lib/api/cars.api'
import { MapPickerModal } from '@/components/cars/MapPickerModal'
import { BookingCalendar } from '@/components/cars/BookingCalendar'

interface CarSearchFormProps {
  onSearch: (params: CarSearchParams) => void
  initialParams?: Partial<CarSearchParams>
  embedded?: boolean
}

export interface CarSearchParams {
  pickupLocation: string
  pickupDate: string
  pickupTime: string
  passengers: number
  carType: string
}

interface PlaceSuggestion {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export function CarSearchForm({ onSearch, initialParams, embedded = false }: CarSearchFormProps) {
  const [searchParams, setSearchParams] = useState<CarSearchParams>({
    pickupLocation: initialParams?.pickupLocation || '',
    pickupDate: initialParams?.pickupDate || '',
    pickupTime: initialParams?.pickupTime || '10:00',
    passengers: initialParams?.passengers || 0,
    carType: initialParams?.carType || '',
  })

  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [showCalendar, setShowCalendar] = useState(false)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (initialParams) {
      setSearchParams(prev => ({
        pickupLocation: initialParams.pickupLocation ?? prev.pickupLocation,
        pickupDate: initialParams.pickupDate ?? prev.pickupDate,
        pickupTime: initialParams.pickupTime ?? prev.pickupTime,
        passengers: initialParams.passengers ?? prev.passengers,
        carType: initialParams.carType ?? prev.carType,
      }))
    }
  }, [
    initialParams?.pickupLocation,
    initialParams?.pickupDate,
    initialParams?.pickupTime,
    initialParams?.passengers,
    initialParams?.carType
  ])

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setShowSuggestions(false)
      }
      if (!(target as HTMLElement).closest('[data-calendar-container]')) {
        setShowCalendar(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.trim().length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsLoadingSuggestions(true)
    try {
      const response = await carsApi.autocompleteLocation(input, 'pk')
      setSuggestions(response.suggestions || [])
      setShowSuggestions(true)
    } catch (error) {
      console.error('Autocomplete error:', error)
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  const handleLocationInput = (value: string) => {
    setSearchParams(prev => ({ ...prev, pickupLocation: value }))
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current)
    }
    
    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value)
    }, 300)
  }

  const selectSuggestion = (suggestion: PlaceSuggestion) => {
    setSearchParams(prev => ({
      ...prev,
      pickupLocation: suggestion.description,
    }))
    setShowSuggestions(false)
    setSuggestions([])
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setShowSuggestions(false)
    onSearch(searchParams)
  }

  const updateParam = (key: keyof CarSearchParams, value: string | number) => {
    setSearchParams(prev => ({ ...prev, [key]: value }))
  }

  const today = new Date().toISOString().split('T')[0]

  const inputClasses = "flex h-12 w-full rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm"
  const dateInputClasses = "flex h-12 w-full rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark] backdrop-blur-sm"

  const containerClass = embedded
    ? ''
    : 'bg-gray-900/70 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-2xl'

  return (
    <div className={containerClass}>
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={(address) => {
          setSearchParams(prev => ({ ...prev, pickupLocation: address }))
          setSuggestions([])
          setShowSuggestions(false)
        }}
      />
      <form onSubmit={handleSearch} className="space-y-5">
        {/* Main Search Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Pickup Location with Autocomplete */}
          <div className="space-y-2 lg:col-span-2 relative" ref={dropdownRef}>
            <label className="text-sm font-medium leading-none text-white flex items-center justify-between">
              <span className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Pickup Location
              </span>
              <button
                type="button"
                onClick={() => setShowMapPicker(true)}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-700/60 hover:border-cyan-500 px-2 py-0.5 rounded-lg transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                Pick on map
              </button>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search city, airport, or address..."
                value={searchParams.pickupLocation}
                onChange={(e) => handleLocationInput(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true)
                }}
                className={inputClasses}
                autoComplete="off"
                required
              />
              {isLoadingSuggestions && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin h-4 w-4 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              )}

              {/* Autocomplete Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion.place_id}
                      type="button"
                      onClick={() => selectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors flex items-start space-x-3 border-b border-gray-700/50 last:border-b-0"
                    >
                      <svg className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">
                          {suggestion.structured_formatting.main_text}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {suggestion.structured_formatting.secondary_text}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pickup Date */}
          <div className="space-y-2 relative" data-calendar-container>
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Pickup Date
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCalendar(!showCalendar)}
                className={`flex h-12 w-full items-center justify-between rounded-xl border border-gray-600 bg-gray-900/80 px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 backdrop-blur-sm ${searchParams.pickupDate ? 'text-white' : 'text-gray-400'}`}
              >
                {searchParams.pickupDate ? searchParams.pickupDate.replace(/-/g, ' - ') : 'yyyy - mm - dd'}
                <svg className="w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
              
              {showCalendar && (
                <div className="absolute top-full left-0 mt-2 z-50 w-[320px] max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
                  <BookingCalendar
                    selectedDate={searchParams.pickupDate || ''}
                    onDateSelect={(date) => {
                      updateParam('pickupDate', date)
                      setShowCalendar(false)
                    }}
                    unavailableDates={[]}
                    numberOfDays={1}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Pickup Time */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Pickup Time
            </label>
            <input
              type="time"
              value={searchParams.pickupTime}
              onChange={(e) => updateParam('pickupTime', e.target.value)}
              className={dateInputClasses}
            />
          </div>
        </div>

        {/* Secondary Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Passengers */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Passengers
            </label>
            <select
              value={searchParams.passengers}
              onChange={(e) => updateParam('passengers', parseInt(e.target.value))}
              className={inputClasses}
            >
              <option value={0} className="bg-gray-800">Any</option>
              <option value={2} className="bg-gray-800">1-2 passengers</option>
              <option value={4} className="bg-gray-800">3-4 passengers</option>
              <option value={5} className="bg-gray-800">5 passengers</option>
              <option value={7} className="bg-gray-800">6-7 passengers</option>
              <option value={8} className="bg-gray-800">8+ passengers</option>
            </select>
          </div>

          {/* Transmission */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-white flex items-center">
              <svg className="w-4 h-4 mr-2 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Transmission
            </label>
            <select
              value={searchParams.carType}
              onChange={(e) => updateParam('carType', e.target.value)}
              className={inputClasses}
            >
              <option value="" className="bg-gray-800">Any</option>
              <option value="automatic" className="bg-gray-800">Automatic</option>
              <option value="manual" className="bg-gray-800">Manual</option>
            </select>
          </div>

          {/* Search Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none text-transparent select-none">
              Search
            </label>
            <Button 
              type="submit" 
              className="w-full h-12 bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 text-white text-base rounded-xl transition-all duration-75 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Search Cars
            </Button>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex justify-center items-center space-x-6 text-sm text-gray-300 pt-1">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Verified Drivers
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Secure Payments
          </div>
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Instant Booking
          </div>
        </div>
      </form>
    </div>
  )
}
