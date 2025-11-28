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

  const confirmBooking = useMutation({
    mutationFn: (id: string) => hotelBookingsApi.confirm(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] })
    },
  })

  const cancelBooking = useMutation({
    mutationFn: (id: string) => hotelBookingsApi.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] })
    },
  })

  return {
    createBooking,
    confirmBooking,
    cancelBooking,
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
