import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Hotel, HotelSearchParams } from '@/types'

export const hotelsApi = {
  getAll: async () => {
    return httpClient.get<Hotel[]>(API_ENDPOINTS.HOTELS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<Hotel>(API_ENDPOINTS.HOTELS.BY_ID(id))
  },

  search: async (params: HotelSearchParams) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return httpClient.get<Hotel[]>(
      `${API_ENDPOINTS.HOTELS.SEARCH}?${searchParams.toString()}`
    )
  },

  create: async (hotel: Omit<Hotel, 'id' | 'createdAt' | 'updatedAt'>) => {
    return httpClient.post<Hotel>(API_ENDPOINTS.HOTELS.CREATE, hotel)
  },

  update: async (id: string, hotel: Partial<Hotel>) => {
    return httpClient.put<Hotel>(API_ENDPOINTS.HOTELS.UPDATE(id), hotel)
  },

  delete: async (id: string) => {
    return httpClient.delete(API_ENDPOINTS.HOTELS.DELETE(id))
  },
}
