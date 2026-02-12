'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi, CreateSessionPayload, CreateSessionResponse, SendMessagePayload } from '@/lib/api/chat.api'
import {
  AiAgentType,
  AiChatMessage,
  AiChatSession,
  ChatResponse,
} from '@/types'

interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  isLoading?: boolean
}

export function useChat() {
  const queryClient = useQueryClient()
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null)
  const [messages, setMessages] = useState<LocalMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const messageIdCounter = useRef(0)

  // Fetch all user sessions
  const {
    data: sessions = [],
    isLoading: sessionsLoading,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['chat-sessions'],
    queryFn: () => chatApi.getSessions(),
    staleTime: 30_000,
  })

  // Fetch a specific session with its messages
  const {
    data: activeSession,
    isLoading: sessionLoading,
  } = useQuery({
    queryKey: ['chat-session', activeSessionId],
    queryFn: () => chatApi.getSession(activeSessionId!),
    enabled: !!activeSessionId,
    staleTime: 10_000,
  })

  // Sync server messages into local state when session loads
  useEffect(() => {
    if (activeSession?.messages) {
      const serverMessages: LocalMessage[] = activeSession.messages.map((m: AiChatMessage) => ({
        id: `server-${m.id}`,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: m.createdAt,
      }))
      setMessages(serverMessages)
    }
  }, [activeSession])

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (payload: CreateSessionPayload) => chatApi.createSession(payload),
    onSuccess: (data: CreateSessionResponse) => {
      setActiveSessionId(data.session.id)
      // Show the welcome message from greeting
      const welcomeMsg: LocalMessage = {
        id: `local-${++messageIdCounter.current}`,
        role: 'assistant',
        content: data.greeting.message,
        createdAt: new Date().toISOString(),
      }
      setMessages([welcomeMsg])
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendMessage(payload),
    onSuccess: (data: ChatResponse) => {
      setIsTyping(false)
      // Remove the loading indicator and add real response
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading)
        return [
          ...withoutLoading,
          {
            id: `local-${++messageIdCounter.current}`,
            role: 'assistant' as const,
            content: data.message,
            createdAt: new Date().toISOString(),
          },
        ]
      })
      // Invalidate the session query to refresh server-side data
      if (activeSessionId) {
        queryClient.invalidateQueries({ queryKey: ['chat-session', activeSessionId] })
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
    onError: () => {
      setIsTyping(false)
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading)
        return [
          ...withoutLoading,
          {
            id: `local-${++messageIdCounter.current}`,
            role: 'assistant' as const,
            content: 'Sorry, something went wrong. Please try again.',
            createdAt: new Date().toISOString(),
          },
        ]
      })
    },
  })

  // Delete session mutation
  const deleteSessionMutation = useMutation({
    mutationFn: (id: number) => chatApi.deleteSession(id),
    onSuccess: () => {
      if (activeSessionId) {
        queryClient.invalidateQueries({ queryKey: ['chat-session', activeSessionId] })
      }
      setActiveSessionId(null)
      setMessages([])
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
  })

  /** Start a new chat session */
  const startSession = useCallback(
    (agentType: AiAgentType, title?: string) => {
      setMessages([])
      setActiveSessionId(null)
      createSessionMutation.mutate({ agentType, title })
    },
    [createSessionMutation]
  )

  /** Send a message in the current session */
  const sendMessage = useCallback(
    (text: string) => {
      if (!activeSessionId || !text.trim()) return

      // Add user message immediately
      const userMsg: LocalMessage = {
        id: `local-${++messageIdCounter.current}`,
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      }

      // Add a loading placeholder for the assistant
      const loadingMsg: LocalMessage = {
        id: `loading-${++messageIdCounter.current}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isLoading: true,
      }

      setMessages((prev) => [...prev, userMsg, loadingMsg])
      setIsTyping(true)

      sendMessageMutation.mutate({
        sessionId: activeSessionId,
        message: text.trim(),
      })
    },
    [activeSessionId, sendMessageMutation]
  )

  /** Load and switch to an existing session */
  const switchSession = useCallback((sessionId: number) => {
    setActiveSessionId(sessionId)
  }, [])

  /** Delete a session */
  const deleteSession = useCallback(
    (sessionId: number) => {
      deleteSessionMutation.mutate(sessionId)
    },
    [deleteSessionMutation]
  )

  /** Close the current session (just deselects) */
  const closeSession = useCallback(() => {
    setActiveSessionId(null)
    setMessages([])
  }, [])

  return {
    // State
    messages,
    sessions,
    activeSessionId,
    activeSession,
    isTyping,
    isCreating: createSessionMutation.isPending,
    isSending: sendMessageMutation.isPending,
    sessionsLoading,
    sessionLoading,

    // Last response data (for generated content)
    lastResponse: sendMessageMutation.data as ChatResponse | undefined,
    createResponse: createSessionMutation.data as ChatResponse | undefined,

    // Actions
    startSession,
    sendMessage,
    switchSession,
    deleteSession,
    closeSession,
    refetchSessions,
  }
}
