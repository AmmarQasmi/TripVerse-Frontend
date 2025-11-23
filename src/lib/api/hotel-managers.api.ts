import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'

export type HotelManagerDocumentType = 'hotel_registration' | 'business_license' | 'tax_certificate'

export interface SubmitVerificationData {
  documents: Array<{
    document_type: HotelManagerDocumentType
    document_url: string
  }>
}

export interface HotelManagerProfile {
  id: number
  user: {
    id: number
    email: string
    full_name: string
    status: string
    city: {
      id: number
      name: string
      region: string
    }
  }
  is_verified: boolean
  verified_at: string | null
  verification_notes: string | null
  hotels: Array<{
    id: number
    name: string
    city: {
      id: number
      name: string
      region: string
    }
    images: Array<{
      id: number
      image_url: string
      display_order: number
    }>
  }>
  documents: Array<{
    id: number
    document_type: HotelManagerDocumentType
    document_url: string
    status: 'pending' | 'approved' | 'rejected'
    rejection_reason: string | null
    uploaded_at: string
    reviewed_at: string | null
  }>
}

export interface HotelManagerDashboard {
  verification_status: {
    is_verified: boolean
    verified_at: string | null
    has_rejected_documents?: boolean
  }
  stats: {
    total_hotels: number
    active_hotels: number
    total_bookings: number
    confirmed_bookings: number
    total_earnings: number
    rooms_available: number
    rooms_booked: number
  }
  recent_bookings: Array<{
    id: number
    status: string
    customer: {
      name: string
    }
    hotel: {
      name: string
    }
    room_type: string
    check_in: string
    check_out: string
    total_amount: number
    created_at: string
  }>
}

export interface HotelManagerEarnings {
  total_earnings: number
  total_bookings: number
  currency: string
  bookings: Array<{
    id: number
    customer_name: string
    hotel: string
    room_type: string
    total_amount: number
    manager_earnings: number
    created_at: string
  }>
}

export interface HotelManagerEarningsBreakdown {
  by_month: Array<{
    month: string
    earnings: number
  }>
  by_hotel: Array<{
    hotel: string
    earnings: number
  }>
}

export interface HotelManagerDocument {
  id: number
  document_type: HotelManagerDocumentType
  document_url: string
  public_id: string | null
  status: 'pending' | 'approved' | 'rejected'
  rejection_reason: string | null
  uploaded_at: string
  reviewed_at: string | null
}

export const hotelManagersApi = {
  getProfile: async (): Promise<HotelManagerProfile> => {
    return httpClient.get<HotelManagerProfile>(API_ENDPOINTS.HOTEL_MANAGERS.PROFILE)
  },

  getDashboard: async (): Promise<HotelManagerDashboard> => {
    return httpClient.get<HotelManagerDashboard>(API_ENDPOINTS.HOTEL_MANAGERS.DASHBOARD)
  },

  getEarnings: async (dateFrom?: string, dateTo?: string): Promise<HotelManagerEarnings> => {
    const config: any = {}
    if (dateFrom) config.params = { ...config.params, dateFrom }
    if (dateTo) config.params = { ...config.params, dateTo }
    return httpClient.get<HotelManagerEarnings>(API_ENDPOINTS.HOTEL_MANAGERS.EARNINGS, config)
  },

  getEarningsBreakdown: async (): Promise<HotelManagerEarningsBreakdown> => {
    return httpClient.get<HotelManagerEarningsBreakdown>(API_ENDPOINTS.HOTEL_MANAGERS.EARNINGS_BREAKDOWN)
  },

  uploadDocument: async (file: File, documentType: HotelManagerDocumentType) => {
    const formData = new FormData()
    formData.append('document', file)

    return httpClient.post<{
      message: string
      document: HotelManagerDocument
    }>(`${API_ENDPOINTS.HOTEL_MANAGERS.UPLOAD_DOCUMENT}?documentType=${documentType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteDocument: async (documentId: number) => {
    return httpClient.delete<{ message: string }>(
      API_ENDPOINTS.HOTEL_MANAGERS.DELETE_DOCUMENT(documentId.toString())
    )
  },

  submitVerification: async (data: SubmitVerificationData) => {
    return httpClient.post<{
      message: string
      hotel_manager_id: number
    }>(API_ENDPOINTS.HOTEL_MANAGERS.SUBMIT_VERIFICATION, data)
  },
}

