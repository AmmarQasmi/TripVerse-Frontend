import { useQuery, useMutation, useQueryClient, QueryClient } from '@tanstack/react-query'
import { adminApi, AdminDashboardStats } from '@/lib/api/admin.api'
import { Driver } from '@/types/api'

// Shared admin query config
const ADMIN_QUERY_CONFIG = {
  staleTime: 60 * 1000, // 60 seconds
  gcTime: 5 * 60 * 1000, // 5 minutes
  refetchOnWindowFocus: false,
}

/**
 * Fetch dashboard statistics (single aggregated call)
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard-stats'],
    queryFn: () => adminApi.getDashboardStats(),
    ...ADMIN_QUERY_CONFIG,
  })
}

/**
 * Fetch all drivers with pagination and filtering
 */
export function useAdminDrivers(filters?: { page?: number; limit?: number; is_verified?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'drivers', filters],
    queryFn: () => adminApi.getAllDrivers(filters),
    ...ADMIN_QUERY_CONFIG,
    placeholderData: (previousData) => previousData, // Keep previous page visible while loading next
  })
}

/**
 * Fetch single driver details
 */
export function useAdminDriver(driverId: number) {
  return useQuery({
    queryKey: ['admin', 'driver', driverId],
    queryFn: () => adminApi.getDriverDetails(driverId),
    ...ADMIN_QUERY_CONFIG,
    enabled: !!driverId,
  })
}

/**
 * Fetch all hotel managers
 */
