'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Plane, CreditCard, User, Mail, Phone } from 'lucide-react'

// Mock flight data
const mockFlight = {
  id: '1',
  flightNumber: 'PK-306',
  airlineCode: 'PK',
  airlineName: 'Pakistan International Airlines',
  origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
  destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  departureTime: '2024-01-15T08:30:00Z',
  arrivalTime: '2024-01-15T10:45:00Z',
  duration: 135,
  baseFare: 65000,
  taxes: 8500,
  totalFare: 73500,
  currency: 'PKR',
  availableSeats: 12,
  cabinClass: 'ECONOMY',
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
  }
}

export default function FlightBookingConfirmPage() {
  const [passengers, setPassengers] = useState([
    {
      id: 1,
      type: 'ADULT',
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      nationality: 'Pakistan'
    }
  ])

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: ''
  })

  const [agreedToTerms, setAgreedToTerms] = useState(false)

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
    return mockFlight.totalFare * passengers.length
  }

  const calculatePlatformCommission = () => {
    return Math.round(calculateTotalPrice() * 0.05)
  }

  const calculateAirlineAmount = () => {
    return calculateTotalPrice() - calculatePlatformCommission()
  }

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updatedPassengers = [...passengers]
    updatedPassengers[index] = { ...updatedPassengers[index], [field]: value }
    setPassengers(updatedPassengers)
  }

  const addPassenger = () => {
    setPassengers([...passengers, {
      id: passengers.length + 1,
      type: 'ADULT',
      title: 'Mr',
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      passportNumber: '',
      nationality: 'Pakistan'
    }])
  }

  const handleProceedToPayment = () => {
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    // In real app, this would create booking and redirect to Stripe
    const bookingData = {
      flightId: mockFlight.id,
      passengers,
      contactInfo,
      totalPrice: calculateTotalPrice(),
      platformCommission: calculatePlatformCommission(),
      airlineAmount: calculateAirlineAmount()
    }

    console.log('Creating booking:', bookingData)
    
    // Simulate Stripe redirect
    alert('Redirecting to Stripe payment...')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/client/flights/${mockFlight.id}`}>
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Flight Details
            </Button>
          </Link>
          
          <h1 className="text-3xl font-bold text-white">Confirm Your Booking</h1>
          <p className="text-cyan-100 mt-2">Review your flight details and passenger information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Flight Summary */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40"
            >
              <div className="flex items-center mb-6">
                <Plane className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Flight Summary</h2>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <img 
                    src={mockFlight.provider.logo} 
                    alt={mockFlight.provider.name}
                    className="w-12 h-12 rounded-lg mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-white">{mockFlight.provider.name}</h3>
                    <p className="text-cyan-300">Flight {mockFlight.flightNumber} • {mockFlight.cabinClass}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{formatTime(mockFlight.departureTime)}</div>
                    <div className="text-sm text-gray-300">{formatDate(mockFlight.departureTime)}</div>
                    <div className="font-semibold text-cyan-300">{mockFlight.origin.code}</div>
                    <div className="text-sm text-gray-400">{mockFlight.origin.city}</div>
                  </div>

                  <div className="flex-1 mx-8">
                    <div className="flex items-center justify-center mb-2">
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
                    <div className="text-2xl font-bold text-white">{formatTime(mockFlight.arrivalTime)}</div>
                    <div className="text-sm text-gray-300">{formatDate(mockFlight.arrivalTime)}</div>
                    <div className="font-semibold text-cyan-300">{mockFlight.destination.code}</div>
                    <div className="text-sm text-gray-400">{mockFlight.destination.city}</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Passenger Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <User className="w-6 h-6 text-cyan-400 mr-3" />
                  <h2 className="text-xl font-bold text-white">Passenger Details</h2>
                </div>
                <Button 
                  onClick={addPassenger}
                  variant="outline"
                  className="border-cyan-500 text-cyan-300 hover:bg-cyan-500/10"
                >
                  + Add Passenger
                </Button>
              </div>

              <div className="space-y-6">
                {passengers.map((passenger, index) => (
                  <div key={passenger.id} className="bg-gray-900/50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">
                      Passenger {index + 1} - {passenger.type}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                        <select 
                          value={passenger.title}
                          onChange={(e) => handlePassengerChange(index, 'title', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                        >
                          <option value="Mr">Mr</option>
                          <option value="Mrs">Mrs</option>
                          <option value="Ms">Ms</option>
                          <option value="Miss">Miss</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Type</label>
                        <select 
                          value={passenger.type}
                          onChange={(e) => handlePassengerChange(index, 'type', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                        >
                          <option value="ADULT">Adult (12+)</option>
                          <option value="CHILD">Child (2-11)</option>
                          <option value="INFANT">Infant (Under 2)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name</label>
                        <input 
                          type="text"
                          value={passenger.firstName}
                          onChange={(e) => handlePassengerChange(index, 'firstName', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                          placeholder="Enter first name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name</label>
                        <input 
                          type="text"
                          value={passenger.lastName}
                          onChange={(e) => handlePassengerChange(index, 'lastName', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                          placeholder="Enter last name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Date of Birth</label>
                        <input 
                          type="date"
                          value={passenger.dateOfBirth}
                          onChange={(e) => handlePassengerChange(index, 'dateOfBirth', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Passport Number</label>
                        <input 
                          type="text"
                          value={passenger.passportNumber}
                          onChange={(e) => handlePassengerChange(index, 'passportNumber', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                          placeholder="Enter passport number"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Nationality</label>
                        <select 
                          value={passenger.nationality}
                          onChange={(e) => handlePassengerChange(index, 'nationality', e.target.value)}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                        >
                          <option value="Pakistan">Pakistan</option>
                          <option value="India">India</option>
                          <option value="Bangladesh">Bangladesh</option>
                          <option value="UAE">UAE</option>
                          <option value="Saudi Arabia">Saudi Arabia</option>
                          <option value="UK">United Kingdom</option>
                          <option value="USA">United States</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40"
            >
              <div className="flex items-center mb-6">
                <Mail className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Contact Information</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                  <input 
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                    placeholder="your.email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                  <input 
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  <textarea 
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500"
                    rows={3}
                    placeholder="Enter your address"
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 border border-cyan-700/40 sticky top-6"
            >
              <div className="flex items-center mb-6">
                <CreditCard className="w-6 h-6 text-cyan-400 mr-3" />
                <h2 className="text-xl font-bold text-white">Booking Summary</h2>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-300">Base Fare ({passengers.length} passengers)</span>
                  <span className="text-white">PKR {(mockFlight.baseFare * passengers.length).toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-300">Taxes & Fees</span>
                  <span className="text-white">PKR {(mockFlight.taxes * passengers.length).toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Platform Commission (5%)</span>
                  <span className="text-cyan-300">PKR {calculatePlatformCommission().toLocaleString()}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-300">Airline Amount (95%)</span>
                  <span className="text-blue-300">PKR {calculateAirlineAmount().toLocaleString()}</span>
                </div>

                <div className="border-t border-gray-600 pt-4">
                  <div className="flex justify-between">
                    <span className="text-white font-semibold">Total Amount</span>
                    <span className="text-2xl font-bold text-cyan-300">
                      PKR {calculateTotalPrice().toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="mb-6">
                <label className="flex items-start space-x-3">
                  <input 
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                  />
                  <span className="text-sm text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-cyan-400 hover:underline">
                      Terms and Conditions
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-cyan-400 hover:underline">
                      Privacy Policy
                    </Link>
                  </span>
                </label>
              </div>

              {/* Payment Button */}
              <Button 
                onClick={handleProceedToPayment}
                className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 rounded-xl font-semibold"
              >
                Proceed to Secure Payment
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
