import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Hotel, HotelSearchParams } from '@/types'

export const hotelsApi = {
  getAll: async () => {
    return httpClient.get<Hotel[]>(API_ENDPOINTS.HOTELS.BASE)
  },

  getById: async (id: string) => {
    const response = await httpClient.get<any>(API_ENDPOINTS.HOTELS.BY_ID(id))
    // Backend returns hotel object directly, but check if wrapped in data property
    const hotel = response.data || response
    console.log('API Response for hotel:', hotel)
    console.log('Images in API response:', hotel?.images)
    return hotel as Hotel
  },

  search: async (params: HotelSearchParams) => {
    const searchParams = new URLSearchParams()
    
    // Map frontend params to backend params
    // Note: Backend expects city_id, but we're passing location (region name)
    // For now, we'll fetch all hotels and filter by region on frontend if needed
    // TODO: Add city lookup by region name to get city_id
    
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
    
    // Use BASE endpoint (GET /hotels) which supports search params
    const response = await httpClient.get<{
      data: Hotel[]
      pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
      }
    }>(`${API_ENDPOINTS.HOTELS.BASE}?${searchParams.toString()}`)
    
    // Filter by location (region) on frontend if provided
    let filteredData = response.data || []
    if (params.location && params.location !== '') {
      filteredData = filteredData.filter((hotel: Hotel) => 
        hotel.location?.toLowerCase().includes(params.location!.toLowerCase())
      )
    }
    
    return filteredData
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
}
