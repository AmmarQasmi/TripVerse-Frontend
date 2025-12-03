'use client'

import { useEffect, useRef, useState } from 'react'

interface RouteMapProps {
  pickupLocation: string
  dropoffLocation: string
  distance?: number
  onDistanceCalculated?: (distance: number) => void
}

export function RouteMap({ pickupLocation, dropoffLocation, distance, onDistanceCalculated }: RouteMapProps) {
  const [isCalculating, setIsCalculating] = useState(false)
  const [mapUrl, setMapUrl] = useState<string | null>(null)

  useEffect(() => {
    if (pickupLocation && dropoffLocation) {
      // Create Google Maps directions URL (opens in new tab)
      // Using the standard Google Maps URL format that doesn't require API key
      const encodedPickup = encodeURIComponent(pickupLocation)
      const encodedDropoff = encodeURIComponent(dropoffLocation)
      // For embed, we'll use a static map or link to Google Maps
      // Since we don't have API key in frontend, we'll show a link instead
      setMapUrl(null)

      // Calculate distance via backend if not provided
      if (!distance && onDistanceCalculated) {
        calculateDistance()
      }
    } else {
      setMapUrl(null)
    }
  }, [pickupLocation, dropoffLocation])

  const calculateDistance = async () => {
    if (!pickupLocation || !dropoffLocation) return

    setIsCalculating(true)
    try {
      // We'll calculate distance when price is calculated, so this is just for display
      // The actual calculation happens in the backend
      setIsCalculating(false)
    } catch (error) {
      console.error('Failed to calculate distance:', error)
      setIsCalculating(false)
    }
  }

  if (!pickupLocation || !dropoffLocation) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="relative h-64 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
          <div className="text-center">
            <div className="text-5xl mb-4">🗺️</div>
            <p className="text-gray-400">Enter pickup and dropoff locations to view route</p>
          </div>
        </div>
      </div>
    )
  }

  const googleMapsUrl = pickupLocation && dropoffLocation 
    ? `https://www.google.com/maps/dir/${encodeURIComponent(pickupLocation)}/${encodeURIComponent(dropoffLocation)}`
    : null

  return (
    <div className="space-y-4">
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50">
        <div className="relative h-80 bg-gradient-to-br from-gray-700 to-gray-800">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🗺️</div>
              <h3 className="text-xl font-bold text-white mb-2">Route Preview</h3>
              <p className="text-gray-400 mb-4">View the route on Google Maps</p>
              {googleMapsUrl && (
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                >
                  View Route on Google Maps
                </a>
              )}
            </div>
          </div>
          
          {/* Route visualization */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 text-white text-sm">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="truncate">{pickupLocation}</span>
              </div>
              <div className="flex items-center space-x-2 pl-5">
                <div className="w-px h-4 bg-gray-400"></div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="truncate">{dropoffLocation}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Route Info */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <div className="space-y-2">
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase">Pickup</p>
                <p className="text-white font-medium">{pickupLocation}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 pl-5">
              <div className="w-px h-6 bg-gray-600"></div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="mt-1">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase">Dropoff</p>
                <p className="text-white font-medium">{dropoffLocation}</p>
              </div>
            </div>
            {distance && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Estimated Distance:</span>
                  <span className="text-lg font-bold text-white">{distance.toFixed(1)} km</span>
                </div>
              </div>
            )}
            {isCalculating && (
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm text-gray-400">Calculating distance...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

