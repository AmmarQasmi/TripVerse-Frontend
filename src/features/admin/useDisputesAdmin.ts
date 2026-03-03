import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'

export function useDisputesAdmin() {
  const queryClient = useQueryClient()

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: adminApi.getDisputes,
  })

  const resolveDispute = useMutation({
    mutationFn: ({
      disputeId,
      resolution,
      fine_amount,
    }: {
      disputeId: string
      resolution: string
      fine_amount?: number
    }) => adminApi.resolveDispute(Number(disputeId), { resolution, fine_amount }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-disputes'] })
    },
  })

  return {
    disputes,
    isLoading,
    resolveDispute: resolveDispute.mutateAsync,
  }
}
