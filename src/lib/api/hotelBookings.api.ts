import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { HotelBooking, CreateHotelBookingData } from '@/types'

export const hotelBookingsApi = {
  getAll: async () => {
    return httpClient.get<HotelBooking[]>(API_ENDPOINTS.HOTEL_BOOKINGS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<HotelBooking>(API_ENDPOINTS.HOTEL_BOOKINGS.BY_ID(id))
  },

  getUserBookings: async () => {
    return httpClient.get<HotelBooking[]>(API_ENDPOINTS.HOTEL_BOOKINGS.USER)
  },

  getDriverBookings: async () => {
    return httpClient.get<HotelBooking[]>(API_ENDPOINTS.HOTEL_BOOKINGS.DRIVER)
  },

  create: async (booking: CreateHotelBookingData) => {
    return httpClient.post<HotelBooking>(API_ENDPOINTS.HOTEL_BOOKINGS.CREATE, booking)
  },

  update: async (id: string, booking: Partial<HotelBooking>) => {
    return httpClient.put<HotelBooking>(API_ENDPOINTS.HOTEL_BOOKINGS.UPDATE(id), booking)
  },

  cancel: async (id: string) => {
    return httpClient.patch(API_ENDPOINTS.HOTEL_BOOKINGS.CANCEL(id))
  },
}
