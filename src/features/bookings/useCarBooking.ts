import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { carBookingsApi } from '@/lib/api/carBookings.api'

export function useCarBooking() {
  const queryClient = useQueryClient()

  const createBooking = useMutation({
    mutationFn: carBookingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-bookings'] })
    },
  })

  return {
    createBooking,
  }
}

export function useUserCarBookings() {
  return useQuery({
    queryKey: ['car-bookings', 'user'],
    queryFn: carBookingsApi.getUserBookings,
  })
}

export function useCarBookingById(id: string) {
  return useQuery({
    queryKey: ['car-bookings', id],
    queryFn: () => carBookingsApi.getById(id),
    enabled: !!id,
  })
}
