import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { paymentsApi } from '@/lib/api/payments.api'

export function usePaymentsAdmin() {
  const queryClient = useQueryClient()

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-payments-stats'],
    queryFn: paymentsApi.getAdminPaymentStats,
  })

  const { data: debts, isLoading: debtsLoading } = useQuery({
    queryKey: ['admin-payments-debts'],
    queryFn: () => paymentsApi.getAdminDebts('pending'),
  })

  const { data: auditTrail, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-payments-audit'],
    queryFn: paymentsApi.getAdminAuditTrail,
  })

  const enforceDebt = useMutation({
    mutationFn: (debtId: string) => paymentsApi.enforceDebt(debtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments-debts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments-audit'] })
    },
  })

  return {
    stats,
    debts: debts?.debts || [],
    auditTrail: auditTrail?.transactions || [],
    isLoading: statsLoading || debtsLoading || auditLoading,
    enforceDebt: enforceDebt.mutateAsync,
  }
}
