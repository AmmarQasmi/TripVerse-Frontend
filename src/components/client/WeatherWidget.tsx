'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface WeatherWidgetProps {
  location?: string
  temperature?: number
  condition?: string
}

export function WeatherWidget({ 
  location = 'Your Location',
  temperature = 24,
  condition = 'Sunny'
}: WeatherWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = () => {
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return '☀️'
    if (lowerCondition.includes('cloud')) return '☁️'
    if (lowerCondition.includes('rain')) return '🌧️'
    if (lowerCondition.includes('snow')) return '❄️'
    if (lowerCondition.includes('storm')) return '⛈️'
    return '🌤️'
  }

  const getMotivationalMessage = () => {
    if (temperature > 25) return 'Perfect day to explore! 🌤️'
    if (temperature > 15) return 'Great weather for adventures! ✨'
    if (temperature > 5) return 'Pack a jacket and enjoy! 🧥'
    return 'Stay warm and cozy! ☕'
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden rounded-2xl backdrop-blur-md bg-gradient-to-br from-teal-500/20 via-emerald-500/20 to-orange-400/20 border border-white/30 p-6 shadow-xl"
    >
      {/* TripVerse Brand Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-emerald-500/10 to-orange-400/10" />
      
      {/* Animated Background Clouds */}
      <motion.div
        animate={{ x: [0, 100, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-400/30 to-emerald-400/30 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -100, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-br from-lime-400/30 to-orange-400/30 rounded-full blur-3xl"
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-semibold text-lg">Weather</h3>
            <p className="text-gray-200 text-xs">{location}</p>
          </div>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            className="text-4xl filter drop-shadow-lg"
          >
            {getWeatherIcon()}
          </motion.div>
        </div>

        {/* Temperature */}
        <div className="mb-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-5xl font-bold bg-gradient-to-r from-teal-400 via-emerald-400 to-orange-400 bg-clip-text text-transparent mb-1"
          >
            {temperature}°C
          </motion.div>
          <p className="text-gray-200 text-sm">{condition}</p>
        </div>

        {/* Motivational Message */}
        <div className="mb-4 p-3 rounded-lg backdrop-blur-sm bg-white/20 border border-white/30">
          <p className="text-white text-sm text-center font-medium">
            {getMotivationalMessage()}
          </p>
        </div>

        {/* Current Time */}
        <div className="mb-4 text-center">
          <p className="text-gray-300 text-xs">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <p className="text-white text-sm font-semibold">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* View More Link */}
        <Link href="/client/weather">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-lg backdrop-blur-sm bg-white/20 hover:bg-white/30 border border-white/30 text-white text-sm font-semibold transition-all duration-300 hover:border-white/50"
          >
            View Full Forecast →
          </motion.button>
        </Link>
      </div>
    </motion.div>
  )
}

