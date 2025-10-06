import { useQuery } from '@tanstack/react-query'
import { weatherApi } from '@/lib/api/weather.api'
import { WeatherForecast, CurrentWeather } from '@/types'

export function useForecast(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather', 'forecast', lat, lon],
    queryFn: () => weatherApi.getForecast(lat, lon),
    enabled: true, // Always enabled, will use default location if no coordinates
  })
}

export function useCurrentWeather(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['weather', 'current', lat, lon],
    queryFn: () => weatherApi.getCurrentWeather(lat, lon),
    enabled: true,
  })
}
