'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Filter, X, Clock, Plane, DollarSign } from 'lucide-react'

export function FlightFilters() {
  const [filters, setFilters] = useState({
    stops: {
      nonStop: true,
      oneStop: true,
      twoPlusStops: false
    },
    priceRange: [30000, 300000],
    airlines: {
      pia: true,
      emirates: true,
      saudia: true,
      airBlue: true,
      sereneAir: true
    },
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

  const handleStopsChange = (stopType: string) => {
    setFilters(prev => ({
      ...prev,
      stops: {
        ...prev.stops,
        [stopType]: !prev.stops[stopType as keyof typeof prev.stops]
      }
    }))
  }

  const handleAirlineChange = (airline: string) => {
    setFilters(prev => ({
      ...prev,
      airlines: {
        ...prev.airlines,
        [airline]: !prev.airlines[airline as keyof typeof prev.airlines]
      }
    }))
  }

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
      stops: {
        nonStop: true,
        oneStop: true,
        twoPlusStops: false
      },
      priceRange: [30000, 300000],
      airlines: {
        pia: true,
        emirates: true,
        saudia: true,
        airBlue: true,
        sereneAir: true
      },
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

  const airlines = [
    { key: 'pia', name: 'Pakistan International Airlines', logo: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=30&h=30&fit=crop' },
    { key: 'emirates', name: 'Emirates', logo: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=30&h=30&fit=crop' },
    { key: 'saudia', name: 'Saudia', logo: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=30&h=30&fit=crop' },
    { key: 'airBlue', name: 'Air Blue', logo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=30&h=30&fit=crop' },
    { key: 'sereneAir', name: 'Serene Air', logo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=30&h=30&fit=crop' }
  ]

  return (
    <div className="rounded-2xl bg-gray-900/60 backdrop-blur-md border border-cyan-600/40 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-cyan-400 mr-2" />
          <h3 className="text-lg font-semibold text-white">Filters</h3>
        </div>
        <Button
          onClick={clearAllFilters}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4 mr-1" />
          Clear All
        </Button>
      </div>

      <div className="space-y-6">
        {/* Stops Filter */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Plane className="w-4 h-4 mr-2" />
            Stops
          </h4>
          <div className="space-y-2">
            {[
              { key: 'nonStop', label: 'Non-stop', color: 'text-green-400' },
              { key: 'oneStop', label: '1 Stop', color: 'text-yellow-400' },
              { key: 'twoPlusStops', label: '2+ Stops', color: 'text-red-400' }
            ].map(({ key, label, color }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.stops[key as keyof typeof filters.stops]}
                  onChange={() => handleStopsChange(key)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <span className={`ml-3 text-sm ${filters.stops[key as keyof typeof filters.stops] ? color : 'text-gray-400'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Range */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <DollarSign className="w-4 h-4 mr-2" />
            Price Range
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-400">
              <span>PKR {filters.priceRange[0].toLocaleString()}</span>
              <span>PKR {filters.priceRange[1].toLocaleString()}</span>
            </div>
            <div className="relative pb-1">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
              <div className="absolute inset-0 flex items-center gap-4">
                <input
                  type="range"
                  min={30000}
                  max={300000}
                  step={10000}
                  value={filters.priceRange[0]}
                  onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Number(e.target.value), Math.max(f.priceRange[1], Number(e.target.value))] }))}
                  className="w-full appearance-none bg-transparent"
                />
                <input
                  type="range"
                  min={30000}
                  max={300000}
                  step={10000}
                  value={filters.priceRange[1]}
                  onChange={(e)=> setFilters(f=>({ ...f, priceRange: [Math.min(f.priceRange[0], Number(e.target.value)), Number(e.target.value)] }))}
                  className="w-full appearance-none bg-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Airlines */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Airlines</h4>
          <div className="space-y-2">
            {airlines.map(({ key, name, logo }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.airlines[key as keyof typeof filters.airlines]}
                  onChange={() => handleAirlineChange(key)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <img src={logo} alt={name} className="w-6 h-6 rounded ml-3 mr-2" />
                <span className={`text-sm ${filters.airlines[key as keyof typeof filters.airlines] ? 'text-white' : 'text-gray-400'}`}>
                  {name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Departure Time */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Departure Time
          </h4>
          <div className="space-y-2">
            {timeSlots.map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.departureTime[key as keyof typeof filters.departureTime]}
                  onChange={() => handleDepartureTimeChange(key)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <span className={`ml-3 text-sm ${filters.departureTime[key as keyof typeof filters.departureTime] ? 'text-white' : 'text-gray-400'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Arrival Time */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Arrival Time
          </h4>
          <div className="space-y-2">
            {timeSlots.map(({ key, label }) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.arrivalTime[key as keyof typeof filters.arrivalTime]}
                  onChange={() => handleArrivalTimeChange(key)}
                  className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500"
                />
                <span className={`ml-3 text-sm ${filters.arrivalTime[key as keyof typeof filters.arrivalTime] ? 'text-white' : 'text-gray-400'}`}>
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-3">Duration</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-gray-400">
              <span>{Math.floor(filters.duration[0] / 60)}h {filters.duration[0] % 60}m</span>
              <span>{Math.floor(filters.duration[1] / 60)}h {filters.duration[1] % 60}m</span>
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
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
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
                className="absolute top-0 w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Apply Button */}
        <div className="flex justify-end mt-4">
          <Button 
            onClick={() => console.log('Applying filters:', filters)}
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-5 py-2 rounded-xl font-semibold shadow-lg hover:shadow-cyan-500/20 transition-all"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
