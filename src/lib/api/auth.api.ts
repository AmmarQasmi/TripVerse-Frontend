import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { User, LoginCredentials, RegisterData, AuthResponse, City } from '@/types'

export const authApi = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.LOGIN,
      credentials
    )
    // Store token and user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    return response
  },

  // Signup/Register
  signup: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await httpClient.post<AuthResponse>(
      API_ENDPOINTS.AUTH.SIGNUP,
      data
    )
    // Store token and user data
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user', JSON.stringify(response.user))
    }
    return response
  },

  // Alias for signup
  register: async (data: RegisterData): Promise<AuthResponse> => {
    return authApi.signup(data)
  },

  // Logout
  logout: async () => {
    const response = await httpClient.post(API_ENDPOINTS.AUTH.LOGOUT)
    // Clear local storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
    }
    return response
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.ME)
  },

  // Get current user (alias)
  getMe: async (): Promise<User> => {
    return httpClient.get<User>(API_ENDPOINTS.AUTH.ME)
  },

  // Refresh token
  refreshToken: async (): Promise<{ token: string }> => {
    return httpClient.post<{ token: string }>(API_ENDPOINTS.AUTH.REFRESH)
  },

  // Get current user from localStorage
  getCurrentUser: (): User | null => {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem('user')
      return user ? JSON.parse(user) : null
    }
    return null
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      return !!localStorage.getItem('access_token')
    }
    return false
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
