'use client'

interface RouteMapProps {
  pickupLocation: string
  dropoffLocation: string
  distance?: number
  onDistanceCalculated?: (distance: number) => void
}

export function RouteMap({ pickupLocation, dropoffLocation, distance }: RouteMapProps) {
  const googleMapsUrl = pickupLocation && dropoffLocation
    ? `https://www.google.com/maps/dir/${encodeURIComponent(pickupLocation)}/${encodeURIComponent(dropoffLocation)}`
    : null

  if (!pickupLocation || !dropoffLocation) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
        <div className="relative h-28 bg-gradient-to-br from-gray-700/60 to-gray-800/60 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-8 h-8 text-gray-500 mx-auto mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-gray-500 text-xs">Enter locations to preview route</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50">
      {/* Route visualization */}
      <div className="p-3.5">
        <div className="flex items-stretch gap-3">
          {/* Route line */}
          <div className="flex flex-col items-center py-1">
            <div className="w-3 h-3 rounded-full bg-green-400 ring-2 ring-green-400/30 flex-shrink-0" />
            <div className="w-0.5 flex-1 bg-gradient-to-b from-green-400/60 via-gray-500/40 to-red-400/60 my-1 min-h-[20px]" />
            <div className="w-3 h-3 rounded-full bg-red-400 ring-2 ring-red-400/30 flex-shrink-0" />
          </div>
          {/* Locations */}
          <div className="flex-1 min-w-0 space-y-2">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Pickup</p>
              <p className="text-sm text-white truncate leading-tight">{pickupLocation}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">Drop-off</p>
              <p className="text-sm text-white truncate leading-tight">{dropoffLocation}</p>
            </div>
          </div>
          {/* Distance badge */}
          {distance ? (
            <div className="flex items-center flex-shrink-0">
              <div className="bg-teal-500/10 border border-teal-500/20 rounded-lg px-3 py-2 text-center">
                <p className="text-base font-bold text-teal-400 leading-tight">{distance.toFixed(1)}</p>
                <p className="text-[10px] text-teal-400/70">km</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Open in Google Maps link */}
      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-2.5 border-t border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/40 transition-colors group"
        >
          <svg className="w-4 h-4 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-xs font-medium text-teal-400 group-hover:text-teal-300 transition-colors">View Route on Google Maps</span>
          <svg className="w-3 h-3 text-teal-400/60 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      )}
    </div>
  )
}