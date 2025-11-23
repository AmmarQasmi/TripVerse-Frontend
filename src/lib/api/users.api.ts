import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'

export interface UserProfile {
  id: number
  email: string
  full_name: string
  role: string
  status: string
  city_id: number
  created_at: string
  city: {
    id: number
    name: string
    region: string
  }
}

export interface UserSettings {
  notifications_enabled: boolean
  email_notifications_enabled: boolean
}

export interface UpdateProfileData {
  full_name?: string
  city_id?: number
}

export interface ChangePasswordData {
  current_password: string
  new_password: string
}

export interface ChangeEmailData {
  new_email: string
  password: string
}

export const usersApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await httpClient.get<{ user: UserProfile }>(API_ENDPOINTS.AUTH.ME)
    return response.user
  },

  updateProfile: async (data: UpdateProfileData): Promise<{ message: string; user: UserProfile }> => {
    return httpClient.put<{ message: string; user: UserProfile }>(API_ENDPOINTS.USERS.BASE + '/profile', data)
  },

  changePassword: async (data: ChangePasswordData): Promise<{ message: string }> => {
    return httpClient.patch<{ message: string }>(API_ENDPOINTS.USERS.BASE + '/password', data)
  },

  changeEmail: async (data: ChangeEmailData): Promise<{ message: string; user: UserProfile }> => {
    return httpClient.patch<{ message: string; user: UserProfile }>(API_ENDPOINTS.USERS.BASE + '/email', data)
  },

  getSettings: async (): Promise<UserSettings> => {
    return httpClient.get<UserSettings>(API_ENDPOINTS.USERS.BASE + '/settings')
  },

  updateSettings: async (data: Partial<UserSettings>): Promise<{ message: string; settings: UserSettings }> => {
    return httpClient.put<{ message: string; settings: UserSettings }>(API_ENDPOINTS.USERS.BASE + '/settings', data)
  },
}
