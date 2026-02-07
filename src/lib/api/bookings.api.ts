import { httpClient } from '@/lib/api/http'
import { API_ENDPOINTS } from '@/lib/api/endpoints'

export interface CreateBookingWithPaymentRequest {
  hotel_id: number
  room_type_id: number
  quantity: number
  check_in: string
  check_out: string
  guest_name?: string
  guest_email?: string
  guest_phone?: string
  special_requests?: string
  payment_method?: string
}

export interface BookingPricing {
  base_price_per_night: number
  quantity: number
  nights: number
  subtotal: number
  tax_amount: number
  tax_rate: number
  service_fee: number
  service_fee_rate: number
  total_amount: number
  currency: string
}

export interface BookingResponse {
  success: boolean
  message: string
  booking: {
    id: number
    status: string
    hotel: {
      id: number
      name: string
      address: string
      city: string
    }
    room_type: {
      id: number
      name: string
      max_occupancy: number
      price_per_night: number
    }
    dates: {
      check_in: string
      check_out: string
      nights: number
    }
    guest_info: {
      name: string | null
      email: string | null
      phone: string | null
      special_requests: string | null
    }
    pricing: BookingPricing
    payment: {
      id: number
      status: string
      method: string
    }
  }
  created_at: string
}

export const bookingsApi = {
  createWithPayment: async (data: CreateBookingWithPaymentRequest): Promise<BookingResponse> => {
    return httpClient.post<BookingResponse>(API_ENDPOINTS.HOTEL_BOOKINGS.CREATE_WITH_PAYMENT, data)
  },

  getUserBookings: async (status?: string) => {
    const url = status
      ? `${API_ENDPOINTS.HOTEL_BOOKINGS.USER}?status=${status}`
      : API_ENDPOINTS.HOTEL_BOOKINGS.USER
    return httpClient.get<any[]>(url)
  },

  cancelBooking: async (id: string) => {
    return httpClient.patch<any>(API_ENDPOINTS.HOTEL_BOOKINGS.CANCEL(id))
  },
}
