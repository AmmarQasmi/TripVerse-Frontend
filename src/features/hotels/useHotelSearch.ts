import { useQuery } from '@tanstack/react-query'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Hotel } from '@/types'

interface HotelSearchParams {
  query?: string
  location?: string
  checkIn?: string
  checkOut?: string
  minPrice?: number
  maxPrice?: number
}

export function useHotelSearch(params: HotelSearchParams) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsApi.search(params),
    enabled: !!(params.query || params.location),
  })
}

export function useHotelById(id: string) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelsApi.getById(id),
    enabled: !!id,
  })
}
