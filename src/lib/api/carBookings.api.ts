import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { CarBooking, CreateCarBookingData } from '@/types'

export const carBookingsApi = {
  getAll: async () => {
    return httpClient.get<CarBooking[]>(API_ENDPOINTS.CAR_BOOKINGS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<CarBooking>(API_ENDPOINTS.CAR_BOOKINGS.BY_ID(id))
  },

  getUserBookings: async () => {
    return httpClient.get<CarBooking[]>(API_ENDPOINTS.CAR_BOOKINGS.USER)
  },

  getDriverBookings: async (status?: string) => {
    const config: any = {}
    if (status && typeof status === 'string' && status.trim() !== '') {
      config.params = { status: status.trim() }
    }
    return httpClient.get<CarBooking[]>(API_ENDPOINTS.CARS.BOOKINGS.DRIVER_BOOKINGS, config)
  },

  create: async (booking: CreateCarBookingData) => {
    return httpClient.post<CarBooking>(API_ENDPOINTS.CAR_BOOKINGS.CREATE, booking)
  },

  update: async (id: string, booking: Partial<CarBooking>) => {
    return httpClient.put<CarBooking>(API_ENDPOINTS.CAR_BOOKINGS.UPDATE(id), booking)
  },

  cancel: async (id: string) => {
    return httpClient.patch(API_ENDPOINTS.CAR_BOOKINGS.CANCEL(id))
  },
}
