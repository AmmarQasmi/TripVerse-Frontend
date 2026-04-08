'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { notificationsApi, Notification } from '@/lib/api/notifications.api'
import { useAuth } from '@/features/auth/useAuth'
import { Bell, Check } from 'lucide-react'
import { getSocket, disconnectSocket } from '@/lib/socket'

export function NotificationBell() {
  const { user } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true)
        const [notificationsData, unreadCountData] = await Promise.all([
          notificationsApi.getMyNotifications().catch(() => []),
          notificationsApi.getUnreadCount().catch(() => 0),
        ])
        setNotifications(notificationsData)
        setUnreadCount(unreadCountData)
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        // Fallback to counting unread from notifications if unread count endpoint fails
        try {
          const notificationsData = await notificationsApi.getMyNotifications()
          setNotifications(notificationsData)
          setUnreadCount(notificationsData.filter(n => !n.read_at).length)
        } catch (err) {
          console.error('Failed to fetch notifications fallback:', err)
        }
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  // Socket.io real-time notifications
  useEffect(() => {
    if (!user?.id) return

    // Get JWT token from cookies (httpOnly cookie, so we'll get it from the API)
    // For now, we'll connect without token and let the backend handle auth via cookies
    const socket = getSocket()

    // Listen for new notifications
    socket.on('notification', (newNotification: Notification) => {
      setNotifications(prev => [newNotification, ...prev])
      if (!newNotification.read_at) {
        setUnreadCount(prev => prev + 1)
      }
    })

    // Listen for unread count updates
    socket.on('unread_count', (data: { count: number }) => {
      setUnreadCount(data.count)
    })

    return () => {
      socket.off('notification')
      socket.off('unread_count')
    }
  }, [user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: number) => {
    e.stopPropagation()
    try {
      await notificationsApi.markAsRead(notificationId)
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read_at: new Date().toISOString() } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() }))
      )
      setUnreadCount(0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const getNotificationRedirectPath = (notification: Notification): string | null => {
    const payload = notification.payload || {}
    const role = user?.role

    switch (notification.type) {
      // CLIENT notifications
      case 'booking_accepted':
      case 'booking_rejected':
      case 'trip_started':
      case 'trip_completed':
        if (payload.booking_id) {
          return `/client/cars/bookings`
        }
        return '/client/cars/bookings'
      
      case 'booking_confirmed':
        if (payload.booking_type === 'hotel' && payload.booking_id) {
          return `/client/bookings/hotel/${payload.booking_id}`
        }
        if (payload.booking_type === 'car' && payload.booking_id) {
          return `/client/cars/bookings`
        }
        return '/client/bookings'
      
      case 'dispute_raised':
      case 'dispute_resolved':
        if (payload.booking_type === 'hotel' && payload.booking_id) {
          return `/client/bookings/hotel/${payload.booking_id}`
        }
        if (payload.booking_type === 'car' && payload.booking_id) {
          return `/client/cars/bookings`
        }
        return '/client/bookings'

      case 'chat_message':
        // Check role to determine redirect path
        if (role === 'driver') {
          if (payload.booking_id) {
            return `/driver/bookings?openChat=${payload.booking_id}`
          }
          return '/driver/bookings'
        } else {
          // Client or other roles
          if (payload.booking_type === 'car' && payload.booking_id) {
            return `/client/cars/bookings?openChat=${payload.booking_id}`
          }
          return '/client/cars/bookings'
        }

      // DRIVER notifications
      case 'booking_request':
        if (payload.booking_id) {
          return '/driver/bookings'
        }
        return '/driver/bookings'
      
      case 'driver_verification':
        return '/driver/verification'
      
      case 'dispute_raised':
      case 'dispute_resolved':
      case 'dispute_warning':
        if (payload.booking_id) {
          return '/driver/bookings'
        }
        return '/driver/bookings'

      case 'suspension_scheduled':
      case 'suspension_started':
      case 'suspension_paused':
      case 'suspension_resumed':
      case 'ban_scheduled':
      case 'ban_applied':
        return '/driver/verification'

      // HOTEL MANAGER notifications
      case 'hotel_manager_verification_approved':
      case 'hotel_manager_verification_rejected':
        return '/hotel-manager/verification'
      
      case 'hotel_booking_created':
      case 'hotel_booking_confirmed':
        if (payload.booking_id) {
          return '/hotel-manager/bookings'
        }
        return '/hotel-manager/bookings'

      // ADMIN notifications
      case 'driver_verification':
        if (role === 'admin') {
          return '/admin/drivers'
        }
        return null
      
      case 'hotel_manager_verification_approved':
        if (role === 'admin' && payload.manager_id) {
          return `/admin/hotel-managers/${payload.manager_id}`
        }
        return '/admin/hotel-managers'
      
      case 'hotel_listing_created':
        if (payload.manager_id) {
          return `/admin/hotel-managers/${payload.manager_id}`
        }
        return '/admin/hotel-managers'
      
      case 'dispute_raised':
        if (payload.dispute_id) {
          return '/admin/disputes'
        }
        return '/admin/disputes'
      
      case 'payment_received':
      case 'hotel_booking_payment_received':
        return '/admin/payments'

      default:
        return null
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    const path = getNotificationRedirectPath(notification)
    if (path) {
      // Mark notification as read when clicked and redirected
      if (!notification.read_at) {
        try {
          await notificationsApi.markAsRead(notification.id)
          setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n))
          setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
          console.error('Failed to mark notification as read:', error)
        }
      }
      router.push(path)
      setIsOpen(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'dispute_warning':
      case 'suspension_scheduled':
      case 'suspension_started':
        return '⚠️'
      case 'ban_scheduled':
      case 'ban_applied':
        return '🚫'
      case 'driver_verification':
      case 'hotel_manager_verification_approved':
        return '✅'
      case 'hotel_manager_verification_rejected':
        return '❌'
      case 'booking_request':
        return '📋'
      case 'booking_accepted':
      case 'booking_confirmed':
        return '✅'
      case 'booking_rejected':
        return '❌'
      case 'trip_started':
        return '🚗'
      case 'trip_completed':
        return '🏁'
      case 'payment_received':
      case 'hotel_booking_payment_received':
        return '💰'
      case 'dispute_raised':
        return '⚖️'
      case 'dispute_resolved':
        return '✅'
      case 'hotel_listing_created':
        return '🏨'
      case 'hotel_booking_created':
      case 'hotel_booking_confirmed':
        return '📅'
      case 'chat_message':
        return '💬'
      default:
        return '📢'
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-white" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-green-600">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-gray-500">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p>Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => {
                    const redirectPath = getNotificationRedirectPath(notification)
                    const isClickable = redirectPath !== null

                    return (
                      <div
                        key={notification.id}
                        className={`p-4 transition-colors ${
                          !notification.read_at ? 'bg-blue-50/50' : 'bg-white'
                        } ${
                          isClickable ? 'cursor-pointer hover:bg-gray-50' : ''
                        }`}
                        onClick={() => isClickable && handleNotificationClick(notification)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl flex-shrink-0">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-medium flex-1 ${!notification.read_at ? 'text-green-600' : 'text-green-600'}`}>
                                {notification.title}
                              </p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {!notification.read_at && (
                                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                )}
                                {!notification.read_at && (
                                  <button
                                    onClick={(e) => handleMarkAsRead(e, notification.id)}
                                    className="p-1 rounded hover:bg-gray-200 transition-colors"
                                    title="Mark as read"
                                    aria-label="Mark as read"
                                  >
                                    <Check className="w-4 h-4 text-gray-600" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-green-600 mt-1">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatDate(notification.sent_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
