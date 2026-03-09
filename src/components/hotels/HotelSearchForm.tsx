'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useAvailableCities } from '@/features/hotels/useHotelSearch'
import { carsApi } from '@/lib/api/cars.api'
import { MapPickerModal } from '@/components/cars/MapPickerModal'

// --- SVG Icon Components ---
const MapPinIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const CalendarIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
  </svg>
)

const UsersIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
  </svg>
)

const SearchIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
)

const GlobeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

const MinusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
  </svg>
)

const PlusIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

const CheckIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

interface SearchParams {
  query: string
  location: string
  checkIn: string
  checkOut: string
  guests: number
  rooms: number
}

interface PlaceSuggestion {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
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

  // Sync internal state when initialParams changes
  useEffect(() => {
    if (initialParams) {
      setParams(initialParams)
    }
  }, [
    initialParams?.location,
    initialParams?.checkIn,
    initialParams?.checkOut,
    initialParams?.guests,
    initialParams?.rooms,
    initialParams?.query
  ])

  const [showGuestsDropdown, setShowGuestsDropdown] = useState(false)
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [showMapPicker, setShowMapPicker] = useState(false)
  const [searchingText, setSearchingText] = useState('')
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([])
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)
  const cityDropdownRef = useRef<HTMLDivElement>(null)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null)

  // Fetch available cities from API
  const { data: availableCities, isLoading: citiesLoading } = useAvailableCities()

  const fetchSuggestions = useCallback(async (input: string) => {
    if (input.trim().length < 2) { setSuggestions([]); return }
    setIsLoadingSuggestions(true)
    try {
      const res = await carsApi.autocompleteLocation(input)
      setSuggestions((res as any)?.suggestions || (res as any)?.data?.suggestions || [])
    } catch {
      setSuggestions([])
    } finally {
      setIsLoadingSuggestions(false)
    }
  }, [])

  // Filter cities based on search text
  const filteredCities = (availableCities || []).filter((c: any) =>
    c.city.toLowerCase().includes(searchingText.toLowerCase()) ||
    c.region.toLowerCase().includes(searchingText.toLowerCase())
  )

  // Close city dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(params)
  }

  const updateParam = (key: keyof SearchParams, value: string | number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  const selectCity = (cityName: string) => {
    updateParam('location', cityName)
    setSearchingText(cityName)
    setShowCityDropdown(false)
    setSuggestions([])
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <>
      <MapPickerModal
        isOpen={showMapPicker}
        onClose={() => setShowMapPicker(false)}
        onLocationSelect={(address) => {
          updateParam('location', address)
          setSearchingText(address)
          setSuggestions([])
        }}
      />
      <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Destination */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center justify-between">
            <span>Where to?</span>
            <button
              type="button"
              onClick={() => setShowMapPicker(true)}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-700/60 hover:border-cyan-500 px-2 py-0.5 rounded-lg transition-colors font-normal"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Pick on map
            </button>
          </label>
          <div className="relative">
            <input
              ref={cityInputRef}
              type="text"
              placeholder="Search city, region or address..."
              value={showCityDropdown ? searchingText : params.location || searchingText}
              onChange={(e) => {
                const val = e.target.value
                setSearchingText(val)
                updateParam('location', val)
                setShowCityDropdown(true)
                if (debounceTimer.current) clearTimeout(debounceTimer.current)
                debounceTimer.current = setTimeout(() => fetchSuggestions(val), 300)
              }}
              onFocus={() => {
                setSearchingText(params.location || '')
                setShowCityDropdown(true)
              }}
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-75 pr-10"
              autoComplete="off"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {isLoadingSuggestions
                ? <svg className="animate-spin h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                : <MapPinIcon className="w-5 h-5" />
              }
            </div>
          </div>

          {/* Combined Dropdown */}
          {showCityDropdown && (
            <div
              ref={cityDropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600/50 rounded-xl shadow-2xl z-20 max-h-72 overflow-y-auto"
            >
              {/* DB city quick picks */}
              {filteredCities.length > 0 && (
                <>
                  <div className="px-4 pt-2.5 pb-1 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                    Hotels on TripVerse
                  </div>
                  {searchingText && (
                    <button
                      type="button"
                      onClick={() => { updateParam('location', ''); setSearchingText(''); setShowCityDropdown(false) }}
                      className="w-full px-4 py-2 text-left text-cyan-400 hover:bg-gray-700/50 text-sm border-b border-gray-700/50"
                    >
                      <span className="inline-flex items-center gap-1"><GlobeIcon /> Show All Hotels</span>
                    </button>
                  )}
                  {filteredCities.map((city: any) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => selectCity(city.city)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-cyan-500/70 shrink-0" />
                        <span className="text-white font-medium">{city.city}</span>
                        <span className="text-gray-400 text-sm">({city.region})</span>
                      </div>
                      <span className="text-cyan-400 text-sm shrink-0">{city.hotel_count} hotel{city.hotel_count !== 1 ? 's' : ''}</span>
                    </button>
                  ))}
                </>
              )}

              {/* Google Places suggestions */}
              {suggestions.length > 0 && (
                <>
                  <div className={`px-4 pt-2.5 pb-1 text-xs text-gray-500 font-semibold uppercase tracking-wide ${filteredCities.length > 0 ? 'border-t border-gray-700/50' : ''}`}>
                    Suggestions
                  </div>
                  {suggestions.slice(0, 5).map((s) => (
                    <button
                      key={s.place_id}
                      type="button"
                      onClick={() => selectCity(s.structured_formatting.main_text)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-start gap-3 border-b border-gray-700/30 last:border-b-0"
                    >
                      <svg className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{s.structured_formatting.main_text}</p>
                        <p className="text-gray-400 text-xs truncate">{s.structured_formatting.secondary_text}</p>
                      </div>
                    </button>
                  ))}
                </>
              )}

              {/* No DB cities + show external fallback */}
              {filteredCities.length === 0 && suggestions.length === 0 && searchingText && (
                <div>
                  {citiesLoading ? (
                    <div className="px-4 py-3 text-gray-400 text-sm">Loading...</div>
                  ) : (
                    <>
                      <div className="px-4 py-3 text-gray-400 text-sm border-b border-gray-700/50">
                        No TripVerse hotels found {`in "${searchingText}"`}
                      </div>
                      <button
                        type="button"
                        onClick={() => selectCity(searchingText)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors flex items-center gap-2"
                      >
                        <GlobeIcon className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span className="text-white">Search in <span className="text-cyan-400 font-medium">&ldquo;{searchingText}&rdquo;</span></span>
                        <span className="ml-auto text-gray-500 text-xs">External hotels</span>
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Empty state when form first focused */}
              {filteredCities.length === 0 && suggestions.length === 0 && !searchingText && !citiesLoading && (
                <div className="px-4 py-3 text-gray-400 text-sm">Type a city or region to search</div>
              )}
            </div>
          )}
        </div>

        {/* Check-in Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Check-in
          </label>
          <input
            type="date"
            value={params.checkIn}
            onChange={(e) => {
              updateParam('checkIn', e.target.value)
              // Auto-adjust checkout if it's before checkin
              if (params.checkOut && e.target.value > params.checkOut) {
                updateParam('checkOut', '')
              }
            }}
            min={today}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-75"
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
            min={params.checkIn || today}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-75"
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
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-left focus:border-[#38bdf8] focus:ring-2 focus:ring-[#38bdf8]/20 focus:outline-none transition-all duration-75 flex items-center justify-between"
          >
            <span>
              {params.guests} guest{params.guests > 1 ? 's' : ''}, {params.rooms} room{params.rooms > 1 ? 's' : ''}
            </span>
            <span className="text-gray-400"><UsersIcon className="w-5 h-5" /></span>
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
                  className="w-full bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white py-2 rounded-lg font-semibold hover:shadow-lg transition-all duration-75"
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
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] text-white px-12 py-4 rounded-2xl font-semibold text-lg hover:shadow-2xl transition-all duration-75 flex items-center space-x-3"
        >
          <SearchIcon className="w-5 h-5" />
          <span>Search Hotels</span>
        </motion.button>
      </div>
    </form>
    </>
  )
}
