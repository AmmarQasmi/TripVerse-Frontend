'use client'

import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'

interface DomesticFlight {
  key: string
  region: string
  area: string
  airport: string
  airlines: string
  frequency: string
  pricePKR: string
  priceUSD: string
  duration: string
  bestTime: string
  hotels: readonly string[]
}

interface DomesticFlightGuideProps {
  flights: ReadonlyArray<DomesticFlight>
}

export function DomesticFlightGuide({ flights }: DomesticFlightGuideProps) {
  const [provinceFilter, setProvinceFilter] = useState<'ALL' | 'NA' | 'KPK' | 'AJK' | 'PUNJAB' | 'SINDH' | 'BALOCHISTAN' | 'ISB'>('ALL')

  const normalizeRegion = (region: string): 'NA' | 'KPK' | 'AJK' | 'PUNJAB' | 'SINDH' | 'BALOCHISTAN' | 'ISB' => {
    const r = region.toLowerCase()
    if (r.includes('northern')) return 'NA'
    if (r.includes('khyber')) return 'KPK'
    if (r.includes('azad')) return 'AJK'
    if (r.includes('punjab')) return 'PUNJAB'
    if (r.includes('sindh')) return 'SINDH'
    if (r.includes('balochistan')) return 'BALOCHISTAN'
    if (r.includes('islamabad')) return 'ISB'
    return 'NA'
  }

  const flightsWithRegion = useMemo(
    () => flights.map((f) => ({ ...f, province: normalizeRegion(f.region) })),
    [flights]
  )

  const visibleFlights = useMemo(
    () => (provinceFilter === 'ALL' ? flightsWithRegion : flightsWithRegion.filter((f) => f.province === provinceFilter)),
    [flightsWithRegion, provinceFilter]
  )
  const formatTitle = (region: string, area: string) => {
    const shortRegionMap: Record<string, string> = {
      'Northern Areas': 'NA',
      'Khyber Pakhtunkhwa': 'KPK',
      'Azad Kashmir': 'AJK',
      'Islamabad / Federal': 'ISB',
      'Sindh (Coastal)': 'Sindh Coast',
      'Balochistan (Coastal)': 'Balochistan Coast'
    }

    const normalizedRegion = shortRegionMap[region] ?? region

    let normalizedArea = area
      .replace('Naran / Kaghan', 'Naran–Kaghan')
      .replace(' (via ISB)', ' · via ISB')

    const combined = `${normalizedRegion} — ${normalizedArea}`

    if (combined.length > 40) {
      // If still long, truncate area smartly
      const maxArea = Math.max(10, 40 - normalizedRegion.length - 3)
      normalizedArea = normalizedArea.length > maxArea
        ? normalizedArea.slice(0, maxArea - 1).trimEnd() + '…'
        : normalizedArea
    }

    return `${normalizedRegion} — ${normalizedArea}`
  }

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900">
      <div className="container mx-auto max-w-[1400px]">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white mb-12 text-center"
        >
          Domestic Flight Guide (Pakistan)
        </motion.h2>

        {/* Province Filter */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {[
            { code: 'ALL', label: 'All' },
            { code: 'NA', label: 'Northern Areas' },
            { code: 'KPK', label: 'Khyber Pakhtunkhwa' },
            { code: 'AJK', label: 'Azad Jammu & Kashmir' },
            { code: 'PUNJAB', label: 'Punjab' },
            { code: 'SINDH', label: 'Sindh' },
            { code: 'BALOCHISTAN', label: 'Balochistan' },
            { code: 'ISB', label: 'Islamabad / Federal' }
          ].map((b) => (
            <button
              key={b.code}
              onClick={() => setProvinceFilter(b.code as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all border backdrop-blur
                ${provinceFilter === b.code
                  ? 'bg-cyan-600/30 border-cyan-400/60 text-white shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                  : 'bg-gray-900/40 border-white/10 text-gray-200 hover:bg-gray-900/60'}
              `}
            >
              {b.label}
            </button>
          ))}
        </div>

        {/* Premium Flight Cards - Two Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {visibleFlights.map((flight, index) => (
            <motion.div
              key={flight.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative h-full"
            >
              <div className="bg-gray-900/60 backdrop-blur-md border border-yellow-400/60 rounded-2xl p-6 hover:border-yellow-300/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,0,0.3)] hover:-translate-y-1 h-full overflow-hidden">
                <div className="flex items-center justify-between h-full min-w-0">
                  {/* Airline Info */}
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">PIA</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-white text-base md:text-lg font-bold leading-snug whitespace-nowrap overflow-hidden text-ellipsis">
                        {formatTitle(flight.region, flight.area)}
                      </h3>
                      <p className="text-gray-400 text-sm">PK-{Math.floor((flight.key.charCodeAt(0) + flight.key.length) * 7) % 900 + 100} • ECONOMY</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-yellow-400">★</span>
                        <span className="text-gray-400">★</span>
                        <span className="text-white text-sm ml-1">4.2</span>
                      </div>
                      {/* Price block under rating */}
                      <div className="mt-2 leading-tight">
                        <div className="text-sm md:text-base font-semibold text-white whitespace-nowrap">PKR {flight.pricePKR.split('–')[0].replace(',', '')}</div>
                        <div className="text-gray-400 text-[10px] md:text-[11px]">per passenger</div>
                      </div>
                    </div>
                  </div>

                  {/* Flight Path - Vertical Compact Timeline */}
                  <div className="flex-1 mx-6">
                    <div className="grid grid-cols-3 gap-3 items-center">
                      {/* Departure */}
                      <div className="text-center min-w-0">
                        <div className="text-cyan-400 font-medium whitespace-nowrap">{flight.airport.split(' ')[0]}</div>
                        <div className="text-gray-300 text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">{flight.area}</div>
                      </div>

                      {/* Vertical timeline */}
                      <div className="flex flex-col items-center justify-center h-full">
                        <div className="h-6 w-px bg-cyan-400/60 border-l-2 border-dashed border-cyan-400" />
                        <div className="w-6 h-6 -my-1 bg-cyan-500 rounded-full flex items-center justify-center text-white text-xs">✈</div>
                        <div className="h-6 w-px bg-cyan-400/60 border-l-2 border-dashed border-cyan-400" />
                        <span className="mt-1 bg-emerald-500/20 text-emerald-300 text-[10px] rounded-full px-2 py-0.5 border border-emerald-500/30 whitespace-nowrap">Direct</span>
                        <div className="text-gray-400 text-[10px] mt-1 whitespace-nowrap">{flight.duration}</div>
                        <div className="h-6 w-px mt-1 bg-cyan-400/60 border-l-2 border-dashed border-cyan-400" />
                      </div>

                      {/* Arrival */}
                      <div className="text-center min-w-0">
                        <div className="text-cyan-400 font-medium whitespace-nowrap">DXB</div>
                        <div className="text-gray-300 text-[10px] whitespace-nowrap overflow-hidden text-ellipsis">Dubai</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}