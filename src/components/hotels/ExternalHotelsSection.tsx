'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { hotelsApi, ExternalHotel, ExternalHotelDetails } from '@/lib/api/hotels.api'

// ─── Icon helpers ────────────────────────────────────────────────────────────

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5a17.92 17.92 0 0 1-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
)

const MapPinIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const PhoneIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
)

const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
)

const XIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
)

const ChevronLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
)

// ─── Price level badge ────────────────────────────────────────────────────────

const priceLevelLabel = (level: number | null) => {
  if (level === null) return null
  const signs = ['Free', '$', '$$', '$$$', '$$$$']
  return signs[level] ?? null
}

// ─── Star rating visual ───────────────────────────────────────────────────────

const StarRating = ({ rating, totalRatings }: { rating: number; totalRatings: number }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star
          const half = !filled && rating >= star - 0.5
          return (
            <span
              key={star}
              className={`text-sm leading-none ${
                filled ? 'text-yellow-400' : half ? 'text-yellow-400/60' : 'text-gray-600'
              }`}
            >
              ★
            </span>
          )
        })}
      </div>
      <span className="text-white text-xs font-semibold">{rating.toFixed(1)}</span>
      <span className="text-gray-400 text-xs">({totalRatings.toLocaleString()})</span>
    </div>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SkeletonCard = () => (
  <div className="rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/40 overflow-hidden animate-pulse">
    <div className="h-44 bg-gray-700/60" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-700 rounded w-3/4" />
      <div className="h-3 bg-gray-700 rounded w-full" />
      <div className="h-3 bg-gray-700 rounded w-1/2" />
      <div className="h-9 bg-gray-700 rounded-xl mt-2" />
    </div>
  </div>
)

// ─── Pagination ───────────────────────────────────────────────────────────────

