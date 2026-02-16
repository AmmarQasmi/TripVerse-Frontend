'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { chatApi, CreateSessionPayload, SendMessagePayload } from '@/lib/api/chat.api'
import { itinerariesApi } from '@/lib/api/itineraries.api'
import {
  AiChatSession,
  ChatResponse,
} from '@/types'

export interface LocalMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  createdAt: string
  isLoading?: boolean
  /** If this message generated a preview, store the data inline */
  previewData?: any
  /** If this message generated an itinerary, store its id */
  itineraryId?: number
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
  // Recovers previewData + itineraryId from generatedItinerary so previews survive re-fetches
  useEffect(() => {
    if (activeSession?.messages) {
      // Build a map of existing local messages to preserve their preview data
      const localPreviewMap = new Map<string, { previewData?: any; itineraryId?: number }>()
      messages.forEach((m) => {
        if (m.previewData || m.itineraryId) {
          localPreviewMap.set(m.content?.slice(0, 100), { previewData: m.previewData, itineraryId: m.itineraryId })
        }
      })

      const serverMessages: LocalMessage[] = activeSession.messages.map((m) => {
        const meta = (m.metadata || {}) as Record<string, any>
        const localMatch = localPreviewMap.get(m.content?.slice(0, 100))

        // Recover preview data: first from local state, then from session's generatedItinerary
        let previewData = localMatch?.previewData
        let itineraryId = localMatch?.itineraryId || meta.itineraryId

        if (!previewData && meta.hasPreview && activeSession.generatedItinerary) {
          previewData = activeSession.generatedItinerary.previewData
          itineraryId = itineraryId || activeSession.generatedItinerary.id
        }

        return {
          id: `server-${m.id}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          createdAt: m.createdAt,
          ...(previewData ? { previewData } : {}),
          ...(itineraryId ? { itineraryId } : {}),
        }
      })
      setMessages(serverMessages)
    }
  }, [activeSession])

  // Create session mutation — bot auto-detects intent from first message
  const createSessionMutation = useMutation({
    mutationFn: (payload: CreateSessionPayload) => chatApi.createSession(payload),
    onSuccess: (data) => {
      setActiveSessionId(data.session.id)
      const welcomeMsg: LocalMessage = {
        id: `local-${++messageIdCounter.current}`,
        role: 'assistant',
        content: data.greeting,
        createdAt: new Date().toISOString(),
      }
      setMessages([welcomeMsg])
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
    onError: () => {
      setMessages([{
        id: `local-${++messageIdCounter.current}`,
        role: 'assistant',
        content: 'Unable to start a chat session. Please check your connection and try again.',
        createdAt: new Date().toISOString(),
      }])
    },
  })

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => chatApi.sendMessage(payload),
    onSuccess: (data: ChatResponse) => {
      setIsTyping(false)
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading)
        return [
          ...withoutLoading,
          {
            id: `local-${++messageIdCounter.current}`,
            role: 'assistant' as const,
            content: data.message,
            createdAt: new Date().toISOString(),
            previewData: data.previewData || undefined,
            itineraryId: data.itineraryId || undefined,
          },
        ]
      })
      if (activeSessionId) {
        queryClient.invalidateQueries({ queryKey: ['chat-session', activeSessionId] })
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
    },
    onError: (error: any) => {
      setIsTyping(false)
      const status = error?.response?.status
      const serverMsg = error?.response?.data?.message
      let errorText = 'Sorry, something went wrong. Please try again.'
      if (status === 429) {
        errorText = serverMsg || 'You\'re sending messages too quickly. Please wait a moment.'
      } else if (status === 401) {
        errorText = 'Your session has expired. Please refresh the page and log in again.'
      }
      setMessages((prev) => {
        const withoutLoading = prev.filter((m) => !m.isLoading)
        return [
          ...withoutLoading,
          {
            id: `local-${++messageIdCounter.current}`,
            role: 'assistant' as const,
            content: errorText,
            createdAt: new Date().toISOString(),
          },
        ]
      })
    },
  })

  // Delete session mutation — optimistic: always clear UI even if backend fails
  const deleteSessionMutation = useMutation({
    mutationFn: (id: number) => chatApi.deleteSession(id),
    onSettled: (_data, _error, deletedId) => {
      // Whether success or error, remove it from UI and refetch the list
      if (activeSessionId === deletedId) {
        setActiveSessionId(null)
        setMessages([])
      }
      queryClient.invalidateQueries({ queryKey: ['chat-sessions'] })
      if (deletedId) {
        queryClient.removeQueries({ queryKey: ['chat-session', deletedId] })
      }
    },
  })

  // Enrich itinerary mutation
  const enrichMutation = useMutation({
    mutationFn: (itineraryId: number) => itinerariesApi.enrich(itineraryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['itineraries'] })
    },
  })

  /** Start a new chat session (always ITINERARY_GENERATOR — bot handles both) */
  const startSession = useCallback(
    (title?: string) => {
      setMessages([])
      setActiveSessionId(null)
      createSessionMutation.mutate({ agentType: 'ITINERARY_GENERATOR', title })
    },
    [createSessionMutation]
  )

  /** Send a message in the current session */
  const sendMessage = useCallback(
    (text: string) => {
      if (!activeSessionId || !text.trim()) return

      const userMsg: LocalMessage = {
        id: `local-${++messageIdCounter.current}`,
        role: 'user',
        content: text.trim(),
        createdAt: new Date().toISOString(),
      }

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

  /** Trigger enrichment for an itinerary */
  const enrichItinerary = useCallback(
    (itineraryId: number) => {
      return enrichMutation.mutateAsync(itineraryId)
    },
    [enrichMutation]
  )

  return {
    messages,
    sessions,
    activeSessionId,
    activeSession,
    isTyping,
    isCreating: createSessionMutation.isPending,
    isSending: sendMessageMutation.isPending,
    sessionsLoading,
    sessionLoading,
    isEnriching: enrichMutation.isPending,

    startSession,
    sendMessage,
    switchSession,
    deleteSession,
    closeSession,
    enrichItinerary,
    refetchSessions,
  }
}
