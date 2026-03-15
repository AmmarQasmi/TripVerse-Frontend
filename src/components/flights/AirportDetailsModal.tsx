'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Plane, MapPin, Building2, Mountain, Wind, Users, Globe } from 'lucide-react'

interface AirportDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  onViewOnMap?: (airport: {
    id: string
    code: string
    name: string
    city: string
    country: string
    province: string
    airportType: 'International' | 'Domestic'
    image: string
  }) => void
  airport: {
    id: string
    code: string
    name: string
    city: string
    country: string
    province: string
    airportType: 'International' | 'Domestic'
    image: string
  }
}

export function AirportDetailsModal({ isOpen, onClose, onViewOnMap, airport }: AirportDetailsModalProps) {
  // Mock data for airport details
  const airportDetails = {
    icaoCode: 'OPLA',
    elevation: { feet: 712, meters: 217 },
    runways: {
      count: 2,
      length: '3,310 m',
      surface: 'Asphalt'
    },
    passengers: '5.2 Million',
    airlines: ['PIA', 'AirBlue', 'SereneAir', 'Qatar Airways', 'Emirates', 'Turkish Airlines'],
    routes: [
      `${airport.city} → Karachi`,
      `${airport.city} → Dubai`,
      `${airport.city} → Islamabad`,
      `${airport.city} → Doha`
    ],
    status: 'Operational',
    terminals: 3,
    opened: 2003
  }

  const infoCardClass =
    'bg-slate-900/70 border border-cyan-500/25 rounded-xl p-5 shadow-sm hover:shadow-lg hover:shadow-cyan-500/10 transition-all duration-200'

  const handleViewOnMap = () => {
    if (onViewOnMap) {
      onViewOnMap(airport)
      return
    }

    const query = encodeURIComponent(`${airport.name}, ${airport.city}, ${airport.country}`)
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank', 'noopener,noreferrer')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="w-full max-w-4xl bg-gradient-to-b from-slate-800/95 to-slate-900/95 border border-cyan-500/35 rounded-2xl shadow-[0_20px_80px_rgba(14,116,144,0.35)] backdrop-blur-xl my-auto">
              {/* Header */}
              <div className="relative p-6 border-b border-cyan-500/25">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-cyan-500/20 transition-colors duration-200"
                >
                  <X className="w-6 h-6 text-slate-100" />
                </button>

                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-500/20 rounded-full border border-cyan-400/35">
                    <Plane className="w-8 h-8 text-cyan-300" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-1">
                      {airport.name}
                    </h1>
                    <p className="text-cyan-100/85 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {airport.city}, {airport.country}
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-orange-900/30">
                    {airport.airportType} Airport
                  </div>
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg shadow-cyan-900/30">
                    {airport.code}
                  </div>
                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-500/30 bg-slate-900/50 text-cyan-100 text-sm font-medium">
                    <MapPin className="w-4 h-4" />
                    <span>{airport.province}, {airport.country}</span>
                  </div>
                </div>
              </div>

              {/* Information Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {/* Airport Code Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={infoCardClass}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Plane className="w-5 h-5 text-cyan-300" />
                      <h3 className="font-semibold text-slate-100 text-sm">Airport Code</h3>
                    </div>
                    <p className="text-white font-semibold">IATA: {airport.code}</p>
                    <p className="text-slate-300 text-sm">ICAO: {airportDetails.icaoCode}</p>
                  </motion.div>

                  {/* Airport Type Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={infoCardClass}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Building2 className="w-5 h-5 text-orange-300" />
                      <h3 className="font-semibold text-slate-100 text-sm">Airport Type</h3>
                    </div>
                    <p className="text-white font-semibold">{airport.airportType}</p>
                    <p className="text-slate-300 text-sm">Public Airport</p>
                  </motion.div>

                  {/* Province Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={infoCardClass}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <MapPin className="w-5 h-5 text-cyan-300" />
                      <h3 className="font-semibold text-slate-100 text-sm">Province</h3>
                    </div>
                    <p className="text-white font-semibold">{airport.province}</p>
                    <p className="text-slate-300 text-sm">{airport.country}</p>
                  </motion.div>

                  {/* Elevation Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={infoCardClass}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Mountain className="w-5 h-5 text-cyan-300" />
                      <h3 className="font-semibold text-slate-100 text-sm">Elevation</h3>
                    </div>
                    <p className="text-white font-semibold">{airportDetails.elevation.feet} ft</p>
                    <p className="text-slate-300 text-sm">{airportDetails.elevation.meters} meters</p>
                  </motion.div>

                  {/* Runway Details Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={infoCardClass}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Wind className="w-5 h-5 text-cyan-300" />
                      <h3 className="font-semibold text-slate-100 text-sm">Runways</h3>
                    </div>
                    <p className="text-white font-semibold">Count: {airportDetails.runways.count}</p>
                    <p className="text-slate-300 text-sm">{airportDetails.runways.length} ({airportDetails.runways.surface})</p>
                  </motion.div>

                  {/* Passenger Traffic Card */}
                  <motion.div
                    whileHover={{ y: -2 }}
                    className={infoCardClass}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5 text-cyan-300" />
                      <h3 className="font-semibold text-slate-100 text-sm">Annual Passengers</h3>
                    </div>
                    <p className="text-white font-semibold">{airportDetails.passengers}</p>
                    <p className="text-slate-300 text-sm">Approximate</p>
                  </motion.div>
                </div>

                {/* Extra Insights Section */}
                <div className="space-y-6 border-t border-cyan-500/25 pt-6">
                  {/* Airlines */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                      <Plane className="w-5 h-5 text-cyan-300" />
                      Airlines Operating
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {airportDetails.airlines.map((airline, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ scale: 1.05 }}
                          className="bg-slate-800 text-cyan-100 rounded-full border border-cyan-500/20 px-4 py-2 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-400/45 transition-colors duration-200"
                        >
                          {airline}
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Routes */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                      <Globe className="w-5 h-5 text-cyan-300" />
                      Popular Routes
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {airportDetails.routes.map((route, idx) => (
                        <motion.div
                          key={idx}
                          whileHover={{ y: -2 }}
                          className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-4 hover:bg-cyan-500/10 hover:border-cyan-400/45 transition-all duration-200 hover:shadow-md"
                        >
                          <p className="text-slate-100 font-medium text-sm">{route}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Airport Status */}
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-white mb-4">
                      <Building2 className="w-5 h-5 text-cyan-300" />
                      Airport Status
                    </h3>
                    <div className="bg-slate-900/60 border border-cyan-500/20 rounded-lg p-5">
                      <div className="grid grid-cols-3 gap-6">
                        <div>
                          <p className="text-slate-300 text-sm mb-1">Status</p>
                          <p className="text-green-400 font-semibold text-lg">{airportDetails.status}</p>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm mb-1">Terminals</p>
                          <p className="text-white font-semibold text-lg">{airportDetails.terminals}</p>
                        </div>
                        <div>
                          <p className="text-slate-300 text-sm mb-1">Opened</p>
                          <p className="text-white font-semibold text-lg">{airportDetails.opened}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-cyan-500/25 bg-slate-900/45 rounded-b-2xl">
                <button
                  onClick={handleViewOnMap}
                  className="w-full px-6 py-3 border border-cyan-400 text-cyan-200 font-semibold rounded-lg hover:bg-cyan-500/15 transition-colors duration-200"
                >
                  View on Map
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
