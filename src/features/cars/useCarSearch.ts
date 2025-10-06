import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars.api'

interface CarSearchParams {
  query?: string
  location?: string
  startDate?: string
  endDate?: string
  type?: string
  seats?: number
  minPrice?: number
  maxPrice?: number
}

export function useCarSearch(params: CarSearchParams) {
  return useQuery({
    queryKey: ['cars', 'search', params],
    queryFn: () => carsApi.search(params),
    enabled: !!(params.query || params.location),
  })
}

export function useCarById(id: string) {
  return useQuery({
    queryKey: ['cars', id],
    queryFn: () => carsApi.getById(id),
    enabled: !!id,
  })
}
