'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { usePopularCities, useCityExplorer } from '@/features/cars/useCityExplorer'

type Place = {
  name: string
  address: string
  rating: number
  photo: string | null
}

export function CityExplorer() {
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null)
  const { data: popularCities, isLoading: citiesLoading } = usePopularCities()
  const { data: cityData, isLoading: explorerLoading } = useCityExplorer(selectedCity)

  return (
    <div>
      {/* City Selector */}
      {citiesLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-20 bg-gray-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : popularCities && popularCities.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {popularCities.map((city) => (
            <button
              key={city.city}
              onClick={() => setSelectedCity(selectedCity === city.city ? null : city.city)}
              className={`relative p-5 rounded-xl text-left transition-all duration-200 border group ${
                selectedCity === city.city
                  ? 'bg-gradient-to-br from-[#1e3a8a] to-[#0d9488] border-transparent text-white shadow-lg shadow-teal-500/20 scale-[1.02]'
                  : 'bg-gray-800/50 backdrop-blur-sm border-white/10 text-gray-300 hover:bg-gray-700/60 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-base">{city.city}</div>
                  <div className={`text-xs mt-1 ${selectedCity === city.city ? 'text-white/80' : 'text-gray-400'}`}>{city.region}</div>
                </div>
                <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                  selectedCity === city.city
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-700/50 text-gray-400'
                }`}>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {city.available_drivers}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-400">No cities with available drivers found</p>
        </div>
      )}

      {/* City Explorer Panel */}
      <AnimatePresence mode="wait">
        {selectedCity && (
          <motion.div
            key={selectedCity}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {explorerLoading ? (
              <CityExplorerSkeleton />
            ) : cityData ? (
              <div className="space-y-8">
                {/* Top Row: Weather + Facts + Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {/* Weather Card */}
                  <div className="bg-gradient-to-br from-blue-600/80 to-blue-800/80 backdrop-blur-sm rounded-2xl p-6 text-white border border-blue-500/20">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                      </svg>
                      Current Weather
                    </h3>
                    {cityData.weather ? (
                      <>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl">{cityData.weather.icon}</span>
                          <div>
                            <div className="text-4xl font-bold">{cityData.weather.temperature}°C</div>
                            <div className="text-blue-200 capitalize">{cityData.weather.condition}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            <span className="text-blue-100">Humidity: {cityData.weather.humidity}%</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
                            <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                            <span className="text-blue-100">Wind: {cityData.weather.windSpeed} km/h</span>
                          </div>
                        </div>
                        <div className="mt-4 text-sm bg-white/10 rounded-lg px-3 py-2 flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-blue-100">{cityData.best_time_to_visit}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-blue-200 text-sm">Weather data unavailable</p>
                    )}
                  </div>

                  {/* Facts Card */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      About {selectedCity}
                    </h3>
                    <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">
                      {cityData.facts || 'No information available for this city.'}
                    </p>
                    {cityData.wiki_url && (
                      <a
                        href={cityData.wiki_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-sm font-medium transition-colors"
                      >
                        Read more on Wikipedia
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    )}
                  </div>

                  {/* Quick Stats Card */}
                  <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Quick Stats
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                        <svg className="w-5 h-5 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-gray-300 text-sm">{cityData.places_to_visit.length} tourist attractions</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                        <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                        <span className="text-gray-300 text-sm">{cityData.restaurants.length} top restaurants</span>
                      </div>
                      <div className="flex items-center gap-3 bg-white/5 rounded-lg px-4 py-3">
                        <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        <span className="text-gray-300 text-sm">
                          {popularCities?.find(c => c.city === selectedCity)?.available_drivers || 0} verified drivers
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Places to Visit */}
                {cityData.places_to_visit.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Places to Visit
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {cityData.places_to_visit.map((place, idx) => (
                        <PlaceCard key={idx} place={place} onClick={() => setSelectedPlace(place)} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Restaurants */}
                {cityData.restaurants.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                      </svg>
                      Where to Eat
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {cityData.restaurants.map((restaurant, idx) => (
                        <PlaceCard key={idx} place={restaurant} onClick={() => setSelectedPlace(restaurant)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Place Detail Modal */}
      <PlaceDetailModal place={selectedPlace} onClose={() => setSelectedPlace(null)} />
    </div>
  )
}

function PlaceCard({ place, onClick }: { place: Place; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 hover:border-teal-500/40 transition-all group cursor-pointer text-left w-full"
    >
      <div className="aspect-[4/3] relative bg-gray-700 overflow-hidden">
        {place.photo ? (
          <Image
            src={place.photo}
            alt={place.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {/* Hover overlay with "View Details" */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="text-white text-xs font-medium bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
            View Details
          </span>
        </div>
      </div>
      <div className="p-3">
        <h4 className="text-sm font-semibold text-white truncate">{place.name}</h4>
        <p className="text-xs text-gray-400 truncate mt-1">{place.address}</p>
        {place.rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-xs font-medium text-gray-300">{place.rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </button>
  )
}

function PlaceDetailModal({ place, onClose }: { place: Place | null; onClose: () => void }) {
  if (!place) return null

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`

  return (
    <AnimatePresence>
      {place && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <div
              className="bg-gray-900 border border-white/10 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Image */}
              <div className="aspect-video relative bg-gray-800">
                {place.photo ? (
                  <Image
                    src={place.photo}
                    alt={place.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-16 h-16 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-3 right-3 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">{place.name}</h3>
                
                <div className="flex items-center gap-2 text-gray-400 mb-4">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm">{place.address}</span>
                </div>

                {place.rating > 0 && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${i < Math.round(place.rating) ? 'text-yellow-400' : 'text-gray-600'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-300">{place.rating.toFixed(1)} / 5</span>
                  </div>
                )}

                {/* Explore on Maps Button */}
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white font-semibold py-3 px-6 rounded-xl hover:from-[#1e40af] hover:to-[#0f766e] transition-all duration-200 shadow-lg shadow-teal-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Explore on Google Maps
                </a>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

function CityExplorerSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="h-64 bg-blue-900/30 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
        <div className="h-64 bg-gray-800/50 rounded-2xl" />
      </div>
      <div>
        <div className="h-6 w-40 bg-gray-700 rounded mb-5" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl overflow-hidden">
              <div className="aspect-[4/3] bg-gray-700" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
