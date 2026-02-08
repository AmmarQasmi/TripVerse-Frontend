'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { HotelSearchForm } from '@/components/hotels/HotelSearchForm'
import { CarSearchForm, CarSearchParams } from '@/components/cars/CarSearchForm'
import { FlightSearchForm } from '@/components/flights/FlightSearchForm'

type SearchType = 'flight' | 'hotel' | 'rental'

export function SearchBar() {
  const router = useRouter()
  const [searchType, setSearchType] = useState<SearchType>('flight')

  const handleHotelSearch = (params: any) => {
    const urlParams = new URLSearchParams()
    if (params.location) urlParams.set('location', params.location)
    if (params.checkIn) urlParams.set('checkIn', params.checkIn)
    if (params.checkOut) urlParams.set('checkOut', params.checkOut)
    if (params.guests) urlParams.set('guests', params.guests.toString())

    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_hotel_search', JSON.stringify({
        location: params.location,
        checkIn: params.checkIn,
        checkOut: params.checkOut,
        guests: params.guests?.toString(),
      }))
    }

    router.push(`/client/hotels?${urlParams.toString()}`)
  }

  const handleCarSearch = (params: CarSearchParams) => {
    const urlParams = new URLSearchParams()
    if (params.pickupLocation) urlParams.set('pickupLocation', params.pickupLocation)
    if (params.pickupDate) urlParams.set('pickupDate', params.pickupDate)
    if (params.pickupTime) urlParams.set('pickupTime', params.pickupTime)
    if (params.passengers) urlParams.set('passengers', params.passengers.toString())
    if (params.carType) urlParams.set('carType', params.carType)

    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_car_search', JSON.stringify(params))
    }

    router.push(`/client/cars?${urlParams.toString()}`)
  }

  const handleFlightSearch = (params: any) => {
    const urlParams = new URLSearchParams()
    if (params.origin) urlParams.set('from', params.origin)
    if (params.destination) urlParams.set('to', params.destination)
    if (params.departureDate) urlParams.set('departure', params.departureDate)
    if (params.returnDate) urlParams.set('return', params.returnDate)
    if (params.passengers?.adults) urlParams.set('travelers', params.passengers.adults.toString())

    if (typeof window !== 'undefined') {
      localStorage.setItem('cached_flight_search', JSON.stringify({
        from: params.origin,
        to: params.destination,
        departure: params.departureDate,
        return: params.returnDate,
        travelers: params.passengers?.adults?.toString(),
      }))
    }

    router.push(`/client/flights?${urlParams.toString()}`)
  }

  return (
    <div id="search-panel" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-5xl px-4 z-20">
      <motion.div 
        className="relative bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl p-6"
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
        <div className="flex space-x-2 mb-6 border-b border-gray-700/50 relative z-10">
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
              type="button"
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

        {/* Actual Search Forms from their respective pages */}
        {searchType === 'flight' && (
          <FlightSearchForm onSearch={handleFlightSearch} embedded />
        )}

        {searchType === 'hotel' && (
          <HotelSearchForm onSearch={handleHotelSearch} />
        )}

        {searchType === 'rental' && (
          <CarSearchForm onSearch={handleCarSearch} embedded />
        )}
      </motion.div>
    </div>
  )
}
