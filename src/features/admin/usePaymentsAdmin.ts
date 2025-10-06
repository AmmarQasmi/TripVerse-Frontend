import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'

export function usePaymentsAdmin() {
  const queryClient = useQueryClient()

  const { data: payments, isLoading } = useQuery({
    queryKey: ['admin-payments'],
    queryFn: adminApi.getPayments,
  })

  const processRefund = useMutation({
    mutationFn: (paymentId: string) => adminApi.processRefund?.(paymentId) || Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments'] })
    },
  })

  return {
    payments,
    isLoading,
    processRefund: processRefund.mutateAsync,
  }
}
