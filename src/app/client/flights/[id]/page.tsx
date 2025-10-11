'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Clock, MapPin, Plane, Users, Luggage } from 'lucide-react'

// Mock flight data (same as in main page)
const mockFlight = {
  id: '1',
  flightNumber: 'PK-306',
  airlineCode: 'PK',
  airlineName: 'Pakistan International Airlines',
  origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
  destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  departureTime: '2024-01-15T08:30:00Z',
  arrivalTime: '2024-01-15T10:45:00Z',
  duration: 135, // 2h 15m
  baseFare: 65000,
  taxes: 8500,
  totalFare: 73500,
  currency: 'PKR',
  availableSeats: 12,
  cabinClass: 'ECONOMY' as const,
  aircraft: 'Boeing 777-200LR',
  stops: 0,
  baggage: {
    cabin: { pieces: 1, weight: 7 },
    checked: { pieces: 1, weight: 23, included: true }
  },
  provider: {
    id: 'pia',
    name: 'Pakistan International Airlines',
    logo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=100&h=100&fit=crop',
    rating: 4.2,
    isPlatformPartner: true,
    commissionRate: 5
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

interface FlightDetailsPageProps {
  params: {
    id: string
  }
}

export default function FlightDetailsPage({ params }: FlightDetailsPageProps) {
  const [passengers, setPassengers] = useState({ adults: 1, children: 0, infants: 0 })
  const [cabinClass, setCabinClass] = useState('ECONOMY')

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

  const calculateTotalPrice = () => {
    const basePrice = mockFlight.totalFare
    const passengerCount = passengers.adults + passengers.children + passengers.infants
    return basePrice * passengerCount
  }

  const handleBookFlight = () => {
    // Navigate to booking confirmation page
    const bookingData = {
      flightId: mockFlight.id,
      passengers,
      cabinClass,
      totalPrice: calculateTotalPrice()
    }
    
    // In real app, this would be stored in state or passed via router
    console.log('Booking flight:', bookingData)
    
    // Navigate to booking page
    window.location.href = `/client/flights/booking/confirm?flightId=${mockFlight.id}&passengers=${JSON.stringify(passengers)}&cabinClass=${cabinClass}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <Link href="/client/flights">
          <Button variant="ghost" className="text-white hover:bg-white/10 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Flights
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Details */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-8 border border-cyan-700/40"
            >
              {/* Airline Header */}
              <div className="flex items-center mb-6">
                <img 
                  src={mockFlight.provider.logo} 
                  alt={mockFlight.provider.name}
                  className="w-16 h-16 rounded-lg mr-4"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{mockFlight.provider.name}</h1>
                  <p className="text-cyan-100">Flight {mockFlight.flightNumber} • {mockFlight.cabinClass}</p>
                  <div className="flex items-center mt-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(mockFlight.provider.rating) ? 'text-yellow-400' : 'text-gray-600'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-gray-300 text-sm ml-2">{mockFlight.provider.rating}</span>
                  </div>
                </div>
              </div>

              {/* Flight Timeline */}
              <div className="bg-gray-900/50 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{formatTime(mockFlight.departureTime)}</div>
                    <div className="text-sm text-gray-300">{formatDate(mockFlight.departureTime)}</div>
                    <div className="font-semibold text-cyan-300">{mockFlight.origin.code}</div>
                    <div className="text-sm text-gray-400">{mockFlight.origin.name}</div>
                    <div className="text-xs text-gray-500">{mockFlight.origin.city}, {mockFlight.origin.country}</div>
                  </div>

                  <div className="flex-1 mx-8">
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-4 h-4 text-cyan-400 mr-2" />
                      <span className="text-sm text-cyan-300">2h 15m</span>
                    </div>
                    <div className="relative">
                      <div className="border-t-2 border-cyan-500 border-dashed"></div>
                      <div className="absolute left-1/2 transform -translate-x-1/2 -top-2">
                        <Plane className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                    <div className="text-center mt-2">
                      <span className="text-xs text-gray-500">Direct Flight</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-white">{formatTime(mockFlight.arrivalTime)}</div>
                    <div className="text-sm text-gray-300">{formatDate(mockFlight.arrivalTime)}</div>
                    <div className="font-semibold text-cyan-300">{mockFlight.destination.code}</div>
                    <div className="text-sm text-gray-400">{mockFlight.destination.name}</div>
                    <div className="text-xs text-gray-500">{mockFlight.destination.city}, {mockFlight.destination.country}</div>
                  </div>
                </div>
              </div>

              {/* Flight Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Plane className="w-5 h-5 text-cyan-400 mr-2" />
                    <span className="font-semibold text-white">Aircraft</span>
                  </div>
                  <p className="text-gray-300">{mockFlight.aircraft}</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Users className="w-5 h-5 text-cyan-400 mr-2" />
                    <span className="font-semibold text-white">Available Seats</span>
                  </div>
                  <p className="text-gray-300">{mockFlight.availableSeats} seats</p>
                </div>

                <div className="bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center mb-2">
                    <Luggage className="w-5 h-5 text-cyan-400 mr-2" />
                    <span className="font-semibold text-white">Baggage</span>
                  </div>
                  <p className="text-gray-300">
                    {mockFlight.baggage.cabin.weight}kg cabin, {mockFlight.baggage.checked.weight}kg checked
                  </p>
                </div>
              </div>

              {/* Fare Details */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Fare Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Base Fare</span>
                    <span className="text-white">PKR {mockFlight.baseFare.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Taxes & Fees</span>
                    <span className="text-white">PKR {mockFlight.taxes.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-2">
                    <div className="flex justify-between">
                      <span className="text-white font-semibold">Total per passenger</span>
                      <span className="text-cyan-300 font-bold">PKR {mockFlight.totalFare.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Panel */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40 sticky top-6"
            >
              <h3 className="text-xl font-bold text-white mb-6">Book Your Flight</h3>

              {/* Passenger Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Passengers</label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Adults (12+)</span>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setPassengers(prev => ({ ...prev, adults: Math.max(1, prev.adults - 1) }))}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{passengers.adults}</span>
                      <button 
                        onClick={() => setPassengers(prev => ({ ...prev, adults: prev.adults + 1 }))}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Children (2-11)</span>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setPassengers(prev => ({ ...prev, children: Math.max(0, prev.children - 1) }))}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{passengers.children}</span>
                      <button 
                        onClick={() => setPassengers(prev => ({ ...prev, children: prev.children + 1 }))}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Infants (Under 2)</span>
                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => setPassengers(prev => ({ ...prev, infants: Math.max(0, prev.infants - 1) }))}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        -
                      </button>
                      <span className="text-white font-semibold w-8 text-center">{passengers.infants}</span>
                      <button 
                        onClick={() => setPassengers(prev => ({ ...prev, infants: prev.infants + 1 }))}
                        className="w-8 h-8 rounded-full bg-gray-700 text-white hover:bg-cyan-600 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cabin Class */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-3">Cabin Class</label>
                <select 
                  value={cabinClass}
                  onChange={(e) => setCabinClass(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="ECONOMY">Economy</option>
                  <option value="PREMIUM_ECONOMY">Premium Economy</option>
                  <option value="BUSINESS">Business</option>
                  <option value="FIRST">First Class</option>
                </select>
              </div>

              {/* Total Price */}
              <div className="bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total Price</span>
                  <span className="text-2xl font-bold text-cyan-300">
                    PKR {calculateTotalPrice().toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {passengers.adults + passengers.children + passengers.infants} passenger(s)
                </p>
              </div>

              {/* Book Button */}
              <Button 
                onClick={handleBookFlight}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Book This Flight
              </Button>

              <p className="text-xs text-gray-400 text-center mt-4">
                All payments are protected and processed through Stripe.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
