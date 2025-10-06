import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import { User } from '@/types'

export const usersApi = {
  getAll: async () => {
    return httpClient.get<User[]>(API_ENDPOINTS.USERS.BASE)
  },

  getById: async (id: string) => {
    return httpClient.get<User>(API_ENDPOINTS.USERS.BY_ID(id))
  },

  update: async (id: string, user: Partial<User>) => {
    return httpClient.put<User>(API_ENDPOINTS.USERS.UPDATE(id), user)
  },

  delete: async (id: string) => {
    return httpClient.delete(API_ENDPOINTS.USERS.DELETE(id))
  },
}
