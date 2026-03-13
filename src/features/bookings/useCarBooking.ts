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

export function useCanReviewDriver(bookingId: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['car-bookings', bookingId, 'can-review'],
    queryFn: () => carBookingsApi.canReviewDriver(bookingId),
    enabled: !!bookingId && enabled,
  })
}

export function useCreateDriverReview(bookingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { rating: number; comment?: string }) =>
      carBookingsApi.createDriverReview(bookingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['car-bookings', bookingId, 'can-review'] })
      queryClient.invalidateQueries({ queryKey: ['car-bookings', 'user'] })
    },
  })
}

export function useDriverReviews(driverId: string, page: number = 1, limit: number = 10) {
  return useQuery({
    queryKey: ['driver-reviews', driverId, page, limit],
    queryFn: () => carBookingsApi.getDriverReviews(driverId, page, limit),
    enabled: !!driverId,
  })
}
