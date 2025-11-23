import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Driver, DriverDocument, DriverRating, DocumentType } from '@/types/api'

export type { DocumentType }

export interface SubmitVerificationData {
  documents: Array<{
    document_type: DocumentType
    document_url: string
  }>
  ratings: Array<{
    platform: string
    rating: number
    screenshot_url?: string // Optional - at least one rating must have a screenshot
  }>
}

export interface DriverDashboard {
  verification_status: {
    is_verified: boolean
    verified_at: string | null
  }
  stats: {
    incoming_requests: number
    confirmed_bookings: number
    total_earnings: number
    car_listings_count: number
    active_cars_count: number
  }
  recent_bookings: Array<{
    id: number
    status: string
    customer: {
      name: string
    }
    car: {
      make: string
      model: string
    }
    start_date: string
    end_date: string
    driver_earnings: number
    created_at: string
  }>
}

export interface DriverEarnings {
  total_earnings: number
  total_completed_bookings: number
  currency: string
  bookings: Array<{
    id: number
    customer_name: string
    car: string
    driver_earnings: number
    completed_at: string | null
  }>
}

export interface DriverSuspensionStatus {
  is_suspended: boolean
  is_banned: boolean
  is_paused: boolean
  suspension_type?: 'warning' | 'suspension' | 'ban'
  dispute_count: number
  suspension_end_date?: string
  pause_reason?: string
  warning_sent: boolean
}

export const driversApi = {
  getProfile: async (): Promise<Driver> => {
    return httpClient.get<Driver>(API_ENDPOINTS.DRIVERS.PROFILE)
  },

  getDashboard: async (): Promise<DriverDashboard> => {
    return httpClient.get<DriverDashboard>(API_ENDPOINTS.DRIVERS.DASHBOARD)
  },

  getEarnings: async (dateFrom?: string, dateTo?: string): Promise<DriverEarnings> => {
    return httpClient.get<DriverEarnings>(API_ENDPOINTS.DRIVERS.EARNINGS, {
      params: { dateFrom, dateTo },
    })
  },

  getSuspensionStatus: async (): Promise<DriverSuspensionStatus> => {
    // This endpoint needs to be added to backend
    return httpClient.get<DriverSuspensionStatus>('/drivers/suspension-status')
  },

  uploadDocument: async (file: File, documentType: DocumentType) => {
    const formData = new FormData()
    formData.append('document', file)

    return httpClient.post<{
      message: string
      document: DriverDocument
    }>(`${API_ENDPOINTS.DRIVERS.UPLOAD_DOCUMENT}?documentType=${documentType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  deleteDocument: async (documentId: number) => {
    return httpClient.delete<{ message: string }>(
      API_ENDPOINTS.DRIVERS.DELETE_DOCUMENT(documentId.toString())
    )
  },

  submitVerification: async (data: SubmitVerificationData) => {
    return httpClient.post<{
      message: string
      driver: Driver
    }>(API_ENDPOINTS.DRIVERS.SUBMIT_VERIFICATION, data)
  },
}
