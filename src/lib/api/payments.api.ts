import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Payment, CreatePaymentData } from '@/types'

export const paymentsApi = {
  getAll: async () => {
    return httpClient.get<Payment[]>(API_ENDPOINTS.PAYMENTS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<Payment>(API_ENDPOINTS.PAYMENTS.BY_ID(id))
  },

  create: async (payment: CreatePaymentData) => {
    return httpClient.post<Payment>(API_ENDPOINTS.PAYMENTS.CREATE, payment)
  },

  createStripeCheckout: async (bookingId: string, bookingType: 'hotel' | 'car') => {
    return httpClient.post<{ url: string }>(API_ENDPOINTS.PAYMENTS.STRIPE_CHECKOUT, {
      bookingId,
      bookingType,
    })
  },
}
