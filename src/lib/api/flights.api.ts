import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Flight, FlightSearchParams, DuffelBookingLink } from '@/types'

export const flightsApi = {
  /**
   * Search for flights
   */
  search: async (params: FlightSearchParams) => {
    const searchParams = new URLSearchParams()
    
    // Required parameters
    if (params.origin) searchParams.append('origin', params.origin)
    if (params.destination) searchParams.append('destination', params.destination)
    if (params.departure_date) searchParams.append('departure_date', params.departure_date)
    
    // Optional parameters
    if (params.return_date) searchParams.append('return_date', params.return_date)
    if (params.adults) searchParams.append('adults', params.adults.toString())
    if (params.children) searchParams.append('children', params.children.toString())
    if (params.infants) searchParams.append('infants', params.infants.toString())
    if (params.cabin_class) searchParams.append('cabin_class', params.cabin_class)

    return httpClient.get<{
      data: Flight[]
      offer_request_id: string
      total: number
    }>(`${API_ENDPOINTS.FLIGHTS.SEARCH}?${searchParams.toString()}`)
  },

  /**
   * Create a Duffel booking link
   */
  createBookingLink: async (offerId: string, sessionData?: {
    reference?: string
    success_url?: string
    failure_url?: string
    abandonment_url?: string
  }) => {
    return httpClient.post<DuffelBookingLink>(
      API_ENDPOINTS.FLIGHTS.CREATE_BOOKING_LINK,
      {
        offer_id: offerId,
        ...sessionData,
      }
    )
  },
}

