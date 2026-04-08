'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Filter, Clock, DollarSign, Minus } from 'lucide-react'

export function FlightFilters() {
  const [filters, setFilters] = useState({
    priceRange: [30000, 300000],
    departureTime: {
      earlyMorning: true,
      morning: true,
      afternoon: true,
      evening: true,
      night: false
    },
    arrivalTime: {
      earlyMorning: true,
      morning: true,
      afternoon: true,
      evening: true,
      night: false
    },
    duration: [60, 720] // min=0 (~1h) to max (~12h) preselected full range
  })

  const handleDepartureTimeChange = (timeSlot: string) => {
    setFilters(prev => ({
      ...prev,
      departureTime: {
        ...prev.departureTime,
        [timeSlot]: !prev.departureTime[timeSlot as keyof typeof prev.departureTime]
      }
    }))
  }

  const handleArrivalTimeChange = (timeSlot: string) => {
    setFilters(prev => ({
      ...prev,
      arrivalTime: {
        ...prev.arrivalTime,
        [timeSlot]: !prev.arrivalTime[timeSlot as keyof typeof prev.arrivalTime]
      }
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [30000, 300000],
      departureTime: {
        earlyMorning: true,
        morning: true,
        afternoon: true,
        evening: true,
        night: false
      },
      arrivalTime: {
        earlyMorning: true,
        morning: true,
        afternoon: true,
        evening: true,
        night: false
      },
      duration: [60, 720]
    })
  }

  const timeSlots = [
    { key: 'earlyMorning', label: 'Early Morning (12AM-6AM)' },
    { key: 'morning', label: 'Morning (6AM-12PM)' },
    { key: 'afternoon', label: 'Afternoon (12PM-6PM)' },
    { key: 'evening', label: 'Evening (6PM-12AM)' },
    { key: 'night', label: 'Night (10PM-6AM)' }
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-700/45 backdrop-blur-md border border-slate-500/40 p-6 shadow-xl">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none"
        style={{ backgroundImage: 'url(/images/cities/karachi/karachi-03.png)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/75 via-slate-900/65 to-slate-900/70 pointer-events-none" />

      <div className="relative z-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-cyan-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        <button
          onClick={clearAllFilters}
          className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] text-white hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 transition-colors flex items-center justify-center"
          aria-label="Clear filters"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-6">
        {/* Price Range */}
        <div>
          <h4 className="text-sm font-semibold text-slate-100 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Price
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-300">
              <span>PKR {filters.priceRange[0].toLocaleString()}</span>
              <span>PKR {filters.priceRange[1].toLocaleString()}</span>
            </div>
            <div className="relative pb-1">
              <div className="h-2 rounded-full bg-slate-600/70" />
              <div className="absolute inset-0 flex items-center gap-4">
                <input
                  type="range"
                  min={30000}
                  max={300000}
                  step={10000}
                  value={filters.priceRange[0]}
                  onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Number(e.target.value), Math.max(f.priceRange[1], Number(e.target.value))] }))}
                  className="w-full appearance-none bg-transparent accent-cyan-400"
                />
                <input
                  type="range"
                  min={30000}
                  max={300000}
                  step={10000}
                  value={filters.priceRange[1]}
                  onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Math.min(f.priceRange[0], Number(e.target.value)), Number(e.target.value)] }))}
                  className="w-full appearance-none bg-transparent accent-cyan-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Time */}
        <div>
          <h4 className="text-sm font-semibold text-slate-100 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Time
          </h4>
          <div className="space-y-4">
            <div>
              <h5 className="text-xs uppercase tracking-wide text-slate-300 mb-2">Departure</h5>
              <div className="space-y-2">
                {timeSlots.map(({ key, label }) => (
                  <label key={`dep-${key}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.departureTime[key as keyof typeof filters.departureTime]}
                      onChange={() => handleDepartureTimeChange(key)}
                      className="w-4 h-4 accent-cyan-400 bg-slate-700 border-slate-500 rounded focus:ring-cyan-500"
                    />
                    <span className={`ml-3 text-sm ${filters.departureTime[key as keyof typeof filters.departureTime] ? 'text-white' : 'text-slate-300/70'}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h5 className="text-xs uppercase tracking-wide text-slate-300 mb-2">Arrival</h5>
              <div className="space-y-2">
                {timeSlots.map(({ key, label }) => (
                  <label key={`arr-${key}`} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.arrivalTime[key as keyof typeof filters.arrivalTime]}
                      onChange={() => handleArrivalTimeChange(key)}
                      className="w-4 h-4 accent-cyan-400 bg-slate-700 border-slate-500 rounded focus:ring-cyan-500"
                    />
                    <span className={`ml-3 text-sm ${filters.arrivalTime[key as keyof typeof filters.arrivalTime] ? 'text-white' : 'text-slate-300/70'}`}>
                      {label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Duration */}
        <div>
          <h4 className="text-sm font-semibold text-slate-100 mb-3">Duration</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate-300">
              <span>{Math.floor(filters.duration[0] / 60)}h</span>
              <span>{Math.floor(filters.duration[1] / 60)}h</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="60"
                max="720"
                step="30"
                value={filters.duration[0]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  duration: [parseInt(e.target.value), prev.duration[1]]
                }))}
                className="w-full h-2 bg-slate-600/70 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <input
                type="range"
                min="60"
                max="720"
                step="30"
                value={filters.duration[1]}
                onChange={(e) => setFilters(prev => ({
                  ...prev,
                  duration: [prev.duration[0], parseInt(e.target.value)]
                }))}
                className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>
          </div>
        </div>

        <div className="border-t border-slate-500/30 pt-4" />

        {/* Apply Button */}
        <div className="flex justify-end mt-2">
          <Button 
            onClick={() => console.log('Applying filters:', filters)}
            className="w-full bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-all"
          >
            Apply Filters
          </Button>
        </div>

        <Button
          onClick={clearAllFilters}
          variant="ghost"
          className="w-full bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 text-white rounded-xl py-2.5"
        >
          Clear All Filters
        </Button>
      </div>
      </div>
    </div>
  )
}
