import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Car, CarSearchParams, CarApiResponse, BookingType, PriceCalculationRequest, PriceCalculationResponse, DriverModeStatus } from '@/types'
import { DriverBooking } from '@/types/api'

export const carsApi = {
  // Autocomplete location suggestions
  autocompleteLocation: async (input: string, country?: string) => {
    const params = new URLSearchParams()
    params.append('input', input)
    if (country) params.append('country', country)
    return httpClient.get<{
      suggestions: Array<{
        place_id: string
        description: string
        structured_formatting: {
          main_text: string
          secondary_text: string
        }
      }>
    }>(`${API_ENDPOINTS.CARS.PLACES_AUTOCOMPLETE}?${params.toString()}`)
  },

  // Get popular cities with available drivers
  getPopularCities: async () => {
    return httpClient.get<Array<{
      city: string
      region: string
      available_drivers: number
    }>>(API_ENDPOINTS.CARS.CITIES_POPULAR)
  },

  // Explore city info (weather, places, facts)
  exploreCityInfo: async (cityName: string) => {
    return httpClient.get<{
      city: string
      weather: {
        temperature: number
        condition: string
        humidity: number
        windSpeed: number
        icon: string
        cityName: string
      } | null
      places_to_visit: Array<{
        name: string
        address: string
        rating: number
        photo: string | null
      }>
      restaurants: Array<{
        name: string
        address: string
        rating: number
        photo: string | null
      }>
      facts: string
      wiki_url: string
      thumbnail: string | null
      best_time_to_visit: string
    }>(API_ENDPOINTS.CARS.CITIES_EXPLORE(cityName))
  },

  // Search available cars
  search: async (params: CarSearchParams) => {
    const searchParams = new URLSearchParams()
    
    // Map frontend params to backend params
    if (params.query) searchParams.append('location_query', params.query)
    if (params.city_id) searchParams.append('city_id', params.city_id)
    if (params.location) searchParams.append('city_id', params.location)
    if (params.startDate) searchParams.append('start_date', params.startDate)
    if (params.endDate) searchParams.append('end_date', params.endDate)
    if (params.start_date) searchParams.append('start_date', params.start_date)
    if (params.end_date) searchParams.append('end_date', params.end_date)
    if (params.seats) searchParams.append('seats', params.seats.toString())
    if (params.type) searchParams.append('transmission', params.type)
    if (params.transmission) searchParams.append('transmission', params.transmission)
    if (params.fuel_type) searchParams.append('fuel_type', params.fuel_type)
    if (params.minPrice) searchParams.append('min_price', params.minPrice.toString())
    if (params.maxPrice) searchParams.append('max_price', params.maxPrice.toString())
    if (params.min_price) searchParams.append('min_price', params.min_price.toString())
    if (params.max_price) searchParams.append('max_price', params.max_price.toString())
    if (params.booking_type) searchParams.append('booking_type', params.booking_type)

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

  // Get unavailable dates or real-time availability for a car
  getUnavailableDates: async (carId: string, mode?: 'rental' | 'ride_hailing') => {
    const params = mode ? `?mode=${mode}` : ''
    return httpClient.get<{
      car_id: number
      mode: 'rental' | 'ride_hailing'
      // Rental mode response
      unavailable_dates?: string[]
      booking_ranges?: Array<{ start_date: string; end_date: string; status: string }>
      // Ride-hailing mode response
      driver_name?: string
      is_available?: boolean
      current_mode?: string
      available_for_ride_hailing?: boolean
      has_active_ride?: boolean
      active_ride?: {
        id: number
        pickup: string
        dropoff: string
        started_at: string
      } | null
      pending_requests?: number
    }>(`/cars/${carId}/unavailable-dates${params}`)
  },

  // Get car details by ID
  getById: async (id: string) => {
    return httpClient.get<CarApiResponse>(API_ENDPOINTS.CARS.BY_ID(id))
  },

  // Calculate price for a specific car and route (dual-mode support)
  calculatePrice: async (
    carId: string,
    pickupLocation: string,
    dropoffLocation: string,
    options?: {
      bookingType?: BookingType
      startDate?: string
      endDate?: string
      scheduledPickup?: string
      estimatedDistance?: number
    }
  ) => {
    const body: PriceCalculationRequest = {
      pickup_location: pickupLocation,
      dropoff_location: dropoffLocation,
    }
    
    if (options?.bookingType) {
      body.booking_type = options.bookingType
    }
    if (options?.startDate) {
      body.start_date = options.startDate
    }
    if (options?.endDate) {
      body.end_date = options.endDate
    }
    if (options?.scheduledPickup) {
      body.scheduled_pickup = options.scheduledPickup
    }
    if (options?.estimatedDistance) {
      body.estimated_distance = options.estimatedDistance
    }
    
    return httpClient.post<PriceCalculationResponse>(`/cars/${carId}/calculate-price`, body)
  },

  // Create booking request (dual-mode support)
  createBookingRequest: async (data: {
    car_id: number
    pickup_location: string
    dropoff_location: string
    booking_type?: BookingType      // Optional - auto-detected if not provided
    start_date?: string             // Required for RENTAL
    end_date?: string               // Required for RENTAL
    scheduled_pickup?: string       // Optional for RIDE_HAILING
    customer_notes?: string
    payment_method?: string
  }) => {
    return httpClient.post<{
      id: number
      status: string
      message: string
      booking_type: BookingType
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
          surge_multiplier?: number
        }
        // Ride-hailing specific
        estimated_duration?: number
        scheduled_pickup?: string
      }
    }>('/cars/bookings/request', data)
  },

  // Switch driver mode (offline/rental/ride_hailing)
  switchDriverMode: async (mode: 'offline' | 'rental' | 'ride_hailing') => {
    return httpClient.post<{
      success: boolean
      message: string
      mode: string
      updated_cars: number
    }>('/drivers/mode/switch', { mode })
  },

  // Get driver mode status
  getDriverModeStatus: async () => {
    return httpClient.get<DriverModeStatus>('/drivers/mode/status')
  },

  // Update car ride-hailing settings
  updateRideHailingSettings: async (carId: string, data: {
    base_fare?: number
    per_km_rate?: number
    per_minute_rate?: number
    minimum_fare?: number
    available_for_rental?: boolean
    available_for_ride_hailing?: boolean
  }) => {
    return httpClient.patch<{
      id: number
      message: string
    }>(`/cars/${carId}/ride-hailing-settings`, data)
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

  // Cancel a booking
  cancelBooking: async (bookingId: number) => {
    return httpClient.post<{
      message: string
      booking_id: number
    }>(`/cars/bookings/${bookingId}/cancel`)
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
        color?: string
        seats?: number
        transmission?: string
        fuel_type?: string
        license_plate?: string
        image?: string | null
      }
      driver: {
        id?: number
        name: string
        email?: string
        photo?: string | null
        city?: string | null
        isVerified?: boolean
      }
      pickup_location: string
      dropoff_location: string
      estimated_distance?: number | null
      start_date: string
      end_date: string
      total_amount: number
      driver_earnings?: number
      platform_fee?: number
      currency?: string
      customer_notes?: string | null
      driver_notes?: string | null
      requested_at?: string | null
      accepted_at?: string | null
      confirmed_at?: string | null
      started_at?: string | null
      completed_at?: string | null
      created_at: string
      payment?: {
        id: number
        status: string
        amount: number
      } | null
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

  // Collect cash payment (driver confirms cash collected after trip completion)
  collectCash: async (bookingId: number, collectedAmount: number) => {
    return httpClient.post<{
      message: string
      booking_id: number
      total_collected: number
      platform_fee_deducted: number
      your_earnings: number
      wallet_balance: number
    }>(`/cars/bookings/${bookingId}/collect-cash`, {
      collected_amount: collectedAmount,
    })
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
          // Ride-hailing pricing (optional - new feature)
          base_fare?: number
          per_km_rate?: number
          per_minute_rate?: number
          minimum_fare?: number
        }
        // Availability modes (optional - new feature)
        availability?: {
          available_for_rental?: boolean
          available_for_ride_hailing?: boolean
        }
        images: string[]
        is_active: boolean
        is_listed: boolean
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
