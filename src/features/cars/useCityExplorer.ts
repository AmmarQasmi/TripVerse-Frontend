import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars.api'

export function usePopularCities() {
  return useQuery({
    queryKey: ['cars', 'cities', 'popular'],
    queryFn: () => carsApi.getPopularCities(),
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useCityExplorer(cityName: string | null) {
  return useQuery({
    queryKey: ['cars', 'cities', 'explore', cityName],
    queryFn: () => carsApi.exploreCityInfo(cityName!),
    enabled: !!cityName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