export function useAdminHotelManagers(filters?: { page?: number; limit?: number; is_verified?: boolean }) {
  return useQuery({
    queryKey: ['admin', 'hotel-managers', filters],
    queryFn: async () => {
      // Try getAllHotelManagers first, fallback to getAllUsers
      try {
        if (adminApi.getAllHotelManagers) {
          const response = await adminApi.getAllHotelManagers(filters)
          return (response as any)?.data || (Array.isArray(response) ? response : [])
        }
      } catch (error) {
        console.warn('getAllHotelManagers failed, falling back to getAllUsers')
      }
      // Fallback to getAllUsers
      const response = await adminApi.getAllUsers({ role: 'hotel_manager', ...filters } as any)
      return (response as any)?.data || (Array.isArray(response) ? response : [])
    },
    ...ADMIN_QUERY_CONFIG,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Fetch all disputes with filtering
 */
export function useAdminDisputes(filters?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'disputes', filters],
    queryFn: async () => {
      const response = await adminApi.getAllDisputes(filters as any)
      return (response as any)?.data || response
    },
    ...ADMIN_QUERY_CONFIG,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Fetch single dispute details
 */
export function useAdminDispute(disputeId: number) {
  return useQuery({
    queryKey: ['admin', 'dispute', disputeId],
    queryFn: () => adminApi.getDisputeDetails(disputeId),
    ...ADMIN_QUERY_CONFIG,
    enabled: !!disputeId,
  })
}

/**
 * Fetch all payments with filtering
 */
export function useAdminPayments(filters?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['admin', 'payments', filters],
    queryFn: () => adminApi.getAllPayments(filters),
    ...ADMIN_QUERY_CONFIG,
    placeholderData: (previousData) => previousData,
  })
}

/**
 * Verify driver (approve/reject)
 * Optimistic update: immediately update driver status in cache
 */
export function useVerifyDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ driverId, isVerified, notes }: { driverId: number; isVerified: boolean; notes?: string }) =>
      adminApi.verifyDriver(driverId, isVerified, notes),
    onMutate: async ({ driverId, isVerified, notes }) => {
      // Cancel ongoing queries to prevent race conditions
      await queryClient.cancelQueries({ queryKey: ['admin', 'drivers'] })

      // Snapshot previous data
      const previousDrivers = queryClient.getQueryData(['admin', 'drivers'])
      const previousDriver = queryClient.getQueryData(['admin', 'driver', driverId])

      // Optimistically update drivers list
      queryClient.setQueryData(['admin', 'drivers', {}], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((d: Driver) =>
            d.id === driverId
              ? { ...d, is_verified: isVerified, verification_notes: notes || null }
              : d
          ),
        }
      })

      // Optimistically update single driver
      if (previousDriver) {
        queryClient.setQueryData(['admin', 'driver', driverId], (old: any) => ({
          ...old,
          is_verified: isVerified,
          verification_notes: notes || null,
        }))
      }

      return { previousDrivers, previousDriver }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousDrivers) {
        queryClient.setQueryData(['admin', 'drivers'], context.previousDrivers)
      }
      if (context?.previousDriver) {
        queryClient.setQueryData(['admin', 'driver', _variables.driverId], context.previousDriver)
      }
    },
    onSettled: () => {
      // Revalidate fresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

/**
 * Suspend driver
 */
export function useSuspendDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ driverId, reason }: { driverId: number; reason: string }) =>
      adminApi.suspendDriver(driverId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

/**
 * Ban driver
 */
export function useBanDriver() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ driverId, reason }: { driverId: number; reason: string }) =>
      adminApi.banDriver(driverId, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'drivers'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

/**
 * Resolve dispute (approve/reject)
 * Optimistic update: immediately update dispute status in cache
 */
export function useResolveDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ disputeId, resolution, fine_amount }: { disputeId: number; resolution: string; fine_amount?: number }) =>
      adminApi.resolveDispute(disputeId, { resolution, fine_amount }),
    onMutate: async ({ disputeId, resolution, fine_amount }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['admin', 'disputes'] })

      // Snapshot previous data
      const previousDisputes = queryClient.getQueryData(['admin', 'disputes'])
      const previousDispute = queryClient.getQueryData(['admin', 'dispute', disputeId])

      // Optimistically update disputes list
      queryClient.setQueryData(['admin', 'disputes', {}], (old: any) => {
        if (!old?.data) return old
        return {
          ...old,
          data: old.data.map((d: any) =>
            d.id === disputeId
              ? { ...d, status: 'resolved', resolution, fine_amount }
              : d
          ),
        }
      })

      // Optimistically update single dispute
      if (previousDispute) {
        queryClient.setQueryData(['admin', 'dispute', disputeId], (old: any) => ({
          ...old,
          status: 'resolved',
          resolution,
          fine_amount,
        }))
      }

      return { previousDisputes, previousDispute }
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousDisputes) {
        queryClient.setQueryData(['admin', 'disputes'], context.previousDisputes)
      }
      if (context?.previousDispute) {
        queryClient.setQueryData(['admin', 'dispute', _variables.disputeId], context.previousDispute)
      }
    },
    onSettled: () => {
      // Revalidate fresh data
      queryClient.invalidateQueries({ queryKey: ['admin', 'disputes'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard-stats'] })
    },
  })
}

/**
 * Prefetch all dashboard data in parallel
 * Call this in dashboard useEffect on mount
 */
export async function prefetchDashboardData(queryClient: QueryClient) {
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ['admin', 'dashboard-stats'],
      queryFn: () => adminApi.getDashboardStats(),
      staleTime: ADMIN_QUERY_CONFIG.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: ['admin', 'drivers', { page: 1, limit: 20 }],
      queryFn: () => adminApi.getAllDrivers({ page: 1, limit: 20 }),
      staleTime: ADMIN_QUERY_CONFIG.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: ['admin', 'hotel-managers', { page: 1, limit: 20 }],
      queryFn: async () => adminApi.getAllUsers({ role: 'hotel_manager', page: 1, limit: 20 } as any),
      staleTime: ADMIN_QUERY_CONFIG.staleTime,
    }),
    queryClient.prefetchQuery({
      queryKey: ['admin', 'disputes', { page: 1, limit: 20 }],
      queryFn: () => adminApi.getAllDisputes({ page: 1, limit: 20 } as any),
      staleTime: ADMIN_QUERY_CONFIG.staleTime,
    }),
  ])
}
