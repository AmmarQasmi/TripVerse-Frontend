'use client'

import { motion } from 'framer-motion'

interface HotelMapProps {
  location: string
  address?: string
}

export function HotelMap({ location, address }: HotelMapProps) {
  // In a real app, you would integrate with Google Maps or Mapbox
  // For now, we'll show a placeholder with some nearby attractions
  
  const nearbyAttractions = [
    { name: 'City Center', distance: '0.5 km', icon: '🏙️' },
    { name: 'Shopping Mall', distance: '1.2 km', icon: '🛍️' },
    { name: 'Airport', distance: '15 km', icon: '✈️' },
    { name: 'Beach', distance: '2.5 km', icon: '🏖️' },
    { name: 'Museum', distance: '0.8 km', icon: '🏛️' },
    { name: 'Restaurant District', distance: '1.0 km', icon: '🍽️' }
  ]

  return (
    <div className="space-y-6">
      {/* Map Placeholder */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="relative h-80 bg-gradient-to-br from-gray-700 to-gray-800">
          {/* Map placeholder */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-white mb-2">Interactive Map</h3>
              <p className="text-gray-400 mb-4">Map integration would go here</p>
              <button className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300">
                View on Google Maps
              </button>
            </div>
          </div>
          
          {/* Map marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-[#38bdf8] text-white p-3 rounded-full shadow-lg">
              📍
            </div>
          </div>
        </div>
        
        {/* Map info */}
        <div className="p-6 border-t border-gray-700/50">
          <h3 className="text-xl font-bold text-white mb-2">Hotel Location</h3>
          <p className="text-gray-300 mb-4">
            {address || `Located in the heart of ${location}, this hotel offers convenient access to major attractions and business districts.`}
          </p>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>📍 {location}</span>
            <span>🚗 Valet parking available</span>
            <span>🚌 Public transport nearby</span>
          </div>
        </div>
      </div>

      {/* Nearby Attractions */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6">Nearby Attractions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nearbyAttractions.map((attraction, index) => (
            <motion.div
              key={attraction.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors cursor-pointer"
            >
              <span className="text-2xl">{attraction.icon}</span>
              <div>
                <p className="text-white font-medium">{attraction.name}</p>
                <p className="text-gray-400 text-sm">{attraction.distance}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transportation */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
        <h3 className="text-xl font-bold text-white mb-6">Getting Around</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-3">🚕</div>
            <h4 className="font-semibold text-white mb-2">Taxi</h4>
            <p className="text-gray-400 text-sm">
              Taxi service available 24/7 from hotel lobby
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🚌</div>
            <h4 className="font-semibold text-white mb-2">Public Transport</h4>
            <p className="text-gray-400 text-sm">
              Bus stop 200m away, metro station 500m
            </p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-3">🚗</div>
            <h4 className="font-semibold text-white mb-2">Car Rental</h4>
            <p className="text-gray-400 text-sm">
              Car rental desk in hotel lobby
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
