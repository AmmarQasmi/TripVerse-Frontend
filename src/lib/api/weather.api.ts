import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { WeatherForecast, CurrentWeather } from '@/types'

export const weatherApi = {
  getCurrentWeather: async (lat?: number, lon?: number) => {
    const url = lat && lon 
      ? API_ENDPOINTS.WEATHER.LOCATION(lat, lon)
      : API_ENDPOINTS.WEATHER.CURRENT
    
    return httpClient.get<CurrentWeather>(url)
  },

  getForecast: async (lat?: number, lon?: number, days: number = 7) => {
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
