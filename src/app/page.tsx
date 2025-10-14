'use client'

import { motion } from 'framer-motion'
import { LandingHeader } from '@/components/landing/LandingHeader'
import { HeroCarousel } from '@/components/landing/HeroCarousel'
import { SearchBar } from '@/components/landing/SearchBar'
import { FAQSection } from '@/components/landing/FAQSection'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      
      {/* Hero Section with Carousel and Search */}
      <section className="relative pt-16">
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
            <motion.div 
              className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
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
              
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl">🏨</div>
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
            
            {/* Car Rental Card */}
            <motion.div 
              className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
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
              
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl">🚗</div>
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
            
            {/* Monument Recognition Card */}
            <motion.div 
              className="relative p-8 rounded-2xl bg-gradient-to-r from-blue-700 via-cyan-800 to-teal-800 backdrop-blur-md opacity-95 shadow-2xl hover:scale-105 hover:shadow-cyan-400/25 hover:shadow-2xl transition-all duration-300 group overflow-hidden"
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
              
              {/* Inner Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/10 group-hover:to-blue-500/10 transition-all duration-300 rounded-2xl"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-3xl">🏛️</div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-white mb-1">AI</div>
                    <div className="text-cyan-300 text-sm">Recognition</div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Monument Recognition</h3>
                <p className="text-cyan-100/80 text-sm leading-relaxed">
                  Upload photos to identify historical monuments with AI technology.
              </p>
            </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent">
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
      <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl mb-8 text-white text-opacity-90 max-w-2xl mx-auto">
            Join thousands of travelers who trust TripVerse for their journey planning
          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-white text-primary px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg">
              Get Started Free
            </button>
            <button className="bg-transparent border-2 border-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white hover:bg-opacity-10 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
