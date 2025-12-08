'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Clock, MapPin, Plane, Star, Users } from 'lucide-react'
import { Flight } from '@/types'
import { flightsApi } from '@/lib/api/flights.api'

interface FlightCardProps {
  flight: Flight | {
    id: string
    flightNumber: string
    airlineName: string
    origin: { code: string; name: string; city: string; country: string }
    destination: { code: string; name: string; city: string; country: string }
    departureTime: string
    arrivalTime: string
    duration: number
    totalFare: number
    currency: string
    availableSeats: number
    cabinClass: string
    aircraft: string
    stops: number
    provider: {
      name: string
      logo: string
      rating: number
    }
  }
  onSelect?: () => void
}

export function FlightCard({ flight, onSelect }: FlightCardProps) {
  const [isBooking, setIsBooking] = useState(false)
  
  // Check if flight is from Duffel API (has offer_id) or mock data
  const isDuffelFlight = 'offer_id' in flight && flight.offer_id
  
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getStopsText = (stops: number) => {
    if (stops === 0) return 'Direct'
    if (stops === 1) return '1 Stop'
    return `${stops} Stops`
  }

  const getStopsColor = (stops: number) => {
    if (stops === 0) return 'text-green-400 bg-green-400/20'
    if (stops === 1) return 'text-yellow-400 bg-yellow-400/20'
    return 'text-red-400 bg-red-400/20'
  }

  // Extract data based on flight type
  const flightData = isDuffelFlight ? {
    id: flight.id,
    flightNumber: flight.flight_number,
    airlineName: flight.airline,
    origin: flight.origin,
    destination: flight.destination,
    departureTime: flight.departure.time,
    arrivalTime: flight.arrival.time,
    duration: flight.duration_minutes,
    totalFare: parseFloat(flight.price.amount),
    currency: flight.price.currency,
    availableSeats: 0, // Not available in Duffel response
    cabinClass: flight.cabin_class,
    aircraft: '', // Not available in Duffel response
    stops: flight.stops,
    provider: {
      name: flight.airline,
      logo: '', // Would need to fetch airline logos
      rating: 4.0 // Default rating
    }
  } : flight as any

  const handleBookNow = async (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (!isDuffelFlight) {
      // For mock flights, just show details
      if (onSelect) onSelect()
      return
    }

    setIsBooking(true)
    try {
      const response = await flightsApi.createBookingLink(flight.offer_id)
      // Redirect to Duffel booking page
      window.location.href = response.booking_url
    } catch (error) {
      console.error('Failed to create booking link:', error)
      alert('Failed to create booking link. Please try again.')
      setIsBooking(false)
    }
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40 hover:border-cyan-500/60 transition-all cursor-pointer group"
      onClick={onSelect || undefined}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Airline Info */}
        <div className="lg:col-span-3">
          <div className="flex items-center mb-3">
            {flightData.provider.logo && (
              <img 
                src={flightData.provider.logo} 
                alt={flightData.provider.name}
                className="w-12 h-12 rounded-lg mr-4 object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                {flightData.provider.name}
              </h3>
              <p className="text-sm text-gray-400">{flightData.flightNumber} • {flightData.cabinClass}</p>
              {flightData.provider.rating && (
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3 h-3 ${i < Math.floor(flightData.provider.rating) ? 'fill-current' : 'text-gray-600'}`} 
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400 ml-1">{flightData.provider.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Flight Route */}
        <div className="lg:col-span-5">
          <div className="flex items-center justify-between">
            {/* Departure */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {formatTime(flightData.departureTime)}
              </div>
              <div className="text-sm text-gray-300">
                {new Date(flightData.departureTime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="font-semibold text-cyan-300 text-lg">{flightData.origin.code}</div>
              <div className="text-xs text-gray-400">{flightData.origin.city}</div>
            </div>

            {/* Flight Path */}
            <div className="flex-1 mx-6">
              <div className="flex items-center justify-center mb-2">
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStopsColor(flightData.stops)}`}>
                  {getStopsText(flightData.stops)}
                </div>
              </div>
              
              <div className="relative">
                <div className="border-t-2 border-cyan-500 border-dashed"></div>
                <div className="absolute left-1/2 transform -translate-x-1/2 -top-2">
                  <Plane className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              
              <div className="text-center mt-2">
                <div className="flex items-center justify-center text-sm text-cyan-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatDuration(flightData.duration)}
                </div>
                {flightData.aircraft && (
                  <div className="text-xs text-gray-500 mt-1">{flightData.aircraft}</div>
                )}
              </div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <div className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {formatTime(flightData.arrivalTime)}
              </div>
              <div className="text-sm text-gray-300">
                {new Date(flightData.arrivalTime).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </div>
              <div className="font-semibold text-cyan-300 text-lg">{flightData.destination.code}</div>
              <div className="text-xs text-gray-400">{flightData.destination.city}</div>
            </div>
          </div>
        </div>

        {/* Price & Actions */}
        <div className="lg:col-span-4">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                PKR {flightData.totalFare.toLocaleString()}
              </div>
              <div className="text-sm text-gray-400">per passenger</div>
              {flightData.availableSeats > 0 && (
                <div className="flex items-center justify-end mt-2 text-xs text-gray-500">
                  <Users className="w-3 h-3 mr-1" />
                  {flightData.availableSeats} seats left
                </div>
              )}
            </div>

            <div className="ml-4 flex flex-col gap-2">
              {isDuffelFlight ? (
                <Button
                  onClick={handleBookNow}
                  disabled={isBooking}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {isBooking ? 'Loading...' : 'Book Now'}
                </Button>
              ) : (
                onSelect && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect()
                    }}
                    className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    View Details
                  </Button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{flightData.origin.name}</span>
            </div>
            <div className="text-gray-600">→</div>
            <div className="flex items-center text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              <span>{flightData.destination.name}</span>
            </div>
          </div>
          
          <div className="text-gray-400">
            {flightData.cabinClass}
            {flightData.aircraft && ` • ${flightData.aircraft}`}
          </div>
        </div>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </motion.div>
  )
}
