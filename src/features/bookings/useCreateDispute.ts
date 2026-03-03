import { useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'

export type DisputeCategory = 'service' | 'pricing' | 'cleanliness' | 'safety' | 'fraud'

export interface CreateDisputeInput {
  booking_hotel_id?: number
  booking_car_id?: number
  category: DisputeCategory
  description: string
  incident_at?: string
  evidence?: File[]
}

export function useCreateDispute() {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: CreateDisputeInput) => adminApi.createDispute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
      queryClient.invalidateQueries({ queryKey: ['client-disputes'] })
    },
  })

  return {
    createDispute: mutation.mutateAsync,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  }
}
