import { httpClient } from './http'
import { API_ENDPOINTS } from './endpoints'
import {
  AiAgentType,
  AiChatSession,
  ChatResponse,
} from '@/types'

export interface CreateSessionPayload {
  agentType: AiAgentType
  title?: string
}

export interface SendMessagePayload {
  sessionId: number
  message: string
}

/** Backend wraps all responses in { success, data } */
interface ApiWrapper<T> {
  success: boolean
  data: T
}

/** Shape returned by POST /chat/sessions */
export interface CreateSessionResponse {
  session: {
    id: number
    agentType: AiAgentType
    status: string
    title: string
    createdAt: string
  }
  greeting: ChatResponse
}

export const chatApi = {
  /** Create a new AI chat session */
  createSession: async (payload: CreateSessionPayload): Promise<CreateSessionResponse> => {
    const res = await httpClient.post<ApiWrapper<CreateSessionResponse>>(API_ENDPOINTS.CHAT.SESSIONS, payload)
    return res.data
  },

  /** Send a message in an existing session */
  sendMessage: async (payload: SendMessagePayload): Promise<ChatResponse> => {
    const res = await httpClient.post<ApiWrapper<ChatResponse>>(API_ENDPOINTS.CHAT.MESSAGE, payload)
    return res.data
  },

  /** Get all sessions for the current user */
  getSessions: async (): Promise<AiChatSession[]> => {
    const res = await httpClient.get<ApiWrapper<AiChatSession[]>>(API_ENDPOINTS.CHAT.SESSIONS)
    return res.data
  },

  /** Get a single session with its messages */
  getSession: async (id: number): Promise<AiChatSession> => {
    const res = await httpClient.get<ApiWrapper<AiChatSession>>(API_ENDPOINTS.CHAT.SESSION_BY_ID(id))
    return res.data
  },

  /** Delete a session */
  deleteSession: async (id: number): Promise<void> => {
    await httpClient.delete<ApiWrapper<unknown>>(API_ENDPOINTS.CHAT.DELETE_SESSION(id))
  },
}
