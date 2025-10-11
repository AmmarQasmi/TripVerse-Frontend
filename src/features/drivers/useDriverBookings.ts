import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { carBookingsApi } from '@/lib/api/carBookings.api'

export function useDriverCarBookings() {
  const queryClient = useQueryClient()

  const { data: bookings, isLoading } = useQuery({
    queryKey: ['driver-car-bookings'],
    queryFn: carBookingsApi.getDriverBookings,
  })

  const updateBookingStatus = useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: 'pending' | 'confirmed' | 'cancelled' | 'completed' }) =>
      carBookingsApi.update(bookingId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-car-bookings'] })
    },
  })

  return {
    bookings,
    isLoading,
    updateBookingStatus: updateBookingStatus.mutateAsync,
  }
}
