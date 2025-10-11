'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { FlightSearchForm } from '@/components/flights/FlightSearchForm'
import { PopularRoutesCarousel } from '@/components/flights/PopularRoutesCarousel'
import { FlightCard } from '@/components/flights/FlightCard'
import { FlightFilters } from '@/components/flights/FlightFilters'
import { FlightDetailsModal } from '@/components/flights/FlightDetailsModal'
import { TrustSection } from '@/components/flights/TrustSection'
import { TransparentHeader } from '@/components/shared/TransparentHeader'

// Mock flight data with Pakistani airlines
const mockFlights = [
  {
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
  },
  {
    id: '2',
    flightNumber: 'SV-703',
    airlineCode: 'SV',
    airlineName: 'Saudia',
    origin: { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    destination: { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    departureTime: '2024-01-15T14:20:00Z',
    arrivalTime: '2024-01-15T16:35:00Z',
    duration: 135, // 2h 15m
    baseFare: 72000,
    taxes: 9200,
    totalFare: 81200,
    currency: 'PKR',
    availableSeats: 8,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Airbus A320',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'saudia',
      name: 'Saudia',
      logo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=100&h=100&fit=crop',
      rating: 4.5,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    flightNumber: 'EK-602',
    airlineCode: 'EK',
    airlineName: 'Emirates',
    origin: { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    departureTime: '2024-01-15T11:15:00Z',
    arrivalTime: '2024-01-15T13:30:00Z',
    duration: 135, // 2h 15m
    baseFare: 85000,
    taxes: 11500,
    totalFare: 96500,
    currency: 'PKR',
    availableSeats: 15,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Boeing 777-300ER',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'emirates',
      name: 'Emirates',
      logo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=100&h=100&fit=crop',
      rating: 4.8,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    flightNumber: 'PA-201',
    airlineCode: 'PA',
    airlineName: 'Air Blue',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    departureTime: '2024-01-15T23:45:00Z',
    arrivalTime: '2024-01-16T06:30:00Z',
    duration: 525, // 8h 45m
    baseFare: 185000,
    taxes: 25000,
    totalFare: 210000,
    currency: 'PKR',
    availableSeats: 5,
    cabinClass: 'ECONOMY' as const,
    aircraft: 'Airbus A330-200',
    stops: 0,
    baggage: {
      cabin: { pieces: 1, weight: 7 },
      checked: { pieces: 1, weight: 23, included: true }
    },
    provider: {
      id: 'airblue',
      name: 'Air Blue',
      logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=100&h=100&fit=crop',
      rating: 4.3,
      isPlatformPartner: true,
      commissionRate: 5
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockPopularRoutes = [
  {
    id: '1',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
    startingPrice: 73500,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 15
  },
  {
    id: '2',
    origin: { code: 'LHE', name: 'Allama Iqbal International', city: 'Lahore', country: 'Pakistan' },
    destination: { code: 'JED', name: 'King Abdulaziz International', city: 'Jeddah', country: 'Saudi Arabia' },
    startingPrice: 81200,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 10
  },
  {
    id: '3',
    origin: { code: 'ISB', name: 'Islamabad International', city: 'Islamabad', country: 'Pakistan' },
    destination: { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    startingPrice: 95000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=50&h=50&fit=crop',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 20
  },
  {
    id: '4',
    origin: { code: 'KHI', name: 'Jinnah International', city: 'Karachi', country: 'Pakistan' },
    destination: { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    startingPrice: 210000,
    currency: 'PKR',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop',
    airlineLogos: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=50&h=50&fit=crop'
    ],
    isPopular: true,
    discount: 12
  }
]

export default function FlightsPage() {
  const [selectedFlight, setSelectedFlight] = useState<any>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [searchParams, setSearchParams] = useState({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: { adults: 1, children: 0, infants: 0 },
    cabinClass: 'ECONOMY'
  })

  const handleFlightSelect = (flight: any) => {
    setSelectedFlight(flight)
    setShowDetailsModal(true)
  }

  const handleSearch = (params: any) => {
    setSearchParams(params)
    // In real app, this would trigger API call
    console.log('Searching flights with:', params)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900">
      {/* Transparent Header */}
      <TransparentHeader />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <div 
            className="w-full h-full bg-cover bg-center opacity-20"
            style={{
              backgroundImage: 'url(https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1920&h=1080&fit=crop)'
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800/80 via-cyan-900/70 to-teal-900/80"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              ✈️ Find, Compare & Book Your Perfect Flight
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed max-w-3xl mx-auto">
              Experience secure, smart, and affordable bookings — powered by AI.
            </p>
          </motion.div>

          {/* Flight Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-6xl mx-auto"
          >
            <FlightSearchForm onSearch={handleSearch} />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-gray-300 mt-6 text-sm"
          >
            Discover the most popular destinations from Pakistan
          </motion.p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center"
          >
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
          </motion.div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-16 px-4 bg-gray-900/70 backdrop-blur-md">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-4">
              Popular Routes & Deals
            </h2>
            <p className="text-cyan-100">
              Discover the most popular destinations from Pakistan
            </p>
          </motion.div>

          <PopularRoutesCarousel routes={mockPopularRoutes} />
        </div>
      </section>

      {/* Search Results Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters Sidebar */}
            <div className="lg:col-span-1">
              <FlightFilters />
            </div>

            {/* Flight Results */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  Available Flights ({mockFlights.length})
                </h3>
                <div className="flex items-center space-x-4">
                  <select className="bg-gray-800/80 border border-cyan-700/40 rounded-lg px-4 py-2 text-white">
                    <option>Sort by Price</option>
                    <option>Sort by Duration</option>
                    <option>Sort by Departure</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                {mockFlights.map((flight, index) => (
                  <motion.div
                    key={flight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FlightCard 
                      flight={flight} 
                      onSelect={() => handleFlightSelect(flight)}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <TrustSection />

      {/* Flight Details Modal */}
      {showDetailsModal && selectedFlight && (
        <FlightDetailsModal
          flight={selectedFlight}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  )
}
