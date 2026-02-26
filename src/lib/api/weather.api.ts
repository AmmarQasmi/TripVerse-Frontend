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
    
    // Use coordinates if provided
    if (lat && lon) {
      const url = `${API_ENDPOINTS.WEATHER.COORDINATES_CURRENT}?lat=${lat}&lon=${lon}`
      return httpClient.get<CurrentWeatherResponse>(url)
    }

    // No params provided - this shouldn't happen, but fallback to current
    throw new Error('Either cityName or coordinates (lat, lon) must be provided')
  },

  getForecast: async (cityName?: string, lat?: number, lon?: number, days: number = 7) => {
    if (cityName) {
      // Use city name to fetch forecast
      const url = `${API_ENDPOINTS.WEATHER.FORECAST}?city=${encodeURIComponent(cityName)}&days=${days}`
      return httpClient.get<WeatherForecastResponse>(url)
    }

    // Use coordinates if provided
    if (lat && lon) {
      const url = `${API_ENDPOINTS.WEATHER.COORDINATES_FORECAST}?lat=${lat}&lon=${lon}&days=${days}`
      return httpClient.get<WeatherForecastResponse>(url)
    }

    // No params provided - this shouldn't happen
    throw new Error('Either cityName or coordinates (lat, lon) must be provided')
  },
}
