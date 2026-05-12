'use client'

import { MapPin } from 'lucide-react'

interface MiniMapProps {
  lat: number
  lng: number
  name: string
  height?: number
}

export function MiniMap({ lat, lng, name, height = 180 }: MiniMapProps) {
  if (!lat || !lng) return null

  // Use Google Maps embed with vibrant styling - using terrain view for more colors
  const mapUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed&t=k`
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div 
        className="relative"
        style={{
          filter: 'hue-rotate(-20deg) saturate(1.4) contrast(1.15) brightness(1.1)',
          transition: 'filter 0.3s ease'
        }}
      >
        <iframe
          src={mapUrl}
          width="100%"
          height={height}
          style={{ 
            border: 0,
            display: 'block'
          }}
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
        className="flex items-center justify-center gap-1.5 py-2.5 transition-colors text-xs font-medium border-t border-gray-100"
        style={{
          background: 'linear-gradient(135deg, #0a4a4a, #0d2b3e)',
          color: '#2dd4bf'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0d3d52, #0f3248)'
          e.currentTarget.style.opacity = '0.9'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #0a4a4a, #0d2b3e)'
          e.currentTarget.style.opacity = '1'
        }}
      >
        <MapPin className="w-3.5 h-3.5" style={{ color: '#2dd4bf' }} />
        Get Directions
      </a>
    </div>
  )
}
