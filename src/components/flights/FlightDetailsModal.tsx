'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { X, Clock, MapPin, Plane, Users, Luggage, Shield, Wifi, Utensils, Star } from 'lucide-react'

interface FlightDetailsModalProps {
  flight: {
    id: string
    flightNumber: string
    airlineName: string
    origin: { code: string; name: string; city: string; country: string }
    destination: { code: string; name: string; city: string; country: string }
    departureTime: string
    arrivalTime: string
    duration: number
    baseFare: number
    taxes: number
    totalFare: number
    currency: string
    availableSeats: number
    cabinClass: string
    aircraft: string
    stops: number
    baggage: {
      cabin: { pieces: number; weight: number }
      checked: { pieces: number; weight: number; included: boolean }
    }
    provider: {
      name: string
      logo: string
      rating: number
    }
  }
  isOpen: boolean
  onClose: () => void
}

export function FlightDetailsModal({ flight, isOpen, onClose }: FlightDetailsModalProps) {
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleBookFlight = () => {
    onClose()
    // Navigate to booking page
    window.location.href = `/client/flights/${flight.id}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-gray-900/95 backdrop-blur-md rounded-2xl border border-cyan-700/40 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <img 
                    src={flight.provider.logo} 
                    alt={flight.provider.name}
                    className="w-12 h-12 rounded-lg mr-4"
                  />
                  <div>
                    <h2 className="text-2xl font-bold text-white">{flight.provider.name}</h2>
                    <p className="text-cyan-300">Flight {flight.flightNumber} • {flight.cabinClass}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Flight Timeline */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-800/50 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Flight Route</h3>
                    
                    <div className="flex items-center justify-between">
                      {/* Departure */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{formatTime(flight.departureTime)}</div>
                        <div className="text-sm text-gray-300">{formatDate(flight.departureTime)}</div>
                        <div className="font-semibold text-cyan-300 text-xl">{flight.origin.code}</div>
                        <div className="text-sm text-gray-400">{flight.origin.name}</div>
                        <div className="text-xs text-gray-500">{flight.origin.city}, {flight.origin.country}</div>
                      </div>

                      {/* Flight Path */}
                      <div className="flex-1 mx-8">
                        <div className="flex items-center justify-center mb-2">
                          <Clock className="w-4 h-4 text-cyan-400 mr-2" />
                          <span className="text-sm text-cyan-300">{formatDuration(flight.duration)}</span>
                        </div>
                        <div className="relative">
                          <div className="border-t-2 border-cyan-500 border-dashed"></div>
                          <div className="absolute left-1/2 transform -translate-x-1/2 -top-2">
                            <Plane className="w-4 h-4 text-cyan-400" />
                          </div>
                        </div>
                        <div className="text-center mt-2">
                          <span className="text-xs text-gray-500">
                            {flight.stops === 0 ? 'Direct Flight' : `${flight.stops} Stop${flight.stops > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      </div>

                      {/* Arrival */}
                      <div className="text-center">
                        <div className="text-3xl font-bold text-white">{formatTime(flight.arrivalTime)}</div>
                        <div className="text-sm text-gray-300">{formatDate(flight.arrivalTime)}</div>
                        <div className="font-semibold text-cyan-300 text-xl">{flight.destination.code}</div>
                        <div className="text-sm text-gray-400">{flight.destination.name}</div>
                        <div className="text-xs text-gray-500">{flight.destination.city}, {flight.destination.country}</div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Plane className="w-5 h-5 text-cyan-400 mr-2" />
                        <span className="font-semibold text-white">Aircraft</span>
                      </div>
                      <p className="text-gray-300">{flight.aircraft}</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Users className="w-5 h-5 text-cyan-400 mr-2" />
                        <span className="font-semibold text-white">Available Seats</span>
                      </div>
                      <p className="text-gray-300">{flight.availableSeats} seats</p>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Luggage className="w-5 h-5 text-cyan-400 mr-2" />
                        <span className="font-semibold text-white">Baggage Allowance</span>
                      </div>
                      <div className="text-gray-300">
                        <div>Cabin: {flight.baggage.cabin.pieces} piece, {flight.baggage.cabin.weight}kg</div>
                        <div>Checked: {flight.baggage.checked.pieces} piece, {flight.baggage.checked.weight}kg</div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Shield className="w-5 h-5 text-cyan-400 mr-2" />
                        <span className="font-semibold text-white">Fare Type</span>
                      </div>
                      <p className="text-gray-300">Standard Fare</p>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-gray-800/50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-white mb-4">In-Flight Amenities</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex items-center text-gray-300">
                        <Wifi className="w-4 h-4 mr-2 text-cyan-400" />
                        <span className="text-sm">WiFi</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Utensils className="w-4 h-4 mr-2 text-cyan-400" />
                        <span className="text-sm">Meals</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="w-4 h-4 mr-2 text-cyan-400" />
                        <span className="text-sm">Entertainment</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Shield className="w-4 h-4 mr-2 text-cyan-400" />
                        <span className="text-sm">Insurance</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Panel */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-800/50 rounded-xl p-6 sticky top-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Book This Flight</h3>

                    {/* Price Breakdown */}
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Base Fare</span>
                        <span className="text-white">PKR {flight.baseFare.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Taxes & Fees</span>
                        <span className="text-white">PKR {flight.taxes.toLocaleString()}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-3">
                        <div className="flex justify-between">
                          <span className="text-white font-semibold">Total Price</span>
                          <span className="text-2xl font-bold text-cyan-300">
                            PKR {flight.totalFare.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Airline Rating */}
                    <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-300">Airline Rating</span>
                        <div className="flex items-center">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(flight.provider.rating) ? 'fill-current' : 'text-gray-600'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-300 ml-2">{flight.provider.rating}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-400">Based on passenger reviews</p>
                    </div>

                    {/* Book Button */}
                    <Button
                      onClick={handleBookFlight}
                      className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold mb-4"
                    >
                      Book This Flight
                    </Button>

                    <p className="text-xs text-gray-400 text-center">
                      All payments are protected and processed through Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
