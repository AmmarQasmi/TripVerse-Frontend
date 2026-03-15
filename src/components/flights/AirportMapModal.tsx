'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

interface LeafletMapProps {
  markerPos: [number, number] | null
  flyToPos: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}

const LeafletMap = dynamic<LeafletMapProps>(() => import('../cars/LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] flex items-center justify-center bg-gray-800">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-cyan-400" />
    </div>
  ),
})

interface AirportMapModalProps {
  isOpen: boolean
  onClose: () => void
  onBack?: () => void
  airport: {
    name: string
    city: string
    province: string
    country: string
    code: string
  } | null
}

// Verified airport coordinates (lat, lng) keyed by IATA code.
const AIRPORT_COORDINATES: Record<string, [number, number]> = {
  KHI: [24.9065, 67.1608],
  HDD: [25.3181, 68.3661],
  SKZ: [27.7215, 68.7917],
  WNS: [26.2194, 68.3901],
  JAG: [28.2842, 68.4497],
  LRG: [27.5450, 68.2156],
  MPD: [25.6820, 69.0728],
  DDU: [26.7317, 67.6660],
  LHE: [31.5216, 74.4036],
  LYP: [31.3650, 72.9950],
  MUX: [30.2032, 71.4191],
  SKT: [32.5356, 74.3639],
  BHV: [29.3481, 71.7180],
  DEA: [29.9610, 70.4859],
  SGI: [32.0486, 72.6650],
  RYK: [28.3839, 70.2796],
  PEW: [33.9939, 71.5146],
  BNP: [32.9729, 70.5279],
  CJL: [35.8866, 71.8006],
  DIK: [31.9094, 70.8966],
  PAJ: [33.9021, 70.0716],
  SDT: [34.8136, 72.3536],
  UET: [30.2514, 66.9388],
  GWD: [25.2333, 62.3295],
  TUK: [25.9864, 63.0310],
  PZH: [31.3584, 69.4636],
  PJG: [26.9545, 64.1325],
  DBA: [28.8783, 64.4047],
  PSI: [25.2905, 63.3440],
  ORW: [25.2747, 64.5850],
  KDU: [35.3355, 75.5360],
  GIL: [35.9188, 74.3336],
  CHB: [35.4210, 74.0880],
  ISB: [33.5490, 72.8250],
}

export function AirportMapModal({ isOpen, onClose, onBack, airport }: AirportMapModalProps) {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [flyToPos, setFlyToPos] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState<string>('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [mapRenderKey, setMapRenderKey] = useState(0)

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsGeocoding(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()
      setAddress(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } catch {
      setAddress(`${lat.toFixed(5)}, ${lng.toFixed(5)}`)
    } finally {
      setIsGeocoding(false)
    }
  }, [])

  const geocodeAirport = useCallback(async () => {
    if (!airport) return

    setIsLoadingLocation(true)
    try {
      const airportCode = airport.code?.toUpperCase()
      const knownCoords = airportCode ? AIRPORT_COORDINATES[airportCode] : null

      if (knownCoords) {
        setMarkerPos(knownCoords)
        setFlyToPos(knownCoords)
        setAddress(`${airport.name}, ${airport.city}, ${airport.province}, ${airport.country}`)
        void reverseGeocode(knownCoords[0], knownCoords[1])
        return
      }

      const query = encodeURIComponent(`${airport.name}, ${airport.city}, ${airport.country}`)
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      )
      const data = await res.json()

      if (Array.isArray(data) && data.length > 0) {
        const lat = parseFloat(data[0].lat)
        const lon = parseFloat(data[0].lon)
        setMarkerPos([lat, lon])
        setFlyToPos([lat, lon])
        setAddress(data[0].display_name || `${airport.city}, ${airport.country}`)
      } else {
        const fallbackQuery = encodeURIComponent(`${airport.city}, ${airport.country}`)
        const fallbackRes = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${fallbackQuery}&format=json&limit=1`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const fallbackData = await fallbackRes.json()

        if (Array.isArray(fallbackData) && fallbackData.length > 0) {
          const lat = parseFloat(fallbackData[0].lat)
          const lon = parseFloat(fallbackData[0].lon)
          setMarkerPos([lat, lon])
          setFlyToPos([lat, lon])
          setAddress(fallbackData[0].display_name || `${airport.city}, ${airport.country}`)
        }
      }
    } catch {
      setAddress(`${airport.city}, ${airport.country}`)
    } finally {
      setIsLoadingLocation(false)
    }
  }, [airport])

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      setMarkerPos([lat, lng])
      setFlyToPos([lat, lng])
      reverseGeocode(lat, lng)
    },
    [reverseGeocode]
  )

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords
      setMarkerPos([latitude, longitude])
      setFlyToPos([latitude, longitude])
      reverseGeocode(latitude, longitude)
    })
  }

  const handleOpenInMaps = () => {
    if (!airport) return
    const query = encodeURIComponent(`${airport.name}, ${airport.city}, ${airport.country}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
  }

  const handleClose = () => {
    setMarkerPos(null)
    setFlyToPos(null)
    setAddress('')
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      setMapRenderKey((prev) => prev + 1)
      geocodeAirport()
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, geocodeAirport])

  if (!isOpen || !airport) return null

  return createPortal(
    <div className="fixed inset-0 z-[220] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
            <h2 className="text-white font-semibold text-base sm:text-lg">View Airport Location on Map</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-700 hover:border-cyan-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </button>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative flex-1 min-h-0 overflow-hidden">
          <LeafletMap
            key={mapRenderKey}
            markerPos={markerPos}
            flyToPos={flyToPos}
            onMapClick={handleMapClick}
          />
          {!markerPos && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs sm:text-sm px-4 py-2 rounded-full pointer-events-none whitespace-nowrap z-[400]">
              {isLoadingLocation ? 'Locating airport on map...' : 'Unable to find airport location'}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-gray-700 min-h-[68px] flex items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-cyan-300 mb-0.5">Selected location</p>
              {isLoadingLocation || isGeocoding ? (
                <div className="flex items-center gap-2 text-cyan-300 text-sm">
                  <div className="animate-spin rounded-full h-3 w-3 border border-gray-500 border-t-cyan-400" />
                  Fetching address...
                </div>
              ) : (
                <p className="text-cyan-300 text-sm font-medium line-clamp-2">
                  {address || `${airport.city}, ${airport.country}`}
                </p>
              )}
            </div>
            <button
              onClick={handleOpenInMaps}
              className="shrink-0 bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-5 py-2 rounded-xl transition-colors text-sm"
            >
              Open in Google Maps
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
