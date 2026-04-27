'use client'

import { useState, useRef, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Send,
  Bot,
  MessageSquare,
  Plus,
  Trash2,
  ChevronLeft,
  Loader2,
  Minus,
  Maximize2,
} from 'lucide-react'
import { useChat, LocalMessage } from '@/hooks/useChat'
import { AiChatSession } from '@/types'
import { ItineraryPreviewCard } from './ItineraryPreviewCard'
import { TravelBotIcon } from '@/components/icons/TravelBotIcon'

interface ChatWidgetProps {
  isOpen: boolean
  onClose: () => void
}

export function ChatWidget({ isOpen, onClose }: ChatWidgetProps) {
  const {
    messages,
    sessions,
    activeSessionId,
    isTyping,
    isCreating,
    isSending,
    sessionsLoading,
    isEnriching,
    startSession,
    sendMessage,
    switchSession,
    deleteSession,
    closeSession,
    enrichItinerary,
  } = useChat()

  const [input, setInput] = useState('')
  const [showSidebar, setShowSidebar] = useState(false)
  // Tracks whether to show session list instead of auto-creating
  const [showSessionList, setShowSessionList] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when session becomes active
  useEffect(() => {
    if (activeSessionId && inputRef.current) {
      setShowSessionList(false) // hide session list when a session is active
      inputRef.current.focus()
    }
  }, [activeSessionId])

  // Auto-start session ONLY on first open (when no sessions exist yet)
  useEffect(() => {
    if (isOpen && !activeSessionId && !isCreating && !showSessionList && !sessionsLoading) {
      // If user has existing sessions, show the list; otherwise auto-create
      if (sessions.length > 0) {
        setShowSessionList(true)
      } else {
        startSession()
      }
    }
  }, [isOpen]) // intentionally only depend on isOpen to trigger once on open

  // Reset state when chat closes
  useEffect(() => {
    if (!isOpen) {
      setShowSessionList(false)
      setShowSidebar(false)
    }
  }, [isOpen])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isSending) return
    sendMessage(input)
    setInput('')
  }

  const handleNewChat = () => {
    setShowSessionList(false)
    setShowSidebar(false)
    startSession()
  }

  const handleBackToList = () => {
    closeSession()
    setShowSidebar(false)
    setShowSessionList(true)
  }

  const handleDeleteSession = (sessionId: number) => {
    deleteSession(sessionId)
    // If we just deleted the active session, go to session list
    if (sessionId === activeSessionId) {
      setShowSessionList(true)
    }
  }

  /** Clean markdown artifacts from bot messages */
  const cleanMessage = (text: string): string => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1')   // bold
      .replace(/\*(.*?)\*/g, '$1')       // italic
      .replace(/```[\s\S]*?```/g, '')    // code blocks
      .replace(/`(.*?)`/g, '$1')         // inline code
      .replace(/^#+\s/gm, '')            // headings
      .replace(/^[-*]\s/gm, '• ')        // bullet lists
      .trim()
  }

  /** Render a single message bubble */
  const renderMessage = (msg: LocalMessage) => {
    const isUser = msg.role === 'user'

    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`max-w-[85%] flex flex-col gap-2`}>
          {/* Text bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 ${
              isUser
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
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {isUser ? msg.content : cleanMessage(msg.content)}
              </p>
            )}
          </div>

          {/* Inline preview card — rendered below the bot message */}
          {!isUser && msg.previewData && (
            <ItineraryPreviewCard
              previewData={msg.previewData}
              itineraryId={msg.itineraryId}
              pendingPreviewExpansion={msg.pendingPreviewExpansion}
              onEnrich={enrichItinerary}
              isEnriching={isEnriching}
            />
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      {isOpen && isMinimized && (
        /* Minimized floating bar */
        <motion.div
          key="minimized-bar"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40 }}
          className="fixed bottom-6 right-6 z-[9999]"
        >
          <button
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-800 via-cyan-900 to-teal-900 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 group"
          >
            <TravelBotIcon className="w-6 h-6 text-cyan-300" />
            <span className="text-sm font-semibold">AI Travel Assistant</span>
            <Maximize2 className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
          </button>
        </motion.div>
      )}

      {isOpen && !isMinimized && (
        <>
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
                    onClick={handleBackToList}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}
                <TravelBotIcon className="w-6 h-6 text-cyan-300" />
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
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Minimize"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Close"
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
                    <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-gray-700">Chat History</h3>
                      <button
                        onClick={handleNewChat}
                        className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                        title="New Chat"
                      >
                        <Plus className="w-4 h-4 text-gray-500" />
                      </button>
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
                              <Bot className="w-3.5 h-3.5 flex-shrink-0 text-cyan-600" />
                              <span className="truncate">
                                {s.title || 'New Chat'}
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id) }}
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
                {showSessionList && !activeSessionId ? (
                  /* Session List View (shown after back/delete) */
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-gray-700">Your Conversations</h3>
                      <button
                        onClick={handleNewChat}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full hover:shadow-md transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Chat
                      </button>
                    </div>
                    {sessionsLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                      </div>
                    ) : sessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                        <Bot className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm">No conversations yet</p>
                        <button
                          onClick={handleNewChat}
                          className="mt-3 text-xs text-cyan-600 hover:text-cyan-700 underline"
                        >
                          Start a new chat
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {sessions.map((s: AiChatSession) => (
                          <div
                            key={s.id}
                            className="group flex items-center justify-between p-3 rounded-lg cursor-pointer text-sm hover:bg-gray-50 text-gray-700 transition-colors border border-transparent hover:border-gray-200"
                            onClick={() => { switchSession(s.id); setShowSessionList(false) }}
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Bot className="w-4 h-4 flex-shrink-0 text-cyan-600" />
                              <span className="truncate">{s.title || 'New Chat'}</span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSession(s.id) }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Active Chat View */
                  <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {isCreating && messages.length === 0 && (
                        <div className="flex justify-center py-12">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-sm">Starting conversation...</span>
                          </div>
                        </div>
                      )}

                      {messages.map(renderMessage)}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input Bar */}
                    {activeSessionId && (
                      <div className="border-t border-gray-200 p-3">
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSidebar(!showSidebar)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="History"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                          <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about travel..."
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
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