const HOTELS_PER_PAGE = 6

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination = ({ currentPage, totalPages, onPageChange }: PaginationProps) => {
  if (totalPages <= 1) return null
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-gray-700/50"
      >
        ← Prev
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-9 h-9 rounded-xl text-sm font-semibold transition-all border ${
            page === currentPage
              ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white border-cyan-600/50'
              : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white border-gray-700/50'
          }`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-2 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all border border-gray-700/50"
      >
        Next →
      </button>
    </div>
  )
}

// ─── External Hotel Card ──────────────────────────────────────────────────────

interface CardProps {
  hotel: ExternalHotel
  onClick: (hotel: ExternalHotel) => void
}

const ExternalHotelCard = ({ hotel, onClick }: CardProps) => {
  const [imgError, setImgError] = useState(false)
  const photo = !imgError && hotel.photos.length > 0 ? hotel.photos[0] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.15 } }}
      transition={{ duration: 0.35 }}
      onClick={() => onClick(hotel)}
      className="group cursor-pointer rounded-2xl bg-gray-800/50 backdrop-blur-sm border border-gray-700/40 hover:border-cyan-500/50 overflow-hidden transition-all duration-200 hover:shadow-xl hover:shadow-cyan-900/20"
    >
      {/* Photo */}
      <div className="relative h-44 bg-gray-700/60 overflow-hidden">
        {photo ? (
          <Image
            src={photo}
            alt={hotel.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z" />
            </svg>
          </div>
        )}

        {/* External badge */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-900/80 backdrop-blur-sm text-cyan-400 border border-cyan-500/30">
            <GlobeIcon />
            External
          </span>
        </div>

        {/* Price level */}
        {hotel.price_level !== null && (
          <div className="absolute top-3 right-3">
            <span className="px-2 py-1 rounded-full text-xs font-bold bg-gray-900/80 backdrop-blur-sm text-emerald-400 border border-emerald-500/30">
              {priceLevelLabel(hotel.price_level)}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-white font-semibold text-base leading-snug mb-1 line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {hotel.name}
        </h3>

        {/* Rating */}
        {hotel.rating !== null && (
          <div className="mb-2">
            <StarRating rating={hotel.rating} totalRatings={hotel.total_ratings} />
          </div>
        )}

        {/* Address */}
        {hotel.address && (
          <div className="flex items-start gap-1.5 text-gray-400 text-xs mb-3">
            <span className="mt-0.5 shrink-0 text-cyan-500/70"><MapPinIcon /></span>
            <span className="line-clamp-2">{hotel.address}</span>
          </div>
        )}

        <button className="w-full py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#1e3a8a]/60 to-[#0d9488]/60 hover:from-[#1e3a8a] hover:to-[#0d9488] text-white border border-cyan-700/30 hover:border-cyan-500/60 transition-all duration-200">
          View Details
        </button>
      </div>
    </motion.div>
  )
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

interface ModalProps {
  placeId: string
  onClose: () => void
}

const ExternalHotelModal = ({ placeId, onClose }: ModalProps) => {
  const [hotel, setHotel] = useState<ExternalHotelDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [photoIndex, setPhotoIndex] = useState(0)
  const fetchedRef = useRef(false)

  // Fetch details only once when modal mounts
  const fetchDetails = useCallback(async () => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    try {
      const res = await hotelsApi.getExternalDetails(placeId)
      if (res?.data) setHotel(res.data)
      else setError(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [placeId])

  // Run on mount
  useEffect(() => { fetchDetails() }, [fetchDetails])

  const prevPhoto = () => setPhotoIndex(i => (i - 1 + (hotel?.photos.length ?? 1)) % (hotel?.photos.length ?? 1))
  const nextPhoto = () => setPhotoIndex(i => (i + 1) % (hotel?.photos.length ?? 1))

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <motion.div
          className="relative z-10 w-full max-w-lg bg-gray-900 border border-gray-700/60 rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
          >
            <XIcon />
          </button>

          {loading && (
            <div className="flex-1 flex flex-col animate-pulse">
              <div className="h-56 bg-gray-800" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-700 rounded w-2/3" />
                <div className="h-3 bg-gray-700 rounded w-full" />
                <div className="h-3 bg-gray-700 rounded w-3/4" />
                <div className="h-10 bg-gray-700 rounded-xl mt-4" />
              </div>
            </div>
          )}

          {error && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <p className="text-gray-400 mb-4">Could not load hotel details.</p>
              <button onClick={onClose} className="text-cyan-400 hover:text-cyan-300 text-sm underline">Close</button>
            </div>
          )}

          {hotel && (
            <div className="flex-1 overflow-y-auto">
              {/* Photo carousel */}
              <div className="relative h-56 bg-gray-800 overflow-hidden">
                {hotel.photos.length > 0 ? (
                  <>
                    <Image
                      key={photoIndex}
                      src={hotel.photos[photoIndex]}
                      alt={hotel.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 512px) 100vw, 512px"
                    />
                    {hotel.photos.length > 1 && (
                      <>
                        <button
                          onClick={prevPhoto}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-900/70 hover:bg-gray-900 text-white transition-colors"
                        >
                          <ChevronLeftIcon />
                        </button>
                        <button
                          onClick={nextPhoto}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-gray-900/70 hover:bg-gray-900 text-white transition-colors"
                        >
                          <ChevronRightIcon />
                        </button>
                        {/* Dot indicators */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                          {hotel.photos.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setPhotoIndex(i)}
                              className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIndex ? 'bg-white w-3' : 'bg-white/40'}`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                    <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" />
                    </svg>
                  </div>
                )}

                {/* External badge */}
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-900/80 backdrop-blur-sm text-cyan-400 border border-cyan-500/30">
                    <GlobeIcon />
                    External
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h2 className="text-white font-bold text-xl leading-snug">{hotel.name}</h2>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {hotel.rating !== null && (
                      <StarRating rating={hotel.rating} totalRatings={hotel.total_ratings} />
                    )}
                    {hotel.price_level !== null && (
                      <span className="text-emerald-400 text-sm font-semibold">{priceLevelLabel(hotel.price_level)}</span>
                    )}
                  </div>
                </div>

                {/* Address */}
                {hotel.address && (
                  <div className="flex items-start gap-2 text-gray-300 text-sm mb-2">
                    <span className="mt-0.5 shrink-0 text-cyan-500"><MapPinIcon /></span>
                    <span>{hotel.address}</span>
                  </div>
                )}

                {/* Phone */}
                {hotel.phone && (
                  <div className="flex items-center gap-2 text-gray-300 text-sm mb-2">
                    <span className="shrink-0 text-cyan-500"><PhoneIcon /></span>
                    <span>{hotel.phone}</span>
                  </div>
                )}

                {/* Opening hours */}
                {hotel.opening_hours && hotel.opening_hours.length > 0 && (
                  <div className="mt-3 mb-3 p-3 rounded-xl bg-gray-800/60 border border-gray-700/40">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-1.5">Hours</p>
                    <ul className="space-y-0.5">
                      {hotel.opening_hours.map((h, i) => (
                        <li key={i} className="text-gray-300 text-xs">{h}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* CTA Buttons */}
                <div className="flex flex-col gap-2.5 mt-4">
                  {hotel.website && (
                    <a
                      href={hotel.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white hover:shadow-lg hover:shadow-cyan-900/30 transition-all duration-200"
                    >
                      <ExternalLinkIcon />
                      Visit Hotel Website
                    </a>
                  )}
                  <a
                    href={hotel.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-sm bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-600/50 hover:border-gray-500 transition-all duration-200"
                  >
                    <MapPinIcon />
                    View on Google Maps
                  </a>
                </div>

                {/* Google attribution — required by ToS */}
                <p className="text-center text-gray-600 text-xs mt-4">
                  Hotel data powered by{' '}
                  <span className="text-gray-500">Google Places</span>
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main Section ─────────────────────────────────────────────────────────────

interface ExternalHotelsSectionProps {
  city: string
}

export function ExternalHotelsSection({ city }: ExternalHotelsSectionProps) {
  const [hotels, setHotels] = useState<ExternalHotel[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  // Cache per city to avoid repeat calls
  const cacheRef = useRef<Record<string, ExternalHotel[]>>({})

  const handleExplore = useCallback(async () => {
    const key = city.trim().toLowerCase()

    if (cacheRef.current[key]) {
      setHotels(cacheRef.current[key])
      setLoaded(true)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const res = await hotelsApi.searchExternal(city)
      const data = res?.data ?? []
      cacheRef.current[key] = data
      setHotels(data)
      setLoaded(true)
    } catch {
      setError('Failed to load external hotels. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [city])

  // When city changes while section is already expanded, auto-refresh for the new city
  useEffect(() => {
    if (!loaded) return
    handleExplore()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Reset to page 1 whenever a new set of hotels loads
  useEffect(() => {
    setCurrentPage(1)
  }, [hotels])

  const handleClose = () => {
    setLoaded(false)
    setHotels([])
    setCurrentPage(1)
  }

  const totalPages = Math.ceil(hotels.length / HOTELS_PER_PAGE)
  const paginatedHotels = hotels.slice((currentPage - 1) * HOTELS_PER_PAGE, currentPage * HOTELS_PER_PAGE)

  return (
    <div className="mt-12">
      {/* Divider + trigger */}
      {!loaded && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center py-10 px-4"
        >
          {/* Decorative divider */}
          <div className="flex items-center gap-4 w-full max-w-md mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-cyan-700/50 to-cyan-700/50" />
            <span className="text-cyan-500 text-lg">✦</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-cyan-700/50 to-cyan-700/50" />
          </div>

          <h3 className="text-white font-bold text-xl mb-2">Explore More Hotels</h3>
          <p className="text-gray-400 text-sm mb-6 max-w-sm">
            Can&apos;t find what you&apos;re looking for?{' '}
            {city ? (
              <>Discover more hotels across <span className="text-cyan-400 font-medium">{city}</span> and beyond.</>
            ) : (
              <>Discover hotels worldwide powered by Google.</>
            )}
          </p>

          <button
            onClick={handleExplore}
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white hover:shadow-lg hover:shadow-cyan-900/30 hover:scale-105 transition-all duration-200"
          >
            <GlobeIcon />
            Explore External Hotels
          </button>
        </motion.div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div>
          <div className="flex items-center gap-4 w-full mb-6">
            <div className="flex-1 h-px bg-cyan-700/30" />
            <span className="text-cyan-400 text-sm font-medium flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading external hotels...
            </span>
            <div className="flex-1 h-px bg-cyan-700/30" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* Results */}
      {loaded && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Section header */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div>
              <h3 className="text-white font-bold text-xl flex items-center gap-2">
                <GlobeIcon />
                {city ? `External Hotels in "${city}"` : 'External Hotels'}
              </h3>
              <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                <span>Powered by</span>
                <span className="text-gray-300 font-medium">Google Places</span>
                <span>· Click a hotel to view details &amp; booking options</span>
              </p>
            </div>
            <button
              onClick={handleClose}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700/50 transition-all duration-200"
            >
              <XIcon />
              Close
            </button>
          </div>

          {error && (
            <div className="text-center py-10 text-gray-400">
              <p>{error}</p>
              <button onClick={handleExplore} className="mt-3 text-cyan-400 hover:text-cyan-300 text-sm underline">
                Try again
              </button>
            </div>
          )}

          {!error && hotels.length === 0 && (
            <div className="text-center py-10 text-gray-400">
              <p>No external hotels found{city ? ` in &quot;${city}&quot;` : ''}.</p>
            </div>
          )}

          {!error && hotels.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {paginatedHotels.map((hotel, i) => (
                  <motion.div
                    key={hotel.place_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.05 }}
                  >
                    <ExternalHotelCard hotel={hotel} onClick={h => setSelectedPlaceId(h.place_id)} />
                  </motion.div>
                ))}
              </div>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          )}
        </motion.div>
      )}

      {/* Detail Modal */}
      {selectedPlaceId && (
        <ExternalHotelModal
          key={selectedPlaceId}
          placeId={selectedPlaceId}
          onClose={() => setSelectedPlaceId(null)}
        />
      )}
    </div>
  )
}
