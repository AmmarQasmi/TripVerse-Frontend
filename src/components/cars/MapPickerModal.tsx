'use client'

import { useState, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import dynamic from 'next/dynamic'

interface LeafletMapProps {
  markerPos: [number, number] | null
  flyToPos: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}

// Leaflet must be loaded client-side only (uses window)
const LeafletMap = dynamic<LeafletMapProps>(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] flex items-center justify-center bg-gray-800">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-600 border-t-cyan-400" />
    </div>
  ),
})

interface MapPickerModalProps {
  isOpen: boolean
  onClose: () => void
  onLocationSelect: (address: string) => void
}

export function MapPickerModal({ isOpen, onClose, onLocationSelect }: MapPickerModalProps) {
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null)
  const [address, setAddress] = useState<string>('')
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [flyToPos, setFlyToPos] = useState<[number, number] | null>(null)

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

  const handleConfirm = () => {
    if (address) {
      onLocationSelect(address)
      handleClose()
    }
  }

  const handleClose = () => {
    setMarkerPos(null)
    setAddress('')
    setFlyToPos(null)
    onClose()
  }

  // Prevent body scroll when modal open
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <h2 className="text-white font-semibold text-base sm:text-lg">Select Pickup Location on Map</h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleMyLocation}
              className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 border border-cyan-700 hover:border-cyan-500 px-3 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0013 3.06V1h-2v2.06A8.994 8.994 0 003.06 11H1v2h2.06A8.994 8.994 0 0011 20.94V23h2v-2.06A8.994 8.994 0 0020.94 13H23v-2h-2.06z" />
              </svg>
              My location
            </button>
            <button onClick={handleClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="relative flex-1 min-h-0 overflow-hidden">
          <LeafletMap markerPos={markerPos} flyToPos={flyToPos} onMapClick={handleMapClick} />
          {!markerPos && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs sm:text-sm px-4 py-2 rounded-full pointer-events-none whitespace-nowrap z-[400]">
              📍 Click anywhere on the map to pin your pickup location
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-700 min-h-[68px] flex items-center">
          {markerPos ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Selected location</p>
                {isGeocoding ? (
                  <div className="flex items-center gap-2 text-gray-300 text-sm">
                    <div className="animate-spin rounded-full h-3 w-3 border border-gray-500 border-t-cyan-400" />
                    Fetching address…
                  </div>
                ) : (
                  <p className="text-white text-sm font-medium line-clamp-2">{address}</p>
                )}
              </div>
              <button
                onClick={handleConfirm}
                disabled={!address || isGeocoding}
                className="shrink-0 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed text-black font-semibold px-5 py-2 rounded-xl transition-colors text-sm"
              >
                Use this location
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm w-full text-center">No location selected yet</p>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
