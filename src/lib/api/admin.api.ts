import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Payment, Dispute } from '@/types'
import { Driver } from '@/types/api'

export const adminApi = {
  getDashboard: async () => {
    return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD)
  },

  getPendingDrivers: async (): Promise<Driver[]> => {
    return httpClient.get<Driver[]>(API_ENDPOINTS.DRIVERS.VERIFICATION.PENDING)
  },

  getVerifiedDrivers: async (): Promise<Driver[]> => {
    return httpClient.get<Driver[]>(API_ENDPOINTS.DRIVERS.VERIFICATION.VERIFIED)
  },

  getDriverById: async (driverId: number): Promise<Driver> => {
    // Try to find in pending first, then verified
    try {
      const pending = await httpClient.get<Driver[]>(API_ENDPOINTS.DRIVERS.VERIFICATION.PENDING)
      const driver = pending.find(d => d.id === driverId)
      if (driver) return driver
    } catch (e) {
      console.error('Error fetching pending drivers:', e)
    }
    
    try {
      const verified = await httpClient.get<Driver[]>(API_ENDPOINTS.DRIVERS.VERIFICATION.VERIFIED)
      const driver = verified.find(d => d.id === driverId)
      if (driver) return driver
    } catch (e) {
      console.error('Error fetching verified drivers:', e)
    }
    
    throw new Error(`Driver with ID ${driverId} not found`)
  },

  verifyDriver: async (driverId: number, isVerified: boolean, notes?: string) => {
    return httpClient.put<{
      message: string
      driver: Driver
    }>(API_ENDPOINTS.DRIVERS.VERIFICATION.VERIFY(driverId.toString()), {
      is_verified: isVerified,
      verification_notes: notes,
    })
  },

  // Legacy methods for compatibility
  getDrivers: async () => {
    return adminApi.getPendingDrivers()
  },

  rejectDriver: async (id: string, reason: string) => {
    return adminApi.verifyDriver(Number(id), false, reason)
  },

  getPayments: async () => {
    return httpClient.get<Payment[]>(API_ENDPOINTS.ADMIN.PAYMENTS)
  },

  processRefund: async (id: string) => {
    return httpClient.post(`/admin/payments/${id}/refund`)
  },

  getDisputes: async () => {
    return httpClient.get<Dispute[]>(API_ENDPOINTS.ADMIN.DISPUTES)
  },

  resolveDispute: async (id: string, resolution: string) => {
    return httpClient.patch(API_ENDPOINTS.ADMIN.RESOLVE_DISPUTE(id), {
      resolution,
    })
  },
}
