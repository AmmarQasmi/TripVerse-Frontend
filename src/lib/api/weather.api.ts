import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { WeatherForecast, CurrentWeather } from '@/types'

export interface CurrentWeatherResponse {
  temperature: number
  condition: string
  humidity: number
  windSpeed: number
  cityName: string
  icon: string
  weatherCode: number
  time: string
}

export interface WeatherForecastResponse {
  cityName: string
  forecast: Array<{
    date: string
    condition: string
    icon: string
    temperatureMax: number
    temperatureMin: number
    weatherCode: number
  }>
}

export const weatherApi = {
  getCurrentWeather: async (cityName?: string, lat?: number, lon?: number) => {
    if (cityName) {
      // Use city name to fetch weather
      const url = `${API_ENDPOINTS.WEATHER.CURRENT}?city=${encodeURIComponent(cityName)}`
      return httpClient.get<CurrentWeatherResponse>(url)
    }
    
    // Fallback to coordinate-based or default location
    const url = lat && lon 
      ? API_ENDPOINTS.WEATHER.LOCATION(lat, lon)
      : API_ENDPOINTS.WEATHER.CURRENT
    
    return httpClient.get<CurrentWeather>(url)
  },

  getForecast: async (cityName?: string, lat?: number, lon?: number, days: number = 7) => {
    if (cityName) {
      // Use city name to fetch forecast
      const url = `${API_ENDPOINTS.WEATHER.FORECAST}?city=${encodeURIComponent(cityName)}&days=${days}`
      return httpClient.get<WeatherForecastResponse>(url)
    }

    // Fallback to coordinate-based
    const searchParams = new URLSearchParams({ days: days.toString() })
    
    if (lat && lon) {
      searchParams.append('lat', lat.toString())
      searchParams.append('lon', lon.toString())
    }

    return httpClient.get<WeatherForecast>(
      `${API_ENDPOINTS.WEATHER.FORECAST}?${searchParams.toString()}`
    )
  },
}
