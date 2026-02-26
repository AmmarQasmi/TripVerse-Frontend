'use client'

// This file is loaded dynamically (ssr: false) from MapPickerModal
// Leaflet requires browser APIs and cannot run on the server

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default marker icons broken by webpack
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LeafletMapProps {
  markerPos: [number, number] | null
  flyToPos: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}

// Inner component to handle click events and fly-to
function MapController({
  flyToPos,
  onMapClick,
}: {
  flyToPos: [number, number] | null
  onMapClick: (lat: number, lng: number) => void
}) {
  const map = useMap()
  const prevFlyTo = useRef<[number, number] | null>(null)

  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })

  useEffect(() => {
    if (flyToPos && flyToPos !== prevFlyTo.current) {
      prevFlyTo.current = flyToPos
      map.flyTo(flyToPos, 15, { animate: true, duration: 1 })
    }
  }, [flyToPos, map])

  return null
}

export default function LeafletMap({ markerPos, flyToPos, onMapClick }: LeafletMapProps) {
  return (
    <MapContainer
      center={[30.3753, 69.3451]} // Pakistan
      zoom={5}
      style={{ width: '100%', height: '420px', background: '#1a1a2e' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
        subdomains="abcd"
        maxZoom={19}
      />
      <MapController flyToPos={flyToPos} onMapClick={onMapClick} />
      {markerPos && <Marker position={markerPos} />}
    </MapContainer>
  )
}
