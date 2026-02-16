'use client'

import { MapPin } from 'lucide-react'

interface MiniMapProps {
  lat: number
  lng: number
  name: string
}

export function MiniMap({ lat, lng, name }: MiniMapProps) {
  if (!lat || !lng) return null

  // Use Google Maps embed with gesture handling enabled for full interactivity
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div className="relative">
        <iframe
          src={mapUrl}
          width="100%"
          height="180"
          style={{ border: 0 }}
          allowFullScreen={true}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map of ${name}`}
          className="w-full"
        />
      </div>
      <a
        href={directionsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-1.5 py-2.5 bg-gray-50 hover:bg-gray-100 transition-colors text-xs text-gray-600 font-medium border-t border-gray-100"
      >
        <MapPin className="w-3.5 h-3.5 text-cyan-500" />
        Get Directions
      </a>
    </div>
  )
}
