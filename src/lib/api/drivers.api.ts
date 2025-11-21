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

export const driversApi = {
  getProfile: async (): Promise<Driver> => {
    return httpClient.get<Driver>(API_ENDPOINTS.DRIVERS.PROFILE)
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

