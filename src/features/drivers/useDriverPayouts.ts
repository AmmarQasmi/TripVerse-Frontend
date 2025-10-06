import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { httpClient } from '@/lib/api/http'

interface Payout {
  id: string
  amount: number
  status: 'PENDING' | 'COMPLETED' | 'FAILED'
  createdAt: string
  processedAt?: string
  fee?: number
}

export function useDriverPayouts() {
  const queryClient = useQueryClient()

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['driver-payouts'],
    queryFn: () => httpClient.get<Payout[]>('/driver/payouts'),
  })

  const requestPayout = useMutation({
    mutationFn: (amount: number) => 
      httpClient.post('/driver/payouts/request', { amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-payouts'] })
    },
  })

  return {
    payouts,
    isLoading,
    requestPayout: requestPayout.mutateAsync,
  }
}
