import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { User, Payment, Dispute } from '@/types'

export const adminApi = {
  getDashboard: async () => {
    return httpClient.get(API_ENDPOINTS.ADMIN.DASHBOARD)
  },

  getDrivers: async () => {
    return httpClient.get<User[]>(API_ENDPOINTS.ADMIN.DRIVERS)
  },

  verifyDriver: async (id: string) => {
    return httpClient.patch(API_ENDPOINTS.ADMIN.VERIFY_DRIVER(id))
  },

  rejectDriver: async (id: string) => {
    return httpClient.patch(`/admin/drivers/${id}/reject`)
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
