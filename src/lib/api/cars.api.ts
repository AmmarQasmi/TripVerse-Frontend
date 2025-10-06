import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Car, CarSearchParams } from '@/types'

export const carsApi = {
  getAll: async () => {
    return httpClient.get<Car[]>(API_ENDPOINTS.CARS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<Car>(API_ENDPOINTS.CARS.BY_ID(id))
  },

  search: async (params: CarSearchParams) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return httpClient.get<Car[]>(
      `${API_ENDPOINTS.CARS.SEARCH}?${searchParams.toString()}`
    )
  },

  getAvailable: async (startDate: string, endDate: string, location?: string) => {
    const searchParams = new URLSearchParams({
      startDate,
      endDate,
    })
    
    if (location) {
      searchParams.append('location', location)
    }

    return httpClient.get<Car[]>(
      `${API_ENDPOINTS.CARS.AVAILABLE}?${searchParams.toString()}`
    )
  },

  create: async (car: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>) => {
    return httpClient.post<Car>(API_ENDPOINTS.CARS.CREATE, car)
  },

  update: async (id: string, car: Partial<Car>) => {
    return httpClient.put<Car>(API_ENDPOINTS.CARS.UPDATE(id), car)
  },

  delete: async (id: string) => {
    return httpClient.delete(API_ENDPOINTS.CARS.DELETE(id))
  },
}
