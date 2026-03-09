import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Hotel, HotelSearchParams } from '@/types'

export const hotelsApi = {
  getAll: async () => {
    return httpClient.get<Hotel[]>(API_ENDPOINTS.HOTELS.BASE)
  },

  getById: async (id: string) => {
    const response = await httpClient.get<any>(API_ENDPOINTS.HOTELS.BY_ID(id))
    const hotel = response.data || response
    return hotel as Hotel
  },

  search: async (params: HotelSearchParams) => {
    const searchParams = new URLSearchParams()
    
    // Map frontend params to backend search endpoint params
    if (params.location && params.location !== '') {
      searchParams.append('city', params.location)
    }
    
    if (params.checkIn) {
      searchParams.append('checkin', params.checkIn)
    }
    
    if (params.checkOut) {
      searchParams.append('checkout', params.checkOut)
    }
    
    if (params.guests !== undefined && params.guests > 0) {
      searchParams.append('guests', params.guests.toString())
    }
    
    if (params.rooms !== undefined && params.rooms > 0) {
      searchParams.append('rooms', params.rooms.toString())
    }

    if (params.minPrice !== undefined) {
      searchParams.append('minPrice', params.minPrice.toString())
    }
    
    if (params.maxPrice !== undefined) {
      searchParams.append('maxPrice', params.maxPrice.toString())
    }
    
    if (params.starRating && params.starRating.length > 0) {
      searchParams.append('starRating', params.starRating.join(','))
    }
    
    if (params.amenities && params.amenities.length > 0) {
      searchParams.append('amenities', params.amenities.join(','))
    }
    
    // Use the dedicated search endpoint
    const queryStr = searchParams.toString()
    const url = queryStr 
      ? `${API_ENDPOINTS.HOTELS.SEARCH}?${queryStr}` 
      : API_ENDPOINTS.HOTELS.SEARCH
    
    const response = await httpClient.get<{
      data: Hotel[]
      total: number
      filters: {
        city: string | null
        region: string | null
        checkin: string | null
        checkout: string | null
        guests: number
        rooms: number
      }
    }>(url)
    
    return response.data || []
  },

  getAvailableCities: async () => {
    const response = await httpClient.get<Array<{
      id: number
      city: string
      region: string
      hotel_count: number
    }>>(API_ENDPOINTS.HOTELS.AVAILABLE_CITIES)
    return response
  },

  getPopularDestinations: async () => {
    const response = await httpClient.get<Array<{
      city: string
      region: string
      hotel_count: number
      starting_price: number
      avg_price: number
      total_bookings: number
    }>>(API_ENDPOINTS.HOTELS.POPULAR_DESTINATIONS)
    return response
  },

  getRegionsByCity: async (city: string) => {
    const response = await httpClient.get<Array<{
      region: string
      hotel_count: number
    }>>(API_ENDPOINTS.HOTELS.REGIONS_BY_CITY(city))
    return response
  },

  getHotelReviews: async (hotelId: string, page: number = 1, limit: number = 10) => {
    const response = await httpClient.get<{
      reviews: Array<{
        id: number
        rating: number
        comment: string | null
        created_at: string
        user: { id: number; name: string }
        verified_stay: boolean
      }>
      avg_rating: number
      total: number
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`${API_ENDPOINTS.HOTELS.REVIEWS(hotelId)}?page=${page}&limit=${limit}`)
    return response
  },

  canUserReview: async (hotelId: string) => {
    const response = await httpClient.get<{
      can_review: boolean
      reason?: string
    }>(API_ENDPOINTS.HOTELS.CAN_REVIEW(hotelId))
    return response
  },

  createReview: async (hotelId: string, data: { rating: number; comment?: string }) => {
    const response = await httpClient.post<{
      id: number
      rating: number
      comment: string | null
      created_at: string
      user: { id: number; name: string }
      verified_stay: boolean
    }>(API_ENDPOINTS.HOTELS.REVIEWS(hotelId), data)
    return response
  },

  checkRoomAvailability: async (hotelId: string, checkin: string, checkout: string) => {
    const searchParams = new URLSearchParams({ checkin, checkout })
    const response = await httpClient.get<{
      hotelId: string
      hotelName: string
      location: string
      region: string
      checkin: string
      checkout: string
      roomTypes: Array<{
        id: string
        name: string
        description: string | null
        capacity: number
        pricePerNight: number
        totalPrice: number
        nights: number
        totalRooms: number
        bookedRooms: number
        availableRooms: number
        isAvailable: boolean
        amenities: string[]
        images: string[]
      }>
      hasAvailability: boolean
    }>(API_ENDPOINTS.HOTELS.ROOM_AVAILABILITY(hotelId) + `?${searchParams.toString()}`)
    return response
  },

  create: async (hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>) => {
    return httpClient.post<{
      id: number
      name: string
      message: string
    }>(API_ENDPOINTS.HOTELS.CREATE, hotel)
  },

  update: async (id: string, hotel: Partial<Hotel>) => {
    return httpClient.patch<Hotel>(API_ENDPOINTS.HOTELS.UPDATE(id), hotel)
  },

  delete: async (id: string) => {
    return httpClient.delete(API_ENDPOINTS.HOTELS.DELETE(id))
  },

  uploadImages: async (hotelId: string, files: File[]) => {
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
    }>(API_ENDPOINTS.HOTELS.UPLOAD_IMAGES(hotelId), formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteImage: async (hotelId: string, imageId: string) => {
    return httpClient.delete<{ message: string }>(
      API_ENDPOINTS.HOTELS.DELETE_IMAGE(hotelId, imageId)
    )
  },

  getOptimizedImages: async (hotelId: string) => {
    return httpClient.get<Array<{
      id: number
      original: string
      responsive: {
        thumbnail: string
        medium: string
        large: string
        original: string
      }
    }>>(API_ENDPOINTS.HOTELS.OPTIMIZED_IMAGES(hotelId))
  },

  // Hotel Manager endpoints
  getManagerHotels: async () => {
    return httpClient.get<Array<{
      id: string
      name: string
      description: string | null
      location: string
      address: string | null
      rating: number | null
      is_active: boolean
      is_listed: boolean
      images: string[]
      room_types_count: number
      total_bookings: number
      total_earnings: number
      created_at: string
      updated_at: string
    }>>(API_ENDPOINTS.HOTELS.MANAGER_HOTELS)
  },

  updateHotelAvailability: async (hotelId: string, data: { is_listed?: boolean }) => {
    return httpClient.patch<{
      id: number
      is_listed: boolean
      message: string
    }>(API_ENDPOINTS.HOTELS.UPDATE_AVAILABILITY(hotelId), data)
  },

  getHotelAvailability: async (hotelId: string) => {
    return httpClient.get<{
      hotel_id: number
      hotel_name: string
      is_listed: boolean
      room_availability: Array<{
        room_type_id: number
        room_type_name: string
        total_rooms: number
        booked_rooms: number
        available_rooms: number
      }>
    }>(API_ENDPOINTS.HOTELS.GET_AVAILABILITY(hotelId))
  },

  // Room type management
  addRoomType: async (hotelId: string, roomTypeData: {
    name: string
    description?: string
    max_occupancy: number
    base_price: number
    total_rooms: number
    amenities?: string[]
    images?: string[]
  }) => {
    return httpClient.post<{
      id: number
      name: string
      message: string
    }>(API_ENDPOINTS.HOTELS.ROOM_TYPES(hotelId), roomTypeData)
  },

  updateRoomType: async (hotelId: string, roomTypeId: string, roomTypeData: {
    name?: string
    description?: string
    max_occupancy?: number
    base_price?: number
    total_rooms?: number
    amenities?: string[]
    images?: string[]
  }) => {
    return httpClient.patch<{
      id: number
      name: string
      message: string
    }>(API_ENDPOINTS.HOTELS.ROOM_TYPE(hotelId, roomTypeId), roomTypeData)
  },

  deleteRoomType: async (hotelId: string, roomTypeId: string) => {
    return httpClient.delete<{
      message: string
    }>(API_ENDPOINTS.HOTELS.ROOM_TYPE(hotelId, roomTypeId))
  },

  // External hotels via Google Places API
  searchExternal: async (city: string) => {
    const response = await httpClient.get<{
      success: boolean
      data: ExternalHotel[]
      total: number
    }>(`${API_ENDPOINTS.HOTELS.EXTERNAL_SEARCH}?city=${encodeURIComponent(city)}`)
    return response
  },

  getExternalDetails: async (placeId: string) => {
    const response = await httpClient.get<{
      success: boolean
      data: ExternalHotelDetails
    }>(API_ENDPOINTS.HOTELS.EXTERNAL_DETAILS(placeId))
    return response
  },
}

export interface ExternalHotel {
  place_id: string
  name: string
  rating: number | null
  total_ratings: number
  address: string
  price_level: number | null
  business_status: string
  photos: string[]
  maps_url: string
}

export interface ExternalHotelDetails extends ExternalHotel {
  phone: string | null
  website: string | null
  redirect_url: string
  opening_hours: string[] | null
}
