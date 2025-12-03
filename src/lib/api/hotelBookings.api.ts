import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { HotelBooking, CreateHotelBookingData } from '@/types'

export const hotelBookingsApi = {
  getAll: async () => {
    return httpClient.get<HotelBooking[]>(API_ENDPOINTS.HOTEL_BOOKINGS.BASE)
  },

  getById: async (id: string) => {
    const response = await httpClient.get<any>(API_ENDPOINTS.HOTEL_BOOKINGS.BY_ID(id))
    
    // Transform backend response (snake_case) to frontend format (camelCase)
    const transformed: HotelBooking = {
      id: response.id.toString(),
      hotelId: response.hotel?.id?.toString() || '',
      userId: response.user_id?.toString() || '',
      roomTypeId: response.room_type?.id?.toString() || '',
      checkInDate: response.dates?.check_in || response.check_in || '',
      checkOutDate: response.dates?.check_out || response.check_out || '',
      guests: response.room_type?.max_occupancy || 0,
      quantity: response.quantity || 1,
      totalAmount: response.pricing?.total_amount || response.total_amount || 0,
      currency: response.pricing?.currency || response.currency || 'PKR',
      status: response.status,
      createdAt: response.created_at || response.createdAt || new Date().toISOString(),
      updatedAt: response.updated_at || response.updatedAt || new Date().toISOString(),
      hotel: response.hotel ? {
        id: response.hotel.id?.toString() || '',
        name: response.hotel.name || '',
        address: response.hotel.address || '',
        location: response.hotel.city || response.hotel.location || '',
        description: response.hotel.description || '',
        rating: response.hotel.rating || null,
        pricePerNight: undefined,
        images: response.hotel.images || [],
        amenities: response.hotel.amenities || [],
        roomTypes: [],
        createdAt: '',
        updatedAt: '',
      } : undefined,
      roomType: response.room_type ? {
        id: response.room_type.id?.toString() || '',
        hotelId: response.hotel?.id?.toString() || '',
        name: response.room_type.name || '',
        description: response.room_type.description || '',
        capacity: response.room_type.max_occupancy || 0,
        pricePerNight: response.room_type.price_per_night || 0,
        amenities: response.room_type.amenities || [],
        images: response.room_type.images || [],
      } : undefined,
      booking_details: {
        hotel: response.hotel ? {
          id: response.hotel.id?.toString() || '',
          name: response.hotel.name || '',
          address: response.hotel.address || '',
          city: response.hotel.city || '',
        } : undefined,
        room_type: response.room_type ? {
          id: response.room_type.id?.toString() || '',
          name: response.room_type.name || '',
          max_occupancy: response.room_type.max_occupancy || 0,
          price_per_night: response.room_type.price_per_night || 0,
        } : undefined,
        dates: response.dates ? {
          check_in: response.dates.check_in || '',
          check_out: response.dates.check_out || '',
          nights: response.dates.nights || 0,
        } : undefined,
        pricing: response.pricing ? {
          base_price_per_night: response.pricing.base_price_per_night || 0,
          quantity: response.pricing.quantity || 1,
          nights: response.pricing.nights || 0,
          total_amount: response.pricing.total_amount || 0,
          currency: response.pricing.currency || 'PKR',
        } : undefined,
        guest_notes: response.guest_notes || null,
      },
    }
    
    return transformed
  },

  getUserBookings: async () => {
    return httpClient.get<HotelBooking[]>(API_ENDPOINTS.HOTEL_BOOKINGS.USER)
  },

  create: async (booking: CreateHotelBookingData | any) => {
    // Transform camelCase to snake_case for backend
    const backendData: any = {
      hotel_id: parseInt(booking.hotelId || booking.hotel_id),
      room_type_id: parseInt(booking.roomTypeId || booking.room_type_id),
      quantity: booking.rooms || booking.quantity || 1,
      check_in: booking.checkInDate || booking.check_in,
      check_out: booking.checkOutDate || booking.check_out,
    }
    // Include guest_notes if provided
    if (booking.guest_notes) {
      backendData.guest_notes = booking.guest_notes
    }
    return httpClient.post<HotelBooking>(API_ENDPOINTS.HOTEL_BOOKINGS.CREATE, backendData)
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
