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

  const { data: driverDebts, isLoading: driverDebtsLoading } = useQuery({
    queryKey: ['admin-driver-debts'],
    queryFn: () => paymentsApi.getAdminDriverDebts('pending'),
  })

  const { data: hotelDebts, isLoading: hotelDebtsLoading } = useQuery({
    queryKey: ['admin-hotel-debts'],
    queryFn: () => paymentsApi.getAdminHotelDebts('pending'),
  })

  const { data: auditTrail, isLoading: auditLoading } = useQuery({
    queryKey: ['admin-payments-audit'],
    queryFn: paymentsApi.getAdminAuditTrail,
  })

  const enforceDebt = useMutation({
    mutationFn: (debtId: string) => paymentsApi.enforceDebt(debtId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-payments-debts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-driver-debts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-hotel-debts'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments-stats'] })
      queryClient.invalidateQueries({ queryKey: ['admin-payments-audit'] })
    },
  })

  const getDriverDebtDetail = (debtId: string) => paymentsApi.getAdminDriverDebtDetail(debtId)
  const getHotelDebtDetail = (transactionId: string) => paymentsApi.getAdminHotelDebtDetail(transactionId)

  return {
    stats,
    debts: debts?.debts || [],
    driverDebts: driverDebts?.debts || [],
    hotelDebts: hotelDebts?.debts || [],
    auditTrail: auditTrail?.transactions || [],
    isLoading: statsLoading || debtsLoading || driverDebtsLoading || hotelDebtsLoading || auditLoading,
    enforceDebt: enforceDebt.mutateAsync,
    getDriverDebtDetail,
    getHotelDebtDetail,
  }
}
