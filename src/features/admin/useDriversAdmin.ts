import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'
import { Driver } from '@/types/api'

export function useDriversAdmin() {
  const queryClient = useQueryClient()

  const { data: pendingDrivers, isLoading: isLoadingPending } = useQuery<Driver[]>({
    queryKey: ['admin-drivers-pending'],
    queryFn: adminApi.getPendingDrivers,
  })

  const { data: verifiedDrivers, isLoading: isLoadingVerified } = useQuery<Driver[]>({
    queryKey: ['admin-drivers-verified'],
    queryFn: adminApi.getVerifiedDrivers,
  })

  const verifyDriver = useMutation({
    mutationFn: ({ driverId, isVerified, notes }: { driverId: number; isVerified: boolean; notes?: string }) =>
      adminApi.verifyDriver(driverId, isVerified, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-drivers-verified'] })
    },
  })

  const rejectDriver = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      adminApi.verifyDriver(id, false, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers-pending'] })
      queryClient.invalidateQueries({ queryKey: ['admin-drivers-verified'] })
    },
  })

  return {
    pendingDrivers: pendingDrivers || [],
    verifiedDrivers: verifiedDrivers || [],
    isLoading: isLoadingPending || isLoadingVerified,
    verifyDriver: verifyDriver.mutateAsync,
    rejectDriver: rejectDriver.mutateAsync,
  }
}
