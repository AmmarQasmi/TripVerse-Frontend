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

  create: async (booking: CreateHotelBookingData) => {
    return httpClient.post<HotelBooking>(API_ENDPOINTS.HOTEL_BOOKINGS.CREATE, booking)
  },

  update: async (id: string, booking: Partial<HotelBooking>) => {
    return httpClient.put<HotelBooking>(API_ENDPOINTS.HOTEL_BOOKINGS.UPDATE(id), booking)
  },

  cancel: async (id: string) => {
    return httpClient.patch(API_ENDPOINTS.HOTEL_BOOKINGS.CANCEL(id))
  },

  confirm: async (id: string) => {
    return httpClient.post(API_ENDPOINTS.HOTEL_BOOKINGS.CONFIRM(id))
  },

  // Hotel Manager endpoints
  getManagerBookings: async (status?: string) => {
    const config: any = {}
    if (status && typeof status === 'string' && status !== 'all') {
      config.params = { status }
    }
    return httpClient.get<{
      data: Array<{
        id: number
        status: string
        hotel: {
          id: number
          name: string
          city: string
        }
        room_type: {
          id: number
          name: string
        }
        customer: {
          id: number
          name: string
          email: string
        }
        dates: {
          check_in: string
          check_out: string
          nights: number
        }
        quantity: number
        total_amount: number
        manager_earnings: number
        currency: string
        created_at: string
      }>
      total: number
    }>(API_ENDPOINTS.HOTEL_BOOKINGS.MANAGER_BOOKINGS, config)
  },

  getManagerStats: async (dateFrom?: string, dateTo?: string) => {
    const config: any = {}
    if (dateFrom) config.params = { ...config.params, dateFrom }
    if (dateTo) config.params = { ...config.params, dateTo }
    return httpClient.get<{
      total_bookings: number
      confirmed_bookings: number
      cancelled_bookings: number
      total_revenue: number
      manager_earnings: number
      average_booking_value: number
      bookings_by_hotel: Array<{
        hotel_id: number
        hotel_name: string
        count: number
        revenue: number
        manager_earnings: number
      }>
    }>(API_ENDPOINTS.HOTEL_BOOKINGS.MANAGER_STATS, config)
  },

  // Admin endpoints
  getAllForAdmin: async (filters?: { page?: number; limit?: number; status?: string; hotel_id?: number; user_id?: number }) => {
    return httpClient.get(API_ENDPOINTS.HOTEL_BOOKINGS.ADMIN_ALL, { params: filters })
  },
}
