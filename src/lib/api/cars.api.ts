import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Car, CarSearchParams, CarApiResponse } from '@/types'
import { DriverBooking } from '@/types/api'

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
    if (params.fuel_type) searchParams.append('fuel_type', params.fuel_type)
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
    const body: any = {
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
      start_date: startDate,
      end_date: endDate,
    }
    // Only include estimated_distance if provided (backend will calculate automatically if not provided)
    if (estimatedDistance) {
      body.estimated_distance = estimatedDistance
    }
    
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
    }>(`/cars/${carId}/calculate-price`, body)
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
  getDriverBookings: async (status?: string): Promise<DriverBooking[]> => {
    const params = status ? `?status=${status}` : ''
    return httpClient.get<DriverBooking[]>(`${API_ENDPOINTS.CARS.BOOKINGS.DRIVER_BOOKINGS}${params}`)
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

  // Mark all unread messages in a chat as read
  markMessagesAsRead: async (bookingId: number) => {
    return httpClient.patch<{
      message: string
      marked_count: number
    }>(`/cars/bookings/${bookingId}/chat/read`)
  },

  // Upload car images
  uploadCarImages: async (carId: string, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => {
      formData.append('images', file)
    })

    return httpClient.post<{
      message: string
      images: Array<{
        url: string
        public_id: string
      }>
    }>(API_ENDPOINTS.CARS.UPLOAD_IMAGES(carId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Delete car image
  deleteCarImage: async (carId: string, imageId: string) => {
    return httpClient.delete<{ message: string }>(
      API_ENDPOINTS.CARS.DELETE_IMAGE(carId, imageId)
    )
  },

  // Get optimized car images
  getOptimizedCarImages: async (carId: string) => {
    return httpClient.get<Array<{
      id: number
      original: string
      responsive: {
        thumbnail: string
        medium: string
        large: string
        original: string
      }
    }>>(API_ENDPOINTS.CARS.OPTIMIZED_IMAGES(carId))
  },

  // Get driver's cars
  getDriverCars: async () => {
    return httpClient.get<{
      data: Array<{
        id: string
        car: {
          make: string
          model: string
          year: number
          seats: number
          transmission: string
          fuel_type: string
          color: string
          license_plate: string
        }
        pricing: {
          base_price_per_day: number
          distance_rate_per_km: number
        }
        images: string[]
        is_active: boolean
        booking_stats: {
          total_bookings: number
          active_bookings: number
          total_earnings: number
        }
        created_at: string
      }>
      driver: {
        id: string
        is_verified: boolean
      }
    }>(API_ENDPOINTS.CARS.DRIVER_CARS)
  },

  // Create car (Driver)
  create: async (data: {
    make: string
    model: string
    seats: number
    base_price_per_day: number
    distance_rate_per_km: number
    transmission: string
    fuel_type: string
    year: number
    color?: string
    license_plate?: string
    images?: string[]
  }) => {
    return httpClient.post<{
      id: string
      message: string
      car: {
        make: string
        model: string
        year: number
        seats: number
      }
    }>(API_ENDPOINTS.CARS.DRIVER_CARS, data)
  },

  // Update car availability
  updateCarAvailability: async (carId: string, data: { is_listed?: boolean }) => {
    return httpClient.patch<{
      id: number
      is_listed: boolean
      message: string
    }>(API_ENDPOINTS.CARS.UPDATE_AVAILABILITY(carId), data)
  },

  // Update car (Driver)
  update: async (carId: string, data: {
    make?: string
    model?: string
    seats?: number
    base_price_per_day?: number
    distance_rate_per_km?: number
    transmission?: string
    fuel_type?: string
    year?: number
    color?: string
    license_plate?: string
  }) => {
    return httpClient.patch<{
      id: string
      message: string
    }>(API_ENDPOINTS.CARS.UPDATE(carId), data)
  },
}
