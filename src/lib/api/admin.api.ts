import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { Payment, Dispute } from '@/types'
import { Driver } from '@/types/api'

export interface AdminDashboardStats {
  drivers: {
    total: number
    verified: number
    pending: number
  }
  hotel_managers: {
    total: number
    verified: number
    pending: number
  }
  bookings: {
    today: number
    this_week: number
    this_month: number
    total: number
  }
  revenue: {
    total: number
    commission: number
    currency: string
  }
  disputes: {
    pending: number
  }
  recent_pending_drivers: Array<{
    id: number
    user: {
      id: number
      full_name: string
      email: string
      created_at: string
    }
    created_at: string
  }>
}

export interface DriverFilters {
  page?: number
  limit?: number
  is_verified?: boolean
  city_id?: number
  status?: string
}

export interface DriverListResponse {
  data: Driver[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface DisciplinaryAction {
  id: number
  driver_id: number
  action_type: 'warning' | 'suspension' | 'ban'
  dispute_count: number
  suspension_days?: number | null
  scheduled_start?: string | null
  scheduled_end?: string | null
  actual_start?: string | null
  actual_end?: string | null
  is_paused: boolean
  pause_reason?: string | null
  period_start: string
  period_end: string
  created_at: string
  period_dispute_count?: number
}

export interface DisputeFilters {
  page?: number
  limit?: number
  status?: 'pending' | 'resolved' | 'rejected'
  booking_type?: 'car' | 'hotel'
}

export interface SuspendDriverDto {
  reason: string
}

export interface BanDriverDto {
  reason: string
}

export interface ResolveDisputeDto {
  resolution: string
  refund_amount?: number
}

export interface DriverListResponse {
  data: Driver[]
  pagination: {
    page: number
    limit: number
    total: number
    total_pages: number
  }
}

export interface DisciplinaryAction {
  id: number
  driver_id: number
  action_type: 'warning' | 'suspension' | 'ban'
  dispute_count: number
  suspension_days?: number | null
  scheduled_start?: string | null
  scheduled_end?: string | null
  actual_start?: string | null
  actual_end?: string | null
  is_paused: boolean
  pause_reason?: string | null
  period_start: string
  period_end: string
  created_at: string
  period_dispute_count?: number
}

export const adminApi = {
  // Dashboard
  getDashboardStats: async (): Promise<AdminDashboardStats> => {
    return httpClient.get<AdminDashboardStats>(API_ENDPOINTS.ADMIN.DASHBOARD)
  },

  // Drivers
  getAllDrivers: async (filters?: DriverFilters): Promise<DriverListResponse> => {
    return httpClient.get<DriverListResponse>(API_ENDPOINTS.ADMIN.DRIVERS, { params: filters })
  },

  getDriverDetails: async (driverId: number): Promise<Driver> => {
    return httpClient.get<Driver>(API_ENDPOINTS.ADMIN.DRIVER_DETAILS(driverId.toString()))
  },

  verifyDriver: async (driverId: number, isVerified: boolean, notes?: string) => {
    return httpClient.put<{
      message: string
      driver: Driver
    }>(API_ENDPOINTS.ADMIN.VERIFY_DRIVER(driverId.toString()), {
      is_verified: isVerified,
      verification_notes: notes,
    })
  },

  suspendDriver: async (driverId: number, dto: SuspendDriverDto) => {
    return httpClient.patch<{
      message: string
      driver_id: number
    }>(API_ENDPOINTS.ADMIN.SUSPEND_DRIVER(driverId.toString()), dto)
  },

  banDriver: async (driverId: number, dto: BanDriverDto) => {
    return httpClient.patch<{
      message: string
      driver_id: number
    }>(API_ENDPOINTS.ADMIN.BAN_DRIVER(driverId.toString()), dto)
  },

  // Payments
  getAllPayments: async (filters?: { page?: number; limit?: number; status?: string; user_id?: number }) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.PAYMENTS, { params: filters })
  },

