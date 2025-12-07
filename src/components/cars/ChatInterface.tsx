'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatMessages } from '@/features/cars/useCarSearch'
import { carsApi } from '@/lib/api/cars.api'
import { useAuth } from '@/features/auth/useAuth'
import { getSocket } from '@/lib/socket'
import type { Socket } from 'socket.io-client'

interface ChatInterfaceProps {
  bookingId: number
  driverName: string
  customerName: string
  onClose?: () => void
}

type ChatSize = 'minimized' | 'compact' | 'normal' | 'expanded'

export function ChatInterface({ bookingId, driverName, customerName, onClose }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { data: chatData, isLoading, refetch } = useChatMessages(bookingId)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [chatSize, setChatSize] = useState<ChatSize>('normal')
  const [messages, setMessages] = useState(chatData?.messages || [])
  const [hasInitialized, setHasInitialized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const socketRef = useRef<Socket | null>(null)

  const scrollToBottom = () => {
    // Scroll only the messages container, not the entire page
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // Set initial messages from API on mount or when chatData loads
  useEffect(() => {
    if (chatData?.messages && !hasInitialized) {
      setMessages(chatData.messages)
      setHasInitialized(true)
      
      // Mark messages as read when chat opens
      carsApi.markMessagesAsRead(bookingId).catch((error) => {
        console.error('Failed to mark messages as read:', error)
      })
    }
  }, [chatData?.messages, hasInitialized, bookingId])

  // Set up socket connection for real-time messages
  useEffect(() => {
    if (!user?.id) return

    // Socket uses httpOnly cookies for authentication, no token needed
    const socket = getSocket(undefined, 'chat')
    socketRef.current = socket

    // Connect to chat namespace
    if (!socket.connected) {
      socket.connect()
    }

    // Join booking room
    socket.emit('join_booking', bookingId)

    // Listen for new messages
    socket.on('new_message', (message: any) => {
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(msg => msg.id === message.id)
        if (exists) return prev
        return [...prev, message]
      })
      setTimeout(() => scrollToBottom(), 100)
    })

    // Handle socket errors
    socket.on('error', (error: any) => {
      console.error('Socket error:', error)
    })

    // Listen for join confirmation
    socket.on('joined_booking', () => {
      console.log(`Joined booking ${bookingId} chat room`)
    })

    // Cleanup on unmount
    return () => {
      socket.emit('leave_booking', bookingId)
      socket.off('new_message')
      socket.off('joined_booking')
      socket.off('error')
    }
  }, [bookingId, user?.id])

  // Scroll when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => scrollToBottom(), 50)
    }
  }, [messages.length])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    const messageText = newMessage.trim()
    setIsSending(true)
    
    // Optimistically add message to UI
    const tempMessage = {
      id: Date.now(), // Temporary ID
      sender: {
        id: user?.id.toString() || '',
        name: user?.full_name || 'You',
      },
      message: messageText,
      sent_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')
    scrollToBottom()

    try {
      const response = await carsApi.sendMessage(bookingId, messageText)
      // Replace temp message with real message from server
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== tempMessage.id)
        // Check if message already exists from socket
        const exists = filtered.some(msg => msg.id === response.id)
        if (exists) return filtered
        return [...filtered, response]
      })
      scrollToBottom()
    } catch (error) {
      console.error('Failed to send message:', error)
      // Remove failed message from UI
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      setNewMessage(messageText) // Restore message text
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const isCurrentUser = (senderId: string) => {
    return user?.id.toString() === senderId
  }

  const getChatHeight = () => {
    switch (chatSize) {
      case 'minimized':
        return 'h-16'
      case 'compact':
        return 'h-64'
      case 'normal':
        return 'h-96'
      case 'expanded':
        return 'h-[600px]'
      default:
        return 'h-96'
    }
  }

  const handleSizeChange = (size: ChatSize) => {
    setChatSize(size)
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
        <div className="animate-pulse space-y-4 p-6">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  // Minimized view
  if (chatSize === 'minimized') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
        onClick={() => handleSizeChange('normal')}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold">
              {driverName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">{driverName}</h3>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                <p className="text-xs text-white/80">Tap to open chat</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => handleSizeChange('normal')}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Restore"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden flex flex-col"
      style={{ height: chatSize === 'expanded' ? '600px' : chatSize === 'compact' ? '256px' : '384px' }}
    >
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900">
        <div className="flex items-center space-x-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-lg">
            {driverName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{driverName}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-white/90">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          {/* Minimize */}
          <button
            onClick={() => handleSizeChange('minimized')}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            title="Minimize"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          {/* Size Toggle: Cycles through Compact → Normal → Expanded */}
          <button
            onClick={() => {
              if (chatSize === 'compact') {
                handleSizeChange('normal')
              } else if (chatSize === 'normal') {
                handleSizeChange('expanded')
              } else {
                handleSizeChange('compact')
              }
            }}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            title={chatSize === 'compact' ? 'Normal Size' : chatSize === 'normal' ? 'Expand' : 'Compact Size'}
          >
            {chatSize === 'compact' ? (
              // Show expand icon when compact
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : chatSize === 'normal' ? (
              // Show expand icon when normal
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              // Show shrink icon when expanded
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            )}
          </button>
          {/* Close */}
          {onClose && (
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto bg-gray-50 p-4 space-y-3"
      >
        <AnimatePresence>
          {messages && messages.length > 0 ? (
            messages.map((message, index) => {
              const isUser = isCurrentUser(message.sender.id)
              const showAvatar = !isUser && (
                index === 0 || 
                messages[index - 1]?.sender.id !== message.sender.id
              )
              
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex items-end space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                >
                  {/* Avatar for received messages */}
                  {showAvatar && !isUser && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                      {driverName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {!showAvatar && !isUser && <div className="w-8 flex-shrink-0"></div>}
                  
                  {/* Message bubble */}
                  <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-[70%]`}>
                    {!isUser && showAvatar && (
                      <span className="text-xs text-gray-500 mb-1 px-2">{driverName}</span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                        isUser
                          ? 'bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm leading-relaxed break-words">{message.message}</p>
                      <p className={`text-xs mt-1.5 ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
                        {new Date(message.sent_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-3">💬</div>
              <p className="text-gray-500 font-medium">No messages yet</p>
              <p className="text-sm text-gray-400 mt-1">Start the conversation with {driverName}!</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 bg-white border-t border-gray-200">
          <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={`Type a message to ${driverName}...`}
                className="w-full bg-gray-50 text-gray-900 px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                disabled={isSending}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage(e)
                  }
                }}
              />
              <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  title="Add emoji"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 text-white p-3 rounded-2xl font-semibold hover:shadow-lg transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              title="Send message"
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </form>
          {/* Chat Info Footer */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Booking #{bookingId}</span>
              <span className="flex items-center space-x-1">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                <span>Active</span>
              </span>
            </div>
          </div>
        </div>
    </motion.div>
  )
}
