'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'

type SearchType = 'flight' | 'hotel' | 'rental'

export function SearchBar() {
  const router = useRouter()
  const [searchType, setSearchType] = useState<SearchType>('flight')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [returnCarDate, setReturnCarDate] = useState('')
  
  // Form state for all inputs
  const [flightFrom, setFlightFrom] = useState('')
  const [flightTo, setFlightTo] = useState('')
  const [travelers, setTravelers] = useState('1')
  const [hotelDestination, setHotelDestination] = useState('')
  const [hotelGuests, setHotelGuests] = useState('2')
  const [carPickupLocation, setCarPickupLocation] = useState('')
  const [carDropoffLocation, setCarDropoffLocation] = useState('')
  const [carPickupTime, setCarPickupTime] = useState('10:00')
  const [carDropoffTime, setCarDropoffTime] = useState('10:00')
  const [carVehicleType, setCarVehicleType] = useState('Any')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build query parameters based on search type
    const params = new URLSearchParams()
    
    switch (searchType) {
      case 'flight':
        // Cache flight search data
        const flightSearchData = {
          from: flightFrom,
          to: flightTo,
          departure: departureDate,
          return: returnDate,
          travelers: travelers,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_flight_search', JSON.stringify(flightSearchData))
        }
        
        if (flightFrom) params.set('from', flightFrom)
        if (flightTo) params.set('to', flightTo)
        if (departureDate) params.set('departure', departureDate)
        if (returnDate) params.set('return', returnDate)
        if (travelers) params.set('travelers', travelers)
        router.push(`/client/flights?${params.toString()}`)
        break
      case 'hotel':
        // Cache hotel search data - use 'location' to match form field name
        const hotelSearchData = {
          location: hotelDestination, // This will be stored as 'location' in cache
          checkIn: checkInDate,
          checkOut: checkOutDate,
          guests: hotelGuests,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_hotel_search', JSON.stringify(hotelSearchData))
        }
        
        if (hotelDestination) params.set('location', hotelDestination)
        if (checkInDate) params.set('checkIn', checkInDate)
        if (checkOutDate) params.set('checkOut', checkOutDate)
        if (hotelGuests) params.set('guests', hotelGuests)
        router.push(`/client/hotels?${params.toString()}`)
        break
      case 'rental':
        // Cache rental search data
        const rentalSearchData = {
          pickupLocation: carPickupLocation,
          dropoffLocation: carDropoffLocation,
          pickupDate: pickupDate,
          returnDate: returnCarDate,
          pickupTime: carPickupTime,
          dropoffTime: carDropoffTime,
          vehicleType: carVehicleType,
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('cached_rental_search', JSON.stringify(rentalSearchData))
        }
        
        if (carPickupLocation) params.set('pickupLocation', carPickupLocation)
        if (carDropoffLocation) params.set('dropoffLocation', carDropoffLocation)
        if (pickupDate) params.set('pickupDate', pickupDate)
        if (returnCarDate) params.set('returnDate', returnCarDate)
        if (carPickupTime) params.set('pickupTime', carPickupTime)
        if (carDropoffTime) params.set('dropoffTime', carDropoffTime)
        if (carVehicleType && carVehicleType !== 'Any') params.set('vehicleType', carVehicleType)
        router.push(`/client/cars?${params.toString()}`)
        break
      default:
        break
    }
  }

  // Get today's date for min date
  const today = new Date().toISOString().split('T')[0]

  // Unified input classes for consistent dark theme styling - matching the reference image
  const inputClasses = "flex h-10 w-full rounded-md border border-gray-300 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
  const dateInputClasses = "flex h-10 w-full rounded-md border border-gray-300 bg-gray-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all [color-scheme:dark]"

  return (
    <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 w-full max-w-5xl px-4 z-20">
      <motion.div 
        className="relative bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-6 overflow-hidden"
        animate={{
          boxShadow: [
            '0 0 20px rgba(21, 94, 117, 0.3)',
            '0 0 40px rgba(21, 94, 117, 0.6)',
            '0 0 20px rgba(21, 94, 117, 0.3)'
          ]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          border: '4px solid rgba(21, 94, 117, 0.6)'
        }}
      >
        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b">
          {[
            { 
              key: 'flight', 
              label: 'Flight', 
              icon: (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                  <svg className="w-5 h-5 relative z-10 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full shadow-md pointer-events-none"></div>
                </div>
              )
            },
            { 
              key: 'hotel', 
              label: 'Hotel', 
              icon: (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                  <svg className="w-5 h-5 relative z-10 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 7V3H2v18h20V7H12zm-2 12H4v-2h6v2zm0-4H4v-2h6v2zm0-4H4V9h6v2zm10 8h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full shadow-md pointer-events-none"></div>
                </div>
              )
            },
            { 
              key: 'rental', 
              label: 'Rental', 
              icon: (
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-600 p-[2px]">
                    <div className="w-full h-full rounded-full bg-white"></div>
                  </div>
                  <svg className="w-5 h-5 relative z-10 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
                  </svg>
                  <div className="absolute inset-0 rounded-full shadow-md pointer-events-none"></div>
                </div>
              )
            }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSearchType(tab.key as SearchType)}
              className={`flex items-center space-x-3 px-6 py-3 font-medium transition-colors relative ${
                searchType === tab.key
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
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
                  value={flightFrom}
                  onChange={(e) => setFlightFrom(e.target.value)}
                  className={inputClasses}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-white">To</label>
                <input
                  type="text"
                  placeholder="Destination city"
                  value={flightTo}
                  onChange={(e) => setFlightTo(e.target.value)}
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
                  value={travelers}
                  onChange={(e) => setTravelers(e.target.value)}
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
                  value={hotelDestination}
                  onChange={(e) => setHotelDestination(e.target.value)}
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
                  value={hotelGuests}
                  onChange={(e) => setHotelGuests(e.target.value)}
                  className={inputClasses}
                />
              </div>
            </div>
          )}

          {searchType === 'rental' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-white">Pickup Location</label>
                  <input
                    type="text"
                    placeholder="City or address"
                    value={carPickupLocation}
                    onChange={(e) => setCarPickupLocation(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-white">Drop-off Location</label>
                  <input
                    type="text"
                    placeholder="Same as pickup (optional)"
                    value={carDropoffLocation}
                    onChange={(e) => setCarDropoffLocation(e.target.value)}
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
                  <label className="text-sm font-medium leading-none text-white">Drop-off Date</label>
                  <input
                    type="date"
                    value={returnCarDate}
                    onChange={(e) => setReturnCarDate(e.target.value)}
                    min={pickupDate || today}
                    className={dateInputClasses}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-white">Pickup Time</label>
                  <input
                    type="time"
                    value={carPickupTime}
                    onChange={(e) => setCarPickupTime(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-white">Drop-off Time</label>
                  <input
                    type="time"
                    value={carDropoffTime}
                    onChange={(e) => setCarDropoffTime(e.target.value)}
                    className={inputClasses}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium leading-none text-white">Vehicle Type</label>
                  <select 
                    value={carVehicleType}
                    onChange={(e) => setCarVehicleType(e.target.value)}
                    className={inputClasses}
                  >
                    <option className="bg-gray-800 text-white">Any</option>
                    <option className="bg-gray-800 text-white">Sedan</option>
                    <option className="bg-gray-800 text-white">SUV</option>
                    <option className="bg-gray-800 text-white">Van</option>
                    <option className="bg-gray-800 text-white">Luxury</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div className="mt-6 flex justify-center">
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 hover:from-blue-700 hover:via-cyan-700 hover:to-teal-700 text-white px-12 py-3 text-lg rounded-full transition-all duration-75 shadow-lg"
            >
              Search Now
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

