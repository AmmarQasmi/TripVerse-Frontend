import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { GeneratedItinerary, ItinerarySummary } from '@/types'

interface ApiWrapper<T> {
  success: boolean
  data: T
}

export const itinerariesApi = {
  /** List all saved itineraries for the current user */
  list: async (): Promise<ItinerarySummary[]> => {
    const res = await httpClient.get<ApiWrapper<ItinerarySummary[]>>(API_ENDPOINTS.ITINERARIES.BASE)
    return res.data
  },

  /** Get a single itinerary with full data */
  get: async (id: number): Promise<GeneratedItinerary> => {
    const res = await httpClient.get<ApiWrapper<GeneratedItinerary>>(API_ENDPOINTS.ITINERARIES.BY_ID(id))
    return res.data
  },

  /** Trigger enrichment pipeline (may take 30-90s for full enrichment) */
  enrich: async (id: number): Promise<GeneratedItinerary> => {
    const res = await httpClient.post<ApiWrapper<GeneratedItinerary>>(
      API_ENDPOINTS.ITINERARIES.ENRICH(id),
      {},
      { timeout: 120000 } // 2 minutes — enrichment calls multiple external APIs
    )
    return res.data
  },

  /** Delete an itinerary */
  delete: async (id: number): Promise<void> => {
    await httpClient.delete<ApiWrapper<unknown>>(API_ENDPOINTS.ITINERARIES.DELETE(id))
  },
}
