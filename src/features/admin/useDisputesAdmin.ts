import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'

export function useDisputesAdmin() {
  const queryClient = useQueryClient()

  const { data: disputes, isLoading } = useQuery({
    queryKey: ['admin-disputes'],
    queryFn: adminApi.getDisputes,
  })

  const resolveDispute = useMutation({
    mutationFn: ({ disputeId, resolution }: { disputeId: string; resolution: string }) =>
      adminApi.resolveDispute(disputeId, resolution),
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
