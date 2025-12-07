import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'

export interface Notification {
  id: number
  user_id: number
  type: string
  title: string
  message: string
  payload?: any
  read_at: string | null
  sent_at: string
  is_read?: boolean
}

export const notificationsApi = {
  getMyNotifications: async (unreadOnly?: boolean): Promise<Notification[]> => {
    return httpClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.BASE, {
      params: unreadOnly !== undefined ? { unreadOnly: unreadOnly.toString() } : undefined,
    })
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await httpClient.get<{ unread_count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD)
    return response.unread_count
  },

  markAsRead: async (notificationId: number) => {
    return httpClient.patch<{ message: string }>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId.toString())
    )
  },

  markAllAsRead: async () => {
    return httpClient.patch<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
  },

  deleteNotification: async (notificationId: number) => {
    return httpClient.delete<{ message: string }>(API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId.toString()))
  },
}

