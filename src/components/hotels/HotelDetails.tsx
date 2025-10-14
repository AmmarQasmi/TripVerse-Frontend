'use client'

import { Hotel } from '@/types'

interface HotelDetailsProps {
  hotel: Hotel
}

export function HotelDetails({ hotel }: HotelDetailsProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
      <h3 className="text-2xl font-bold text-white mb-6">About this hotel</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Description</h4>
          <p className="text-gray-300 leading-relaxed">
            {hotel.description}
          </p>
        </div>

        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Highlights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">⭐</span>
              <span className="text-gray-300">
                {hotel.rating?.toFixed(1) || 'N/A'} average rating
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🏨</span>
              <span className="text-gray-300">
                {hotel.roomTypes?.length || 0} room types available
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🧭</span>
              <span className="text-gray-300">
                Located in {hotel.location}
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-2xl">💰</span>
              <span className="text-gray-300">
                From PKR {hotel.pricePerNight?.toLocaleString()} per night
              </span>
            </div>
          </div>
        </div>

        {hotel.address && (
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">Address</h4>
            <p className="text-gray-300 flex items-start space-x-2">
              <span className="text-lg mt-0.5">🧭</span>
              <span>{hotel.address}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
