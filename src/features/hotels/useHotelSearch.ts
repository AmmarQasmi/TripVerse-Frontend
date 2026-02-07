import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { hotelsApi } from '@/lib/api/hotels.api'
import { Hotel } from '@/types'

interface HotelSearchParams {
  query?: string
  location?: string
  checkIn?: string
  checkOut?: string
  guests?: number
  rooms?: number
  minPrice?: number
  maxPrice?: number
  starRating?: number[]
  amenities?: string[]
  propertyType?: string[]
}

export function useHotelSearch(params: HotelSearchParams) {
  return useQuery({
    queryKey: ['hotels', 'search', params],
    queryFn: () => hotelsApi.search(params),
    enabled: true, // Always enabled to allow fetching all hotels
  })
}

export function useAvailableCities() {
  return useQuery({
    queryKey: ['hotels', 'available-cities'],
    queryFn: () => hotelsApi.getAvailableCities(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })
}

export function useRoomAvailability(hotelId: string, checkin: string, checkout: string) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'availability', checkin, checkout],
    queryFn: () => hotelsApi.checkRoomAvailability(hotelId, checkin, checkout),
    enabled: !!hotelId && !!checkin && !!checkout,
  })
}

export function useHotelById(id: string) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: () => hotelsApi.getById(id),
    enabled: !!id,
  })
}

export function useRegionsByCity(city: string) {
  return useQuery({
    queryKey: ['hotels', 'regions', city],
    queryFn: () => hotelsApi.getRegionsByCity(city),
    enabled: !!city,
    staleTime: 5 * 60 * 1000,
  })
}

export function usePopularDestinations() {
  return useQuery({
    queryKey: ['hotels', 'popular-destinations'],
    queryFn: () => hotelsApi.getPopularDestinations(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  })
}

export function useHotelReviews(hotelId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'reviews', page, limit],
    queryFn: () => hotelsApi.getHotelReviews(hotelId, page, limit),
    enabled: !!hotelId,
  })
}

export function useCanReview(hotelId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['hotels', hotelId, 'can-review'],
    queryFn: () => hotelsApi.canUserReview(hotelId),
    enabled: !!hotelId && enabled,
  })
}

export function useCreateReview(hotelId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      hotelsApi.createReview(hotelId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'reviews'] })
      queryClient.invalidateQueries({ queryKey: ['hotels', hotelId, 'can-review'] })
      queryClient.invalidateQueries({ queryKey: ['hotels', hotelId] })
    },
  })
}
