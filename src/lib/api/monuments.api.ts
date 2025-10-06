import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Monument, MonumentSearchParams } from '@/types'

export const monumentsApi = {
  getAll: async () => {
    return httpClient.get<Monument[]>(API_ENDPOINTS.MONUMENTS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<Monument>(API_ENDPOINTS.MONUMENTS.BY_ID(id))
  },

  search: async (params: MonumentSearchParams) => {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString())
      }
    })

    return httpClient.get<Monument[]>(
      `${API_ENDPOINTS.MONUMENTS.SEARCH}?${searchParams.toString()}`
    )
  },

  recognize: async (imageFile: File) => {
    const formData = new FormData()
    formData.append('image', imageFile)

    return httpClient.post<{ monument: Monument; confidence: number }>(
      API_ENDPOINTS.MONUMENTS.RECOGNIZE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

  export: async (id: string, format: 'pdf' | 'html' | 'json') => {
    return httpClient.get<Blob>(`${API_ENDPOINTS.MONUMENTS.EXPORT(id)}?format=${format}`, {
      responseType: 'blob',
    })
  },

  checkCache: async (imageHash: string) => {
    return httpClient.get<{ monument?: Monument; exists: boolean }>(
      `${API_ENDPOINTS.MONUMENTS.CACHE}?hash=${imageHash}`
    )
  },

  create: async (monument: Omit<Monument, 'id' | 'createdAt' | 'updatedAt'>) => {
    return httpClient.post<Monument>(API_ENDPOINTS.MONUMENTS.CREATE, monument)
  },

  update: async (id: string, monument: Partial<Monument>) => {
    return httpClient.put<Monument>(API_ENDPOINTS.MONUMENTS.UPDATE(id), monument)
  },

  delete: async (id: string) => {
    return httpClient.delete(API_ENDPOINTS.MONUMENTS.DELETE(id))
  },
}
