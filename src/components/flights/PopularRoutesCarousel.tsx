'use client'

import { motion } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Plane } from 'lucide-react'

interface PopularRoute {
  id: string
  origin: { code: string; name: string; city: string; country: string }
  destination: { code: string; name: string; city: string; country: string }
  startingPrice: number
  currency: string
  image: string
  airlineLogos: string[]
  isPopular: boolean
  discount?: number
  airportType?: 'International' | 'Domestic'
}

interface PopularRoutesCarouselProps {
  routes: PopularRoute[]
  onAirportSelect?: (route: PopularRoute) => void
}

export function PopularRoutesCarousel({ routes, onAirportSelect }: PopularRoutesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const getCardStep = () => {
    const container = scrollRef.current
    if (!container) return 0
    const firstCard = container.firstElementChild as HTMLElement | null
    if (!firstCard) return 0

    const styles = window.getComputedStyle(container)
    const gap = parseFloat(styles.columnGap || styles.gap || '24')
    return firstCard.offsetWidth + gap
  }

  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const handleScroll = () => {
      const step = getCardStep()
      if (!step) return
      const page = Math.round(container.scrollLeft / step)
      setCurrentIndex(page)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollLeft = () => {
    if (scrollRef.current) {
      const step = getCardStep() || 344
      scrollRef.current.scrollBy({ left: -step, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      const step = getCardStep() || 344
      scrollRef.current.scrollBy({ left: step, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="absolute -left-10 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={scrollLeft}
          className="p-3 bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] rounded-full text-white hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 transition-all shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute -right-10 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={scrollRight}
          className="p-3 bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] rounded-full text-white hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-hidden scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {routes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 h-[500px] group"
            style={{ width: 'calc((100% - 3rem) / 3)' }}
          >
            <div className="relative h-full bg-gray-800/80 backdrop-blur-md rounded-2xl overflow-hidden border-2 border-cyan-500/60 hover:border-cyan-300/80 transition-all shadow-lg hover:shadow-xl flex flex-col">
              {/* Airport Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={route.image}
                  alt={`${route.origin.city} airport`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-75"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md shadow-orange-900/30">
                    {route.airportType || 'Airport'} Airport
                  </div>
                </div>

                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md shadow-cyan-900/30">
                    {route.origin.code}
                  </div>
                </div>
                
                {/* Airport Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="text-white">
                    <div className="flex items-center mb-1 text-sm font-medium text-cyan-100">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{route.origin.city}, Pakistan</span>
                    </div>
                    <h3 className="text-lg font-bold leading-tight line-clamp-2">
                      {route.destination.name}
                    </h3>
                  </div>
                </div>
              </div>

              {/* Airport Details */}
              <div className="p-6 flex-1 flex flex-col">
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="rounded-xl bg-gray-900/60 border border-blue-300/55 p-3 min-h-[88px] flex flex-col justify-center">
                    <div className="text-xs uppercase tracking-wide text-blue-200/80 mb-1">City</div>
                    <div className="text-white font-semibold leading-tight line-clamp-1 flex items-center gap-2">
                      <span className="text-cyan-300">🏙</span>
                      <span>{route.origin.city}</span>
                    </div>
                  </div>

                  <div className="col-span-2 relative py-2">
                    <div className="border-t border-dashed border-cyan-500/35" />
                    <div className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-7 h-7 rounded-full bg-gray-900 border border-cyan-500/40 flex items-center justify-center">
                      <Plane className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  </div>

                  <div className="rounded-xl bg-gray-900/60 border border-blue-300/55 p-3 col-span-2 min-h-[88px] flex flex-col justify-center">
                    <div className="text-xs uppercase tracking-wide text-blue-200/80 mb-1">Province / Region</div>
                    <div className="text-white font-semibold leading-tight line-clamp-1 flex items-center gap-2">
                      <span className="text-cyan-300">🗺</span>
                      <span>{route.destination.country}</span>
                    </div>
                  </div>
                </div>

                {/* View Details Button */}
                <button 
                  onClick={() => onAirportSelect?.(route)}
                  className="mt-auto bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488] hover:from-[#1e3a8a]/90 hover:via-[#0f4c75]/90 hover:to-[#0d9488]/90 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-75 shadow-lg hover:shadow-xl w-full"
                >
                  View Details
                </button>
              </div>

              {/* Hover Effect */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-75 rounded-2xl" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll indicators removed to keep the section divider visually clean */}
    </div>
  )
}
