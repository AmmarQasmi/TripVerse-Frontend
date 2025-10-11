'use client'

import { motion } from 'framer-motion'
import { useState, useRef } from 'react'
import { ChevronLeft, ChevronRight, MapPin, Plane, Tag } from 'lucide-react'

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
}

interface PopularRoutesCarouselProps {
  routes: PopularRoute[]
}

export function PopularRoutesCarousel({ routes }: PopularRoutesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' })
    }
  }

  return (
    <div className="relative">
      {/* Navigation Buttons */}
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={scrollLeft}
          className="p-3 bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-full text-white hover:bg-gray-700/80 hover:border-cyan-500 transition-all shadow-lg"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10">
        <button
          onClick={scrollRight}
          className="p-3 bg-gray-800/80 backdrop-blur-md border border-gray-600 rounded-full text-white hover:bg-gray-700/80 hover:border-cyan-500 transition-all shadow-lg"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Carousel Container */}
      <div
        ref={scrollRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {routes.map((route, index) => (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-shrink-0 w-80 group"
          >
            <div className="relative bg-gray-800/80 backdrop-blur-md rounded-2xl overflow-hidden border border-cyan-700/40 hover:border-cyan-500/60 transition-all cursor-pointer shadow-lg hover:shadow-xl">
              {/* Discount Badge */}
              {route.discount && (
                <div className="absolute top-4 left-4 z-10">
                  <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
                    <Tag className="w-3 h-3 mr-1" />
                    {route.discount}% OFF
                  </div>
                </div>
              )}

              {/* Popular Badge */}
              {route.isPopular && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    Popular
                  </div>
                </div>
              )}

              {/* Route Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={route.image}
                  alt={`${route.origin.city} to ${route.destination.city}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Route Info Overlay */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="flex items-center justify-between">
                    <div className="text-white">
                      <div className="flex items-center mb-1">
                        <Plane className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">
                          {route.origin.code} → {route.destination.code}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">
                        {route.origin.city} to {route.destination.city}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="p-6">
                {/* Route Path */}
                <div className="flex items-center justify-between mb-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">From</div>
                    <div className="font-semibold text-white">{route.origin.city}</div>
                    <div className="text-xs text-gray-500">{route.origin.country}</div>
                  </div>
                  
                  <div className="flex-1 mx-4">
                    <div className="border-t border-dashed border-gray-600 relative">
                      <div className="absolute left-1/2 transform -translate-x-1/2 -top-2">
                        <Plane className="w-4 h-4 text-cyan-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-sm text-gray-400">To</div>
                    <div className="font-semibold text-white">{route.destination.city}</div>
                    <div className="text-xs text-gray-500">{route.destination.country}</div>
                  </div>
                </div>

                {/* Airlines */}
                <div className="mb-4">
                  <div className="text-sm text-gray-400 mb-2">Available Airlines</div>
                  <div className="flex items-center space-x-2">
                    {route.airlineLogos.map((logo, logoIndex) => (
                      <img
                        key={logoIndex}
                        src={logo}
                        alt={`Airline ${logoIndex + 1}`}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ))}
                    {route.airlineLogos.length > 3 && (
                      <div className="text-xs text-gray-400">
                        +{route.airlineLogos.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-400">Starting from</div>
                    <div className="text-2xl font-bold text-cyan-300">
                      {route.currency} {route.startingPrice.toLocaleString()}
                    </div>
                  </div>
                  
                  <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all">
                    Search Flights
                  </button>
                </div>
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Scroll Indicators */}
      <div className="flex justify-center mt-6 space-x-2">
        {routes.slice(0, Math.ceil(routes.length / 4)).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({ left: index * 320, behavior: 'smooth' })
              }
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === Math.floor(currentIndex / 4) 
                ? 'bg-cyan-400' 
                : 'bg-gray-600 hover:bg-gray-500'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
