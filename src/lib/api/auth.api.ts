import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { User, LoginCredentials, RegisterData, City } from '@/types'

export const authApi = {
  // Login - cookie is automatically set by backend
  login: async (credentials: LoginCredentials): Promise<{ user: User; message: string }> => {
    const response = await httpClient.post<{ user: User; message: string }>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    // NO localStorage manipulation!
    // The JWT token is stored in an httpOnly cookie by the backend
    // The browser automatically saves and sends it with every request
    return response
  },

  // Signup - cookie is automatically set by backend
  signup: async (data: RegisterData): Promise<{ user: User; message: string }> => {
    const response = await httpClient.post<{ user: User; message: string }>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    )
    // NO localStorage manipulation!
    // The JWT token is stored in an httpOnly cookie by the backend
    return response
  },

  // Alias for signup
  register: async (data: RegisterData) => {
    return authApi.signup(data)
  },

  // Logout - cookie is cleared by backend
  logout: async () => {
    const response = await httpClient.post<{ message: string }>(
      API_ENDPOINTS.AUTH.LOGOUT
    )
    // NO localStorage manipulation!
    // The cookie is cleared by the backend
    return response
  },

  // Get current user profile
  // Cookie is automatically sent with the request
  getProfile: async (): Promise<User> => {
    const response = await httpClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME)
    return response.user
  },

  // Get current user (alias)
  getMe: async (): Promise<User> => {
    const response = await httpClient.get<{ user: User }>(API_ENDPOINTS.AUTH.ME)
    return response.user
  },
}

// City API
export const cityApi = {
  // Get all cities
  getCities: async (): Promise<City[]> => {
    return httpClient.get<City[]>(API_ENDPOINTS.CITIES.BASE)
  },

  // Get all regions
  getRegions: async (): Promise<string[]> => {
    return httpClient.get<string[]>(API_ENDPOINTS.CITIES.REGIONS)
  },

  // Get city by ID
  getCityById: async (id: number): Promise<City> => {
    return httpClient.get<City>(API_ENDPOINTS.CITIES.BY_ID(id))
  },
}

// Driver API (requires authentication)
export const driverApi = {
  // Get driver profile
  getProfile: async (): Promise<User> => {
    return httpClient.get<User>(API_ENDPOINTS.DRIVERS.PROFILE)
  },
}

// Admin API (requires admin authentication)
export const adminApi = {
  // Get admin dashboard data
  getDashboard: async (): Promise<any> => {
    return httpClient.get<any>(API_ENDPOINTS.ADMIN.DASHBOARD)
  },
}
