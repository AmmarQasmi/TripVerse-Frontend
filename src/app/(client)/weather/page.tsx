'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { useForecast } from '@/features/weather/useForecast'

export default function WeatherPage() {
  const [location, setLocation] = useState('')
  const [coordinates, setCoordinates] = useState<{ lat: number; lon: number } | null>(null)
  
  const { data: weatherData, isLoading, error } = useForecast(coordinates?.lat, coordinates?.lon)

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  const handleLocationSearch = () => {
    // TODO: Implement location search using geocoding API
    console.log('Searching for location:', location)
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
      <div className="container mx-auto px-4 py-8">
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
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Weather Forecast
        </h1>
        
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              label="Search Location"
              placeholder="Enter city name or coordinates"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1"
            />
            <div className="flex items-end">
              <Button onClick={handleLocationSearch}>
                Search
              </Button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Failed to load weather data. Please try again later.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {weatherData && (
        <div className="space-y-6">
          {/* Current Weather */}
          <Card>
            <CardHeader>
              <CardTitle>
                Current Weather - {weatherData.location.name}, {weatherData.location.country}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-6xl mb-2">
                    {getWeatherIcon(weatherData.current.description)}
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    {formatTemperature(weatherData.current.temperature)}°C
                  </div>
                  <div className="text-lg text-gray-600 capitalize">
                    {weatherData.current.description}
                  </div>
                  <div className="text-sm text-gray-500">
                    Feels like {formatTemperature(weatherData.current.feelsLike)}°C
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity</span>
                    <span className="font-semibold">{weatherData.current.humidity}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pressure</span>
                    <span className="font-semibold">{weatherData.current.pressure} hPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visibility</span>
                    <span className="font-semibold">{weatherData.current.visibility / 1000} km</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Speed</span>
                    <span className="font-semibold">{weatherData.current.windSpeed} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Direction</span>
                    <span className="font-semibold">
                      {formatWindDirection(weatherData.current.windDirection)} 
                      ({weatherData.current.windDirection}°)
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="font-semibold text-sm">
                      {new Date(weatherData.current.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Coordinates</span>
                    <span className="font-semibold text-sm">
                      {weatherData.location.coordinates.latitude.toFixed(2)}, 
                      {weatherData.location.coordinates.longitude.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Forecast</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
                {weatherData.forecast.map((day, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg hover:bg-gray-50">
                    <div className="text-sm font-medium text-gray-600 mb-2">
                      {index === 0 ? 'Today' : new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className="text-3xl mb-2">
                      {getWeatherIcon(day.description)}
                    </div>
                    <div className="space-y-1">
                      <div className="font-semibold">
                        {formatTemperature(day.temperature.max)}° / {formatTemperature(day.temperature.min)}°
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {day.description}
                      </div>
                      <div className="text-xs text-gray-500">
                        💧 {day.precipitation}mm
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Weather Tips */}
          <Card>
            <CardHeader>
              <CardTitle>Travel Weather Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Pack layers for temperature changes throughout the day</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Bring rain gear if precipitation is expected</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Check UV index for sun protection needs</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Consider wind conditions for outdoor activities</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Plan indoor alternatives for severe weather</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>Monitor weather updates during your trip</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
