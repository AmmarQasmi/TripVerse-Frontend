'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useChatMessages } from '@/features/cars/useCarSearch'
import { carsApi } from '@/lib/api/cars.api'
import { useAuth } from '@/features/auth/useAuth'

interface ChatInterfaceProps {
  bookingId: number
  driverName: string
  customerName: string
}

export function ChatInterface({ bookingId, driverName, customerName }: ChatInterfaceProps) {
  const { user } = useAuth()
  const { data: chatData, isLoading, refetch } = useChatMessages(bookingId)
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chatData?.messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || isSending) return

    setIsSending(true)
    try {
      await carsApi.sendMessage(bookingId, newMessage.trim())
      setNewMessage('')
      refetch() // Refresh messages
    } catch (error) {
      console.error('Failed to send message:', error)
      alert('Failed to send message. Please try again.')
    } finally {
      setIsSending(false)
    }
  }

  const isCurrentUser = (senderId: string) => {
    return user?.id.toString() === senderId
  }

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Chat</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-96 overflow-y-auto space-y-4 mb-6 pr-2">
        {chatData?.messages && chatData.messages.length > 0 ? (
          chatData.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isCurrentUser(message.sender.id) ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isCurrentUser(message.sender.id)
                    ? 'bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <p className="text-sm">{message.message}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.sent_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-8">
            <div className="text-4xl mb-2">💬</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex space-x-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={`Message ${isCurrentUser('1') ? customerName : driverName}...`}
          className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          disabled={isSending}
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || isSending}
          className="bg-gradient-to-r from-[#1e3a8a] to-[#0d9488] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Chat Info */}
      <div className="mt-4 pt-4 border-t border-gray-600">
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>
            Chatting with {isCurrentUser('1') ? customerName : driverName}
          </span>
          <span>
            Booking #{bookingId}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
