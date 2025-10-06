import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/lib/api/admin.api'

export function useDriversAdmin() {
  const queryClient = useQueryClient()

  const { data: drivers, isLoading } = useQuery({
    queryKey: ['admin-drivers'],
    queryFn: adminApi.getDrivers,
  })

  const verifyDriver = useMutation({
    mutationFn: (driverId: string) => adminApi.verifyDriver(driverId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] })
    },
  })

  const rejectDriver = useMutation({
    mutationFn: (driverId: string) => adminApi.rejectDriver?.(driverId) || Promise.resolve(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] })
    },
  })

  return {
    drivers,
    isLoading,
    verifyDriver: verifyDriver.mutateAsync,
    rejectDriver: rejectDriver.mutateAsync,
  }
}
