'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useCurrentWeatherByCity } from '@/features/weather/useForecast'

interface WeatherWidgetProps {
  cityName?: string
}

export function WeatherWidget({ 
  cityName
}: WeatherWidgetProps) {
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data: weather, isLoading, error } = useCurrentWeatherByCity(cityName)
  
  const location = weather?.cityName || cityName || 'Your Location'
  const temperature = weather?.temperature ?? 24
  const condition = weather?.condition || 'Sunny'
  const icon = weather?.icon || '🌤️'

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = () => {
    if (icon && icon !== '🌤️') return icon
    const lowerCondition = condition.toLowerCase()
    if (lowerCondition.includes('sun') || lowerCondition.includes('clear')) return '☀️'
    if (lowerCondition.includes('cloud')) return '☁️'
    if (lowerCondition.includes('rain')) return '🌧️'
    if (lowerCondition.includes('snow')) return '❄️'
    if (lowerCondition.includes('storm')) return '⛈️'
    return '🌤️'
  }

  const weatherIcon = getWeatherIcon()
  const isSun = weatherIcon === '☀️'
  const isCloud = weatherIcon === '☁️' || weatherIcon === '⛅'

  return (
    <Link href="/client/weather">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ scale: 1.01 }}
        className="relative overflow-hidden rounded-xl backdrop-blur-md border-2 border-teal-400/50 shadow-lg px-4 py-2 bg-white/20 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {/* Animated Weather Icon */}
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <motion.span
              animate={isSun ? {
                rotate: [0, 3, -3, 0]
              } : isCloud ? {
                x: [0, 2, 0]
              } : {}}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-2xl filter drop-shadow-sm"
            >
              {weatherIcon}
            </motion.span>
          )}
          
          {/* Temperature */}
          {!isLoading && !error && (
            <>
              <span className="text-lg font-bold text-gray-900">
                {temperature}°C
              </span>
              <span className="text-sm text-gray-700 hidden sm:inline">
                {location}
              </span>
            </>
          )}
          
          {error && (
            <span className="text-sm text-gray-600">Weather unavailable</span>
          )}
        </div>
        
        {/* Teal Glow Effect */}
        <motion.div
          animate={{
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 rounded-xl border-2 border-teal-400/30 pointer-events-none"
        />
      </motion.div>
    </Link>
  )
}
