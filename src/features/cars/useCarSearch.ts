import { useQuery } from '@tanstack/react-query'
import { carsApi } from '@/lib/api/cars.api'
import { CarApiResponse, CarSearchParams } from '@/types'

export function useCarSearch(params: CarSearchParams) {
  // Only enable query if we have at least one search parameter or showing all cars
  const hasParams = !!(
    params.query || 
    params.city_id || 
    params.start_date || 
    params.end_date || 
    params.seats || 
    params.transmission || 
    params.fuel_type || 
    params.min_price || 
    params.max_price
  )
  
  return useQuery({
    queryKey: ['cars', 'search', params],
    queryFn: () => carsApi.search(params),
    enabled: hasParams || true, // Allow fetching even without location for "All" option
    select: (data: { data: CarApiResponse[] }) => data.data, // Extract the data array from the response
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCarById(id: string) {
  return useQuery<CarApiResponse>({
    queryKey: ['cars', id],
    queryFn: () => carsApi.getById(id),
    enabled: !!id,
  })
}

export function useCarPriceCalculation(carId: string, pickupLocation: string, dropoffLocation: string, startDate: string, endDate: string, estimatedDistance?: number) {
  return useQuery({
    queryKey: ['cars', 'price', carId, pickupLocation, dropoffLocation, startDate, endDate, estimatedDistance],
    queryFn: () => carsApi.calculatePrice(carId, pickupLocation, dropoffLocation, startDate, endDate, estimatedDistance),
    enabled: !!(carId && pickupLocation && dropoffLocation && startDate && endDate),
  })
}

export function useUserBookings(status?: string) {
  return useQuery({
    queryKey: ['cars', 'bookings', 'user', status],
    queryFn: () => carsApi.getUserBookings(status),
    enabled: true, // Always enabled to fetch bookings
  })
}

export function useDriverBookings(status?: string) {
  return useQuery({
    queryKey: ['cars', 'bookings', 'driver', status],
    queryFn: () => carsApi.getDriverBookings(status),
  })
}

export function useChatMessages(bookingId: number) {
  return useQuery({
    queryKey: ['cars', 'chat', bookingId],
    queryFn: () => carsApi.getChatMessages(bookingId),
    enabled: !!bookingId,
  })
}
