import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { hotelBookingsApi } from '@/lib/api/hotelBookings.api'
import { HotelBooking } from '@/types'

export function useHotelBooking() {
  const queryClient = useQueryClient()

  const createBooking = useMutation({
    mutationFn: hotelBookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] })
    },
  })

  return {
    createBooking,
  }
}

export function useUserHotelBookings() {
  return useQuery({
    queryKey: ['hotel-bookings', 'user'],
    queryFn: hotelBookingsApi.getUserBookings,
  })
}

export function useHotelBookingById(id: string) {
  return useQuery({
    queryKey: ['hotel-bookings', id],
    queryFn: () => hotelBookingsApi.getById(id),
    enabled: !!id,
  })
}
