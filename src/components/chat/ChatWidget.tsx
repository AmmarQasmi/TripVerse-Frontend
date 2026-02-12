'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Sparkles,
  Bot,
  MapPin,
  Compass,
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
} from 'lucide-react'
import { useChat } from '@/hooks/useChat'
import { AiAgentType, AiChatSession } from '@/types'
import { ItineraryDisplay } from './ItineraryDisplay'
import { AdvisoryDisplay } from './AdvisoryDisplay'

interface ChatWidgetProps {
  isOpen: boolean
  onClose: () => void
  initialAgent?: AiAgentType
}

export function ChatWidget({ isOpen, onClose, initialAgent }: ChatWidgetProps) {
  const {
    messages,
    sessions,
    activeSessionId,
    isTyping,
    isCreating,
    isSending,
    sessionsLoading,
    lastResponse,
    createResponse,
    startSession,
    sendMessage,
    switchSession,
    deleteSession,
    closeSession,
  } = useChat()

  const [input, setInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when session becomes active
  useEffect(() => {
    if (activeSessionId && inputRef.current) {
      inputRef.current.focus()
    }
  }, [activeSessionId])

  // Auto-start session if initialAgent is provided
  useEffect(() => {
    if (isOpen && initialAgent && !activeSessionId && !isCreating) {
      startSession(initialAgent)
    }
  }, [isOpen, initialAgent, activeSessionId, isCreating, startSession])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return
    sendMessage(input)
    setInput('')
  }

  const handleNewChat = (agentType: AiAgentType) => {
    startSession(agentType)
    setShowSidebar(false)
  }

  // Get the latest generated data from responses
  const generatedData = lastResponse?.generatedData || createResponse?.generatedData
  const currentAgentType = lastResponse?.agentType || createResponse?.agentType

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-[9999] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 text-white">
              <div className="flex items-center gap-3">
                {activeSessionId && (
                  <button
                    onClick={() => { closeSession(); setShowSidebar(false) }}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <Sparkles className="w-5 h-5 text-cyan-300" />
                <h2 className="text-lg font-semibold">AI Travel Assistant</h2>
              </div>
              <div className="flex items-center gap-2">
                {activeSessionId && (
                  <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Chat History"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 flex overflow-hidden relative">
              {/* Sidebar — Session History */}
              <AnimatePresence>
                {showSidebar && (
                  <motion.div
                    initial={{ x: -300, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -300, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="absolute left-0 top-0 bottom-0 w-64 bg-gray-50 border-r border-gray-200 z-10 flex flex-col"
                  >
                    <div className="p-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700">Chat History</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {sessionsLoading ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                        </div>
                      ) : sessions.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-4">No conversations yet</p>
                      ) : (
                        sessions.map((s: AiChatSession) => (
                          <div
                            key={s.id}
                            className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer text-sm transition-colors ${
                              s.id === activeSessionId
                                ? 'bg-cyan-50 text-cyan-900'
                                : 'hover:bg-gray-100 text-gray-700'
                            }`}
                            onClick={() => { switchSession(s.id); setShowSidebar(false) }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              {s.agentType === 'ITINERARY_GENERATOR' ? (
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-cyan-600" />
                              ) : (
                                <Compass className="w-3.5 h-3.5 flex-shrink-0 text-teal-600" />
                              )}
                              <span className="truncate">
                                {s.title || (s.agentType === 'ITINERARY_GENERATOR' ? 'Itinerary' : 'Advisory')}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deleteSession(s.id) }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                {!activeSessionId && !isCreating ? (
                  /* Agent Selection */
                  <div className="flex-1 flex items-center justify-center p-6">
                    <div className="w-full max-w-sm space-y-6">
                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                        >
                          <Bot className="w-16 h-16 mx-auto text-cyan-600 mb-4" />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900">How can I help?</h3>
                        <p className="text-sm text-gray-500 mt-1">Choose an AI assistant to get started</p>
                      </div>

                      <div className="space-y-3">
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          onClick={() => handleNewChat('ITINERARY_GENERATOR')}
                          className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-cyan-400 hover:bg-cyan-50/50 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-cyan-700 transition-colors">
                                Itinerary Generator
                              </h4>
                              <p className="text-xs text-gray-500">Plan a 4-day trip with activities, food & pacing</p>
                            </div>
                          </div>
                        </motion.button>

                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                          onClick={() => handleNewChat('PERSONAL_ASSISTANT')}
                          className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-teal-400 hover:bg-teal-50/50 transition-all group text-left"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
                              <Compass className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 group-hover:text-teal-700 transition-colors">
                                Travel Advisor
                              </h4>
                              <p className="text-xs text-gray-500">Get personalized travel, education or work advice</p>
                            </div>
                          </div>
                        </motion.button>
                      </div>

                      {/* Quick access to history */}
                      {sessions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="pt-4 border-t border-gray-200"
                        >
                          <p className="text-xs text-gray-400 mb-2">Recent conversations</p>
                          <div className="space-y-1">
                            {sessions.slice(0, 3).map((s: AiChatSession) => (
                              <button
                                key={s.id}
                                onClick={() => switchSession(s.id)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 text-sm text-gray-600 transition-colors text-left"
                              >
                                {s.agentType === 'ITINERARY_GENERATOR' ? (
                                  <MapPin className="w-3.5 h-3.5 text-cyan-500" />
                                ) : (
                                  <Compass className="w-3.5 h-3.5 text-teal-500" />
                                )}
                                <span className="truncate">
                                  {s.title || (s.agentType === 'ITINERARY_GENERATOR' ? 'Itinerary Chat' : 'Advisory Chat')}
                                </span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Chat Messages */
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {isCreating && messages.length === 0 && (
                      <div className="flex justify-center py-12">
                        <div className="flex items-center gap-2 text-gray-400">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span className="text-sm">Starting conversation...</span>
                        </div>
                      </div>
                    )}

                    {messages.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                            msg.role === 'user'
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-br-md'
                              : 'bg-gray-100 text-gray-800 rounded-bl-md'
                          }`}
                        >
                          {msg.isLoading ? (
                            <div className="flex items-center gap-1 py-1">
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}

                    {/* Generated content display */}
                    {generatedData && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        {currentAgentType === 'ITINERARY_GENERATOR' && 'days' in generatedData ? (
                          <ItineraryDisplay data={generatedData} />
                        ) : 'sections' in generatedData ? (
                          <AdvisoryDisplay data={generatedData} />
                        ) : null}
                      </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>
                )}

                {/* Input Bar — only show when a session is active */}
                {activeSessionId && (
                  <div className="border-t border-gray-200 p-3">
                    <form onSubmit={handleSubmit} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowSidebar(!showSidebar)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="New Chat"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message..."
                        disabled={isSending || isTyping}
                        className="flex-1 px-4 py-2.5 bg-gray-100 rounded-full text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:bg-white transition-all disabled:opacity-50"
                      />
                      <button
                        type="submit"
                        disabled={!input.trim() || isSending || isTyping}
                        className="p-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-full hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
