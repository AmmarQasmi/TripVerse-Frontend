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

// Color palette for day badges - new gradients
const DAY_GRADIENTS = [
  'linear-gradient(135deg, #0a4a4a, #0d2b3e)',  // 1 brand teal
  'linear-gradient(135deg, #7c3aed, #5b21b6)',  // 2 purple
  'linear-gradient(135deg, #e11d48, #be185d)',  // 3 rose
  'linear-gradient(135deg, #d97706, #b45309)',  // 4 amber
  'linear-gradient(135deg, #16a34a, #15803d)',  // 5 green
  'linear-gradient(135deg, #0284c7, #0369a1)',  // 6 blue
  'linear-gradient(135deg, #9333ea, #7e22ce)',  // 7 violet
]

// Time-of-day section config
const TIME_SECTIONS = [
  { slot: 'Morning', icon: Sun, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700', timeRange: '8:00 AM – 12:00 PM' },
  { slot: 'Afternoon', icon: Sunset, color: 'text-sky-500', bg: 'bg-sky-50', border: 'border-sky-200', badge: 'bg-sky-100 text-sky-700', timeRange: '12:00 PM – 5:00 PM' },
  { slot: 'Evening', icon: Moon, color: 'text-indigo-500', bg: 'bg-indigo-50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-700', timeRange: '5:00 PM – 10:00 PM' },
]

function TravelTimeIndicator({ time }: { time: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', paddingTop: '12px', paddingBottom: '12px', marginBottom: '8px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', lineHeight: '1' }}>
        <div style={{ fontSize: '18px', color: '#0f2d44', fontWeight: 'bold' }}>|</div>
        <div style={{ fontSize: '18px', color: '#0f2d44', fontWeight: 'bold' }}>|</div>
      </div>
      <ArrowDown className="w-5 h-5" style={{ color: '#0f2d44' }} />
      <span style={{ fontSize: '11px', color: '#0f2d44', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
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
  const dayGradient = DAY_GRADIENTS[(dayNumber - 1) % DAY_GRADIENTS.length]

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
      style={{ background: 'white', border: '2px solid #0f2d44', borderRadius: '16px', overflow: 'hidden', transition: 'all 0.3s ease' }}
    >
      {/* Day Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '16px', paddingRight: '16px', paddingTop: '14px', paddingBottom: '14px', transition: 'colors 0.3s', textAlign: 'left' }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc' }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{ width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', fontSize: '13px', flexShrink: 0, background: '#0f2d44' }}
          >
            {dayNumber}
          </div>
          <div style={{ flex: 1, minWidth: '0px' }}>
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{theme}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '11px', color: '#94a3b8' }}>
              <MapPin className="w-3 h-3" /> {places.length} {places.length === 1 ? 'place' : 'places'}
              <span style={{ marginLeft: '4px' }}>{activeSections.map((s, i) => {
                const Icon = s.icon
                return <Icon key={i} className="w-3 h-3" style={{ display: 'inline', marginRight: '2px' }} />
              })}</span>
            </div>
          </div>
        </div>
        <div style={{ padding: '8px', borderRadius: '50%', transition: 'colors 0.3s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transitionProperty: 'transform', transitionDuration: '0.2s', background: '#0f2d44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ChevronDown className="w-4 h-4" style={{ color: '#ffffff' }} />
        </div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid rgba(45,212,191,0.15)', paddingLeft: '16px', paddingRight: '16px', paddingBottom: '16px' }}>
              {/* Time-of-day sections */}
              {activeSections.map((section, sIdx) => {
                const Icon = section.icon
                const sectionPlaces = groupedPlaces[section.slot]
                if (sectionPlaces.length === 0) return null

                return (
                  <div key={section.slot} style={{ marginBottom: sIdx < activeSections.length - 1 ? '20px' : '0px' }}>
                    {/* Section banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#0d2b3e', border: '1px solid rgba(45,212,191,0.25)', borderRadius: '8px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '10px', paddingBottom: '10px', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px' }}>{section.icon === Sun ? '☀️' : section.icon === Sunset ? '🌅' : '🌙'}</span>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#ffffff' }}>{section.slot}</span>
                      <span style={{ fontSize: '11px', color: '#a0aec0', fontWeight: 400 }}>{section.timeRange} • {sectionPlaces.length} {sectionPlaces.length === 1 ? 'place' : 'places'}</span>
                    </div>

                    {/* Places in this section */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
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
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {places.map((place: any, idx: number) => (
                    <PlaceCard key={idx} place={place} />
                  ))}
                </div>
              )}

              {/* Preview mode — text-based schedule */}
              {!isEnriched && places.length === 0 && (day.morning || day.afternoon || day.evening) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  {day.morning && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
                      <Sun className="w-4 h-4" style={{ marginTop: '2px', color: '#2dd4bf', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Morning</span>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{day.morning}</p>
                      </div>
                    </div>
                  )}
                  {day.afternoon && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
                      <Sunset className="w-4 h-4" style={{ marginTop: '2px', color: '#2dd4bf', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Afternoon</span>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{day.afternoon}</p>
                      </div>
                    </div>
                  )}
                  {day.evening && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
                      <Moon className="w-4 h-4" style={{ marginTop: '2px', color: '#2dd4bf', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Evening</span>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{day.evening}</p>
                      </div>
                    </div>
                  )}
                  {day.food && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: '#f8fafc', borderRadius: '8px', padding: '12px', border: '1px solid #e2e8f0' }}>
                      <Utensils className="w-4 h-4" style={{ marginTop: '2px', color: '#2dd4bf', flexShrink: 0 }} />
                      <div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Food</span>
                        <p style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>{day.food}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Hotel Recommendations */}
              {hotelRecs.length > 0 && (
                <div style={{ marginTop: '16px', borderRadius: '12px', padding: '14px', background: 'linear-gradient(135deg, rgba(13,43,62,0.04), rgba(10,74,74,0.06))', border: '1px solid rgba(45,212,191,0.2)' }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: '#0d2b3e', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <Hotel className="w-4 h-4" style={{ color: '#2dd4bf' }} /> Where to Stay
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                    {hotelRecs.map((hotel: any, idx: number) => {
                      const borderClass = hotel.type === 'mid-range' ? '#2dd4bf' : '#e2e8f0'
                      return (
                        <div key={idx} style={{ background: 'white', borderRadius: '8px', padding: '10px', border: `1px solid ${borderClass}`, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: '6px', paddingRight: '6px', paddingTop: '2px', paddingBottom: '2px', borderRadius: '4px', display: 'inline-block', marginBottom: '6px', background: hotel.type === 'budget' ? '#ecfdf5' : hotel.type === 'mid-range' ? '#eff6ff' : '#fef3c7', color: hotel.type === 'budget' ? '#065f46' : hotel.type === 'mid-range' ? '#0c4a6e' : '#92400e', border: `1px solid ${hotel.type === 'budget' ? '#a7f3d0' : hotel.type === 'mid-range' ? '#bfdbfe' : '#fce7f3'}` }}>
                            {hotel.type}
                          </span>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: '1.3' }}>{hotel.name}</p>
                          {hotel.price_range || hotel.priceRange ? (
                            <p style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{hotel.price_range || hotel.priceRange}/night</p>
                          ) : null}
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
