'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Hotel } from '@/types'
import Link from 'next/link'
import { useFavoriteHotels } from '@/hooks/useFavoriteHotels'

// --- SVG Icon Components ---
const BuildingIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
  </svg>
)

const HeartIcon = ({ className = 'w-5 h-5', filled = false }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
  </svg>
)

const MapPinIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const StarIcon = ({ className = 'w-4 h-4', filled = false }: { className?: string; filled?: boolean }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
)

// SVG amenity icons
const WifiIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z" />
  </svg>
)

const PoolIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 20c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M3 17c2 0 2-1 4-1s2 1 4 1 2-1 4-1 2 1 4 1M8 4v10M16 4v10M8 7h8" />
  </svg>
)

const ParkingIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 6h4a3 3 0 0 1 0 6H9V6Zm0 6v6M4 4h16v16H4z" />
  </svg>
)

const BreakfastIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3-.895-3-2s1.343-2 3-2 3 .895 3 2-1.343 2-3 2ZM5 14h14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Zm0-2h14M3 18h18" />
  </svg>
)

const GymIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7v10M18 7v10M2 9v6M22 9v6M6 12h12" />
  </svg>
)

const SpaIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-1.5 4-5 6-5 10a5 5 0 0 0 10 0c0-4-3.5-6-5-10Z" />
  </svg>
)

const RestaurantIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 3v18M6 3v6a3 3 0 0 0 6 0V3M9 3v8m0 5v5M9 16h0" />
  </svg>
)

const BarIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 21h8m-4-4v4M3 3h18l-6 8v5h-6v-5L3 3Z" />
  </svg>
)

const CheckIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
  </svg>
)

const DoorOpenIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 4v4h4v-4" />
  </svg>
)

interface HotelCardProps {
  hotel: Hotel
  onBook?: (hotel: Hotel) => void
  searchDates?: { checkIn: string; checkOut: string; guests: number; rooms: number }
}

export function HotelCard({ hotel, onBook, searchDates }: HotelCardProps) {
  const { isFavorite, toggleFavorite } = useFavoriteHotels()
  const isFavorited = isFavorite(hotel.id)

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0)
    
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon key={`full-${i}`} className="w-3.5 h-3.5 text-yellow-400" filled />
        ))}
        {hasHalfStar && <StarIcon className="w-3.5 h-3.5 text-yellow-400" />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarIcon key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-600" />
        ))}
      </div>
    )
  }

  const amenityIconMap: { [key: string]: React.ReactNode } = {
    'wifi': <WifiIcon />,
    'pool': <PoolIcon />,
    'parking': <ParkingIcon />,
    'breakfast': <BreakfastIcon />,
    'gym': <GymIcon />,
    'spa': <SpaIcon />,
    'restaurant': <RestaurantIcon />,
    'bar': <BarIcon />,
  }

  const getAmenityIcon = (amenity: string) => {
    return amenityIconMap[amenity.toLowerCase()] || <CheckIcon />
  }

  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-gray-600/50 transition-all duration-75 cursor-pointer group h-full flex flex-col"
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden flex-shrink-0">
        {hotel.images?.[0] ? (
          <img
            src={hotel.images[0]}
            alt={hotel.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <BuildingIcon className="w-12 h-12 text-gray-500" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-4 right-4">
          <div className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
            PKR {(hotel.pricePerNight || 0).toLocaleString()}/night
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(hotel.id)
          }}
          className="absolute top-4 left-4 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-all duration-200 backdrop-blur-sm"
        >
          <HeartIcon className="w-5 h-5" filled={isFavorited} />
        </button>
      </div>
      
      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        {/* Hotel Name & Location */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-[#38bdf8] transition-colors duration-75">
            {hotel.name}
          </h3>
          <p className="text-gray-400 flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            {hotel.location}
          </p>
        </div>
        
        {/* Rating & Room Types */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            {renderStars(hotel.rating || 0)}
            <span className="text-gray-300 text-sm">
              {hotel.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
          {hotel.roomTypes && hotel.roomTypes.length > 0 && (
            <span className="text-cyan-400 text-sm font-medium">
              {hotel.roomTypes.length} room type{hotel.roomTypes.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        
        {/* Description */}
        <p className="text-gray-300 text-sm line-clamp-2 mb-4 flex-1">
          {hotel.description || 'Experience luxury and comfort at this beautiful hotel.'}
        </p>
        
        {/* Amenities */}
        {hotel.amenities && hotel.amenities.length > 0 && (
          <div className="flex items-center gap-3 mb-4">
            {hotel.amenities.slice(0, 4).map((amenity, index) => (
              <span
                key={index}
                className="text-gray-400 hover:text-cyan-400 transition-colors"
                title={amenity}
              >
                {getAmenityIcon(amenity)}
              </span>
            ))}
            {hotel.amenities.length > 4 && (
              <span className="text-gray-400 text-sm">
                +{hotel.amenities.length - 4} more
              </span>
            )}
          </div>
        )}
        
        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <Link
            href={`/client/hotels/${hotel.id}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
            </svg>
            View Hotel
          </Link>
          
          <Button 
            size="sm"
            className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] hover:from-[#1e40af] hover:to-[#0f766e] text-white border-0"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              onBook?.(hotel)
            }}
          >
            Book Now
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
