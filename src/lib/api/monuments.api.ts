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

    return httpClient.post<{
      id: number
      name: string
      confidence: number
      imageUrl: string
      wikiSnippet?: string
      wikipediaUrl?: string
      coordinates?: { lat: number; lng: number }
      placeDetails?: any
      rawData?: any
      createdAt: string
    }>(
      API_ENDPOINTS.MONUMENTS.RECOGNIZE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    )
  },

  getMyRecognitions: async (page: number = 1, limit: number = 10) => {
    return httpClient.get<{
      recognitions: Array<{
        id: number
        name: string
        confidence: number
        imageUrl: string
        wikiSnippet?: string
        wikipediaUrl?: string
        coordinates?: { lat: number; lng: number }
        placeDetails?: any
        rawData?: any
        createdAt: string
      }>
      total: number
      page: number
      limit: number
    }>(`${API_ENDPOINTS.MONUMENTS.MY_RECOGNITIONS}?page=${page}&limit=${limit}`)
  },

  getReviews: async (id: string) => {
    return httpClient.get<{
      reviews?: Array<{
        author_name: string
        author_url?: string
        rating: number
        text: string
        time: number
        relative_time_description?: string
      }>
      rating?: number
      user_ratings_total?: number
      formatted_address?: string
      status: 'pending' | 'completed' | 'failed' | 'not_started'
    }>(API_ENDPOINTS.MONUMENTS.REVIEWS(id))
  },

  export: async (id: string, format: 'pdf' | 'html' | 'json' | 'docx') => {
    return httpClient.get<Blob>(`${API_ENDPOINTS.MONUMENTS.EXPORT(id)}?format=${format}`, {
      responseType: 'blob',
    })
  },

  exportPDF: async (id: string) => {
    return httpClient.post<{
      success: boolean
      message: string
      data: {
        exportId: number
        downloadUrl: string
        format: 'pdf'
        fileSize: number
      }
    }>(`/monuments/${id}/export/pdf`)
  },

  exportDOCX: async (id: string) => {
    return httpClient.post<{
      success: boolean
      message: string
      data: {
        exportId: number
        downloadUrl: string
        format: 'docx'
        fileSize: number
      }
    }>(`/monuments/${id}/export/docx`)
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
