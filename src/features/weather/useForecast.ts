import { useQuery } from '@tanstack/react-query'
import { weatherApi, CurrentWeatherResponse, WeatherForecastResponse } from '@/lib/api/weather.api'
import { WeatherForecast, CurrentWeather } from '@/types'

export function useForecast(cityName?: string, lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather', 'forecast', cityName, lat, lon],
    queryFn: () => weatherApi.getForecast(cityName, lat, lon),
    enabled: true, // Always enabled, will use default location if no coordinates
  })
}

export function useCurrentWeather(cityName?: string, lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather', 'current', cityName, lat, lon],
    queryFn: () => weatherApi.getCurrentWeather(cityName, lat, lon),
    enabled: true,
  })
}

/**
 * Hook to fetch current weather by city name
 * Only enabled when cityName is provided
 */
export function useCurrentWeatherByCity(cityName?: string) {
  return useQuery<CurrentWeatherResponse>({
    queryKey: ['weather', 'current', 'city', cityName],
    queryFn: () => weatherApi.getCurrentWeather(cityName) as Promise<CurrentWeatherResponse>,
    enabled: !!cityName, // Only fetch when cityName is provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false, // Don't refetch on window focus
  })
}

/**
 * Hook to fetch current weather by coordinates (for geolocation)
 * Only enabled when both lat and lon are provided
 */
export function useCurrentWeatherByCoordinates(lat?: number, lon?: number) {
  return useQuery<CurrentWeatherResponse>({
    queryKey: ['weather', 'current', 'coordinates', lat, lon],
    queryFn: () => weatherApi.getCurrentWeather(undefined, lat, lon) as Promise<CurrentWeatherResponse>,
    enabled: !!(lat && lon), // Only fetch when both coordinates are provided
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    refetchOnWindowFocus: false,
  })
}
