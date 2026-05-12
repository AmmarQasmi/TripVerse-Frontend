'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroCarousel } from '@/components/landing/HeroCarousel'
import { SearchBar } from '@/components/landing/SearchBar'
import { FAQSection } from '@/components/landing/FAQSection'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlane, faHotel, faCar } from '@fortawesome/free-solid-svg-icons'

export default function Home() {
  const [showQuickStartMenu, setShowQuickStartMenu] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section with Carousel and Search */}
      <section className="relative pt-0">
        <HeroCarousel />
        <SearchBar />
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-5xl md:text-6xl font-bold text-center mb-6">
            <motion.span
              animate={{ 
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity 
              }}
              style={{
                background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
            Why Choose TripVerse?
            </motion.span>
          </h2>
          <p className="text-xl md:text-2xl text-center text-gray-600 mb-16 max-w-3xl mx-auto">
            <motion.span
              animate={{ 
                backgroundPosition: ['100% 50%', '0% 50%', '100% 50%'] 
              }}
              transition={{ 
                duration: 5, 
                repeat: Infinity 
              }}
              style={{
                background: 'linear-gradient(90deg, #000 40%, #0891b2 50%, #000 60%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
            Everything you need for your perfect journey, all in one place
            </motion.span>
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Hotels Card */}
            <Link href="/client/hotels" className="block">
              <motion.div 
                className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  border: '2px solid transparent',
                  backgroundImage: `
                    linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
                    linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                  `,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              >
              {/* Animated Neon Border - TripVerse Theme */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  opacity: 0.9,
                  filter: 'blur(1px)',
                  zIndex: -1,
                  border: '2px solid transparent',
                  backgroundClip: 'border-box'
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Outer Glow Effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  filter: 'blur(3px)',
                  opacity: 0.4,
                  zIndex: -2
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Corner Highlights */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>

              {/* Background Image Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: 'url(/images/hotels/punjab/serena-hotel-islamabad/main.jpg)' }}
              />

              {/* Readability Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-black/40"></div>
              
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-cyan-300 shadow-[0_0_0_3px_rgba(37,99,235,0.45)] flex items-center justify-center">
                    <FontAwesomeIcon icon={faHotel} className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white mb-1">500+</div>
                    <div className="text-cyan-300 text-sm">Hotels Listed</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Hotels</h3>
                <p className="text-cyan-100/80 text-sm leading-relaxed">
                  Find and book the perfect hotel with real-time availability and best price guarantees.
              </p>
            </div>
            </motion.div>
            </Link>
            
            {/* Car Rental Card */}
            <Link href="/client/cars" className="block">
              <motion.div 
                className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  border: '2px solid transparent',
                  backgroundImage: `
                    linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
                    linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                  `,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              >
              {/* Animated Neon Border - TripVerse Theme */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  opacity: 0.9,
                  filter: 'blur(1px)',
                  zIndex: -1,
                  border: '2px solid transparent',
                  backgroundClip: 'border-box'
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Outer Glow Effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  filter: 'blur(3px)',
                  opacity: 0.4,
                  zIndex: -2
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Corner Highlights */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>

              {/* Background Image Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: 'url(/images/cities/karachi/karachi-03.png)' }}
              />

              {/* Readability Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-black/40"></div>
              
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-cyan-300 shadow-[0_0_0_3px_rgba(37,99,235,0.45)] flex items-center justify-center">
                    <FontAwesomeIcon icon={faCar} className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white mb-1">200+</div>
                    <div className="text-cyan-300 text-sm">Cars Available</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Car Rental</h3>
                <p className="text-cyan-100/80 text-sm leading-relaxed">
                  Rent cars from verified drivers and explore your destination at your own pace.
              </p>
            </div>
            </motion.div>
            </Link>
            
            {/* Flight Card */}
            <Link href="/client/flights" className="block">
              <motion.div 
                className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group overflow-hidden cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                style={{
                  border: '2px solid transparent',
                  backgroundImage: `
                    linear-gradient(to right, rgb(29, 78, 216), rgb(21, 94, 117), rgb(30, 64, 175)),
                    linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)
                  `,
                  backgroundOrigin: 'border-box',
                  backgroundClip: 'padding-box, border-box'
                }}
              >
              {/* Animated Neon Border - TripVerse Theme */}
              <motion.div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  opacity: 0.9,
                  filter: 'blur(1px)',
                  zIndex: -1,
                  border: '2px solid transparent',
                  backgroundClip: 'border-box'
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Outer Glow Effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: 'linear-gradient(90deg, #1e40af, #0891b2, #0d9488, #1e40af)',
                  backgroundSize: '200% 100%',
                  filter: 'blur(3px)',
                  opacity: 0.4,
                  zIndex: -2
                }}
                animate={{ 
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] 
                }}
                transition={{ 
                  duration: 3, 
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Corner Highlights */}
              <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-400/30 to-transparent rounded-br-full blur-sm"></div>
              <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-blue-400/30 to-transparent rounded-tl-full blur-sm"></div>

              {/* Background Image Layer */}
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: 'url(/images/cities/islamabad/islamabad-01.jpg)' }}
              />

              {/* Readability Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/45 via-black/30 to-black/40"></div>
              
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-14 h-14 rounded-full bg-white border-2 border-cyan-300 shadow-[0_0_0_3px_rgba(37,99,235,0.45)] flex items-center justify-center">
                    <FontAwesomeIcon icon={faPlane} className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white mb-1">100+</div>
                    <div className="text-cyan-300 text-sm">Routes</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Flights</h3>
                <p className="text-cyan-100/80 text-sm leading-relaxed">
                  Book domestic and international flights with the best airlines at competitive prices.
              </p>
            </div>
            </motion.div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-[#1e3a8a] via-[#0f4c75] to-[#0d9488]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <div className="text-white text-opacity-90">Happy Travelers</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-white text-opacity-90">Hotels Listed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">200+</div>
              <div className="text-white text-opacity-90">Cities Covered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-white text-opacity-90">Customer Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Global Travel Globe Section */}
      <section className="pt-4 pb-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-7xl mx-auto">
            <img
              src="/images/global-travel-globe.png.png"
              alt="Global Travel Destinations"
              className="w-full h-auto max-w-6xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative pt-20 pb-28 bg-gradient-to-br from-blue-600 to-cyan-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: 'url(/images/cities/karachi/karachi-03.png)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700/62 via-cyan-700/55 to-teal-700/50" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-white text-opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers who trust TripVerse for their journey planning
          </p>
          <div className="flex gap-4 justify-center items-center">
            <div className="relative">
              <button
                onClick={() => setShowQuickStartMenu((prev) => !prev)}
                aria-expanded={showQuickStartMenu}
                aria-label="Toggle quick start options"
                className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center gap-3"
              >
                <span>Get Started Free</span>
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    showQuickStartMenu ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {showQuickStartMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-20"
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/95 border-l border-t border-cyan-200 rotate-45"></div>
                    <div className="relative bg-white/95 backdrop-blur-md rounded-full px-3 py-3 shadow-xl border border-cyan-200">
                      <div className="flex items-center gap-3">
                        <Link
                          href="/client/flights"
                          aria-label="Go to Flights"
                          title="Flights"
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <FontAwesomeIcon icon={faPlane} className="w-5 h-5" />
                        </Link>
                        <Link
                          href="/client/cars"
                          aria-label="Go to Car Rentals"
                          title="Car Rentals"
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <FontAwesomeIcon icon={faCar} className="w-5 h-5" />
                        </Link>
                        <Link
                          href="/client/hotels"
                          aria-label="Go to Hotels"
                          title="Hotels"
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white flex items-center justify-center hover:scale-110 transition-transform"
                        >
                          <FontAwesomeIcon icon={faHotel} className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <Link
              href="/learn-more"
              className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
