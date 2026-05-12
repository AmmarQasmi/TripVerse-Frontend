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

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          border: '2px solid #0f2d44',
          borderTop: '4px solid #0f2d44',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          overflow: 'hidden',
          marginBottom: '12px',
          transition: 'all 0.3s ease',
          position: 'relative',
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.boxShadow = '0 14px 40px rgba(0,0,0,0.08)' 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.05)' 
        }}
      >
        {/* MIDDLE SECTION: Image + Details + Map */}
        <div style={{ display: 'flex', minHeight: '320px' }}>
          {/* LEFT: Hero Image (35%) */}
          <div
            style={{
              width: '35%',
              position: 'relative',
              background: '#e5e7eb',
              cursor: 'pointer',
              overflow: 'hidden',
              borderRadius: '0',
            }}
            onClick={() => setLightboxOpen(true)}
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt={name}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  transition: 'transform 0.45s ease, filter 0.2s ease',
                  filter: 'contrast(1.05) brightness(1.02)',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                onError={() => {
                  if (!imgError) setImgError(true)
                  else setFallbackError(true)
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #0a4a4a, #0d2b3e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin className="w-8 h-8" style={{ color: '#2dd4bf' }} />
              </div>
            )}
            <div style={{ position: 'absolute', inset: '0', background: 'linear-gradient(to bottom, rgba(0,0,0,0.03), rgba(0,0,0,0.14))' }} />
          </div>

          {/* RIGHT: Details Column (40%) */}
          <div
            style={{
              width: '40%',
              padding: '24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              background: '#ffffff',
              overflow: 'auto',
            }}
          >
            {/* Header: Featured Destination Label */}
            <div
              style={{
                background: 'linear-gradient(135deg, #0f2d44 0%, #0d2b3e 100%)',
                color: '#ffffff',
                borderRadius: '14px',
                padding: '18px 18px 16px',
                marginBottom: '4px',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.72)', margin: 0, marginBottom: '8px' }}>
                Featured Destination
              </p>

              {/* Title + Rating (Inline) */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '28px', lineHeight: 1.15, fontWeight: 800, color: '#ffffff', margin: 0, marginBottom: '6px' }}>
                    {name}
                  </h3>
                  {address && (
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.82)', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin className="w-3.5 h-3.5" style={{ color: '#2dd4bf', flexShrink: 0 }} />
                      <span>{address}</span>
                    </p>
                  )}
                </div>

                {rating && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px', flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      {Array.from({ length: 5 }).map((_, index) => (
                        <Star key={index} className="w-4 h-4" style={{ color: index < Math.round(Number(rating)) ? '#fbbf24' : 'rgba(255,255,255,0.25)', fill: index < Math.round(Number(rating)) ? '#fbbf24' : 'rgba(255,255,255,0.25)' }} />
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>
                      {rating} {totalRatings ? `(${totalRatings})` : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Row (Tight Horizontal) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {timeSlot && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#e0f2fe', color: '#075985', border: '1px solid #bae6fd' }}>
                  <Clock className="w-3 h-3" />
                  {timeSlot}
                </span>
              )}
              {travelTime && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' }}>
                  <Navigation className="w-3 h-3" />
                  {travelTime}
                </span>
              )}
              {entryFee || priceLevelDisplay ? (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: '#f3f4f6', color: '#4b5563', border: '1px solid #e5e7eb' }}>
                  <DollarSign className="w-3 h-3" />
                  {entryFee ? `${entryFee}` : `${priceLevelDisplay || 'Moderate'}`}
                </span>
              ) : null}
              {openingHours && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: openingHours.openNow ? '#ecfdf5' : '#fef2f2', color: openingHours.openNow ? '#047857' : '#b91c1c', border: `1px solid ${openingHours.openNow ? '#a7f3d0' : '#fecaca'}` }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '999px', background: openingHours.openNow ? '#10b981' : '#ef4444' }} />
                  {openingHours.openNow ? 'Open now' : 'Closed'}
                </span>
              )}
            </div>

            {/* Description */}
            {description && (
              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: 0 }}>
                {description}
              </p>
            )}

            {/* Weather Tip */}
            {weatherTip && (
              <div style={{ fontSize: '11px', color: '#0c4a6e', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '8px 10px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                <span style={{ marginTop: '1px' }}>💡</span>
                <span>{weatherTip}</span>
              </div>
            )}

            {/* Nearby Items */}
            {nearbyMarkets.length > 0 && (
              <div>
                <p style={{ fontSize: '9px', fontWeight: 700, color: '#64748b', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Nearby</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {nearbyMarkets.slice(0, 4).map((m: any, i: number) => (
                    <span key={i} style={{ paddingLeft: '8px', paddingRight: '8px', paddingTop: '3px', paddingBottom: '3px', background: '#f1f5f9', color: '#475569', borderRadius: '999px', fontSize: '10px', border: '1px solid #e2e8f0' }}>
                      {typeof m === 'string' ? m : m.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons (Bottom) */}
            <div style={{ display: 'flex', gap: '6px', marginTop: 'auto', flexWrap: 'wrap' }}>
              {wikiUrl && (
                <a href={wikiUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', fontWeight: 700, color: '#0f2d44', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '6px 10px' }}>
                  Wikipedia
                </a>
              )}
              {placeUrl && (
                <a href={placeUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', fontWeight: 700, color: '#0f2d44', border: '1px solid #cbd5e1', borderRadius: '999px', padding: '6px 10px' }}>
                  Open Maps
                </a>
              )}
            </div>
          </div>

          {/* CENTER: Map Column (25%) */}
          {coordinates && (
            <div style={{ width: '25%', height: '100%', borderLeft: '1px solid #e5e7eb' }}>
              <MiniMap
                lat={coordinates.lat || coordinates.latitude}
                lng={coordinates.lng || coordinates.longitude}
                name={name}
                height={320}
              />
            </div>
          )}
        </div>

        {/* BOTTOM SECTION: Featured Review + Reviews */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid #e5e7eb', backgroundColor: '#f8fafc' }}>
          {reviews.length > 0 && (
            <div style={{ marginBottom: reviews.length > 1 ? '20px' : '0' }}>
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#2dd4bf', marginBottom: '8px', margin: 0 }}>Featured Review</p>
              <div style={{ background: 'linear-gradient(135deg, #0f2d44 0%, #0d2b3e 100%)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: '12px', padding: '12px 14px' }}>
                <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', marginBottom: '10px', margin: 0 }}>
                  "{reviews[0]?.text || reviews[0]?.relative_time_description || reviews[0]?.timeDescription || 'A beautiful place to visit, known for its iconic architecture and vibrant food hall.'}"
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#ffffff' }}>
                    {reviews[0]?.author || reviews[0]?.author_name || 'Anonymous reviewer'}
                  </span>
                  {reviews[0]?.rating && (
                    <span style={{ fontSize: '12px', color: '#fbbf24', fontWeight: 700 }}>
                      {reviews[0].rating} / 5
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {reviews.length > 1 && (
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '8px', margin: 0 }}>Reviews</p>
              <ReviewCarousel reviews={reviews} />
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
            style={{ position: 'fixed', inset: '0px', background: 'rgba(0,0,0,0.85)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', cursor: 'pointer' }}
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{ position: 'relative', maxWidth: '1024px', maxHeight: '90vh', width: '100%' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                style={{ position: 'absolute', top: '-40px', right: '0px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: '4px' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'white' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)' }}
              >
                <X className="w-6 h-6" />
              </button>
              <img src={displayImage} alt={name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '12px' }} />
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '12px', marginTop: '8px' }}>{name}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
