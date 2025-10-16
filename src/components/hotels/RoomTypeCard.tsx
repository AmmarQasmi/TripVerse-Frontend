'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { RoomType } from '@/types'

interface RoomTypeCardProps {
  room: RoomType
  onSelect: () => void
  isSelected?: boolean
  isAuthenticated?: boolean
}

export function RoomTypeCard({ room, onSelect, isSelected, isAuthenticated = true }: RoomTypeCardProps) {
  const getAmenityIcons = (amenities: string[]) => {
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'breakfast': '🍳',
      'spa': '🧘',
      'pool': '🏊',
      'parking': '🅿️',
      'gym': '💪',
      'restaurant': '🍽️',
      'bar': '🍸'
    }
    
    return amenities.slice(0, 4).map((amenity, index) => (
      <span key={index} className="text-sm" title={amenity}>
        {iconMap[amenity.toLowerCase()] || '✓'}
      </span>
    ))
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border transition-all duration-300 ${
        isSelected 
          ? 'border-[#38bdf8] ring-2 ring-[#38bdf8]/20' 
          : 'border-gray-700/50 hover:border-gray-600/50'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Room Image */}
        <div className="lg:col-span-1">
          <div className="relative aspect-video rounded-xl overflow-hidden">
            {room.images?.[0] ? (
              <Image
                src={room.images[0]}
                alt={room.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                <span className="text-4xl text-gray-500">🛏️</span>
              </div>
            )}
          </div>
        </div>

        {/* Room Details */}
        <div className="lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">
                  {room.name}
                </h3>
                <p className="text-gray-400 text-sm flex items-center">
                  <span className="mr-1">👥</span>
                  Up to {room.capacity} guests
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-white">
                  PKR {room.pricePerNight.toLocaleString()}
                </div>
                <div className="text-gray-400 text-sm">per night</div>
              </div>
            </div>

            <p className="text-gray-300 mb-4 leading-relaxed">
              {room.description}
            </p>

            {/* Room Amenities */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="flex items-center space-x-2 mb-4">
                {getAmenityIcons(room.amenities)}
                {room.amenities.length > 4 && (
                  <span className="text-gray-400 text-sm">
                    +{room.amenities.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Select Button */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {isSelected ? (
                <span className="text-[#38bdf8] font-medium">✓ Selected</span>
              ) : !isAuthenticated ? (
                <span className="text-yellow-400 font-medium">🔒 Login required</span>
              ) : (
                <span>Click to select this room</span>
              )}
            </div>
            <Button
              onClick={onSelect}
              className={`px-6 py-2 rounded-xl font-semibold transition-all duration-300 ${
                isSelected
                  ? 'bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-white'
                  : 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e40af] hover:to-[#0f766e] text-white'
              }`}
            >
              {isSelected ? 'Selected' : !isAuthenticated ? '🔒 Login to Book' : 'Select Room'}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
