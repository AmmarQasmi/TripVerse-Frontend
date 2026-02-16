'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Star,
  DollarSign,
  Clock,
  ExternalLink,
  ImageOff,
  Globe,
  X,
  Camera,
  Navigation,
} from 'lucide-react'
import { ReviewCarousel } from './ReviewCarousel'
import { MiniMap } from './MiniMap'

// Destination-themed placeholder images (small, fast-loading)
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=300&fit=crop&q=60',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=300&fit=crop&q=60',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&h=300&fit=crop&q=60',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&h=300&fit=crop&q=60',
  'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=600&h=300&fit=crop&q=60',
  'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=300&fit=crop&q=60',
]

interface PlaceCardProps {
  place: any
}

export function PlaceCard({ place }: PlaceCardProps) {
  const [imgError, setImgError] = useState(false)
  const [fallbackError, setFallbackError] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const placeData = place.place || null
  const wikiData = place.wiki || null

  const name = place.name || 'Unknown Place'
  const description = wikiData?.summary || place.description || null
  const photo = placeData?.photos?.[0]?.url || wikiData?.image || null
  const rating = placeData?.rating || null
  const totalRatings = placeData?.totalRatings || null
  const priceLevel = placeData?.priceLevel || null
  const entryFee = place.estimatedCost || null
  const openingHours = placeData?.openingHours || null
  const address = placeData?.address || null
  const coordinates = placeData?.coordinates || wikiData?.coordinates || null
  const reviews = placeData?.reviews || []
  const nearbyMarkets = place.nearby_markets || place.nearby || []
  const weatherTip = place.weather_tip || null
  const wikiUrl = wikiData?.url || null
  const placeUrl = placeData?.website || (coordinates ? `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}` : null)
  const timeSlot = place.timeSlot || null
  const travelTime = place.travelTime || place.travel_time || null

  const priceLevelDisplay = priceLevel ? Array(priceLevel).fill('$').join('') : null

  // Deterministic fallback image based on place name
  const fallbackIdx = name.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % FALLBACK_IMAGES.length
  const fallbackImage = FALLBACK_IMAGES[fallbackIdx]
  const displayImage = (!imgError && photo) ? photo : (!fallbackError ? fallbackImage : null)

  const timeSlotColors: Record<string, string> = {
    Morning: 'bg-amber-50 text-amber-700 border-amber-200',
    Afternoon: 'bg-sky-50 text-sky-700 border-sky-200',
    Evening: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }
  const timeSlotClass = timeSlotColors[timeSlot || ''] || 'bg-cyan-50 text-cyan-700 border-cyan-200'

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        {/* Photo */}
        {displayImage ? (
          <div
            className="relative h-44 sm:h-52 w-full bg-gray-100 cursor-pointer group overflow-hidden"
            onClick={() => setLightboxOpen(true)}
          >
            <img
              src={displayImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => {
                if (!imgError) setImgError(true)
                else setFallbackError(true)
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

            {rating && (
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-2.5 py-1 flex items-center gap-1 shadow-sm">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span className="text-sm font-bold text-gray-900">{rating}</span>
                {totalRatings && <span className="text-xs text-gray-500">({totalRatings})</span>}
              </div>
            )}

            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 text-white rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-xs">
              <Camera className="w-3 h-3" />
              View full
            </div>

            {imgError && !fallbackError && (
              <div className="absolute top-3 left-3 bg-black/40 text-white/70 rounded-lg px-2 py-1 text-[10px]">
                Placeholder image
              </div>
            )}

            {/* Name overlaid on image bottom */}
            <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
              <h4 className="text-white font-bold text-lg drop-shadow-md leading-tight">{name}</h4>
            </div>
          </div>
        ) : (
          <div className="h-32 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex flex-col items-center justify-center">
            <ImageOff className="w-6 h-6 text-gray-300 mb-1" />
            <p className="text-[10px] text-gray-400">No image available</p>
          </div>
        )}

        {/* Content */}
        <div className="p-4">
          {/* Name (only if no image to overlay on) */}
          {!displayImage && (
            <h4 className="text-base font-bold text-gray-900 leading-tight mb-2">{name}</h4>
          )}

          {/* Links row */}
          <div className="flex items-center justify-between mb-2">
            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              {timeSlot && (
                <span className={`px-2.5 py-0.5 rounded-full font-medium border ${timeSlotClass}`}>
                  {timeSlot}
                </span>
              )}
              {travelTime && (
                <span className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                  <Navigation className="w-3 h-3" />
                  {travelTime}
                </span>
              )}
              {entryFee && (
                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                  <DollarSign className="w-3 h-3" />
                  {entryFee}
                </span>
              )}
              {priceLevelDisplay && (
                <span className="text-emerald-600 font-medium">{priceLevelDisplay}</span>
              )}
            </div>
            {/* External links */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {wikiUrl && (
                <a href={wikiUrl} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Wikipedia">
                  <Globe className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                </a>
              )}
              {placeUrl && (
                <a href={placeUrl} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors" title="Google Maps">
                  <ExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                </a>
              )}
            </div>
          </div>

          {/* Address + hours */}
          {(address || openingHours) && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
              {address && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate max-w-[220px]">{address}</span>
                </span>
              )}
              {openingHours && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {typeof openingHours === 'string'
                    ? openingHours
                    : openingHours.openNow !== undefined
                      ? (openingHours.openNow ? '🟢 Open now' : '🔴 Closed')
                      : null}
                </span>
              )}
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-3 line-clamp-3">{description}</p>
          )}

          {/* Weather tip */}
          {weatherTip && (
            <div className="text-xs text-blue-700 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2 mb-3 flex items-start gap-2">
              <span className="mt-0.5">☁️</span>
              <span>{weatherTip}</span>
            </div>
          )}

          {/* Mini map */}
          {coordinates && (
            <div className="mb-3">
              <MiniMap
                lat={coordinates.lat || coordinates.latitude}
                lng={coordinates.lng || coordinates.longitude}
                name={name}
              />
            </div>
          )}

          {/* Reviews */}
          {reviews.length > 0 && <ReviewCarousel reviews={reviews} />}

          {/* Nearby */}
          {nearbyMarkets.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Nearby</p>
              <div className="flex flex-wrap gap-1.5">
                {nearbyMarkets.slice(0, 5).map((m: any, i: number) => (
                  <span key={i} className="px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-xs border border-gray-100">
                    {typeof m === 'string' ? m : m.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Lightbox for full-size image */}
      <AnimatePresence>
        {lightboxOpen && displayImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute -top-10 right-0 text-white/80 hover:text-white p-1"
              >
                <X className="w-6 h-6" />
              </button>
              <img src={displayImage} alt={name} className="w-full h-full object-contain rounded-xl" />
              <p className="text-center text-white/70 text-sm mt-2">{name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
