'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { bookingsApi, CreateBookingWithPaymentRequest, BookingResponse } from '@/lib/api/bookings.api'

export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation<BookingResponse, Error, CreateBookingWithPaymentRequest>({
    mutationFn: (data) => bookingsApi.createWithPayment(data),
    onSuccess: () => {
      // Invalidate any booking-related queries
      queryClient.invalidateQueries({ queryKey: ['hotel-bookings'] })
      queryClient.invalidateQueries({ queryKey: ['room-availability'] })
    },
  })
}
