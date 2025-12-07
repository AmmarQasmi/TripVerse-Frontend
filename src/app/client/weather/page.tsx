'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useForecast, useCurrentWeatherByCity } from '@/features/weather/useForecast'
import { useAuth } from '@/features/auth/useAuth'
import { usersApi } from '@/lib/api/users.api'
import { cityApi } from '@/lib/api/auth.api'
import type { City } from '@/types/api'

export default function WeatherPage() {
  const { user } = useAuth()
  const [selectedCityName, setSelectedCityName] = useState<string>(user?.city?.name || '')
  const [cities, setCities] = useState<City[]>([])
  const [isChangingCity, setIsChangingCity] = useState(false)
  
  const { data: currentWeather, isLoading: currentLoading, error: currentError } = useCurrentWeatherByCity(selectedCityName)
  const { data: forecastData, isLoading: forecastLoading, error: forecastError } = useForecast(selectedCityName)
  
  const isLoading = currentLoading || forecastLoading
  const error = currentError || forecastError

  useEffect(() => {
    const loadCities = async () => {
      try {
        const data = await cityApi.getCities()
        setCities(data)
      } catch (err) {
        console.error('Failed to load cities:', err)
      }
    }
    loadCities()
    
    if (user?.city?.name) {
      setSelectedCityName(user.city.name)
    }
  }, [user])

  const handleCityChange = async (cityId: number) => {
    const selectedCity = cities.find(c => c.id === cityId)
    if (!selectedCity) return
    
    setIsChangingCity(true)
    try {
      await usersApi.updateProfile({ city_id: cityId })
      setSelectedCityName(selectedCity.name)
    } catch (err: any) {
      console.error('Failed to update city:', err)
      alert(err.response?.data?.message || 'Failed to update city')
    } finally {
      setIsChangingCity(false)
    }
  }

  const getWeatherIcon = (description: string) => {
    const iconMap: Record<string, string> = {
      'clear sky': '☀️',
      'mainly clear': '🌤️',
      'partly cloudy': '⛅',
      'overcast': '☁️',
      'few clouds': '⛅',
      'scattered clouds': '☁️',
      'broken clouds': '☁️',
      'shower rain': '🌦️',
      'rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
      'foggy': '🌫️',
    }
    return iconMap[description.toLowerCase()] || '🌤️'
  }

  const getTravelTips = (condition: string, temp: number) => {
    const lower = condition.toLowerCase()
    const tips = []
    
    if (lower.includes('clear') || lower.includes('sun')) {
      tips.push({ icon: '🧴', text: 'Pack light clothes & sunglasses 😎' })
      tips.push({ icon: '☀️', text: 'Check UV index for sun protection needs' })
    } else if (lower.includes('rain') || lower.includes('drizzle') || lower.includes('shower')) {
      tips.push({ icon: '☔', text: 'Carry umbrella, roads might be slippery ☔' })
      tips.push({ icon: '👢', text: 'Waterproof footwear recommended' })
    } else if (lower.includes('snow')) {
      tips.push({ icon: '🧤', text: 'Warm gear recommended ❄️🧤' })
      tips.push({ icon: '🧥', text: 'Pack layers for temperature changes' })
    } else if (lower.includes('cloud')) {
      tips.push({ icon: '👕', text: 'Pack layers for temperature changes throughout the day' })
    }
    
    if (temp > 25) {
      tips.push({ icon: '🧴', text: 'Stay hydrated and use sunscreen' })
    } else if (temp < 10) {
      tips.push({ icon: '🧥', text: 'Warm clothing essential' })
    }
    
    tips.push({ icon: '💨', text: 'Consider wind conditions for outdoor activities' })
    tips.push({ icon: '📱', text: 'Monitor weather updates during your trip' })
    
    return tips.slice(0, 6)
  }

  const formatTemperature = (temp: number) => {
    return Math.round(temp)
  }

  const currentCondition = currentWeather && 'condition' in currentWeather ? currentWeather.condition : 'Clear sky'
  const currentTemp = currentWeather && 'temperature' in currentWeather ? currentWeather.temperature : 20

  if (isLoading && !currentWeather) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-700 via-cyan-700 to-teal-700">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-white/20 backdrop-blur-lg rounded-xl w-1/3"></div>
            <div className="h-80 bg-white/10 backdrop-blur-lg rounded-2xl"></div>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-40 bg-white/10 backdrop-blur-lg rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-b from-blue-700 via-cyan-700 to-teal-700">
      {/* Animated Cloud Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Sun Glow */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.4, 0.3]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-10 right-20 w-40 h-40 bg-yellow-200/40 rounded-full blur-3xl"
        />
        
        {/* Floating Clouds */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear",
              delay: i * 2
            }}
            className="absolute"
            style={{
              top: `${20 + i * 15}%`,
              left: `${i * 20}%`,
              width: `${100 + i * 30}px`,
              height: `${60 + i * 20}px`,
              background: 'rgba(255, 255, 255, 0.3)',
              borderRadius: '50px',
              filter: 'blur(20px)',
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* City Selector */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="backdrop-blur-lg bg-white/20 rounded-xl p-6 border-2 border-cyan-400/50 shadow-xl">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white mb-2">
                  Select City
                </label>
                <select
                  value={cities.find(c => c.name === selectedCityName)?.id || ''}
                  onChange={(e) => handleCityChange(Number(e.target.value))}
                  disabled={isChangingCity}
                  className="w-full px-4 py-3 border-2 border-cyan-500 rounded-xl bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-teal-600 focus:border-teal-600 disabled:opacity-50 text-gray-900 font-medium"
                >
                  <option value="">Select a city...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}, {city.region}
                    </option>
                  ))}
                </select>
              </div>
              {isChangingCity && (
                <div className="text-sm text-white flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Updating...
                </div>
              )}
            </div>
            {selectedCityName && (
              <p className="mt-3 text-sm text-white/90">
                Showing weather for: <strong className="text-white">{selectedCityName}</strong>
              </p>
            )}
          </div>
        </motion.div>

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 backdrop-blur-lg bg-red-50/90 rounded-xl p-6 border-2 border-red-300"
          >
            <div className="flex items-center justify-center gap-3 text-red-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="font-semibold">Failed to load weather data. Please try again later.</p>
            </div>
          </motion.div>
        )}

        {currentWeather && 'cityName' in currentWeather && (
          <div className="space-y-6">
            {/* Hero Weather Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="backdrop-blur-lg bg-white/20 rounded-2xl p-8 border-2 border-white/30 shadow-2xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Side - Main Highlight */}
                <div className="flex flex-col items-center lg:items-start">
                  <motion.div
                    animate={{
                      y: [0, -10, 0],
                      rotate: [0, 3, -3, 0]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="text-9xl mb-6 filter drop-shadow-2xl"
                  >
                    {currentWeather.icon}
                  </motion.div>
                  <div className="text-7xl font-bold text-gray-900 mb-2">
                    {formatTemperature(currentWeather.temperature)}°C
                  </div>
                  <div className="text-2xl text-gray-800 capitalize font-semibold mb-2">
                    {currentWeather.condition}
                  </div>
                  <div className="text-sm text-gray-600">
                    Weather Code: {currentWeather.weatherCode}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">
                    Last updated: {new Date(currentWeather.time).toLocaleTimeString()}
                  </div>
                </div>

                {/* Right Side - Metrics Panel */}
                <div className="space-y-4">
                  <div className="text-xl font-semibold text-gray-900 mb-4">
                    {currentWeather.cityName}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {/* Humidity */}
                    <div className="p-4 rounded-xl backdrop-blur-sm border border-white/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.6), rgba(8, 145, 178, 0.7))'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">💧</span>
                        <span className="text-sm text-white font-medium">Humidity</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{currentWeather.humidity}%</p>
                    </div>

                    {/* Wind Speed */}
                    <div className="p-4 rounded-xl backdrop-blur-sm border border-white/30"
                      style={{
                        background: 'linear-gradient(135deg, rgba(8, 145, 178, 0.6), rgba(13, 148, 136, 0.7))'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">🌬️</span>
                        <span className="text-sm text-white font-medium">Wind Speed</span>
                      </div>
                      <p className="text-2xl font-bold text-white">{currentWeather.windSpeed} km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* 7-Day Forecast */}
            {forecastData && 'forecast' in forecastData && forecastData.forecast && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="backdrop-blur-lg bg-white/20 rounded-2xl p-6 border-2 border-white/30 shadow-xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">7-Day Forecast</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4 overflow-x-auto pb-2">
                  {forecastData.forecast.map((day: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                      whileHover={{ y: -4, transition: { duration: 0.2 } }}
                      className={`text-center p-4 rounded-xl backdrop-blur-sm border-2 transition-all ${
                        index === 0
                          ? 'border-teal-400 bg-white/30 shadow-lg'
                          : 'border-white/30 bg-white/20 hover:border-cyan-400'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-3 ${
                        index === 0 ? 'text-teal-100' : 'text-white'
                      }`}>
                        {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: index * 0.5
                        }}
                        className="text-5xl mb-3 filter drop-shadow-md"
                      >
                        {day.icon}
                      </motion.div>
                      <div className="space-y-2">
                        <div className="font-bold text-lg text-white">
                          <span className="text-blue-200">{formatTemperature(day.temperatureMax)}°</span>
                          <span className="text-gray-300 mx-1">/</span>
                          <span className="text-teal-200">{formatTemperature(day.temperatureMin)}°</span>
                        </div>
                        <div className="text-sm text-white/90 capitalize font-medium">
                          {day.condition}
                        </div>
                        <div className="text-xs text-white/70 pt-1">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Travel Tips */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="backdrop-blur-lg rounded-xl p-6 border-2 border-teal-400/50 shadow-xl"
              style={{
                background: 'rgba(19, 78, 74, 0.6)'
              }}
            >
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🎒</span>
                <h2 className="text-2xl font-bold text-teal-100">Travel Tips</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getTravelTips(currentCondition, currentTemp).map((tip, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                    className="flex items-start space-x-3 p-4 rounded-lg backdrop-blur-sm border border-teal-400/30 bg-white/10"
                  >
                    <span className="text-2xl">{tip.icon}</span>
                    <span className="text-sm text-white/90">{tip.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
