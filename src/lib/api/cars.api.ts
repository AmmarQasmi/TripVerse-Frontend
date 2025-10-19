import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Car, CarSearchParams, CarApiResponse } from '@/types'

export const carsApi = {
  // Search available cars
  search: async (params: CarSearchParams) => {
    const searchParams = new URLSearchParams()
    
    // Map frontend params to backend params
    if (params.location) searchParams.append('city_id', params.location)
    if (params.startDate) searchParams.append('start_date', params.startDate)
    if (params.endDate) searchParams.append('end_date', params.endDate)
    if (params.seats) searchParams.append('seats', params.seats.toString())
    if (params.type) searchParams.append('transmission', params.type)
    if (params.minPrice) searchParams.append('min_price', params.minPrice.toString())
    if (params.maxPrice) searchParams.append('max_price', params.maxPrice.toString())

    return httpClient.get<{
      data: CarApiResponse[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(`${API_ENDPOINTS.CARS.SEARCH}?${searchParams.toString()}`)
  },

  // Get car details by ID
  getById: async (id: string) => {
    return httpClient.get<CarApiResponse>(API_ENDPOINTS.CARS.BY_ID(id))
  },

  // Calculate price for a specific car and route
  calculatePrice: async (carId: string, pickupLocation: string, dropoffLocation: string, startDate: string, endDate: string, estimatedDistance?: number) => {
    return httpClient.post<{
      car_id: number
      driver_id: number
      pickup_location: string
      dropoff_location: string
      estimated_distance: number
      trip_duration_days: number
      pricing_breakdown: {
        base_price: number
        distance_price: number
        total_amount: number
        driver_earnings: number
        platform_fee: number
      }
    }>(`/cars/${carId}/calculate-price`, {
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      start_date: startDate,
      end_date: endDate,
      estimated_distance: estimatedDistance, // Customer provides distance for now
    })
  },

  // Create booking request
  createBookingRequest: async (data: {
    car_id: number
    pickup_location: string
    dropoff_location: string
    start_date: string
    end_date: string
    customer_notes?: string
  }) => {
    return httpClient.post<{
      id: number
      status: string
      message: string
      booking_details: {
        car: {
          make: string
          model: string
          year: number
        }
        driver: {
          name: string
        }
        pricing: {
          total_amount: number
          driver_earnings: number
          platform_fee: number
        }
      }
    }>('/cars/bookings/request', data)
  },

  // Driver responds to booking request
  respondToBooking: async (bookingId: number, response: 'accept' | 'reject', driverNotes?: string) => {
    return httpClient.post<{
      id: number
      status: string
      message: string
    }>(`/cars/bookings/${bookingId}/respond`, {
      response,
      driver_notes: driverNotes,
    })
  },

  // Confirm booking with payment
  confirmBooking: async (bookingId: number) => {
    return httpClient.post<{
      id: number
      status: string
      message: string
      payment_id: string
    }>(`/cars/bookings/${bookingId}/confirm`)
  },

  // Get user's bookings
  getUserBookings: async (status?: string) => {
    const params = status ? `?status=${status}` : ''
    return httpClient.get<Array<{
      id: number
      status: string
      car: {
        make: string
        model: string
        year: number
      }
      driver: {
        name: string
      }
      pickup_location: string
      dropoff_location: string
      start_date: string
      end_date: string
      total_amount: number
      created_at: string
    }>>(`/cars/bookings/my-bookings${params}`)
  },

  // Get driver's bookings
  getDriverBookings: async (status?: string) => {
    const params = status ? `?status=${status}` : ''
    return httpClient.get<Array<{
      id: number
      status: string
      customer: {
        name: string
      }
      car: {
        make: string
        model: string
        year: number
      }
      pickup_location: string
      dropoff_location: string
      start_date: string
      end_date: string
      driver_earnings: number
      created_at: string
    }>>(`/cars/bookings/driver-bookings${params}`)
  },

  // Start trip
  startTrip: async (bookingId: number) => {
    return httpClient.post<{
      id: number
      status: string
      message: string
    }>(`/cars/bookings/${bookingId}/start`)
  },

  // Complete trip
  completeTrip: async (bookingId: number) => {
    return httpClient.post<{
      id: number
      status: string
      message: string
    }>(`/cars/bookings/${bookingId}/complete`)
  },

  // Get chat messages
  getChatMessages: async (bookingId: number) => {
    return httpClient.get<{
      chat_id: number
      messages: Array<{
        id: number
        sender: {
          id: string
          name: string
        }
        message: string
        sent_at: string
        read_at?: string
      }>
    }>(`/cars/bookings/${bookingId}/chat`)
  },

  // Send message in chat
  sendMessage: async (bookingId: number, message: string) => {
    return httpClient.post<{
      id: number
      sender: {
        id: string
        name: string
      }
      message: string
      sent_at: string
    }>(`/cars/bookings/${bookingId}/chat/messages`, { message })
  },
}
