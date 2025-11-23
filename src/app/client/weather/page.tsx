'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { LandingHeader } from '@/components/landing/LandingHeader'
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
  const weatherData = forecastData

  useEffect(() => {
    // Load cities for dropdown
    const loadCities = async () => {
      try {
        const data = await cityApi.getCities()
        setCities(data)
      } catch (err) {
        console.error('Failed to load cities:', err)
      }
    }
    loadCities()
    
    // Set initial city from user profile
    if (user?.city?.name) {
      setSelectedCityName(user.city.name)
    }
  }, [user])

  const handleCityChange = async (cityId: number) => {
    const selectedCity = cities.find(c => c.id === cityId)
    if (!selectedCity) return
    
    setIsChangingCity(true)
    try {
      // Update user's city in profile
      await usersApi.updateProfile({ city_id: cityId })
      setSelectedCityName(selectedCity.name)
      // Refresh user data (will be handled by auth context on next request)
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
      'few clouds': '⛅',
      'scattered clouds': '☁️',
      'broken clouds': '☁️',
      'shower rain': '🌦️',
      'rain': '🌧️',
      'thunderstorm': '⛈️',
      'snow': '❄️',
      'mist': '🌫️',
    }
    return iconMap[description.toLowerCase()] || '🌤️'
  }

  const formatTemperature = (temp: number) => {
    return Math.round(temp)
  }

  const formatWindDirection = (degrees: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']
    const index = Math.round(degrees / 45) % 8
    return directions[index]
  }

  if (isLoading && !weatherData) {
    return (
      <div className="min-h-screen bg-white">
        <LandingHeader />
        <div className="container mx-auto px-4 py-8 pt-24">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Weather Forecast
          </h1>
          <p className="text-gray-600">Stay updated with the latest weather conditions</p>
        </div>
        
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl shadow-lg mb-8 border border-blue-100">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Select City
              </label>
              <select
                value={cities.find(c => c.name === selectedCityName)?.id || ''}
                onChange={(e) => handleCityChange(Number(e.target.value))}
                disabled={isChangingCity}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 bg-white"
              >
                <option value="">Select a city...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id} className="text-gray-900">
                    {city.name}, {city.region}
                  </option>
                ))}
              </select>
            </div>
            {isChangingCity && (
              <div className="text-sm text-gray-700">
                Updating city...
              </div>
            )}
          </div>
          {selectedCityName && (
            <p className="mt-2 text-sm text-gray-900">
              Showing weather for: <strong>{selectedCityName}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="text-center text-red-600">
                  <p>Failed to load weather data. Please try again later.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentWeather && 'cityName' in currentWeather && (
        <div className="space-y-6">
          {/* Current Weather */}
          <Card className="bg-white shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">
                Current Weather - {currentWeather.cityName}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <div className="text-center lg:border-r lg:border-gray-200 lg:pr-8">
                  <div className="text-8xl mb-4 filter drop-shadow-lg">
                    {currentWeather.icon}
                  </div>
                  <div className="text-5xl font-bold text-gray-900 mb-2">
                    {formatTemperature(currentWeather.temperature)}°C
                  </div>
                  <div className="text-xl text-gray-600 capitalize font-medium">
                    {currentWeather.condition}
                  </div>
                </div>

                <div className="space-y-4 lg:border-r lg:border-gray-200 lg:pr-8">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💧</span>
                      <span className="text-gray-600 font-medium">Humidity</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900">{currentWeather.humidity}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">💨</span>
                      <span className="text-gray-600 font-medium">Wind Speed</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900">{currentWeather.windSpeed} km/h</span>
                  </div>
                </div>

                <div className="space-y-4 lg:border-r lg:border-gray-200 lg:pr-8">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">🕐</span>
                      <span className="text-gray-600 font-medium">Last Updated</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900">
                      {new Date(currentWeather.time).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">📍</span>
                      <span className="text-gray-600 font-medium">Location</span>
                    </div>
                    <span className="font-bold text-sm text-gray-900 truncate max-w-[120px]">
                      {currentWeather.cityName}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-gray-600 mb-2">Weather Code</p>
                    <p className="text-2xl font-bold text-blue-600">{currentWeather.weatherCode}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          {forecastData && 'forecast' in forecastData && forecastData.forecast && (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold">7-Day Forecast</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                  {forecastData.forecast.map((day: any, index: number) => (
                    <div 
                      key={index} 
                      className={`text-center p-4 rounded-xl border-2 transition-all hover:shadow-lg ${
                        index === 0 
                          ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-300' 
                          : 'bg-white border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className={`text-sm font-semibold mb-3 ${
                        index === 0 ? 'text-blue-700' : 'text-gray-700'
                      }`}>
                        {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="text-5xl mb-3 filter drop-shadow-md">
                        {day.icon}
                      </div>
                      <div className="space-y-2">
                        <div className="font-bold text-lg text-gray-900">
                          {formatTemperature(day.temperatureMax)}° / {formatTemperature(day.temperatureMin)}°
                        </div>
                        <div className="text-sm text-gray-600 capitalize font-medium">
                          {day.condition}
                        </div>
                        <div className="text-xs text-gray-500 pt-1">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weather Tips */}
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="text-2xl font-bold">Travel Weather Tips</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">👕</span>
                  <span className="text-sm text-gray-700">Pack layers for temperature changes throughout the day</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">☂️</span>
                  <span className="text-sm text-gray-700">Bring rain gear if precipitation is expected</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">☀️</span>
                  <span className="text-sm text-gray-700">Check UV index for sun protection needs</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">💨</span>
                  <span className="text-sm text-gray-700">Consider wind conditions for outdoor activities</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">🏠</span>
                  <span className="text-sm text-gray-700">Plan indoor alternatives for severe weather</span>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-white rounded-lg shadow-sm">
                  <span className="text-2xl">📱</span>
                  <span className="text-sm text-gray-700">Monitor weather updates during your trip</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}
