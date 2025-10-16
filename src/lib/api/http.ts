import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

class HttpClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // CRITICAL: Enables sending cookies with requests
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Response interceptor to handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // 401 Unauthorized - but DON'T auto-redirect!
          // Let individual pages decide what to do
          // This allows public browsing while protecting specific actions
          
          if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname
            
            // Log for debugging
            if (currentPath.includes('/auth/')) {
              // On auth pages, 401 is expected if checking session
              // Don't log anything
            } else {
              console.log('⚠️ 401 Unauthorized - login required for this action')
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.get(url, config)
    return response.data
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.post(url, data, config)
    return response.data
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.put(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.delete(url, config)
    return response.data
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.instance.patch(url, data, config)
    return response.data
  }
}

export const httpClient = new HttpClient()
