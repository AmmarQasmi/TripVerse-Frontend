import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { User, LoginCredentials, RegisterData } from '@/types'

export const authApi = {
  login: async (credentials: LoginCredentials) => {
    return httpClient.post<{ user: User; token: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
  },

  register: async (data: RegisterData) => {
    return httpClient.post<{ user: User; token: string }>(
      API_ENDPOINTS.AUTH.REGISTER,
      data
    )
  },

  logout: async () => {
    return httpClient.post(API_ENDPOINTS.AUTH.LOGOUT)
  },

  getProfile: async () => {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.PROFILE)
  },

  refreshToken: async () => {
    return httpClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH)
  },
}