  getPaymentDetails: async (paymentId: number) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.PAYMENT_DETAILS(paymentId.toString()))
  },

  // Disputes
  getAllDisputes: async (filters?: DisputeFilters) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.DISPUTES, { params: filters })
  },

  getDisputeDetails: async (disputeId: number) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.DISPUTE_DETAILS(disputeId.toString()))
  },

  createDispute: async (data: {
    booking_hotel_id?: number
    booking_car_id?: number
    raised_by?: 'client' | 'driver' | 'admin'
    category: 'service' | 'pricing' | 'cleanliness' | 'safety' | 'fraud'
    description: string
    incident_at?: string
    evidence?: File[]
  }) => {
    const { evidence, ...fields } = data

    // Use multipart/form-data when evidence files are included
    if (evidence && evidence.length > 0) {
      const form = new FormData()
      Object.entries(fields).forEach(([key, val]) => {
        if (val !== undefined) form.append(key, String(val))
      })
      evidence.forEach((file) => form.append('evidence', file))
      return httpClient.post(API_ENDPOINTS.ADMIN.CREATE_DISPUTE, form)
    }

    return httpClient.post(API_ENDPOINTS.ADMIN.CREATE_DISPUTE, fields)
  },

  resolveDispute: async (disputeId: number, dto: ResolveDisputeDto) => {
    return httpClient.patch(API_ENDPOINTS.ADMIN.RESOLVE_DISPUTE(disputeId.toString()), dto)
  },

  // Reports
  getBookingStats: async (dateRange?: { from?: string; to?: string }) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.REPORTS.BOOKINGS, { params: dateRange })
  },

  getRevenueReport: async (dateRange?: { from?: string; to?: string }) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.REPORTS.REVENUE, { params: dateRange })
  },

  getDriverPerformanceStats: async () => {
    return httpClient.get(API_ENDPOINTS.ADMIN.REPORTS.DRIVERS)
  },

  // Users
  getAllUsers: async (filters?: { page?: number; limit?: number; role?: string; status?: string; city_id?: number }) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.USERS, { params: filters })
  },

  // Legacy methods for compatibility
  getDashboard: async () => {
    return adminApi.getDashboardStats()
  },

  getPendingDrivers: async (): Promise<Driver[]> => {
    return httpClient.get<Driver[]>(API_ENDPOINTS.ADMIN.DRIVERS_VERIFICATION.PENDING)
  },

  getVerifiedDrivers: async (): Promise<Driver[]> => {
    return httpClient.get<Driver[]>(API_ENDPOINTS.ADMIN.DRIVERS_VERIFICATION.VERIFIED)
  },

  getDriverById: async (driverId: number): Promise<Driver> => {
    return adminApi.getDriverDetails(driverId)
  },

  getDrivers: async () => {
    return adminApi.getPendingDrivers()
  },

  rejectDriver: async (id: string, reason: string) => {
    return adminApi.verifyDriver(Number(id), false, reason)
  },

  getPayments: async () => {
    const response = await adminApi.getAllPayments() as any
    return response?.data || response || []
  },

  processRefund: async (id: string) => {
    return httpClient.post(`/admin/payments/${id}/refund`)
  },

  getDisputes: async () => {
    const response = await adminApi.getAllDisputes() as any
    return response?.data || response || []
  },

  // Driver Disciplinary Actions
  getDriverDisciplinaryHistory: async (driverId: number): Promise<DisciplinaryAction[]> => {
    return httpClient.get<DisciplinaryAction[]>(`/admin/drivers/${driverId}/disciplinary-history`)
  },

  getDriversWithPendingSuspensions: async () => {
    return httpClient.get('/admin/drivers/pending-suspensions')
  },

  // Hotels
  getAllHotels: async (filters?: { page?: number; limit?: number; city_id?: number; is_listed?: boolean; is_active?: boolean; manager_id?: number }) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.HOTELS, { params: filters })
  },

  getHotelDetails: async (hotelId: number) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.HOTEL_DETAILS(hotelId.toString()))
  },

  updateHotel: async (hotelId: number, data: any) => {
    return httpClient.patch(API_ENDPOINTS.ADMIN.UPDATE_HOTEL(hotelId.toString()), data)
  },

  deleteHotel: async (hotelId: number) => {
    return httpClient.delete(API_ENDPOINTS.ADMIN.DELETE_HOTEL(hotelId.toString()))
  },

  // Hotel Managers
  getAllHotelManagers: async (filters?: { page?: number; limit?: number; is_verified?: boolean; city_id?: number }) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.HOTEL_MANAGERS, { params: filters })
  },

  getHotelManagerDetails: async (managerId: number) => {
    return httpClient.get(API_ENDPOINTS.ADMIN.HOTEL_MANAGER_DETAILS(managerId.toString()))
  },

  verifyHotelManager: async (managerId: number, isVerified: boolean, notes?: string) => {
    return httpClient.put(API_ENDPOINTS.ADMIN.VERIFY_HOTEL_MANAGER(managerId.toString()), {
      is_verified: isVerified,
      verification_notes: notes,
    })
  },

  getPendingHotelManagers: async () => {
    return httpClient.get(API_ENDPOINTS.ADMIN.PENDING_HOTEL_MANAGERS)
  },

  getVerifiedHotelManagers: async () => {
    return httpClient.get(API_ENDPOINTS.ADMIN.VERIFIED_HOTEL_MANAGERS)
  },
}
