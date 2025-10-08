'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Hotel } from '@/types'

interface HotelCardProps {
  hotel: Hotel
}

export function HotelCard({ hotel }: HotelCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center">
        {Array.from({ length: fullStars }).map((_, i) => (
          <span key={i} className="text-yellow-400 text-sm">★</span>
        ))}
        {hasHalfStar && <span className="text-yellow-400 text-sm">☆</span>}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <span key={i} className="text-gray-600 text-sm">☆</span>
        ))}
      </div>
    )
  }

  const getAmenityIcons = (amenities: string[]) => {
    const iconMap: { [key: string]: string } = {
      'wifi': '📶',
      'pool': '🏊',
      'parking': '🅿️',
      'breakfast': '🍳',
      'gym': '💪',
      'spa': '🧘',
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
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer group"
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        {hotel.images?.[0] ? (
          <Image
            src={hotel.images[0]}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <span className="text-4xl text-gray-500">🏨</span>
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            PKR {(hotel.pricePerNight || 0).toLocaleString()}/night
          </div>
        </div>

        {/* Favorite Button */}
        <button className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-300 backdrop-blur-sm">
          <span className="text-lg">🤍</span>
        </button>
      </div>
      
      {/* Content Section */}
      <div className="p-6">
        {/* Hotel Name & Location */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#38bdf8] transition-colors">
            {hotel.name}
          </h3>
          <p className="text-gray-400 flex items-center">
            <span className="mr-1">📍</span>
            {hotel.location}
          </p>
        </div>
        
        {/* Rating & Reviews */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {renderStars(hotel.rating || 0)}
            <span className="text-gray-300 text-sm">
              {hotel.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            {Math.floor(Math.random() * 500) + 50} reviews
          </span>
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2 mb-4">
          {hotel.description || 'Experience luxury and comfort at this beautiful hotel.'}
        </p>
        
        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex items-center space-x-2 mb-4">
            {getAmenityIcons(hotel.amenities)}
            {hotel.amenities.length > 4 && (
              <span className="text-gray-400 text-sm">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
        
        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <span>🏨</span>
            <span>{hotel.roomTypes?.length || 0} room types</span>
          </div>
          
          <Button 
            size="sm"
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e40af] hover:to-[#0f766e] text-white border-0"
          >
            View Details
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
