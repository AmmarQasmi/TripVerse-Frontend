import { io, Socket } from 'socket.io-client'

let notificationSocket: Socket | null = null
let chatSocket: Socket | null = null

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const getSocket = (token?: string, namespace: 'notifications' | 'chat' = 'notifications'): Socket => {
  if (namespace === 'notifications') {
    if (notificationSocket?.connected) {
      return notificationSocket
    }

    notificationSocket = io(`${baseUrl}/notifications`, {
      withCredentials: true,
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    })

    notificationSocket.on('connect', () => {
      console.log('Notification socket connected:', notificationSocket?.id)
    })

    notificationSocket.on('disconnect', () => {
      console.log('Notification socket disconnected')
    })

    notificationSocket.on('connect_error', (error) => {
      console.error('Notification socket connection error:', error)
    })

    return notificationSocket
  } else {
    if (chatSocket?.connected) {
      return chatSocket
    }

    chatSocket = io(`${baseUrl}/chat`, {
      withCredentials: true,
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
    })

    chatSocket.on('connect', () => {
      console.log('Chat socket connected:', chatSocket?.id)
    })

    chatSocket.on('disconnect', () => {
      console.log('Chat socket disconnected')
    })

    chatSocket.on('connect_error', (error) => {
      console.error('Chat socket connection error:', error)
    })

    return chatSocket
  }
}

export const disconnectSocket = (namespace?: 'notifications' | 'chat') => {
  if (!namespace || namespace === 'notifications') {
    if (notificationSocket) {
      notificationSocket.disconnect()
      notificationSocket = null
    }
  }
  if (!namespace || namespace === 'chat') {
    if (chatSocket) {
      chatSocket.disconnect()
      chatSocket = null
    }
  }
}

