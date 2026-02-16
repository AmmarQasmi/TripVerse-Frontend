'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Sun, Sunset, Moon, Utensils, MapPin, Clock, Hotel, ArrowDown } from 'lucide-react'
import { PlaceCard } from './PlaceCard'

interface DayTimelineProps {
  day: any
  dayNumber: number
  isEnriched: boolean
}

// Color palette for day badges
const DAY_COLORS = [
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600',
  'from-sky-500 to-indigo-600',
  'from-fuchsia-500 to-pink-600',
]

// Time-of-day section config
const TIME_SECTIONS = [
  { slot: 'Morning', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', timeRange: '8:00 AM – 12:00 PM' },
  { slot: 'Afternoon', icon: Sunset, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', timeRange: '12:00 PM – 5:00 PM' },
  { slot: 'Evening', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', timeRange: '5:00 PM – 10:00 PM' },
]

function TravelTimeIndicator({ time }: { time: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5">
      <div className="flex flex-col items-center">
        <div className="w-px h-3 bg-gray-200" />
        <ArrowDown className="w-3 h-3 text-gray-300" />
      </div>
      <span className="text-xs text-gray-400 flex items-center gap-1">
        <Clock className="w-3 h-3" />
        {time}
      </span>
    </div>
  )
}

export function DayTimeline({ day, dayNumber, isEnriched }: DayTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(dayNumber === 1)

  const theme = day.theme || day.title || `Day ${dayNumber}`
  const places = day.places || []
  const colorClass = DAY_COLORS[(dayNumber - 1) % DAY_COLORS.length]

  // Hotel recommendations from the day data
  const hotelRecs = day.hotel_recommendations || day.hotelRecommendations || []

  // Group places by time slot
  const groupedPlaces: Record<string, any[]> = { Morning: [], Afternoon: [], Evening: [] }
  for (const place of places) {
    const slot = place.timeSlot || place.time_slot || 'Morning'
    if (groupedPlaces[slot]) {
      groupedPlaces[slot].push(place)
    } else {
      groupedPlaces.Morning.push(place)
    }
  }

  // Check which sections have content
  const activeSections = TIME_SECTIONS.filter(s => groupedPlaces[s.slot].length > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: dayNumber * 0.04 }}
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
        isExpanded
          ? 'bg-white border-gray-200 shadow-md'
          : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
      }`}
    >
      {/* Day Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 sm:px-6 py-4 hover:bg-gray-50/50 transition-colors text-left"
      >
        <div className="flex items-center gap-4">
          <span className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colorClass} text-white text-sm font-bold flex items-center justify-center shadow-md`}>
            {dayNumber}
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">{theme}</h3>
            <div className="flex items-center gap-3 mt-0.5">
              {places.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin className="w-3 h-3" />
                  {places.length} {places.length === 1 ? 'place' : 'places'}
                </span>
              )}
              {activeSections.length > 0 && (
                <div className="flex items-center gap-1">
                  {activeSections.map(s => {
                    const Icon = s.icon
                    return <Icon key={s.slot} className={`w-3.5 h-3.5 ${s.color}`} />
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={`p-1.5 rounded-lg transition-colors ${isExpanded ? 'bg-gray-100' : ''}`}>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 sm:px-6 pb-6">
              {/* Divider line */}
              <div className={`h-0.5 rounded-full bg-gradient-to-r ${colorClass} opacity-20 mb-5`} />

              {/* Time-of-day sections */}
              {activeSections.map((section, sIdx) => {
                const Icon = section.icon
                const sectionPlaces = groupedPlaces[section.slot]
                if (sectionPlaces.length === 0) return null

                return (
                  <div key={section.slot} className={sIdx > 0 ? 'mt-6' : ''}>
                    {/* Section banner */}
                    <div className={`flex items-center gap-3 mb-4 px-3 py-2.5 rounded-xl ${section.bg} border ${section.border}`}>
                      <div className={`w-8 h-8 rounded-lg ${section.badge} flex items-center justify-center`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{section.slot}</h4>
                        <p className="text-[11px] text-gray-500">{section.timeRange} • {sectionPlaces.length} {sectionPlaces.length === 1 ? 'place' : 'places'}</p>
                      </div>
                    </div>

                    {/* Places in this section */}
                    <div className="space-y-1">
                      {sectionPlaces.map((place: any, idx: number) => (
                        <div key={idx}>
                          {/* Travel time indicator between places */}
                          {idx > 0 && (place.travelTime || place.travel_time) && (
                            <TravelTimeIndicator time={place.travelTime || place.travel_time} />
                          )}
                          {/* First place shows travel time from hotel/previous section */}
                          {idx === 0 && (place.travelTime || place.travel_time) && (
                            <TravelTimeIndicator time={place.travelTime || place.travel_time} />
                          )}
                          <PlaceCard place={place} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}

              {/* Fallback: if no grouped places but there are flat places (old format) */}
              {activeSections.length === 0 && places.length > 0 && (
                <div className="space-y-4">
                  {places.map((place: any, idx: number) => (
                    <PlaceCard key={idx} place={place} />
                  ))}
                </div>
              )}

              {/* Preview mode — text-based schedule */}
              {!isEnriched && places.length === 0 && (day.morning || day.afternoon || day.evening) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                  {day.morning && (
                    <div className="flex items-start gap-3 bg-amber-50/50 rounded-xl p-3 border border-amber-100/50">
                      <Sun className="w-4 h-4 mt-0.5 text-amber-500 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Morning</span>
                        <p className="text-sm text-gray-700 mt-0.5">{day.morning}</p>
                      </div>
                    </div>
                  )}
                  {day.afternoon && (
                    <div className="flex items-start gap-3 bg-sky-50/50 rounded-xl p-3 border border-sky-100/50">
                      <Sunset className="w-4 h-4 mt-0.5 text-sky-500 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-sky-600 uppercase tracking-wider">Afternoon</span>
                        <p className="text-sm text-gray-700 mt-0.5">{day.afternoon}</p>
                      </div>
                    </div>
                  )}
                  {day.evening && (
                    <div className="flex items-start gap-3 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/50">
                      <Moon className="w-4 h-4 mt-0.5 text-indigo-500 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Evening</span>
                        <p className="text-sm text-gray-700 mt-0.5">{day.evening}</p>
                      </div>
                    </div>
                  )}
                  {day.food && (
                    <div className="flex items-start gap-3 bg-orange-50/50 rounded-xl p-3 border border-orange-100/50">
                      <Utensils className="w-4 h-4 mt-0.5 text-orange-500 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Food</span>
                        <p className="text-sm text-gray-700 mt-0.5">{day.food}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hotel Recommendations */}
              {hotelRecs.length > 0 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <div className="flex items-center gap-2 mb-3">
                    <Hotel className="w-4 h-4 text-violet-500" />
                    <h4 className="text-sm font-bold text-gray-800">Where to Stay</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {hotelRecs.map((hotel: any, idx: number) => {
                      const typeColors: Record<string, string> = {
                        budget: 'bg-green-100 text-green-700 border-green-200',
                        'mid-range': 'bg-blue-100 text-blue-700 border-blue-200',
                        luxury: 'bg-amber-100 text-amber-700 border-amber-200',
                      }
                      const typeClass = typeColors[hotel.type] || 'bg-gray-100 text-gray-700 border-gray-200'
                      const priceRange = hotel.price_range || hotel.priceRange || ''
                      return (
                        <div key={idx} className="bg-white rounded-lg p-3 border border-violet-100/50 shadow-sm">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border mb-1.5 ${typeClass}`}>
                            {hotel.type}
                          </span>
                          <p className="text-sm font-semibold text-gray-900 leading-tight">{hotel.name}</p>
                          {priceRange && (
                            <p className="text-xs text-gray-500 mt-1">{priceRange}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
